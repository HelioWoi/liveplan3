import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Obter as variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variáveis de ambiente do Supabase não estão definidas corretamente.');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Definido' : 'Não definido');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Definido' : 'Não definido');
}

// Criar o cliente Supabase com tratamento de erros
let supabase: SupabaseClient;

try {
  // Usar valores padrão para desenvolvimento se as variáveis não estiverem definidas
  const url = supabaseUrl || 'https://sua-url-supabase-padrao.supabase.co';
  const key = supabaseAnonKey || 'sua-chave-anonima-padrao';
  
  supabase = createClient(url, key);
  console.log('Cliente Supabase inicializado com sucesso.');
} catch (error) {
  console.error('Erro ao inicializar o cliente Supabase:', error);
  // Criar um cliente vazio para evitar erros de runtime
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase };