import { Box, Button, InlineStack, TextField } from "@shopify/polaris"
import React from "react"
import { SplitShippingDiscount } from "@root/types/Discount"
import { CurrencyField } from "@shopify/discount-app-components"
import { CurrencyCode } from "@shopify/react-i18n"
import { XIcon } from "@shopify/polaris-icons"

type Props = {
  item: SplitShippingDiscount
  onShippingRateNameChange: (value: string) => void
  onOriginalPriceChange: (value: string) => void
  onDelete: () => void
}

export const SplitShippingDiscountItem: React.FC<Props> = ({ item, onShippingRateNameChange, onOriginalPriceChange, onDelete }) => {
  return (
    <InlineStack wrap={false} gap="200">
      <Box width="70%">
        <TextField
          label="Shipping rate name"
          labelHidden
          placeholder="Shipping rate name e.g. standard"
          autoComplete="off"
          requiredIndicator
          value={item.shippingRateName || ""}
          onChange={value => onShippingRateNameChange(value)}
        />
      </Box>
      <Box width="25%">
        <CurrencyField
          label="Original price"
          labelHidden
          currencyCode={CurrencyCode.Aud}
          min={0}
          positiveOnly
          requiredIndicator
          value={item.originalPrice?.toString() || ""}
          onChange={value => onOriginalPriceChange(value)}
        />
      </Box>
      <Box width="5%">
        <InlineStack align="end">
          <Button icon={XIcon} onClick={onDelete} />
        </InlineStack>
      </Box>
    </InlineStack>
  )
}
