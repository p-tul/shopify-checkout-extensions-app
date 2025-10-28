import type { Discount, FunctionRunResult, RunInput } from "../generated/api"
import { SplitShippingDiscount } from "@root/types/Discount"

export type Configuration = {
  message?: string
  splitShippingDiscountItems?: SplitShippingDiscount[]
}

export function run(input: RunInput): FunctionRunResult {
  const configuration: Configuration = JSON.parse(input?.discountNode?.metafield?.value ?? "{}")

  const discounts: Discount[] = []

  for (const group of input.cart.deliveryGroups) {
    for (const option of group.deliveryOptions) {
      // Check whether split shipping definition exists
      const splitShippingDiscountItem = configuration.splitShippingDiscountItems?.find(item =>
        item.shippingRateName === option.code?.toLowerCase()
      )
      if (!splitShippingDiscountItem?.originalPrice) {
        continue
      }

      const shippingPrice = Number(option.cost.amount)
      if (shippingPrice > splitShippingDiscountItem.originalPrice) {
        discounts.push({
          message: configuration.message || "Split shipping discount",
          targets: [{
            deliveryOption: {
              handle: option.handle
            }
          }],
          value: {
            fixedAmount: {
              amount: shippingPrice - splitShippingDiscountItem.originalPrice
            }
          }
        })
      }
    }
  }

  return { discounts }
}
