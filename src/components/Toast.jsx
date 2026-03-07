import { useState, useEffect, useCallback, createContext, useContext } from 'react'

const ToastContext = createContext(null)

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
			<div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
				{toasts.map(toast => (
					<div
						key={toast.id}
						className="bg-text-primary dark:bg-slate-200 text-white dark:text-slate-900 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium animate-[fadeInUp_0.2s_ease-out]"
					>
						{toast.message}
					</div>
				))}
			</div>
		</ToastContext.Provider>
	)
}

export function useToast() {
	return useContext(ToastContext)
}
