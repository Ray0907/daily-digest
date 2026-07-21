import * as THREE from 'three'

// PACER 分類 → 配色（封面底 + 文字）。程式生成出版社風封面/書脊，避免純色塊。
const PALETTE = {
	P: { bg: '#c2410c', ink: '#fdf6ec', accent: '#f5c99b' }, // Procedural 橘
	A: { bg: '#0369a1', ink: '#eef6fb', accent: '#9dc8e6' }, // Analogous 藍
	C: { bg: '#15803d', ink: '#eef7f0', accent: '#a6d9b7' }, // Conceptual 綠
	E: { bg: '#b91c1c', ink: '#fbeeee', accent: '#e6a6a6' }, // Evidence 紅
	R: { bg: '#6d28d9', ink: '#f2eefb', accent: '#c3a6e6' }, // Reference 紫
}
const FALLBACK = { bg: '#3f4657', ink: '#eef0f4', accent: '#aab2c2' }

export function paletteFor(article) {
	const p = (article?.pacer || '').toUpperCase()
	return PALETTE[p] || FALLBACK
}

// 圓角矩形工具
function roundRect(ctx, x, y, w, h, r) {
	ctx.beginPath()
	ctx.moveTo(x + r, y)
	ctx.arcTo(x + w, y, x + w, y + h, r)
	ctx.arcTo(x + w, y + h, x, y + h, r)
	ctx.arcTo(x, y + h, x, y, r)
	ctx.arcTo(x, y, x + w, y, r)
	ctx.closePath()
}

function makeCanvas(w, h) {
	const c = document.createElement('canvas')
	c.width = w; c.height = h
	return { c, ctx: c.getContext('2d') }
}

function toTexture(canvas) {
	const t = new THREE.CanvasTexture(canvas)
	t.colorSpace = THREE.SRGBColorSpace
	t.anisotropy = 8
	return t
}

// 封面：設計感排版 — 幾何細線背景 + 標題 + 來源 + 出版標記
export function makeCoverTexture(article) {
	const W = 1024, H = 1536
	const { c, ctx } = makeCanvas(W, H)
	const pal = paletteFor(article)

	ctx.fillStyle = pal.bg
	ctx.fillRect(0, 0, W, H)

	// 細線網格紋樣（像 Stripe Press 封面的線條藝術）
	ctx.strokeStyle = pal.accent
	ctx.globalAlpha = 0.22
	ctx.lineWidth = 2
	for (let x = -H; x < W; x += 26) {
		ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H, H); ctx.stroke()
	}
	ctx.globalAlpha = 1

	// 上方細框
	ctx.strokeStyle = pal.ink
	ctx.globalAlpha = 0.5
	ctx.lineWidth = 3
	roundRect(ctx, 70, 90, W - 140, H - 180, 8); ctx.stroke()
	ctx.globalAlpha = 1

	// 出版標記（右上角小圓）
	ctx.fillStyle = pal.ink
	ctx.globalAlpha = 0.85
	ctx.beginPath(); ctx.arc(W - 150, 190, 34, 0, Math.PI * 2); ctx.stroke()
	ctx.font = 'bold 34px Georgia'
	ctx.textAlign = 'center'
	ctx.fillText('§', W - 150, 202)
	ctx.globalAlpha = 1

	// 標題（襯線、置中、自動換行）
	ctx.fillStyle = pal.ink
	ctx.textAlign = 'center'
	const title = article?.title || 'Untitled'
	wrapText(ctx, title, W / 2, 560, W - 260, 92, '600 76px Georgia', 5)

	// 來源（底部）
	ctx.font = 'italic 42px Georgia'
	ctx.globalAlpha = 0.9
	ctx.fillText(article?.source || '', W / 2, H - 150)
	ctx.globalAlpha = 1

	return toTexture(c)
}

// 書脊：作者/來源 · 書名 · 標記，橫排（因為書平躺，脊面朝前如圖）
export function makeSpineTexture(article) {
	const W = 2048, H = 288
	const { c, ctx } = makeCanvas(W, H)
	const pal = paletteFor(article)

	// 書脊比封面深一階
	ctx.fillStyle = shade(pal.bg, 0.82)
	ctx.fillRect(0, 0, W, H)

	// 上下裝飾細線
	ctx.strokeStyle = pal.accent
	ctx.globalAlpha = 0.5; ctx.lineWidth = 2
	ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(W, 30); ctx.stroke()
	ctx.beginPath(); ctx.moveTo(0, H - 30); ctx.lineTo(W, H - 30); ctx.stroke()
	ctx.globalAlpha = 1

	ctx.fillStyle = pal.ink
	ctx.textBaseline = 'middle'

	// 左：來源（等寬小字）
	ctx.font = '600 46px Georgia'
	ctx.textAlign = 'left'
	ctx.fillText(truncate(article?.source || '', 22), 120, H / 2)

	// 中：書名（大字襯線）
	ctx.font = '600 76px Georgia'
	ctx.textAlign = 'center'
	ctx.fillText(truncate(article?.title || '', 34), W / 2, H / 2)

	// 右：出版標記
	ctx.textAlign = 'right'
	ctx.font = 'bold 70px Georgia'
	ctx.globalAlpha = 0.85
	ctx.fillText('§', W - 120, H / 2)
	ctx.globalAlpha = 1

	return toTexture(c)
}

// ── helpers ─────────────────────────────
function wrapText(ctx, text, cx, y, maxW, lineH, font, maxLines) {
	ctx.font = font
	const words = text.split(' ')
	const lines = []
	let line = ''
	for (const w of words) {
		const test = line ? line + ' ' + w : w
		if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w }
		else line = test
		if (lines.length >= maxLines) break
	}
	if (line && lines.length < maxLines) lines.push(line)
	lines.slice(0, maxLines).forEach((l, i) => ctx.fillText(l, cx, y + i * lineH))
}

function truncate(s, n) { return s.length > n ? s.slice(0, n - 1) + '…' : s }

function shade(hex, mul) {
	const c = new THREE.Color(hex).multiplyScalar(mul)
	return `#${c.getHexString()}`
}
