import { BlockStack, Box, Card, InlineGrid, Select, Text, TextField } from "@shopify/polaris"
import { Field } from "@shopify/react-form"
import { Form } from "@remix-run/react"
import { TagInput } from "@app/Components/Discounts/TagInput"
import React from "react"
import { ShippingRateHidingLineItemPropertyOperator, ShippingRateHidingTargetType } from "@root/types/Delivery"

type Props = {
  targetTypeField: Field<ShippingRateHidingTargetType>
  productTagsField: Field<string[]>
  lineItemPropertyKeyField: Field<string>
  lineItemPropertyOperatorField: Field<ShippingRateHidingLineItemPropertyOperator>
  lineItemPropertyValueField: Field<string>
}

export const ShippingRateHidingTargetCard: React.FC<Props> = ({
  targetTypeField,
  productTagsField,
  lineItemPropertyKeyField,
  lineItemPropertyOperatorField,
  lineItemPropertyValueField,
}) => {
  const handleTagAdd = (toAdd: string) => {
    const newTag = toAdd.trim().toLowerCase()
    if (!productTagsField.value.includes(newTag)) {
      productTagsField.onChange(productTagsField.value.concat([newTag]))
    }
  }

  const handleTagRemove = (toRemove: string) => {
    productTagsField.onChange(productTagsField.value.filter(tag => tag !== toRemove))
  }

  return (
    <Card>
      <Form>
        <BlockStack align="space-around" gap="400">
          <Text variant="headingMd" as="h2">
            Targets
          </Text>
          <Box maxWidth="200px">
            <Select
              label="Discount type"
              labelHidden
              options={[
                {label: "Any product tag", value: "product-tag"},
                {label: "Line item property", value: "line-item-property"},
              ]}
              onChange={value => targetTypeField.onChange(value as ShippingRateHidingTargetType)}
              value={targetTypeField.value}
            />
          </Box>

          {targetTypeField.value === "product-tag" ? (
            <Box maxWidth="500px">
              <TagInput
                tags={productTagsField.value}
                onTagAdd={handleTagAdd}
                onTagRemove={handleTagRemove}
              />
            </Box>
          ) : targetTypeField.value === "line-item-property" ? (
            <Box maxWidth="500px" paddingBlockEnd="200">
              <InlineGrid columns="200px 100px 200px" gap="200">
                <TextField
                  {...lineItemPropertyKeyField}
                  label="Key"
                  labelHidden
                  placeholder="Key"
                  autoComplete="off"
                />
                <Select
                  label="Operator"
                  labelHidden
                  options={[
                    {label: "Exists", value: "exists"},
                    {label: "=", value: "equals"},
                  ]}
                  onChange={value => lineItemPropertyOperatorField.onChange(value as ShippingRateHidingLineItemPropertyOperator)}
                  value={lineItemPropertyOperatorField.value}
                />
                {lineItemPropertyOperatorField.value === "equals" && (
                  <TextField
                    {...lineItemPropertyValueField}
                    label="Value"
                    labelHidden
                    placeholder="Value"
                    autoComplete="off"
                  />
                )}
              </InlineGrid>
            </Box>
          ) : null}
        </BlockStack>
      </Form>
    </Card>
  )
}
