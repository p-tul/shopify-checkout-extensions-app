export const GET_SHOP_QUERY = `#graphql
  query GetShop {
    shop {
      myshopifyDomain
      primaryDomain {
        localization {
          defaultLocale
        }
      }
    }
  }
`
