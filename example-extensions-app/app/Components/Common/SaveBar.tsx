import React, { useEffect, useRef } from "react"
import { useLocales } from "@app/locales"

type Props = {
  isNew: boolean
  changes: boolean
  isLoading: boolean
  onSubmit: () => void
  onReset: () => void
}

export const SaveBar: React.FC<Props> = ({
  isNew,
  changes,
  isLoading,
  onSubmit,
  onReset,
}) => {
  const locales = useLocales()

  const saveBar = useRef<{
    show: () => void
    hide: () => void
  }>()

  useEffect(() => {
    if (changes && !isNew) {
      saveBar.current?.show()
    } else {
      saveBar.current?.hide()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, changes])

  return (
    <ui-save-bar ref={saveBar}>
      <button disabled={isLoading} variant="primary" onClick={onSubmit}>
        {isNew ? locales.general.create : locales.general.save}
      </button>
      <button disabled={isLoading} onClick={onReset}>
        {locales.general.discard}
      </button>
    </ui-save-bar>
  )
}
