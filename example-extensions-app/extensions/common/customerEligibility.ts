import { DiscountEligibilityType } from "@root/types/Discount"

export type CustomerEligibilityConfiguration = {
  customerEligibilityType: DiscountEligibilityType
  productEligibilityType: DiscountEligibilityType
  loggedIn: boolean
  staff: boolean
}

export const checkCustomerEligibility = (input: any, configuration: CustomerEligibilityConfiguration) => {
  const customer = input.cart.buyerIdentity?.customer

  if (configuration.customerEligibilityType === "whitelist-tags" && !customer?.inWhitelist) {
    return false
  }
  if (configuration.customerEligibilityType === "blacklist-tags" && customer?.inBlacklist) {
    return false
  }

  // TODO Create mechanism to check email consent status
  if (configuration.loggedIn && !input.cart.buyerIdentity?.isAuthenticated) {
    return false
  }

  if (configuration.staff) {
    const isStaff = customer?.staff && customer?.email?.includes("@decjuba")
    if (!isStaff) {
      return false
    }
  }

  return true
}
