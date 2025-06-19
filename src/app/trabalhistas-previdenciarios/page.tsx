'use client';
import React, { useState, ChangeEvent, FormEvent } from "react";
import SidebarAcoes from "@/components/SidebarAcoes";

// Tabelas INSS e IRRF 2025
const TABELA_INSS = [
  { ate: 1412.00, aliquota: 0.075, deducao: 0 },
  { ate: 2666.68, aliquota: 0.09, deducao: 21.18 },
  { ate: 4000.03, aliquota: 0.12, deducao: 101.18 },
  { ate: 7786.02, aliquota: 0.14, deducao: 181.18 },
];
const TETO_INSS = 908.86; // valor máximo de desconto

const TABELA_IRRF = [
  { ate: 2112.00, aliquota: 0, deducao: 0 },
  { ate: 2826.65, aliquota: 0.075, deducao: 158.40 },
  { ate: 3751.05, aliquota: 0.15, deducao: 370.40 },
  { ate: 4664.68, aliquota: 0.225, deducao: 651.73 },
  { ate: Infinity, aliquota: 0.275, deducao: 884.96 },
];

function calcularINSS(valor: number) {
  for (let i = 0; i < TABELA_INSS.length; i++) {
    if (valor <= TABELA_INSS[i].ate) {
      const { aliquota, deducao } = TABELA_INSS[i];
      const desconto = valor * aliquota - deducao;
      return Math.round(desconto * 100) / 100;
    }
  }
  // Se passar do teto, retorna o teto
  return TETO_INSS;
}

function calcularINSSProgressivo(valor: number) {
  let desconto = 0;
  let inicioFaixa = 0;
  for (const faixa of TABELA_INSS) {
    if (valor > faixa.ate) {
      const valorFaixa = Math.round(((faixa.ate - inicioFaixa) * faixa.aliquota) * 100) / 100;
      desconto += valorFaixa;
      inicioFaixa = faixa.ate;
    } else {
      const valorFaixa = Math.round(((valor - inicioFaixa) * faixa.aliquota) * 100) / 100;
      desconto += valorFaixa;
      break;
    }
  }
  if (desconto > TETO_INSS) desconto = TETO_INSS;
  return Math.round(desconto * 100) / 100;
}

function calcularIRRF(base: number) {
  for (const faixa of TABELA_IRRF) {
    if (base <= faixa.ate) {
      const valor = Math.max(0, base * faixa.aliquota - faixa.deducao);
      return Math.round(valor * 100) / 100;
    }
  }
  return 0;
}

type RescisaoParams = {
  salario: number;
  meses: number;
  avisoPrevio: boolean;
  feriasVencidas: boolean;
  fgts: boolean;
  inss: boolean;
};

type SeguroDesempregoParams = {
  salario: number;
  qtdeParcelas: number;
};

type Mp936Params = {
  salario: number;
  percentualReducao: number;
  meses: number;
};

type ResultadoRescisao = {
  aviso: number;
  ferias: number;
  decimoTerceiro: number;
  fgtsValor: number;
  multaFgts: number;
  inssValor: number;
  total: number;
};

type ResultadoSeguro = {
  valorParcela: number;
  qtdeParcelas: number;
  total: number;
  mediaSalarial: number;
  faixa: string;
  criterioParcelas: string;
};

type ResultadoMp936 = {
  salarioReduzido: number;
  beneficioEmergencial: number;
  total: number;
};

type MotivoRescisao =
  | "Pedido de demissão"
  | "Dispensa sem justa causa"
  | "Dispensa com justa causa"
  | "Término de contrato de experiência"
  | "Acordo entre as partes"
  | "Morte do empregado"
  | "Outros";

type AvisoPrevio = "trabalhado" | "indenizado" | "não cumprido";

type DiaSemana = "segunda" | "terca" | "quarta" | "quinta" | "sexta" | "sabado";

function parseDateLocal(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day); // mês começa do zero!
}

function calcularRescisao({ salario, meses, avisoPrevio, feriasVencidas, fgts, inss }: RescisaoParams): ResultadoRescisao {
  // Cálculo simplificado para exemplo didático
  const aviso = avisoPrevio ? salario : 0;
  const ferias = (salario / 12) * meses + (feriasVencidas ? salario : 0);
  const decimoTerceiro = (salario / 12) * meses;
  const fgtsValor = fgts ? salario * 0.08 * meses : 0;
  const multaFgts = fgts ? fgtsValor * 0.4 : 0;
  const inssValor = inss ? salario * 0.08 * meses : 0;
  const total = aviso + ferias + decimoTerceiro + fgtsValor + multaFgts - inssValor;
  return {
    aviso,
    ferias,
    decimoTerceiro,
    fgtsValor,
    multaFgts,
    inssValor,
    total,
  };
}

function calcularSeguroDesemprego({ salario1, salario2, salario3 }: { salario1: number, salario2: number, salario3: number }): ResultadoSeguro {
  // Fórmula simplificada baseada em faixas de 2024
  let valorBase = salario1;
  if (salario1 <= 2203.48) valorBase = salario1 * 0.8;
  else if (salario1 <= 3672.27) valorBase = 1762.78 + (salario1 - 2203.48) * 0.5;
  else valorBase = 2519.79;
  let faixa = "";
  let qtdeParcelas = 0;
  let criterioParcelas = "";
  if (salario1 <= 2250.74) {
    valorBase = salario1 * 0.8;
    faixa = "80% até R$ 2.250,74";
    qtdeParcelas = 4;
    criterioParcelas = "Primeira solicitação, 12-23 meses: 4 parcelas";
  } else if (salario1 <= 3751.05) {
    valorBase = 1800.59 + (salario1 - 2250.74) * 0.5;
    faixa = "R$ 1.800,59 + 50% do que exceder R$ 2.250,74 até R$ 3.751,05";
    qtdeParcelas = 5;
    criterioParcelas = "Primeira solicitação, 24+ meses: 5 parcelas";
  } else {
    valorBase = 2_313.74;
    faixa = "Teto R$ 2.313,74";
    qtdeParcelas = 5;
    criterioParcelas = "Terceira ou mais, 24+ meses: 5 parcelas";
  }
  const media = (salario1 + salario2 + salario3) / 3;
  return {
    valorParcela: valorBase,
    qtdeParcelas,
    total: valorBase * qtdeParcelas,
    mediaSalarial: media,
    faixa,
    criterioParcelas,
  };
}

function calcularMp936({ salario, percentualReducao, meses }: Mp936Params): ResultadoMp936 {
  // Redução de salário e compensação do governo
  const salarioReduzido = salario * (1 - percentualReducao / 100);
  const beneficioEmergencial = salario * (percentualReducao / 100) * meses;
  const total = salarioReduzido * meses + beneficioEmergencial;
  return {
    salarioReduzido,
    beneficioEmergencial,
    total,
  };
}

function mesesEntreDatas(dataInicio: Date, dataFim: Date) {
  let anos = dataFim.getFullYear() - dataInicio.getFullYear();
  let meses = dataFim.getMonth() - dataInicio.getMonth();
  let total = anos * 12 + meses;
  // Só conta o mês do afastamento se o dia do afastamento for >= dia da admissão
  if (dataFim.getDate() < dataInicio.getDate()) {
    total -= 1;
  }
  return total;
}

function diasNoMes(data: Date) {
  return new Date(data.getFullYear(), data.getMonth() + 1, 0).getDate();
}

function calcularAvisoPrevioProporcional(dataAdmissao: Date, dataAfastamento: Date) {
  // 30 dias + 3 dias por ano completo trabalhado, até 90 dias
  const anos = Math.floor((dataAfastamento.getTime() - dataAdmissao.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const dias = 30 + Math.min(anos, 20) * 3;
  return dias;
}

function calcularRescisaoCompleta({
  dataAdmissao,
  dataAfastamento,
  motivo,
  salario,
  avisoPrevio,
  feriasVencidas,
  saldoFgts,
  dependentes,
}: {
  dataAdmissao: string;
  dataAfastamento: string;
  motivo: MotivoRescisao;
  salario: number;
  avisoPrevio: AvisoPrevio;
  feriasVencidas: boolean;
  saldoFgts: number;
  dependentes: number;
}) {
  // Datas
  const adm = parseDateLocal(dataAdmissao);
  const afsOriginal = parseDateLocal(dataAfastamento);
  let diasAvisoPrevio = 0;
  // Aviso prévio proporcional (Lei 12.506/2011)
  if (motivo !== "Dispensa com justa causa" && avisoPrevio !== "não cumprido") {
    diasAvisoPrevio = calcularAvisoPrevioProporcional(adm, afsOriginal);
  }
  // Data de afastamento "para fins de tempo de serviço" (considera aviso prévio indenizado, exceto justa causa)
  let afsParaTempoServico = new Date(afsOriginal);
  if (motivo !== "Dispensa com justa causa" && avisoPrevio === "indenizado") {
    afsParaTempoServico = new Date(afsOriginal);
    afsParaTempoServico.setDate(afsParaTempoServico.getDate() + diasAvisoPrevio);
  }
  // Última data do contrato (exibe para o usuário)
  const ultimaDataContrato = (motivo !== "Dispensa com justa causa" && avisoPrevio === "trabalhado") ? new Date(afsOriginal) : new Date(afsParaTempoServico);
  // Saldo de salário: dias trabalhados até o afastamento (NÃO inclui aviso prévio, mesmo se trabalhado)
  const diasTrabalhados = afsOriginal.getDate();
  const diasMes = diasNoMes(afsOriginal);
  const saldoSalario = (salario / diasMes) * diasTrabalhados;
  // Férias vencidas: só se completou 12 meses antes do afastamento (considerando aviso prévio)
  let mesesCompletos = mesesEntreDatas(adm, afsParaTempoServico);
  if (afsParaTempoServico.getDate() >= adm.getDate()) mesesCompletos += 1;
  const temFeriasVencidas = mesesCompletos >= 12;
  // Férias vencidas: 1 salário + 1/3 se houver
  let valorFeriasVencidas = 0;
  let tercoFeriasVencidas = 0;
  if (temFeriasVencidas) {
    valorFeriasVencidas = salario;
    tercoFeriasVencidas = salario / 3;
  }
  // Férias proporcionais: meses completos após o último período aquisitivo
  let mesesFeriasProporcionais = mesesCompletos;
  if (temFeriasVencidas) mesesFeriasProporcionais -= 12;
  if (mesesFeriasProporcionais < 0) mesesFeriasProporcionais = 0;
  if (mesesFeriasProporcionais > 12) mesesFeriasProporcionais = 12;
  // --- Lógica especial para justa causa ---
  let pagarFeriasVencidas = temFeriasVencidas;
  let pagarFeriasProporcionais = true;
  let pagarDecimoTerceiro = true;
  if (motivo === "Dispensa com justa causa") {
    pagarFeriasVencidas = false;
    pagarFeriasProporcionais = false;
    pagarDecimoTerceiro = false;
  }
  // Férias vencidas: 1 salário + 1/3 se houver
  if (pagarFeriasVencidas) {
    valorFeriasVencidas = salario;
    tercoFeriasVencidas = salario / 3;
  }
  // Férias proporcionais: meses completos após o último período aquisitivo
  let valorFeriasProporcionais = 0;
  let tercoFeriasProporcionais = 0;
  if (pagarFeriasProporcionais) {
    valorFeriasProporcionais = (salario / 12) * mesesFeriasProporcionais;
    tercoFeriasProporcionais = valorFeriasProporcionais / 3;
  }
  // Décimo terceiro proporcional: meses do ano atual (NÃO total de meses trabalhados)
  let meses13 = afsOriginal.getMonth() + 1; // +1 porque getMonth() retorna 0-11
  if (meses13 > 12) meses13 = 12;
  if (meses13 < 0) meses13 = 0;
  let decimoTerceiro = 0;
  if (pagarDecimoTerceiro) {
    decimoTerceiro = (salario / 12) * meses13;
  }
  // INSS e IRRF
  const inssSalario = calcularINSS(saldoSalario);
  const irrfSalario = calcularIRRF(saldoSalario - inssSalario);
  const inss13 = pagarDecimoTerceiro ? calcularINSSProgressivo(decimoTerceiro) : 0;
  const irrf13 = pagarDecimoTerceiro ? calcularIRRF(decimoTerceiro - inss13) : 0;
  // Totais
  const totalFerias = valorFeriasVencidas + tercoFeriasVencidas + valorFeriasProporcionais + tercoFeriasProporcionais;
  const totalSalarios = saldoSalario;
  const totalDescontosSalarios = inssSalario + irrfSalario;
  const totalDecimoTerceiro = decimoTerceiro;
  const totalDescontos13 = inss13 + irrf13;
  // Outros vencimentos e descontos zerados
  const totalOutrosVencimentos = 0;
  const totalDescontosOutros = 0;
  // Para justa causa, totalVencimentos não soma férias nem 13º
  const totalVencimentos = motivo === "Dispensa com justa causa"
    ? totalSalarios + totalOutrosVencimentos
    : totalSalarios + totalDecimoTerceiro + totalFerias + totalOutrosVencimentos;
  const totalDescontos = motivo === "Dispensa com justa causa"
    ? totalDescontosSalarios + totalDescontosOutros
    : totalDescontosSalarios + totalDescontos13 + totalDescontosOutros;
  const totalLiquido = totalVencimentos - totalDescontos;
  // Corrigir exibição do campo aviso prévio
  const avisoPrevioExibicao = motivo === "Dispensa com justa causa" ? "não cumprido" : avisoPrevio;
  // Cálculo de FGTS e multa de 40% para dispensa sem justa causa
  let fgtsBase = 0;
  let multaFgts = 0;
  if (motivo === "Dispensa sem justa causa") {
    // FGTS sobre salários, férias, 13º (exceto descontos)
    fgtsBase = saldoSalario + valorFeriasVencidas + tercoFeriasVencidas + valorFeriasProporcionais + tercoFeriasProporcionais + decimoTerceiro;
    multaFgts = fgtsBase * 0.08 * 0.4; // 8% do FGTS, 40% de multa
  }
  return {
    adm,
    afs: afsOriginal,
    motivo,
    salario,
    avisoPrevio: avisoPrevioExibicao,
    saldoSalario,
    diasTrabalhados,
    diasMes,
    inssSalario,
    irrfSalario,
    decimoTerceiro,
    meses13,
    inss13,
    irrf13,
    // férias detalhadas
    valorFeriasVencidas,
    tercoFeriasVencidas,
    valorFeriasProporcionais,
    mesesFeriasProporcionais,
    tercoFeriasProporcionais,
    totalFerias,
    totalSalarios,
    totalDescontosSalarios,
    totalDecimoTerceiro,
    totalDescontos13,
    totalOutrosVencimentos,
    totalDescontosOutros,
    totalVencimentos,
    totalDescontos,
    totalLiquido,
    ultimaDataContrato,
    diasAvisoPrevio,
    fgtsBase,
    multaFgts,
  };
}

const tabs = [
  { label: "Rescisão CLT", value: "rescisao" },
  { label: "Seguro-Desemprego", value: "seguro" },
  { label: "MP-936", value: "mp936" },
  { label: "Horas-Extras", value: "horasextras" },
];

const motivos: MotivoRescisao[] = [
  "Pedido de demissão",
  "Dispensa sem justa causa",
  "Dispensa com justa causa",
  "Término de contrato de experiência",
  "Acordo entre as partes",
  "Morte do empregado",
  "Outros",
];
const avisos: AvisoPrevio[] = ["trabalhado", "indenizado", "não cumprido"];

// Utilitário para converter hh:mm em horas decimais
function parseHorasMinutos(h: string, m: string) {
  const horas = parseInt(h || "0", 10);
  const minutos = parseInt(m || "0", 10);
  return horas + minutos / 60;
}

// Função para contar dias da semana entre duas datas
function contarDiasSemanaNoPeriodo(diaSemana: number, inicio: Date, fim: Date) {
  let count = 0;
  let d = new Date(inicio);
  while (d <= fim) {
    if (d.getDay() === diaSemana) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

// Função para contar dias úteis e domingos/repouso no mês
function contarDiasNoMes(ano: number, mes: number) {
  let uteis = 0, domingos = 0;
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const d = new Date(ano, mes, dia);
    if (d.getDay() === 0) domingos++;
    else uteis++;
  }
  return { uteis, domingos };
}

// Função principal de cálculo de horas-extras
function calcularHorasExtras({
  dataAdmissao,
  dataInicio,
  dataFim,
  salario,
  jornada,
  adicional,
  horas,
}: {
  dataAdmissao: string;
  dataInicio: string;
  dataFim: string;
  salario: string;
  jornada: string;
  adicional: string;
  horas: Record<DiaSemana, { h: string; m: string }>;
}) {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const salarioNum = Number(salario);
  const jornadaNum = Number(jornada === "custom" ? 220 : jornada); // fallback para 220
  const adicionalNum = Number(adicional) / 100;
  const valorHoraExtra = salarioNum / jornadaNum * (1 + adicionalNum);
  let memoria: any[] = [];
  let totalHE = 0, totalDSR = 0, totalFGTS = 0;
  let atual = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
  let fimMes = new Date(fim.getFullYear(), fim.getMonth(), 1);
  fimMes.setMonth(fimMes.getMonth() + 1);
  // Loop mês a mês
  while (atual < fimMes) {
    const ano = atual.getFullYear();
    const mes = atual.getMonth();
    // Limites do mês
    const iniMes = new Date(Math.max(atual.getTime(), inicio.getTime()));
    const fimMesAtual = new Date(Math.min(new Date(ano, mes + 1, 0).getTime(), fim.getTime()));
    // Contar dias úteis de cada semana
    const diasSemana = [1,2,3,4,5,6]; // segunda(1) a sabado(6)
    let totalHorasMes = 0;
    let detalhesDias: any = {};
    diasSemana.forEach((ds, idx) => {
      const key = ["segunda","terca","quarta","quinta","sexta","sabado"][idx] as DiaSemana;
      const dias = contarDiasSemanaNoPeriodo(ds, iniMes, fimMesAtual);
      const horasDia = parseHorasMinutos(horas[key].h, horas[key].m);
      detalhesDias[key] = { dias, horasDia };
      totalHorasMes += dias * horasDia;
    });
    const valorHE = Math.round((valorHoraExtra * totalHorasMes) * 100) / 100;
    // DSR: (valorHE / dias úteis) x domingos
    const { uteis, domingos } = contarDiasNoMes(ano, mes);
    const dsr = uteis > 0 ? Math.round((valorHE / uteis * domingos) * 100) / 100 : 0;
    const fgts = Math.round((valorHE * 0.08) * 100) / 100;
    totalHE += valorHE;
    totalDSR += dsr;
    totalFGTS += fgts;
    memoria.push({
      mes: `${ano}-${(mes+1).toString().padStart(2,"0")}`,
      salario: salarioNum,
      valorHoraExtra: Math.round(valorHoraExtra * 100) / 100,
      detalhesDias,
      totalHorasMes,
      valorHE,
      dsr,
      fgts,
      totalMes: Math.round((valorHE + dsr + fgts) * 100) / 100,
    });
    atual.setMonth(atual.getMonth() + 1);
  }
  // Reflexos nas férias e 13º
  const mediaMensalHE = totalHE / memoria.length;
  const reflexoFerias = Math.round((mediaMensalHE * 12 * (1 + 1/3)) * 100) / 100;
  const fgtsFerias = Math.round((reflexoFerias * 0.08) * 100) / 100;
  const reflexo13 = Math.round((mediaMensalHE * 12) * 100) / 100;
  const fgts13 = Math.round((reflexo13 * 0.08) * 100) / 100;
  return {
    memoria,
    totalHE,
    totalDSR,
    totalFGTS,
    reflexoFerias,
    fgtsFerias,
    reflexo13,
    fgts13,
    totalGeral: Math.round((totalHE + totalDSR + totalFGTS + reflexoFerias + fgtsFerias + reflexo13 + fgts13) * 100) / 100,
  };
}

export default function TrabalhistasPrevidenciarios() {
  const [tab, setTab] = useState("rescisao");
  const [showExplicacaoFerias, setShowExplicacaoFerias] = useState(false);
  const [form, setForm] = useState({
    dataAdmissao: "",
    dataAfastamento: "",
    motivo: motivos[0],
    salario: "",
    avisoPrevio: avisos[0],
    feriasVencidas: false,
    saldoFgts: "",
    dependentes: "0",
  });
  const [resultado, setResultado] = useState<any>(null);
  // Seguro-Desemprego
  const [seguro, setSeguro] = useState({
    salario1: "",
    salario2: "",
    salario3: "",
    mesesTrabalhados: "",
    solicitacoes: "1",
  });
  const [resSeguro, setResSeguro] = useState<ResultadoSeguro | null>(null);
  // MP-936
  const [mp936, setMp936] = useState({ salario: "", percentualReducao: "25", meses: "1" });
  const [resMp936, setResMp936] = useState<ResultadoMp936 | null>(null);
  // Horas-Extras
  const [horasExtras, setHorasExtras] = useState<{
    dataAdmissao: string;
    dataInicio: string;
    dataFim: string;
    salario: string;
    jornada: string;
    adicional: string;
    horas: Record<DiaSemana, { h: string; m: string }>;
  }>({
    dataAdmissao: "",
    dataInicio: "",
    dataFim: "",
    salario: "",
    jornada: "220",
    adicional: "50",
    horas: {
      segunda: { h: "", m: "" },
      terca: { h: "", m: "" },
      quarta: { h: "", m: "" },
      quinta: { h: "", m: "" },
      sexta: { h: "", m: "" },
      sabado: { h: "", m: "" },
    },
  });
  const [resHorasExtras, setResHorasExtras] = useState<any>(null);

  // Calcular meses completos para liberar férias vencidas
  let mesesCompletos = 0;
  if (form.dataAdmissao && form.dataAfastamento) {
    const adm = parseDateLocal(form.dataAdmissao);
    const afs = parseDateLocal(form.dataAfastamento);
    mesesCompletos = mesesEntreDatas(adm, afs);
    if (afs.getDate() >= adm.getDate()) mesesCompletos += 1;
  }
  const podeFeriasVencidas = mesesCompletos >= 12;

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;
    if (name === "feriasVencidas") {
      setForm((f) => ({ ...f, feriasVencidas: !f.feriasVencidas }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }
  function handleSeguro(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value } = target;
    setSeguro((f) => ({ ...f, [name]: value }));
  }
  function handleMp936(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value } = target;
    setMp936((f) => ({ ...f, [name]: value }));
  }
  function handleHorasExtras(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    if (name.startsWith("horas-")) {
      const [_, dia, tipo] = name.split("-");
      const diaSemana = dia as DiaSemana;
      setHorasExtras((prev) => ({
        ...prev,
        horas: {
          ...prev.horas,
          [diaSemana]: {
            ...prev.horas[diaSemana],
            [tipo]: value,
          },
        },
      }));
    } else {
      setHorasExtras((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = calcularRescisaoCompleta({
      dataAdmissao: form.dataAdmissao,
      dataAfastamento: form.dataAfastamento,
      motivo: form.motivo as MotivoRescisao,
      salario: Number(form.salario),
      avisoPrevio: form.avisoPrevio as AvisoPrevio,
      feriasVencidas: form.feriasVencidas,
      saldoFgts: Number(form.saldoFgts),
      dependentes: Number(form.dependentes),
    });
    setResultado(res);
  }
  function handleSubmitSeguro(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = calcularSeguroDesemprego({
      salario1: Number(seguro.salario1),
      salario2: Number(seguro.salario2),
      salario3: Number(seguro.salario3),
    });
    setResSeguro(res);
  }
  function handleSubmitMp936(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = calcularMp936({
      salario: Number(mp936.salario),
      percentualReducao: Number(mp936.percentualReducao),
      meses: Number(mp936.meses),
    });
    setResMp936(res);
  }
  function handleSubmitHorasExtras(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = calcularHorasExtras(horasExtras);
    setResHorasExtras(res);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 to-purple-300 p-4">
      <h1 className="text-3xl font-extrabold mb-2 text-white drop-shadow">Trabalhistas e Previdenciários</h1>
      <p className="mb-8 text-white/90 max-w-2xl text-center text-lg drop-shadow">
        Calcule rescisão CLT, seguro-desemprego, MP-936 e outros direitos.
      </p>
      <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto gap-12 items-start justify-center">
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-lg bg-white/95 rounded-xl shadow-lg p-8">
            <button
              className="text-blue-700 underline text-sm mb-2"
              onClick={() => setShowExplicacaoFerias((v) => !v)}
            >
              {showExplicacaoFerias ? "Ocultar explicação sobre férias proporcionais" : "Como funcionam as férias proporcionais?"}
            </button>
            {showExplicacaoFerias && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-gray-800 mb-4">
                <b>Férias proporcionais:</b> Todo trabalhador CLT tem direito a receber férias proporcionais ao tempo trabalhado, mesmo que não complete 12 meses na empresa. O valor é calculado assim:<br />
                <b>Férias proporcionais = (Salário bruto × meses trabalhados) / 12</b><br />
                <b>1/3 constitucional = Férias proporcionais / 3</b><br />
                <b>Total a receber = Férias proporcionais + 1/3</b><br />
                <br />
                Exemplo: Se trabalhou 6 meses com salário de R$ 2.000,00:<br />
                (2.000 × 6) / 12 = R$ 1.000,00<br />
                1/3: R$ 333,33<br />
                Total: R$ 1.333,33<br />
                <br />
                Quem tem mais de 1 ano recebe férias vencidas (período completo) + férias proporcionais ao tempo que exceder 1 ano.<br />
                O aviso prévio (trabalhado ou indenizado) conta como tempo de serviço para férias proporcionais.<br />
                O valor é pago na rescisão, independentemente do motivo do desligamento.<br />
              </div>
            )}
            {/* Tabs, formulários e resultados */}
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs.map((t) => (
                <button
                  key={t.value}
                  className={`px-4 py-2 rounded-t font-bold text-sm shadow transition border-b-2 ${tab === t.value ? "bg-white/90 border-blue-600 text-blue-700" : "bg-white/60 border-transparent text-gray-600 hover:bg-white/80"}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setTab(t.value);
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="w-full max-w-md bg-white/90 rounded-b shadow p-6">
              {tab === "rescisao" && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <label className="flex flex-col gap-1 text-black">
                    Data de admissão:
                    <input type="date" name="dataAdmissao" value={form.dataAdmissao} onChange={handleChange} required className="rounded border px-2 py-1 text-black" />
                  </label>
                  <label className="flex flex-col gap-1 text-black">
                    Data de afastamento:
                    <input type="date" name="dataAfastamento" value={form.dataAfastamento} onChange={handleChange} required className="rounded border px-2 py-1 text-black" />
                  </label>
                  <label className="flex flex-col gap-1 text-black">
                    Motivo da rescisão:
                    <select name="motivo" value={form.motivo} onChange={handleChange} className="rounded border px-2 py-1 text-black">
                      {motivos.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-black">
                    Salário base (R$):
                    <input type="number" name="salario" value={form.salario} onChange={handleChange} required min={0} step={0.01} className="rounded border px-2 py-1 text-black" />
                  </label>
                  <label className="flex flex-col gap-1 text-black">
                    Aviso prévio:
                    <select name="avisoPrevio" value={form.avisoPrevio} onChange={handleChange} className="rounded border px-2 py-1 text-black">
                      {avisos.map((a) => (
                        <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-black">
                    Férias vencidas:
                    <input
                      type="checkbox"
                      name="feriasVencidas"
                      checked={form.feriasVencidas}
                      onChange={handleChange}
                      disabled={!podeFeriasVencidas}
                      className="rounded border px-2 py-1 text-black"
                    />
                    {!podeFeriasVencidas && (
                      <span className="text-xs text-gray-500">Só é possível ter férias vencidas após 12 meses completos de trabalho.</span>
                    )}
                  </label>
                  <label className="flex flex-col gap-1 text-black">
                    Saldo de FGTS anterior (R$):
                    <input type="number" name="saldoFgts" value={form.saldoFgts} onChange={handleChange} min={0} step={0.01} className="rounded border px-2 py-1 text-black" />
                  </label>
                  <label className="flex flex-col gap-1 text-black">
                    Número de dependentes:
                    <input type="number" name="dependentes" value={form.dependentes} onChange={handleChange} min={0} step={1} className="rounded border px-2 py-1 text-black" />
                  </label>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">Calcular</button>
                </form>
              )}
              {tab === "seguro" && (
                <form onSubmit={handleSubmitSeguro} className="flex flex-col gap-4">
                  <label className="flex flex-col gap-1 text-black">
                    Salário do último mês (R$):
                    <input type="number" name="salario1" value={seguro.salario1 || ""} onChange={handleSeguro} required min={0} step={0.01} className="rounded border px-2 py-1 text-black" />
                  </label>
                  <label className="flex flex-col gap-1 text-black">
                    Salário do penúltimo mês (R$):
                    <input type="number" name="salario2" value={seguro.salario2 || ""} onChange={handleSeguro} required min={0} step={0.01} className="rounded border px-2 py-1 text-black" />
                  </label>
                  <label className="flex flex-col gap-1 text-black">
                    Salário do antepenúltimo mês (R$):
                    <input type="number" name="salario3" value={seguro.salario3 || ""} onChange={handleSeguro} required min={0} step={0.01} className="rounded border px-2 py-1 text-black" />
                  </label>
                  <label className="flex flex-col gap-1 text-black">
                    Meses trabalhados no último emprego:
                    <input type="number" name="mesesTrabalhados" value={seguro.mesesTrabalhados || ""} onChange={handleSeguro} required min={0} step={1} className="rounded border px-2 py-1 text-black" />
                  </label>
                  <label className="flex flex-col gap-1 text-black">
                    Quantas vezes já solicitou o benefício?
                    <select name="solicitacoes" value={seguro.solicitacoes || "1"} onChange={handleSeguro} className="rounded border px-2 py-1 text-black">
                      <option value="1">Primeira vez</option>
                      <option value="2">Segunda vez</option>
                      <option value="3">Terceira vez ou mais</option>
                    </select>
                  </label>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">Calcular</button>
                  {resSeguro && (
                    <div className="mt-4 text-sm text-gray-700">
                      <b>Valor da parcela:</b> R$ {resSeguro.valorParcela.toFixed(2)}<br />
                      <b>Quantidade de parcelas:</b> {resSeguro.qtdeParcelas}<br />
                      <b>Total a receber:</b> R$ {(resSeguro.valorParcela * resSeguro.qtdeParcelas).toFixed(2)}
                      <details className="mt-2">
                        <summary className="cursor-pointer text-blue-700">Ver detalhes do cálculo</summary>
                        <div className="mt-2 text-xs text-gray-700">
                          <b>Média dos salários:</b> R$ {resSeguro.mediaSalarial.toFixed(2)}<br />
                          <b>Faixa aplicada:</b> {resSeguro.faixa}<br />
                          <b>Base legal:</b> Regras oficiais do Seguro-Desemprego 2024<br />
                          <b>Critério de parcelas:</b> {resSeguro.criterioParcelas}
                        </div>
                      </details>
                    </div>
                  )}
                </form>
              )}
              {tab === "mp936" && (
                <form onSubmit={handleSubmitMp936} className="flex flex-col gap-4">
                  <label className="flex flex-col gap-1 text-black">
                    Salário base (R$):
                    <input type="number" name="salario" value={mp936.salario} onChange={handleMp936} required min={0} step={0.01} className="rounded border px-2 py-1 text-black" />
                  </label>
                  <label className="flex flex-col gap-1 text-black">
                    Percentual de redução (%):
                    <input type="number" name="percentualReducao" value={mp936.percentualReducao} onChange={handleMp936} required min={0} max={70} step={1} className="rounded border px-2 py-1 text-black" />
                  </label>
                  <label className="flex flex-col gap-1 text-black">
                    Meses de redução:
                    <input type="number" name="meses" value={mp936.meses} onChange={handleMp936} required min={1} max={12} className="rounded border px-2 py-1 text-black" />
                  </label>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">Calcular</button>
                  {resMp936 && (
                    <div className="mt-4 text-sm text-gray-700">
                      <b>Salário reduzido mensal:</b> R$ {resMp936.salarioReduzido.toFixed(2)}<br />
                      <b>Benefício emergencial total:</b> R$ {resMp936.beneficioEmergencial.toFixed(2)}<br />
                      <b>Total a receber no período:</b> R$ {resMp936.total.toFixed(2)}
                      <div className="text-xs text-gray-500 mt-2">
                        <b>Base legal:</b> MP-936 / Lei 14.020/2020<br />
                        <b>Fórmula:</b> Redução salarial + benefício emergencial proporcional.
                      </div>
                    </div>
                  )}
                </form>
              )}
              {tab === "horasextras" && (
                <form onSubmit={handleSubmitHorasExtras} className="flex flex-col gap-4">
                  <label className="flex flex-col gap-1 text-black">
                    Data do início da relação de trabalho:
                    <input type="date" name="dataAdmissao" value={horasExtras.dataAdmissao} onChange={handleHorasExtras} required className="rounded border px-2 py-1 text-black" />
                  </label>
                  <label className="flex flex-col gap-1 text-black">
                    Início da ocorrência das horas-extras:
                    <input type="date" name="dataInicio" value={horasExtras.dataInicio} onChange={handleHorasExtras} required className="rounded border px-2 py-1 text-black" />
                  </label>
                  <label className="flex flex-col gap-1 text-black">
                    Final da ocorrência das horas-extras:
                    <input type="date" name="dataFim" value={horasExtras.dataFim} onChange={handleHorasExtras} required className="rounded border px-2 py-1 text-black" />
                  </label>
                  <label className="flex flex-col gap-1 text-black">
                    Salário base (R$):
                    <input type="number" name="salario" value={horasExtras.salario} onChange={handleHorasExtras} required min={0} step={0.01} className="rounded border px-2 py-1 text-black" />
                  </label>
                  <label className="flex flex-col gap-1 text-black">
                    Jornada mensal de trabalho:
                    <select name="jornada" value={horasExtras.jornada} onChange={handleHorasExtras} className="rounded border px-2 py-1 text-black">
                      <option value="220">220 horas (8h/dia)</option>
                      <option value="180">180 horas (6h/dia)</option>
                      <option value="custom">Outro</option>
                    </select>
                    {horasExtras.jornada === "custom" && (
                      <input type="number" name="jornadaCustom" placeholder="Informe a jornada mensal" className="rounded border px-2 py-1 text-black mt-1" />
                    )}
                  </label>
                  <label className="flex flex-col gap-1 text-black">
                    Adicional de hora-extra (%):
                    <input type="number" name="adicional" value={horasExtras.adicional} onChange={handleHorasExtras} required min={0} max={200} step={0.01} className="rounded border px-2 py-1 text-black" />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries({
                      segunda: "Segundas-feiras",
                      terca: "Terças-feiras",
                      quarta: "Quartas-feiras",
                      quinta: "Quintas-feiras",
                      sexta: "Sextas-feiras",
                      sabado: "Sábados",
                    }).map(([dia, label]) => {
                      const diaSemana = dia as DiaSemana;
                      return (
                        <div key={dia} className="flex flex-col text-black">
                          <span>{label}:</span>
                          <div className="flex gap-1 items-center">
                            <input type="number" name={`horas-${dia}-h`} value={horasExtras.horas[diaSemana].h} onChange={handleHorasExtras} min={0} max={24} className="w-12 rounded border px-1 py-1 text-black" placeholder="hh" />
                            <span>h</span>
                            <input type="number" name={`horas-${dia}-m`} value={horasExtras.horas[diaSemana].m} onChange={handleHorasExtras} min={0} max={59} className="w-12 rounded border px-1 py-1 text-black" placeholder="mm" />
                            <span>min</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">Calcular</button>
                  {resHorasExtras && (
                    <div className="mt-4 text-black text-sm">
                      <b>Memória de Cálculo:</b>
                      <ul className="mb-2">
                        {resHorasExtras.memoria.map((m: any, i: number) => (
                          <li key={i} className="mb-2">
                            <b>Mês:</b> {m.mes}<br />
                            Salário: R$ {m.salario.toFixed(2)}<br />
                            Salário/hora-extra: R$ {m.valorHoraExtra.toFixed(2)}<br />
                            Total de horas-extras no mês: {m.totalHorasMes.toFixed(2)}<br />
                            Valor das horas-extras: R$ {m.valorHE.toFixed(2)}<br />
                            Reflexo no DSR: R$ {m.dsr.toFixed(2)}<br />
                            FGTS (base R$ {m.valorHE.toFixed(2)}): R$ {m.fgts.toFixed(2)}<br />
                            <b>Total do mês:</b> R$ {m.totalMes.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                      <div className="mb-2"><b>Reflexo nas férias:</b> R$ {resHorasExtras.reflexoFerias.toFixed(2)} + FGTS: R$ {resHorasExtras.fgtsFerias.toFixed(2)}</div>
                      <div className="mb-2"><b>Reflexo no 13º:</b> R$ {resHorasExtras.reflexo13.toFixed(2)} + FGTS: R$ {resHorasExtras.fgts13.toFixed(2)}</div>
                      <div className="mb-2"><b>Total geral:</b> R$ {resHorasExtras.totalGeral.toFixed(2)}</div>
                    </div>
                  )}
                </form>
              )}
              {tab === "rescisao" && resultado && (
                <div className="mt-6 text-black">
                  <h2 className="text-lg font-bold mb-2">Memória de Cálculo</h2>
                  <ul className="text-sm mb-2">
                    <li><b>Admissão:</b> {resultado.adm.toLocaleDateString('pt-BR')}</li>
                    <li><b>Afastamento:</b> {resultado.afs.toLocaleDateString('pt-BR')}</li>
                    <li><b>Última data do contrato:</b> {resultado.ultimaDataContrato.toLocaleDateString('pt-BR')}</li>
                    <li><b>Motivo:</b> {resultado.motivo}</li>
                    <li><b>Salário base:</b> R$ {resultado.salario.toFixed(2)}</li>
                    <li><b>Aviso prévio:</b> {resultado.avisoPrevio}</li>
                  </ul>
                  <div className="mb-2 font-bold text-blue-700">Salários</div>
                  <div className="mb-2">Saldo de salário ({resultado.diasTrabalhados}/{resultado.diasMes}):  R$ {resultado.saldoSalario.toFixed(2)}    [INSS: R$ {resultado.inssSalario.toFixed(2)}]</div>
                  <div className="mb-2">Total de salários:  R$ {resultado.totalSalarios.toFixed(2)}</div>
                  <div className="mb-2">Parcela do INSS do empregado sobre salários:  R$ {resultado.inssSalario.toFixed(2)}</div>
                  <div className="mb-2">IRPF sobre salários (base = R$ {resultado.saldoSalario.toFixed(2)} - R$ {resultado.inssSalario.toFixed(2)} = R$ {(resultado.saldoSalario - resultado.inssSalario).toFixed(2)}):  R$ {resultado.irrfSalario.toFixed(2)}</div>
                  <div className="mb-2">Total de descontos sobre salários:  R$ {resultado.totalDescontosSalarios.toFixed(2)}</div>
                  {/* Décimo terceiro - só exibe se houver valor a receber e não for justa causa */}
                  {resultado.motivo !== "Dispensa com justa causa" && resultado.decimoTerceiro > 0 && (
                    <>
                      <div className="mb-2 font-bold text-blue-700 mt-4">Décimo terceiro</div>
                      <div className="mb-2">Décimo terceiro proporcional ({resultado.meses13}/12):  R$ {resultado.decimoTerceiro.toFixed(2)}   [INSS: R$ {resultado.inss13.toFixed(2)}]</div>
                      <div className="mb-2">Total de décimo terceiro:  R$ {resultado.totalDecimoTerceiro.toFixed(2)}</div>
                      <div className="mb-2">Parcela do INSS do empregado sobre décimo terceiro:  R$ {resultado.inss13.toFixed(2)}</div>
                      <div className="mb-2">IRPF sobre décimo terceiro (base = R$ {resultado.decimoTerceiro.toFixed(2)} - R$ {resultado.inss13.toFixed(2)} = R$ {(resultado.decimoTerceiro - resultado.inss13).toFixed(2)}):  R$ {resultado.irrf13.toFixed(2)}</div>
                      <div className="mb-2">Total de descontos sobre décimo terceiro:  R$ {resultado.totalDescontos13.toFixed(2)}</div>
                    </>
                  )}
                  {/* Férias - só exibe se houver valor a receber e não for justa causa */}
                  {resultado.motivo !== "Dispensa com justa causa" && (resultado.valorFeriasVencidas > 0 || resultado.valorFeriasProporcionais > 0) && (
                    <>
                      <div className="mb-2 font-bold text-blue-700 mt-4">Férias</div>
                      {resultado.valorFeriasVencidas > 0 && (
                        <div className="mb-2 bg-yellow-50 border-l-4 border-yellow-400 p-2 text-xs text-gray-700 rounded">
                          <b>Férias vencidas:</b> O empregado completou 12 meses de trabalho e tem direito a receber 1 salário integral + 1/3 constitucional referente ao período aquisitivo completo.<br/>
                          Valor: R$ {resultado.valorFeriasVencidas.toFixed(2)} + 1/3: R$ {resultado.tercoFeriasVencidas.toFixed(2)}
                        </div>
                      )}
                      <div className="mb-2">Férias vencidas: R$ {resultado.valorFeriasVencidas.toFixed(2)}</div>
                      <div className="mb-2">1/3 constitucional sobre férias vencidas: R$ {resultado.tercoFeriasVencidas.toFixed(2)}</div>
                      <div className="mb-2">Férias proporcionais ({resultado.mesesFeriasProporcionais}/12): R$ {resultado.valorFeriasProporcionais.toFixed(2)}</div>
                      <div className="mb-2">1/3 constitucional sobre férias proporcionais: R$ {resultado.tercoFeriasProporcionais.toFixed(2)}</div>
                      <div className="mb-2 font-bold">Total bruto de férias: R$ {(resultado.valorFeriasVencidas + resultado.tercoFeriasVencidas + resultado.valorFeriasProporcionais + resultado.tercoFeriasProporcionais).toFixed(2)}</div>
                      <div className="mb-2">INSS sobre férias:  R$ 0,00</div>
                      <div className="mb-2">IRPF sobre férias:  R$ 0,00</div>
                      <div className="mb-2">Total de descontos sobre férias:  R$ 0,00</div>
                      <div className="mb-2 font-bold">Líquido a receber de férias: R$ {(resultado.valorFeriasVencidas + resultado.tercoFeriasVencidas + resultado.valorFeriasProporcionais + resultado.tercoFeriasProporcionais).toFixed(2)}</div>
                    </>
                  )}
                  <div className="mb-2 font-bold text-blue-700 mt-4">Outros vencimentos</div>
                  <div className="mb-2">Total de outros vencimentos:  R$ {resultado.totalOutrosVencimentos.toFixed(2)}</div>
                  <div className="mb-2">Parcela do INSS do empregado sobre outros vencimentos:  R$ 0,00</div>
                  <div className="mb-2">IRPF sobre outros vencimento (base = R$ 0,00):  R$ 0,00</div>
                  <div className="mb-2">Total de descontos sobre outros vencimentos:  R$ {resultado.totalDescontosOutros.toFixed(2)}</div>
                  <div className="mb-2 font-bold text-blue-700 mt-4">Outros descontos do empregado</div>
                  <div className="mb-2">Total de outros descontos:  R$ 0,00</div>
                  <div className="mb-4 font-bold text-blue-700 mt-4">Total de Vencimentos:</div>
                  <div className="mb-2">R$ {resultado.totalSalarios.toFixed(2)} + R$ {resultado.totalOutrosVencimentos.toFixed(2)} + R$ {resultado.totalDecimoTerceiro.toFixed(2)} + R$ {resultado.totalFerias.toFixed(2)} + R$ {resultado.totalOutrosVencimentos.toFixed(2)} = R$ {resultado.totalVencimentos.toFixed(2)}</div>
                  <div className="mb-4 font-bold text-blue-700 mt-4">Total de Descontos:</div>
                  <div className="mb-2">R$ {resultado.totalDescontosSalarios.toFixed(2)} + R$ {resultado.totalDescontos13.toFixed(2)} + R$ {resultado.totalDescontosOutros.toFixed(2)} + R$ {resultado.totalDescontosOutros.toFixed(2)} + R$ 0,00 = R$ {resultado.totalDescontos.toFixed(2)}</div>
                  <div className="text-xl font-bold text-blue-700 mt-4">Total Líquido:<br/>R$ {resultado.totalLiquido.toFixed(2)}</div>
                  {resultado.motivo === "Dispensa com justa causa" && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3 text-xs text-red-800 rounded">
                      <b>Atenção:</b> Na dispensa por justa causa, o empregado perde o direito ao aviso prévio, férias proporcionais, férias vencidas e 13º salário. Recebe apenas o saldo de salário dos dias trabalhados até a data do afastamento, descontados INSS e IRRF.
                    </div>
                  )}
                  {resultado.motivo === "Dispensa sem justa causa" && (
                    <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-3 text-xs text-green-800 rounded">
                      <b>Obs:</b> Além do valor da rescisão, o empregado tem direito à multa de 40% sobre o valor do FGTS.<br/>
                      Base de cálculo FGTS: R$ {resultado.fgtsBase.toFixed(2)}<br/>
                      Multa de 40%: <b>R$ {resultado.multaFgts.toFixed(2)}</b>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-full md:w-80 flex-shrink-0 flex justify-center md:justify-end">
          <div className="bg-white/95 rounded-xl shadow-lg p-6 border-l border-gray-200 w-full">
            <SidebarAcoes resultado={resultado ? JSON.stringify(resultado, null, 2) : ""} />
          </div>
        </div>
      </div>
    </div>
  );
} 