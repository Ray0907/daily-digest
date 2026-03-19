import { cpSync, mkdirSync, existsSync } from 'fs'

const SRC = 'data'
const DEST = 'public/data'

if (!existsSync(DEST)) mkdirSync(DEST, { recursive: true })

if (existsSync(`${SRC}/articles.json`)) {
	cpSync(`${SRC}/articles.json`, `${DEST}/articles.json`)
}
if (existsSync(`${SRC}/graph.json`)) {
	cpSync(`${SRC}/graph.json`, `${DEST}/graph.json`)
}

process.stdout.write('Copied data files to public/data/\n')
