import { useState, useEffect } from 'react'

const BASE = import.meta.env.BASE_URL

export function useArticles() {
	const [articles, setArticles] = useState([])
	const [is_loading, setIsLoading] = useState(true)

	useEffect(() => {
		fetch(`${BASE}data/articles.json`)
			.then(res => res.json())
			.then(data => {
				setArticles(data.articles || [])
				setIsLoading(false)
			})
			.catch(() => setIsLoading(false))
	}, [])

	return { articles, is_loading }
}
