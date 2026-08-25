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
            this.removeBall();
        }
    }

    removeBall() {
        this.destroy(true);
    }

    hitPaddle(paddle) {
        this.body.velocity.x = -5 * (paddle.x - this.x);        
    }
}