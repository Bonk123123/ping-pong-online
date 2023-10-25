import React from 'react';
import CanvasPP from '../../components/CanvasPP/CanvasPP';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCookie } from '../../utils/getCookie';

const GamePage = () => {
    const { gamemode, serverId, position } = useLocation().state;

    const navigate = useNavigate();

    React.useEffect(() => {
        const name = JSON.parse(JSON.stringify(getCookie('name')));
        if (!name) navigate('/');
    }, []);

    return (
        <CanvasPP serverId={serverId} gamemode={gamemode} position={position} />
    );
};

export default GamePage;
