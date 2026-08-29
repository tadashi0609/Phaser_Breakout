import {Ball} from './ball.js';
import {BrickGroup} from './brickGroup.js';
import {BallGroup} from './ballGroup.js';

class ExampleScene extends Phaser.Scene {
	paddle;
	brickGroup;
	ballGroup;

	firstBall;

	scoreText;
	score = 0;

	lives = 3;
	livesText;
	lifeLostText;

	playing = false;
	startText;

	textStyle = { font: '18px Arial', fill: '#0095dd'};

	preload() {
		this.load.image('ball', 'img/ball.png');
		this.load.image('paddle', 'img/paddle.png');
		this.load.image('brick', 'img/brick.png');
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

		this.startText = this.add.text(
			this.scale.width / 2,
			this.scale.height / 2,
			'Click to Start',
			this.textStyle,
		);
		this.startText.setOrigin(0.5, 0.5);

		this.input.on(
			'pointerdown',
			() => {
				this.startText.visible = false;
				this.startGame();
			},
			this,
		);

		this.ballGroup = new BallGroup(this);
		this.brickGroup = new BrickGroup(this);

		this.initGame();
	}
	
	update() {
		if (this.playing) {
			this.physics.collide(
				this.ballGroup.getChildren(),
				this.paddle,
				(ball, paddle) => this.hitPaddle(ball, paddle)
			);
		}

		this.physics.collide(
			this.ballGroup.getChildren(),
			this.brickGroup.getChildren(),
			(ball, brick) => this.hitBrick(ball, brick)
		);

		this.paddle.x = this.input.x || this.scale.width / 2;
		if (this.paddle.x - this.paddle.width / 2 < 0) {
			this.paddle.x = this.paddle.width / 2;
		} else if (this.paddle.x + this.paddle.width / 2 > this.scale.width) {
			this.paddle.x = this.scale.width - this.paddle.width / 2;
		}

		if (!this.playing) {
			this.firstBall.x = this.paddle.x;
			this.firstBall.y = this.paddle.y - this.paddle.height - this.firstBall.height / 2;
		}

		// アクティブなブロックがない = ステージクリア
		if (this.brickGroup.countActive() === 0) {
			this.initGame(true);
		}

		if (this.ballGroup.countActive() === 0) {
			this.ballLeaveScreen();
		}

	}

	initGame(cleared = false) {
		if (cleared) {
			this.brickGroup.clear();
			this.brickGroup.initBricks();
		} else {
			this.brickGroup.children.iterate(brick => {
				brick.enableBody(false, 0, 0, true, true);
			})
		}

		this.startText.visible = true;
		this.lives = 3;
		this.score = 0;
		this.playing = false;
		this.paddle.x = this.scale.width / 2;

		this.firstBall = this.ballGroup.initBall(this.paddle);

		this.scoreText.setText('Points: ' + this.score);
		this.livesText.setText('Lives: ' + this.lives);

	}

	hitPaddle(ball, paddle) {
		ball.hitPaddle(paddle);
	}

	hitBrick(ball, brick) {
		brick.disableBody(true, true);

		if (Math.random() > 0.3) {
			this.ballGroup.increaseBall();
		}

		this.score += 10;
		this.scoreText.setText('Points: ' + this.score);
	}

	ballLeaveScreen() {
		this.lives--;
		if (this.lives > 0) {
			this.firstBall = this.ballGroup.initBall(this.paddle);

			this.livesText.setText('Lives: ' + this.lives);
			this.lifeLostText.visible = true;
			this.playing = false;
			this.input.once(
				'pointerdown',
				() => {
					this.lifeLostText.visible = false;
					this.playing = true;

					const newVelocity = this.calcBallVelocity();
					this.firstBall.body.velocity.set(newVelocity.x, newVelocity.y);
				},
				this,
			);
		} else {
			this.scene.restart();
		}
	}

	startGame() {
		this.startText.visible = false;
		this.playing = true;

		const newVelocity = this.calcBallVelocity();
		this.firstBall.body.velocity.set(newVelocity.x, newVelocity.y);
	}

	calcBallVelocity() {
		const ballPos = new Phaser.Math.Vector2(this.firstBall.x, this.firstBall.y);
		const targetPos = new Phaser.Math.Vector2(
			this.scale.width - this.firstBall.x,
			this.scale.height / 2
		);

		const newVelocity = targetPos.subtract(ballPos);
		newVelocity.normalize();
		newVelocity.scale(200);

		return newVelocity;
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