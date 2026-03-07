import { useState } from 'react'

const SHORTCUTS = [
	{ key: 'j/k', desc_en: 'Navigate articles', desc_zh: 'Navigate articles' },
	{ key: 'o', desc_en: 'Open article', desc_zh: 'Open article' },
	{ key: 'm', desc_en: 'Copy markdown', desc_zh: 'Copy markdown' },
	{ key: '/', desc_en: 'Search', desc_zh: 'Search' },
	{ key: 'd', desc_en: 'Toggle dark mode', desc_zh: 'Toggle dark mode' },
	{ key: '?', desc_en: 'Show shortcuts', desc_zh: 'Show shortcuts' },
]

export function KeyboardHelp() {
	const [is_visible, setIsVisible] = useState(false)

	return (
		<>
			<button
				onClick={() => setIsVisible(prev => !prev)}
				className="fixed bottom-6 left-6 z-40 w-8 h-8 bg-card dark:bg-card-dark border border-border-light dark:border-slate-800 rounded-lg text-xs text-text-muted hover:text-text-primary dark:hover:text-slate-200 cursor-pointer transition-colors shadow-sm hidden md:flex items-center justify-center focus:ring-2 focus:ring-accent focus:outline-none"
				aria-label="Keyboard shortcuts"
			>
				?
			</button>

			{is_visible && (
				<div className="fixed bottom-16 left-6 z-40 bg-card dark:bg-card-dark border border-border-light dark:border-slate-800 rounded-lg p-4 shadow-lg hidden md:block">
					<h3 className="text-sm font-semibold mb-2 text-text-primary dark:text-slate-200">Keyboard Shortcuts</h3>
					<div className="space-y-1.5">
						{SHORTCUTS.map(s => (
							<div key={s.key} className="flex items-center gap-3 text-xs">
								<kbd className="px-1.5 py-0.5 bg-paper dark:bg-paper-dark border border-border-light dark:border-slate-700 rounded text-text-muted font-mono min-w-[28px] text-center">
									{s.key}
								</kbd>
								<span className="text-text-muted">{s.desc_en}</span>
							</div>
						))}
					</div>
				</div>
			)}
		</>
	)
}
