import React, { useState } from "react";

interface SidebarAcoesProps {
  resultado?: string; // texto ou JSON do cálculo para exportar/salvar/enviar
}

export default function SidebarAcoes({ resultado }: SidebarAcoesProps) {
  const [showExport, setShowExport] = useState(false);

  // Função para WhatsApp
  function handleWhatsApp() {
    const texto = encodeURIComponent(resultado || "Confira este cálculo!");
    window.open(`https://wa.me/?text=${texto}`, "_blank");
  }

  // Função para E-mail
  function handleEmail() {
    const assunto = encodeURIComponent("Resultado do cálculo trabalhista");
    const corpo = encodeURIComponent(resultado || "Confira este cálculo!");
    window.open(`mailto:?subject=${assunto}&body=${corpo}`);
  }

  // Função para imprimir
  function handleImprimir() {
    window.print();
  }

  // Função para salvar
  function handleSalvar() {
    const blob = new Blob([resultado || ""], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "calculo-trabalhista.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Função para exportar
  function handleExportar() {
    setShowExport(true);
  }

  return (
    <aside className="w-full md:w-64 bg-white/90 rounded shadow p-4 flex flex-col gap-4 mb-6 md:mb-0 md:mr-6">
      <h2 className="text-lg font-bold mb-2 text-blue-700">Ações</h2>
      <button onClick={handleWhatsApp} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">WhatsApp</button>
      <button onClick={handleEmail} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Enviar por E-mail</button>
      <button onClick={handleImprimir} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Imprimir</button>
      <button onClick={handleSalvar} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">Salvar</button>
      <button onClick={handleExportar} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded">Exportar</button>
      {showExport && (
        <div className="mt-2 p-2 bg-gray-100 border rounded">
          <div className="mb-2 font-bold">Copie o texto abaixo para um editor:</div>
          <textarea
            className="w-full h-32 p-2 border rounded text-xs"
            value={resultado || "Nenhum resultado para exportar."}
            readOnly
            onFocus={e => e.target.select()}
          />
          <button className="mt-2 text-blue-700 underline text-xs" onClick={() => setShowExport(false)}>Fechar</button>
        </div>
      )}
      <div className="mt-4 text-xs text-gray-700 border-t pt-3">
        <b>Saiba Mais</b>
        <ul className="list-disc ml-4 mt-1">
          <li>Os resultados podem ser conferidos a partir da memória dos cálculos</li>
          <li>Os cálculos podem ser salvos e alterados posteriormente</li>
          <li>Os cálculos podem ser exportados para um editor de texto</li>
          <li>Os cálculos podem ser impressos</li>
          <li>Os resultados podem ser enviados para o seu WhatsApp</li>
        </ul>
      </div>
      <div className="mt-4 text-xs text-gray-400 text-center border-t pt-2">Publicidade</div>
    </aside>
  );
} 