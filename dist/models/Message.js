"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    from: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose_1.default.Schema.Types.ObjectId, refPath: 'toModel', required: true },
    toModel: { type: String, required: true, enum: ['Channel', 'User'] },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});
exports.Message = mongoose_1.default.model('Message', messageSchema);
