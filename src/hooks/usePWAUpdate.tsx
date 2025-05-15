import { useEffect } from 'react'
import { toast } from 'react-hot-toast'

// Função para verificar se o aplicativo está sendo executado como PWA
function isPWA(): boolean {
  // Verifica se o aplicativo foi instalado (está em modo standalone ou fullscreen)
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.matchMedia('(display-mode: fullscreen)').matches || 
         // Para iOS
         (window.navigator as any).standalone === true;
}

export function usePWAUpdate(): void {
  useEffect(() => {
    // Só mostra a notificação de atualização se estiver em modo PWA
    if ('serviceWorker' in navigator && isPWA()) {
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
