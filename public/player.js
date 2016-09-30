function Player() {
	this.x = 100;
	this.y = 100;
	this.r = 10;
	this.color = undefined;
	this.id = undefined;
}

Player.prototype.init = function(id, color) {
	this.id = id;
	this.color = color;
}

Player.prototype.update = function(p) {
	if(Key.isDown(Key.UP)) this.moveUp();
	if(Key.isDown(Key.LEFT)) this.moveLeft();
	if(Key.isDown(Key.RIGHT)) this.moveRight();
	if(Key.isDown(Key.DOWN)) this.moveDown();
	this.color = p.color;
	this.x = p.x;
	this.y = p.y;
	this.speedy = p.speedy;
}

Player.prototype.moveUp = function() {
	Game.conn.emit('up');
}
Player.prototype.moveDown = function() {
	Game.conn.emit('down');
}
Player.prototype.moveLeft = function() {
	Game.conn.emit('left');
}
Player.prototype.moveRight = function() {
	Game.conn.emit('right');
}
