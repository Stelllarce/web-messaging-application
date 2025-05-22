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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.createChannel = createChannel;
exports.sendMessage = sendMessage;
exports.findUserById = findUserById;
exports.findChannelById = findChannelById;
exports.findMessagesByTarget = findMessagesByTarget;
exports.findMessagesBetweenUsers = findMessagesBetweenUsers;
exports.seedData = seedData;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const Channel_1 = require("../models/Channel");
const Message_1 = require("../models/Message");
const bcrypt_1 = __importDefault(require("bcrypt"));
function createUser(username_1, password_1) {
    return __awaiter(this, arguments, void 0, function* (username, password, isMe = false) {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = new User_1.User({ username, password: hashedPassword, isMe });
        yield user.save();
        return user;
    });
}
function createChannel(name_1, type_1) {
    return __awaiter(this, arguments, void 0, function* (name, type, users = [], chatType, members = []) {
        if (type === 'private' && users.includes('*')) {
            throw new Error("Private cannel cannot contain '*' in users.");
        }
        const channel = new Channel_1.Channel({
            name,
            type,
            chatType: type === 'private' ? chatType : undefined,
            users,
            members,
        });
        yield channel.save();
        return channel;
    });
}
function sendMessage(fromId, toId, toModel, text) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = new Message_1.Message({
            from: fromId,
            to: toId,
            toModel,
            text,
        });
        yield message.save();
        return message;
    });
}
function findUserById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield User_1.User.findById(id);
    });
}
function findChannelById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Channel_1.Channel.findById(id);
    });
}
function findMessagesByTarget(id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid ID format');
        }
        const objectId = new mongoose_1.default.Types.ObjectId(id);
        const messages = yield Message_1.Message.find({
            $or: [{ to: objectId }, { from: objectId }],
        })
            .populate('from', 'username')
            .populate('to', 'username name')
            .sort({ timestamp: 1 });
        return messages;
    });
}
function findMessagesBetweenUsers(user1Id, user2Id) {
    return __awaiter(this, void 0, void 0, function* () {
        const messages = yield Message_1.Message.find({
            $or: [
                { from: user1Id, to: user2Id },
                { from: user2Id, to: user1Id },
            ],
        })
            .populate('from', 'username')
            .populate('to', 'username name')
            .sort({ timestamp: 1 });
        return messages;
    });
}
function seedData() {
    return __awaiter(this, arguments, void 0, function* (force = false) {
        const usersCount = yield User_1.User.countDocuments();
        const channelsCount = yield Channel_1.Channel.countDocuments();
        if (!force && (usersCount > 0 || channelsCount > 0)) {
            // console.log('Данните вече съществуват, пропускаме seed.');
            return;
        }
        if (force) {
            yield User_1.User.deleteMany({});
            yield Channel_1.Channel.deleteMany({});
            yield Message_1.Message.deleteMany({});
        }
    });
}
