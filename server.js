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
var colori= 0;

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
			p.streakStart = (new Date).getTime();
		} else {
			p.streakStart = 0;
		}

		p.x = 100;
		p.y = 100;
		p.r = 10;
		p.id = util.guid();
		p.moves = [];
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
	socket.on('movex', function(x) {
		players[socket.id].moves.push([x,0]);
	});
	socket.on('movey', function(y) {
		players[socket.id].moves.push([0,y]);
	});
});

// Logic loop
setInterval(function() {
	for(j in players) {
		var p = players[j];
		var m = p.moves.shift();
		if(m) {
			if(p.color == "#00FF00"){
				p.x += 2*m[0];
				p.y += 2*m[1];
			} else {
				p.x += m[0];
				p.y += m[1];
			}
			for(i in players) {
				if(i != p.id && util.circlesTouch(p.x, p.y, p.r, players[i].x, players[i].y, players[i].r)) {
					var temp = players[i].color;
					players[i].color = p.color;
					players[j].color = temp;
					if(players[i].color == "#00FF00") {
						players[i].streakStart = (new Date).getTime();
						players[j].streakStart = 0;
					}
					if(players[j].color == "#00FF00") {
						players[j].streakStart = (new Date).getTime();
						players[i].streakStart = 0;
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
