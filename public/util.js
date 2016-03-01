function inCircle(cx, cy, r, x, y) {
	return x <= cx+r && x >= cx-r && y <= cy+r && y >= cy-r;
}

function circlesTouch(cx1, cy1, r1, cx2, cy2, r2) {
	return Math.abs(cx1 - cx2) <= r1 + r2 && Math.abs(cy1 - cy2) <= r1 + r2;
}

var Key = {
	_map: {},

	LEFT: 65,
	RIGHT: 68,
	UP: 87,
	DOWN: 83,

	isDown: function(key) {
		return this._map[key];
	},

	onKeyDown: function(evt) {
		this._map[evt.keyCode] = true;
	},

	onKeyUp: function(evt) {
		delete this._map[evt.keyCode];
	}
};

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

module.exports.inCircle = inCircle;
module.exports.circlesTouch = circlesTouch;