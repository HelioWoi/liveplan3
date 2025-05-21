// Script para resetar dados locais de números no localStorage
// Isso permite testar a funcionalidade de cálculo com valores limpos

function resetLocalData() {
  // Limpar transações locais
  localStorage.removeItem('local_transactions');
  
  // Limpar saldo inicial
  localStorage.removeItem('openingBalance');
  
  // Limpar entradas do Weekly Budget
  const weeklyBudgetEntries = [];
  localStorage.setItem('weeklyBudgetEntries', JSON.stringify(weeklyBudgetEntries));
  
  // Disparar eventos para notificar componentes sobre as mudanças
  window.dispatchEvent(new CustomEvent('local-transaction-added'));
  window.dispatchEvent(new CustomEvent('weekly-budget-updated'));
  
  console.log('Dados locais de números foram resetados com sucesso!');
  alert('Dados locais de números foram resetados com sucesso!');
}

// Executar a função de reset
resetLocalData();
