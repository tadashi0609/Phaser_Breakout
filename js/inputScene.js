const INPUT_TYPES = {
	pointer: 0,
	keyboard: 1,
}

export class InputScene extends Phaser.Scene {
	pointer;
	isPointerMove;
	cursorKeys;

    inputType;

    mainScene;

    constructor() {
        super({ key: 'input' })
    }

    create() {
		this.input.on(
			'pointerup',
			() => {
				if (!this.isPointerMove) {
					this.mainScene.startGame();
				} else {
					this.isPointerMove = false;
				}
			},
			this,
		);
		this.input.on(
			'pointerdown',
			() => {
				this.isPointerMove = false;
				this.inputType = INPUT_TYPES.pointer;
			},
			this,
		)
		this.input.on(
			'pointermove',
			() => {
				this.isPointerMove = true;
				this.inputType = INPUT_TYPES.pointer;
			},
			this,
		)

		this.input.keyboard.on(
			'keydown',
			(event) => {
				this.inputType = INPUT_TYPES.keyboard;
			}
		)

		document.addEventListener('pointermove', (event) => {
			this.inputType = INPUT_TYPES.pointer;
			const canvas = document.getElementsByTagName('canvas')[0];
			this.pointer.x = (event.clientX - parseInt(canvas.style.marginLeft)) / parseInt(canvas.style.width) * this.scale.width;
		});

        this.cursorKeys = this.input.keyboard.createCursorKeys();

        this.mainScene = this.scene.get('main');
    }

    movePaddle(paddle) {
		this.pointer = this.input.activePointer;

		switch (this.inputType) {
			case INPUT_TYPES.pointer:
				if (this.isPointerMove) {
					paddle.x = this.pointer.x;
				}
				
				break;

			case INPUT_TYPES.keyboard:
				if (this.cursorKeys.left.isDown) {
					paddle.x -= 8;
				}
				if (this.cursorKeys.right.isDown) {
					paddle.x += 8;
				}
				if (this.cursorKeys.space.isDown && !this.mainScene.isPlaying) {
					this.mainScene.startGame();
				}

				break;
		
			default:
				break;
		}
    }
}