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
				row: 6,
				col: 9,
			},
			offset: {
				top: 50,
				left: 60,
			},
			padding: 10,
		};

		for (let r in layoutData.layout) {
			for (let c in layoutData.layout[r].brick) {
				const hardness = layoutData.layout[r].brick[c];
				
				if (hardness !== 0) {
					const brickX = c * (bricksLayout.width + bricksLayout.padding) + bricksLayout.offset.left;
					const brickY = r * (bricksLayout.height + bricksLayout.padding) + bricksLayout.offset.top;

					const newBrick = new Brick(this.scene, brickX, brickY, hardness);
					newBrick.body.setImmovable(true);

					if (hardness > 0) {
						newBrick.setTintFill(layoutData.layout[r].color);					
					} else if (hardness === -1) {
						newBrick.setTintFill(0x444444);
					}

					this.add(newBrick);
					brickCount++;
				}
			}
		}

		return brickCount;
    }

}

class Brick extends Phaser.Physics.Arcade.Sprite {
	hardness;

    constructor(scene, x, y, hardness) {
        super(scene, x, y, 'brick');

		this.scene.physics.add.existing(this);
		this.scene.add.existing(this);

		this.hardness = hardness;
    }

	hitBall() {
		if (this.hardness > 0) {
			this.hardness--;
		}
		if (this.hardness === 0) {
			this.disableBody(true, true);
			return true;
		}
		return false;
	}
}