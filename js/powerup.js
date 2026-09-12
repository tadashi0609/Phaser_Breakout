export class Powerup extends Phaser.Physics.Arcade.Sprite {
	type = 0;
	parentGroup;

	constructor(scene, x, y, frame, group) {
		super(scene, x, y, 'powerup', frame);
		
		this.type = frame;
		this.parentGroup = group;

		this.scene.physics.add.existing(this);
		this.scene.add.existing(this);
		
		this.setActive(false);
		this.setVisible(false);
	}

	update() {
		const outOfBounds = !Phaser.Geom.Rectangle.Overlaps(
			this.scene.physics.world.bounds,
			this.getBounds()
		);

		if (outOfBounds && this.active) {
			this.parentGroup.remove(this);
		}
	}

	startFall(x, y) {
		if (x !== undefined) { this.x = x; }
		if (y !== undefined) { this.y = y; }
		this.setActive(true);
		this.setVisible(true);
		this.body.setVelocityY(150);
	}
	
}