import type { CartDeliveryOption, FunctionRunResult, Operation, ProductVariant, RunInput } from "../generated/api"
import { ShippingRateHidingLineItemPropertyOperator, ShippingRateHidingTargetType } from "@root/types/Delivery"

type Configuration = {
  targetType?: ShippingRateHidingTargetType
  lineItemPropertyKey?: string
  lineItemPropertyOperator?: ShippingRateHidingLineItemPropertyOperator
  lineItemPropertyValue?: string
  rateKeywordsToHide?: string[]
}

const getHideOperation = (option: { handle: CartDeliveryOption["handle"] }) => {
  return {
    hide: {
      deliveryOptionHandle: option.handle
    }
  }
}

export function run(input: RunInput): FunctionRunResult {
  const configuration: Configuration = JSON.parse(input?.deliveryCustomization?.metafield?.value ?? "{}")

  const operationMap: { [key: string]: Operation } = {}
  for (const group of input.cart.deliveryGroups) {
    for (const option of group.deliveryOptions) {
      // Not a rate to hide
      if (!option.code || !configuration.rateKeywordsToHide?.some(rate => option.code?.toLowerCase().includes(rate))) {
        continue
      }

      // Already processed option
      if (operationMap[option.handle]) {
        continue
      }

      switch (configuration.targetType) {
        case "product-tag": {
          if (input?.cart?.lines?.some(line => (line.merchandise as ProductVariant)?.product?.hasTargetTag)) {
            operationMap[option.handle] = getHideOperation(option)
          }
          break
        }
        case "line-item-property": {
          switch (configuration.lineItemPropertyOperator) {
            case "exists":
              if (input?.cart?.lines?.some(line => !!line.attribute?.value)) {
                operationMap[option.handle] = getHideOperation(option)
              }
              break
            case "equals":
              console.log(input?.cart?.lines?.some(line => line.attribute?.value === configuration.lineItemPropertyValue))
              console.log(configuration.lineItemPropertyValue)
              if (input?.cart?.lines?.some(line => line.attribute?.value === configuration.lineItemPropertyValue)) {
                operationMap[option.handle] = getHideOperation(option)
              }
              break
          }
          break
        }
      }
    }
  }

  return {
    operations: Object.values(operationMap)
  }
}
