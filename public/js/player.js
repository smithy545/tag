function Player() {
	this.x = 100;
	this.y = 100;
	this.r = 10;
	this.color = undefined;
	this.id = undefined;
    this.speed = 1;
}

Player.prototype.init = function(id, color) {
	this.id = id;
	this.color = color;
}

Player.prototype.update = function(p) {
	if(Key.isDown(Key.UP) || Key.isDown(Key.W)) this.moveUp();
	if(Key.isDown(Key.LEFT) || Key.isDown(Key.A)) this.moveLeft();
	if(Key.isDown(Key.RIGHT) || Key.isDown(Key.D)) this.moveRight();
	if(Key.isDown(Key.DOWN) || Key.isDown(Key.S)) this.moveDown();
	this.color = p.color;
	this.x = p.x;
	this.y = p.y;
    if(this.color === "#00FF00") {
	this.speed = 2;
    } else {
	this.speed = 1;
    }
}

Player.prototype.moveUp = function() {
    this.y -= this.speed;
	Game.conn.emit('up');
}
Player.prototype.moveDown = function() {
    this.y += this.speed;
	Game.conn.emit('down');
}
Player.prototype.moveLeft = function() {
    this.x -= this.speed;
	Game.conn.emit('left');
}
Player.prototype.moveRight = function() {
    this.x += this.speed;
	Game.conn.emit('right');
}
Player.prototype.usePower = function() {
	if(this.color === "#FF0000") {
		Game.conn.emit('fire');
	} else if(this.color === "#00FFFF") {
		Game.conn.emit('ice');
	} else if(this.color === "#0000FF") {
		Game.conn.emit('water');
	} else if(this.color === "#FF1493") {
		Game.conn.emit('magic');
	} else if(this.color === "#DC143C") {
		Game.conn.emit('grow');
	}
}

document.addEventListener("keyup", function(evt) {
	if(evt.keyCode === Key.SPACE) {
		Game.player.usePower();
	}
});
