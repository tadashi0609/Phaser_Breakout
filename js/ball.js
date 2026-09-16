export class Ball extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'ball');

        this.scene.physics.add.existing(this);
        this.scene.add.existing(this);
        this.body.setCollideWorldBounds(true, 1, 1);
        this.body.setBounce(1);
    }

    update() {
		const ballIsOutOfBounds = !Phaser.Geom.Rectangle.Overlaps(
			this.scene.physics.world.bounds,
			this.getBounds()
		);

        if (ballIsOutOfBounds && this.active) {
            this.resetBall();
        }
    }

    resetBall() {
        this.x = 0;
        this.y = 0;
        this.setActive(false);
        this.setVisible(false);
        this.body.setVelocity(0, 0);
    }

    hitPaddle(paddle) {
        this.body.setVelocity(0, -200);
        this.body.velocity.rotate((this.x - paddle.x) / (paddle.body.width + this.width) * Math.PI / 6 * 5);
    }
}