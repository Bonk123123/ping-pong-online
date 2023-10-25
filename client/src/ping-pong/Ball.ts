import Player from './Player';

export default class Ball {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private ball: { x: number; y: number; vx: number; vy: number };
    private ballRadius: number;
    private battingCoefficient: number;
    private accelerationCoefficient: number;
    private maxVelocity: number;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.ball = { x: 0, y: 0, vx: 4, vy: 3 };
        this.ballRadius = 10;
        this.battingCoefficient = 0.11;
        this.accelerationCoefficient = 1.001;
        this.maxVelocity = 14;
    }

    get getBall() {
        return this.ball;
    }

    set position(position: { x: number; y: number }) {
        this.ball.x = position.x;
        this.ball.y = position.y;
    }

    drawBall(ratio_x: number, ratio_y: number) {
        this.ctx.beginPath();
        this.ctx.ellipse(
            this.ball.x - this.ballRadius / 2,
            this.ball.y - this.ballRadius / 2,
            this.ballRadius * ratio_x,
            this.ballRadius * ratio_y,
            0,
            0,
            Math.PI * 2
        );

        this.ctx.fill();
        this.ctx.closePath();
    }

    ballControl(
        ratio_x: number,
        ratio_y: number,
        playersGeometry: { width: number; height: number },
        player1: Player,
        player2: Player,
        onLose: (winner: 'left' | 'right') => void = () => {}
    ) {
        const ballX_withRatio = this.ballRadius * ratio_x;
        const ballY_withRatio = this.ballRadius * ratio_y;

        if (
            this.ball.y + ballY_withRatio >= this.canvas.height / 2 ||
            this.ball.y - ballY_withRatio <= -this.canvas.height / 2
        ) {
            this.ball.vy = -this.ball.vy;
        }
        if (
            this.ball.x + ballX_withRatio >=
                this.canvas.width / 2 + ballX_withRatio ||
            this.ball.x - ballX_withRatio <=
                -this.canvas.width / 2 - ballX_withRatio
        ) {
            onLose(
                this.ball.x + ballX_withRatio >= this.canvas.width / 2
                    ? 'right'
                    : 'left'
            );
            this.ball = { x: 0, y: 0, vx: 4, vy: 4 };
        }

        if (
            this.ball.x - ballX_withRatio <=
                playersGeometry.width * ratio_x - this.canvas.width / 2 &&
            this.ball.y + ballY_withRatio <=
                player1.getPlayer + (playersGeometry.height / 2) * ratio_y &&
            this.ball.y - ballY_withRatio >=
                player1.getPlayer - (playersGeometry.height / 2) * ratio_y
        ) {
            if (player1.getPlayerVeldx === 0) {
                this.ball.vx = -this.ball.vx;
            } else if (player1.getPlayerVeldx > 0) {
                this.ball.vx =
                    -this.ball.vx +
                    player1.getPlayerVeldx * this.battingCoefficient;
                this.ball.vy -=
                    player1.getPlayerVeldx * this.battingCoefficient;
            } else {
                this.ball.vx =
                    -this.ball.vx -
                    player1.getPlayerVeldx * this.battingCoefficient;
                this.ball.vy +=
                    player1.getPlayerVeldx * this.battingCoefficient;
            }
        }

        if (
            this.ball.x + ballX_withRatio >=
                -playersGeometry.width * ratio_x + this.canvas.width / 2 &&
            this.ball.y + ballY_withRatio <=
                player2.getPlayer + (playersGeometry.height / 2) * ratio_y &&
            this.ball.y - ballY_withRatio >=
                player2.getPlayer - (playersGeometry.height / 2) * ratio_y
        ) {
            if (player2.getPlayerVeldx === 0) {
                this.ball.vx = -this.ball.vx;
            } else if (player2.getPlayerVeldx > 0) {
                this.ball.vx =
                    -this.ball.vx +
                    player2.getPlayerVeldx * this.battingCoefficient;
                this.ball.vy -=
                    player2.getPlayerVeldx * this.battingCoefficient;
            } else {
                this.ball.vx =
                    -this.ball.vx -
                    player2.getPlayerVeldx * this.battingCoefficient;
                this.ball.vy +=
                    player2.getPlayerVeldx * this.battingCoefficient;
            }
        }

        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        if (
            this.ball.vx < this.maxVelocity &&
            this.ball.vy < this.maxVelocity
        ) {
            this.ball.vx *= this.accelerationCoefficient;
            this.ball.vy *= this.accelerationCoefficient;
        }
    }
}
