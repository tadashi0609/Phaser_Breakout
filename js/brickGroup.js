export class BrickGroup extends Phaser.Physics.Arcade.StaticGroup {

    constructor(scene) {
        super(scene.physics.world, scene);
        // this.scene.events.on('update', this.update, this);

        this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
    }

    update() {

    }

    initBricks(layoutData) {
		let brickCount = 0;

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

		for (let r in layoutData.layout) {
			for (let c in layoutData.layout[r]) {
				if (layoutData.layout[r][c]){
					const brickX = c * (bricksLayout.width + bricksLayout.padding) + bricksLayout.offset.left;
					const brickY = r * (bricksLayout.height + bricksLayout.padding) + bricksLayout.offset.top;

					const newBrick = this.scene.physics.add.sprite(brickX, brickY, 'brick');
					this.scene.add.existing(newBrick);
					this.scene.physics.add.existing(newBrick);
					newBrick.body.setImmovable(true);
					this.add(newBrick);

					brickCount++;
				}
			}
		}

		return brickCount;
    }

}

class Brick extends Phaser.Physics.Arcade.Sprite {
    scene;

    constructor(scene, x, y) {
        super(scene, x, y, 'brick');
    }
}