import type { FunctionRunResult, RunInput } from "../generated/api"

const NO_CHANGES: FunctionRunResult = {
  operations: [],
};

/**
 * Check if DST is in effect in VIC based on the date
 */
const isDst = (date: Date) => {
  const month = date.getMonth() + 1

  // Definite DST months
  if (month <= 3 || month >= 11) {
    return true
  }

  // Definite non-DST months
  if (month > 4 && month < 10) {
    return false
  }

  const dayOfMonth = date.getDate()
  const dayOfWeek = date.getDay()

  switch (month) {
    case 4:
      // DST ends first Sunday of April
      return !(dayOfMonth >= 7 || dayOfMonth > dayOfWeek)
    case 10:
      // DST starts first Sunday of October
      return dayOfMonth >= 7 || dayOfMonth > dayOfWeek
  }

  return false
}

/**
 * Checks the customer state and determines whether Uber should be enabled
 * based on offsets applied to VIC local time.
 */
const isUberEnabled = (input: RunInput) => {
  const state = input?.cart?.deliveryGroups?.[0]?.deliveryAddress?.provinceCode
  const dst = isDst(new Date(input?.shop?.localTime?.date))

  switch (state) {
    case "VIC":
    case "NSW":
    case "TAS":
      return input?.shop?.localTime?.uberEnabledVICNSWTAS
    case "SA":
      return input?.shop?.localTime?.uberEnabledSA
    case "QLD":
      return dst ? input?.shop?.localTime?.uberEnabledQLDDST : input?.shop?.localTime?.uberEnabledQLD
    case "WA":
      return dst ? input?.shop?.localTime?.uberEnabledWADST : input?.shop?.localTime?.uberEnabledWA
  }

  return false
}

export function run(input: RunInput): FunctionRunResult {
  // Get delivery groups from cart
  const deliveryGroups = input?.cart?.deliveryGroups ?? [];

  // Create operations to hide delivery options containing 'uber'
  let operations: any = [];
  if (!isUberEnabled(input)) {
    operations = deliveryGroups.flatMap((group) =>
      (group.deliveryOptions ?? [])
        .filter((option) => option.description?.toLowerCase().includes("uber"))
        .map((option) => ({
          hide: {
            deliveryOptionHandle: option.handle,
          },
        })),
    );
  }

  // Return operations if we found any options to hide
  return operations.length > 0 ? { operations } : NO_CHANGES;
}
