import { useRef, useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import * as d3 from 'd3'
import { useGraph } from '../hooks/useGraph'

const PACER_COLORS = {
	P: '#10B981', A: '#F59E0B', C: '#3B82F6', E: '#8B5CF6', R: '#6B7280',
}

export function GraphPage() {
	const { graph, is_loading } = useGraph()
	const { t, i18n } = useTranslation()
	const svg_ref = useRef(null)
	const [time_range, setTimeRange] = useState('30d')
	const [selected_node, setSelectedNode] = useState(null)

	const filtered = useMemo(() => {
		if (time_range === 'all') return graph

		const days = time_range === '7d' ? 7 : 30
		const cutoff = Date.now() - days * 24 * 3600 * 1000
		const valid_nodes = graph.nodes.filter(n => new Date(n.published).getTime() > cutoff)
		const valid_ids = new Set(valid_nodes.map(n => n.id))
		const valid_links = graph.links.filter(l =>
			valid_ids.has(l.source?.id || l.source) && valid_ids.has(l.target?.id || l.target)
		)

		return { nodes: [...valid_nodes], links: [...valid_links] }
	}, [graph, time_range])

	useEffect(() => {
		if (!svg_ref.current || filtered.nodes.length === 0) return

		const svg = d3.select(svg_ref.current)
		svg.selectAll('*').remove()

		const width = svg_ref.current.clientWidth
		const height = svg_ref.current.clientHeight

		const g = svg.append('g')

		svg.call(d3.zoom().scaleExtent([0.2, 5]).on('zoom', (e) => {
			g.attr('transform', e.transform)
		}))

		const nodes_copy = filtered.nodes.map(d => ({ ...d }))
		const links_copy = filtered.links.map(d => ({ ...d }))

		const simulation = d3.forceSimulation(nodes_copy)
			.force('link', d3.forceLink(links_copy).id(d => d.id).distance(80))
			.force('charge', d3.forceManyBody().strength(-120))
			.force('center', d3.forceCenter(width / 2, height / 2))

		const link = g.append('g')
			.selectAll('line')
			.data(links_copy)
			.join('line')
			.attr('stroke', '#94A3B8')
			.attr('stroke-opacity', 0.3)
			.attr('stroke-width', d => Math.max(1, (d.strength || 0.5) * 3))

		const node = g.append('g')
			.selectAll('circle')
			.data(nodes_copy)
			.join('circle')
			.attr('r', d => {
				const link_count = links_copy.filter(l =>
					(l.source?.id || l.source) === d.id || (l.target?.id || l.target) === d.id
				).length
				return Math.max(5, Math.min(15, 5 + link_count))
			})
			.attr('fill', d => PACER_COLORS[d.pacer] || PACER_COLORS.C)
			.attr('cursor', 'pointer')
			.on('click', (event, d) => setSelectedNode(d))
			.call(d3.drag()
				.on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
				.on('drag', (e, d) => { d.fx = e.x; d.fy = e.y })
				.on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null })
			)

		node.append('title').text(d => d.title)

		simulation.on('tick', () => {
			link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
				.attr('x2', d => d.target.x).attr('y2', d => d.target.y)
			node.attr('cx', d => d.x).attr('cy', d => d.y)
		})

		return () => simulation.stop()
	}, [filtered])

	if (is_loading) {
		return <div className="pt-28 max-w-5xl mx-auto px-4 text-text-muted">Loading...</div>
	}

	return (
		<div className="pt-28 max-w-5xl mx-auto px-4 pb-16">
			<div className="flex items-center justify-between mb-4">
				<h1 className="font-serif text-2xl font-semibold">{t('graph.title')}</h1>
				<div className="flex gap-2">
					{['7d', '30d', 'all'].map(range => (
						<button
							key={range}
							onClick={() => { setTimeRange(range); setSelectedNode(null) }}
							className={`px-3 py-1 rounded text-sm cursor-pointer transition-colors
								${time_range === range ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'}`}
						>
							{t(`graph.range_${range}`)}
						</button>
					))}
				</div>
			</div>

			<div className="relative bg-card dark:bg-card-dark border border-border-light dark:border-slate-800 rounded-lg overflow-hidden" style={{ height: '500px' }}>
				<svg ref={svg_ref} className="w-full h-full" />

				{selected_node && (
					<div className="absolute bottom-4 left-4 right-4 bg-card dark:bg-card-dark border border-border-light dark:border-slate-800 rounded-lg p-4 shadow-lg">
						<div className="flex justify-between items-start">
							<div>
								<p className="text-xs text-text-muted mb-1">{selected_node.source}</p>
								<h3 className="font-serif font-semibold">{selected_node.title}</h3>
								<div className="flex gap-1 mt-2">
									{selected_node.keywords?.map(kw => (
										<span key={kw} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded">#{kw}</span>
									))}
								</div>
							</div>
							<button onClick={() => setSelectedNode(null)} className="text-text-muted hover:text-text-primary cursor-pointer text-lg leading-none">&times;</button>
						</div>
						<a href={selected_node.url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline mt-2 inline-block cursor-pointer">
							Read &rarr;
						</a>
					</div>
				)}
			</div>

			<div className="flex gap-4 mt-4 text-sm">
				{Object.entries(PACER_COLORS).map(([key, color]) => (
					<div key={key} className="flex items-center gap-1.5">
						<span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />
						<span className="text-text-muted">{t(`pacer.${key}`)}</span>
					</div>
				))}
			</div>
		</div>
	)
}
