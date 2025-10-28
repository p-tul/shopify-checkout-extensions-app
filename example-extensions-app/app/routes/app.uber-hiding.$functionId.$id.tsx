import { useLoaderData } from "@remix-run/react"
import { Banner, Card, EmptyState, Layout, Page } from "@shopify/polaris"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { authenticate } from "@app/shopify.server"
import { GET_DELIVERY_CUSTOMIZATION_QUERY } from "@app/graphql/queries/delivery"
import { createGid } from "@app/helpers/utils"

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { id } = params
  const { admin } = await authenticate.admin(request)

  const response = await admin.graphql(GET_DELIVERY_CUSTOMIZATION_QUERY, {
    variables: {
      id: createGid("DeliveryCustomization", id as string),
    },
  })

  const responseJson = await response.json()

  if (
    !responseJson.data.deliveryCustomization ||
    !responseJson.data.deliveryCustomization.metafields?.edges?.[0]?.node?.value
  ) {
    return json({ customization: null })
  }

  const { title } = responseJson.data.deliveryCustomization
  const configuration = JSON.parse(
    responseJson.data.deliveryCustomization.metafields.edges[0].node.value
  )

  const customization = {
    title,
    configuration: {
      ...configuration,
      metafieldId: responseJson.data.deliveryCustomization.metafields.edges[0].node.id,
    },
  }

  return json({ customization })
}

const BACK_URL = "shopify://admin/settings/shipping/customizations"

export default function DeliveryCustomizationDetails() {
  const { customization } = useLoaderData<typeof loader>()

  if (!customization) {
    return (
      <Page
        title="Delivery Methods Customization"
        backAction={{
          content: "Customizations",
          onAction: () => open(BACK_URL, "_top"),
        }}
      >
        <Layout>
          <Layout.Section>
            <Banner tone="critical">
              <p>Customization not found</p>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    )
  }

  return (
    <Page
      title="Delivery Methods Customization"
      backAction={{
        content: "Customizations",
        onAction: () => open(BACK_URL, "_top"),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <EmptyState
              heading="Uber Delivery"
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>This customization will automatically hide the Uber delivery method in checkout for orders outside of the operation hours (10AM - 3PM).</p>
            </EmptyState>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
