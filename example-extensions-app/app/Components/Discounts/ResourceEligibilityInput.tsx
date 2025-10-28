import {
  BlockStack,
  Box,
  Button,
  InlineStack,
  ResourceItem,
  ResourceList,
  Select,
  Text,
  Thumbnail
} from "@shopify/polaris"
import React, { useCallback } from "react"
import { TagInput } from "@app/Components/Discounts/TagInput"
import { BaseResource, DiscountEligibility, DiscountEligibilityType, ItemResource } from "@root/types/Discount"
import { XIcon } from "@shopify/polaris-icons"

type Props = {
  type: "Customer" | "Product"
  discountEligibility: DiscountEligibility
  onChange: (discountEligibility: DiscountEligibility) => void
}

export const ResourceEligibilityInput: React.FC<Props> = ({ type, discountEligibility, onChange }) => {
  const handleTypeChange = (selected: DiscountEligibilityType) => {
    onChange({
      ...discountEligibility,
      type: selected,
    })
  }

  const handleWhitelistTagAdd = (toAdd: string) => {
    const newTag = toAdd.trim()
    if (!discountEligibility.whitelistTags.includes(newTag)) {
      onChange({
        ...discountEligibility,
        whitelistTags: discountEligibility.whitelistTags.concat([newTag]),
      })
    }
  }

  const handleWhitelistTagRemove = (toRemove: string) => {
    onChange({
      ...discountEligibility,
      whitelistTags: discountEligibility.whitelistTags.filter(tag => tag !== toRemove)
    })
  }

  const handleBlacklistTagAdd = (toAdd: string) => {
    const newTag = toAdd.trim()
    if (!discountEligibility.blacklistTags.includes(newTag)) {
      onChange({
        ...discountEligibility,
        blacklistTags: discountEligibility.blacklistTags.concat([newTag]),
      })
    }
  }

  const handleBlacklistTagRemove = (toRemove: string) => {
    onChange({
      ...discountEligibility,
      blacklistTags: discountEligibility.blacklistTags.filter(tag => tag !== toRemove)
    })
  }

  const onResourcePickerClick = useCallback(async () => {
    const baseResources: BaseResource[] = discountEligibility.whitelistResourceIds?.map(id => ({ id })) || []

    const selected = await shopify.resourcePicker({
      type: "product",
      selectionIds: baseResources,
      multiple: 50,
      filter: {
        hidden: false,
        variants: false,
        draft: false,
        archived: false
      }
    })

    if (selected && selected.length > 0) {
      onChange({
        ...discountEligibility,
        whitelistResources: selected.map((product: any) => ({
          id: product.id,
          image: product.images?.[0]?.originalSrc,
          title: product.title
        })),
        whitelistResourceIds: selected.map(({ id }) => id)
      })
    } else {
      onChange({
        ...discountEligibility,
        whitelistResources: [],
        whitelistResourceIds: []
      })
    }
  }, [discountEligibility])

  const onResourceDelete = useCallback((toRemove: string) => {
    onChange({
      ...discountEligibility,
      whitelistResources: discountEligibility.whitelistResources?.filter(resource => resource.id !== toRemove) || [],
      whitelistResourceIds: discountEligibility.whitelistResourceIds?.filter(id => id !== toRemove) || [],
    })
  }, [discountEligibility])

  return (
    <InlineStack wrap={false} gap="200">
      <Box width="50%">
        <Select
          label={`Apply to ${type.toLowerCase()}:`}
          labelInline
          options={[
            { label: "All", value: "all" },
            { label: "Include tags", value: "whitelist-tags" },
            { label: "Exclude tags", value: "blacklist-tags" },
            ...(type === "Product" ? [{label: "Include product", value: "whitelist-resource" }] : []),
          ]}
          onChange={handleTypeChange}
          value={discountEligibility.type}
        />
      </Box>
      <Box width="50%">
        {discountEligibility.type === "whitelist-tags" ? (
          <TagInput
            tags={discountEligibility.whitelistTags}
            onTagAdd={handleWhitelistTagAdd}
            onTagRemove={handleWhitelistTagRemove}
          />
        ) : discountEligibility.type === "blacklist-tags" ? (
          <TagInput
            tags={discountEligibility.blacklistTags}
            onTagAdd={toAdd => handleBlacklistTagAdd(toAdd)}
            onTagRemove={handleBlacklistTagRemove}
          />
        ) : discountEligibility.type === "whitelist-resource" ? (
          <BlockStack gap="400">
            <Button onClick={onResourcePickerClick}>
              Select products
            </Button>
            <ResourceList
              resourceName={{ singular: "product", plural: "products" }}
              items={discountEligibility.whitelistResources || []}
              renderItem={(item: ItemResource) => (
                <ResourceItem
                  id={item.id}
                  media={<Thumbnail size="extraSmall" source={item.image} alt={item.title} />}
                  onClick={() => null}
                  disabled
                >
                  <InlineStack align="space-between" gap="400" wrap={false}>
                    <Text variant="bodyMd" fontWeight="bold" as="h3">
                      {item.title}
                    </Text>
                    <Button icon={XIcon} onClick={() => onResourceDelete(item.id)} />
                  </InlineStack>
                </ResourceItem>
              )}
            />
          </BlockStack>
        ) : null}
      </Box>
    </InlineStack>
  )
}
