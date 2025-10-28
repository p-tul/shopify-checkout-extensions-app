import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  BlockStack,
  Button,
  InlineStack,
  reactExtension,
  Text,
  useApplyShippingAddressChange,
  useShippingAddress,
  View,
} from "@shopify/ui-extensions-react/checkout"
import { getValidateUrl, provinceCodeToName, provinceNameToCode, zipToProvinceCode } from "../../../common/validation"

export default reactExtension("purchase.checkout.delivery-address.render-before", () => <Extension />)

export const useDebounce = (effect: any, delay: number, deps: Array<any>) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callback = useCallback(effect, deps)

  useEffect(() => {
    const handler = setTimeout(() => {
      callback()
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [callback, delay])
}

const Extension = () => {
  const shippingAddress = useShippingAddress()
  const applyShippingAddressChange = useApplyShippingAddressChange()
  const lastJsonAddressRef = useRef(null)
  const [validation, setValidation] = useState(null)
  const [addressConfirmed, setAddressConfirmed] = useState(false)

  const attributes = useMemo(() => validation?.data?.[0]?.attributes, [validation?.data])
  const suggestion = useMemo(() => {
    const result = attributes?.suggestions?.[0]
    if (result?.updatedAttributes?.rdNumber) {
      result.updatedAttributes.address2 = result.updatedAttributes.rdNumber
    }

    if (result?.updatedAttributes?.province) {
      result.updatedAttributes.provinceCode = provinceNameToCode(result?.updatedAttributes?.province)
      delete result?.updatedAttributes?.province
    }
    return result
  }, [attributes?.suggestions])

  const isAddressValid = useMemo(() => {
    const data = validation?.data
    if (!data?.length) {
      return true
    }

    if (!suggestion) {
      return false
    }

    const updatedAttrs = suggestion?.updatedAttributes
    if (!updatedAttrs) {
      return false
    }

    for (const key in updatedAttrs) {
      switch (key) {
        case "city":
          if (updatedAttrs?.city?.length && shippingAddress?.city !== updatedAttrs?.city) {
            return false
          }
          break
        case "provinceCode":
          if (zipToProvinceCode(Number(shippingAddress?.zip)) !== shippingAddress?.provinceCode) {
            return false
          }
          break
        default:
          if (updatedAttrs?.[key]?.toUpperCase() !== shippingAddress?.[key]?.toUpperCase()) {
            return false
          }
          break
      }
    }

    return true
  }, [shippingAddress, suggestion, validation?.data])
  const addressValidationHandled = useMemo(() => isAddressValid || addressConfirmed, [addressConfirmed, isAddressValid])

  const confirmAddress = useCallback(() => {
    setAddressConfirmed(true)
  }, [])

  const useSuggestedAddress = useCallback(() => {
    applyShippingAddressChange({
      type: "updateShippingAddress",
      address: suggestion?.updatedAttributes,
    })
    confirmAddress()
  }, [applyShippingAddressChange, confirmAddress, suggestion?.updatedAttributes])

  useDebounce(
    () => {
      const validateAddress = async () => {
        try {
          if (!shippingAddress) {
            return
          }

          const newLastJsonAddress = JSON.stringify(shippingAddress)
          if (newLastJsonAddress === lastJsonAddressRef.current) {
            return
          }

          lastJsonAddressRef.current = newLastJsonAddress

          setValidation(null)
          setAddressConfirmed(false)

          const validateRes = await fetch(getValidateUrl("validate"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: {
                address1: shippingAddress.address1 || "",
                address2: shippingAddress.address2 || "",
                addressId: "",
                city: shippingAddress.city || "",
                company: shippingAddress.company || "",
                country: shippingAddress.countryCode || "",
                firstName: shippingAddress.firstName || "",
                lastName: shippingAddress.lastName || "",
                phone: shippingAddress.phone || "",
                province: provinceCodeToName(shippingAddress.provinceCode) || "",
                zip: shippingAddress.zip || "",
              },
            }),
          })

          if (newLastJsonAddress === lastJsonAddressRef.current) {
            setValidation(await validateRes.json())
          }
        } catch (error) {
          console.error("Error validating address", error)
        }
      }

      validateAddress()

      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    200,
    [shippingAddress]
  )

  return !addressValidationHandled ? (
    <View border="base" padding="base">
      <BlockStack>
        <Text size="large">Confirm address</Text>
        <BlockStack spacing="none">
          <Text size="base">{attributes?.title}</Text>
          <Text size="base" emphasis="bold">
            {suggestion?.updatedValue}
          </Text>
        </BlockStack>
        <InlineStack>
          {suggestion ? (
            <>
              <Button onPress={useSuggestedAddress}>{attributes?.actionLabelUpdate}</Button>
              <Button kind="secondary" onPress={confirmAddress}>
                {attributes?.actionLabelIgnore}
              </Button>
            </>
          ) : (
            <Button onPress={confirmAddress}>Confirm</Button>
          )}
        </InlineStack>
      </BlockStack>
    </View>
  ) : null
}
