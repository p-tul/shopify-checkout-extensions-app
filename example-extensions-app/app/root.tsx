import type { LoaderFunctionArgs } from "@remix-run/node"
import shopify from "@app/shopify.server"
import { json, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react"
import { GET_SHOP_QUERY } from "./graphql/queries/shop"

export type RootLoaderData = {
  shop: {
    myshopifyDomain: string
    primaryDomain: {
      localization: {
        defaultLocale: string
      }
    }
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await shopify.authenticate.admin(request)

  const response = await admin.graphql(GET_SHOP_QUERY)

  const shopResponse: any = await response.json()

  if (!shopResponse.data?.shop)
    throw new Response(null, {
      status: 404,
      statusText: "Shop data not found",
    })

  const { shop } = shopResponse.data

  return json({
    shop,
  })
}

export default function App() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <LiveReload />
        <Scripts />
      </body>
    </html>
  )
}
