export const CREATE_DISCOUNT_MUTATION = `#graphql
mutation CreateAutomaticDiscount($discount: DiscountAutomaticAppInput!) {
  discountCreate: discountAutomaticAppCreate(automaticAppDiscount: $discount) {
    automaticAppDiscount {
      discountId
    }
    userErrors {
      message
      field
    }
  }
}
`

export const DELETE_DISCOUNT_MUTATION = `#graphql
mutation discountAutomaticDelete($id: ID!) {
  discountDelete: discountAutomaticDelete(id: $id) {
    userErrors {
      message
      field
    }
  }
}
`

export const UPDATE_DISCOUNT_MUTATION = `#graphql
mutation UpdateAutomaticDiscount($discount: DiscountAutomaticAppInput!, $id: ID!) {
  discountUpdate: discountAutomaticAppUpdate(automaticAppDiscount: $discount, id: $id) {
    userErrors {
      message
      field
    }
  }
}
`
