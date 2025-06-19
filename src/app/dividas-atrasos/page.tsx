import React from "react";

export default function DividasAtrasos() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">Dívidas e Atrasos</h1>
      <p className="mb-8 text-gray-700 max-w-xl text-center">
        Calcule atualização de boletos vencidos, cheque especial, cartão de crédito, financiamentos, com multa, juros e correção monetária.
      </p>
      <div className="w-full max-w-md bg-white rounded shadow p-6 text-center text-gray-400">
        Em breve: escolha o tipo de dívida ou atraso para calcular!
      </div>
    </div>
  );
} 