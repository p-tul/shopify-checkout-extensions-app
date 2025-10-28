import type { DiscountStatus } from "@shopify/discount-app-components"

export type Discount = {
  data?: {
    automaticDiscountNode: {
      automaticDiscount: AutomaticDiscount
      metafields: {
        edges: {
          node: DiscountMetafield
        }[]
      }
    }
  }
}

export type AutomaticDiscount = DiscountActiveDate & {
  id: string
  title: string
  combinesWith: DiscountCombination
  startsAt: string
  endsAt: string | null
  discountStatus: DiscountStatus
  asyncUsageCount: number
}

export type DiscountActiveDate = {
  startsAt: string | null
  endsAt: string | null
}

export type DiscountCombination = {
  orderDiscounts: boolean
  productDiscounts: boolean
  shippingDiscounts: boolean
}

export type DiscountMetafield = {
  key: string
  id: string
  value: string
}

export type DiscountEligibilityType = "all" | "whitelist-tags" | "blacklist-tags" | "whitelist-resource"

export type DiscountEligibility = {
  type: DiscountEligibilityType
  whitelistTags: string[]
  blacklistTags: string[]
  whitelistResources?: BaseResource[]
  whitelistResourceIds?: string[]
}

export type SplitShippingDiscount = {
  shippingRateName: string
  originalPrice: number
}

export type FreeShippingEligibility = {
  customerEligibility: DiscountEligibility
  loggedIn: boolean
  shippingRateKeywords: string[]
}

export type AmountOffType = "percentage" | "fixed-amount"

export type AmountOff = {
  type: AmountOffType
  value: number
}

export type BaseResource = { id: string }
export type ItemResource = { image: string; title: string } & BaseResource
