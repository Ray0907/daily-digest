export function getTimeAgo(date_str) {
	const diff = Date.now() - new Date(date_str).getTime()
	const hours = Math.floor(diff / 3600000)
	if (hours < 1) return 'just now'
	if (hours < 24) return `${hours}h ago`
	const days = Math.floor(hours / 24)
	if (days === 1) return '1d ago'
	return `${days}d ago`
}
