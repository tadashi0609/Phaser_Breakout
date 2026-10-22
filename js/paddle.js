export class Paddle extends Phaser.Physics.Arcade.Sprite {
    powerupTimeline;
    flashTween;

    constructor(scene, x, y) {
        super(scene, x, y, 'paddle');

		this.scene.physics.add.existing(this);
		this.scene.add.existing(this);

		this.setOrigin(0.5, 1);
		this.setImmovable(true);

		this.flashTween = this.scene.tweens.add({
			targets: this,
			repeat: -1,
			yoyo: true,
			alpha: 0,
			duration: 500,
			paused: true,
			ease: Phaser.Tweens.Builders.GetEaseFunction('cubic.in'),
			onPause: () => { this.alpha = 1; }
		});

		this.powerupTimeline = this.scene.add.timeline([
		{
			at: 0,
			run: () => {
				if (!this.flashTween.isPaused()) {
					this.flashTween.pause();
					this.flashTween.seek(0);
				}
			}
		},
		{
			at: 7000,
			run: () => { this.flashTween.resume(); }
		},
		{
			at: 10000,
			run: () => {
				this.scaleX = 1;
				this.flashTween.pause();
			}
		}
		]);

    }

    fixPosition() {
		if (this.x - this.body.width / 2 < 0) {
			this.x = this.body.width / 2;
		} else if (this.x + this.body.width / 2 > this.scene.scale.width) {
			this.x = this.scene.scale.width - this.body.width / 2;
		}

    }

	powerup() {
		this.scaleX = 2;
		this.powerupTimeline.play(true);
	}

	initScale() {
		this.scaleX = 1;
		this.powerupTimeline.reset();
		this.powerupTimeline.stop();

		if (!this.flashTween.isPaused()) {
			this.flashTween.pause();
		}
	}
}