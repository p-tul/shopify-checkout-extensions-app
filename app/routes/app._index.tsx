import type { LoaderFunctionArgs } from "@remix-run/node"
import { BlockStack, Card, Layout, Page, Text } from "@shopify/polaris"
import { authenticate } from "../shopify.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  return null
}

export default function Index() {
  return (
    <Page title="Shopify Extensions Showcase">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="p">
                Welcome to the Shopify Extensions Showcase app.
              </Text>
              <Text as="p">
                This app is a collection of Shopify extensions to demonstrate the capabilities of the Shopify platform.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}

