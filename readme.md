# Задание по теме "WebSocket"

## Game of Life (серверная часть)

### Описание задания:
В текущем приложении реализована **серверная** часть игры `Game of Life`.
Но, к сожалению, какой-то программист Виталик удалил этот файл и уволился.
Вам предстоит реализовать утерянную часть кода.

Дабы облегчить ваши мучения вот те факты, которые нам известны:

* Все взаимодействие с клиентом происходит по протоколу **WebSocket**;
* В **opening handshake** сервер ожидает авторизации по токену;
(прим. `ws://example.com/?token=YOUR_TOKEN`)
* Сервер присылает обновления в виде сообщения со следующей структурой:
```
{
	type: 'TYPE_HERE',
	data: {Object}
}
```
* Поле `type` имеет следующие значения: [`INITIALIZE`, `UPDATE_STATE`];
* Сервер ожидает получить сообщения со следующей структурой:
```
{
	type: 'TYPE_HERE',
	data: {Object}
}
```
* Поле `type` имеет следующие значения: [`ADD_POINT`];

#### План действий:

Для написания сетевого взаимодействия необходим модуль `ws`.
Также для инициализации игры необходимо подключить модуль `/lib/LifeGameVirtualDom`:
```
	LifeGameVirtualDom(): LifeGameVirtualDom instance - конструктор, инициализирует игру
	LifeGameVirtualDom.sendUpdates(data: Object) - метод отправки данных клиентам
	LifeGameVirtualDom.state: Object - объект состояния игры
	LifeGameVirtualDom.settings: Object - объект настроек игры
	LifeGameVirtualDom.applyUpdates(data: Object): void - Применяет изменения в игре
```


* Открыть соединение на согласующемся с клиентской частью порту;
* Инициализировать игру;
* Переопределить метод отправки данных клиентам `sendUpdates`;
* Метод `sendUpdates` должен отправлять данные всем клиентам с `type` === `UPDATE_STATE` и данными из аргументов;
* Определить обработчики событий ws: `connection, message`;
* При **opening handshake** необходимо аутентифицировать клиента по токену;
* При наступлении события `connection` отправлять данные клиенту:
```
{
	type: 'INITIALIZE',
	data: {
		state: LifeGameVirtualDom.state,
		settings: LifeGameVirtualDom.settings,
		user: {
			token: string, ( === token клиента)
			color: string (случайный цвет в формате #fff / #000 ...)
		}
	}
}
```
* При сообщении с `type` === `ADD_POINT` необходимо применить изменения в игре исходя из приходящих данных `applyUpdates`.

## P.S.
Весь код пишите в файле `./src/main.js`.<br/>
Запускать приложение `npm run start:dev`.

## P.P.S
Предполагается, что клиентская часть уже написана, а сейчас вы меняете сервер на свой.
Клиентская часть игры находится [тут](https://github.com/NikitaRudenko/yandex-money-nodeschool-game-life-client).
