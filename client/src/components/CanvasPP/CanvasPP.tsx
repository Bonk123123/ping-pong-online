import React, { FC } from 'react';
import PingPong from '../../ping-pong/PingPong';
import { socket } from '../../socket';
import { useLocation } from 'react-router-dom';

interface props {
    serverId: string;
    gamemode: '2players' | '1player_with_bot' | '2players_1computer';
    position: 'left' | 'right';
}

let pp: PingPong;

const CanvasPP: FC<props> = React.memo(({ serverId, gamemode, position }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const location = useLocation();

    const [score, setScore] = React.useState({ player1: 0, player2: 0 });
    const [gameStarted, setGameStarted] = React.useState(true);

    React.useEffect(() => {
        if (canvasRef.current) {
            pp = new PingPong(
                canvasRef.current,
                setScore,
                setGameStarted,
                gamemode,
                position,
                socket,
                serverId
            );
            pp.start();
        }

        return () => {
            if (pp) pp.stop();
        };
    }, [location]);

    return (
        <div className="h-[100vh] w-[100vw] bg-black">
            <p className="text-4xl absolute left-1/2 -translate-x-36 top-1/3 -translate-y-1/2 text-white font-pixel">
                {!gameStarted && 'Waiting'}
            </p>
            <p className="text-4xl absolute left-1/2 translate-x-4 top-1/3 -translate-y-1/2 text-white font-pixel">
                {!gameStarted && 'Player'}
            </p>
            <p className="text-4xl absolute left-1/2 -translate-x-1/2 text-white font-pixel">
                {score.player1}&nbsp;&nbsp;&nbsp;&nbsp;
                {score.player2}
            </p>

            <canvas ref={canvasRef} className="h-full w-full"></canvas>
        </div>
    );
});

export default CanvasPP;
