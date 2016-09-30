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
	Game.log = document.createElement("div");
	document.body.appendChild(Game.log);

	Game.player = new Player();

	Game.conn = io();
	Game.conn.emit('new');
	Game.conn.on('init', function(id, color) {
		Game.player.init(id, color);
		Game.conn.emit('get others');
	});
	Game.conn.on('send others', function(data) {
		Game.others = data;
		Game.player.update(data[Game.player.id]);
		Game.conn.emit('get others');
	});
	Game._onEachFrame(Game.run);
};

Game.run = (function() {
	var loops = 0, skipTicks = 1000 / Game.fps,
      maxFrameSkip = 10,
      nextGameTick = Date.now(),
      lastGameTick;

	return function() {
		loops = 0;

		while (Date.now() > nextGameTick) {
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
		ctx.translate(Game.others[i].x, Game.others[i].y);

		var r = Game.others[i].r;
		var r2 = r/2;

		// draw circle
		ctx.beginPath();
		ctx.fillStyle = Game.others[i].color;
		ctx.arc(0,0,r,0,2*Math.PI);
		ctx.fill();
		ctx.closePath();

		// draw crown
		if(Game.others[i].king) {
			ctx.fillStyle = "#FFFF00";
			ctx.beginPath();
			ctx.moveTo(-r2,-r2);
			ctx.lineTo(0,0);
			ctx.lineTo(r2,-r2)
			ctx.lineTo(r2,r2);
			ctx.lineTo(-r2,r2);
			ctx.closePath();
			ctx.fill();
		}

		ctx.translate(-Game.others[i].x, -Game.others[i].y);
	}
};

Game.update = function() {
	for(i in Game.others) {
		if(Game.others[i].king) {
			Game.log.innerHTML = "King streak: "+(Date.now() - Game.others[i].king)/1000 +" seconds";
		}
	}
	/* Context translation setup
	if(Game.player.x > 3*Game.canvas.width/4 ||
	   Game.player.x < Game.canvas.width/4   ||
	   Game.player.y > 3*Game.canvas.height/4 ||
	   Game.player.y < Game.canvas.height/4) {

	} */
};

document.addEventListener("keydown", function(evt){ Key.onKeyDown(evt); }, false);
document.addEventListener("keyup", function(evt) { Key.onKeyUp(evt); }, false);
