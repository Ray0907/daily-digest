import { useState, useEffect } from 'react'

export function useTheme() {
	const [is_dark, setIsDark] = useState(() => {
		const saved = localStorage.getItem('theme')
		if (saved) return saved === 'dark'
		return window.matchMedia('(prefers-color-scheme: dark)').matches
	})

	useEffect(() => {
		document.documentElement.classList.toggle('dark', is_dark)
		localStorage.setItem('theme', is_dark ? 'dark' : 'light')
	}, [is_dark])

	return { is_dark, toggleTheme: () => setIsDark(prev => !prev) }
}
