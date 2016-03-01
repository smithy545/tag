var Game = {
  fps: 30,
  width: 640,
  height: 480,
  others: {}
};

Game._onEachFrame = (function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

  if (requestAnimationFrame) {
   return function(cb) {
      var _cb = function() { cb(); requestAnimationFrame(_cb); }
      _cb();
    };
  } else {
    return function(cb) {
      setInterval(cb, 1000 / Game.fps);
    }
  }
})();

Game.start = function() {
	Game.canvas = document.createElement("canvas");
	Game.canvas.width = Game.width;
	Game.canvas.height = Game.height;

	Game.context = Game.canvas.getContext("2d");
	document.body.appendChild(Game.canvas);
	
	Game.player = new Player();

	Game.conn = io();
	Game.conn.emit('new', Game.player.getInfo());
	Game.conn.emit('get others');
	Game.conn.on('send others', function(data) {
		Game.others = data;
		Game.player.update(Game.others);
		Game.conn.emit('get others');
	});

	Game._onEachFrame(Game.run);
};

Game.run = (function() {
	var loops = 0, skipTicks = 1000 / Game.fps,
      maxFrameSkip = 10,
      nextGameTick = (new Date).getTime(),
      lastGameTick;

	return function() {
		loops = 0;

		while ((new Date).getTime() > nextGameTick) {
			Game.update();
			nextGameTick += skipTicks;
			loops++;
		}

		if (loops) Game.draw();
	}
})();

Game.draw = function() {
	Game.context.clearRect(0, 0, Game.width, Game.height);
	var ctx = Game.context;
	for(i in Game.others) {
		ctx.beginPath();
		ctx.moveTo(Game.others[i].x,Game.others[i].y);
		ctx.fillStyle = Game.others[i].color;
		ctx.arc(Game.others[i].x,Game.others[i].y,Game.others[i].r,0,2*Math.PI);
		ctx.fill();
		ctx.closePath();
	}

};

Game.update = function() {
};

document.addEventListener("keydown", function(evt){ Key.onKeyDown(evt); }, false);
document.addEventListener("keyup", function(evt) { Key.onKeyUp(evt); }, false);
