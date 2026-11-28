import { BrickGroup } from './brickGroup.js';
import { BallGroup } from './ballGroup.js';
import { Powerup } from './powerup.js';
import { Paddle } from './paddle.js';
import { InputScene } from './inputScene.js';

const MAX_LEVEL = 3;

class MainScene extends Phaser.Scene {
	paddle;
	brickGroup;
	ballGroup;
	powerupGroup;

	firstBall;

	inputScene;

	clearTimer;

	level;

	scoreText;
	score = 0;

	lives = 3;
	livesText;
	lifeLostText;

	playing = false;
	startText;

	textStyle = { font: '22px ui-serif', fill: '#0095dd'};
	timerConfig = { delay: 30000, paused: true };

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

		if (this.registry.has('score')) {
			this.score = this.registry.get('score');
		} else {
			this.registry.set('score', 0);
			this.score = 0;
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
		this.load.html('result', 'result.html');
	}

	create() {
		this.physics.world.checkCollision.down = false;
		this.physics.world.setBounds(0, 25, this.scale.width, this.scale.height - 25);

		this.paddle = new Paddle(this, this.scale.width / 2, this.scale.height - 70);

		this.scoreText = this.add.text(
			5, 5,
			'Points: ' + this.score,
			this.textStyle);

		this.livesText = this.add.text(
			this.scale.width - 5,
			5,
			'Life: ' + this.lives,
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

		this.clearTimer = this.time.addEvent(this.timerConfig);
		
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
			this.loadNextLevel();
		}

		if (this.ballGroup.countActive() === 0) {
			this.ballLeaveScreen();
		}

	}

	initGame() {
		if (!this.playing) {
			this.brickGroup.initBricks(this.cache.json.get('level'));
		} else {
			this.brickGroup.children.iterate(brick => {
				if (brick.hardness >= 0) {
					brick.enableBody(false, 0, 0, true, true);
				}
			});

			this.score = this.registry.get('score');
		}

		const brickCount = this.brickGroup.countActive();

		this.powerupGroup.clear(true, true);
		for (let i = 0; i < brickCount / 4; i++) {
			let type = (((-1) ** i) + 1) / 2;
			if (i > brickCount * 0.1) { type = 0; }
			const powerup = new Powerup(this, 0, 0, type, this.powerupGroup);
			this.powerupGroup.add(powerup);
		}

		this.paddle.initScale();

		this.clearTimer.reset(this.timerConfig);

		this.startText.visible = true;
		this.lives = 3;
		this.playing = false;
		this.paddle.x = this.scale.width / 2;

		this.firstBall = this.ballGroup.initBall(this.paddle);

		this.scoreText.setText('Point: ' + this.score);
		this.livesText.setText('Life: ' + this.lives);
	}

	loadNextLevel() {
		this.playing = false;
		this.cache.json.remove('level');

		if (this.level === MAX_LEVEL) {
			const element = this.add.dom(this.scale.width / 2, this.scale.height / 2).createFromCache('result');
			const score = this.score;
			const scene = this.scene;
			const date = Date.now();
			element.getChildByID('scoreText').innerText = 'Score: ' + score;
			element.addListener('click');
			element.on('click', function (event) {
				if (event.target.name === 'submitButton') {
					const inputText = this.getChildByName('nameField').value;
					let scores;

					if (inputText !== '') {
						if (localStorage.getItem('scores')) {
							scores = JSON.parse(localStorage.getItem('scores'));
							const newScore = { rank: 0, score: score, name: inputText, date: date };
							scores.push(newScore);
						} else {
							scores = [{ rank: 0, score: score, name: inputText, date: date }];
						}

						scores.sort((a, b) => b.score - a.score);
						for (let i = 0; i < scores.length; i++) {
							scores[i].rank = i + 1;
						}

						localStorage.setItem('scores', JSON.stringify(scores));
						displayLeaderboard();
						this.destroy(true);
						scene.restart();
					}
				} else if (event.target.name === 'cancelButton') {
					this.destroy(true);
					scene.restart();
				}
			});

			this.scene.pause('main');
			this.registry.set('level', 0);
			this.registry.set('score', 0);
		} else {
			this.registry.values.level++;

			this.score += Math.trunc(this.clearTimer.getRemainingSeconds()) * 50;
			this.registry.set('score', this.score);
			this.scene.restart();
		}
	}

	hitPaddle(ball, paddle) {
		ball.hitPaddle(paddle);
	}

	hitBrick(ball, brick) {
		const disabled = brick.hitBall();

		if (disabled) {
			const rand = Math.trunc(Math.random() * 2);
			if (this.powerupGroup.countActive(false) + rand > this.brickGroup.countActive() / 4) {
				if (this.powerupGroup.getFirstDead()) {
					this.powerupGroup.getFirstDead().startFall(brick.x, brick.y);
				}
			}

			this.score += 10;
			this.scoreText.setText('Point: ' + this.score);
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

			this.paddle.isTimelinePlayed = this.paddle.powerupTimeline.isPlaying();
			this.paddle.powerupTimeline.pause();

			this.livesText.setText('Life: ' + this.lives);
			this.lifeLostText.visible = true;
			this.playing = false;

			this.clearTimer.paused = true;
		} else {
			this.initGame();
		}
	}

	startGame() {
		if (!this.playing) {
			this.startText.visible = false;
			this.lifeLostText.visible = false;
			this.playing = true;

			const newVelocity = this.calcBallVelocity();
			this.firstBall.body.velocity.set(newVelocity.x, newVelocity.y);

			this.powerupGroup.children.iterate(powerup => {
				if (powerup.active) {
					powerup.startFall()
				}
			});

			if (this.paddle.isTimelinePlayed) {
				this.paddle.powerupTimeline.resume();
				this.paddle.isTimelinePlayed = false;
			}

			this.clearTimer.paused = false;
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

function displayLeaderboard(key = 'score', isDesc = true) {
	let exports = '';
	let scores = JSON.parse(localStorage.getItem('scores'));

	if (scores) {		
		switch (key) {
			case 'score':
				scores.sort((a, b) => isDesc ? b.score - a.score : a.score - b.score);
				break;
		
			case 'date':
				scores.sort((a, b) => isDesc ? b.date - a.date : a.date - b.date);
				break;

			default:
				break;
		}

		scores.forEach(values => {
			exports += `<tr scope="row"><td>${values.rank}</td><td>${values.name}</td><td>${values.score}</td><td>`
			const date = new Date(values.date);
			const options = {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
			};
			exports += new Intl.DateTimeFormat('ja-JP', options).format(date);
		});
		document.getElementById('leaderboard_sortableTable_body').innerHTML = exports;
	}
}

window.addEventListener('load', function () {
	displayLeaderboard();

	document.querySelectorAll('.leaderboard_sortableTable_head-sortable').forEach(elm => {
		elm.onclick = function () {
			const columnNum = this.cellIndex;
			const thead = document.querySelectorAll('.leaderboard_sortableTable_head th')[columnNum];

			if (columnNum === 3) {
				// 日付ソート
				if (thead.classList.contains('sort-desc')) {
					removeSortMarker();
					thead.classList.add('sort-asc');
					displayLeaderboard('date', false);
				} else {
					removeSortMarker();
					thead.classList.add('sort-desc');
					displayLeaderboard('date', true);
				}

			} else if (columnNum === 0 || columnNum === 2) {
				// 順位ソート
				displayLeaderboard('score');
				if (!thead.classList.contains('sort-desc')) {
					removeSortMarker();
					thead.classList.add('sort-desc');
				}
			}
		}
	})

	function removeSortMarker() {
		document.querySelectorAll('.leaderboard_sortableTable_head th').forEach(th => {
			th.classList.remove('sort-asc');
			th.classList.remove('sort-desc');
		})
	}
})

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
	},
	parent: 'gameWrap',
	dom: {
		createContainer: true,
	},
};

const game = new Phaser.Game(config);