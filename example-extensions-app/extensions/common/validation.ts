import { HOST, POSTCODE_RANGES, PROVINCE_CODES, PROVINCE_NAMES, SHOP_NAME } from "./constants"

export const getValidateUrl = (path: "autocompleteAddress" | "retrieveAddress" | "validate") =>
  `${HOST}/${path}?shop=${SHOP_NAME}`

export const provinceNameToCode = (name: string) => PROVINCE_CODES[name]
export const provinceCodeToName = (code: string) => PROVINCE_NAMES[code]

export const zipToProvinceCode = (postcode: number) => {
  for (const province of POSTCODE_RANGES) {
    for (const range of province.ranges) {
      if (postcode >= range.start && postcode <= range.end) {
        return province.province
      }
    }
  }

  return ""
}

export const getShopifyFormattedAddress = (suggestion: any, countryCode: string) => {
  const attrs = suggestion?.attributes
  const isNZ = countryCode === "NZ"

  let data: any = {
    address1: attrs?.addressLine,
    city: attrs?.locality?.length ? attrs?.locality : attrs?.state,
    provinceCode: zipToProvinceCode(attrs?.postcode),
    zip: attrs?.postcode,
  }

  if (isNZ) {
    data = {
      ...data,
      address2: attrs?.locality,
      city: attrs?.state,
    }
  }

  return data
}
