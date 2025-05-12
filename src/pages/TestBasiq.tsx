// Página de teste simples

export default function TestBasiq() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Teste Simples</h1>
      <p>Esta é uma página de teste para verificar se o servidor de desenvolvimento está funcionando corretamente.</p>
      <button 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => alert('Botão funcionando!')}
      >
        Clique aqui
      </button>
    </div>
  );
}
