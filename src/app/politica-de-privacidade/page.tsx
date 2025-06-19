import React from "react";

export default function PoliticaDePrivacidade() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 to-purple-300 p-4">
      <div className="w-full max-w-2xl bg-white/95 rounded-xl shadow-lg p-8 mt-8">
        <h1 className="text-2xl font-bold mb-4 text-blue-700">Política de Privacidade</h1>
        <h2 className="text-lg font-semibold mt-4 mb-2">Dados Pessoais</h2>
        <p className="mb-4 text-gray-800">Nós não coletamos dados pessoais em nosso web site. Você tem total privacidade ao utilizar os nossos serviços.</p>
        <p className="mb-4 text-gray-800">Caso utilize o nosso site para enviar e-mails, as informações do e-mail enviado ficarão temporariamente armazenadas no servidor de e-mails do Cálculo Exato.</p>
        <h2 className="text-lg font-semibold mt-4 mb-2">Cookies</h2>
        <p className="mb-4 text-gray-800">Cookies são pequenos arquivos de dados que são colocados no seu computador ou em outros dispositivos (como 'smartphones' ou 'tablets') enquanto você navega no site.</p>
        <p className="mb-4 text-gray-800">Usamos cookies, pixels e outras tecnologias (coletivamente, "cookies") para reconhecer o seu navegador ou dispositivo, saber mais sobre seus interesses e oferecer a você recursos e serviços essenciais. E também para:</p>
        <ul className="list-disc ml-6 mb-4 text-gray-800">
          <li>Reconhecer você quando você acessa nossos serviços. Isso nos permite acompanhar suas preferências para enviar somente anúncios de seu interesse.</li>
          <li>Realizar pesquisas e diagnósticos para melhorar o conteúdo e o desempenho do nosso site e seus serviços.</li>
        </ul>
        <p className="mb-4 text-gray-800">Terceiros autorizados também podem usar cookies quando você interage com os serviços do Cálculo Exato. Esses terceiros incluem motores de busca, provedores de serviços de medição e análise, redes de mídias sociais e empresas de publicidade. Terceiros usam cookies no processo de entrega de conteúdo, incluindo anúncios relevantes a seus interesses e para medir a efetividade de seus anúncios.</p>
        <p className="mb-4 text-gray-800">Você pode gerenciar os cookies por meio das configurações de seu navegador. O recurso 'Ajuda' da maioria dos navegadores ensina a impedir seu navegador de aceitar novos cookies, como fazer com que o navegador o informe quando você recebe novos cookies, como bloquear os cookies e quando os cookies expirarão. Se você bloquear todos os cookies do seu navegador, nem nós nem terceiros iremos transferir cookies para o seu navegador. No entanto, se você fizer isso, você poderá ter que ajustar manualmente algumas preferências todas as vezes em que visitar um site, e alguns recursos e serviços podem não funcionar.</p>
        <h2 className="text-lg font-semibold mt-4 mb-2">Contato</h2>
        <p className="mb-2 text-gray-800">Se você tiver qualquer dúvida ou questionamento sobre nossa Política.</p>
      </div>
    </div>
  );
} 