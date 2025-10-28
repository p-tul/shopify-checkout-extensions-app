import { useLocales } from "@app/locales"

import { Banner as PolarisBanner, Layout, List } from "@shopify/polaris"

type Props = {
  success: string
  errors: string[]
}

export const Banner: React.FC<Props> = ({ success, errors }) => {
  const locales = useLocales()
  return errors.length > 0 ? (
    <Layout.Section>
      <PolarisBanner
        tone="critical"
        title={
          errors.length === 1
            ? locales.general.validation.error
            : locales.general.validation.errors.replace(
                "{count}",
                errors.length.toString(),
              )
        }
      >
        <List type="bullet">
          {errors.map((error) => (
            <List.Item key={error}>{error}</List.Item>
          ))}
        </List>
      </PolarisBanner>
    </Layout.Section>
  ) : success ? (
    <Layout.Section>
      <PolarisBanner tone="success" title={success} />
    </Layout.Section>
  ) : null
}
