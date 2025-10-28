import { BlockStack, Card, Checkbox, Text, Tooltip } from "@shopify/polaris"
import { Field } from "@shopify/react-form"
import { useLocales } from "@app/locales"
import { ResourceEligibilityInput } from "@app/Components/Discounts/ResourceEligibilityInput"
import { DiscountEligibility } from "@root/types/Discount"

type Configuration = {
  customerEligibility: Field<DiscountEligibility>
  loggedIn: Field<boolean>
  staff: Field<boolean>
}

type Props = {
  configuration: Configuration
  staffDisabled?: boolean
}

export const CustomerEligibilityCard: React.FC<Props> = ({ configuration, staffDisabled = false }) => {
  const locales = useLocales()

  return (
    <Card>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h2">
          {locales.discounts.common.customer_eligibility}
        </Text>
        <BlockStack gap="100">
          <ResourceEligibilityInput
            type="Customer"
            discountEligibility={configuration.customerEligibility.value}
            onChange={configuration.customerEligibility.onChange}
          />
          <Checkbox
            label="Logged in"
            checked={configuration.loggedIn.value}
            onChange={configuration.loggedIn.onChange}
          />
          {!staffDisabled && (
            <Tooltip content={`Customers with an @decjuba email and tagged with "Staff"`} dismissOnMouseOut>
              <Checkbox
                label="Staff"
                checked={configuration.staff.value}
                onChange={configuration.staff.onChange}
              />
            </Tooltip>
          )}
        </BlockStack>
      </BlockStack>
    </Card>
  )
}
