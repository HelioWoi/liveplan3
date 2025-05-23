import { useState, useEffect } from 'react';
import { Bell, Clock, Mail, Smartphone } from 'lucide-react';

interface NotificationPreferences {
  budgetAlerts: boolean;
  goalProgress: boolean;
  transactionAlerts: boolean;
  insights: boolean;
  preferredTime: string;
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    budgetAlerts: true,
    goalProgress: true,
    transactionAlerts: true,
    insights: true,
    preferredTime: '18:00',
    channels: {
      push: true,
      email: true,
      sms: false
    }
  });

  // Em uma implementação real, carregaríamos as preferências do usuário do banco de dados
  useEffect(() => {
    // Simulação de carregamento de preferências
    const loadPreferences = async () => {
      try {
        // Aqui buscaríamos do Supabase
        // const { data, error } = await supabase
        //   .from('notification_preferences')
        //   .select('*')
        //   .eq('user_id', userId)
        //   .single();
        
        // if (data && !error) {
        //   setPreferences(data);
        // }
        
        // Simulando carregamento de preferências do localStorage para demonstração
        const savedPreferences = localStorage.getItem('notification_preferences');
        if (savedPreferences) {
          setPreferences(JSON.parse(savedPreferences));
        }
      } catch (error) {
        console.error('Erro ao carregar preferências de notificação:', error);
      }
    };
    
    loadPreferences();
  }, []);

  // Salvar alterações nas preferências
  const savePreferences = async () => {
    try {
      // Em uma implementação real, salvaríamos no Supabase
      // const { error } = await supabase
      //   .from('notification_preferences')
      //   .upsert({
      //     user_id: userId,
      //     ...preferences
      //   });
      
      // Salvando no localStorage para demonstração
      localStorage.setItem('notification_preferences', JSON.stringify(preferences));
      
      alert('Preferências de notificação salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar preferências de notificação:', error);
      alert('Erro ao salvar preferências de notificação');
    }
  };

  // Atualizar uma preferência específica
  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Atualizar um canal específico
  const updateChannel = (channel: keyof NotificationPreferences['channels'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: value
      }
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Configurações de Notificações</h2>
      
      <div className="space-y-8">
        {/* Tipos de Notificações */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tipos de Notificações</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-error-100 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-error-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Alertas de Orçamento</h4>
                  <p className="text-sm text-gray-500">Receba alertas quando estiver próximo ou exceder seu orçamento</p>
                </div>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={preferences.budgetAlerts}
                  onChange={e => updatePreference('budgetAlerts', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Progresso de Metas</h4>
                  <p className="text-sm text-gray-500">Receba atualizações sobre o progresso de suas metas financeiras</p>
                </div>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={preferences.goalProgress}
                  onChange={e => updatePreference('goalProgress', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-warning-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Alertas de Transações</h4>
                  <p className="text-sm text-gray-500">Seja notificado sobre transações importantes ou recorrentes</p>
                </div>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={preferences.transactionAlerts}
                  onChange={e => updatePreference('transactionAlerts', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-success-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Insights Financeiros</h4>
                  <p className="text-sm text-gray-500">Receba dicas e insights personalizados sobre suas finanças</p>
                </div>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={preferences.insights}
                  onChange={e => updatePreference('insights', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Horário Preferido */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Horário Preferido</h3>
          
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-gray-500" />
            <div className="flex-1">
              <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-1">
                Receber notificações às
              </label>
              <input 
                type="time" 
                id="preferredTime"
                className="input"
                value={preferences.preferredTime}
                onChange={e => updatePreference('preferredTime', e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Canais de Notificação */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Canais de Notificação</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="text-gray-900">Notificações Push</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={preferences.channels.push}
                  onChange={e => updateChannel('push', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-600" />
                <span className="text-gray-900">E-mail</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={preferences.channels.email}
                  onChange={e => updateChannel('email', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-gray-600" />
                <span className="text-gray-900">SMS</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={preferences.channels.sms}
                  onChange={e => updateChannel('sms', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button 
          className="btn btn-primary w-full sm:w-auto"
          onClick={savePreferences}
        >
          Salvar Preferências
        </button>
      </div>
    </div>
  );
}
