import { useRef, useMemo, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { makeCoverTexture, makeSpineTexture, paletteFor } from '../lib/bookTexture'

// 書尺寸（平躺）：x=寬, y=厚, z=深。書脊面 = 正面窄長條 (+z)，頂面 = 封面 (+y)
const BW = 3.6, BT = 0.46, BD = 2.4
const GAP = 0.62               // 疊書間距
const MAX = 16

function Book({ article, index, count, progress, hovered, onHover, onOpen }) {
	const ref = useRef()
	const pal = useMemo(() => paletteFor(article), [article])
	// 材質：頂=封面貼圖, 正面窄條=書脊貼圖, 其餘=書封底色/書頁
	const mats = useMemo(() => {
		const cover = makeCoverTexture(article)
		const spine = makeSpineTexture(article)
		const paper = new THREE.MeshStandardMaterial({ color: '#e8e2d4', roughness: 0.9 })
		const side = new THREE.MeshStandardMaterial({ color: pal.bg, roughness: 0.5, metalness: 0.04 })
		const spineMat = new THREE.MeshStandardMaterial({ map: spine, roughness: 0.45, metalness: 0.05, envMapIntensity: 1.0 })
		const coverMat = new THREE.MeshStandardMaterial({ map: cover, roughness: 0.4, metalness: 0.05, envMapIntensity: 1.1 })
		// BoxGeometry 面序: +x -x +y -y +z -z
		return [side, side, coverMat, paper, spineMat, side]
	}, [article, pal])

	// 這本在整疊中的基準 Y（由下往上堆）
	const baseY = (index - (count - 1) / 2) * (BT + GAP)

	useFrame(() => {
		const g = ref.current
		if (!g) return
		const p = progress.current                    // 0~1 捲動進度
		// 整疊隨捲動上移：把「當前聚焦」的書帶到中央
		const focus = p * (count - 1)
		const d = index - focus                        // 與焦點的距離（本）
		const ty = baseY - focus * (BT + GAP)
		// 靠近焦點的書微微翻開露封面（繞 x 軸），遠的躺平
		const openTarget = Math.max(0, 1 - Math.abs(d) * 0.6) * (hovered ? 1 : 0.55)
		const tRotX = -openTarget * 0.5 + (hovered ? -0.15 : 0)
		const tz = hovered ? 0.5 : 0

		g.position.y += (ty - g.position.y) * 0.12
		g.position.z += (tz - g.position.z) * 0.14
		g.rotation.x += (tRotX - g.rotation.x) * 0.12
	})

	return (
		<group
			ref={ref}
			onPointerOver={(e) => { e.stopPropagation(); onHover(index) }}
			onPointerOut={() => onHover(-1)}
			onClick={(e) => { e.stopPropagation(); onOpen(article) }}
		>
			<RoundedBox args={[BW, BT, BD]} radius={0.035} smoothness={4} castShadow receiveShadow material={mats} />
		</group>
	)
}

function Stack({ articles, progress }) {
	const [hovered, setHovered] = useState(-1)
	const books = articles.slice(0, MAX)
	return (
		<>
			{books.map((a, i) => (
				<Book
					key={a.id || i}
					article={a} index={i} count={books.length}
					progress={progress} hovered={hovered === i}
					onHover={setHovered}
					onOpen={(art) => art.url && window.open(art.url, '_blank', 'noopener')}
				/>
			))}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -6, 0]} receiveShadow>
				<planeGeometry args={[80, 80]} />
				<shadowMaterial opacity={0.24} />
			</mesh>
		</>
	)
}

// 臨界阻尼彈簧驅動 progress（時間正規化，不與幀率耦合）
function Rig({ progress, target }) {
	const vel = useRef(0)
	const last = useRef(performance.now())
	const RESPONSE = 0.42
	const omega = (2 * Math.PI) / RESPONSE
	useFrame(() => {
		const now = performance.now()
		let dt = (now - last.current) / 1000; last.current = now
		dt = Math.min(dt, 1 / 30)
		const a = omega * omega * (target.current - progress.current) - 2 * omega * vel.current
		vel.current += a * dt
		progress.current += vel.current * dt
	})
	return null
}

export function Bookshelf({ articles }) {
	const progress = useRef(0)
	const target = useRef(0)
	const reduce = useMemo(
		() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches, []
	)

	const onScroll = (e) => {
		const el = e.currentTarget
		const total = el.scrollHeight - el.clientHeight
		target.current = total > 0 ? Math.min(1, Math.max(0, el.scrollTop / total)) : 0
		if (reduce) progress.current = target.current
	}

	return (
		<div onScroll={onScroll} style={{ position: 'fixed', inset: 0, overflowY: 'auto', overflowX: 'hidden' }}>
			<div style={{ height: '600vh', pointerEvents: 'none' }} />
			<Canvas
				shadows dpr={[1, 2]}
				camera={{ position: [0, 1.6, 8.5], fov: 34 }}
				gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1 }}
				style={{ position: 'fixed', inset: 0, zIndex: 0 }}
				onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
			>
				<color attach="background" args={['#1a1614']} />
				<ambientLight intensity={0.32} />
				<directionalLight
					position={[5, 9, 5]} intensity={2.0} castShadow
					shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0004}
				/>
				<Suspense fallback={null}>
					<Environment preset="apartment" />
					<Stack articles={articles} progress={reduce ? target : progress} />
				</Suspense>
				<Rig progress={progress} target={target} />
			</Canvas>
		</div>
	)
}
