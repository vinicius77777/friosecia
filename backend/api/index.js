"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var cors_1 = require("cors");
var client_1 = require("@prisma/client");
var app = (0, express_1.default)();
var prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// =======================
// ROTAS DE ESTOQUE
// =======================
// Listar todos os registros de estoque
app.get('/estoque', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var registros, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.estoque_registro.findMany()];
            case 1:
                registros = _a.sent();
                res.json(registros);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Erro ao listar estoque:', error_1);
                res.status(500).json({ error: 'Erro ao listar estoque.', details: String(error_1) });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/estoque', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var hoje, novoRegistro, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                hoje = new Date();
                console.log("ANO GERADO:", hoje.getFullYear());
                return [4 /*yield*/, prisma.estoque_registro.create({
                        data: __assign(__assign({}, req.body), { dia_entrada: hoje.getDate(), mes_entrada: String(hoje.getMonth() + 1), ano_entrada: hoje.getFullYear() }),
                    })];
            case 1:
                novoRegistro = _a.sent();
                res.json(novoRegistro);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error(error_2);
                res.status(500).json({ error: 'Erro ao criar item.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Atualizar item de estoque
app.put('/estoque/:codigoItem', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var codigoItem, data, registroAtualizado, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                codigoItem = req.params.codigoItem;
                data = req.body;
                return [4 /*yield*/, prisma.estoque_registro.update({
                        where: { codigoItem: Number(codigoItem) },
                        data: data,
                    })];
            case 1:
                registroAtualizado = _a.sent();
                res.json(registroAtualizado);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Erro ao atualizar item de estoque:', error_3);
                res.status(500).json({ error: 'Erro ao atualizar item de estoque.', details: String(error_3) });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Deletar item de estoque
app.delete('/estoque/:codigoItem', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var codigoItem, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                codigoItem = req.params.codigoItem;
                return [4 /*yield*/, prisma.estoque_registro.delete({
                        where: { codigoItem: Number(codigoItem) },
                    })];
            case 1:
                _a.sent();
                res.json({ message: 'Item deletado com sucesso!' });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Erro ao deletar item de estoque:', error_4);
                res.status(500).json({ error: 'Erro ao deletar item de estoque.', details: String(error_4) });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// =======================
// ROTAS DE PEDIDOS
// =======================
// Listar pedidos
app.get('/pedidos', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var pedidos, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.pedidos_registro.findMany()];
            case 1:
                pedidos = _a.sent();
                res.json(pedidos);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Erro ao listar pedidos:', error_5);
                res.status(500).json({ error: 'Erro ao listar pedidos.', details: String(error_5) });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Criar novo pedido
app.post('/pedidos', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var data, novoPedido, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                data = req.body;
                return [4 /*yield*/, prisma.pedidos_registro.create({ data: data })];
            case 1:
                novoPedido = _a.sent();
                res.json(novoPedido);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Erro ao criar pedido:', error_6);
                res.status(500).json({ error: 'Erro ao criar pedido.', details: String(error_6) });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Deletar pedido
app.delete('/pedidos/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, prisma.pedidos_registro.delete({
                        where: { id: Number(id) },
                    })];
            case 1:
                _a.sent();
                res.json({ message: 'Pedido deletado com sucesso!' });
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                console.error('Erro ao deletar pedido:', error_7);
                res.status(500).json({ error: 'Erro ao deletar pedido.', details: String(error_7) });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log("\u2705 Servidor rodando em http://localhost:".concat(PORT));
});
