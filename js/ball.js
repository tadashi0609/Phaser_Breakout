export class Ball extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'ball');
        this.scene = scene;
        // scene.events.on('update', this.update, this);

        this.scene.physics.add.existing(this);
        this.scene.add.existing(this);
        this.body.setCollideWorldBounds(true, 1, 1);
        this.body.setBounce(1);

    }

    create() {
        
    }

    update() {
		const ballIsOutOfBounds = !Phaser.Geom.Rectangle.Overlaps(
			this.scene.physics.world.bounds,
			this.getBounds()
		);

        if (ballIsOutOfBounds) {
            this.removeBall();
        }
    }

    removeBall() {
        // this.scene.events.off('update', this.update)
        this.destroy(true);
    }

    hitPaddle(paddle) {
        this.body.velocity.x = -5 * (paddle.x - this.x);        
    }
}