export const GET_DELIVERY_CUSTOMIZATION_QUERY = `#graphql
query deliveryCustomization($id: ID!) {
  deliveryCustomization(id: $id) {
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
