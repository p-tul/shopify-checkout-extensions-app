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
import { useEffect, useState } from "react"
import { useField, useForm } from "@shopify/react-form"
import { SaveBar } from "@app/Components/Common/SaveBar"
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
const METAFIELD_NAMESPACE = "$app:metro-shipping-rate"
const METAFIELD_KEY = "function-configuration"
const DEFAULT_TITLE = "Metro Shipping Rate"
const DEFAULT_METRO_RATE_NAME = "metro"
const DEFAULT_RATE_TO_HIDE = "standard"

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
        title: DEFAULT_TITLE,
      },
      metafieldId: null,
      metafield: {
        metroRateName: DEFAULT_METRO_RATE_NAME,
        metroRateCheckoutName: "",
        rateToHide: DEFAULT_RATE_TO_HIDE,
        postcodes: [],
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
      return redirect(`/app/metro-shipping-rate/${functionId}/${extractGid(id)}?status=created`)
    }
  } else if (action === ActionType.UPDATE) {
    if (typeof customisation !== "string")
      return json({ errors: [{ field: "all", message: "Delivery customisation submission not valid" }] })

    const gid = createGid("DeliveryCustomization", id)
    const { title, configuration, metafieldId } = JSON.parse(customisation)

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

export default function MetroShippingRate() {
  const { id, metafield, metafieldId, successMessage } = useLoaderData<typeof loader>()
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

  const metroRateNameField = useField(metafield.metroRateName || DEFAULT_METRO_RATE_NAME)
  const metroRateCheckoutNameField = useField(metafield.metroRateCheckoutName || "")
  const rateToHideField = useField(metafield.rateToHide || DEFAULT_RATE_TO_HIDE)
  const postcodesField = useField(metafield.postcodes?.join(",") || "")

  const {
    fields: { configuration },
    reset,
    submit: handleSubmit,
    submitErrors
  } = useForm({
    fields: {
      title: useField(DEFAULT_TITLE),
      configuration: {
        metroRateName: metroRateNameField,
        metroRateCheckoutName: metroRateCheckoutNameField,
        rateToHide: rateToHideField,
        postcodes: postcodesField,
      }
    },
    onSubmit: async (form) => {
      const deliveryCustomisation = {
        title: form.title,
        metafieldId,
        configuration: {
          metroRateName: form.configuration.metroRateName,
          metroRateCheckoutName: form.configuration.metroRateCheckoutName,
          rateToHide: form.configuration.rateToHide,
          postcodes: form.configuration.postcodes
            .replace(/\s/g, "")
            .split(",")
            .filter((postcode: string) => !!postcode.length),
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
      configuration.metroRateName.value !== metafield.metroRateName ||
      configuration.metroRateCheckoutName.value !== metafield.metroRateCheckoutName ||
      configuration.rateToHide.value !== metafield.rateToHide ||
      configuration.postcodes.value !== metafield.postcodes.join(",")
    ) {
      setChanges(true)
    } else {
      setChanges(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fetcher.state,
    configuration.metroRateName.value,
    configuration.metroRateCheckoutName.value,
    configuration.rateToHide.value,
    configuration.postcodes.value,
  ])

  return (
    <>
      <Page
        title="Metro Shipping Rate"
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
                <BlockStack align="space-around" gap="400">
                  <Text variant="headingMd" as="h2">
                    Create Metro Shipping Rate Customisation
                  </Text>
                  <Text as="p">
                    Handles logic for showing/hiding of Metro to customers based on postcode. Only one instance of this customisation should be active.
                  </Text>
                  <TextField
                    {...metroRateNameField}
                    label="Metro Rate Name"
                    autoComplete="off"
                    requiredIndicator
                    helpText={`The name of the Metro shipping rate as defined in "Shipping and Delivery" (case insensitive)`}
                  />
                  <TextField
                    {...metroRateCheckoutNameField}
                    label="Metro Checkout Name"
                    autoComplete="off"
                    helpText="Can be used to show a different name at checkout to customers"
                  />
                  <TextField
                    {...rateToHideField}
                    label="Rate to Hide"
                    autoComplete="off"
                    helpText="The name of the shipping rate to hide when Metro is active (case insensitive)"
                  />
                  <TextField
                    {...postcodesField}
                    label="Postcodes"
                    autoComplete="off"
                    multiline={10}
                    helpText="The list of comma separated delivery postcodes for which Metro should be shown. E.g. 3000,3001"
                  />
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
