export const GET_PAYMENT_CUSTOMIZATION_QUERY = `#graphql
query paymentCustomization($id: ID!) {
  paymentCustomization(id: $id) {
    title
    metafields(first: 1) {
      edges {
        node {
          key
          value
          id
        }
      }
    }
  }
}
`
