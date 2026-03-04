import { useState, useEffect } from "react";
import api from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import "../styles/pedidosList.css";

interface Pedido {
  id: number;
  descricao: string;
  quant_saida?: number;
  responsavel?: string;
  localidade?: string;
  valor_unitario_venda?: number;
  valor_total_saida?: number;
  dia_saida?: number;
  mes_saida?: number;   
  ano_saida?: number;
  data_saida?: string;
}


interface EstoqueItem {
  codigoItem: number;
  descricao: string;
  estoque_quantidade?: number;
  valor_venda?: number;
}

export default function PedidosList() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
  const [formData, setFormData] = useState<Partial<Pedido>>({});
  const [itensPedido, setItensPedido] = useState<Partial<Pedido>[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filtroEstoque, setFiltroEstoque] = useState<EstoqueItem[]>([]);
  const [filtro, setFiltro] = useState("");
  const [ordemDescAsc, setOrdemDescAsc] = useState(true);
  const [ordemRespAsc, setOrdemRespAsc] = useState(true);
  const [editando, setEditando] = useState(false);
  const [filtroData, setFiltroData] = useState("");


  useEffect(() => {
    carregarPedidos();
    carregarEstoque();
  }, []);

  async function carregarPedidos() {
    const res = await api.get("/pedidos");
    setPedidos(res.data);
  }

  async function carregarEstoque() {
    const res = await api.get("/estoque");
    setEstoque(res.data);
  }

  const diaFiltro = filtroData ? Number(filtroData.split("-")[2]) : null;
  const mesFiltro = filtroData ? Number(filtroData.split("-")[1]) : null;


  const formatarValor = (valor?: string | number) => {
    const numero = parseFloat(String(valor || "0"));
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatarDataPedido = (p: Pedido) => {
  if (!p.dia_saida || !p.mes_saida || !p.ano_saida) return "";
  return `${String(p.dia_saida).padStart(2, "0")}/${String(p.mes_saida).padStart(2, "0")}/${p.ano_saida}`;
};


  /** 🔥 PREVER PREÇO (para aplicar desconto automático) */
  async function preverPreco() {
    if (!formData.descricao || !formData.quant_saida) return;

    try {
      const res = await api.post("/pedidos/prever", {
        descricao: formData.descricao,
        quant_saida: formData.quant_saida,
        responsavel: formData.responsavel,
      });

      setFormData(prev => ({
        ...prev,
        valor_unitario_venda: res.data.valor_unitario_venda,
        valor_total_saida: res.data.valor_total_saida,
      }));
    } catch (err) {
      console.error("Erro ao prever preço:", err);
    }
  }

  async function criarPedido() {
    try {
      // ----------------------------
      // Função auxiliar pra extrair data
      // ----------------------------
      const extrairData = (origem: any) => {
        if (!origem?.data_saida) return {};

        const [ano, mes, dia] = origem.data_saida.split("-");
          return {
            dia_saida: Number(dia),
            mes_saida: Number(mes),      // ✅ number
            ano_saida: Number(ano),
          };
      };

      const dataBase = itensPedido[0]?.data_saida || formData.data_saida;

      if (itensPedido.length > 0) {
        for (const item of itensPedido) {
        const dataExtraida = extrairData({ data_saida: dataBase });

        const payload = {
          ...item,
          quant_saida: Number(item.quant_saida) || 0,
          ...dataExtraida,
        };

        await api.post("/pedidos", payload);
      }
      }
      // ----------------------------
      // ITEM ÚNICO
      // ----------------------------
      else {
        const dataExtraida = extrairData(formData);

        const payload = {
          ...formData,
          quant_saida: Number(formData.quant_saida) || 0,
          ...dataExtraida,
        };

        await api.post("/pedidos", payload);
      }

      await carregarPedidos();
      await carregarEstoque();

      setItensPedido([]);
      setFormData({});
      setShowModal(false);
    } catch (err: any) {
      alert(err.response?.data?.error || "Erro ao criar pedido.");
    }
  }



  const pedidosFiltradosPorData = pedidos.filter((p) => {
    if (!filtroData) return true; // sem data → não filtra

    return (
      p.dia_saida === diaFiltro &&
      Number(p.mes_saida) === mesFiltro
    );
  });







  async function editarPedido() {
    try {
      const payload = {
        ...formData,
        quant_saida: Number(formData.quant_saida),
        // ❗ backend recalcula, não enviar preço
      };

      await api.put(`/pedidos/${formData.id}`, payload);
      await carregarPedidos();
      setShowModal(false);
      setEditando(false);
      setFormData({});
    } catch (error) {
      alert("Erro ao editar pedido.");
    }
  }

  // ----------------------------
  // FILTRO POR DESCRIÇÃO OU RESPONSÁVEL
  // ----------------------------
  const pedidosFiltradosPorTexto = pedidosFiltradosPorData.filter((p) => {
    const termo = filtro.toLowerCase();

    return (
      p.descricao.toLowerCase().includes(termo) ||
      (p.responsavel?.toLowerCase().includes(termo) ?? false)
    );
  });

  // ----------------------------
  // ORDENAR POR DESCRIÇÃO
  // ----------------------------
  const ordenarPorDescricao = () => {
    const novaOrdem = !ordemDescAsc;
    setOrdemDescAsc(novaOrdem);
    setPedidos([
      ...pedidos.sort((a, b) => {
        const A = a.descricao.toLowerCase();
        const B = b.descricao.toLowerCase();
        if (A < B) return novaOrdem ? -1 : 1;
        if (A > B) return novaOrdem ? 1 : -1;
        return 0;
      }),
    ]);
  };

  // ----------------------------
  // ORDENAR POR RESPONSÁVEL
  // ----------------------------
  const ordenarPorResponsavel = () => {
    const novaOrdem = !ordemRespAsc;
    setOrdemRespAsc(novaOrdem);
    setPedidos([
      ...pedidos.sort((a, b) => {
        const A = (a.responsavel || "").toLowerCase();
        const B = (b.responsavel || "").toLowerCase();
        if (A < B) return novaOrdem ? -1 : 1;
        if (A > B) return novaOrdem ? 1 : -1;
        return 0;
      }),
    ]);
  };

  // ----------------------------
  // SUGESTÕES DO ESTOQUE
  // ----------------------------
  useEffect(() => {
    if (formData.descricao && formData.descricao.trim() !== "") {
      const termo = formData.descricao.toLowerCase();
      const filtrados = estoque.filter((e) =>
        e.descricao.toLowerCase().includes(termo)
      );
      setFiltroEstoque(filtrados);
    } else {
      setFiltroEstoque([]);
    }
  }, [formData.descricao, estoque]);

  function escolherItem(item: EstoqueItem) {
    setFormData((prev) => ({
      ...prev,
      descricao: item.descricao,
      valor_unitario_venda:
        prev.valor_unitario_venda == null
          ? item.valor_venda
          : prev.valor_unitario_venda,
    }));
    setFiltroEstoque([]);
  }

  const pedidosFiltrados = pedidos.filter((p) => {
    const termo = filtro.toLowerCase().trim();

    // 🔍 MODO LOJA → começa com "@"
    if (termo.startsWith("@")) {
      const loja = termo.replace("@", "").trim();
      if (p.localidade?.toLowerCase() !== loja) return false;
    }
    // 🔍 MODO PADRÃO → busca ampla
    else if (termo.trim() !== "") {
      const textoPassa =
        p.descricao?.toLowerCase().includes(termo) ||
        p.responsavel?.toLowerCase().includes(termo) ||
        p.localidade?.toLowerCase().includes(termo);

      if (!textoPassa) return false;
    }

    // ------------------------
    // FILTRO DE DATA INTELIGENTE
    // ------------------------
    if (filtroData.trim() !== "") {
      const limpa = filtroData.replace(/\D/g, ""); // só números

      // apenas dia → ex: "26"
      if (limpa.length === 2) {
        const diaFiltro = Number(limpa);
        if (p.dia_saida !== diaFiltro) return false;
      }

      // dia + mês → ex: "2601"
      if (limpa.length === 4) {
        const diaFiltro = Number(limpa.slice(0, 2));
        const mesFiltro = Number(limpa.slice(2, 4));
        if (p.dia_saida !== diaFiltro || Number(p.mes_saida) !== mesFiltro)
          return false;
      }

      // dia + mês + ano → ex: "26012025"
      if (limpa.length === 8) {
        const diaFiltro = Number(limpa.slice(0, 2));
        const mesFiltro = Number(limpa.slice(2, 4));
        const anoFiltro = Number(limpa.slice(4, 8));
        if (
          p.dia_saida !== diaFiltro ||
          Number(p.mes_saida) !== mesFiltro ||
          Number(p.ano_saida) !== anoFiltro
        )
          return false;
      }
    }

    return true;
  });

  // ----------------------------
  // AUTO-PREENCHER PELO RESPONSÁVEL
  // ----------------------------
  function preencherAutomaticoResponsavel(nome: string) {
    if (!nome.trim()) return;

    const pedidosDoResponsavel = pedidos
      .filter((p) => p.responsavel?.toLowerCase() === nome.toLowerCase())
      .sort((a, b) => b.id - a.id);

    if (pedidosDoResponsavel.length > 0) {
      const ultimo = pedidosDoResponsavel[0];

      setFormData((prev) => ({
        ...prev,
        localidade: ultimo.localidade || prev.localidade,
        valor_unitario_venda:
          ultimo.valor_unitario_venda || prev.valor_unitario_venda,
      }));
    }
  }

  const valorTotal =
    (formData.quant_saida || 0) *
    (formData.valor_unitario_venda || 0);

  const totalPedidos = pedidosFiltrados.reduce((acc, p) => {
    return acc + (Number(p.valor_total_saida) || 0);
  }, 0);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      valor_total_saida: valorTotal,
    }));
  }, [formData.quant_saida, formData.valor_unitario_venda]);

  /** 🔥 RECALCULAR PREÇO QUANDO DADOS MUDAM */
  useEffect(() => {
    preverPreco();
  }, [formData.descricao, formData.quant_saida, formData.responsavel, formData.localidade]);


 
const exportarPDF = () => {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "A4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // ======================
    // DATA DO PEDIDO
    // ======================
    const dataPedido =
      pedidosFiltrados.length > 0 &&
      pedidosFiltrados[0].dia_saida &&
      pedidosFiltrados[0].mes_saida &&
      pedidosFiltrados[0].ano_saida
        ? `${String(pedidosFiltrados[0].dia_saida).padStart(2, "0")}/${String(
            pedidosFiltrados[0].mes_saida
          ).padStart(2, "0")}/${pedidosFiltrados[0].ano_saida}`
        : new Date().toLocaleDateString("pt-BR");

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

    // ======================
    // LOGO
    // ======================
    const logo = new Image();
    logo.src = "/images/image.png"; // frontend/public/images/image.png

    logo.onload = () => {
      const logoWidth = 80;
      const logoHeight = 40 ;
      const logoX = headerX + 0;
      const logoY = headerY + (headerHeight - logoHeight) / 2;

      doc.addImage(
        logo,
        "PNG",
        logoX,
        logoY,
        logoWidth,
        logoHeight
      );

      // ======================
      // TEXTO DO CABEÇALHO
      // ======================
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(
        "SAÍDA DE MERCADORIAS",
        headerX + headerWidth / 2 + 20, // compensação visual do logo
        headerY + headerHeight / 2 + 5,
        { align: "center" }
      );

      // ======================
      // TABELA PRINCIPAL
      // ======================
      const colunas = ["DESCRIÇÃO", "QTD", "UN", "UNIT.", "TOTAL"];

      const linhas = pedidosFiltrados.map((p) => [
        p.descricao,
        p.quant_saida ?? "",
        "Pct",
        formatarValor(p.valor_unitario_venda),
        formatarValor(p.valor_total_saida),
      ]);

      const estilosTabela = {
        fontSize: 9.5,
        cellPadding: 6,
        fontStyle: "bold",
        textColor: "#000",
        lineColor: "#000",
        lineWidth: 1,
        valign: "middle",
      };

      const estilosHeader = {
        fillColor: "#fff",
        textColor: "#000",
        fontStyle: "bold",
        lineColor: "#000",
        lineWidth: 1,
        halign: "center",
      };

      const columnStyles = {
        0: { cellWidth: 255, halign: "left" }, // DESCRIÇÃO
        1: { cellWidth: 45 }, // QTD
        2: { cellWidth: 45 }, // UN
        3: { cellWidth: 70 }, // UNIT.
        4: { cellWidth: 75 }, // TOTAL
      };

      autoTable(doc, {
        startY: 90,
        margin: { left: 55, right: 40 },
        head: [colunas],
        body: linhas,
        theme: "grid",
        styles: estilosTabela,
        headStyles: estilosHeader,
        columnStyles,
      } as any);

      // ======================
      // TOTAL GERAL
      // ======================
      const totalGeral = pedidosFiltrados.reduce(
        (acc, p) => acc + Number(p.valor_total_saida || 0),
        0
      );

      const yTotal = (doc as any).lastAutoTable.finalY + 10;
      const larguraTotal = 200;
      const xTotal = pageWidth - larguraTotal - 40;

      doc.setFontSize(10);
      doc.rect(xTotal, yTotal, larguraTotal, 22);
      doc.text(
        `TOTAL: ${formatarValor(totalGeral)}`,
        xTotal + larguraTotal / 2,
        yTotal + 15,
        { align: "center" }
      );

      // ======================
      // RODAPÉ
      // ======================
      autoTable(doc, {
        startY: yTotal + 26,
        margin: { left: 55, right: 40 },
        head: [["DATA"]],
        body: [[
          dataPedido,
          pedidosFiltrados[0]?.localidade || "",
        ]],
        theme: "grid",
        styles: {
          fontSize: 9,
          fontStyle: "bold",
          halign: "center",
          textColor: "#000",
          lineColor: "#000",
          lineWidth: 1,
        },
        headStyles: estilosHeader,
      } as any);

      // ======================
      // SALVAR
      // ======================
      doc.save(
        `pedido ${pedidosFiltrados[0]?.localidade} ${dataPedido}.pdf`
      );
    };

    logo.onerror = () => {
      alert("Erro ao carregar a imagem do logo.");
    };
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    alert("Erro ao gerar PDF. Veja o console.");
  }
};


  const exportarXLSX = () => {
    const dados = pedidosFiltrados.map((p) => ({
      Descrição: p.descricao || "",
      Quantidade: p.quant_saida || "",
      "Valor Unitário": formatarValor(p.valor_unitario_venda),
      "Valor Total": formatarValor(p.valor_total_saida),
    }));

    // 🔥 ADICIONA TOTAL GERAL CORRETO
    const totalGeral = pedidosFiltrados.reduce((acc, p) => {
      const valor = Number(p.valor_total_saida ?? 0); // garante número
      return acc + valor;
    }, 0);

    dados.push({
      Descrição: "TOTAL:",
      Quantidade: "",
      "Valor Unitário": "",
      "Valor Total": formatarValor(totalGeral), // mantém o mesmo formato BRL
    });

    const wb = XLSX.utils.book_new();

    const cabecalho = [
      ["Pedidos"],
      [`${new Date().toLocaleString("pt-BR")}`],
      [],
    ];

    const ws = XLSX.utils.aoa_to_sheet(cabecalho);
    XLSX.utils.sheet_add_json(ws, dados, { origin: -1 });

    const colunas = [
      { wch: 30 },
      { wch: 20 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
    ];
    ws["!cols"] = colunas;

    const totalLinhas = dados.length + cabecalho.length;

    for (let R = 0; R < totalLinhas; R++) {
      for (let C = 0; C < 6; C++) {
        const cell_ref = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cell_ref]) continue;

        const isHeader = R <= 2 || R === 2;
        const isTotal = R === totalLinhas - 1; // última linha = total

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
            bold: isHeader || isTotal,
            color: { rgb: isHeader || isTotal ? "FFFFFF" : "000000" },
          },
          alignment: { vertical: "center", horizontal: "center" },
          fill: isHeader
            ? { fgColor: { rgb: "333333" } }
            : isTotal
              ? { fgColor: { rgb: "505050" } } // fundo leve pra linha de total
              : R % 2 === 1
                ? { fgColor: { rgb: "F5F5F5" } }
                : { fgColor: { rgb: "FFFFFF" } },
        };
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, "Pedidos");

    const arrayBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });
    saveAs(blob, "relatorio_pedidos.xlsx");
  };


  return (
    <div className="pedidos-container">
      <div className="pedidos-header">
        <h2 className="titulo">Pedidos dos Clientes</h2>

        <div className="botoes-topo">
          <input
            type="text"
            placeholder="Buscar"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="input-busca"
          />
          <input
            type="text"
            placeholder="Data"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
            maxLength={10}
            className="input-data"
          />

         <button
          className="btn-novo"
          onClick={() => {
            const hoje = new Date();
            const yyyy = hoje.getFullYear();
            const mm = String(hoje.getMonth() + 1).padStart(2, "0");
            const dd = String(hoje.getDate()).padStart(2, "0");

            setFormData({
              data_saida: `${yyyy}-${mm}-${dd}`, // 👈 nova info só no front
            });

            setShowModal(true);
            setEditando(false);
          }}
        >

            + Adicionar Pedido
          </button>

          <button className="btn-exportar" onClick={exportarPDF}>
            📄 PDF
          </button>

          <button className="btn-exportar" onClick={exportarXLSX}>
            📊 Excel
          </button>
        </div>
      </div>

      <table className="pedidos-tabela">
        <thead>
          <tr>
            <th onClick={ordenarPorDescricao} className="coluna-clickavel">
              Descrição {ordemDescAsc ? "▲" : "▼"}
            </th>
            <th>Quantidade</th>
            <th>Data</th>
            <th>Valor Unitário</th>
            <th>Valor Total</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {pedidosFiltrados.map((p) => (
            <tr key={p.id}>
              <td>{p.descricao}</td>
              <td>{p.quant_saida}</td>
              <td>{formatarDataPedido(p)}</td>
              <td>{formatarValor(p.valor_unitario_venda)}</td>
              <td>{formatarValor(p.valor_total_saida)}</td>

              <td className="acoes">
                <button
                  className="btn-editar"
                  onClick={() => {
                    setFormData(p);
                    setEditando(true);
                    setShowModal(true);
                  }}
                >
                  Editar
                </button>

                <button
                  className="btn-excluir"
                  onClick={async () => {
                    if (window.confirm("Deseja excluir este pedido?")) {
                      await api.delete(`/pedidos/${p.id}`);
                      carregarPedidos();
                      carregarEstoque();
                    }
                  }}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

  <div className="total-geral-pedidos">
    <strong>Total dos pedidos:</strong> {formatarValor(totalPedidos)}
  </div>

      {showModal && (
        <div className="modal-overlay">
          <div
            className="modal"
          >
            <h3>{editando ? "Editar Pedido" : "NovoPedido"}</h3>

            <input
              placeholder="Descrição"
              value={formData.descricao || ""}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
            />

            {filtroEstoque.length > 0 && (
              <ul className="lista-sugestoes">
                {filtroEstoque.map((item) => (
                  <li
                    key={item.codigoItem}
                    onClick={() => escolherItem(item)}
                    className="item-sugestao"
                  >
                    {item.descricao} — {item.estoque_quantidade ?? 0} unid. —{" "}
                    {formatarValor(item.valor_venda)}
                  </li>
                ))}
              </ul>
            )}

            <input
              type="number"
              placeholder="Quantidade saída"
              value={formData.quant_saida || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quant_saida: Number(e.target.value),
                })
              }
            />


            <input
              type="number"
              placeholder="Valor unitário (R$)"
              value={Number(formData.valor_unitario_venda ?? 0)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  valor_unitario_venda: Number(e.target.value),
                })
              }
            />

              <input
                type="date"
                value={(formData as any).data_saida || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    data_saida: e.target.value,
                  })
                }
              />
  

            <button
              className="btn-novo"
              onClick={() => {
                if (!formData.descricao || !formData.quant_saida) {
                  alert("Preencha ao menos descrição e quantidade.");
                  return;
                }

                // pega nome e loja do   item OU do item atual
                const responsavelBase = itensPedido[0]?.responsavel || formData.responsavel;

                const itemCompletado = {
                  ...formData,
                  responsavel: responsavelBase || "",
                };

                setItensPedido(prev => [...prev, itemCompletado]);

              // depois que adiciona, limpa SOMENTE os campos de item
              setFormData({
                responsavel: responsavelBase,
                data_saida: formData.data_saida, // 🔥 mantém a mesma data
              });
              }}

            >
              + Adicionar Item ao Pedido
            </button>

            {/* Lista dos itens adicionados */}
            {itensPedido.length > 0 && (
              <div className="lista-itens-pedido">
                <h4>Itens adicionados:</h4>
                {itensPedido.map((item, index) => (
                  <div key={index} className="item-card">
                    <strong>{item.descricao}</strong> — {item.quant_saida} un —
                    {formatarValor(item.valor_unitario_venda)}
                    <button
                      className="btn-remover-item"
                      onClick={() =>
                        setItensPedido(itensPedido.filter((_, i) => i !== index))
                      }
                    >
                      ❌
                    </button>
                  </div>
                ))}
              </div>
            )}


            <div className="valor-total-preview">
              <strong>Valor Total:</strong> {formatarValor(valorTotal)}
            </div>

            <div className="modal-acoes">
              <button
                className="btn-salvar"
                onClick={editando ? editarPedido : criarPedido}
              >
                {editando ? "Salvar Alterações" : "Salvar"}
              </button>

              <button
                className="btn-cancelar"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
