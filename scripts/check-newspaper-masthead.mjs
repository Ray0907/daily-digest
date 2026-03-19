import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const layoutPath = resolve(process.cwd(), 'src/layouts/NewspaperLayout.jsx')
const cssPath = resolve(process.cwd(), 'src/themes/newspaper.css')

const layout = readFileSync(layoutPath, 'utf8')
const css = readFileSync(cssPath, 'utf8')

if (!layout.includes('className="newspaper-name text-4xl md:text-5xl lg:text-6xl font-black tracking-tight"')) {
	throw new Error('Masthead title is missing the dedicated newspaper-name class')
}

const requiredCssSnippets = [
	'[data-desktop-theme="newspaper"] .newspaper-name {',
	'color: var(--newspaper-ink);',
	'.dark[data-desktop-theme="newspaper"] .newspaper-name {',
	'color: var(--newspaper-ink-dark);',
	'text-shadow:',
]

for (const snippet of requiredCssSnippets) {
	if (!css.includes(snippet)) {
		throw new Error(`Missing masthead styling snippet: ${snippet}`)
	}
}

process.stdout.write('newspaper masthead styling checks passed\n')
