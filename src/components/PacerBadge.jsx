import { useTranslation } from 'react-i18next'

export function PacerBadge({ pacer, compact = false, onClick }) {
	const { t } = useTranslation()
	const Tag = onClick ? 'button' : 'span'
	const handleClick = onClick
		? event => {
			event.preventDefault()
			event.stopPropagation()
			onClick(pacer, { exclusive: true })
		}
		: undefined

	return (
		<Tag
			type={onClick ? 'button' : undefined}
			className="pacer-badge"
			onClick={handleClick}
		>
			<span>{pacer}</span>
			{!compact && t(`pacer.${pacer}`)}
		</Tag>
	)
}
