import { useMemo } from "react"
import type { RootLoaderData } from "@app/root"
import { useRouteLoaderData } from "@remix-run/react"

enum Environment {
  DEVELOPMENT = "development",
  STAGING = "staging",
  PRODUCTION = "production",
}

const config = {
  shop: {
    domains: {
      development: "mystore-development.myshopify.com",
      staging: "mystore-staging.myshopify.com",
      production: "mystore.myshopify.com",
    },
  },
}

export const useEnvironment = () => {
  const root = useRouteLoaderData("root") as RootLoaderData

  const shopDomain = root.shop.myshopifyDomain
  const environment = useMemo(() => {
    if (!shopDomain) return Environment.PRODUCTION

    return (
      Object.entries(config.shop.domains).find(
        ([, value]) => value === shopDomain,
      )?.[0] || Environment.PRODUCTION
    )
  }, [shopDomain])

  return environment as Environment
}
