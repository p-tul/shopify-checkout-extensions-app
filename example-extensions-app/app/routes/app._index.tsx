import type { LoaderFunctionArgs } from "@remix-run/node"
import { BlockStack, Card, Layout, List, Page, Text } from "@shopify/polaris"
import { authenticate } from "../shopify.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  return null
}

export default function Index() {
  return (
    <Page title="DECJUBA Functions">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="p">
                This app provides the following features:
              </Text>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">
                  Custom product discounts
                </Text>
                <Text as="p">
                  Create Insider discount, staff discount, various promotional discounts targeting products.
                </Text>
              </BlockStack>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">
                  Custom shipping discounts
                </Text>
                <Text as="p">
                  Create free shipping discounts for targeted customer segments e.g. Insider.
                </Text>
              </BlockStack>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">
                  Business logic discounts
                </Text>
                <Text as="p">
                  Supports GWP discounts, WAP discounts, split shipping discounts.
                </Text>
              </BlockStack>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">
                  Custom discount stacking logic
                </Text>
                <Text as="p">
                  Discounts can be stacked and restricted based on flexible customisation options.
                </Text>
              </BlockStack>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">
                  Checkout option hiding
                </Text>
                <Text as="p">
                  Hide shipping rates and payment options based on business logic.
                </Text>
              </BlockStack>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">
                  Checkout extensions
                </Text>
                <Text as="p">
                  Custom address autocomplete and validation, general field validation, banners.
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird"/>
      </Layout>
    </Page>
  )
}
