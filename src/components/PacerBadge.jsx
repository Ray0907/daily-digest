import { useTranslation } from 'react-i18next'

const COLORS = {
	P: 'bg-pacer-p/10 text-pacer-p',
	A: 'bg-pacer-a/10 text-pacer-a',
	C: 'bg-pacer-c/10 text-pacer-c',
	E: 'bg-pacer-e/10 text-pacer-e',
	R: 'bg-pacer-r/10 text-pacer-r',
}

export function PacerBadge({ pacer, compact = false, onClick }) {
	const { t } = useTranslation()
	const Tag = onClick ? 'button' : 'span'
	return (
		<Tag
			onClick={onClick ? (e) => { e.preventDefault(); e.stopPropagation(); onClick(pacer, { exclusive: true }) } : undefined}
			className={`inline-flex items-center shrink-0 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${COLORS[pacer] || COLORS.C} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
		>
			{compact ? pacer : `${pacer} - ${t(`pacer.${pacer}`)}`}
		</Tag>
	)
}
