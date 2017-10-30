class LifeGameVirtualDom {

	constructor(updateInterval = 2000, pointSize = 10, fieldX = 980, fieldY = 560) {
		this.size = {
			point: pointSize,
			fieldX,
			fieldY,
			field: {
				x: fieldX / pointSize,
				y: fieldY / pointSize
			}
		};
		this.step = 0;
		this.population = 0;
		this._affectedPoints = {};
		this._updateInterval = updateInterval;

		this._initField();
		this._start();
	}

	get state() {
		return this._virtualField;
	}

	get settings() {
		const {
			point: pointSize,
			fieldX,
			fieldY
		} = this.size;

		return {
			pointSize,
			fieldX,
			fieldY
		};
	}

	_start() {
		setInterval(() => {
			this._step();
		}, this._updateInterval);
	}

	applyUpdates(data) {
		const {
			user,
			affectedPoints
		} = data;

		Object.keys(affectedPoints).map(key => {
			const {x, y} = affectedPoints[key];
			this._togglePoint(user, x, y);
		});
	}

	sendUpdates(data) {
		throw new Error('Вы должны имплементировать метод sendUpdates');
	}

	_sendUpdates() {
		const virtualField = this._virtualField;
		this.sendUpdates(virtualField);
	}

	_initField() {
		const sizeX = this.size.field.x;
		const sizeY = this.size.field.y;
		const virtualField = [];

		for (let i = 0; i < sizeX; i++) {
			virtualField[i] = [];

			for (let j = 0; j < sizeY; j++) {
				virtualField[i][j] = false;
			}
		}

		this._virtualField = virtualField;
	}

	_step() {
		this._reCalcVirtualField();
		this._render();

		this.step++;

		this._sendUpdates();
	}

	_reCalcVirtualField() {
		const sizeX = this.size.field.x;
		const sizeY = this.size.field.y;

		for (let i = 0; i < sizeX; i++) {
			for (let j = 0; j < sizeY; j++) {
				const neighbors = this._getNeighbors(i, j);
				const neighborsCount = neighbors.length;

				if (this._checkPoint(i, j)) {
					if (neighborsCount < 2 || neighborsCount > 3) {
						this._delPoint({}, i, j);
					}
				} else {
					if (neighborsCount === 3) {
						const user = this._getNewOwnerForPoint(neighbors);
						this._addPoint(user, i, j);
					}
				}
			}
		}
	}

	_render() {
		const affectedPoints = this._affectedPoints;

		for (let uniqueKey of Object.keys(affectedPoints)) {
			const point = affectedPoints[uniqueKey];
			const {user, x, y, isAlive} = point;

			if (!isAlive) {
				this._virtualField[x][y] = false;
				this.population--;
			} else {
				this._virtualField[x][y] = {user};
				this.population++;
			}
		}

		this._affectedPoints = {};
	}

	_getNeighbors(x, y) {
		let xMin = x - 1;
		let xMax = x + 1;
		let yMin = y - 1;
		let yMax = y + 1;
		let neighbors = [];

		for (let i = xMin; i <= xMax; i++) {
			for (let j = yMin; j <= yMax; j++) {
				if (!(i === x && j === y) && this._pointOnField(i, j)) {
					const isPoint = this._checkPoint(i, j);

					if (isPoint) {
						neighbors.push(this._virtualField[i][j]);
					}
				}
			}
		}

		return neighbors;
	}

	_getNewOwnerForPoint(neighbors) {
		let counter = {};
		let max = {};

		neighbors.forEach((item) => {
			if (counter[item.token]) {
				counter[item.token] = Object.assign({}, item, {counter: counter[item.token].counter + 1});
				return;
			}

			counter[item.token] = Object.assign({}, item, {counter: 1});
		});

		Object.keys(counter).forEach((item, i) => {
			if (max.counter < counter[item].counter || !max.counter) max = counter[item];
		});

		return {
			token: max.user.token,
			color: max.user.color
		};
	}

	_togglePoint(user, x, y) {
		const hasAccess = this._hasAccess(user, x, y);
		if (!hasAccess) {
			return false;
		}

		if (!this._checkPoint(x, y)) {
			return this._addPoint(user, x, y);
		}

		return this._delPoint(user, x, y);
	}

	_addPoint(user, x, y) {
		this._addAffected(user, x, y, true);
	}

	_delPoint(user, x, y) {
		this._addAffected(user, x, y, false);
	}

	_addAffected(user, x, y, isAlive) {
		const uniqueKey = x + '' + y;
		const data = {user, x, y, isAlive};

		return this._affectedPoints[uniqueKey] = data;
	}

	_checkPoint(x, y) {
		return !!this._virtualField[x][y];
	}

	_hasAccess(user, x, y) {
		if (!this._virtualField[x][y] || !this._virtualField[x][y].user) {
			return true;
		}

		const currentOwner = this._virtualField[x][y].user.token;
		return currentOwner === user.token;
	}

	_pointOnField(x, y) {
		const sizeX = this.size.field.x;
		const sizeY = this.size.field.y;
		const isInX = x >= 0 && x < sizeX;
		const isInY = y >= 0 && y < sizeY;

		return isInX && isInY;
	}
}

module.exports = LifeGameVirtualDom;
