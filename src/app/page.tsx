import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Cabeçalho */}
      <header className="bg-blue-700 text-white py-4 px-6 flex items-center justify-between shadow">
        <a href="/" className="text-2xl font-bold tracking-tight hover:underline">CÁLCULO EXATO 2025</a>
        <span className="text-sm font-light">2000-2025</span>
      </header>
      <div className="flex flex-1">
        {/* Barra lateral */}
        <aside className="w-64 bg-blue-50 border-r border-blue-100 p-6 hidden md:block">
          <nav className="flex flex-col gap-4">
            <a href="/trabalhistas-previdenciarios" className="text-blue-700 hover:underline font-medium">Trabalhistas/Previdenciários</a>
            <a href="/investimentos" className="text-blue-700 hover:underline font-medium">Investimentos</a>
            <a href="/correcao-monetaria" className="text-blue-700 hover:underline font-medium">Correção Monetária</a>
            <a href="/calculos-juros" className="text-blue-700 hover:underline font-medium">Juros e Dívidas</a>
            <a href="/conversao-unidades" className="text-blue-700 hover:underline font-medium">Conversão de Unidades</a>
            <a href="/outros" className="text-blue-700 hover:underline font-medium">Outros Cálculos</a>
          </nav>
        </aside>
        {/* Conteúdo principal */}
        <main className="flex-1 flex flex-col items-center justify-start p-6 bg-white/90 min-h-[80vh]">
          {/* Aviso Importante */}
          <div className="w-full max-w-2xl bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-4 mb-6 rounded shadow">
            <b>Aviso Importante</b><br />
            O site <b>CÁLCULO EXATO</b> é um serviço gratuito que se propõe a auxiliar o usuário como simples referência e verificação de cálculos diversos. Este serviço não deve ser utilizado em substituição a um profissional habilitado. O usuário que utiliza os nossos serviços o faz por sua conta e risco, e aceita que não temos qualquer responsabilidade por danos de qualquer natureza resultantes desta utilização.
          </div>
          {/* Conteúdo de boas-vindas */}
          <div className="w-full max-w-2xl text-center mt-8">
            <h2 className="text-3xl font-bold mb-4 text-blue-700 drop-shadow">Bem-vindo ao CÁLCULO EXATO</h2>
            <p className="text-lg text-gray-700 mb-6">Plataforma gratuita para cálculos trabalhistas, financeiros, previdenciários e utilidades, com explicações didáticas e aderência à legislação brasileira.</p>
            <div className="flex flex-wrap gap-4 justify-center mt-6">
              <a href="/trabalhistas-previdenciarios" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow">Cálculos Trabalhistas</a>
              <a href="/investimentos" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow">Investimentos</a>
              <a href="/correcao-monetaria" className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded shadow">Correção Monetária</a>
              <a href="/calculos-juros" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded shadow">Juros/Dívidas</a>
              <a href="/conversao-unidades" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded shadow">Conversão de Unidades</a>
              <a href="/outros" className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded shadow">Outros</a>
            </div>
        </div>
      </main>
      </div>
      {/* Rodapé */}
      <footer className="bg-blue-900 text-gray-100 text-center py-4 text-xs mt-auto">
        2000-2025 Cálculo Exato - todos os direitos reservados - <a href="/politica-de-privacidade" className="underline hover:text-white">Política de Privacidade</a>
      </footer>
    </div>
  );
}
