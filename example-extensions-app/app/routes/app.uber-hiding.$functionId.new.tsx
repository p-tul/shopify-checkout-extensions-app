import { Form, useActionData, useNavigation, useSubmit } from "@remix-run/react"
import { useEffect } from "react"
import { useField, useForm } from "@shopify/react-form"
import { Banner, Card, EmptyState, Layout, Page } from "@shopify/polaris"
import type { ActionFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { authenticate } from "@app/shopify.server"
import { CREATE_DELIVERY_CUSTOMIZATION_MUTATION } from "@app/graphql/mutations/delivery"

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { functionId } = params
  const { admin } = await authenticate.admin(request)
  const formData = await request.formData()
  const { title } = JSON.parse(formData.get("customization") as string)

  const baseCustomization = {
    functionId,
    title,
    enabled: true,
  }

  const response = await admin.graphql(CREATE_DELIVERY_CUSTOMIZATION_MUTATION, {
    variables: {
      customization: {
        ...baseCustomization,
        metafields: [
          {
            namespace: "$app:uber-hiding",
            key: "function-configuration",
            type: "json",
            value: JSON.stringify({}),
          },
        ],
      },
    },
  })

  const responseJson = await response.json()
  const errors = responseJson.data.customizationCreate?.userErrors
  return json({ errors })
}

const BACK_URL = "shopify://admin/settings/shipping"

export default function DeliveryCustomizationNew() {
  const submitForm = useSubmit()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()

  const isLoading = navigation.state === "submitting"
  const submitErrors = actionData?.errors || []

  useEffect(() => {
    if (actionData?.errors?.length === 0) {
      open(BACK_URL, "_top")
    }
  }, [actionData])

  const {
    fields: { customizationTitle },
    submit,
  } = useForm({
    fields: {
      customizationTitle: useField("Uber Hiding (AU only)"),
    },
    onSubmit: async (form) => {
      const customization = {
        title: form.customizationTitle,
      }

      submitForm({ customization: JSON.stringify(customization) }, { method: "post" })
      return { status: "success" }
    },
  })

  const errorBanner =
    submitErrors.length > 0 ? (
      <Layout.Section>
        <Banner tone="critical">
          <p>There were some issues with your form submission:</p>
          <ul>
            {submitErrors.map(({ message, field }, index) => {
              return (
                <li key={`${message}${index}`}>
                  {field.join(".")} {message}
                </li>
              )
            })}
          </ul>
        </Banner>
      </Layout.Section>
    ) : null

  return (
    <Page
      title="Create Uber Hiding Customization"
      backAction={{
        content: "Customizations",
        onAction: () => open(BACK_URL, "_top"),
      }}
      primaryAction={{
        content: "Add customization",
        onAction: submit,
        loading: isLoading,
      }}
    >
      <Layout>
        {errorBanner}
        <Layout.Section>
          <Form method="post">
            <Card>
              <EmptyState
                heading="Uber Delivery"
                action={{ content: "Add customization", onAction: submit, loading: isLoading }}
                secondaryAction={{
                  content: "Discard",
                  onAction: () => open(BACK_URL, "_top"),
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>This customization will automatically hide the Uber delivery method in checkout for orders outside of the operation hours (10AM - 3PM).</p>
              </EmptyState>
            </Card>
          </Form>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
