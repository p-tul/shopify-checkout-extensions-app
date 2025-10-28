import { extension } from "@shopify/ui-extensions/checkout"
import { getShopifyFormattedAddress, getValidateUrl } from "../../../common/validation"

export default extension("purchase.address-autocomplete.suggest", async ({ signal, target }) => {
  const { value, selectedCountryCode } = target

  // 2. Fetch address suggestions
  const response = await fetch(getValidateUrl("autocompleteAddress"), {
    signal,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        country: selectedCountryCode || "NZ",
        input: value || "",
      },
    }),
  })

  const { data } = await response.json()
  const suggestions = data.map(suggestion => {
    const attrs = suggestion?.attributes
    const label = [attrs?.addressLine, attrs?.locality, attrs?.state, attrs?.postcode]?.filter(item => !!item?.length)?.join(", ")

    return {
      id: suggestion.id,
      label,
      formattedAddress: getShopifyFormattedAddress(suggestion, selectedCountryCode),
    }
  })

  return {
    suggestions: suggestions.slice(0, 5),
  }
})
