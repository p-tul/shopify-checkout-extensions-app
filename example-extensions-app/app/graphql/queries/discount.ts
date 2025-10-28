export const GET_DISCOUNT_QUERY = `#graphql
query GetDiscount($id: ID!) {
  automaticDiscountNode(id: $id) {
    metafields(first: 1) {
      edges {
        node {
          key
          value
          id
        }
      }
    }
    automaticDiscount {
      ...on DiscountAutomaticApp {
        title
        startsAt
        endsAt
        asyncUsageCount
        discountStatus: status
        combinesWith {
          orderDiscounts
          productDiscounts
          shippingDiscounts
        }
      }
    }
  }
}
`
