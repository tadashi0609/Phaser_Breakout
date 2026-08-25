import {Ball} from './ball.js';

export class BallGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene, {
            collideWorldBounds: true,
            bounceX: 1,
            bounceY: 1,
        });

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.runChildUpdate = true;

        this.initBall();
    }

    update() {

    }

    initBall() {
        this.clear(true, true);

        const newBallArray = this.createMultiple({
            classType: Ball,
            frameQuatity: 1,
            active: true,
            visible: true,
            setXY: {
                x : this.scene.scale.width / 2,
			    y : this.scene.scale.height - 25,
            },
            key: 'ball'
        });

        return newBallArray[0];
    }

    increaseBall(x, y, velocityX, velocityY) {

    }

}
