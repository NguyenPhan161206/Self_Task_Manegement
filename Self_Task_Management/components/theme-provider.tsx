"use client"

import * as React from "react"
import { useTheme } from "@wrksz/themes/client"

/**
 * Client-only component that adds a 'd' keyboard shortcut to toggle between
 * light and dark themes. This must be rendered inside a ThemeProvider.
 *
 * We keep it separate so the main ThemeProvider (from @wrksz/themes/next)
 * can be used as an async Server Component in the root layout. This avoids
 * the "script tag inside React component" warning in Next.js 16 + React 19.
 */
export function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()
  const themeRef = React.useRef(resolvedTheme)

  // Keep latest theme in a ref so the key listener doesn't need to re-subscribe
  // every time the theme changes (avoids adding/removing listeners repeatedly).
  React.useEffect(() => {
    themeRef.current = resolvedTheme
  }, [resolvedTheme])

  React.useEffect(() => {
    function isTypingTarget(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) {
        return false
      }

      return (
        target.isContentEditable ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      )
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      // Only handle real KeyboardEvents. Some code (dev tools, extensions,
      // or other libraries) may dispatch plain Events or CustomEvents with
      // type "keydown" that lack a .key property.
      if (!(event instanceof KeyboardEvent) || !event.key || event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      const currentTheme = themeRef.current
      setTheme(currentTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [setTheme]) // setTheme from @wrksz/themes is stable

  return null
}
