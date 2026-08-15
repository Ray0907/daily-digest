import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { drag } from 'd3-drag'
import {
	forceCenter,
	forceCollide,
	forceLink,
	forceManyBody,
	forceSimulation,
} from 'd3-force'
import { select } from 'd3-selection'
import { zoom } from 'd3-zoom'
import { PacerBadge } from '../components/PacerBadge'
import { useGraph } from '../hooks/useGraph'

const PACER_COLORS = {
	P: '#3d3d3a',
	A: '#87867f',
	C: '#b0aea5',
	E: '#cccbc8',
	R: '#e3dacc',
}

function truncateText(value, max_length) {
	if (!value || value.length <= max_length) return value
	return `${value.slice(0, max_length)}…`
}

function filterGraph(graph, time_range, hidden_pacers) {
	const time_latest = Math.max(...graph.nodes.map(node => (
		new Date(node.published).getTime()
	)))
	const range_days = time_range === '7d' ? 7 : 30
	const time_cutoff = time_latest - (range_days * 24 * 60 * 60 * 1000)
	const valid_nodes = graph.nodes.filter(node => {
		const matches_time = time_range === 'all'
			|| new Date(node.published).getTime() >= time_cutoff
		return matches_time && !hidden_pacers.has(node.pacer)
	})
	const valid_ids = new Set(valid_nodes.map(node => node.id))
	const valid_links = graph.links.filter(link => (
		valid_ids.has(link.source?.id || link.source)
		&& valid_ids.has(link.target?.id || link.target)
	))

	return { nodes: [...valid_nodes], links: [...valid_links] }
}

function renderGraph(svg_element, graph, onNodeClick) {
	const svg = select(svg_element)
	svg.selectAll('*').remove()
	const width = svg_element.clientWidth
	const height = svg_element.clientHeight
	const canvas = svg.append('g')
	const nodes = graph.nodes.map(node => ({ ...node }))
	const links = graph.links.map(link => ({ ...link }))
	const link_counts = {}

	links.forEach(link => {
		const id_source = link.source?.id || link.source
		const id_target = link.target?.id || link.target
		link_counts[id_source] = (link_counts[id_source] || 0) + 1
		link_counts[id_target] = (link_counts[id_target] || 0) + 1
	})

	const getRadius = node => Math.max(
		8,
		Math.min(19, 8 + ((link_counts[node.id] || 0) * 4)),
	)
	const bound_x = Math.min(112, width * 0.22)
	const bound_y = Math.min(58, height * 0.16)
	const simulation = forceSimulation(nodes)
		.force('link', forceLink(links).id(node => node.id).distance(150))
		.force('charge', forceManyBody().strength(-290))
		.force('center', forceCenter(width / 2, height / 2))
		.force('collision', forceCollide().radius(node => getRadius(node) + 42))

	svg.call(zoom().scaleExtent([0.35, 4]).on('zoom', event => {
		canvas.attr('transform', event.transform)
	}))

	const link = canvas.append('g')
		.selectAll('line')
		.data(links)
		.join('line')
		.attr('class', 'graph-link')
		.attr('stroke-width', item => Math.max(1, (item.strength || 0.5) * 3))

	const node_group = canvas.append('g')
		.selectAll('g')
		.data(nodes)
		.join('g')
		.attr('class', 'graph-node')
		.attr('role', 'button')
		.attr('tabindex', 0)
		.attr('aria-label', node => (
			`${truncateText(node.title, 28)} ${node.source}`
		))
		.on('click', (event, node) => onNodeClick(node))
		.on('keydown', (event, node) => {
			if (event.key === 'Enter' || event.key === ' ') onNodeClick(node)
		})
		.call(drag()
			.on('start', (event, node) => {
				if (!event.active) simulation.alphaTarget(0.3).restart()
				node.fx = node.x
				node.fy = node.y
			})
			.on('drag', (event, node) => {
				node.fx = event.x
				node.fy = event.y
			})
			.on('end', (event, node) => {
				if (!event.active) simulation.alphaTarget(0)
				node.fx = null
				node.fy = null
			}),
		)

	node_group.append('circle')
		.attr('class', 'graph-node__ring')
		.attr('r', node => getRadius(node) + 5)
	node_group.append('circle')
		.attr('class', 'graph-node__point')
		.attr('r', getRadius)
		.attr('fill', node => PACER_COLORS[node.pacer] || PACER_COLORS.C)
	node_group.append('text')
		.attr('class', 'graph-node__title')
		.attr('dy', node => getRadius(node) + 17)
		.attr('text-anchor', 'middle')
		.text(node => truncateText(node.title, 28))
	node_group.append('text')
		.attr('class', 'graph-node__source')
		.attr('dy', node => getRadius(node) + 32)
		.attr('text-anchor', 'middle')
		.text(node => node.source)

	simulation.on('tick', () => {
		nodes.forEach(node => {
			node.x = Math.max(bound_x, Math.min(width - bound_x, node.x))
			node.y = Math.max(bound_y, Math.min(height - bound_y, node.y))
		})
		link
			.attr('x1', item => item.source.x)
			.attr('y1', item => item.source.y)
			.attr('x2', item => item.target.x)
			.attr('y2', item => item.target.y)
		node_group.attr('transform', node => `translate(${node.x},${node.y})`)
	})

	return simulation
}

function SelectedNode({ node, onClose }) {
	const { t } = useTranslation()

	if (!node) return null

	return (
		<aside className="graph-detail" aria-label={node.title}>
			<div className="graph-detail__topline">
				<PacerBadge pacer={node.pacer} />
				<button type="button" onClick={onClose} aria-label={t('graph.close')}>
					×
				</button>
			</div>
			<p className="graph-detail__source">{node.source}</p>
			<h2>{node.title}</h2>
			{node.keywords?.length > 0 && (
				<div className="keyword-list graph-detail__keywords">
					{node.keywords.map(keyword => <span key={keyword}>#{keyword}</span>)}
				</div>
			)}
			<a href={node.url} target="_blank" rel="noopener noreferrer">
				{t('home.read')} <span aria-hidden="true">↗</span>
			</a>
		</aside>
	)
}

export function GraphPage() {
	const { graph, is_loading } = useGraph()
	const { t } = useTranslation()
	const svg_ref = useRef(null)
	const [time_range, setTimeRange] = useState('30d')
	const [selected_node, setSelectedNode] = useState(null)
	const [hidden_pacers, setHiddenPacers] = useState(new Set())
	const filtered_graph = useMemo(
		() => filterGraph(graph, time_range, hidden_pacers),
		[graph, hidden_pacers, time_range],
	)
	const handleNodeClick = useCallback(node => {
		setSelectedNode(current_node => current_node?.id === node.id ? null : node)
	}, [])

	useEffect(() => {
		if (!svg_ref.current || filtered_graph.nodes.length === 0) return undefined
		const simulation = renderGraph(svg_ref.current, filtered_graph, handleNodeClick)
		return () => simulation.stop()
	}, [filtered_graph, handleNodeClick])

	const handleLegendClick = key => {
		setHiddenPacers(current_pacers => {
			const next_pacers = new Set(current_pacers)
			if (next_pacers.has(key)) next_pacers.delete(key)
			else next_pacers.add(key)
			return next_pacers
		})
	}

	if (is_loading) return <div className="page-loading">{t('graph.loading')}</div>

	return (
		<div className="page-shell graph-page">
			<header className="page-intro">
				<div>
					<p className="eyebrow">{t('graph.eyebrow')}</p>
					<h1>{t('graph.title')}</h1>
				</div>
				<div className="page-intro__aside">
					<p>{t('graph.hint')}</p>
					<div className="range-control" aria-label={t('graph.time_range')}>
						{['7d', '30d', 'all'].map(range => (
							<button
								type="button"
								key={range}
								className={time_range === range ? 'is-active' : ''}
								onClick={() => {
									setTimeRange(range)
									setSelectedNode(null)
								}}
							>
								{t(`graph.range_${range}`)}
							</button>
						))}
					</div>
				</div>
			</header>

			<section className="graph-field" aria-label={t('graph.title')}>
				<div className="graph-field__coordinates" aria-hidden="true">
					<span>RELATION MAP / 01</span>
					<span>{filtered_graph.nodes.length} NODES</span>
				</div>
				<svg ref={svg_ref} />
				<SelectedNode node={selected_node} onClose={() => setSelectedNode(null)} />
			</section>

			<div className="graph-legend" aria-label={t('graph.legend')}>
				<p>{t('graph.legend')}</p>
				<div>
					{Object.entries(PACER_COLORS).map(([key, color]) => (
						<button
							type="button"
							key={key}
							className={hidden_pacers.has(key) ? 'is-hidden' : ''}
							onClick={() => handleLegendClick(key)}
							aria-pressed={!hidden_pacers.has(key)}
						>
							<span style={{ backgroundColor: color }} aria-hidden="true" />
							{key} — {t(`pacer.${key}`)}
						</button>
					))}
				</div>
			</div>
		</div>
	)
}
