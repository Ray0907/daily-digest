export function articleToMarkdown(article, lang = 'en') {
	const summary = lang === 'zh' ? article.summary_zh : article.summary_en
	const keywords = (article.keywords || []).map(k => `#${k}`).join(' ')
	return `## ${article.title}\n\n**Source:** [${article.source}](${article.url})\n**Date:** ${new Date(article.published).toLocaleDateString()}\n**PACER:** ${article.pacer}\n\n${summary}\n\n${keywords}\n`
}

export function copyToClipboard(text) {
	return navigator.clipboard.writeText(text)
}

export function downloadMarkdown(filename, content) {
	const blob = new Blob([content], { type: 'text/markdown' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = filename
	a.click()
	URL.revokeObjectURL(url)
}
