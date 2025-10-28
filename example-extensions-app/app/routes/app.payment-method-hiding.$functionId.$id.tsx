import { Form, useFetcher, useLoaderData } from "@remix-run/react"
import {
  BlockStack,
  Button,
  Card,
  InlineStack,
  Layout,
  Page,
  PageActions,
  ResourceItem,
  ResourceList,
  Text, TextField,
  Thumbnail
} from "@shopify/polaris"
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node"
import { authenticate } from "@app/shopify.server"
import { createGid, extractGid } from "@app/helpers/utils"
import React, { useCallback, useEffect, useState } from "react"
import { useField, useForm } from "@shopify/react-form"
import { SaveBar } from "@app/Components/Common/SaveBar"
import { Banner } from "@app/Components/Common/Banner"
import { GET_PAYMENT_CUSTOMIZATION_QUERY } from "@app/graphql/queries/payment"
import {
  CREATE_PAYMENT_CUSTOMIZATION_MUTATION,
  UPDATE_PAYMENT_CUSTOMIZATION_MUTATION
} from "@app/graphql/mutations/payment"
import { useLocales } from "@app/locales"
import { BaseResource, ItemResource } from "@root/types/Discount"
import { TagInput } from "@app/Components/Discounts/TagInput"
import { XIcon } from "@shopify/polaris-icons"

enum ActionType {
  CREATE = "create",
  UPDATE = "update",
}

type ActionData = {
  action: ActionType
  status: "success" | "errors"
  errors: Array<string>
}

const BACK_URL = "shopify://admin/settings/payments/customizations"
const EXTENSION_HANDLE = "payment-method-hiding"
const METAFIELD_NAMESPACE = `$app:${EXTENSION_HANDLE}`
const METAFIELD_KEY = "function-configuration"
const DEFAULT_TITLE = "Payment Method Hiding"

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { id } = params
  const { admin } = await authenticate.admin(request)
  const url = new URL(request.url)
  const searchParams = new URLSearchParams(url.search)

  if (!id) {
    throw new Response(null, {
      status: 404,
      statusText: "Payment customisation ID not found"
    })
  }

  if (id === "new") {
    return json({
      id: "new",
      paymentCustomisation: {
        title: DEFAULT_TITLE,
      },
      metafieldId: null,
      metafield: {
        paymentMethods: [],
        products: [],
        productIds: [],
      },
      successMessage: ""
    })
  }

  const gid = createGid("PaymentCustomization", id)

  const response = await admin.graphql(GET_PAYMENT_CUSTOMIZATION_QUERY, {
    variables: {
      id: gid,
    },
  })

  const responseJson = await response.json()

  if (
    !responseJson.data.paymentCustomization ||
    !responseJson.data.paymentCustomization.metafields?.edges?.[0]?.node?.value
  ) {
    throw new Response(null, {
      status: 404,
      statusText: "Payment customization data not found"
    })
  }

  const paymentCustomisation = responseJson.data.paymentCustomization
  const metafield = JSON.parse(responseJson.data.paymentCustomization.metafields.edges[0].node.value)
  const metafieldId = responseJson.data.paymentCustomization.metafields.edges[0].node.id
  const successMessage = searchParams.get("status") === "created" ? "Successfully created" : ""

  return json({
    id: gid,
    paymentCustomisation,
    metafieldId,
    metafield,
    successMessage,
  })
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { functionId, id } = params
  const { admin } = await authenticate.admin(request)
  const formData = await request.formData()
  const action = formData.get("action")
  const customisation = formData.get("customisation")

  if (!id) {
    throw new Response(null, {
      status: 404,
      statusText: "Payment customisation ID not found"
    })
  }

  if (action === ActionType.CREATE) {
    if (typeof customisation !== "string")
      return json({ errors: [{ field: "all", message: "Payment customisation submission not valid" }] })

    const { title, configuration } = JSON.parse(customisation)

    const response = await admin.graphql(CREATE_PAYMENT_CUSTOMIZATION_MUTATION, {
      variables: {
        customization: {
          functionId,
          title,
          enabled: true,
          metafields: [{
            namespace: METAFIELD_NAMESPACE,
            key: METAFIELD_KEY,
            type: "json",
            value: JSON.stringify({ ...configuration }),
          }],
        },
      },
    })

    const responseJson = await response.json()
    const errors = [
      ...new Set(responseJson.data.paymentCustomizationCreate?.userErrors?.map(({ message }: { message: string }) => message) || [])
    ]
    const id = responseJson.data.paymentCustomizationCreate?.paymentCustomization?.id
    const status = errors?.length ? "errors" : "success"

    if (status === "errors") {
      return json({ status, id, errors })
    } else {
      return redirect(`/app/${EXTENSION_HANDLE}/${functionId}/${extractGid(id)}?status=created`)
    }
  } else if (action === ActionType.UPDATE) {
    if (typeof customisation !== "string")
      return json({ errors: [{ field: "all", message: "Payment customisation submission not valid" }] })

    const gid = createGid("PaymentCustomization", id)
    const { title, configuration } = JSON.parse(customisation)

    const response = await admin.graphql(UPDATE_PAYMENT_CUSTOMIZATION_MUTATION, {
      variables: {
        id: gid,
        customization: {
          functionId,
          title,
          enabled: true,
          metafields: [{
            namespace: METAFIELD_NAMESPACE,
            key: METAFIELD_KEY,
            type: "json",
            value: JSON.stringify({ ...configuration })
          }]
        }
      }
    })

    const responseJson = await response.json()
    const errors = [
      ...new Set(responseJson.data.paymentCustomizationUpdate?.userErrors?.map(({ message }: { message: string }) => message) || [])
    ]
    const status = errors?.length ? "errors" : "success"
    return json({ action, status, errors })
  }
}

export default function PaymentMethodHiding() {
  const { id, paymentCustomisation, metafield, metafieldId, successMessage } = useLoaderData<typeof loader>()
  const fetcher = useFetcher<ActionData>()
  const locales = useLocales()
  const isNew = id === "new"
  const isLoading = fetcher.state !== "idle"
  const [changes, setChanges] = useState<boolean>(isNew)
  const [errors, setErrors] = useState<Array<string>>([])
  const [success, setSuccess] = useState<string>(successMessage)

  useEffect(() => {
    // Reset state on transition to created discount
    setSuccess(successMessage)
    setErrors([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const titleField = useField<string>({
    value: paymentCustomisation.title || DEFAULT_TITLE,
    validates: (value) => {
      if (value.length < 3) return locales.payment.validation.title
    }
  })

  const paymentMethodsField = useField<string[]>(metafield.paymentMethods || [])
  const productsField = useField<ItemResource[]>(metafield.products || [])
  const productIdsField = useField<string[]>(metafield.productIds || [])

  const {
    fields: { title, configuration },
    reset,
    submit: handleSubmit,
    submitErrors
  } = useForm({
    fields: {
      title: titleField,
      configuration: {
        paymentMethods: paymentMethodsField,
        products: productsField,
        productIds: productIdsField,
      }
    },
    onSubmit: async (form) => {
      const customisation = {
        title: form.title,
        metafieldId,
        configuration: {
          paymentMethods: form.configuration.paymentMethods,
          products: form.configuration.products,
          productIds: form.configuration.productIds,
        }
      }

      fetcher.submit({
        action: isNew ? ActionType.CREATE : ActionType.UPDATE,
        customisation: JSON.stringify(customisation)
      }, {
        method: "post"
      })

      return { status: "success" }
    }
  })

  const handleReset = () => {
    reset()
    setSuccess("")
    setErrors([])
  }

  const handlePaymentMethodAdd = (toAdd: string) => {
    const newTag = toAdd.trim().toLowerCase()
    if (!paymentMethodsField.value.includes(newTag)) {
      paymentMethodsField.onChange(paymentMethodsField.value.concat([newTag]))
    }
  }

  const handlePaymentMethodRemove = (toRemove: string) => {
    paymentMethodsField.onChange(paymentMethodsField.value.filter(code => code !== toRemove))
  }

  const onResourcePickerClick = useCallback(async () => {
    const baseResources: BaseResource[] = productIdsField.value?.map(id => ({ id })) || []

    const selected = await shopify.resourcePicker({
      type: "product",
      selectionIds: baseResources,
      multiple: 50,
      filter: {
        hidden: false,
        variants: false,
        draft: false,
        archived: false
      }
    })

    if (selected && selected.length > 0) {
      productsField.onChange(selected.map((product: any) => ({
        id: product.id,
        image: product.images?.[0]?.originalSrc,
        title: product.title
      })))
      productIdsField.onChange(selected.map(({ id }) => id))
    } else {
      productsField.onChange([])
      productIdsField.onChange([])
    }
  }, [productsField, productIdsField])

  const onProductDelete = useCallback((toRemove: string) => {
    productsField.onChange(productsField.value?.filter(resource => resource.id !== toRemove) || [])
    productIdsField.onChange(productIdsField.value?.filter(id => id !== toRemove) || [])
  }, [productsField, productIdsField])

  useEffect(() => {
    if (fetcher.state === "submitting") {
      setErrors([])
      setSuccess("")
    }
    if (fetcher.state === "idle" && fetcher.data?.status === "errors") {
      setErrors(fetcher.data.errors)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state])

  useEffect(() => {
    setErrors(submitErrors.map(({ message }) => message))
  }, [submitErrors])

  useEffect(() => {
    if (isNew) {
      return
    }

    if (
      title.value !== paymentCustomisation.title ||
      JSON.stringify(configuration.paymentMethods.value) !== JSON.stringify(metafield.paymentMethods) ||
      JSON.stringify(configuration.productIds.value) !== JSON.stringify(metafield.productIds)
    ) {
      setChanges(true)
    } else {
      setChanges(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fetcher.state,
    title.value,
    configuration.paymentMethods.value,
    configuration.products.value,
    configuration.productIds.value,
  ])

  return (
    <>
      <Page
        title="Payment Method Hiding"
        backAction={{
          content: "Customisations",
          onAction: () => open(BACK_URL, "_top"),
        }}
      >
        <Layout>
          <Banner success={success} errors={errors} />
          <Layout.Section>
            <Card>
              <Form>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">
                    {isNew ? "Create " : ""}Payment Method Hiding customisation
                  </Text>
                  <Text as="p">
                    Hide payment methods when specified products are present in the cart.
                  </Text>
                  <TextField
                    {...titleField}
                    label={locales.discounts.common.title}
                    autoComplete="off"
                    requiredIndicator
                  />
                  <BlockStack gap="100">
                    <Text as="h2" variant="headingMd">Payment Methods to Hide</Text>
                    <Text as="p">Payment methods to hide when any product below is in cart. Enter names e.g. afterpay (case insensitive).</Text>
                    <TagInput
                      tags={paymentMethodsField.value}
                      placeholder="Use comma to complete a name"
                      onTagAdd={handlePaymentMethodAdd}
                      onTagRemove={handlePaymentMethodRemove}
                    />
                  </BlockStack>
                  <BlockStack gap="100">
                    <Text as="h2" variant="headingMd">Products</Text>
                    <Text as="p">Payment methods above are hidden when any of these products are in the cart.</Text>
                    <ResourceList
                      resourceName={{ singular: "product", plural: "products" }}
                      items={productsField.value || []}
                      renderItem={(item: ItemResource) => (
                        <ResourceItem
                          id={item.id}
                          media={<Thumbnail size="extraSmall" source={item.image} alt={item.title} />}
                          onClick={() => null}
                          disabled
                        >
                          <InlineStack align="space-between" gap="400" wrap={false}>
                            <Text variant="bodyMd" fontWeight="bold" as="h3">
                              {item.title}
                            </Text>
                            <Button icon={XIcon} onClick={() => onProductDelete(item.id)} />
                          </InlineStack>
                        </ResourceItem>
                      )}
                    />
                    <Button onClick={onResourcePickerClick}>
                      Select products
                    </Button>
                  </BlockStack>
                </BlockStack>
              </Form>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <PageActions
              primaryAction={{
                content: isNew ? "Create" : "Save",
                loading: isLoading,
                disabled: !changes && !isNew,
                onAction: handleSubmit
              }}
            />
          </Layout.Section>
        </Layout>
      </Page>
      <SaveBar
        isNew={isNew}
        changes={changes}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onReset={handleReset}
      />
    </>
  )
}
