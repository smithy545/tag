var express = require('express');
var path = require('path');
var app = express();
var handlebars = require('express-handlebars').create();
var server = require("http").Server(app);
var util = require('./public/js/util.js');

var players = {};
var sockets = [];
var colors = ["#FF0000", // red - fire
			  "#00FF00", // green - speed
			  "#0000FF", // blue - water
			  "#00FFFF", // turqoise - ice
			  "#FF1493", // pink - magic
			  "#DC143C"  // crimson - grow 
			  ];
var colori = 0;

var PLAYERSPEED = 3;
var WIDTH = 800;
var HEIGHT = 600;

Math.sign = function(x) {
	return x ? x < 0 ? -1:1:0
}

server.listen(80);

app.get('/', function(req, res, next) {
	if(req.xhr) {
		var objs = [{x:10,y:10,r:10}];
		return res.send(objs);
	}
	res.render('index');
});

io = require("socket.io")(server);

io.on("connection", function(socket) {
	socket.on('new', function() {
		var p = {};

		p.color = colors[colori++%colors.length];
		p.x = 100;
		p.y = 100;
		p.r = 10;
		if(Object.keys(players).length > 0) {
			p.king = false;
		} else {
			p.king = Date.now();
			p.color = "#00FF00";
		}
		p.adj = [];
		if(p.color == "#00FF00") {
			p.speedy = 2;
		} else {
			p.speedy = 1;
		}
		p.cooldown = 0;
		p.tagging = false;
		p.id = util.guid();
		p.moves = {
			x: 0,
			y: 0,
		};
		socket.emit("init", p.id, p.color);

		players[p.id] = p;
		socket.id = p.id;
		console.log(socket.handshake.address +":"+ socket.id + " connect...");
	});
	socket.on('get others', function(data) {
		socket.emit('send others', players);
	});
	socket.on('disconnect', function() {
		console.log(socket.handshake.address +":"+ socket.id + " disconnect.");
		delete players[socket.id];
	});
	socket.on('fire', function() {
		var now = Date.now();
		if(players[socket.id].cooldown < now) {
			players[socket.id].adj.push({
				endTime: now + 1000,
				value: 3
			});
			players[socket.id].cooldown = now + 2000;
		}
	});
	socket.on('ice', function() {
		var now = Date.now();
		if(players[socket.id].cooldown < now) {
			for(i in players) {
				if(i !== socket.id) {
					players[i].adj.push({
						endTime: now + 1000,
						value: 0.5
					});
				}
			}
			players[socket.id].cooldown = now + 2000;
		}
	});
	socket.on('water', function() {
		var now = Date.now();
		if(players[socket.id].cooldown < now) {
			for(i in players) {
				if(i !== socket.id) {
					players[i].moves.x *= 10;
					players[i].moves.y *= 10;
				}
			}
			players[socket.id].cooldown = now + 2000;
		}
	});
	socket.on('magic', function() {
		var now = Date.now();
		if(players[socket.id].cooldown < now) {
			players[socket.id].x = Math.floor(Math.random()*WIDTH);
			players[socket.id].y = Math.floor(Math.random()*HEIGHT);
			players[socket.id].cooldown = now + 2000;
		}
	});
	socket.on('grow', function() {
		var now = Date.now();
		if(players[socket.id].cooldown < now) {
			players[socket.id].r *= 2;
			setTimeout(function(){
				players[socket.id].r /= 2;
			}, 2000);
			players[socket.id].cooldown = now + 2000;
		}
	});
	socket.on('right', function() {
		players[socket.id].moves.x += 1;
	});
	socket.on('left', function() {
		players[socket.id].moves.x -= 1;
	});
	socket.on('up', function() {
		players[socket.id].moves.y -= 1;
	});
	socket.on('down', function() {
		players[socket.id].moves.y += 1;
	});
});

// Logic loop
setInterval(function() {
	for(j in players) {
		var p = players[j];
		var m = p.moves;
		var xSign = Math.sign(m.x);
		var ySign = Math.sign(m.y);

		if(m.x !== 0 || m.y !== 0) {
			// add speed adjustments
			var adj = 1 * p.speedy;
			for(k in p.adj) {
				if(Date.now() > p.adj[k].endTime) {
					delete p.adj[k];
				} else {
					adj *= p.adj[k].value;
				}
			}

			// cause javascript modulo is stupid
			p.x = ((p.x + xSign*adj*PLAYERSPEED)%WIDTH+WIDTH)%WIDTH;
			p.y = ((p.y + ySign*adj*PLAYERSPEED)%HEIGHT+HEIGHT)%HEIGHT;

			m.x -= xSign;
			m.y -= ySign;

			// check for collisions
			for(i in players) {
				if(i !== j) // Check against self
				{
					var touching = util.circlesTouch(p.x, p.y, p.r, players[i].x, players[i].y, players[i].r);
					if(p.tagging === i && !touching) { // if they go from touching to not touching
						p.tagging = false;
						players[i].tagging = false;
					} else if(!p.tagging && touching) { // if they they start touching
						var temp = players[i].color;
						players[i].color = p.color;
						p.color = temp;

						p.speedy = 1 + (p.color === "#00FF00");
						players[i].speedy = 1 + (players[i].color === "#00FF00");

						if(p.king) {
							players[i].king = Date.now();
							p.king = false;
						} else if (players[i].king) {
							p.king = Date.now();
							players[i].king = false;
						}

						p.tagging = i;
						players[i].tagging = j;
					}
				}
			}
		}
	}
}, 1);

// view engine setup
app.engine('handlebars', handlebars.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
	  message: err.message,
	  error: err
	});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
	message: err.message,
	error: {}
  });
});


module.exports = app;
