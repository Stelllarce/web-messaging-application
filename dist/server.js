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
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const structure_1 = __importDefault(require("./controllers/structure"));
const messages_1 = __importDefault(require("./controllers/messages"));
const users_1 = __importDefault(require("./controllers/users"));
const channels_1 = __importDefault(require("./controllers/channels"));
const database_1 = require("./utils/database");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.error('MONGO_URI is not set in the .env file!');
    process.exit(1);
}
mongoose_1.default.connect(mongoUri)
    .then(() => console.log('Connected with MongoDB'))
    .catch((err) => {
    console.error('Error while connecting MongoDB:', err);
    process.exit(1);
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
});
//controllers
app.use('/structure', structure_1.default);
app.use('/messages', messages_1.default);
app.use('/users', users_1.default);
app.use('/channels', channels_1.default);
//Тестов route
app.get('/', (req, res) => {
    res.send('The server is working!');
});
mongoose_1.default.connection.once('open', () => __awaiter(void 0, void 0, void 0, function* () {
    //console.log('Стартиране на seedData...');
    try {
        yield (0, database_1.seedData)(true);
        //console.log('SeedData е приключено успешно');
    }
    catch (err) {
        //console.error('Грешка при seedData:', err);
    }
}));
//Стартиране на сървъра
app.listen(port, () => {
    console.log(`Сървърът слуша на http://localhost:${port}`);
});
