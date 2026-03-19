import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const cssPath = resolve(process.cwd(), 'src/themes/newspaper.css')
const css = readFileSync(cssPath, 'utf8')

const legacySelector = '[data-desktop-theme="newspaper"] .dark '
const fixedSelector = '.dark[data-desktop-theme="newspaper"]'

if (css.includes(legacySelector)) {
	throw new Error(`Found legacy dark selector prefix: ${legacySelector}`)
}

if (!css.includes(fixedSelector)) {
	throw new Error(`Expected dark selector prefix missing: ${fixedSelector}`)
}

process.stdout.write('newspaper dark selectors are scoped correctly\n')
