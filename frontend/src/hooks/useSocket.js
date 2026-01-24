import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export const useSocket = (channelId, userId) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!userId) return;

        const socketInstance = io(SOCKET_URL, {
            query: { userId }
        });

        socketInstance.on('connect', () => {
            setIsConnected(true);
            console.log('Socket connected');
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
            console.log('Socket disconnected');
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [userId]);

    useEffect(() => {
        if (socket && channelId) {
            socket.emit('join_channel', channelId);
        }
    }, [socket, channelId]);

    return { socket, isConnected };
};
