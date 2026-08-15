export function SkeletonCard({ size = 'md' }) {
	return (
		<div className={`skeleton-card skeleton-card--${size}`} aria-hidden="true">
			<div className="skeleton-line skeleton-line--meta" />
			<div className="skeleton-line skeleton-line--title" />
			<div className="skeleton-line" />
			<div className="skeleton-line skeleton-line--short" />
		</div>
	)
}
