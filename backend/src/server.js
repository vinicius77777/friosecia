"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var client_1 = require("@prisma/client");
var library_1 = require("@prisma/client/runtime/library");
var dotenv_1 = require("dotenv");
var cors_1 = require("cors");
dotenv_1.default.config();
var app = (0, express_1.default)();
var prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.get("/", function (_req, res) {
    res.json({ message: "API de Estoque e Pedidos rodando 🚀" });
});
/* ========================= ESTOQUE ========================= */
app.post("/estoque", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var data, descricao, quantidadeEntrada, valorTotalEntrada, valorUnitario, itemExistente, novaQuantidadeFisica, valorUnitario_1, atualizado, novoItem, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                data = req.body;
                descricao = String(data.descricao || "").trim();
                quantidadeEntrada = Number(data.quant_entrada) || 0;
                valorTotalEntrada = Number(data.valor_total_entrada) || 0;
                valorUnitario = quantidadeEntrada > 0 ? valorTotalEntrada / quantidadeEntrada : 0;
                return [4 /*yield*/, prisma.estoque_registro.findFirst({
                        where: { descricao: descricao },
                    })];
            case 1:
                itemExistente = _a.sent();
                if (!itemExistente) return [3 /*break*/, 3];
                novaQuantidadeFisica = (itemExistente.estoque_quantidade || 0) + quantidadeEntrada;
                valorUnitario_1 = quantidadeEntrada > 0 ? valorTotalEntrada / quantidadeEntrada : 0;
                return [4 /*yield*/, prisma.estoque_registro.update({
                        where: { codigoItem: itemExistente.codigoItem },
                        data: {
                            // 🔥 quantidade física acumula
                            estoque_quantidade: novaQuantidadeFisica,
                            // 🔥 RESET financeiro (última compra manda)
                            quant_entrada: quantidadeEntrada,
                            valor_total_entrada: new library_1.Decimal(valorTotalEntrada),
                            estoque_valor_unitario: new library_1.Decimal(valorUnitario_1),
                            nota_fiscal: data.nota_fiscal || null,
                            fornecedor: data.fornecedor || null,
                            data_vencimento: data.data_vencimento || null,
                            // preço de venda só muda se enviar
                            valor_venda: data.valor_venda
                                ? new library_1.Decimal(Number(data.valor_venda))
                                : itemExistente.valor_venda,
                        },
                    })];
            case 2:
                atualizado = _a.sent();
                return [2 /*return*/, res.json({
                        message: "Estoque atualizado (entrada resetada corretamente).",
                        item: atualizado,
                    })];
            case 3: return [4 /*yield*/, prisma.estoque_registro.create({
                    data: {
                        descricao: descricao,
                        mes_entrada: data.mes_entrada || null,
                        dia_entrada: data.dia_entrada ? Number(data.dia_entrada) : null,
                        quant_entrada: quantidadeEntrada,
                        unidade_entrada: data.unidade_entrada || null,
                        nota_fiscal: data.nota_fiscal || null,
                        fornecedor: data.fornecedor || null,
                        valor_total_entrada: new library_1.Decimal(valorTotalEntrada),
                        data_vencimento: data.data_vencimento || null,
                        estoque_quantidade: quantidadeEntrada,
                        estoque_unidade: data.estoque_unidade || data.unidade_entrada || null,
                        estoque_valor_unitario: new library_1.Decimal(valorUnitario),
                        valor_venda: data.valor_venda
                            ? new library_1.Decimal(Number(data.valor_venda))
                            : null,
                    },
                })];
            case 4:
                novoItem = _a.sent();
                return [2 /*return*/, res.status(201).json({
                        message: "Novo item criado com sucesso.",
                        item: novoItem,
                    })];
            case 5:
                error_1 = _a.sent();
                console.error("❌ Erro ao criar/somar item:", error_1);
                return [2 /*return*/, res
                        .status(500)
                        .json({ error: "Erro ao criar ou atualizar estoque." })];
            case 6: return [2 /*return*/];
        }
    });
}); });
// Listar estoque
app.get("/estoque", function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var itens, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.estoque_registro.findMany()];
            case 1:
                itens = _a.sent();
                return [2 /*return*/, res.json(itens)];
            case 2:
                error_2 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: "Erro ao listar estoque." })];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Atualizar item
app.put("/estoque/:codigoItem", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var codigoItem, data, itemAtual, quantidadeEntrada, valorTotalEntrada, valorUnitario, atualizado, error_3;
    var _a, _b, _c, _d, _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                codigoItem = parseInt(req.params.codigoItem, 10);
                data = req.body;
                _g.label = 1;
            case 1:
                _g.trys.push([1, 4, , 5]);
                return [4 /*yield*/, prisma.estoque_registro.findUnique({
                        where: { codigoItem: codigoItem },
                    })];
            case 2:
                itemAtual = _g.sent();
                if (!itemAtual) {
                    return [2 /*return*/, res.status(404).json({ error: "Item não encontrado." })];
                }
                quantidadeEntrada = Number((_a = data.quant_entrada) !== null && _a !== void 0 ? _a : itemAtual.quant_entrada);
                valorTotalEntrada = Number((_b = data.valor_total_entrada) !== null && _b !== void 0 ? _b : itemAtual.valor_total_entrada);
                valorUnitario = quantidadeEntrada > 0 ? valorTotalEntrada / quantidadeEntrada : 0;
                return [4 /*yield*/, prisma.estoque_registro.update({
                        where: { codigoItem: codigoItem },
                        data: {
                            descricao: (_c = data.descricao) !== null && _c !== void 0 ? _c : itemAtual.descricao,
                            fornecedor: (_d = data.fornecedor) !== null && _d !== void 0 ? _d : itemAtual.fornecedor,
                            nota_fiscal: (_e = data.nota_fiscal) !== null && _e !== void 0 ? _e : itemAtual.nota_fiscal,
                            data_vencimento: (_f = data.data_vencimento) !== null && _f !== void 0 ? _f : itemAtual.data_vencimento,
                            // 🔥 NUNCA mexe na quantidade física aqui
                            estoque_quantidade: itemAtual.estoque_quantidade,
                            // 🔥 RESET financeiro
                            quant_entrada: quantidadeEntrada,
                            valor_total_entrada: new library_1.Decimal(valorTotalEntrada),
                            estoque_valor_unitario: new library_1.Decimal(valorUnitario),
                            valor_venda: data.valor_venda
                                ? new library_1.Decimal(Number(data.valor_venda))
                                : itemAtual.valor_venda,
                        },
                    })];
            case 3:
                atualizado = _g.sent();
                return [2 /*return*/, res.json({
                        message: "Item atualizado (financeiro resetado, estoque preservado).",
                        item: atualizado,
                    })];
            case 4:
                error_3 = _g.sent();
                console.error("❌ Erro ao atualizar item:", error_3);
                return [2 /*return*/, res.status(500).json({ error: "Erro ao atualizar item." })];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Deletar item
app.delete("/estoque/:codigoItem", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var codigoItem, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                codigoItem = parseInt(req.params.codigoItem, 10);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.estoque_registro.delete({ where: { codigoItem: codigoItem } })];
            case 2:
                _a.sent();
                return [2 /*return*/, res.json({ message: "Item removido com sucesso." })];
            case 3:
                error_4 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: "Erro ao deletar item." })];
            case 4: return [2 /*return*/];
        }
    });
}); });
/* ================== PREVISÃO DE PEDIDO (NÃO SALVA) ================== */
app.post("/pedidos/prever", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, descricao, quant_saida, responsavel, saida_loja, descricaoTrim, quantidade, item, valorUnitarioVenda, valorUnitarioCusto, isDescontoCliente, nomeLower, isSemDesconto, descontoAplicado, lucroUnitario, metadeLucro, valorTotal, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, descricao = _a.descricao, quant_saida = _a.quant_saida, responsavel = _a.responsavel, saida_loja = _a.saida_loja;
                descricaoTrim = String(descricao || "").trim();
                quantidade = Number(quant_saida || 1);
                return [4 /*yield*/, prisma.estoque_registro.findFirst({
                        where: { descricao: descricaoTrim },
                    })];
            case 1:
                item = _b.sent();
                valorUnitarioVenda = item ? Number(item.valor_venda || 0) : 0;
                valorUnitarioCusto = item ? Number(item.estoque_valor_unitario || 0) : 0;
                isDescontoCliente = (responsavel === "Rodrigo" && saida_loja === "Barra Açaí") ||
                    (responsavel === "Ericson" && saida_loja === "Estação Açaí");
                nomeLower = descricaoTrim.toLowerCase();
                isSemDesconto = nomeLower.includes("caixa de papelão") ||
                    nomeLower.includes("caixa papelão") ||
                    nomeLower.includes("caixa papelon");
                descontoAplicado = false;
                // 🔥 REGRA ESPECIAL: Rodrigo + Barra Açaí + qualquer item contendo "aça"
                if (responsavel === "Rodrigo" &&
                    saida_loja === "Barra Açaí" &&
                    nomeLower.includes("aça")) {
                    valorUnitarioVenda = 122.50;
                    descontoAplicado = true;
                }
                else if (item && isDescontoCliente && !isSemDesconto) {
                    lucroUnitario = valorUnitarioVenda - valorUnitarioCusto;
                    metadeLucro = lucroUnitario * 0.5;
                    valorUnitarioVenda = valorUnitarioCusto + metadeLucro;
                    descontoAplicado = true;
                }
                // arredondar
                valorUnitarioVenda = Number(valorUnitarioVenda.toFixed(2));
                valorTotal = Number((valorUnitarioVenda * quantidade).toFixed(2));
                return [2 /*return*/, res.json({
                        valor_unitario_venda: valorUnitarioVenda,
                        valor_total_saida: valorTotal,
                        descontoAplicado: descontoAplicado,
                    })];
            case 2:
                error_5 = _b.sent();
                console.error("❌ Erro ao prever pedido:", error_5);
                return [2 /*return*/, res.status(500).json({ error: "Erro ao prever pedido." })];
            case 3: return [2 /*return*/];
        }
    });
}); });
/* ========================= PEDIDOS ========================= */
// 🔥 ACEITA PEDIDOS MESMO SEM ESTOQUE
app.post("/pedidos", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, descricao, quant_saida, responsavel, saida_loja, localidade, valor_unitario_venda, dia_saida, mes_saida, ano_saida, agora, diaFinal, mesFinal, anoFinal, descricaoTrim, quantidadeSaida, item, valorUnitarioVenda, valorUnitarioCusto, estoqueId, lucroUnitario, lucroTotal, margem, nomeLower, isDescontoCliente, isSemDesconto, precoTravado, lucroPadrao, metadeLucro, valorTotalSaida, novoPedido, error_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                _a = req.body, descricao = _a.descricao, quant_saida = _a.quant_saida, responsavel = _a.responsavel, saida_loja = _a.saida_loja, localidade = _a.localidade, valor_unitario_venda = _a.valor_unitario_venda, dia_saida = _a.dia_saida, mes_saida = _a.mes_saida, ano_saida = _a.ano_saida;
                agora = new Date();
                diaFinal = Number(dia_saida && String(dia_saida).length > 0
                    ? String(dia_saida).padStart(2, "0")
                    : String(agora.getDate()).padStart(2, "0"));
                mesFinal = Number(mes_saida && String(mes_saida).length > 0
                    ? String(mes_saida).padStart(2, "0")
                    : String(agora.getMonth() + 1).padStart(2, "0"));
                anoFinal = ano_saida && Number(ano_saida) > 0
                    ? Number(ano_saida)
                    : agora.getFullYear();
                descricaoTrim = String(descricao || "").trim();
                quantidadeSaida = Number(quant_saida);
                return [4 /*yield*/, prisma.estoque_registro.findFirst({
                        where: { descricao: descricaoTrim },
                    })];
            case 1:
                item = _b.sent();
                valorUnitarioVenda = item ? Number(item.valor_venda || 0) : 0;
                valorUnitarioCusto = item
                    ? Number(item.estoque_valor_unitario || 0)
                    : 0;
                estoqueId = item ? item.codigoItem : null;
                lucroUnitario = 0;
                lucroTotal = 0;
                margem = "0%";
                nomeLower = descricaoTrim.toLowerCase();
                isDescontoCliente = (responsavel === "Rodrigo" && saida_loja === "Barra Açaí") ||
                    (responsavel === "Ericson" && saida_loja === "Estação Açaí");
                isSemDesconto = nomeLower.includes("caixa de papelão") ||
                    nomeLower.includes("caixa papelão") ||
                    nomeLower.includes("caixa papelon");
                precoTravado = false;
                // ===============================
                // DEFINIÇÃO DO PREÇO FINAL
                // ===============================
                // 🔥 REGRA ESPECIAL (preço fixo)
                if (responsavel === "Rodrigo" &&
                    saida_loja === "Barra Açaí" &&
                    nomeLower.includes("aça")) {
                    valorUnitarioVenda = 122.5;
                    precoTravado = true;
                }
                else if (item && isDescontoCliente && !isSemDesconto) {
                    lucroPadrao = valorUnitarioVenda - valorUnitarioCusto;
                    metadeLucro = lucroPadrao * 0.5;
                    valorUnitarioVenda = valorUnitarioCusto + metadeLucro;
                }
                // 🔥 Override do front (SÓ se não for preço especial)
                if (!precoTravado && valor_unitario_venda && valor_unitario_venda > 0) {
                    valorUnitarioVenda = Number(valor_unitario_venda);
                }
                // ===============================
                // ✅ CÁLCULO FINAL (ÚNICO)
                // ===============================
                lucroUnitario = valorUnitarioVenda - valorUnitarioCusto;
                lucroTotal = lucroUnitario * quantidadeSaida;
                margem =
                    valorUnitarioVenda > 0
                        ? ((lucroUnitario / valorUnitarioVenda) * 100).toFixed(2) + "%"
                        : "0%";
                valorTotalSaida = valorUnitarioVenda * quantidadeSaida;
                return [4 /*yield*/, prisma.pedidos_registro.create({
                        data: {
                            descricao: descricaoTrim,
                            quant_saida: quantidadeSaida,
                            responsavel: responsavel,
                            saida_loja: saida_loja,
                            localidade: localidade,
                            mes_saida: String(mesFinal),
                            dia_saida: diaFinal,
                            ano_saida: anoFinal,
                            valor_unitario_venda: new library_1.Decimal(valorUnitarioVenda),
                            valor_total_saida: new library_1.Decimal(valorTotalSaida),
                            lucratividade_unitario: new library_1.Decimal(lucroUnitario),
                            lucratividade_total: new library_1.Decimal(lucroTotal),
                            margem_aplicada: margem,
                            estoqueId: estoqueId,
                        },
                    })];
            case 2:
                novoPedido = _b.sent();
                if (!(estoqueId && item)) return [3 /*break*/, 4];
                return [4 /*yield*/, prisma.estoque_registro.update({
                        where: { codigoItem: estoqueId },
                        data: {
                            estoque_quantidade: Number(item.estoque_quantidade || 0) - quantidadeSaida,
                        },
                    })];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4: return [2 /*return*/, res.status(201).json({
                    message: "Pedido criado com sucesso.",
                    pedido: novoPedido,
                })];
            case 5:
                error_6 = _b.sent();
                console.error("ERRO AO CRIAR PEDIDO:", error_6);
                return [2 /*return*/, res.status(500).json({
                        error: "Erro ao criar pedido.",
                        detalhes: error_6,
                    })];
            case 6: return [2 /*return*/];
        }
    });
}); });
// Listar pedidos
app.get("/pedidos", function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var pedidos, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.pedidos_registro.findMany()];
            case 1:
                pedidos = _a.sent();
                return [2 /*return*/, res.json(pedidos)];
            case 2:
                error_7 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: "Erro ao listar pedidos." })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.put("/pedidos/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, pedidoExistente, valorUnitarioVenda, quantSaida, lucroUnitario, margem, estoqueItem, _a, valorUnitarioCusto, atualizado, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                id = parseInt(req.params.id, 10);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 7, , 8]);
                return [4 /*yield*/, prisma.pedidos_registro.findUnique({
                        where: { id: id },
                    })];
            case 2:
                pedidoExistente = _b.sent();
                if (!pedidoExistente) {
                    return [2 /*return*/, res.status(404).json({ error: "Pedido não encontrado." })];
                }
                valorUnitarioVenda = Number(req.body.valor_unitario_venda || pedidoExistente.valor_unitario_venda);
                quantSaida = Number(req.body.quant_saida || pedidoExistente.quant_saida);
                lucroUnitario = 0;
                margem = "0%";
                if (!pedidoExistente.estoqueId) return [3 /*break*/, 4];
                return [4 /*yield*/, prisma.estoque_registro.findUnique({
                        where: { codigoItem: pedidoExistente.estoqueId },
                    })];
            case 3:
                _a = _b.sent();
                return [3 /*break*/, 5];
            case 4:
                _a = null;
                _b.label = 5;
            case 5:
                estoqueItem = _a;
                if (estoqueItem) {
                    valorUnitarioCusto = Number(estoqueItem.estoque_valor_unitario || 0);
                    lucroUnitario = valorUnitarioVenda - valorUnitarioCusto;
                    margem =
                        valorUnitarioVenda > 0
                            ? ((lucroUnitario / valorUnitarioVenda) * 100).toFixed(2) + "%"
                            : "0%";
                }
                return [4 /*yield*/, prisma.pedidos_registro.update({
                        where: { id: id },
                        data: {
                            descricao: req.body.descricao,
                            quant_saida: quantSaida,
                            responsavel: req.body.responsavel,
                            localidade: req.body.localidade,
                            mes_saida: req.body.mes_saida
                                ? String(req.body.mes_saida).padStart(2, "0")
                                : pedidoExistente.mes_saida,
                            dia_saida: req.body.dia_saida
                                ? Number(req.body.dia_saida)
                                : pedidoExistente.dia_saida,
                            ano_saida: req.body.ano_saida
                                ? Number(req.body.ano_saida)
                                : pedidoExistente.ano_saida,
                            valor_unitario_venda: new library_1.Decimal(valorUnitarioVenda),
                            valor_total_saida: new library_1.Decimal(valorUnitarioVenda * quantSaida),
                            lucratividade_unitario: new library_1.Decimal(lucroUnitario),
                            lucratividade_total: new library_1.Decimal(lucroUnitario * quantSaida),
                            margem_aplicada: margem,
                        },
                    })];
            case 6:
                atualizado = _b.sent();
                return [2 /*return*/, res.json(atualizado)];
            case 7:
                err_1 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: "Erro ao editar pedido." })];
            case 8: return [2 /*return*/];
        }
    });
}); });
// ❗ DELETE devolve estoque se aplicável
app.delete("/pedidos/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, pedido, item, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = parseInt(req.params.id, 10);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 7, , 8]);
                return [4 /*yield*/, prisma.pedidos_registro.findUnique({
                        where: { id: id },
                    })];
            case 2:
                pedido = _a.sent();
                if (!pedido) {
                    return [2 /*return*/, res.status(404).json({ error: "Pedido não encontrado." })];
                }
                if (!pedido.estoqueId) return [3 /*break*/, 5];
                return [4 /*yield*/, prisma.estoque_registro.findUnique({
                        where: { codigoItem: pedido.estoqueId },
                    })];
            case 3:
                item = _a.sent();
                if (!item) return [3 /*break*/, 5];
                return [4 /*yield*/, prisma.estoque_registro.update({
                        where: { codigoItem: item.codigoItem },
                        data: {
                            estoque_quantidade: (item.estoque_quantidade || 0) + (pedido.quant_saida || 0),
                        },
                    })];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5: return [4 /*yield*/, prisma.pedidos_registro.delete({
                    where: { id: id },
                })];
            case 6:
                _a.sent();
                return [2 /*return*/, res.json({
                        message: "Pedido excluído (estoque restaurado se aplicável).",
                    })];
            case 7:
                err_2 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: "Erro ao excluir pedido." })];
            case 8: return [2 /*return*/];
        }
    });
}); });
/* ========================= SERVER ========================= */
var PORT = Number(process.env.PORT || 3000);
app.listen(PORT, function () {
    console.log("\uD83D\uDE80 Servidor rodando em http://localhost:".concat(PORT));
});
