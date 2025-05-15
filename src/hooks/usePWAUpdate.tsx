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
            // Verificar se o usuário já viu esta atualização recentemente
            try {
              const lastPrompt = localStorage.getItem('lastUpdatePrompt');
              if (lastPrompt) {
                const lastPromptDate = new Date(lastPrompt);
                const now = new Date();
                // Se a última notificação foi há menos de 1 hora, não mostrar novamente
                if (now.getTime() - lastPromptDate.getTime() < 3600000) {
                  return;
                }
              }
            } catch (e) {
              console.error('Failed to check last update prompt', e);
            }
            
            // Mostrar a notificação de atualização
            toast.custom((t) => (
              <div className="flex items-center bg-white p-4 rounded shadow-lg">
                <p className="text-sm">New version available</p>
                <button
                  onClick={() => {
                    // Primeiro, descarta o toast para remover a notificação
                    toast.dismiss(t.id);
                    
                    // Depois, envia a mensagem para o service worker atualizar
                    registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
                    
                    // Armazena no localStorage que o usuário já viu esta atualização
                    try {
                      localStorage.setItem('lastUpdatePrompt', new Date().toISOString());
                    } catch (e) {
                      console.error('Failed to save update prompt state', e);
                    }
                    
                    // Recarrega a página após um pequeno delay para garantir que o toast foi removido
                    setTimeout(() => {
                      window.location.reload();
                    }, 100);
                  }}
                  className="ml-4 px-2 py-1 text-white bg-[#4a00e0] rounded text-xs"
                >
                  Update
                </button>
              </div>
            ), {
              duration: Infinity, // Toast stays until dismissed
              position: 'top-center',
              id: 'pwa-update-toast' // ID fixo para facilitar a referência
            })
          }
        }
      })
    }
  }, [])
}
