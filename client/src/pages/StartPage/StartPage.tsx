import React from 'react';
import Modal from '../../components/Modal/Modal';
import { getCookie } from '../../utils/getCookie';
import { Link } from 'react-router-dom';

const StartPage = () => {
    const [modal, setModal] = React.useState(false);
    const [name, setName] = React.useState('');

    React.useEffect(() => {
        const name = JSON.parse(JSON.stringify(getCookie('name')));
        if (!name) setModal(true);
    }, []);

    const handleSetName = () => {
        setModal(false);
        document.cookie = 'name=' + name;
    };

    return (
        <div className="w-[100vw] h-[100vh] bg-black text-white font-pixel">
            <Modal isOpen={modal}>
                <div className="flex flex-col justify-center items-center gap-6">
                    <p className="text-2xl text-center">Your Name?</p>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-black border-2 text-2xl text-center outline-none p-1 border-white"
                        type="text"
                    />
                    <button
                        onClick={handleSetName}
                        className="text-xl border-white border-2 hover:bg-white hover:text-black w-1/2 p-1"
                    >
                        start
                    </button>
                </div>
            </Modal>

            <div className="flex justify-center items-center flex-col h-[100vh] gap-10">
                <p className="text-8xl mb-16">Ping-Pong</p>

                <Link
                    to={'servers/1player_with_bot'}
                    state={{ serverId: '', gamemode: '1player_with_bot' }}
                    className="text-xl border-white border-2 hover:bg-white hover:text-black w-1/4 p-1"
                >
                    Play vs bot
                </Link>
                <Link
                    to={'servers/2players_1computer'}
                    state={{ serverId: '', gamemode: '2players_1computer' }}
                    className="text-xl border-white border-2 hover:bg-white hover:text-black w-1/4 p-1"
                >
                    Play vs Player on 1 computer
                </Link>
                <Link
                    to={'servers'}
                    className="text-xl border-white border-2 hover:bg-white hover:text-black w-1/4 p-1"
                >
                    Play vs Player
                </Link>
            </div>
        </div>
    );
};

export default StartPage;
