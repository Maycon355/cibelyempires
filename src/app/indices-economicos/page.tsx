import React from "react";

export default function IndicesEconomicos() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">Índices Econômicos</h1>
      <p className="mb-8 text-gray-700 max-w-xl text-center">
        Atualize valores por índices oficiais (IGP-M, IPCA, INPC, Selic), calcule variação percentual entre datas e consulte valores nominais dos índices por período.
      </p>
      {/* Aqui futuramente entram os formulários e resultados dos cálculos */}
      <div className="w-full max-w-md bg-white rounded shadow p-6 text-center text-gray-400">
        Em breve: selecione um índice e faça seu cálculo!
      </div>
    </div>
  );
} 