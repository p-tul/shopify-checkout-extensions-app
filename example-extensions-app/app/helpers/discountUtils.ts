export const baseCustomerDiscountMetafields = () => {
  return {
    customerEligibilityType: "all",
    customerEligibilityWhitelistTags: [],
    customerEligibilityBlacklistTags: [],
    loggedIn: false,
    staff: false,
  }
}
export const baseProductDiscountMetafields = () => {
  return {
    productEligibilityType: "all",
    productEligibilityWhitelistTags: [],
    productEligibilityBlacklistTags: [],
    productEligibilityWhitelistResources: [],
    productEligibilityWhitelistResourceIds: [],
    fullPriceOnly: true,
  }
}
export const baseDiscountMetafields = () => {
  return {
    ...baseCustomerDiscountMetafields,
    ...baseProductDiscountMetafields,
  }
}

export const getBaseCustomerDiscountSubmitConfiguration = (form: any) => {
  return {
    customerEligibilityType: form.configuration.customerEligibility.type,
    customerEligibilityWhitelistTags: form.configuration.customerEligibility.whitelistTags,
    customerEligibilityBlacklistTags: form.configuration.customerEligibility.blacklistTags,
    loggedIn: form.configuration.loggedIn,
    staff: form.configuration.staff,
  }
}
export const getBaseProductDiscountSubmitConfiguration = (form: any) => {
  return {
    productEligibilityType: form.configuration.productEligibility.type,
    productEligibilityWhitelistTags: form.configuration.productEligibility.whitelistTags,
    productEligibilityBlacklistTags: form.configuration.productEligibility.blacklistTags,
    productEligibilityWhitelistResources: form.configuration.productEligibility.whitelistResources,
    productEligibilityWhitelistResourceIds: form.configuration.productEligibility.whitelistResourceIds,
    fullPriceOnly: form.configuration.fullPriceOnly,
  }
}
export const getBaseDiscountSubmitConfiguration = (form: any) => {
  return {
    ...getBaseCustomerDiscountSubmitConfiguration(form),
    ...getBaseProductDiscountSubmitConfiguration(form),
  }
}

export const hasBaseCustomerConfigurationChanges = (configuration: any, metafield: any) => {
  return configuration.customerEligibility.value.type !== metafield.customerEligibilityType ||
    JSON.stringify(configuration.customerEligibility.value.whitelistTags) !== JSON.stringify(metafield.customerEligibilityWhitelistTags) ||
    JSON.stringify(configuration.customerEligibility.value.blacklistTags) !== JSON.stringify(metafield.customerEligibilityBlacklistTags) ||
    configuration.loggedIn.value !== metafield.loggedIn ||
    configuration.staff.value !== metafield.staff
}
export const hasBaseProductConfigurationChanges = (configuration: any, metafield: any) => {
  return configuration.productEligibility.value.type !== metafield.productEligibilityType ||
    JSON.stringify(configuration.productEligibility.value.whitelistTags) !== JSON.stringify(metafield.productEligibilityWhitelistTags) ||
    JSON.stringify(configuration.productEligibility.value.blacklistTags) !== JSON.stringify(metafield.productEligibilityBlacklistTags) ||
    JSON.stringify(configuration.productEligibility.value.whitelistResourceIds) !== JSON.stringify(metafield.productEligibilityWhitelistResourceIds) ||
    configuration.fullPriceOnly.value !== metafield.fullPriceOnly
}
export const hasBaseConfigurationChanges = (configuration: any, metafield: any) => {
  return hasBaseCustomerConfigurationChanges(configuration, metafield) ||
    hasBaseProductConfigurationChanges(configuration, metafield)
}
