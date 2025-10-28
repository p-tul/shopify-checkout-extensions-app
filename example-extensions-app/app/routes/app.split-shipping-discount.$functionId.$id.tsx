import React, { useEffect, useState } from "react"
import { Banner } from "@app/Components/Common/Banner"
import {
  CREATE_DISCOUNT_MUTATION,
  DELETE_DISCOUNT_MUTATION,
  UPDATE_DISCOUNT_MUTATION
} from "@app/graphql/mutations/discount"
import { GET_DISCOUNT_QUERY } from "@app/graphql/queries/discount"
import { useLocales } from "@app/locales"
import shopify from "@app/shopify.server"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useFetcher, useLoaderData } from "@remix-run/react"

import { useAppBridge } from "@shopify/app-bridge-react"
import { DiscountMethod, DiscountStatus, SummaryCard } from "@shopify/discount-app-components"
import { BlockStack, Card, FormLayout, Layout, Page, PageActions, Text } from "@shopify/polaris"
import { useField, useForm } from "@shopify/react-form"
import { createGid, extractGid } from "@app/helpers/utils"
import type { Discount, SplitShippingDiscount } from "@root/types/Discount"
import { DeleteModal } from "@app/Components/Discounts/DeleteModal"
import { SaveBar } from "@app/Components/Common/SaveBar"
import { SplitShippingDiscountItems } from "@app/Components/Discounts/SplitShippingDiscountItems"
import { TitleCard } from "@app/Components/Discounts/TitleCard"

enum ActionType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete"
}

type ActionData = {
  action: ActionType
  status: "success" | "errors"
  errors: Array<string>
}

const EXTENSION_HANDLE = "split-shipping-discount"
const METAFIELD_KEY = "function-configuration"
const DISCOUNT_ID = "reserved-split-shipping-discount"
const DELETE_MODAL_ID = "split-shipping-discount-delete-modal"

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { id } = params
  const { admin } = await shopify.authenticate.admin(request)
  const url = new URL(request.url)
  const searchParams = new URLSearchParams(url.search)

  if (!id) {
    throw new Response(null, {
      status: 404,
      statusText: "Discount ID not found"
    })
  }

  if (id === "new") {
    return json({
      id: "new",
      discount: {
        title: "",
        combinesWith: {
          orderDiscounts: true,
          productDiscounts: true,
          shippingDiscounts: true
        },
        discountStatus: DiscountStatus.Scheduled,
        asyncUsageCount: 0,
        startsAt: new Date(),
        endsAt: null
      },
      metafieldId: null,
      metafield: {
        discountId: DISCOUNT_ID,
        message: "",
        splitShippingDiscountItems: [],
      },
      successMessage: ""
    })
  }

  const gid = createGid("DiscountAutomaticNode", id)

  const response = await admin.graphql(GET_DISCOUNT_QUERY, {
    variables: {
      id: gid
    }
  })

  const discountResponse: Discount = await response.json()

  if (!discountResponse.data?.automaticDiscountNode) {
    throw new Response(null, {
      status: 404,
      statusText: "Discount node not found"
    })
  }

  if (
    !discountResponse.data.automaticDiscountNode.automaticDiscount?.title ||
    !discountResponse.data.automaticDiscountNode.metafields?.edges?.[0]?.node?.value
  ) {
    throw new Response(null, {
      status: 404,
      statusText: "Discount data not found"
    })
  }

  const discount = discountResponse.data.automaticDiscountNode.automaticDiscount
  const metafield = JSON.parse(discountResponse.data.automaticDiscountNode.metafields.edges[0].node.value)
  const metafieldId = discountResponse.data.automaticDiscountNode.metafields.edges[0].node.id
  const successMessage = searchParams.get("status") === "created" ? `${discount.title} was created succesfully` : ""

  return json({
    id: gid,
    discount,
    metafieldId,
    metafield,
    successMessage
  })
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { functionId, id } = params
  const { admin } = await shopify.authenticate.admin(request)
  const formData = await request.formData()
  const action = formData.get("action")
  const discount = formData.get("discount")

  if (!id) {
    throw new Response(null, {
      status: 404,
      statusText: "Discount ID not found"
    })
  }

  const gid = createGid("DiscountAutomaticNode", id)

  if (action === ActionType.CREATE) {
    if (typeof discount !== "string")
      return json({ errors: [{ field: "all", message: "Discount submission not valid" }] })

    const { title, combinesWith, startsAt, endsAt, configuration } = JSON.parse(discount)

    const response = await admin.graphql(CREATE_DISCOUNT_MUTATION, {
      variables: {
        discount: {
          functionId,
          title,
          combinesWith,
          startsAt: new Date(startsAt),
          endsAt: endsAt && new Date(endsAt),
          metafields: [
            {
              namespace: "$app:discount",
              key: METAFIELD_KEY,
              type: "json",
              value: JSON.stringify({ ...configuration })
            }
          ]
        }
      }
    })
    const responseJson = await response.json()
    const errors = [
      ...new Set(responseJson.data.discountCreate?.userErrors?.map(({ message }: { message: string }) => message) || [])
    ]
    const id = responseJson.data.discountCreate?.automaticAppDiscount?.discountId
    const status = errors?.length ? "errors" : "success"

    if (status === "errors") {
      return json({ status, id, errors })
    } else {
      return redirect(`/app/${EXTENSION_HANDLE}/${functionId}/${extractGid(id)}?status=created`)
    }
  } else if (action === ActionType.UPDATE) {
    if (typeof discount !== "string")
      return json({ errors: [{ field: "all", message: "Discount submission not valid" }] })

    const { title, combinesWith, configuration, startsAt, endsAt, metafieldId } = JSON.parse(discount)

    const response = await admin.graphql(UPDATE_DISCOUNT_MUTATION, {
      variables: {
        id: gid,
        discount: {
          functionId,
          title,
          combinesWith,
          startsAt: new Date(startsAt),
          endsAt: endsAt && new Date(endsAt),
          metafields: [
            {
              id: metafieldId,
              type: "json",
              value: JSON.stringify({ ...configuration })
            }
          ]
        }
      }
    })

    const responseJson = await response.json()
    const errors = [
      ...new Set(responseJson.data.discountUpdate?.userErrors?.map(({ message }: { message: string }) => message) || [])
    ]
    const status = errors?.length ? "errors" : "success"
    return json({ action, status, errors })
  } else if (action === ActionType.DELETE) {
    const response = await admin.graphql(DELETE_DISCOUNT_MUTATION, {
      variables: {
        id: gid
      }
    })

    const responseJson = await response.json()
    const errors = [
      ...new Set(responseJson.data.discountDelete?.userErrors?.map(({ message }: { message: string }) => message) || [])
    ]
    const status = errors?.length ? "errors" : "success"
    return json({ action, status, errors })
  }
}

export default function SplitShippingDiscount() {
  const { id, discount, metafield, metafieldId, successMessage } = useLoaderData<typeof loader>()
  const shopify = useAppBridge()
  const fetcher = useFetcher<ActionData>()
  const locales = useLocales()
  const isNew = id === "new"
  const isLoading = fetcher.state !== "idle"
  const [changes, setChanges] = useState<boolean>(isNew)
  const [errors, setErrors] = useState<Array<string>>([])
  const [success, setSuccess] = useState<string>(successMessage)

  useEffect(() => {
    // Reset state on transition to created discount
    setSuccess(successMessage)
    setErrors([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const titleField = useField({
    value: discount.title || locales.discounts.split_shipping_discount.new,
    validates: (value) => {
      if (value.length < 3) return locales.discounts.validation.title
    }
  })
  const messageField = useField({
    value: metafield.message || locales.discounts.split_shipping_discount.name,
    validates: (value: string) => {
      if (value.length < 3) return locales.discounts.validation.title
    }
  })

  const splitShippingDiscountItemsField = useField<SplitShippingDiscount[]>({
    value: metafield.splitShippingDiscountItems || [],
    validates: value => {
      if (!value.length) {
        return "At least 1 definition is required"
      }

      const duplicateMap: { [key: string]: boolean } = {}
      for (const item of value) {
        const name = item.shippingRateName.trim().toLowerCase()
        if (!name) {
          return "Split shipping item missing shipping rate name"
        }
        if (!item.originalPrice) {
          return "Split shipping item missing price"
        }

        if (duplicateMap[name]) {
          return "Split shipping cannot have duplicate shipping rates"
        } else {
          duplicateMap[name] = true
        }
      }
    }
  })

  const {
    fields: { discountTitle, configuration, startDate, endDate, combinesWith },
    reset,
    submit: handleSubmit,
    submitErrors
  } = useForm({
    fields: {
      discountTitle: titleField,
      combinesWith: useField({
        orderDiscounts: true,
        productDiscounts: true,
        shippingDiscounts: false
      }),
      startDate: useField(discount.startsAt),
      endDate: useField(discount.endsAt),
      configuration: {
        discountId: useField(DISCOUNT_ID),
        message: messageField,
        splitShippingDiscountItems: splitShippingDiscountItemsField,
      }
    },
    onSubmit: async (form) => {
      const discount = {
        title: form.discountTitle,
        combinesWith: form.combinesWith,
        startsAt: form.startDate,
        endsAt: form.endDate,
        metafieldId,
        configuration: {
          discountId: form.configuration.discountId,
          message: form.configuration.message,
          splitShippingDiscountItems: form.configuration.splitShippingDiscountItems
            .map(item => ({
              ...item,
              shippingRateName: item.shippingRateName.trim().toLowerCase(),
            })),
        }
      }

      fetcher.submit(
        { action: isNew ? ActionType.CREATE : ActionType.UPDATE, discount: JSON.stringify(discount) },
        { method: "post" }
      )
      return { status: "success" }
    }
  })

  const handleReset = () => {
    reset()
    setErrors([])
    setSuccess("")
  }

  const handleDelete = () => fetcher.submit({ action: ActionType.DELETE }, { method: "post" })

  useEffect(() => {
    if (fetcher.state === "submitting") {
      setErrors([])
      setSuccess("")
    }
    if (fetcher.state === "loading" && fetcher.data?.action === "delete") open("shopify://admin/discounts", "_top")
    if (fetcher.state === "idle" && fetcher.data?.status === "errors") setErrors(fetcher.data.errors)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state])

  useEffect(() => {
    setErrors(submitErrors.map(({ message }) => message))
  }, [submitErrors])

  useEffect(() => {
    if (isNew) {
      return
    }

    if (
      discountTitle.value !== discount.title ||
      startDate.value !== discount.startsAt ||
      endDate.value !== discount?.endsAt ||
      JSON.stringify(configuration.discountId.value) !== JSON.stringify(metafield.discountId) ||
      JSON.stringify(configuration.message.value) !== JSON.stringify(metafield.message) ||
      JSON.stringify(configuration.splitShippingDiscountItems.value) !== JSON.stringify(metafield.splitShippingDiscountItems)
    ) {
      setChanges(true)
    } else {
      setChanges(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fetcher.state,
    discountTitle,
    startDate,
    endDate,
    configuration.discountId.value,
    configuration.message.value,
    configuration.splitShippingDiscountItems.value,
  ])

  return (
    <>
      <Page
        title={discount.title || locales.discounts.split_shipping_discount.new}
        backAction={{
          content: locales.discounts.common.back,
          onAction: () => open("shopify://admin/discounts", "_top")
        }}
      >
        <Layout>
          <Banner success={success} errors={errors} />
          <Layout.Section>
            <BlockStack gap="400">
              <TitleCard
                heading={`${isNew ? "Create " : ""}Split Shipping discount`}
                discountTitle={titleField}
                showDiscountId={false}
                configuration={configuration}
              />
              <Card>
                <FormLayout>
                  <BlockStack align="space-around" gap="400">
                    <BlockStack gap="100">
                      <Text variant="headingMd" as="h2">
                        Definition
                      </Text>
                      <Text as="p">
                        Prevents duplicated costs due to split shipping. The original price is required so the amount to discount can be calculated.
                      </Text>
                      <Text as="p">
                        Important: Does not support non-free tiered shipping rates.
                      </Text>
                    </BlockStack>
                    <SplitShippingDiscountItems field={splitShippingDiscountItemsField} />
                  </BlockStack>
                </FormLayout>
              </Card>
            </BlockStack>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <SummaryCard
              header={{
                discountMethod: DiscountMethod.Automatic,
                appDiscountType: locales.discounts.split_shipping_discount.name,
                isEditing: !isNew,
                discountDescriptor: discountTitle.value,
                discountStatus: discount.discountStatus
              }}
              activeDates={{ startDate: startDate.value, endDate: endDate.value }}
              combinations={{
                combinesWith: { ...combinesWith.value }
              }}
              performance={{
                status: discount.discountStatus,
                usageCount: discount.asyncUsageCount
              }}
            />
          </Layout.Section>
          <Layout.Section>
            <PageActions
              primaryAction={{
                content: isNew ? locales.general.create : locales.general.save,
                loading: isLoading,
                disabled: !changes && !isNew,
                onAction: handleSubmit
              }}
              secondaryActions={[
                {
                  content: isNew ? locales.general.discard : locales.discounts.common.delete,
                  destructive: !isNew,
                  disabled: isLoading,
                  onAction: () =>
                    isNew ? open("shopify://admin/discounts", "_top") : shopify.modal.show(DELETE_MODAL_ID)
                }
              ]}
            />
          </Layout.Section>
        </Layout>
      </Page>
      <DeleteModal
        modalId={DELETE_MODAL_ID}
        discountTitle={discount.title}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
      <SaveBar
        isNew={isNew}
        changes={changes}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onReset={handleReset}
      />
    </>
  )
}
