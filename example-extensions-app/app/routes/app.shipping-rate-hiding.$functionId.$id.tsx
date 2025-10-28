import { Form, useFetcher, useLoaderData } from "@remix-run/react"
import { BlockStack, Card, Layout, Page, PageActions, Text, TextField } from "@shopify/polaris"
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node"
import { authenticate } from "@app/shopify.server"
import { GET_DELIVERY_CUSTOMIZATION_QUERY } from "@app/graphql/queries/delivery"
import { createGid, extractGid } from "@app/helpers/utils"
import {
  CREATE_DELIVERY_CUSTOMIZATION_MUTATION,
  UPDATE_DELIVERY_CUSTOMIZATION_MUTATION
} from "@app/graphql/mutations/delivery"
import React, { useEffect, useState } from "react"
import { useField, useForm } from "@shopify/react-form"
import { SaveBar } from "@app/Components/Common/SaveBar"
import { useLocales } from "@app/locales"
import { ShippingRateHidingTargetCard } from "@app/Components/Delivery/ShippingRateHidingTargetCard"
import { ShippingRateHidingRatesCard } from "@app/Components/Delivery/ShippingRateHidingRatesCard"
import { Banner } from "@app/Components/Common/Banner"

enum ActionType {
  CREATE = "create",
  UPDATE = "update",
}

type ActionData = {
  action: ActionType
  status: "success" | "errors"
  errors: Array<string>
}

const BACK_URL = "shopify://admin/settings/shipping/customizations"
const EXTENSION_HANDLE = "shipping-rate-hiding"
const METAFIELD_NAMESPACE = `$app:${EXTENSION_HANDLE}`
const METAFIELD_KEY = "function-configuration"
const DEFAULT_TARGET_TYPE = "product-tag"
const DEFAULT_LINE_ITEM_OPERATOR = "exists"

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { id } = params
  const { admin } = await authenticate.admin(request)
  const url = new URL(request.url)
  const searchParams = new URLSearchParams(url.search)

  if (!id) {
    throw new Response(null, {
      status: 404,
      statusText: "Delivery customisation ID not found"
    })
  }

  if (id === "new") {
    return json({
      id: "new",
      deliveryCustomisation: {
        title: "",
      },
      metafieldId: null,
      metafield: {
        targetType: DEFAULT_TARGET_TYPE,
        productTags: [],
        lineItemPropertyKey: "",
        lineItemPropertyOperator: DEFAULT_LINE_ITEM_OPERATOR,
        lineItemPropertyValue: "",
        rateKeywordsToHide: [],
      },
      successMessage: ""
    })
  }

  const gid = createGid("DeliveryCustomization", id)

  const response = await admin.graphql(GET_DELIVERY_CUSTOMIZATION_QUERY, {
    variables: {
      id: gid,
    },
  })

  const responseJson = await response.json()

  if (
    !responseJson.data.deliveryCustomization ||
    !responseJson.data.deliveryCustomization.metafields?.edges?.[0]?.node?.value
  ) {
    throw new Response(null, {
      status: 404,
      statusText: "Delivery customization data not found"
    })
  }

  const deliveryCustomisation = responseJson.data.deliveryCustomization
  const metafield = JSON.parse(responseJson.data.deliveryCustomization.metafields.edges[0].node.value)
  const metafieldId = responseJson.data.deliveryCustomization.metafields.edges[0].node.id
  const successMessage = searchParams.get("status") === "created" ? "Successfully created" : ""

  return json({
    id: gid,
    deliveryCustomisation,
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
      statusText: "Delivery customisation ID not found"
    })
  }

  if (action === ActionType.CREATE) {
    if (typeof customisation !== "string")
      return json({ errors: [{ field: "all", message: "Delivery customisation submission not valid" }] })

    const { title, configuration } = JSON.parse(customisation)

    const response = await admin.graphql(CREATE_DELIVERY_CUSTOMIZATION_MUTATION, {
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
      ...new Set(responseJson.data.deliveryCustomizationCreate?.userErrors?.map(({ message }: { message: string }) => message) || [])
    ]
    const id = responseJson.data.deliveryCustomizationCreate?.deliveryCustomization?.id
    const status = errors?.length ? "errors" : "success"

    if (status === "errors") {
      return json({ status, id, errors })
    } else {
      return redirect(`/app/${EXTENSION_HANDLE}/${functionId}/${extractGid(id)}?status=created`)
    }
  } else if (action === ActionType.UPDATE) {
    if (typeof customisation !== "string")
      return json({ errors: [{ field: "all", message: "Delivery customisation submission not valid" }] })

    const gid = createGid("DeliveryCustomization", id)
    const { title, configuration } = JSON.parse(customisation)

    const response = await admin.graphql(UPDATE_DELIVERY_CUSTOMIZATION_MUTATION, {
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
      ...new Set(responseJson.data.deliveryCustomizationUpdate?.userErrors?.map(({ message }: { message: string }) => message) || [])
    ]
    const status = errors?.length ? "errors" : "success"
    return json({ action, status, errors })
  }
}

export default function ShippingRateHiding() {
  const { id, deliveryCustomisation, metafield, metafieldId, successMessage } = useLoaderData<typeof loader>()
  const locales = useLocales()
  const fetcher = useFetcher<ActionData>()
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
    value: deliveryCustomisation.title || locales.discounts.shipping_rate_hiding.new,
    validates: (value) => {
      if (value.length < 3) return locales.discounts.validation.title
    }
  })
  const targetTypeField = useField(metafield.targetType || DEFAULT_TARGET_TYPE)
  const productTagsField = useField(metafield.productTags || [])
  const lineItemPropertyKeyField = useField(metafield.lineItemPropertyKey || "")
  const lineItemPropertyOperatorField = useField(metafield.lineItemPropertyOperator || DEFAULT_LINE_ITEM_OPERATOR)
  const lineItemPropertyValueField = useField(metafield.lineItemPropertyValue || "")
  const rateKeywordsToHideField = useField(metafield.rateKeywordsToHide || [])

  const {
    fields: { title, configuration },
    reset,
    submit: handleSubmit,
    submitErrors
  } = useForm({
    fields: {
      title: titleField,
      configuration: {
        targetType: targetTypeField,
        productTags: productTagsField,
        lineItemPropertyKey: lineItemPropertyKeyField,
        lineItemPropertyOperator: lineItemPropertyOperatorField,
        lineItemPropertyValue: lineItemPropertyValueField,
        rateKeywordsToHide: rateKeywordsToHideField,
      }
    },
    onSubmit: async (form) => {
      const deliveryCustomisation = {
        title: form.title,
        metafieldId,
        configuration: {
          targetType: form.configuration.targetType,
          productTags: form.configuration.productTags,
          lineItemPropertyKey: form.configuration.lineItemPropertyKey,
          lineItemPropertyOperator: form.configuration.lineItemPropertyOperator,
          lineItemPropertyValue: form.configuration.lineItemPropertyValue,
          rateKeywordsToHide: form.configuration.rateKeywordsToHide,
        }
      }

      fetcher.submit({
        action: isNew ? ActionType.CREATE : ActionType.UPDATE,
        customisation: JSON.stringify(deliveryCustomisation)
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
      title.value !== deliveryCustomisation.title ||
      configuration.targetType.value !== metafield.targetType ||
      JSON.stringify(configuration.productTags.value) !== JSON.stringify(metafield.productTags) ||
      configuration.lineItemPropertyKey.value !== metafield.lineItemPropertyKey ||
      configuration.lineItemPropertyOperator.value !== metafield.lineItemPropertyOperator ||
      configuration.lineItemPropertyValue.value !== metafield.lineItemPropertyValue ||
      JSON.stringify(configuration.rateKeywordsToHide.value) !== JSON.stringify(metafield.rateKeywordsToHide)
    ) {
      setChanges(true)
    } else {
      setChanges(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fetcher.state,
    title.value,
    configuration.targetType.value,
    configuration.productTags.value,
    configuration.lineItemPropertyKey.value,
    configuration.lineItemPropertyOperator.value,
    configuration.lineItemPropertyValue.value,
    configuration.rateKeywordsToHide.value,
  ])

  return (
    <>
      <Page
        title="Shipping Rate Hiding"
        backAction={{
          content: "Customisations",
          onAction: () => open(BACK_URL, "_top"),
        }}
      >
        <Layout>
          <Banner success={success} errors={errors} />
          <Layout.Section>
            <BlockStack gap="400">
              <Card>
                <Form>
                  <BlockStack align="space-around" gap="400">
                    <Text variant="headingMd" as="h2">
                      {isNew ? "Create " : ""}Shipping Rate Hiding customisation
                    </Text>
                    <Text as="p">
                      Hide shipping rates when specified targets are satisfied.
                    </Text>
                    <TextField
                      {...titleField}
                      label={locales.discounts.common.title}
                      autoComplete="off"
                      requiredIndicator
                    />
                  </BlockStack>
                </Form>
              </Card>
              <ShippingRateHidingTargetCard
                targetTypeField={targetTypeField}
                productTagsField={productTagsField}
                lineItemPropertyKeyField={lineItemPropertyKeyField}
                lineItemPropertyOperatorField={lineItemPropertyOperatorField}
                lineItemPropertyValueField={lineItemPropertyValueField}
              />
              <ShippingRateHidingRatesCard
                rateKeywordsToHideField={rateKeywordsToHideField}
              />
            </BlockStack>
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
