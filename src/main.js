'use strict';
const WebSocket = require('ws');
const url = require('url');
const LifeGameVirtualDom = require('../lib/LifeGameVirtualDom.js');

const wss = new WebSocket.Server({ // Открыть соединение на согласующемся с клиентской частью порту;
        port: 8080
    },
    () => console.log('Server started')
);

const game = new LifeGameVirtualDom(); // Инициализировать игру;
game.sendUpdates = sendUpdates; // Переопределить метод отправки данных клиентам sendUpdates;

setHandlers(wss); // Определить обработчики событий ws: connection, message;

/**
 * Отправляет актуальные данные игры всем клиентам
 * @param {Object} data 
 */
function sendUpdates(data) {
    broadcast(JSON.stringify({
        type: 'UPDATE_STATE',
        data
    }));
}

/**
 * Отправляет сообщения во все открытые сокетные соединения
 * @param {any} data 
 */
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

/**
 * Устанавливает обработчики событий объекта WebSocketServer
 * @param {WebSocketServer} wss
 */
function setHandlers(wss) {
    wss.on('open', openHandler);
    wss.on('close', closeHandler);
    wss.on('error', errorHandler);
    wss.on('connection', connectionHandler);
}

/**
 * Обработчик подключения очередного клиента
 * @param {WebSocket} ws 
 * @param {http.IncomingMessage} req 
 */
function connectionHandler(ws, req) {
    let userName = req.url.match(/token=(\w+)/)[1]; // Необходимо аутентифицировать клиента по токену;

    initClientGame(ws, game, userName); // При наступлении события connection отправлять данные клиенту;         

    ws.on('message', getMessageHandler(game)); // Применить изменения в игре исходя из приходящих данных
    ws.on('close', () => console.log(`User "${userName}" close connection`));
    ws.on('error', errorHandler);
}

/**
 * Отправляет клиенту инициирующие игру сообщение 
 * @param {WebSocket} ws 
 * @param {LifeGameVirtualDom} game 
 * @param {string} userName 
 */
function initClientGame(ws, game, userName) {
    ws.send(JSON.stringify({
        type: 'INITIALIZE',
        data: {
            state: game.state,
            settings: game.settings,
            user: {
                token: userName,
                color: getRandomHexColor()
            }
        }
    }));
}

/**
 * Возвращает обработчик события 'message' (сообщения от клиента)
 * @param {LifeGameVirtualDom} game 
 * @returns {function}
 */
function getMessageHandler(game) {
    return data => {
        try {
            data = JSON.parse(data);
        } catch (error) {
            errorHandler(error);
        }
        if (data.type === 'ADD_POINT') {
            game.applyUpdates(data.data);
        }
    }
}

function openHandler() {
    console.log('Connection is open');
}

function closeHandler(code, reason) {
    console.log(`Connection closed. Reason: ${reason}. Code: ${code}`);
}

function errorHandler(error) {
    console.log(error.stack || 'Socket Error. Connection Closed');
}

function getRandomHexColor() {
    return `#${Math.floor(Math.random()*16777215).toString(16)}`;
}