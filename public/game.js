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
	var log = document.createElement("div");
	log.setAttribute("id","log");
	document.body.appendChild(log);
	var othersinfo = document.createElement("div");
	othersinfo.setAttribute("id","othersinfo");
	document.body.appendChild(othersinfo);

	Game.canvas.offset = $("canvas").offset();

	Game.player = new Player();

	Game.conn = io();
	Game.conn.emit('new', Game.player.getInfo());
	Game.conn.on('updatecolor', function(c) {
		Game.player.color = c;
	});

	$( "canvas" ).on( "mousemove", function( event ) {
		var mousex = event.pageX-Game.canvas.offset.left;
		var mousey = event.pageY-Game.canvas.offset.top;
		$( "#log" ).text( "Mouse X: " + mousex + ", Mouse Y: " + mousey);
		othersinfo.innerHTML = "";
		for(i in Game.others) {
			var x = Game.others[i].x;
			var y = Game.others[i].y;
			var r = Game.others[i].r;
			if(inCircle(x,y,r,mousex,mousey)) {
				othersinfo.innerHTML += JSON.stringify(Game.others[i]);
			}
		}
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
	Game.player.draw(Game.context);
	var ctx = Game.context;
	for(i in Game.others) {
		if(Game.others[i].id != Game.player.id){
			ctx.beginPath();
			ctx.moveTo(Game.others[i].x,Game.others[i].y);
			ctx.fillStyle = Game.others[i].color;
			ctx.arc(Game.others[i].x,Game.others[i].y,Game.others[i].r,0,2*Math.PI);
			ctx.fill();
			ctx.closePath();
		}
	}

};

Game.update = function() {
	Game.player.update(Game.others);
	Game.conn.emit('myinfo', Game.player.getInfo());
	Game.conn.emit('get others');
	Game.conn.on('send others', function(data) {
		Game.others = data;
		delete Game.others[Game.player.id];
	});
};
