import { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, Download, Trash2, Settings } from 'lucide-react';
import { securityService } from '../../services/securityService';

/**
 * Privacy Dashboard Component
 * Allows users to view and manage their privacy and security settings
 */
export default function PrivacyDashboard({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'security' | 'data'>('privacy');
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  
  // Mock data for demonstration
  const userData = {
    personalInfo: {
      name: 'Usuário LivePlan',
      email: 'usuario@exemplo.com',
      phone: securityService.maskSensitiveData('11987654321'),
    },
    financialAccounts: [
      { 
        name: 'Conta Principal', 
        number: securityService.maskSensitiveData('00112233445566'), 
        balance: 'R$ 5.240,00' 
      },
      { 
        name: 'Poupança', 
        number: securityService.maskSensitiveData('77889900112233'), 
        balance: 'R$ 12.500,00' 
      }
    ],
    dataStats: {
      transactionsStored: 156,
      categoriesCreated: 12,
      goalsTracked: 3,
      lastSyncDate: new Date().toLocaleDateString()
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-primary-50">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-primary-600 mr-2" />
            <h2 className="font-semibold text-gray-900">Central de Privacidade e Segurança</h2>
          </div>
          <button 
            className="p-1 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex border-b border-gray-200">
          <button 
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'privacy' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600'}`}
            onClick={() => setActiveTab('privacy')}
          >
            Privacidade
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'security' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600'}`}
            onClick={() => setActiveTab('security')}
          >
            Segurança
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'data' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600'}`}
            onClick={() => setActiveTab('data')}
          >
            Meus Dados
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 flex-1">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Configurações de Privacidade</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Dados sensíveis</p>
                      <p className="text-xs text-gray-500">Mostrar ou ocultar informações sensíveis</p>
                    </div>
                  </div>
                  <button 
                    className="flex items-center text-sm bg-white border border-gray-300 rounded-full px-3 py-1"
                    onClick={() => setShowSensitiveData(!showSensitiveData)}
                  >
                    {showSensitiveData ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Ocultar
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Mostrar
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">Compartilhar dados de uso anônimos</label>
                  <input type="checkbox" className="h-4 w-4 text-primary-600 rounded" />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">Permitir notificações personalizadas</label>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 rounded" />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">Salvar histórico de transações</label>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 rounded" />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">Usar dados para recomendações</label>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 rounded" />
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Configurações de Segurança</h3>
              
              <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
                <div className="flex">
                  <Lock className="h-5 w-5 text-green-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Criptografia de dados</p>
                    <p className="text-xs text-gray-500">Seus dados financeiros são protegidos com criptografia AES-256</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Autenticação de dois fatores</p>
                    <p className="text-xs text-gray-500">Adicione uma camada extra de segurança</p>
                  </div>
                  <button className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded hover:bg-primary-200">
                    Ativar
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Bloqueio por inatividade</p>
                    <p className="text-xs text-gray-500">Bloquear app após período de inatividade</p>
                  </div>
                  <select className="text-xs border border-gray-300 rounded px-2 py-1">
                    <option>1 minuto</option>
                    <option>5 minutos</option>
                    <option selected>10 minutos</option>
                    <option>30 minutos</option>
                    <option>Nunca</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Senha</p>
                    <p className="text-xs text-gray-500">Última alteração: 30 dias atrás</p>
                  </div>
                  <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200">
                    Alterar
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Dispositivos conectados</p>
                    <p className="text-xs text-gray-500">2 dispositivos ativos</p>
                  </div>
                  <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200">
                    Gerenciar
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'data' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Meus Dados</h3>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Informações Pessoais</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Nome:</span>
                    <span className="text-sm">{userData.personalInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Email:</span>
                    <span className="text-sm">{userData.personalInfo.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Telefone:</span>
                    <span className="text-sm">
                      {showSensitiveData ? '11987654321' : userData.personalInfo.phone}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Contas Financeiras</h4>
                <div className="space-y-3">
                  {userData.financialAccounts.map((account, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{account.name}</p>
                        <p className="text-xs text-gray-500">
                          {showSensitiveData 
                            ? account.number.replace('•', '') 
                            : account.number}
                        </p>
                      </div>
                      <p className="text-sm font-medium">{account.balance}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Estatísticas de Dados</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Transações armazenadas</p>
                    <p className="text-sm font-medium">{userData.dataStats.transactionsStored}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Categorias criadas</p>
                    <p className="text-sm font-medium">{userData.dataStats.categoriesCreated}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Metas acompanhadas</p>
                    <p className="text-sm font-medium">{userData.dataStats.goalsTracked}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Última sincronização</p>
                    <p className="text-sm font-medium">{userData.dataStats.lastSyncDate}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-4">
                <button className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                  <Download className="h-4 w-4 mr-1" />
                  Exportar meus dados
                </button>
                <button className="flex items-center text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir minha conta
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-xs text-gray-500">
              <Settings className="h-4 w-4 mr-1" />
              Última atualização: {new Date().toLocaleDateString()}
            </div>
            <button 
              className="px-4 py-2 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
              onClick={onClose}
            >
              Salvar alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
