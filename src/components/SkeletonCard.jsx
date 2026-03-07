export function SkeletonCard({ size = 'md' }) {
	const height = size === 'lg' ? 'h-64' : size === 'sm' ? 'h-28' : 'h-40'

	return (
		<div className={`${height} bg-card dark:bg-card-dark border border-border-light dark:border-slate-800 rounded-lg p-5 animate-pulse`}>
			<div className="flex items-center gap-2 mb-3">
				<div className="w-4 h-4 bg-border-light dark:bg-slate-700 rounded-full" />
				<div className="h-3 bg-border-light dark:bg-slate-700 rounded w-24" />
				<div className="h-3 bg-border-light dark:bg-slate-700 rounded w-12 ml-auto" />
			</div>
			<div className="h-5 bg-border-light dark:bg-slate-700 rounded w-3/4 mb-3" />
			{size !== 'sm' && (
				<>
					<div className="h-3 bg-border-light dark:bg-slate-700 rounded w-full mb-1.5" />
					<div className="h-3 bg-border-light dark:bg-slate-700 rounded w-2/3 mb-3" />
				</>
			)}
			{size === 'lg' && (
				<>
					<div className="h-3 bg-border-light dark:bg-slate-700 rounded w-5/6 mb-1.5" />
					<div className="h-3 bg-border-light dark:bg-slate-700 rounded w-1/2 mb-3" />
				</>
			)}
			<div className="flex gap-2 mt-auto">
				<div className="h-5 bg-border-light dark:bg-slate-700 rounded w-14" />
				<div className="h-5 bg-border-light dark:bg-slate-700 rounded w-14" />
				<div className="h-5 bg-border-light dark:bg-slate-700 rounded w-14" />
			</div>
		</div>
	)
}
