import { useLocales } from "@app/locales"

import { BlockStack, Card, FormLayout, Text, TextField } from "@shopify/polaris"
import { Field } from "@shopify/react-form"

type Configuration = {
  discountId: Field<string>
  message: Field<string>
}

type Props = {
  heading: string
  discountTitle: Field<string>
  showDiscountId?: boolean
  configuration: Configuration
}

export const TitleCard: React.FC<Props> = ({ heading, discountTitle, showDiscountId = true, configuration }) => {
  const locales = useLocales()

  return (
    <Card>
      <FormLayout>
        <Text variant="headingMd" as="h2">
          {heading}
        </Text>
        <BlockStack gap="400">
          {showDiscountId && (
            <TextField
              {...configuration.discountId}
              label={locales.discounts.common.discountId}
              autoComplete="off"
              requiredIndicator
              helpText="Referenced by other discounts for defining stacking conditions"
            />
          )}
          <TextField
            {...discountTitle}
            label={locales.discounts.common.title}
            autoComplete="off"
            requiredIndicator
          />
          <TextField
            {...configuration.message}
            label={locales.discounts.common.message}
            autoComplete="off"
            requiredIndicator
            helpText="Publicly displayed to the user"
          />
        </BlockStack>
      </FormLayout>
    </Card>
  )
}
