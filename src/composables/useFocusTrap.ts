import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(containerRef: Ref<HTMLElement | null>, options?: { onEscape?: () => void }) {
  const previousActiveElement = ref<HTMLElement | null>(null)

  function getFocusableElements(): HTMLElement[] {
    if (!containerRef.value) return []
    return Array.from(containerRef.value.querySelectorAll<HTMLElement>(FOCUSABLE))
      .filter((el) => el.offsetParent !== null) // visible only
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && options?.onEscape) {
      options.onEscape()
      return
    }

    if (e.key !== 'Tab') return

    const focusable = getFocusableElements()
    if (focusable.length === 0) return

    const first = focusable[0]!
    const last = focusable[focusable.length - 1]!

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  onMounted(() => {
    previousActiveElement.value = document.activeElement as HTMLElement
    document.addEventListener('keydown', handleKeydown)

    // Auto-focus first focusable element
    const focusable = getFocusableElements()
    if (focusable.length > 0) {
      focusable[0]!.focus()
    }
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeydown)
    // Restore focus to trigger element
    if (previousActiveElement.value?.focus) {
      previousActiveElement.value.focus()
    }
  })
}
