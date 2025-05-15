import { toast, ToastOptions } from 'react-toastify';

// Configurações padrão para os toasts
const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'light',
};

// Tipos de eventos para os quais queremos mostrar notificações
export enum ToastEvent {
  SIGNUP_SUCCESS = 'signup_success',
  LOGIN_ERROR = 'login_error',
  TRANSACTION_SAVED = 'transaction_saved',
  LOGOUT_SUCCESS = 'logout_success',
  GENERIC_ERROR = 'generic_error',
  GENERIC_SUCCESS = 'generic_success',
  GENERIC_INFO = 'generic_info',
  GENERIC_WARNING = 'generic_warning',
}

// Mensagens para cada tipo de evento
const toastMessages: Record<ToastEvent, string> = {
  [ToastEvent.SIGNUP_SUCCESS]: 'Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.',
  [ToastEvent.LOGIN_ERROR]: 'Erro ao fazer login. Verifique suas credenciais e tente novamente.',
  [ToastEvent.TRANSACTION_SAVED]: 'Transação salva com sucesso!',
  [ToastEvent.LOGOUT_SUCCESS]: 'Logout realizado com sucesso. Até logo!',
  [ToastEvent.GENERIC_ERROR]: 'Ocorreu um erro. Por favor, tente novamente.',
  [ToastEvent.GENERIC_SUCCESS]: 'Operação realizada com sucesso!',
  [ToastEvent.GENERIC_INFO]: 'Informação importante.',
  [ToastEvent.GENERIC_WARNING]: 'Atenção! Verifique os dados informados.',
};

// Função para mostrar um toast de sucesso
export const showSuccessToast = (event: ToastEvent | string, options?: ToastOptions) => {
  const message = typeof event === 'string' ? event : toastMessages[event];
  return toast.success(message, { ...defaultOptions, ...options });
};

// Função para mostrar um toast de erro
export const showErrorToast = (event: ToastEvent | string, options?: ToastOptions) => {
  const message = typeof event === 'string' ? event : toastMessages[event];
  return toast.error(message, { ...defaultOptions, ...options });
};

// Função para mostrar um toast de informação
export const showInfoToast = (event: ToastEvent | string, options?: ToastOptions) => {
  const message = typeof event === 'string' ? event : toastMessages[event];
  return toast.info(message, { ...defaultOptions, ...options });
};

// Função para mostrar um toast de aviso
export const showWarningToast = (event: ToastEvent | string, options?: ToastOptions) => {
  const message = typeof event === 'string' ? event : toastMessages[event];
  return toast.warning(message, { ...defaultOptions, ...options });
};

// Função genérica para mostrar qualquer tipo de toast
export const showToast = (type: 'success' | 'error' | 'info' | 'warning', event: ToastEvent | string, options?: ToastOptions) => {
  switch (type) {
    case 'success':
      return showSuccessToast(event, options);
    case 'error':
      return showErrorToast(event, options);
    case 'info':
      return showInfoToast(event, options);
    case 'warning':
      return showWarningToast(event, options);
    default:
      return showInfoToast(event, options);
  }
};
