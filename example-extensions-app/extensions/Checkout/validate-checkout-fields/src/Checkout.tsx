import { reactExtension, useBuyerJourneyIntercept, useShippingAddress } from "@shopify/ui-extensions-react/checkout"
import type { InterceptorRequest } from "@shopify/ui-extensions/checkout"

export default reactExtension("purchase.checkout.delivery-address.render-before", () => <Extension />)

const ALLOWED_CHARS = /^[a-zA-Z0-9/ \-()]+$/

function Extension() {
  const address = useShippingAddress()

  const createError = ({ message, target }) => ({
    behavior: "block",
    reason: "Special Characters aren't allowed",
    errors: [
      {
        message,
        target,
      },
    ],
  })

  const output = ({ errorCondition, message, target }) =>
    (errorCondition ? createError({ message, target }) : { behavior: "allow" }) as InterceptorRequest

  useBuyerJourneyIntercept(({ canBlockProgress }) =>
    output({
      errorCondition: canBlockProgress && address?.address1 && !ALLOWED_CHARS.test(address?.address1),
      message: "Address cannot contain special characters.",
      target: "$.cart.deliveryGroups[0].deliveryAddress.address1",
    })
  )
  useBuyerJourneyIntercept(({ canBlockProgress }) =>
    output({
      errorCondition: canBlockProgress && address?.address2 && !ALLOWED_CHARS.test(address?.address2),
      message: "Address cannot contain special characters.",
      target: "$.cart.deliveryGroups[0].deliveryAddress.address2",
    })
  )
  useBuyerJourneyIntercept(({ canBlockProgress }) =>
    output({
      errorCondition: canBlockProgress && address?.city && !ALLOWED_CHARS.test(address?.city),
      message: "City cannot contain special characters.",
      target: "$.cart.deliveryGroups[0].deliveryAddress.city",
    })
  )
  useBuyerJourneyIntercept(({ canBlockProgress }) =>
    output({
      errorCondition: canBlockProgress && address?.firstName && !ALLOWED_CHARS.test(address?.firstName),
      message: "Name cannot contain special characters.",
      target: "$.cart.deliveryGroups[0].deliveryAddress.firstName",
    })
  )
  useBuyerJourneyIntercept(({ canBlockProgress }) =>
    output({
      errorCondition: canBlockProgress && address?.lastName && !ALLOWED_CHARS.test(address?.lastName),
      message: "Name cannot contain special characters.",
      target: "$.cart.deliveryGroups[0].deliveryAddress.lastName",
    })
  )

  return null
}
