export default class Player {
    private player: number;
    private playerType: 'bot' | 'player' | 'none';
    private playerVel: number;
    private playerVeldx: number;
    private playersGeometry: { width: number; height: number };

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private control: 'arrows' | 'ws' | 'none';

    private upKeyPressed: boolean;
    private downKeyPressed: boolean;

    private collision_deviation: number;

    constructor(
        playerType: 'bot' | 'player' | 'none',
        playersGeometry: { width: number; height: number },
        control: 'arrows' | 'ws' | 'none',
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D,
        collision_deviation: number = 0.11,
        playerVel: number = 25
    ) {
        this.player = 0;
        this.playerType = playerType;
        this.playerVel = playerVel;
        this.playerVeldx = 0;
        this.playersGeometry = playersGeometry;

        this.collision_deviation = collision_deviation;

        this.canvas = canvas;
        this.ctx = ctx;

        this.control = control;

        this.upKeyPressed = false;
        this.downKeyPressed = false;

        if (this.control === 'arrows') {
            addEventListener('keydown', (e) => {
                if (e.code === 'ArrowUp') {
                    this.upKeyPressed = true;
                }
                if (e.code === 'ArrowDown') {
                    this.downKeyPressed = true;
                }
            });

            addEventListener('keyup', (e) => {
                if (e.code === 'ArrowUp') {
                    this.upKeyPressed = false;
                }
                if (e.code === 'ArrowDown') {
                    this.downKeyPressed = false;
                }
            });
        }
        if (this.control === 'ws') {
            addEventListener('keydown', (e) => {
                if (e.code === 'KeyW') {
                    this.upKeyPressed = true;
                }
                if (e.code === 'KeyS') {
                    this.downKeyPressed = true;
                }
            });

            addEventListener('keyup', (e) => {
                if (e.code === 'KeyW') {
                    this.upKeyPressed = false;
                }
                if (e.code === 'KeyS') {
                    this.downKeyPressed = false;
                }
            });
        }
    }

    get getPlayer() {
        return this.player;
    }

    get getPlayerGeometry() {
        return this.playersGeometry;
    }

    get getPlayerVeldx() {
        return this.playerVeldx;
    }

    get getPlayerType() {
        return this.playerType;
    }

    set playerPosition(playerPosition: number) {
        this.player = playerPosition;
    }

    drawPlayer(position: 'left' | 'right', ratio_x: number, ratio_y: number) {
        if (position === 'right') {
            this.ctx.fillRect(
                this.canvas.width / 2 - this.playersGeometry.width * ratio_x,
                this.player -
                    (this.playersGeometry.height * ratio_y) / 2 +
                    this.collision_deviation *
                        (this.playersGeometry.height * ratio_y),
                this.playersGeometry.width * ratio_x,
                this.playersGeometry.height * ratio_y -
                    this.collision_deviation *
                        2 *
                        (this.playersGeometry.height * ratio_y)
            );
        } else {
            this.ctx.fillRect(
                -this.canvas.width / 2,
                this.player -
                    (this.playersGeometry.height * ratio_y) / 2 +
                    this.collision_deviation *
                        (this.playersGeometry.height * ratio_y),
                this.playersGeometry.width * ratio_x,
                this.playersGeometry.height * ratio_y -
                    this.collision_deviation *
                        2 *
                        (this.playersGeometry.height * ratio_y)
            );
        }
    }

    playerControl(ratio_y: number) {
        let old = this.player;
        if (
            this.upKeyPressed &&
            this.player - (this.playersGeometry.height / 2) * ratio_y >=
                -this.canvas.height / 2 -
                    this.collision_deviation *
                        (this.playersGeometry.height * ratio_y)
        ) {
            this.player -= this.playerVel;
        }

        if (
            this.downKeyPressed &&
            this.player + (this.playersGeometry.height / 2) * ratio_y <=
                this.canvas.height / 2 +
                    this.collision_deviation *
                        (this.playersGeometry.height * ratio_y)
        ) {
            this.player += this.playerVel;
        }
        this.playerVeldx = Math.abs(this.player - old);
    }

    botControl(
        ball: { x: number; y: number; vx: number; vy: number },
        ratio_y: number
    ) {
        let old = this.player;
        if (
            ball.y <= this.player &&
            this.player - (this.playersGeometry.height / 2) * ratio_y >=
                -this.canvas.height / 2 -
                    this.collision_deviation *
                        (this.playersGeometry.height * ratio_y)
        ) {
            this.player -= this.playerVel;
        }
        if (
            ball.y >= this.player &&
            this.player + (this.playersGeometry.height / 2) * ratio_y <=
                this.canvas.height / 2 +
                    this.collision_deviation *
                        (this.playersGeometry.height * ratio_y)
        ) {
            this.player += this.playerVel;
        }
        this.playerVeldx = Math.abs(this.player - old);
    }

    playerDelete() {
        if (this.control === 'arrows') {
            removeEventListener('keydown', (e) => {
                if (e.code === 'ArrowUp') {
                    this.upKeyPressed = true;
                }
                if (e.code === 'ArrowDown') {
                    this.downKeyPressed = true;
                }
            });

            removeEventListener('keyup', (e) => {
                if (e.code === 'ArrowUp') {
                    this.upKeyPressed = false;
                }
                if (e.code === 'ArrowDown') {
                    this.downKeyPressed = false;
                }
            });
        }
        if (this.control === 'ws') {
            removeEventListener('keydown', (e) => {
                if (e.code === 'KeyW') {
                    this.upKeyPressed = true;
                }
                if (e.code === 'KeyS') {
                    this.downKeyPressed = true;
                }
            });

            removeEventListener('keyup', (e) => {
                if (e.code === 'KeyW') {
                    this.upKeyPressed = false;
                }
                if (e.code === 'KeyS') {
                    this.downKeyPressed = false;
                }
            });
        }
    }
}
