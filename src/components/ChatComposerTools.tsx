import { useEffect, useRef, useState } from 'react'
import styles from '../assets/css/ChatPage.module.scss'

type Props = {
  disabled: boolean
}

export default function ChatComposerTools({ disabled }: Props) {
  const [panel, setPanel] = useState<'attachments' | 'stickers' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const attachmentButtonRef = useRef<HTMLButtonElement>(null)
  const stickerButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!panel) return

    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setPanel(null)
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setPanel(null)
      const trigger = panel === 'attachments' ? attachmentButtonRef : stickerButtonRef
      trigger.current?.focus()
    }

    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [panel])

  return (
    <div className={styles.composerTools} ref={containerRef}>
      <button
        ref={attachmentButtonRef}
        type="button"
        className={`${styles.inputButton} ${panel === 'attachments' ? styles.composerToolActive : ''}`}
        aria-label="Đính kèm"
        title="Đính kèm"
        aria-expanded={panel === 'attachments'}
        aria-controls={panel === 'attachments' ? 'chat-attachment-panel' : undefined}
        disabled={disabled}
        onClick={() => setPanel(panel === 'attachments' ? null : 'attachments')}
      >
        <i className="fa-solid fa-paperclip" aria-hidden="true" />
      </button>

      <button
        ref={stickerButtonRef}
        type="button"
        className={`${styles.inputButton} ${panel === 'stickers' ? styles.composerToolActive : ''}`}
        aria-label="Sticker"
        title="Sticker"
        aria-expanded={panel === 'stickers'}
        aria-controls={panel === 'stickers' ? 'chat-sticker-panel' : undefined}
        disabled={disabled}
        onClick={() => setPanel(panel === 'stickers' ? null : 'stickers')}
      >
        <i className="fa-regular fa-face-smile" aria-hidden="true" />
      </button>

      {panel === 'attachments' && (
        <div id="chat-attachment-panel" className={styles.attachmentPanel} role="group" aria-label="Chọn loại đính kèm">
          <button type="button" className={styles.attachmentOption}>
            <i className="fa-regular fa-image" aria-hidden="true" />
            <span>Hình ảnh</span>
          </button>
          <button type="button" className={styles.attachmentOption}>
            <i className="fa-regular fa-file-lines" aria-hidden="true" />
            <span>File</span>
          </button>
        </div>
      )}

      {panel === 'stickers' && (
        <section id="chat-sticker-panel" className={styles.composerStickerPanel} aria-label="Bảng sticker">
          <header className={styles.composerPanelHeader}>
            <strong>Sticker</strong>
            <button type="button" className={styles.inputButton} aria-label="Đóng bảng sticker" onClick={() => {
              setPanel(null)
              stickerButtonRef.current?.focus()
            }}>
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </header>
          <div className={styles.composerStickerEmpty}>
            <i className="fa-regular fa-face-smile" aria-hidden="true" />
            <p>Chưa có bộ sticker</p>
          </div>
        </section>
      )}
    </div>
  )
}
