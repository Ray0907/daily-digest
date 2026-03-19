import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const cssPath = resolve(process.cwd(), 'src/themes/newspaper.css')
const css = readFileSync(cssPath, 'utf8')

function getBlock(selector) {
	const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	const match = css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`))
	if (!match) throw new Error(`Missing selector block: ${selector}`)
	return match[1]
}

function getVar(block, name) {
	const match = block.match(new RegExp(`${name}:\\s*(#[0-9A-Fa-f]{6})`))
	if (!match) throw new Error(`Missing variable ${name}`)
	return match[1]
}

function luminance(hex) {
	const values = hex.slice(1).match(/../g).map((part) => Number.parseInt(part, 16) / 255)
	const linear = values.map((value) => (
		value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
	))
	return (0.2126 * linear[0]) + (0.7152 * linear[1]) + (0.0722 * linear[2])
}

function contrast(a, b) {
	const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x)
	return (lighter + 0.05) / (darker + 0.05)
}

const lightBlock = getBlock('[data-desktop-theme="newspaper"]')
const darkBlock = getBlock('.dark[data-desktop-theme="newspaper"]')

const lightBg = getVar(lightBlock, '--newspaper-bg')
const lightPaper = getVar(lightBlock, '--newspaper-paper')
const lightRule = getVar(lightBlock, '--newspaper-rule')
const darkBg = getVar(darkBlock, '--newspaper-bg')
const darkPaper = getVar(lightBlock, '--newspaper-paper-dark')
const darkRule = getVar(lightBlock, '--newspaper-rule-dark')

const checks = [
	['light paper separation', contrast(lightBg, lightPaper), 1.12],
	['light rule separation', contrast(lightBg, lightRule), 2.0],
	['dark paper separation', contrast(darkBg, darkPaper), 1.35],
	['dark rule separation', contrast(darkBg, darkRule), 2.4],
]

const failures = checks.filter(([, value, min]) => value < min)

if (failures.length > 0) {
	const details = failures
		.map(([label, value, min]) => `${label} ${value.toFixed(2)} < ${min}`)
		.join('\n')
	throw new Error(details)
}

process.stdout.write('newspaper palette separation checks passed\n')
