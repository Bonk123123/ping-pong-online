import React from 'react';
import Modal from '../../components/Modal/Modal';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../../utils/getCookie';
import { socket } from '../../socket';
import Loading from '../../components/Loading/Loading';

interface IServer {
    id: string;
    name: string;
    playerCount: number;
}

const ServersPage = () => {
    const navigate = useNavigate();

    const [createModal, setCreateModal] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [serverName, setServerName] = React.useState('');
    const [serverId, setServerId] = React.useState('');
    const [position, setPosition] = React.useState<'left' | 'right'>();

    const [servers, setServers] = React.useState<IServer[]>([]);

    const handleCreateServer = () => {
        setCreateModal(false);

        setIsLoading(true);

        socket.emit('new_server', serverName);
        socket.on('new_server', (serverInfo) => {
            setServerId(serverInfo.serverId);
            setPosition(serverInfo.playerPosition);
        });
        setIsLoading(false);
    };

    const handleJoinServer = (id: string) => {
        socket.emit('join_server', id);
        socket.on('join_server', (serverInfo) => {
            setServerId(serverInfo.serverId);
            setPosition(serverInfo.playerPosition);
        });
    };

    const fetchServers = () => {
        setIsLoading(true);
        fetch('http://localhost:5001/servers')
            .then((response) => response.json())
            .then((json) => setServers(json));
        setIsLoading(false);
    };

    React.useEffect(() => {
        if (serverId !== '') {
            navigate(`${serverId}`, {
                state: { serverId, gamemode: '2players', position },
            });
        }
    }, [serverId]);

    React.useEffect(() => {
        const name = JSON.parse(JSON.stringify(getCookie('name')));
        if (!name) navigate('/');

        fetchServers();
    }, []);

    return (
        <div className="w-[100vw] h-[100vh] bg-black text-white font-pixel">
            <div className="flex justify-center items-center flex-col h-[100vh] gap-10">
                <p className="text-8xl mb-16">Servers</p>

                <div className="w-1/2 flex justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="text-xl border-white border-4 hover:bg-white hover:text-black p-1"
                    >
                        {'<'}
                    </button>
                    <button
                        onClick={fetchServers}
                        className="text-xl border-white border-4 hover:bg-white hover:text-black p-1"
                    >
                        refresh
                    </button>
                </div>

                <div className="w-1/2 border-white border-4 h-[30vh] overflow-y-auto">
                    {isLoading ? (
                        <Loading />
                    ) : (
                        servers?.map((item, i) => (
                            <button
                                onClick={() => handleJoinServer(item.id)}
                                className={`text-xl border-white ${
                                    i === servers.length - 1
                                        ? 'border-2 border-t-[1px]'
                                        : 'border-[1px]'
                                } hover:bg-white hover:text-black w-full p-1 flex justify-between`}
                            >
                                <p>{item.name}</p>
                                <p>{item.playerCount}/2</p>
                            </button>
                        ))
                    )}
                </div>

                <button
                    onClick={() => setCreateModal(true)}
                    className="w-1/2 text-xl border-white border-4 hover:bg-white hover:text-black p-1"
                >
                    Create new Server
                </button>

                <Modal
                    isOpen={createModal}
                    outerClickFunction={() => setCreateModal(false)}
                >
                    <div className="flex flex-col justify-center items-center gap-6">
                        <p className="text-2xl text-center">Server Name</p>
                        <input
                            value={serverName}
                            onChange={(e) => setServerName(e.target.value)}
                            className="bg-black border-2 text-2xl text-center outline-none p-1 border-white"
                            type="text"
                        />
                        {isLoading && <Loading />}

                        <button
                            onClick={handleCreateServer}
                            className="text-xl border-white border-2 hover:bg-white hover:text-black w-1/2 p-1"
                        >
                            create
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default ServersPage;
