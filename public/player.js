function Player(color) {
	this.x = 100;
	this.y = 100;
	this.r = 10;
	this.name = "anon";
	this.color = color | "#FF0000";
	this.id = guid();
}

Player.prototype.draw = function(ctx) {
	ctx.beginPath();
	ctx.moveTo(this.x,this.y);
	ctx.fillStyle = this.color;
	ctx.arc(this.x,this.y,this.r,0,2*Math.PI);
	ctx.fill();
	ctx.closePath();
}

Player.prototype.update = function(others) {
	if(Key.isDown(Key.UP)) this.moveUp();
	if(Key.isDown(Key.LEFT)) this.moveLeft();
	if(Key.isDown(Key.RIGHT)) this.moveRight();
	if(Key.isDown(Key.DOWN)) this.moveDown();
	this.color = others[this.id].color;
	this.x = others[this.id].x;
	this.y = others[this.id].y;
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

Player.prototype.getInfo = function() {
	return {x:this.x, y:this.y, r:this.r, name:this.name, id:this.id, color:this.color};
}