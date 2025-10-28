import type { FunctionRunResult, Operation, ProductVariant, RunInput } from "../generated/api"

const NO_CHANGES: FunctionRunResult = {
  operations: []
}

type Configuration = {
  paymentMethods?: string[]
  productIds?: string[]
}

export function run(input: RunInput): FunctionRunResult {
  const configuration: Configuration = JSON.parse(input?.paymentCustomization?.metafield?.value ?? "{}")

  const shouldHidePaymentMethods = input?.cart?.lines?.some(line =>
    configuration.productIds?.includes((line?.merchandise as ProductVariant)?.product?.id)
  )
  if (!shouldHidePaymentMethods) {
    return NO_CHANGES
  }

  const operations: Operation[] = []
  for (const paymentMethod of input.paymentMethods) {
    if (configuration.paymentMethods?.includes(paymentMethod.name?.toLowerCase())) {
      operations.push({
        hide: {
          paymentMethodId: paymentMethod.id,
        }
      })
    }
  }

  return { operations }
}
