import { BlockStack, Box, Button, InlineStack, Text } from "@shopify/polaris"
import { Field } from "@shopify/react-form"
import React, { useCallback } from "react"
import { SplitShippingDiscount } from "@root/types/Discount"
import { SplitShippingDiscountItem } from "@app/Components/Discounts/SplitShippingDiscountItem"

type Props = {
  field: Field<SplitShippingDiscount[]>
}

export const SplitShippingDiscountItems: React.FC<Props> = ({ field }) => {
  const handleDefinitionAdd = useCallback(() => {
    field.onChange(field.value.concat({ shippingRateName: "", originalPrice: 0 }))
  }, [field])

  const handleShippingRateNameChange = useCallback((value: string, index: number) => {
    field.onChange([
      ...(field.value?.map((field, i) =>
        i === index
          ? {
            ...field,
            shippingRateName: value
          }
          : { ...field }
      ) || [])
    ])
  }, [field])

  const handleOriginalPriceChange = useCallback((value: string, index: number) => {
    field.onChange([
      ...(field.value?.map((field, i) =>
        i === index
          ? {
            ...field,
            originalPrice: Number(value)
          }
          : { ...field }
      ) || [])
    ])
  }, [field])

  const handleDelete = useCallback((indexToRemove: number) => {
    field.onChange(field.value.filter((_, index) => index !== indexToRemove))
  }, [field])

  return (
    <BlockStack gap="100">
      <BlockStack gap="400">
        {field.value.map((item, index) => (
          <SplitShippingDiscountItem
            key={index}
            item={item}
            onShippingRateNameChange={(value) => handleShippingRateNameChange(value, index)}
            onOriginalPriceChange={(value) => handleOriginalPriceChange(value, index)}
            onDelete={() => handleDelete(index)}
          />
        ))}
      </BlockStack>
      <BlockStack gap="400">
        {field.value.length > 0 && (
          <InlineStack wrap={false} gap="200">
            <Box width="70%">
              <Text as="p" tone="subdued">
                Case insensitive
              </Text>
            </Box>
            <Box width="25%">
              <Text as="p" tone="subdued">
                Original price of rate
              </Text>
            </Box>
            <Box width="5%" />
          </InlineStack>
        )}
        <Button onClick={handleDefinitionAdd}>
          Add definition
        </Button>
      </BlockStack>
    </BlockStack>
  )
}
