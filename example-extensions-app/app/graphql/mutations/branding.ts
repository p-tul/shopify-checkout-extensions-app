export const BRANDING_UPDATE_MUTATION = `#graphql
  mutation checkoutBrandingUpsert($checkoutBrandingInput: CheckoutBrandingInput!, $checkoutProfileId: ID!) {
    checkoutBrandingUpsert(checkoutBrandingInput: $checkoutBrandingInput, checkoutProfileId: $checkoutProfileId) {
      checkoutBranding {
        designSystem {
          typography {
            primary {
              base {
                sources
              }
              bold {
                sources
              }
              loadingStrategy
            }
            secondary {
              base {
                sources
              }
              bold {
                sources
              }
              loadingStrategy
            }
          }
          colors {
            global {
              accent
              info
              warning
              brand
            }
          },
          cornerRadius {
            base
          }
        },
        customizations {
          global {
            typography {
              kerning
            }
          }
          textField {
            typography {
              kerning
            }
          }
          header {
            padding,
            banner {
              image {
                id
              }
            }
            logo {
              image {
                id
              }
            }
            position
            alignment
          }
          headingLevel1 {
            typography {
              size
            }
          }
          primaryButton {
            cornerRadius
            blockPadding
          }
        }
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`
