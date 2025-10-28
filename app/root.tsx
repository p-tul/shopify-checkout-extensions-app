import { GET_SHOP_QUERY } from "@app/graphql/queries/shop"
import shopify from "@app/shopify.server"
import { json, LoaderFunctionArgs } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"

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
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
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
