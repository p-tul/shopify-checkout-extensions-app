import { BlockStack, Card, FormLayout, Text } from "@shopify/polaris"
import React from "react"
import { Field } from "@shopify/react-form"
import { TagInput } from "@app/Components/Discounts/TagInput"

type Props = {
  field: Field<string[]>
}

export const FreeShippingCard: React.FC<Props> = ({ field }) => {
  const handleTagAdd = (toAdd: string) => {
    const newTag = toAdd.trim().toLowerCase()
    if (!field.value.includes(newTag)) {
      field.onChange(field.value.concat([newTag]))
    }
  }

  const handleTagRemove = (toRemove: string) => {
    field.onChange(field.value.filter(tag => tag !== toRemove))
  }

  return (
    <Card>
      <FormLayout>
        <BlockStack align="space-around" gap="400">
          <BlockStack gap="100">
            <Text variant="headingMd" as="h2">
              Shipping rate keywords
            </Text>
            <Text as="p">
              Shipping rate keywords are case insensitive and match shipping rates which contain the keyword e.g. "standard" matches a rate named "Standard Shipping".
            </Text>
          </BlockStack>
          <TagInput
            placeholder="Use comma to complete a keyword"
            tags={field.value}
            onTagAdd={handleTagAdd}
            onTagRemove={handleTagRemove}
          />
        </BlockStack>
      </FormLayout>
    </Card>
  )
}
