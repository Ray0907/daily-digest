export function ReadProgress({ read_count, total_count }) {
	if (total_count === 0) return null
	const pct = Math.round((read_count / total_count) * 100)

	return (
		<div className="flex items-center gap-2 text-xs text-text-muted dark:text-slate-400">
			<div className="w-20 h-1.5 bg-border-light dark:bg-slate-700 rounded-full overflow-hidden">
				<div
					className="h-full bg-accent rounded-full transition-all duration-300"
					style={{ width: `${pct}%` }}
				/>
			</div>
			<span>{read_count}/{total_count}</span>
		</div>
	)
}
