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
const Channel_1 = require("../models/Channel");
const Message_1 = require("../models/Message");
const router = (0, express_1.Router)();
const getPublicChannels = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const channels = yield Channel_1.Channel.find({ type: 'public' });
        res.json(channels);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
const getChannel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const channel = yield Channel_1.Channel.findById(id).populate('members', 'username');
        if (!channel) {
            res.status(404).json({ error: 'Channel not found' });
            return;
        }
        res.json(channel);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
const getChannelsForUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const channels = yield Channel_1.Channel.find({
            $or: [{ users: '*' }, { users: userId }]
        });
        res.json(channels);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
const getChannelMessagesForUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const channels = yield Channel_1.Channel.find({
            $or: [{ users: '*' }, { users: id }]
        });
        const result = [];
        for (const channel of channels) {
            const messages = yield Message_1.Message.find({ to: channel._id, toModel: 'Channel' })
                .populate('from', 'username')
                .sort({ timestamp: 1 });
            result.push({
                channel,
                messages
            });
        }
        res.json(result);
    }
    catch (error) {
        console.error('Error retrieving chats in channels:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
const getChannelParticipants = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const channel = yield Channel_1.Channel.findById(id).populate('members', 'username');
        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }
        res.json({
            _id: channel._id,
            name: channel.name,
            type: channel.type,
            chatType: channel.chatType,
            users: channel.users,
            members: channel.members
        });
    }
    catch (err) {
        console.error('Error loading participants:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/', getPublicChannels);
router.get('/user/:userId', getChannelsForUser);
router.get('/:id/messages', getChannelMessagesForUser);
router.get('/:id/participants', getChannelParticipants);
router.get('/:id', getChannel);
exports.default = router;
