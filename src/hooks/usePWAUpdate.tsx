import { useEffect } from 'react'
import { toast } from 'react-hot-toast'

export function usePWAUpdate(): void {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          if (registration.waiting) {
            // Create a toast notification with an update button
            toast.custom((t) => (
              <div className="flex items-center bg-white p-4 rounded shadow-lg">
                <p className="text-sm">New version available</p>
                <button
                  onClick={() => {
                    registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
                    toast.dismiss(t.id)
                    window.location.reload()
                  }}
                  className="ml-4 px-2 py-1 text-white bg-[#4a00e0] rounded text-xs"
                >
                  Update
                </button>
              </div>
            ), {
              duration: Infinity, // Toast stays until dismissed
              position: 'top-center'
            })
          }
        }
      })
    }
  }, [])
}
