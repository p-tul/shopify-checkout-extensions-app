export const CREATE_DELIVERY_CUSTOMIZATION_MUTATION = `#graphql
mutation deliveryCustomizationCreate($customization: DeliveryCustomizationInput!) {
  deliveryCustomizationCreate(deliveryCustomization: $customization) {
    deliveryCustomization {
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

export const UPDATE_DELIVERY_CUSTOMIZATION_MUTATION = `#graphql
mutation deliveryCustomizationUpdate($customization: DeliveryCustomizationInput!, $id: ID!) {
  deliveryCustomizationUpdate(deliveryCustomization: $customization, id: $id) {
    userErrors {
      code
      message
      field
    }
  }
}
`
