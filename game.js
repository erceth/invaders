;(function (exports) {

	/*Game Constructor*/
	var Game = function(canvasId) {
		var canvas = document.getElementById(canvasId);
		var screen = canvas.getContext("2d");
		var gameSize = {x: canvas.width, y: canvas.height};

		this.bodies = createInvaders(this).concat(new Player(this, gameSize));

		var self = this;
		var tick = function() {
			self.update(gameSize);
			self.draw(screen, gameSize); 
			requestAnimationFrame(tick);
			console.log(self.bodies.length);
		};

		tick();


	};

	/*Game methods */
	Game.prototype = {
		update: function(gameSize) {
			var bodies = this.bodies;

			//remove any bodies that are colliding
			this.bodies = this.bodies.filter(function(b1) {
				return bodies.filter(function(b2) { 
					return colliding(b1, b2);
				}).length === 0;
			});

			//remove bullets when they go off screen
			this.bodies = this.bodies.filter(function(b) {
				if(!(b instanceof Bullet)) {
					return true;
				} else {
					return b.center.y > 0 && b.center.y < gameSize.x;
				}
			});


			for (var i = 0; i < this.bodies.length; i++) {
				this.bodies[i].update();
			}

		},
		draw: function(screen, gameSize) {
			screen.clearRect(0,0, gameSize.x, gameSize.y) //clears whole screen
			for (var i = 0; i < this.bodies.length; i++) {
				this.bodies[i].draw(screen, gameSize);
			}
			
			// for (var i = 0; i < this.bodies.length; i++) {
			// 	drawRect(screen, this.bodies[i]);
			// }
		},
		addBody: function(body) {
			this.bodies.push(body);

		},

		invadersBelow: function(invader) {
			return this.bodies.filter(function(b) {
				return b instanceof Invader &&
				b.center.y > invader.center.y && 
				b.center.x - invader.center.x < invader.size.x;
			}).length > 0;

		}

	};


	/* player constructor */
	var Player = function(game, gameSize) {
		this.game = game;
		this.gameSize = gameSize;
		this.size = {x : 15, y: 15};
		this.center = {x: gameSize.x / 2, y: gameSize.y - this.size.x};
		this.keyboarder = new Keyboarder();
		this.ship = new Image(this.size.x, this.size.y);
		this.ship.src = "ship.png"

	};

	/* player methods */
	Player.prototype = {
		update: function() {
			if(this.keyboarder.isDown(this.keyboarder.KEYS.LEFT) && (this.center.x - (this.size.x / 2) > 0))  {
				this.center.x -= 2;
			} else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT) && (this.center.x + (this.size.x / 2) < this.gameSize.x)) {
				this.center.x += 2;
			}
			if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
				var bullet = new Bullet({ x: this.center.x, y: this.center.y - this.size.x},
										 {x: 0, y: -6});
				this.game.addBody(bullet);
			}
		},
		draw: function(screen, gameSize) {
			screen.drawImage(this.ship, this.center.x - this.size.x / 2, this.center.y - this.size.y / 2, this.size.x, this.size.y);
		}

	};

	/* Bullet */
	//velocity + is down, - is up
	var Bullet = function(center, velocity) {
		this.size = {x: 3, y: 3}
		this.center = center;
		this.velocity = velocity;

	};

	Bullet.prototype = {
		update: function() {
			this.center.x += this.velocity.x;
			this.center.y += this.velocity.y;
		},
		draw: function(screen, gameSize) {
			screen.fillRect(this.center.x - this.size.x / 2,
						this.center.y - this.size.x / 2,
						this.size.x, this.size.y);
			
		}


	}

	/* Invader */
	var Invader = function(game, center ) {
		this.game = game;
		this.size = { x: 15, y: 15};
		this.center = center;
		this.patrolX = 0;
		this.speedX = 0.3;
		this.invader = new Image();
		this.invader.src = "invader.jpg";
	};

	Invader.prototype = {
		update: function() {
			if (this.patrolX < 0 || this.patrolX > 40) {
				this.speedX = -this.speedX;
			}
			this.center.x += this.speedX;
			this.patrolX += this.speedX;

			if (Math.random() > 0.995 && !this.game.invadersBelow(this) ) {
				var bullet = new Bullet ({ x: this.center.x, y: this.center.y + this.size.x },
										{x: Math.random() - 0.5, y: 2});
				this.game.addBody(bullet);
			}

		},
		draw: function(screen, gameSize) {
			screen.drawImage(this.invader, this.center.x - this.size.x / 2, this.center.y - this.size.y / 2, this.size.x, this.size.y);
		}
	};

	/* keyborder */
	var Keyboarder = function () {
		var keyState = {};
		window.onkeydown = function(e) {
			keyState[e.keyCode] = true;
		};

		window.onkeyup = function(e) {
			keyState[e.keyCode] = false;
		};

		this.isDown = function(keyCode) {
			return keyState[keyCode] === true;
		};

		this.KEYS = { LEFT: 37, RIGHT: 39, SPACE: 32 };
	};

	//create invaders
	var createInvaders = function(game) {
		var invaders = [];
		for (var i = 0; i < 24; i++) { 
			var x = 30 + (i % 8) * 30;
			var y = 30 + (i % 3) * 30;
			invaders.push(new Invader(game, {x: x, y: y}));

		}
		return invaders;
	}

	//is any 5 conditions are true the two bodies are colliding
	var colliding = function(b1, b2) {
		return !(b1 === b2 ||
				b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
				b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
				b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
				b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2);
	}






	/* kicks things off*/
	window.onload = function() {
		new Game("canvas");

	};

})(this);