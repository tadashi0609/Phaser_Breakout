export class BrickGroup extends Phaser.Physics.Arcade.StaticGroup {
    constructor(scene) {
        super(scene.physics.world, scene);

        this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
    }

    update() {

    }

    initBricks(layoutData) {
		let brickCount = 0;

		const brick = this.scene.add.image(100, 0, 'brick');
		
		const BRICKS_LAYOUT = {
			width: brick.width,
			height: brick.height,
			count: {
				row: 6,
				col: 9,
			},
			offset: {
				top: 70,
				left: 60,
			},
			padding: 5,
		};

		for (let r in layoutData.layout) {
			const lineColor = layoutData.color[layoutData.layout[r].color];

			for (let c in layoutData.layout[r].brick) {
				const hardness = layoutData.layout[r].brick[c];
				
				if (hardness !== 0) {
					const brickX = c * (BRICKS_LAYOUT.width + BRICKS_LAYOUT.padding) + BRICKS_LAYOUT.offset.left;
					const brickY = r * (BRICKS_LAYOUT.height + BRICKS_LAYOUT.padding) + BRICKS_LAYOUT.offset.top;

					const newBrick = new Brick(this.scene, brickX, brickY, hardness);
					newBrick.body.setImmovable(true);

					if (hardness > 0) {
						newBrick.setTintFill(lineColor);
					} else if (hardness === -1) {
						newBrick.setTintFill(0x404040);
						newBrick.setActive(false);
					}

					this.add(newBrick);
					brickCount++;
				}
			}
		}

		brick.destroy()
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