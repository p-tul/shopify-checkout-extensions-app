import type { Discount, FunctionRunResult, RunInput } from "../generated/api"
import { checkCustomerEligibility, CustomerEligibilityConfiguration } from "@extensions/common/customerEligibility"

export type Configuration = {
  message?: string
  shippingRateKeywords?: string[]
} & CustomerEligibilityConfiguration

const EMPTY_DISCOUNT: FunctionRunResult = {
  discounts: [],
}

export function run(input: RunInput): FunctionRunResult {
  const configuration: Configuration = JSON.parse(input?.discountNode?.metafield?.value ?? "{}")
  if (!configuration.shippingRateKeywords) {
    return EMPTY_DISCOUNT
  }

  if (!checkCustomerEligibility(input, configuration)) {
    return EMPTY_DISCOUNT
  }

  const discounts: Discount[] = []

  for (const group of input.cart.deliveryGroups) {
    for (const option of group.deliveryOptions) {
      const isFreeShipping = configuration.shippingRateKeywords.some(keyword =>
        option.code?.toLowerCase().includes(keyword)
      )
      if (isFreeShipping) {
        discounts.push({
          message: configuration.message || "Free shipping discount",
          targets: [{
            deliveryOption: {
              handle: option.handle
            }
          }],
          value: {
            percentage: {
              value: 100
            }
          }
        })
      }
    }
  }

  return { discounts }
}
