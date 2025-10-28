import { useLocales } from "@app/locales"

import { Box } from "@shopify/polaris"
import { Modal, TitleBar } from "@shopify/app-bridge-react"

type Props = {
  modalId: string
  discountTitle: string
  isLoading: boolean
  onDelete: () => void
}

export const DeleteModal: React.FC<Props> = ({ modalId, discountTitle, isLoading, onDelete }) => {
  const locales = useLocales()
  return (
    <Modal id={modalId}>
      <Box padding="400">
        <p
          dangerouslySetInnerHTML={{
            __html: locales.general.confirmation.description.replace("{title}", discountTitle)
          }}
        />
      </Box>
      <TitleBar title={locales.general.confirmation.title.replace("{title}", discountTitle)}>
        <button disabled={isLoading} tone="critical" variant="primary" onClick={onDelete}>
          {locales.discounts.common.delete}
        </button>
        <button disabled={isLoading} onClick={() => shopify.modal.hide(modalId)}>
          {locales.general.cancel}
        </button>
      </TitleBar>
    </Modal>
  )
}
