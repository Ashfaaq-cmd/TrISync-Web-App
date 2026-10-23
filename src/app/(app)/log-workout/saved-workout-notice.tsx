"use client"

import { useEffect, useState } from "react"

export default function SavedWorkoutNotice() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setVisible(false), 5000)
    return () => window.clearTimeout(timeoutId)
  }, [])

  if (!visible) return null

  return (
    <p
      role="status"
      className="rounded-lg bg-primary-soft px-4 py-3 text-sm text-success"
    >
      Workout saved.
    </p>
  )
}
