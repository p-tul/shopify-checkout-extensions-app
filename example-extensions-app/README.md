# DECJUBA Extensions

This is the extensions app powered by Vite, Remix and Shopify extensions API.

## Framework

This uses [Remix](https://remix.run). The following Shopify tools are also included to ease app development:

- [Shopify App Remix](https://shopify.dev/docs/api/shopify-app-remix) provides authentication and methods for interacting with Shopify APIs.
- [Shopify App Bridge](https://shopify.dev/docs/apps/tools/app-bridge) allows your app to seamlessly integrate your app within Shopify's Admin.
- [Polaris React](https://polaris.shopify.com/) is a powerful design system and component library that helps developers build high quality, consistent experiences for Shopify merchants.
- [Webhooks](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-remix#authenticating-webhook-requests): Callbacks sent by Shopify when certain events occur
- [Polaris](https://polaris.shopify.com/): Design system that enables apps to create Shopify-like experiences

## Setup

### Prerequisites

- Node
- Shopify CLI

### Local development

1. Run `pnpm i` to install project dependencies

2. Run `pnpm run dev` to start the local development server. This will connect to the development app.

## Environments

### Production

- Render hosting - [DECJUBA Extensions (production)](https://dashboard.render.com/web/srv-cr2nkbbtq21c73fbh44g)
- Shopify stores
  - https://admin.shopify.com/store/decjuba
  - https://admin.shopify.com/store/decjuba-nz
- Shopify app - [DECJUBA Functions](https://partners.shopify.com/479256/apps/83127304193/overview)
- Branch - `main`

### Staging

- Render hosting - [DECJUBA Extensions (staging)](https://dashboard.render.com/web/srv-cr2o25jtq21c73fbojcg)
- Shopify stores
  - https://admin.shopify.com/store/decjuba-au-staging
  - https://admin.shopify.com/store/decjuba-nz-dev
- Shopify app - [DECJUBA Functions (Staging)](https://partners.shopify.com/479256/apps/91506016257/overview)
- Branch - `staging`

### Development (local)

- Shopify App - [Decjuba Functions (Dev)](https://partners.shopify.com/479256/apps/93820682241/overview)

## Deployment

### Staging

Features can be deployed to staging for testing by merging the feature into the `staging` branch. CI will deploy both UI changes and extensions to the staging Shopify store for remote testing.

### Production

**(To be done by TL only)** Features can be deployed to production by merging the feature into the `main` branch. CI will deploy both UI changes and extensions to the production Shopify store.
