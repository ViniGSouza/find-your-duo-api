var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import { convertHourStringToMinutes } from './utils/convert-hour-string-to-minutes.js';
import { convertMinutesToHourString } from './utils/convert-minutes-to-hour-string.js';
const app = express();
app.use(express.json());
app.use(cors());
const prisma = new PrismaClient({
    log: ['query']
});
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ Sucesso: 'Api Funcionando.' });
}));
app.get('/games', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const games = yield prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true,
                }
            }
        }
    });
    res.json(games);
}));
app.post('/games/:id/ads', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const gameId = req.params.id;
    const body = req.body;
    const ad = yield prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hourStart: convertHourStringToMinutes(body.hourStart),
            hourEnd: convertHourStringToMinutes(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel
        }
    });
    res.status(201).json(ad);
}));
app.get('/games/:id/ads', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const gameId = req.params.id;
    const ads = yield prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hourStart: true,
            hourEnd: true,
        },
        where: {
            gameId
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return res.json(ads.map(ad => {
        return Object.assign(Object.assign({}, ad), { weekDays: ad.weekDays.split(','), hourStart: convertMinutesToHourString(ad.hourStart), hourEnd: convertMinutesToHourString(ad.hourEnd) });
    }));
}));
app.get('/ads/:id/discord', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adId = req.params.id;
    const ad = yield prisma.ad.findUniqueOrThrow({
        select: {
            discord: true,
        },
        where: {
            id: adId,
        }
    });
    return res.json({
        discord: ad.discord
    });
}));
app.listen(3333);
