import { useState, useEffect } from 'react'

export function useTheme() {
	const [is_dark, setIsDark] = useState(() => {
		return window.matchMedia('(prefers-color-scheme: dark)').matches
	})

	useEffect(() => {
		document.documentElement.classList.toggle('dark', is_dark)
	}, [is_dark])

	return { is_dark, toggleTheme: () => setIsDark(prev => !prev) }
}
