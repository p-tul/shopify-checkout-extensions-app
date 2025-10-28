import type { FunctionRunResult, Operation, RunInput } from "../generated/api"

type Configuration = {
  metroRateName?: string
  metroRateCheckoutName?: string
  rateToHide?: string
  postcodes?: string[]
}

export function run(input: RunInput): FunctionRunResult {
  const configuration: Configuration = JSON.parse(input?.deliveryCustomization?.metafield?.value ?? "{}")
  const deliveryGroups = input?.cart?.deliveryGroups || []
  const deliveryPostcode = input?.cart?.deliveryGroups?.[0]?.deliveryAddress?.zip

  // Check if Metro is active based on delivery postcode
  const metroActive = !!deliveryPostcode && configuration.postcodes?.includes(deliveryPostcode)

  const operationMap: { [key: string]: Operation } = {}
  for (const group of deliveryGroups) {
    for (const option of group.deliveryOptions) {
      // Already processed
      if (operationMap[option.handle]) {
        continue
      }

      const isMetro = !!option.code && option.code?.toLowerCase() === configuration.metroRateName?.toLowerCase()
      const isRateToHide = !!option.code && option.code?.toLowerCase() === configuration.rateToHide?.toLowerCase()

      if (isMetro) {
        if (!metroActive) {
          operationMap[option.handle] = {
            hide: {
              deliveryOptionHandle: option.handle,
            }
          }
        }
        if (!!configuration.metroRateCheckoutName) {
          operationMap[`${option.handle}-rename`] = {
            rename: {
              deliveryOptionHandle: option.handle,
              title: configuration.metroRateCheckoutName,
            }
          }
        }
      }

      if (isRateToHide && metroActive) {
        operationMap[option.handle] = {
          hide: {
            deliveryOptionHandle: option.handle,
          }
        }
      }
    }
  }

  return { operations: Object.values(operationMap) }
}
