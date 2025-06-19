import React from "react";

export default function CorrecaoMonetaria() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">Correção Monetária</h1>
      <p className="mb-8 text-gray-700 max-w-xl text-center">
        Atualize valores monetários por índices oficiais, taxas de juros, período definido e combinação de índice + juros + multa.
      </p>
      <div className="w-full max-w-md bg-white rounded shadow p-6 text-center text-gray-400">
        Em breve: selecione o índice e configure sua correção monetária!
      </div>
    </div>
  );
} 