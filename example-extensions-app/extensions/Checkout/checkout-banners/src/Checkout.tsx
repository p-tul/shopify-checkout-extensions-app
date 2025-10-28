import { useState, useEffect, useMemo } from "react"
import { reactExtension, TextBlock, useApi, useCartLineTarget } from "@shopify/ui-extensions-react/checkout"
import { Product } from "split-shipping-discount/generated/api"

export default reactExtension("purchase.checkout.cart-line-item.render-after", () => <Extension />)

function Extension() {
  const [product, setProduct] = useState<Product | null>()
  const [loading, setLoading] = useState<Boolean>(false)
  const { query } = useApi()
  const { merchandise } = useCartLineTarget()
  const [shopName, setShopName] = useState<"AU" | "NZ">("AU")

  useEffect(() => {
    setLoading(true)
    query(
      `query getProductById($id: ID!) {
        product(id: $id) {
          tags
        }
        shop {
          name
        }
      }`,
      {
        variables: { id: merchandise?.product?.id },
      }
    )
      // ... same as before
      .then(({ data }) => {
        setProduct(data?.product ?? null)
        setLoading(false)

        if (data?.shop?.name?.toLowerCase()?.includes("nz")) {
          setShopName("NZ")
        }
      })
      .catch(error => {
        console.error(error)
        setLoading(false)
      })
  }, [merchandise?.product?.id, query])

  const filteredProductMessages = useMemo(() => {
    const productMessages: ProductMessage[] = [
      {
        message: "Sale items cannot be refunded, exchange only",
        tag: "x-markdown:yes",
        appearance: "critical",
      },
      {
        message: "Swim can only be returned online",
        tag: "x-category:swim",
        appearance: "info",
      },
      {
        message: "Online exclusive - refund only",
        tag: "x-category:mini",
        appearance: "critical",
      },
      {
        message: "Not eligible for exchange or refund",
        tag: "x-collection:Jewellery",
        appearance: "critical",
      },
      {
        message: "Not eligible for exchange or refund",
        tag: "lifestyle-product",
        appearance: "critical",
      },
      {
        message: "Not eligible for exchange or refund",
        tag: "x-category:beauty",
        appearance: "critical",
      },
      {
        message: `Redeemable only in ${shopName}`,
        tag: "gift-card",
        appearance: "critical",
      },
    ]

    return productMessages.filter(message => product?.tags?.includes(message.tag))
  }, [product, shopName])

  if (loading) {
    return <TextBlock>Loading...</TextBlock>
  }

  return (
    <>
      {filteredProductMessages.length > 0 ? (
        <TextBlock key={filteredProductMessages[0].tag} size="small" appearance={filteredProductMessages[0].appearance}>
          {filteredProductMessages[0].message}
        </TextBlock>
      ) : null}
    </>
  )
}

type ProductMessage = {
  message: string
  tag: string
  appearance: "critical" | "info" | "accent" | "decorative" | "subdued" | "success" | "warning"
}
