export const CREATE_PAYMENT_CUSTOMIZATION_MUTATION = `#graphql
mutation paymentCustomizationCreate($customization: PaymentCustomizationInput!) {
  paymentCustomizationCreate(paymentCustomization: $customization) {
    paymentCustomization {
      id
    }
    userErrors {
      code
      message
      field
    }
  }
}
`

export const UPDATE_PAYMENT_CUSTOMIZATION_MUTATION = `#graphql
mutation paymentCustomizationUpdate($customization: PaymentCustomizationInput!, $id: ID!) {
  paymentCustomizationUpdate(paymentCustomization: $customization, id: $id) {
    userErrors {
      code
      message
      field
    }
  }
}
`
