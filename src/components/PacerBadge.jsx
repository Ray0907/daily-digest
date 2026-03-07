import { useTranslation } from 'react-i18next'

const COLORS = {
	P: 'bg-pacer-p/15 text-pacer-p',
	A: 'bg-pacer-a/15 text-pacer-a',
	C: 'bg-pacer-c/15 text-pacer-c',
	E: 'bg-pacer-e/15 text-pacer-e',
	R: 'bg-pacer-r/15 text-pacer-r',
}

export function PacerBadge({ pacer }) {
	const { t } = useTranslation()
	return (
		<span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${COLORS[pacer] || COLORS.C}`}>
			{pacer} - {t(`pacer.${pacer}`)}
		</span>
	)
}
