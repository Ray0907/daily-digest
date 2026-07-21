import { useRef, useMemo, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'

// PACER 分類 → 書封色。source→書脊，title→封面文字，click→開文章。
const PACER_COLOR = {
	P: '#c2410c', A: '#0369a1', C: '#15803d', E: '#b91c1c', R: '#7c3aed',
}
const FALLBACK = '#334155'

function colorFor(article) {
	const p = (article.pacer || article.pacers?.[0] || '').toUpperCase()
	return PACER_COLOR[p] || FALLBACK
}

// 一本立體書：RoundedBox（drei 幫我們做圓角導角）+ 封面標題 + 書脊來源。
function Book({ article, index, count, progress, hovered, onHover, onOpen }) {
	const ref = useRef()
	const color = useMemo(() => colorFor(article), [article])
	const spineColor = useMemo(
		() => new THREE.Color(color).multiplyScalar(0.62).getStyle(),
		[color]
	)

	useFrame(() => {
		const g = ref.current
		if (!g) return
		const p = progress.current
		const center = (index - (count - 1) / 2)
		const spread = 1.55 + p * 1.9
		const lift = hovered ? 0.28 : 0
		// 目標值；用 lerp/damp 平滑靠近（彈簧感，不硬綁）
		const tx = center * spread
		const tz = Math.sin(index * 0.9 + p * 3) * 1.1 + (hovered ? 0.9 : 0)
		const ty = lift
		const ry = -0.5 + p * 1.6 + index * 0.08 + (hovered ? 0.35 : 0)
		g.position.x += (tx - g.position.x) * 0.12
		g.position.y += (ty - g.position.y) * 0.16
		g.position.z += (tz - g.position.z) * 0.12
		g.rotation.y += (ry - g.rotation.y) * 0.12
	})

	return (
		<group
			ref={ref}
			onPointerOver={(e) => { e.stopPropagation(); onHover(index) }}
			onPointerOut={() => onHover(-1)}
			onClick={(e) => { e.stopPropagation(); onOpen(article) }}
		>
			{/* 書體：導角、微紋理質感 */}
			<RoundedBox args={[1.5, 2.2, 0.36]} radius={0.05} smoothness={4} castShadow receiveShadow>
				<meshStandardMaterial color={color} roughness={0.44} metalness={0.05} envMapIntensity={1.1} />
			</RoundedBox>
			{/* 封面標題（正面 +z） */}
			<Text
				position={[0, 0.55, 0.19]}
				maxWidth={1.25}
				fontSize={0.15}
				lineHeight={1.15}
				anchorX="center"
				anchorY="top"
				color="#fdfdfb"
				outlineWidth={0}
			>
				{article.title || ''}
			</Text>
			{/* 封面來源（底部） */}
			<Text position={[0, -0.85, 0.19]} fontSize={0.088} anchorX="center" color="#e8e2d4">
				{article.source || ''}
			</Text>
			{/* 書脊文字（左側 -x，轉 90 度） */}
			<Text
				position={[-0.755, 0, 0]}
				rotation={[0, -Math.PI / 2, 0]}
				fontSize={0.1}
				maxWidth={1.9}
				anchorX="center"
				color="#fdfdfb"
			>
				{article.source || ''}
			</Text>
			<mesh position={[-0.755, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
				<planeGeometry args={[2.2, 0.36]} />
				<meshStandardMaterial color={spineColor} roughness={0.6} />
			</mesh>
		</group>
	)
}

function Shelf({ articles, progress }) {
	const [hovered, setHovered] = useState(-1)
	const books = articles.slice(0, 24)
	return (
		<>
			{books.map((a, i) => (
				<Book
					key={a.id || i}
					article={a}
					index={i}
					count={books.length}
					progress={progress}
					hovered={hovered === i}
					onHover={setHovered}
					onOpen={(art) => art.url && window.open(art.url, '_blank', 'noopener')}
				/>
			))}
			{/* 接影地面：書有落地陰影＝體積感 */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]} receiveShadow>
				<planeGeometry args={[60, 60]} />
				<shadowMaterial opacity={0.26} />
			</mesh>
		</>
	)
}

// 相機隨捲動極輕推拉；臨界阻尼彈簧驅動 progress（時間正規化，不與幀率耦合）
function Rig({ progress, target }) {
	const vel = useRef(0)
	const last = useRef(performance.now())
	const RESPONSE = 0.42
	const omega = (2 * Math.PI) / RESPONSE
	useFrame(({ camera }) => {
		const now = performance.now()
		let dt = (now - last.current) / 1000
		last.current = now
		dt = Math.min(dt, 1 / 30)
		const a = omega * omega * (target.current - progress.current) - 2 * omega * vel.current
		vel.current += a * dt
		progress.current += vel.current * dt
		camera.position.z = 9 - progress.current * 0.6
		camera.updateProjectionMatrix()
	})
	return null
}

export function Bookshelf({ articles }) {
	const progress = useRef(0)
	const target = useRef(0)
	const reduce = useMemo(
		() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches,
		[]
	)

	// 捲動 → 0~1 目標進度（direct manipulation，1:1 跟捲動）
	const onScroll = (e) => {
		const el = e.currentTarget
		const total = el.scrollHeight - el.clientHeight
		target.current = total > 0 ? Math.min(1, Math.max(0, el.scrollTop / total)) : 0
		if (reduce) progress.current = target.current // 減量：不做彈簧插值
	}

	return (
		<div
			onScroll={onScroll}
			style={{ position: 'fixed', inset: 0, overflowY: 'auto', overflowX: 'hidden' }}
		>
			{/* 捲動軌道：撐出 600vh 讓相機/書本有捲動空間 */}
			<div style={{ height: '600vh', pointerEvents: 'none' }} />
			<Canvas
				shadows
				dpr={[1, 2]}
				camera={{ position: [0, 0.3, 9], fov: 36 }}
				gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1 }}
				style={{ position: 'fixed', inset: 0, zIndex: 0 }}
			>
				<color attach="background" args={['#111015']} />
				<ambientLight intensity={0.28} />
				<directionalLight
					position={[4, 7, 6]}
					intensity={2.1}
					castShadow
					shadow-mapSize-width={1024}
					shadow-mapSize-height={1024}
					shadow-bias={-0.0004}
				/>
				<Suspense fallback={null}>
					<Environment preset="apartment" />
					<Shelf articles={articles} progress={reduce ? target : progress} />
				</Suspense>
				<Rig progress={progress} target={target} />
			</Canvas>
		</div>
	)
}
