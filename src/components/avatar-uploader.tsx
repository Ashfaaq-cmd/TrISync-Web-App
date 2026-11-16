"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import type { ChangeEvent } from "react"
import UserAvatar from "@/components/user-avatar"
import { ACCEPTED_TYPES, MAX_ORIGINAL_BYTES } from "@/lib/avatar"
import { removeAvatar, uploadAvatar } from "@/lib/avatar-actions"
import { resizeToAvatar } from "@/lib/avatar-resize"

type AvatarUploaderProps = {
  image: string | null
  name?: string | null
  email?: string | null
}

type Message = { type: "error" | "success"; text: string }
type Picked = { file: File; previewUrl: string }

const buttonClass =
  "rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-background disabled:opacity-60"

export default function AvatarUploader({ image, name, email }: AvatarUploaderProps) {
  const [current, setCurrent] = useState(image)
  const [picked, setPicked] = useState<Picked | null>(null)
  const [preparing, setPreparing] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  // Free the preview from memory when it is replaced or the component goes away
  useEffect(() => {
    return () => {
      if (picked) URL.revokeObjectURL(picked.previewUrl)
    }
  }, [picked])

  const busy = preparing || pending

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Lets the same file be chosen again later
    event.target.value = ""
    if (!file) return

    setMessage(null)
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setMessage({ type: "error", text: "Choose a JPEG, PNG or WebP picture." })
      return
    }
    if (file.size > MAX_ORIGINAL_BYTES) {
      setMessage({ type: "error", text: "Choose a picture smaller than 10 MB." })
      return
    }

    setPreparing(true)
    try {
      const resized = await resizeToAvatar(file)
      setPicked({ file: resized, previewUrl: URL.createObjectURL(resized) })
    } catch {
      setMessage({ type: "error", text: "That picture could not be read. Try another one." })
    } finally {
      setPreparing(false)
    }
  }

  function save() {
    if (!picked) return
    const formData = new FormData()
    formData.set("avatar", picked.file)

    startTransition(async () => {
      const result = await uploadAvatar(formData)
      if (result.error) {
        setMessage({ type: "error", text: result.error })
        return
      }
      setCurrent(result.url ?? null)
      setPicked(null)
      setMessage({ type: "success", text: "Profile picture saved." })
    })
  }

  function remove() {
    startTransition(async () => {
      const result = await removeAvatar()
      if (result.error) {
        setMessage({ type: "error", text: result.error })
        return
      }
      setCurrent(null)
      setMessage({ type: "success", text: "Profile picture removed." })
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <UserAvatar src={picked?.previewUrl ?? current} name={name} email={email} size={96} />

        <div className="flex flex-wrap items-center gap-2">
          {picked ? (
            <>
              <button
                type="button"
                onClick={save}
                disabled={busy}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
              >
                {pending ? "Saving..." : "Save picture"}
              </button>
              <button type="button" onClick={() => setPicked(null)} disabled={busy} className={buttonClass}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className={buttonClass}
              >
                {preparing ? "Preparing..." : current ? "Change picture" : "Choose picture"}
              </button>
              {current && (
                <button type="button" onClick={remove} disabled={busy} className={buttonClass}>
                  {pending ? "Removing..." : "Remove"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFile}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {picked && (
        <p className="text-xs text-muted">
          This is how it will look. Nothing is saved until you press Save picture.
        </p>
      )}
      {message && (
        <p
          role={message.type === "error" ? "alert" : "status"}
          className={`text-sm ${message.type === "error" ? "text-danger" : "text-success"}`}
        >
          {message.text}
        </p>
      )}
      <p className="text-xs text-muted">
        JPEG, PNG or WebP, up to 10 MB. It is cropped to a square and shrunk in your
        browser before it is uploaded.
      </p>
    </div>
  )
}