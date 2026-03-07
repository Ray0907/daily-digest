import { useState, useEffect } from 'react'

const BASE = import.meta.env.BASE_URL

export function useGraph() {
	const [graph, setGraph] = useState({ nodes: [], links: [] })
	const [is_loading, setIsLoading] = useState(true)

	useEffect(() => {
		fetch(`${BASE}data/graph.json`)
			.then(res => res.json())
			.then(data => {
				setGraph(data)
				setIsLoading(false)
			})
			.catch(() => setIsLoading(false))
	}, [])

	return { graph, is_loading }
}
