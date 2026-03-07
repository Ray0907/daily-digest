import { useState, useCallback } from 'react'

const STORAGE_KEY = 'daily-digest-read'

function getReadArticles() {
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (!stored) return new Set()
		const parsed = JSON.parse(stored)
		// Clean up entries older than 30 days
		const cutoff = Date.now() - 30 * 24 * 3600 * 1000
		const valid = parsed.filter(([, ts]) => ts > cutoff)
		return new Set(valid.map(([id]) => id))
	} catch {
		return new Set()
	}
}

function saveReadArticles(read_set) {
	const entries = [...read_set].map(id => [id, Date.now()])
	localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function useReadProgress() {
	const [read_ids, setReadIds] = useState(() => getReadArticles())

	const markAsRead = useCallback((article_id) => {
		setReadIds(prev => {
			const next = new Set(prev)
			next.add(article_id)
			saveReadArticles(next)
			return next
		})
	}, [])

	const isRead = useCallback((article_id) => {
		return read_ids.has(article_id)
	}, [read_ids])

	const getReadCount = useCallback((article_ids) => {
		return article_ids.filter(id => read_ids.has(id)).length
	}, [read_ids])

	return { markAsRead, isRead, getReadCount }
}
