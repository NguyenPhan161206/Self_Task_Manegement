"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeHotkey />
      {children}
    </NextThemesProvider>
  )
}

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

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()
  const themeRef = React.useRef(resolvedTheme)

  // Keep latest theme in a ref so the key listener doesn't need to re-subscribe
  // every time the theme changes (avoids adding/removing listeners repeatedly).
  React.useEffect(() => {
    themeRef.current = resolvedTheme
  }, [resolvedTheme])

  React.useEffect(() => {
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
  }, [setTheme]) // setTheme from next-themes is stable

  return null
}

export { ThemeProvider }
