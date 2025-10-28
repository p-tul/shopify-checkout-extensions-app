import { BRANDING_UPDATE_MUTATION } from "@app/graphql/mutations/branding"
import { useEnvironment } from "@app/hooks/useEnvironment"
import { useLocales } from "@app/locales"
import type { ActionFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useFetcher, useNavigate } from "@remix-run/react"

import { Banner, BlockStack, Button, Card, FormLayout, Layout, Page, TextField } from "@shopify/polaris"
import { useField, useForm } from "@shopify/react-form"

import shopify from "@app/shopify.server"

// NOTE: This page is a work in progress.
// Currently implemented to make dev debugging & prod deployment easier. Consider extending to further maximize maintainability.
const BRANDING_CONFIG = {
  development: {
    checkoutProfileId: "gid://shopify/CheckoutProfile/1983152323",
    fontBase: "gid://shopify/GenericFile/35271892598979",
    fontBold: "gid://shopify/GenericFile/37877044281635",
    fontBaseSerif: "gid://shopify/GenericFile/35271892598979",
    fontBoldSerif: "gid://shopify/GenericFile/35271890960579",
    logoImage: "gid://shopify/MediaImage/37876672233763",
    faviconImage: "gid://shopify/MediaImage/27093199028278",
  },
  staging: {
    checkoutProfileId: "gid://shopify/CheckoutProfile/1995014339",
    fontBase: "gid://shopify/GenericFile/35271892598979",
    fontBold: "gid://shopify/GenericFile/35271890960579",
    fontBaseSerif: "gid://shopify/GenericFile/35271892598979",
    fontBoldSerif: "gid://shopify/GenericFile/35271890960579",
    logoImage: "gid://shopify/MediaImage/15692394430659",
    faviconImage: "gid://shopify/MediaImage/35575006036163",
  },
  production: {
    checkoutProfileId: "gid://shopify/CheckoutProfile/1007157320",
    fontBase: "gid://shopify/GenericFile/23113525559368",
    fontBold: "gid://shopify/GenericFile/23113525526600",
    fontBaseSerif: "gid://shopify/GenericFile/23113525559368",
    fontBoldSerif: "gid://shopify/GenericFile/23113525526600",
    logoImage: "gid://shopify/MediaImage/11875447308360",
    faviconImage: "gid://shopify/MediaImage/23128700846152",
  },
  production_nz: {
    checkoutProfileId: "gid://shopify/CheckoutProfile/5050138988",
    fontBase: "gid://shopify/GenericFile/45465598656876",
    fontBold: "gid://shopify/GenericFile/45465598689644",
    fontBaseSerif: "gid://shopify/GenericFile/45465598656876",
    fontBoldSerif: "gid://shopify/GenericFile/45465598689644",
    logoImage: "gid://shopify/MediaImage/15846371360956",
    faviconImage: "gid://shopify/MediaImage/45492859339116",
  },
}

export const BRANDING_OBJECT = {
  checkoutProfileId: "%checkoutProfileId%",
  checkoutBrandingInput: {
    designSystem: {
      typography: {
        primary: {
          customFontGroup: {
            base: {
              genericFileId: "%fontBase%",
              weight: 400,
            },
            bold: {
              genericFileId: "%fontBold%",
              weight: 500,
            },
            loadingStrategy: "SWAP",
          },
        },
        secondary: {
          customFontGroup: {
            base: {
              genericFileId: "%fontBaseSerif%",
              weight: 400,
            },
            bold: {
              genericFileId: "%fontBoldSerif%",
              weight: 500,
            },
            loadingStrategy: "SWAP",
          },
        },
      },
      cornerRadius: {
        base: 1,
      },
    },
    customizations: {
      favicon: {
        mediaImageId: "%faviconImage%",
      },
      global: {
        typography: {
          kerning: "LOOSE",
        },
      },
      textField: {
        typography: {
          kerning: "LOOSE",
        },
      },
      headingLevel1: {
        typography: {
          font: "SECONDARY",
          weight: "BASE",
        },
      },
      headingLevel2: {
        typography: {
          font: "SECONDARY",
          weight: "BASE",
          size: "MEDIUM",
        },
      },
      headingLevel3: {
        typography: {
          letterCase: "UPPER",
          font: "PRIMARY",
          weight: "BASE",
          kerning: "LOOSE",
          size: "BASE",
        },
      },
    },
  },
}

export const BrandingFields = {
  checkoutProfileId: "%checkoutProfileId%",
  fontBase: "%fontBase%",
  fontBold: "%fontBold%",
  fontBaseSerif: "%fontBaseSerif%",
  fontBoldSerif: "%fontBoldSerif%",
  logoImage: "%logoImage%",
  faviconImage: "%faviconImage%",
}

type ActionData = {
  status: "success" | "errors"
  errors: Array<string>
}

export default () => {
  const navigate = useNavigate()
  const locales = useLocales()
  const fetcher = useFetcher<ActionData>()

  const env = useEnvironment()

  const isLoading = fetcher.state !== "idle"

  const errorBanner = fetcher.data?.errors.length ? (
    <Layout.Section>
      <Banner title="There was an error in updating the branding customization.">
        <ul>
          {fetcher.data?.errors.map((error, index) => {
            return <li key={`${index}`}>{error}</li>
          })}
        </ul>
      </Banner>
    </Layout.Section>
  ) : null

  const successBanner =
    fetcher.data?.status === "success" ? (
      <Layout.Section>
        <Banner tone="success" title="Successfully updated branding customisation." />
      </Layout.Section>
    ) : null

  const defaultConfig = BRANDING_CONFIG?.[env]

  const validateFn = (value: string) => (!value ? locales.branding.validation.required : "")

  const {
    fields: { checkoutProfileID, fontBase, fontBold, fontBaseSerif, fontBoldSerif, logoImage, faviconImage },
    submit: handleSubmit,
  } = useForm({
    fields: {
      checkoutProfileID: useField({ value: defaultConfig?.checkoutProfileId || "", validates: validateFn }),
      fontBase: useField({ value: defaultConfig?.fontBase || "", validates: validateFn }),
      fontBold: useField({ value: defaultConfig?.fontBold || "", validates: validateFn }),
      fontBaseSerif: useField({ value: defaultConfig?.fontBaseSerif || "", validates: validateFn }),
      fontBoldSerif: useField({ value: defaultConfig?.fontBoldSerif || "", validates: validateFn }),
      logoImage: useField({ value: defaultConfig?.logoImage || "", validates: validateFn }),
      faviconImage: useField({ value: defaultConfig?.faviconImage || "", validates: validateFn }),
    },
    onSubmit: async form => {
      const data = {
        checkoutProfileId: form.checkoutProfileID,
        fontBase: form.fontBase,
        fontBold: form.fontBold,
        fontBaseSerif: form.fontBaseSerif,
        fontBoldSerif: form.fontBoldSerif,
        logoImage: form.logoImage,
        faviconImage: form.faviconImage,
      }

      let brandObjString = JSON.stringify(BRANDING_OBJECT)

      Object.keys(BrandingFields).forEach(key => {
        brandObjString = brandObjString.replaceAll(
          BrandingFields[key as keyof typeof BrandingFields],
          data?.[key as keyof typeof data] || ""
        )
      })

      const formData = JSON.parse(brandObjString)
      fetcher.submit({ data: JSON.stringify(formData) }, { method: "post" })

      return { status: "success" }
    },
  })

  return (
    <Page
      title={locales.branding.title}
      backAction={{
        onAction: () => navigate("/app"),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="1200">
              <FormLayout>
                <TextField
                  {...checkoutProfileID}
                  label={locales.branding.fields.checkout_profile_id}
                  autoComplete="off"
                  requiredIndicator
                />
                <TextField {...fontBase} label={locales.branding.fields.font_base} autoComplete="off" requiredIndicator />
                <TextField {...fontBold} label={locales.branding.fields.font_bold} autoComplete="off" requiredIndicator />
                <TextField {...fontBaseSerif} label={locales.branding.fields.font_base_serif} autoComplete="off" requiredIndicator />
                <TextField {...fontBoldSerif} label={locales.branding.fields.font_bold_serif} autoComplete="off" requiredIndicator />
                <TextField {...logoImage} label={locales.branding.fields.logo_image} autoComplete="off" requiredIndicator />
                <TextField {...faviconImage} label={locales.branding.fields.favicon_image} autoComplete="off" requiredIndicator />
              </FormLayout>
              <Button role="submit" variant="primary" loading={isLoading} onClick={handleSubmit}>
                {locales.branding.update}
              </Button>
              {successBanner}
              {errorBanner}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await shopify.authenticate.admin(request)
  const formData = await request.formData()
  const brandObjString = formData.get("data") as string

  if (!brandObjString) return json({ status: "errors", errors: ["Invalid request: missing form data"] })

  const rules = JSON.parse(brandObjString)

  const response = await admin.graphql(BRANDING_UPDATE_MUTATION, {
    variables: rules,
  })

  const responseJson = await response.json()

  const errors = [
    ...new Set(responseJson?.data?.checkoutBrandingUpsert?.userErrors?.map(({ message }: { message: string }) => message) || []),
  ]
  const status = errors?.length ? "errors" : "success"

  return json({ status, errors })
}
