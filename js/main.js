import { BrickGroup } from './brickGroup.js';
import { BallGroup } from './ballGroup.js';
import { Powerup } from './powerup.js';
import { Paddle } from './paddle.js';
import { InputScene } from './inputScene.js';

const MAX_LEVEL = 1;

class MainScene extends Phaser.Scene {
	paddle;
	brickGroup;
	ballGroup;
	powerupGroup;

	firstBall;

	inputScene;

	level;

	scoreText;
	score = 0;

	lives = 3;
	livesText;
	lifeLostText;

	playing = false;
	startText;

	textStyle = { font: '18px Arial', fill: '#0095dd'};

	constructor() {
		super({ key: 'main' });
	}

	init() {
		if (this.registry.has('level')) {
			this.level = this.registry.get('level');
		} else {
			this.registry.set('level', 0);
			this.level = 0;
		}
	}

	preload() {
		this.load.image('ball', 'img/ball.png');
		this.load.image('paddle', 'img/paddle.png');
		this.load.image('brick', 'img/brick.png');
		this.load.spritesheet('powerup', 'img/powerup.png', {
			frameWidth: 20,
			frameHeight: 20,
		});

		this.load.json('level', 'json/level' + this.level + '.json');
	}

	create() {
		this.physics.world.checkCollision.down = false;
		this.physics.world.setBounds(0, 20, this.scale.width, this.scale.height - 20);

		this.paddle = new Paddle(this, this.scale.width / 2, this.scale.height - 70);

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
			this.scale.height * 0.6,
			'Life lost, click to continue',
			this.textStyle,
		);
		this.lifeLostText.setOrigin(0.5, 0.5);
		this.lifeLostText.visible = false;

		this.startText = this.add.text(
			this.scale.width / 2,
			this.scale.height * 0.6,
			'Click to Start',
			this.textStyle,
		);
		this.startText.setOrigin(0.5, 0.5);

		this.ballGroup = new BallGroup(this);
		this.brickGroup = new BrickGroup(this);
		this.powerupGroup = this.physics.add.group();
		this.powerupGroup.runChildUpdate = true;

		this.scene.launch('input');
		this.inputScene = this.scene.get('input');
		
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

		if (this.playing) {
			this.physics.overlap(
				this.powerupGroup.getChildren(),
				this.paddle,
				(powerup, paddle) => this.getPowerup(powerup, paddle)
			);
		}

		this.inputScene.movePaddle(this.paddle);
		this.paddle.fixPosition();

		if (!this.playing) {
			this.firstBall.x = this.paddle.x;
			this.firstBall.y = this.paddle.y - this.paddle.height - this.firstBall.height / 2;
		}

		if (this.brickGroup.countActive() === 0) {
			this.initGame(true);
		}

		if (this.ballGroup.countActive() === 0) {
			this.ballLeaveScreen();
		}

	}

	initGame(cleared = false) {
		if (cleared) {
			this.cache.json.remove('level');

			if (this.registry.get('level') === MAX_LEVEL) {
				this.registry.set('level', 0);
			} else {
				this.registry.values.level++;
			}

			this.scene.restart();
		} else if (!this.playing) {
			this.brickGroup.initBricks(this.cache.json.get('level'));
		} else {
			this.brickGroup.children.iterate(brick => {
				brick.enableBody(false, 0, 0, true, true);
			});
		}

		const brickCount = this.brickGroup.countActive();

		this.powerupGroup.clear(true, true);
		for (let i = 0; i < brickCount * 0.25; i++) {
			let type = (((-1) ** i) + 1) / 2;
			if (i > brickCount * 0.1) { type = 0; }
			const powerup = new Powerup(this, 0, 0, type, this.powerupGroup);
			this.powerupGroup.add(powerup);
		}

		this.paddle.initScale();

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
		const disabled = brick.hitBall();

		if (disabled) {
			if (Math.random() < 0.3 && this.powerupGroup.getFirstDead()) {
				this.powerupGroup.getFirstDead().startFall(brick.x, brick.y);
			}

			this.score += 10;
			this.scoreText.setText('Points: ' + this.score);

		}

	}

	getPowerup(powerup, paddle) {
		switch (powerup.powerupType) {
			case 0:
				this.ballGroup.increaseBall();
				break;
			
			case 1:
				this.paddle.powerup();
				break;
		
			default:
				break;
		}
		
		this.powerupGroup.remove(powerup, true, true);
	}

	ballLeaveScreen() {
		this.lives--;
		if (this.lives > 0) {
			this.firstBall = this.ballGroup.initBall(this.paddle);

			this.powerupGroup.children.iterate(powerup => {
				powerup.body.stop();
			})

			const isTimerPlayed = this.paddle.powerupTimeline.isPlaying();
			this.paddle.powerupTimeline.pause();

			this.livesText.setText('Lives: ' + this.lives);
			this.lifeLostText.visible = true;
			this.playing = false;

			this.input.on(
				'pointerup',
				() => {
					if (!this.isPointerMove) {
						this.lifeLostText.visible = false;
						this.playing = true;

						if (isTimerPlayed) { this.paddle.powerupTimeline.resume(); }

						const newVelocity = this.calcBallVelocity();
						this.firstBall.body.velocity.set(newVelocity.x, newVelocity.y);

						this.powerupGroup.children.iterate(powerup => {
							if (powerup.active) {
								powerup.startFall()
							}
						})
					}
				},
				this,
			);
		} else {
			this.initGame();
		}
	}

	startGame() {
		if (!this.playing) {
			this.startText.visible = false;
			this.playing = true;

			const newVelocity = this.calcBallVelocity();
			this.firstBall.body.velocity.set(newVelocity.x, newVelocity.y);
		}
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
	type: Phaser.WEBGL,
	width: 480,
	height: 400,
	scene: [MainScene, InputScene],
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
	},
	backgroundColor: '#d0d0d0',
	physics: {
		default: 'arcade',
		arcade: {
			debug: false,
		}
	}
};

const game = new Phaser.Game(config);