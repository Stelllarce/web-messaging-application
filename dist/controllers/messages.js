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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../utils/database");
const User_1 = require("../models/User");
const Channel_1 = require("../models/Channel");
const router = (0, express_1.Router)();
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const me = yield User_1.User.findOne({ isMe: true });
        if (!me) {
            res.status(500).json({ error: 'Me user not found' });
            return;
        }
        const channel = yield Channel_1.Channel.findById(id);
        if (channel) {
            const messages = yield (0, database_1.findMessagesByTarget)(id);
            res.json(messages);
            return;
        }
        const user = yield User_1.User.findById(id);
        if (user) {
            const messages = yield (0, database_1.findMessagesBetweenUsers)(me._id.toString(), id);
            res.json(messages);
            return;
        }
        res.status(404).json({ error: 'Not found' });
    }
    catch (error) {
        console.error('Error in GET /messages/:id:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
const postMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fromId, toId, toModel, text } = req.body;
        if (!fromId || !toId || !toModel || !text) {
            res.status(400).json({ error: 'Missing fields' });
            return;
        }
        const message = yield (0, database_1.sendMessage)(fromId, toId, toModel, text);
        res.status(201).json(message);
    }
    catch (error) {
        console.error('Error in POST /messages:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/:id', getMessages);
router.post('/', postMessage);
exports.default = router;
