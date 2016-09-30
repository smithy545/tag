var express = require('express');
var path = require('path');
var app = express();
var handlebars = require('express-handlebars').create();
var server = require("http").Server(app);
var util = require('./public/util.js');

var players = {};
var sockets = [];
var colors = ["#FF0000",
			  "#00FF00",
			  "#0000FF",
			  "#00FFFF",
			  "#FF1493"];
var colori = 0;
var PLAYERSPEED = 1;

server.listen(3000);

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
		if(p.color == "#00FF00") {
			p.speedy = true;
			p.streakStart = (new Date).getTime();
		} else {
			p.speedy = false;
			p.streakStart = 0;
		}

		p.x = 100;
		p.y = 100;
		p.r = 10;
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
			if(p.speedy){
				p.x += xSign*2*PLAYERSPEED;
				p.y += ySign*2*PLAYERSPEED;
			} else {
				p.x += xSign*PLAYERSPEED;
				p.y += ySign*PLAYERSPEED;
			}
			m.x -= xSign;
			m.y -= ySign;

			for(i in players) {
				if(i !== j) {
					var touching = util.circlesTouch(p.x, p.y, p.r, players[i].x, players[i].y, players[i].r);
					if(p.tagging === i && !touching) {
						p.tagging = false;
						players[i].tagging = false;
					} else if(!p.tagging && touching) {
						var temp = players[i].color;
						players[i].color = p.color;
						p.color = temp;

						if(p.speedy) {
							players[i].streakStart = (new Date).getTime();
							players[i].speedy = true;

							p.streakStart = 0;
							p.speedy = false;
						}
						if(players[i].speedy) {
							p.streakStart = (new Date).getTime();
							p.speedy = true;

							players[i].streakStart = 0;
							players[i].speedy = false;
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
