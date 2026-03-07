export function getFaviconUrl(article) {
	try {
		const domain = new URL(article.source_url || article.url).hostname
		return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`
	} catch {
		return null
	}
}
