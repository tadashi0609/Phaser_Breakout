class ExampleScene extends Phaser.Scene {
	ball;
	paddle;
	bricks;

	scoreText;
	score = 0;

	lives = 3;
	livesText;
	lifeLostText;

	playing = false;
	startButton;

	textStyle = { font: '18px Arial', fill: '#0095dd'};

	preload() {
		this.load.image('ball', 'img/ball.png');
		this.load.image('paddle', 'img/paddle.png');
		this.load.image('brick', 'img/brick.png');
		this.load.spritesheet('wobble', 'img/wobble.png',{
			frameWidth: 20,
			frameHeight: 20,
		});
		this.load.spritesheet('button', 'img/button.png', {
			frameWidth: 120,
			frameHeight: 40,
		});
	}
	create() {
		this.physics.world.checkCollision.down = false;

		this.paddle = this.add.sprite(
			this.scale.width * 0.5,
			this.scale.height - 5,
			'paddle'
		);
		this.physics.add.existing(this.paddle);
		this.paddle.setOrigin(0.5, 1);
		this.paddle.body.setImmovable(true);

		this.scoreText = this.add.text(5, 5, 'Points: 0', this.textStyle);

		this.livesText = this.add.text(
			this.scale.width - 5,
			5,
			'Lives: ' + this.lives,
			this.textStyle,
		);
		this.livesText.setOrigin(1, 0);

		this.lifeLostText = this.add.text(
			this.scale.width / 2,
			this.scale.height / 2,
			'Life lost, click to continue',
			this.textStyle,
		);
		this.lifeLostText.setOrigin(0.5, 0.5);
		this.lifeLostText.visible = false;

		this.startButton = this.add.sprite(
			this.scale.width / 2,
			this.scale.height / 2,
			'button',
			0,
		);
		this.startButton.setInteractive();
		this.startButton.on(
			'pointerover',
			() => {
				this.startButton.setFrame(1);
			},
			this,
		);
		this.startButton.on(
			'pointerdown',
			() => {
				this.startButton.setFrame(2);
			},
			this,
		);
		this.startButton.on(
			'pointerout',
			() => {
				this.startButton.setFrame(0);
			},
			this,
		);
		this.startButton.on(
			'pointerup',
			() => {
				this.startGame();
			},
			this,
		);

		this.initGame();
		this.initBricks();
	}
	update() {
		this.physics.collide(this.ball, this.paddle, (ball, paddle) =>
			this.hitPaddle(ball, paddle),
		);
		this.physics.collide(this.ball, this.bricks, (ball, brick) =>
			this.hitBrick(ball, brick),
		);

		if (this.playing) {
			this.paddle.x = this.input.x || this.scale.width / 2
		}

		const ballIsOutOfBounds = !Phaser.Geom.Rectangle.Overlaps(
			this.physics.world.bounds,
			this.ball.getBounds()
		);

		// アクティブなブロックがない = ステージクリア
		if (this.bricks.countActive() === 0) {
			this.bricks.destroy(true);
			this.initBricks();
			this.initGame();
		}

		if (ballIsOutOfBounds) {
			this.ballLeaveScreen();
		}
	}

	initGame() {
		if (this.ball) {
			this.ball.destroy();
		}

		if (this.bricks && this.bricks.countActive(false) !== 0) {
			this.bricks.children.iterate(brick => {
				brick.enableBody(false, 0, 0, true, true);
			})
		}

		this.startButton.visible = true;
		this.lives = 3;
		this.score = 0;
		this.playing = false;
		this.paddle.x = this.scale.width / 2;

		this.initBall();

		this.scoreText.setText('Points: ' + this.score);
		this.livesText.setText('Lives: ' + this.lives);
	}

	initBall() {
		this.ball = this.add.sprite(
				this.scale.width / 2,
				this.scale.height - 25,
				'ball');
		this.physics.add.existing(this.ball);
		this.ball.body.setCollideWorldBounds(true, 1, 1);
		this.ball.body.setBounce(1);
		this.ball.anims.create({
			key: 'wobble',
			frameRate: 24,
			frames: this.anims.generateFrameNumbers('wobble',{
				frames: [0, 1, 0, 2, 0, 1, 0, 2, 0],
			}),
		});	
	}

	initBricks() {
		const bricksLayout = {
			width: 50,
			height: 20,
			count: {
				row: 3,
				col: 7,
			},
			offset: {
				top: 50,
				left: 60,
			},
			padding: 10,
		};

		this.bricks = this.add.group();

		for (let c = 0; c < bricksLayout.count.col; c++) {
			for (let r = 0; r < bricksLayout.count.row; r++) {
				const brickX = c * (bricksLayout.width + bricksLayout.padding) + bricksLayout.offset.left;
				const brickY = r * (bricksLayout.height + bricksLayout.padding) + bricksLayout.offset.top;

				const newBrick = this.physics.add.sprite(brickX, brickY, 'brick');
				newBrick.body.setImmovable(true);
				this.bricks.add(newBrick);
			}
		}
	}

	hitPaddle(ball, paddle) {
		this.ball.anims.play('wobble');
		ball.body.velocity.x = -5 * (paddle.x - ball.x);
	}

	hitBrick(ball, brick) {
		brick.disableBody(true, true);

		this.score += 10;
		this.scoreText.setText('Points: ' + this.score);
	}

	ballLeaveScreen() {
		this.lives--;
		if (this.lives > 0) {
			this.livesText.setText('Lives: ' + this.lives);
			this.lifeLostText.visible = true;
			this.ball.body.reset(this.scale.width / 2, this.scale.height - 25);
			this.input.once(
				'pointerdown',
				() => {
					this.lifeLostText.visible = false;
					this.ball.body.velocity.set(150, -150);
				},
				this,
			);
		} else {
			this.initGame();
		}
	}

	startGame() {
		this.startButton.visible = false;
		this.ball.body.velocity.set(150, -150);
		this.playing = true;
	}
}

const config = {
	type: Phaser.CANVAS,
	width: 480,
	height: 320,
	scene: ExampleScene,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
	},
	backgroundColor: '#eeeeee',
	physics: {
		default: 'arcade',
		arcade: {
			debug: false,
		}
	}
};

const game = new Phaser.Game(config);