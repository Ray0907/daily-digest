import { useCallback, useState } from 'react'
import { ToastContext } from './toast-context'

export function ToastProvider({ children }) {
	const [toasts, setToasts] = useState([])

	const addToast = useCallback((message, duration = 2000) => {
		const id = Date.now()
		setToasts(prev => [...prev, { id, message }])
		setTimeout(() => {
			setToasts(prev => prev.filter(t => t.id !== id))
		}, duration)
	}, [])

	return (
		<ToastContext.Provider value={addToast}>
			{children}
			<div className="toast-region" aria-live="polite">
				{toasts.map(toast => (
					<div
						key={toast.id}
						className="toast-message"
					>
						{toast.message}
					</div>
				))}
			</div>
		</ToastContext.Provider>
	)
}
