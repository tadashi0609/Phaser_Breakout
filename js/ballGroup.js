import {Ball} from './ball.js';

export class BallGroup extends Phaser.Physics.Arcade.Group {
    MAX_BALL_COUNT = 256;

    constructor(scene) {
        super(scene.physics.world, scene, {
            collideWorldBounds: true,
            bounceX: 1,
            bounceY: 1,
        });

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.runChildUpdate = true;

        this.createMultiple({
            classType: Ball,
            frameQuantity: this.MAX_BALL_COUNT,
            active: false,
            visible: false,
            setXY: {
                x : this.scene.scale.width / 2,
			    y : this.scene.scale.height - 25,
            },
            key: 'ball'
        });

    }

    update() {

    }

    initBall(paddle) {
        this.children.iterate(ball => ball.resetBall());

        const newBall = this.getFirst();
        newBall.setActive(true);
        newBall.setVisible(true);
        newBall.x = this.scene.scale.width / 2;
        newBall.y = paddle.y - paddle.height - newBall.height / 2;

        return newBall;
    }

    increaseBall() {
        if (this.getMatching('active', true).length * 2 < this.MAX_BALL_COUNT) {
            for (const ball of this.getMatching('active', true)) {
                let newBall = this.getFirstDead(false, ball.x, ball.y);

                newBall.setActive(true);
                newBall.setVisible(true);
                newBall.body.setVelocity(ball.body.velocity.x - 10, ball.body.velocity.y);
            }            
        }

    }

}
