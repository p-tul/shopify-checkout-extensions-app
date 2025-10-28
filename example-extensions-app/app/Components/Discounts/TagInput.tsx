import { BlockStack, InlineStack, Tag, TextField } from "@shopify/polaris"
import { useState } from "react"

type Props = {
  tags: string[]
  placeholder?: string
  onTagAdd: (tag: string) => void
  onTagRemove: (tag: string) => void
}

export const TagInput: React.FC<Props> = ({ tags, placeholder, onTagAdd, onTagRemove }) => {
  const [text, setText] = useState("")

  const onTextChange = (text: string) => {
    if (text.endsWith(",")) {
      setText("")
      onTagAdd(text.substring(0, text.length - 1))
    } else {
      setText(text)
    }
  }

  return (
    <BlockStack gap="200">
      <TextField
        label="Tags"
        labelHidden
        autoComplete="off"
        placeholder={placeholder || "Use comma to complete a tag"}
        value={text}
        onChange={onTextChange}
      />
      <InlineStack gap="200">
        {tags.map(tag => (
          <Tag key={tag} onRemove={() => onTagRemove(tag)}>{tag}</Tag>
        ))}
      </InlineStack>
    </BlockStack>
  )
}
