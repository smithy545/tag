Util = {}

Util.circlesTouch = function(cx1, cy1, r1, cx2, cy2, r2) {
	return Math.abs(cx1 - cx2) <= r1 + r2 && Math.abs(cy1 - cy2) <= r1 + r2;
}

var Key = {
	_map: {},

	LEFT: 65,
	RIGHT: 68,
	UP: 87,
	DOWN: 83,
	SPACE: 32,

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

Util.guid = function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

var module = module || undefined;
if(module !== undefined) {
	module.exports = Util;
}