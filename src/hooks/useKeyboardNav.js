import { useEffect, useCallback } from 'react'

export function useKeyboardNav({ onNext, onPrev, onOpen, onCopy, onToggleTheme, onFocusSearch }) {
	const handleKeyDown = useCallback((e) => {
		// Don't trigger when typing in inputs
		if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
			if (e.key === 'Escape') {
				e.target.blur()
			}
			return
		}

		switch (e.key) {
			case 'j':
				e.preventDefault()
				onNext?.()
				break
			case 'k':
				e.preventDefault()
				onPrev?.()
				break
			case 'o':
			case 'Enter':
				e.preventDefault()
				onOpen?.()
				break
			case 'm':
				e.preventDefault()
				onCopy?.()
				break
			case '/':
				e.preventDefault()
				onFocusSearch?.()
				break
			case 'd':
				e.preventDefault()
				onToggleTheme?.()
				break
			case '?':
				// Could show keyboard shortcut help
				break
		}
	}, [onNext, onPrev, onOpen, onCopy, onToggleTheme, onFocusSearch])

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [handleKeyDown])
}
