var express = require('express');
var path = require('path');
var app = express();
var handlebars = require('express-handlebars').create();
var server = require("http").Server(app);

var players = {};
var colors = ["#FF0000",
			  "#00FF00",
			  "#0000FF",];
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
	socket.on('new', function(p) {
		players[p.id] = p;
		socket.id = p.id;
		socket.emit('updatecolor', colors[colori++%colors.length]);
		console.log(socket.handshake.address +":"+ socket.id + " connect...");
	});
	socket.on('get others', function(data) {
		socket.emit('send others', players);
	});
	socket.on('myinfo', function(p) {
		players[socket.id] = p;
	});
	socket.on('disconnect', function() {
		console.log(socket.handshake.address +":"+ socket.id + " disconnect.");
		delete players[socket.id];
	});
});




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
