import { Socket } from 'socket.io-client';
import Ball from './Ball';
import Player from './Player';

export default class PingPong {
    private animation: number;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private ball: Ball;

    private player1: Player;
    private player2: Player;

    private playersGeometry: { width: number; height: number };

    private score: { player1: number; player2: number };
    private setClientScore: React.Dispatch<
        React.SetStateAction<{
            player1: number;
            player2: number;
        }>
    >;

    private gamemode: '2players' | '1player_with_bot' | '2players_1computer';
    private positionSocketPLayer: 'left' | 'right';
    private socket: Socket | null;
    private serverId: string;

    private gameStarted: boolean;
    private setClientGameStarted: React.Dispatch<React.SetStateAction<boolean>>;

    constructor(
        canvas: HTMLCanvasElement,
        setScore: React.Dispatch<
            React.SetStateAction<{
                player1: number;
                player2: number;
            }>
        >,
        setGameStarted: React.Dispatch<React.SetStateAction<boolean>>,
        gamemode: '2players' | '1player_with_bot' | '2players_1computer',
        position: 'left' | 'right' = 'right',
        socket: Socket | null = null,
        serverId: string = ''
    ) {
        this.animation = 0;
        if (!canvas) throw new Error('Canvas is not defined');
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        if (!this.ctx) throw new Error('Context is not defined');
        this.ball = new Ball(this.canvas, this.ctx);
        this.playersGeometry = { width: 6, height: 150 };

        this.gamemode = gamemode;
        this.positionSocketPLayer = position;
        this.socket = socket;
        this.serverId = serverId;

        this.gameStarted = true;
        this.setClientGameStarted = setGameStarted;

        if (this.gamemode === '1player_with_bot') {
            this.player1 = new Player(
                'bot',
                this.playersGeometry,
                'none',
                this.canvas,
                this.ctx
            );
            this.player2 = new Player(
                'player',
                this.playersGeometry,
                'arrows',
                this.canvas,
                this.ctx
            );
        } else if (this.gamemode === '2players_1computer') {
            this.player1 = new Player(
                'player',
                this.playersGeometry,
                'ws',
                this.canvas,
                this.ctx
            );
            this.player2 = new Player(
                'player',
                this.playersGeometry,
                'arrows',
                this.canvas,
                this.ctx
            );
        } else {
            this.player1 = new Player(
                'player',
                this.playersGeometry,
                position === 'left' ? 'arrows' : 'none',
                this.canvas,
                this.ctx
            );
            this.player2 = new Player(
                'player',
                this.playersGeometry,
                position === 'right' ? 'arrows' : 'none',
                this.canvas,
                this.ctx
            );
        }

        this.score = { player1: 0, player2: 0 };
        this.setClientScore = setScore;

        this.canvas.width = 2560;
        this.canvas.height = 1440;

        this.ctx.transform(
            1,
            0,
            0,
            1,
            this.canvas.width / 2,
            this.canvas.height / 2
        );
    }

    set ballPosition(position: { x: number; y: number }) {
        this.ball.position = position;
    }

    get getScore() {
        return this.score;
    }

    get getGameStarted() {
        return this.gameStarted;
    }

    display() {
        const RATIO_X = this.canvas.width / this.canvas.clientWidth;
        const RATIO_Y = this.canvas.height / this.canvas.clientHeight;

        if (this.player1.getPlayerType === 'player') {
            this.player1.playerControl(RATIO_Y);
        } else if (this.player1.getPlayerType === 'bot') {
            this.player1.botControl(this.ball.getBall, RATIO_Y);
        }

        if (this.player2.getPlayerType === 'player') {
            this.player2.playerControl(RATIO_Y);
        } else if (this.player2.getPlayerType === 'bot') {
            this.player2.botControl(this.ball.getBall, RATIO_Y);
        }

        if (this.gamemode === '2players' && this.socket) {
            if (
                this.positionSocketPLayer === 'left' &&
                this.player1.getPlayerVeldx !== 0
            ) {
                this.socket.emit('player_position', {
                    position: this.player1.getPlayer,
                    serverId: this.serverId,
                });
            } else if (
                this.positionSocketPLayer === 'right' &&
                this.player2.getPlayerVeldx !== 0
            ) {
                this.socket.emit('player_position', {
                    position: this.player2.getPlayer,
                    serverId: this.serverId,
                });
            }
        }

        if (
            this.positionSocketPLayer === 'left' &&
            this.gamemode === '2players' &&
            this.socket
        ) {
            this.ball.ballControl(
                RATIO_X,
                RATIO_Y,
                this.playersGeometry,
                this.player1,
                this.player2,
                (winner) => {
                    if (winner === 'left') {
                        this.score.player2 += 1;
                        this.setClientScore((prev) => ({
                            ...prev,
                            player2: prev.player2 + 1,
                        }));
                    } else {
                        this.score.player1 += 1;
                        this.setClientScore((prev) => ({
                            ...prev,
                            player1: prev.player1 + 1,
                        }));
                    }
                }
            );

            this.socket.emit('ball_position', {
                position: {
                    x: this.ball.getBall.x,
                    y: this.ball.getBall.y,
                },
                score: {
                    player1: this.score.player1 ? this.score.player1 : 0,
                    player2: this.score.player2 ? this.score.player2 : 0,
                },
                serverId: this.serverId,
            });
        }

        if (this.gamemode !== '2players') {
            this.ball.ballControl(
                RATIO_X,
                RATIO_Y,
                this.playersGeometry,
                this.player1,
                this.player2,
                (winner) => {
                    if (winner === 'left') {
                        this.score.player2 += 1;
                        this.setClientScore((prev) => ({
                            ...prev,
                            player2: prev.player2 + 1,
                        }));
                    } else {
                        this.score.player1 += 1;
                        this.setClientScore((prev) => ({
                            ...prev,
                            player1: prev.player1 + 1,
                        }));
                    }
                }
            );
        }

        this.ctx.clearRect(
            -this.canvas.width / 2,
            -this.canvas.height / 2,
            this.canvas.width,
            this.canvas.height
        );

        this.ball.drawBall(RATIO_X, RATIO_Y);
        this.player1.drawPlayer('left', RATIO_X, RATIO_Y);
        this.player2.drawPlayer('right', RATIO_X, RATIO_Y);

        this.ctx.fillRect(
            -1 * RATIO_X,
            -this.canvas.height / 2,
            2 * RATIO_X,
            this.canvas.height
        );

        if (this.gameStarted)
            this.animation = requestAnimationFrame(() => this.display());
    }

    private restart() {
        this.ball.position = { x: 0, y: 0 };
        this.player1.playerPosition = 0;
        this.player2.playerPosition = 0;
        this.score = { player1: 0, player2: 0 };
    }

    async start() {
        this.ctx.fillStyle = 'white';

        window.addEventListener('resize', () => {
            if (!this.gameStarted) {
                this.restart();
                this.display();
            }
        });

        if (this.gamemode === '2players' && this.socket) {
            this.gameStarted = false;
            this.setClientGameStarted(false);
            this.display();

            this.socket.emit('players_count', this.serverId);

            this.socket.on('players_count', (playerCount) => {
                if (playerCount != 2) {
                    this.restart();
                    this.gameStarted = false;
                    this.setClientGameStarted(false);
                } else {
                    if (!this.gameStarted) {
                        this.restart();

                        this.gameStarted = true;
                        this.setClientGameStarted(true);

                        this.display();
                    }
                }
            });

            if (this.positionSocketPLayer === 'right') {
                this.socket.on(
                    'ball_position',
                    (ballPos: {
                        x: number;
                        y: number;
                        score: { player1: number; player2: number };
                    }) => {
                        this.ballPosition = { x: ballPos.x, y: ballPos.y };
                        this.score = ballPos.score;
                        this.setClientScore(this.score);
                    }
                );
            }

            this.socket.on('player_position', (position) => {
                if (this.positionSocketPLayer === 'left') {
                    this.player2.playerPosition = position;
                }
                if (this.positionSocketPLayer === 'right') {
                    this.player1.playerPosition = position;
                }
            });
        }

        if (this.gamemode !== '2players') {
            this.display();
        }
    }

    stop() {
        if (this.gamemode === '2players' && this.socket) {
            this.gameStarted = false;

            this.socket.emit('remove_player');
            this.socket.removeAllListeners();
        }

        window.removeEventListener('resize', () => {
            if (!this.gameStarted) {
                this.restart();
                this.display();
            }
        });

        this.player1.playerDelete();
        this.player2.playerDelete();
        cancelAnimationFrame(this.animation);
    }
}
