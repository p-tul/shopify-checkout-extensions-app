import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react"
import { AppProvider as DiscountsProvider } from "@shopify/discount-app-components"
import { AppProvider as PolarisAppProvider } from "@shopify/polaris"
import { AppProvider } from "@shopify/shopify-app-remix/react"
import enPolarisTranslations from "@shopify/polaris/locales/en.json"
import { boundary } from "@shopify/shopify-app-remix/server"
import { authenticate } from "../shopify.server"

import config from "@root/config"
import "@shopify/polaris/build/esm/styles.css"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" })
}

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>()

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <PolarisAppProvider i18n={enPolarisTranslations}>
        <DiscountsProvider locale={config.shop.locale} ianaTimezone={config.shop.timezone}>
          <ui-nav-menu>
            <Link to="/app" rel="home">
              Home
            </Link>
            <Link to="/app/branding">Branding</Link>
            <Link to="/app/discount-stacking">Discount Stacking</Link>
          </ui-nav-menu>
          <Outlet />
        </DiscountsProvider>
      </PolarisAppProvider>
    </AppProvider>
  )
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError())
}

export const headers: HeadersFunction = headersArgs => {
  return boundary.headers(headersArgs)
}
