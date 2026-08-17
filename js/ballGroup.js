import {Ball} from './ball.js';

export class BallGroup extends Phaser.GameObjects.Group {
    constructor(scene) {
        super(scene);
        this.scene.events.on('update', this.update, this);

        this.scene.add.existing(this);
        this.runChildUpdate = true;
    }

    update() {

    }

    initBall() {
        this.clear(true, true);

        const newBall = new Ball(
            this.scene,
            this.scene.scale.width / 2,
			this.scene.scale.height - 25,
        );

        this.add(newBall);
        return newBall;
    }

    increaseBall(x, y, velocityX, velocityY) {

    }

}
