import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/lucroList.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Pedido {
  id: number;
  descricao: string;
  responsavel?: string;
  ano_saida?: number | null;
  mes_saida?: string | null;
  dia_saida?: number | null;
  quant_saida?: number | null;
  valor_unitario_venda?: number | null;
  valor_total_saida?: number | null;
  margem_aplicada?: string | null;
  lucratividade_unitario?: number | null;
  lucratividade_total?: number | null;
}

export default function LucroList() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filtro, setFiltro] = useState("");
  const [ordem, setOrdem] = useState<{ coluna: string; asc: boolean }>({
    coluna: "descricao",
    asc: true,
  });
  const [mesFiltro, setMesFiltro] = useState<string>("");

  const [modoGrafico, setModoGrafico] = useState<"dia" | "mes" | "ano">("dia");
  const [dataInicio, setDataInicio] = useState("");
  const [quinzena, setQuinzena] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [mostrarLucro, setMostrarLucro] = useState(true);



  useEffect(() => {
    buscarPedidos();
  }, []);

  const buscarPedidos = async () => {
    try {
      const res = await api.get("/pedidos");
      const dados: Pedido[] = res.data.map((p: any) => ({
        id: Number(p.id),
        descricao: p.descricao,
        responsavel: p.responsavel ?? null,
        ano_saida: p.ano_saida ?? null,
        mes_saida: p.mes_saida ?? null,
        dia_saida: p.dia_saida ?? null,
        quant_saida: Number(p.quant_saida || 0),
        valor_unitario_venda: Number(p.valor_unitario_venda || 0),
        valor_total_saida: Number(p.valor_total_saida || 0),
        margem_aplicada: p.margem_aplicada ?? null,
        lucratividade_unitario: Number(p.lucratividade_unitario || 0),
        lucratividade_total: Number(p.lucratividade_total || 0),
      }));
      setPedidos(dados);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    }
  };

  const formatarValorSeguro = (valor?: number | string | null) => {
  if (!mostrarLucro) return "R$ •••••";
  return formatarValor(valor);
};


  const formatarValor = (valor?: number | string | null) => {
    const numero = parseFloat(String(valor || "0"));
    if (isNaN(numero)) return "R$ 0,00";
    return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatarDataSaida = (p: Pedido) => {
  if (!p.dia_saida || !p.mes_saida || !p.ano_saida) return "";
  return `${String(p.dia_saida).padStart(2, "0")}/${p.mes_saida}/${p.ano_saida}`;
};


const pedidosFiltrados = pedidos.filter((p) => {
  // 🔎 FILTRO DE TEXTO
  const textoOk =
    p.descricao?.toLowerCase().includes(filtro.toLowerCase()) ||
    (p.responsavel ?? "").toLowerCase().includes(filtro.toLowerCase());

  // 🔎 FILTRO POR MÊS
  const mesOk = !mesFiltro || p.mes_saida === mesFiltro;

  // 🔹 Monta a data real do pedido
  let dataPedido: Date | null = null;
if (p.dia_saida && p.mes_saida && p.ano_saida) {
  dataPedido = new Date(p.ano_saida, Number(p.mes_saida) - 1, p.dia_saida);
}


  // 🔹 FILTRO POR DATA INICIAL
  const dataInicioOk =
    !dataInicio || (dataPedido && dataPedido >= new Date(dataInicio));

  // 🔹 FILTRO POR QUINZENA
  let quinzenaOk = true;
  if (quinzena && dataPedido) {
    const dia = dataPedido.getDate();
    if (quinzena === "1") quinzenaOk = dia >= 1 && dia <= 15;
    if (quinzena === "2") quinzenaOk = dia >= 16 && dia <= 31;
  }

  // -----------------------------------------------------------------------
  // 📅 FILTRO INTELIGENTE (26, 2601, 26012025, 26/01/2025, etc)
  // -----------------------------------------------------------------------
  if (filtroData.trim() !== "") {
    const limpa = filtroData.replace(/\D/g, "");

    if (limpa.length === 2) {
      const diaFiltro = Number(limpa);
      if (p.dia_saida !== diaFiltro) return false;
    }

    if (limpa.length === 4) {
      const diaFiltro = Number(limpa.slice(0, 2));
      const mesFiltro = Number(limpa.slice(2, 4));
      if (
        p.dia_saida !== diaFiltro ||
        Number(p.mes_saida) !== mesFiltro
      )
        return false;
    }

      if (limpa.length === 8) {
  const diaFiltro = Number(limpa.slice(0, 2));
  const mesFiltro = Number(limpa.slice(2, 4));
  const anoFiltro = Number(limpa.slice(4, 8));

  if (
    p.dia_saida !== diaFiltro ||
    Number(p.mes_saida) !== mesFiltro ||
    p.ano_saida !== anoFiltro
  )
    return false;
}


  }

  return textoOk && mesOk && dataInicioOk && quinzenaOk;
});

const EyeOpen = ({ size = 22 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);


const EyeClosed = ({ size = 22 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.94" />
    <path d="M1 1l22 22" />
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M12 4c7 0 11 8 11 8a21.77 21.77 0 0 1-3.17 4.35" />
  </svg>
);


  const lucroTotalMes = pedidosFiltrados.reduce(
    (acc, p) => acc + (p.lucratividade_total || 0),
    0
  );

  const ordenarPor = (coluna: keyof Pedido) => {
    const asc = ordem.coluna === coluna ? !ordem.asc : true;
    setOrdem({ coluna: coluna as string, asc });

    setPedidos((prev) =>
      [...prev].sort((a, b) => {
        const A = (a[coluna] ?? "") as any;
        const B = (b[coluna] ?? "") as any;
        if (typeof A === "string" && typeof B === "string") {
          return asc ? A.localeCompare(B) : B.localeCompare(A);
        }
        return asc ? Number(A) - Number(B) : Number(B) - Number(A);
      })
    );
  };

  // --------------------------
// GERAÇÃO DOS DADOS DO GRÁFICO
// --------------------------
let labels: string[] = [];
let valores: number[] = [];

if (modoGrafico === "mes") {
  // 🔵 LUCRO POR MÊS + ANO (SEM CONFUSÃO DE ORDEM)

  const mapa = new Map<string, number>();

  pedidosFiltrados.forEach((p) => {
    if (!p.mes_saida || !p.ano_saida) return;

    const chave = `${String(p.mes_saida).padStart(2, "0")}/${p.ano_saida}`;

    mapa.set(
      chave,
      (mapa.get(chave) || 0) + (p.lucratividade_total || 0)
    );
  });

  // Ordena corretamente por data real
  labels = Array.from(mapa.keys()).sort((a, b) => {
    const [mesA, anoA] = a.split("/").map(Number);
    const [mesB, anoB] = b.split("/").map(Number);

    const dataA = new Date(anoA, mesA - 1, 1);
    const dataB = new Date(anoB, mesB - 1, 1);

    return dataA.getTime() - dataB.getTime();
  });

  valores = labels.map((label) => mapa.get(label) || 0);

} else if (modoGrafico === "dia") {
  // 🟢 LUCRO POR DIA (ORDENADO CORRETAMENTE)

  const mapa = new Map<string, number>();

  pedidosFiltrados.forEach((p) => {
    if (!p.dia_saida || !p.mes_saida || !p.ano_saida) return;

    const chave = `${String(p.dia_saida).padStart(2, "0")}/${String(
  p.mes_saida
).padStart(2, "0")}/${String(p.ano_saida).slice(-2)}`;


    mapa.set(
      chave,
      (mapa.get(chave) || 0) + (p.lucratividade_total || 0)
    );
  });

  labels = Array.from(mapa.keys()).sort((a, b) => {
    const [diaA, mesA, anoA] = a.split("/").map(Number);
    const [diaB, mesB, anoB] = b.split("/").map(Number);

    const dataA = new Date(anoA, mesA - 1, diaA);
    const dataB = new Date(anoB, mesB - 1, diaB);

    return dataA.getTime() - dataB.getTime();
  });

  valores = labels.map((label) => mapa.get(label) || 0);

} else if (modoGrafico === "ano") {
  // 🟡 LUCRO POR ANO

  const mapa = new Map<string, number>();

  pedidosFiltrados.forEach((p) => {
    if (!p.ano_saida) return;

    const ano = String(p.ano_saida);

    mapa.set(
      ano,
      (mapa.get(ano) || 0) + (p.lucratividade_total || 0)
    );
  });

  labels = Array.from(mapa.keys()).sort();
  valores = labels.map((ano) => mapa.get(ano) || 0);
}

  const dataGrafico = {
    labels,
    datasets: [
      {
        label:
          modoGrafico === "mes"
            ? "Lucro por Mês"
            : modoGrafico === "dia"
            ? "Lucro por Dia"
            : "Lucro por Ano",
        data: valores,
        fill: false,
        tension: 0.2,
        borderWidth: 2,
        borderColor: "#a154c7ff",
        pointBackgroundColor: "#a154c7ff",
      },
    ],
  };

  const opcoesGrafico: any = {
    plugins: {
      legend: { labels: { color: "#fff", font: { size: 12 } } },
      title: {
        display: true,
        text:
          modoGrafico === "mes"
            ? "Lucro por Mês"
            : modoGrafico === "dia"
            ? "Lucro por Dia"
            : "Lucro por Ano",
        color: "#fff",
        font: { size: 14, weight: "bold" },
      },
    },
    scales: {
      x: { ticks: { color: "#fff" } },
      y: {
        ticks: {
          color: "#fff",
          callback: (v: any) => formatarValor(v),
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

const exportarPDF = () => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "A4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const dataAtual = new Date().toLocaleDateString("pt-BR");

  // ======================
  // CABEÇALHO (CAIXA)
  // ======================
  const headerX = 40;
  const headerY = 30;
  const headerWidth = pageWidth - 80;
  const headerHeight = 40;

  doc.setDrawColor(0);
  doc.setLineWidth(1);
  doc.rect(headerX, headerY, headerWidth, headerHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(
    "RELATÓRIO DE LUCRO",
    headerX + headerWidth / 2,
    headerY + headerHeight / 2 + 5,
    { align: "center" }
  );

  // ======================
  // AGRUPAR POR PRODUTO
  // ======================
  const lucroPorProduto: Record<
    string,
    { descricao: string; quantidade: number; lucro: number }
  > = {};

  pedidosFiltrados.forEach((p) => {
    const descricao = p.descricao || "Produto sem nome";
    const chave = descricao;

    if (!lucroPorProduto[chave]) {
      lucroPorProduto[chave] = {
        descricao,
        quantidade: 0,
        lucro: 0,
      };
    }

    lucroPorProduto[chave].quantidade += Number(p.quant_saida || 0);
    lucroPorProduto[chave].lucro += Number(p.lucratividade_total || 0);
  });

  const resumoArray = Object.values(lucroPorProduto);

  // ======================
  // TABELA
  // ======================
  autoTable(doc, {
    startY: 90,
    margin: { left: 55, right: 40 },
    head: [["Produto", "Qtd Vendida", "Lucro Total"]],
    body: resumoArray.map((r) => [
      r.descricao,
      r.quantidade,
      formatarValor(r.lucro),
    ]),
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 6,
      textColor: "#000",
      lineColor: "#000",
      lineWidth: 1,
    },
    headStyles: {
      fillColor: "#fff",
      textColor: "#000",
      fontStyle: "bold",
      lineColor: "#000",
      lineWidth: 1,
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 250 },
      1: { halign: "center", cellWidth: 80 },
      2: { halign: "right", cellWidth: 120 }, // lucro alinhado à direita 🔥
    },
  } as any);

  // ======================
  // TOTAL GERAL DO PERÍODO
  // ======================
  const totalGeral = pedidosFiltrados.reduce(
    (acc, p) => acc + Number(p.lucratividade_total || 0),
    0
  );

  const yTotal = (doc as any).lastAutoTable.finalY + 15;
  const larguraTotal = 240;
  const xTotal = pageWidth - larguraTotal - 40;

  doc.setFontSize(11);
  doc.rect(xTotal, yTotal, larguraTotal, 25);

  doc.text(
    `LUCRO TOTAL DO PERÍODO: ${formatarValor(totalGeral)}`,
    xTotal + larguraTotal / 2,
    yTotal + 17,
    { align: "center" }
  );

  // ======================
  // RODAPÉ
  // ======================
  doc.setFontSize(9);
  doc.text(`Gerado em: ${dataAtual}`, 55, yTotal + 50);

  // ======================
  // SALVAR
  // ======================
  doc.save(`relatorio_lucro_${dataAtual}.pdf`);
};
  // ---------------------------------------------------
  // EXPORTAR EXCEL
  // ---------------------------------------------------
  const exportarXLSX = () => {
  const dados = pedidosFiltrados.map((p) => ({
    Descrição: p.descricao || "",
    Responsável: p.responsavel || "",
    Quantidade: p.quant_saida || "",
    "Valor Unitário": formatarValor(p.valor_unitario_venda),
    "Valor Total": formatarValor(p.valor_total_saida),
    "Lucro Unitário": formatarValor(p.lucratividade_unitario),
    "Lucro Total": formatarValor(p.lucratividade_total),
    Margem: p.margem_aplicada || "",
  }));

  const wb = XLSX.utils.book_new();

  const cabecalho = [
    ["Relatório de Lucro"],
    [], // linha vazia antes da tabela
  ];

  const ws = XLSX.utils.aoa_to_sheet(cabecalho);
  XLSX.utils.sheet_add_json(ws, dados, { origin: -1 });

  // LARGURA DAS COLUNAS (ajuste fino)
  const colunas = [
    { wch: 30 }, // Descrição
    { wch: 20 }, // Responsável
    { wch: 12 }, // Quantidade
    { wch: 15 }, // Valor Unitário
    { wch: 15 }, // Valor Total
    { wch: 15 }, // Lucro Unitário
    { wch: 15 }, // Lucro Total
    { wch: 12 }, // Margem
  ];
  ws["!cols"] = colunas;

  const totalLinhas = dados.length + cabecalho.length;

  // 🌟 ESTILOS EXATAMENTE COMO O ESTOQUE
  for (let R = 0; R < totalLinhas; R++) {
    for (let C = 0; C < 9; C++) {
      const cell_ref = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cell_ref]) continue;

      const isTitulo = R === 0;
      const isHeaderTabela = R === cabecalho.length - 1;
      const isHeader = isTitulo || isHeaderTabela;

      ws[cell_ref].s = {
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
        font: {
          name: "Arial",
          sz: 11,
          bold: isHeader,
          color: { rgb: isTitulo ? "FFFFFF" : isHeader ? "FFFFFF" : "000000" },
        },
        alignment: { vertical: "center", horizontal: "center" },

        fill: isTitulo
          ? { fgColor: { rgb: "000000" } } // preto
          : isHeaderTabela
          ? { fgColor: { rgb: "333333" } } // cinza escuro
          : R % 2 === 1
          ? { fgColor: { rgb: "F5F5F5" } } // alternado
          : { fgColor: { rgb: "FFFFFF" } }, // linha branca
      };
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, "Lucro");

  const arrayBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });
  saveAs(blob, "relatorio_lucro.xlsx");
saveAs(blob, "relatorio_lucro.xlsx");
};


  return (
    <div className="lucro-container">
      <h2>Relatório de Lucro</h2>

      <div className="filtros">
        <input
          type="text"
          placeholder="Buscar"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />

      <input
  type="text"
  placeholder="Data"
  value={filtroData}
  onChange={(e) => setFiltroData(e.target.value)}
  maxLength={10}
  className="input-data"
/>


      {/* FILTRO QUINZENAL */}
      <select value={quinzena} onChange={(e) => setQuinzena(e.target.value)}>
        <option value="">Quinzena (todas)</option>
        <option value="1">1ª Quinzena (1–15)</option>
        <option value="2">2ª Quinzena (16–31)</option>
      </select>

        <select value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)}>
          <option value="">Todos os meses</option>
          {Array.from(
            new Set(pedidos.map((p) => p.mes_saida || "").filter((m) => m))
          )
            .sort()
            .map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
        </select>

        <select
          value={modoGrafico}
          onChange={(e) => setModoGrafico(e.target.value as any)}
        >
          <option value="mes">Lucro por Mês</option>
          <option value="dia">Lucro por Dia</option>
          <option value="ano">Lucro por Ano</option>
        </select>

        <button className="btn-exportar pdf" onClick={exportarPDF}>
          📄 PDF
        </button>

        <button className="btn-exportar excel" onClick={exportarXLSX}>
          📊 Excel
        </button>
      </div>
      <div className="valor-total-mes">
  <strong>
    Lucro total: {formatarValorSeguro(lucroTotalMes)}
  </strong>

  <button
  className="btn-olho"
  onClick={() => setMostrarLucro((prev) => !prev)}
  title={mostrarLucro ? "Ocultar valores" : "Mostrar valores"}
>
  {mostrarLucro ? <EyeOpen size={18} /> : <EyeClosed size={18} />}
</button>

</div>



      <div
        className="chart-container"
        style={{ marginBottom: 24, maxWidth: 900, height: 300 }}
      >
        <Chart type="line" data={dataGrafico as any} options={opcoesGrafico} />
      </div>

      <table className="lucro-tabela">
        <thead>
          <tr>
            <th onClick={() => ordenarPor("descricao")}>Descrição</th>
            <th>Entrada</th>
            <th onClick={() => ordenarPor("quant_saida")}>Quantidade</th>
            <th>Valor Unitário</th>
            <th>Valor Total</th>
            <th>Lucro Unitário</th>
            <th>Lucro Total</th>
            <th>Margem</th>
          </tr>
        </thead>

        <tbody>
          {pedidosFiltrados.map((p) => (
            <tr key={p.id}>
              <td>{p.descricao}</td>
              <td>{formatarDataSaida(p)}</td>
              <td>{p.quant_saida}</td>

              <td className={(p.lucratividade_unitario || 0) < 0 ? "negativo" : "positivo"}>
                {formatarValor(p.valor_unitario_venda)}
              </td>

              <td>{formatarValor(p.valor_total_saida)}</td>

              <td className={(p.lucratividade_unitario || 0) < 0 ? "negativo" : "positivo"}>
                {formatarValor(p.lucratividade_unitario)}
              </td>

              <td className={(p.lucratividade_total || 0) < 0 ? "negativo" : "positivo"}>
                {formatarValorSeguro(p.lucratividade_total)}
              </td>

              <td>{p.margem_aplicada}</td>
            </tr>
          ))}

          <tr className="total-row">
            <td colSpan={6}>TOTAL</td>
            <td className="total-valor">{formatarValor(lucroTotalMes)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
