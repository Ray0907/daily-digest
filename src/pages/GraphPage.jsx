import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import * as d3 from 'd3'
import { useGraph } from '../hooks/useGraph'

const PACER_COLORS = {
	P: '#30D158', A: '#FF9F0A', C: '#0A84FF', E: '#BF5AF2', R: '#8E8E93',
}

function truncate(str, max_len) {
	if (!str || str.length <= max_len) return str
	return str.slice(0, max_len) + '...'
}

export function GraphPage() {
	const { graph, is_loading } = useGraph()
	const { t, i18n } = useTranslation()
	const svg_ref = useRef(null)
	const simulation_ref = useRef(null)
	const [time_range, setTimeRange] = useState('30d')
	const [selected_node, setSelectedNode] = useState(null)
	const [hovered_node, setHoveredNode] = useState(null)
	const [hidden_pacers, setHiddenPacers] = useState(new Set())

	const handlePacerLegendClick = useCallback((pacer) => {
		setHiddenPacers(prev => {
			const next = new Set(prev)
			if (next.has(pacer)) next.delete(pacer)
			else next.add(pacer)
			return next
		})
	}, [])

	const filtered = useMemo(() => {
		if (time_range === 'all') {
			if (hidden_pacers.size === 0) return graph
			const valid_nodes = graph.nodes.filter(n => !hidden_pacers.has(n.pacer))
			const valid_ids = new Set(valid_nodes.map(n => n.id))
			const valid_links = graph.links.filter(l =>
				valid_ids.has(l.source?.id || l.source) && valid_ids.has(l.target?.id || l.target)
			)
			return { nodes: [...valid_nodes], links: [...valid_links] }
		}

		const days = time_range === '7d' ? 7 : 30
		const cutoff = Date.now() - days * 24 * 3600 * 1000
		const valid_nodes = graph.nodes.filter(n => new Date(n.published).getTime() > cutoff && !hidden_pacers.has(n.pacer))
		const valid_ids = new Set(valid_nodes.map(n => n.id))
		const valid_links = graph.links.filter(l =>
			valid_ids.has(l.source?.id || l.source) && valid_ids.has(l.target?.id || l.target)
		)

		return { nodes: [...valid_nodes], links: [...valid_links] }
	}, [graph, time_range, hidden_pacers])

	const handleNodeClick = useCallback((d) => {
		setSelectedNode(prev => prev?.id === d.id ? null : d)
	}, [])

	useEffect(() => {
		if (!svg_ref.current || filtered.nodes.length === 0) return

		const svg = d3.select(svg_ref.current)
		svg.selectAll('*').remove()

		const width = svg_ref.current.clientWidth
		const height = svg_ref.current.clientHeight

		const g = svg.append('g')

		svg.call(d3.zoom().scaleExtent([0.3, 4]).on('zoom', (e) => {
			g.attr('transform', e.transform)
		}))

		const nodes_copy = filtered.nodes.map(d => ({ ...d }))
		const links_copy = filtered.links.map(d => ({ ...d }))

		// Count links per node for sizing
		const link_counts = {}
		links_copy.forEach(l => {
			const s = l.source?.id || l.source
			const t = l.target?.id || l.target
			link_counts[s] = (link_counts[s] || 0) + 1
			link_counts[t] = (link_counts[t] || 0) + 1
		})

		const getRadius = (d) => Math.max(8, Math.min(20, 8 + (link_counts[d.id] || 0) * 4))

		const simulation = d3.forceSimulation(nodes_copy)
			.force('link', d3.forceLink(links_copy).id(d => d.id).distance(160))
			.force('charge', d3.forceManyBody().strength(-300))
			.force('center', d3.forceCenter(width / 2, height / 2))
			.force('collision', d3.forceCollide().radius(d => getRadius(d) + 40))

		simulation_ref.current = simulation

		// Links
		const link = g.append('g')
			.selectAll('line')
			.data(links_copy)
			.join('line')
			.attr('stroke', 'currentColor')
			.attr('class', 'text-border-light dark:text-white/20')
			.attr('stroke-opacity', 0.5)
			.attr('stroke-width', d => Math.max(1.5, (d.strength || 0.5) * 4))

		// Link labels (shared keywords)
		const link_label = g.append('g')
			.selectAll('text')
			.data(links_copy)
			.join('text')
			.attr('text-anchor', 'middle')
			.attr('fill', 'currentColor')
			.attr('class', 'text-text-muted')
			.attr('font-size', '10px')
			.attr('opacity', 0.6)
			.text(d => d.shared_keywords?.join(', ') || '')

		// Node groups
		const node_group = g.append('g')
			.selectAll('g')
			.data(nodes_copy)
			.join('g')
			.attr('cursor', 'pointer')
			.on('click', (event, d) => handleNodeClick(d))
			.on('mouseenter', (event, d) => setHoveredNode(d.id))
			.on('mouseleave', () => setHoveredNode(null))
			.call(d3.drag()
				.on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
				.on('drag', (e, d) => { d.fx = e.x; d.fy = e.y })
				.on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null })
			)

		// Node glow
		node_group.append('circle')
			.attr('r', d => getRadius(d) + 6)
			.attr('fill', d => PACER_COLORS[d.pacer] || PACER_COLORS.C)
			.attr('opacity', 0.15)

		// Node circle
		node_group.append('circle')
			.attr('r', d => getRadius(d))
			.attr('fill', d => PACER_COLORS[d.pacer] || PACER_COLORS.C)
			.attr('stroke', 'white')
			.attr('stroke-width', 2)
			.attr('stroke-opacity', 0.3)

		// Node labels
		node_group.append('text')
			.attr('dy', d => getRadius(d) + 14)
			.attr('text-anchor', 'middle')
			.attr('fill', 'currentColor')
			.attr('class', 'text-text-primary dark:text-[#F5F5F7]')
			.attr('font-size', '11px')
			.attr('font-weight', '500')
			.text(d => truncate(d.title, 28))

		// Source labels (smaller, below title)
		node_group.append('text')
			.attr('dy', d => getRadius(d) + 28)
			.attr('text-anchor', 'middle')
			.attr('fill', 'currentColor')
			.attr('class', 'text-text-muted')
			.attr('font-size', '9px')
			.text(d => d.source)

		simulation.on('tick', () => {
			link
				.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
				.attr('x2', d => d.target.x).attr('y2', d => d.target.y)
			link_label
				.attr('x', d => (d.source.x + d.target.x) / 2)
				.attr('y', d => (d.source.y + d.target.y) / 2 - 6)
			node_group
				.attr('transform', d => `translate(${d.x},${d.y})`)
		})

		return () => simulation.stop()
	}, [filtered, handleNodeClick])

	if (is_loading) {
		return <div className="pt-28 max-w-5xl mx-auto px-4 text-text-muted">Loading...</div>
	}

	return (
		<div className="pt-28 max-w-5xl mx-auto px-4 pb-16">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h1 className="font-serif text-2xl font-semibold">{t('graph.title')}</h1>
					<p className="text-sm text-text-muted mt-1">{t('graph.hint') || 'Articles connected by shared keywords. Drag to explore, scroll to zoom.'}</p>
				</div>
				<div className="flex gap-1">
					{['7d', '30d', 'all'].map(range => (
						<button
							key={range}
							onClick={() => { setTimeRange(range); setSelectedNode(null) }}
							className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all
								${time_range === range ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary dark:hover:text-[#F5F5F7] bg-card dark:bg-card-dark border border-border-light/60 dark:border-white/10'}`}
						>
							{t(`graph.range_${range}`)}
						</button>
					))}
				</div>
			</div>

			<div className="relative bg-card dark:bg-card-dark border border-border-light/60 dark:border-white/10 rounded-2xl overflow-hidden" style={{ height: '560px' }}>
				<svg ref={svg_ref} className="w-full h-full" />

				{selected_node && (
					<div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card/95 dark:bg-card-dark/95 backdrop-blur-xl border border-border-light/60 dark:border-white/10 rounded-2xl p-5 shadow-xl">
						<div className="flex justify-between items-start gap-3">
							<div className="min-w-0">
								<div className="flex items-center gap-2 mb-1">
									<img
										src={`https://www.google.com/s2/favicons?domain=${selected_node.source}&sz=16`}
										alt=""
										className="w-4 h-4 shrink-0"
									/>
									<span className="text-xs text-text-muted truncate">{selected_node.source}</span>
									<span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getPacerClasses(selected_node.pacer)}`}>
										{selected_node.pacer}
									</span>
								</div>
								<h3 className="font-serif font-semibold text-sm leading-snug">{selected_node.title}</h3>
								{selected_node.keywords?.length > 0 && (
									<div className="flex flex-wrap gap-1 mt-2">
										{selected_node.keywords.map(kw => (
											<span key={kw} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded">#{kw}</span>
										))}
									</div>
								)}
							</div>
							<button onClick={() => setSelectedNode(null)} className="text-text-muted hover:text-text-primary dark:hover:text-[#F5F5F7] cursor-pointer shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						<a href={selected_node.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-3 cursor-pointer">
							{t('home.read')} <span>&rarr;</span>
						</a>
					</div>
				)}
			</div>

			{/* Interactive Legend */}
			<div className="flex flex-wrap gap-2 mt-4">
				{Object.entries(PACER_COLORS).map(([key, color]) => (
					<button
						key={key}
						onClick={() => handlePacerLegendClick(key)}
						className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-all
							${hidden_pacers.has(key)
								? 'opacity-40 border-border-light/60 dark:border-white/10 text-text-muted line-through'
								: 'border-border-light/60 dark:border-white/10 text-text-primary dark:text-[#F5F5F7]'}`}
					>
						<span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: color }} />
						{key} - {t(`pacer.${key}`)}
					</button>
				))}
			</div>
		</div>
	)
}

function getPacerClasses(pacer) {
	const map = {
		P: 'bg-[#30D158]/10 text-[#30D158]',
		A: 'bg-[#FF9F0A]/10 text-[#FF9F0A]',
		C: 'bg-[#0A84FF]/10 text-[#0A84FF]',
		E: 'bg-[#BF5AF2]/10 text-[#BF5AF2]',
		R: 'bg-[#8E8E93]/10 text-[#8E8E93]',
	}
	return map[pacer] || map.C
}
