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
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const publicChannels = yield Channel_1.Channel.find({ type: 'public' });
        const privateChannels = yield Channel_1.Channel.find({ type: 'private' }).populate('members');
        const people = [];
        const group = [];
        privateChannels.forEach(chan => {
            if (chan.members.length === 2) {
                people.push(chan);
            }
            else {
                group.push(chan);
            }
        });
        const me = yield User_1.User.findOne({ isMe: true });
        res.json({
            public: publicChannels,
            private: {
                group,
                people,
                me
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}));
exports.default = router;
