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
}

Player.prototype.moveUp = function() {
	Game.conn.emit('movey', -0.5);
}
Player.prototype.moveDown = function() {
	Game.conn.emit('movey', 0.5);
}
Player.prototype.moveLeft = function() {
	Game.conn.emit('movex', -0.5);
}
Player.prototype.moveRight = function() {
	Game.conn.emit('movex', 0.5);
}
