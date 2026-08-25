export class BrickGroup extends Phaser.Physics.Arcade.StaticGroup {

    constructor(scene) {
        super(scene.physics.world, scene);
        // this.scene.events.on('update', this.update, this);

        this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
    }

    update() {

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

		for (let c = 0; c < bricksLayout.count.col; c++) {
			for (let r = 0; r < bricksLayout.count.row; r++) {
				const brickX = c * (bricksLayout.width + bricksLayout.padding) + bricksLayout.offset.left;
				const brickY = r * (bricksLayout.height + bricksLayout.padding) + bricksLayout.offset.top;

				const newBrick = this.scene.physics.add.sprite(brickX, brickY, 'brick');
                this.scene.add.existing(newBrick);
                this.scene.physics.add.existing(newBrick);
				newBrick.body.setImmovable(true);
				this.add(newBrick);
			}
		}
    }

}

class Brick extends Phaser.Physics.Arcade.Sprite {
    scene;

    constructor(scene, x, y) {
        super(scene, x, y, 'brick');
    }
}