import React from "react"
import { TagInput } from "@app/Components/Discounts/TagInput"
import { Form } from "@remix-run/react"

import { BlockStack, Box, Card, Text } from "@shopify/polaris"
import { Field } from "@shopify/react-form"

type Props = {
  rateKeywordsToHideField: Field<string[]>
}

export const ShippingRateHidingRatesCard: React.FC<Props> = ({
  rateKeywordsToHideField,
}) => {
  const handleTagAdd = (toAdd: string) => {
    const newTag = toAdd.trim().toLowerCase()
    if (!rateKeywordsToHideField.value.includes(newTag)) {
      rateKeywordsToHideField.onChange(
        rateKeywordsToHideField.value.concat([newTag]),
      )
    }
  }

  const handleTagRemove = (toRemove: string) => {
    rateKeywordsToHideField.onChange(
      rateKeywordsToHideField.value.filter((tag) => tag !== toRemove),
    )
  }

  return (
    <Card>
      <Form>
        <BlockStack align="space-around" gap="400">
          <BlockStack gap="100">
            <Text variant="headingMd" as="h2">
              Shipping Rates to Hide
            </Text>
            <Text as="p">
              These rates will be hidden when the above targets are satisfied.
            </Text>
            <Text as="p">
              Shipping rate keywords are case insensitive and match shipping
              rates which contain the keyword e.g. "standard" matches a rate
              named "Standard Shipping".
            </Text>
          </BlockStack>
          <Box maxWidth="500px">
            <TagInput
              placeholder="Use comma to complete a keyword"
              tags={rateKeywordsToHideField.value}
              onTagAdd={handleTagAdd}
              onTagRemove={handleTagRemove}
            />
          </Box>
        </BlockStack>
      </Form>
    </Card>
  )
}
