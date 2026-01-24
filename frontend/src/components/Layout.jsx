import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';

// New Components
import { NavigationRail } from '../components/layout/NavigationRail';
import { DMSidebar } from '../components/layout/DMSidebar';
import { ServerSidebar } from '../components/layout/ServerSidebar';
import { UserPanel } from '../components/layout/UserPanel';
import { ChatArea } from './ChatArea';

// Modals
import { CreateServerModal } from './CreateServerModal';
import { CreateChannelModal } from './CreateChannelModal';
import { JoinServerModal } from './JoinServerModal';
import { InviteModal } from './InviteModal';
import { ServerSettingsModal } from './ServerSettingsModal';
import { CreateDMModal } from './CreateDMModal';
import { UserSettingsModal } from './UserSettingsModal';

import { useSocket } from '../hooks/useSocket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const Layout = () => {
    const { user } = useUser();

    // Global State
    const [servers, setServers] = useState([]);
    const [selectedServer, setSelectedServer] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // State for Search Navigation
    const [targetMessageId, setTargetMessageId] = useState(null);
    const [themeColor, setThemeColor] = useState('#5865F2');
    // Channel State
    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);

    // DM State
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);

    // Socket Connection
    const { socket } = useSocket(selectedChannel?._id || selectedConversation?._id, user?.id);

    // Modal Control State
    const [modals, setModals] = useState({
        server: false,
        join: false,
        channel: false,
        invite: false,
        settings: false,
        dm: false,
        userSettings: false
    });

    // Helper to toggle modals
    const toggleModal = (key, value) => setModals(prev => ({ ...prev, [key]: value }));

    // Apply Theme Color
    useEffect(() => {
        if (themeColor) {
            document.documentElement.style.setProperty('--glass-primary', themeColor);
            // Optionally set secondary colors derived from primary
            // document.documentElement.style.setProperty('--glass-secondary', themeColor); 
        }
    }, [themeColor]);

    // --- DATA FETCHING ---

    // 1. Fetch Servers & Sync User
    useEffect(() => {
        if (!user) return;

        // Sync User to Backend & Get Theme Preference
        axios.post(`${API_URL}/api/users/sync`, {
            clerkId: user.id,
            username: user.username || user.firstName,
            email: user.primaryEmailAddress?.emailAddress,
            avatar: user.imageUrl
        }).then(res => {
            console.log('User Synced:', res.data);
            if (res.data.themeColor) {
                setThemeColor(res.data.themeColor);
            }
        }).catch(err => console.error('Failed to sync user:', err));

        axios.get(`${API_URL}/api/users/${user.id}/servers`)
            .then(res => {
                setServers(res.data);
                if (res.data.length > 0) setSelectedServer(res.data[0]);
            })
            .catch(err => console.error("Failed to fetch servers", err));
    }, [user]);

    // 2. Fetch Channels (when server changes)
    useEffect(() => {
        if (!selectedServer) {
            setChannels([]);
            setSelectedChannel(null);
            return;
        }

        axios.get(`${API_URL}/api/servers/${selectedServer._id}/channels`)
            .then(res => {
                setChannels(res.data);
                const defaultChannel = res.data.find(c => c.name === 'general') || res.data[0];
                setSelectedChannel(defaultChannel);
            })
            .catch(err => console.error("Failed to fetch channels", err));
    }, [selectedServer]);

    // 3. Fetch Conversations (when on Home)
    useEffect(() => {
        if (selectedServer) return;
        if (!user) return;
        axios.get(`${API_URL}/api/users/${user.id}/conversations`)
            .then(res => setConversations(res.data))
            .catch(err => console.error("Failed to fetch conversations", err));
    }, [selectedServer, user]);
    console.log(conversations)

    // 4. Listen for User Status Changes
    useEffect(() => {
        if (!socket) return;

        const handleStatusChange = ({ userId, isOnline, lastSeen }) => {
            // Update conversations state
            setConversations(prev => prev.map(conv => {
                const updatedParticipants = conv.participants.map(p => {
                    if (p._id === userId || p.clerkId === userId) {
                        return { ...p, isOnline, lastSeen };
                    }
                    return p;
                });
                return { ...conv, participants: updatedParticipants };
            }));
        };

        socket.on('user_status_change', handleStatusChange);

        return () => {
            socket.off('user_status_change', handleStatusChange);
        };
    }, [socket]);


    // --- ACTION HANDLERS ---

    const handleServerCreated = (newServer) => {
        setServers([...servers, newServer]);
        setSelectedServer(newServer);
    };

    const handleServerJoined = (server) => {
        if (!servers.find(s => s._id === server._id)) setServers([...servers, server]);
        setSelectedServer(server);
    };

    const handleDeleteServer = async () => {
        if (!selectedServer || !confirm(`Delete ${selectedServer.name}?`)) return;
        try {
            await axios.delete(`${API_URL}/api/servers/${selectedServer._id}`, { data: { userId: user.id } });
            setServers(servers.filter(s => s._id !== selectedServer._id));
            setSelectedServer(null);
        } catch (err) { alert(err.response?.data?.error || "Error"); }
    };

    const handleLeaveServer = async () => {
        if (!selectedServer || !confirm(`Leave ${selectedServer.name}?`)) return;
        try {
            await axios.post(`${API_URL}/api/servers/${selectedServer._id}/leave`, { userId: user.id });
            setServers(servers.filter(s => s._id !== selectedServer._id));
            setSelectedServer(null);
        } catch (err) { alert(err.response?.data?.error || "Error"); }
    };

    const handleDeleteChannel = async (id, name) => {
        if (!confirm(`Delete #${name}?`)) return;
        try {
            await axios.delete(`${API_URL}/api/channels/${id}`, { data: { userId: user.id } });
            setChannels(channels.filter(c => c._id !== id));
            if (selectedChannel?._id === id) setSelectedChannel(null);
        } catch (err) { alert("Error deleting channel", err); }
    };

    const handleStartDM = async (targetUserId) => {
        try {
            const res = await axios.post(`${API_URL}/api/conversations`, { user1Id: user.id, user2Id: targetUserId });
            setConversations(prev => {
                if (!prev.find(c => c._id === res.data._id)) return [res.data, ...prev];
                return prev;
            });
            setSelectedServer(null);
            setSelectedConversation(res.data);
        } catch (err) { console.error(err); }
    };

    const handleDeleteConversation = async (conversationId) => {
        if (!confirm("Are you sure you want to remove this conversation?")) return;
        try {
            // Optimistic update
            const prevConversations = [...conversations];
            console.log(prevConversations);
            setConversations(conversations.filter(c => c._id !== conversationId));
            if (selectedConversation?._id === conversationId) setSelectedConversation(null);

            await axios.delete(`${API_URL}/api/conversations/${conversationId}`, { data: { userId: user.id } });
        } catch (err) {
            console.error(err);
            alert("Failed to delete conversation");
            // Revert on failure (optional, but good practice)
            // setConversations(prevConversations); 
        }
    };

    const isOwner = selectedServer && user && selectedServer.owner === user.id;
    // console.log(user)
    return (
        <div className="flex h-screen w-screen overflow-hidden text-sm font-sans bg-black/30 backdrop-blur-sm text-gray-100">

            <div className={`
                fixed inset-0 z-50 flex
                md:static md:z-0
                transition-transform duration-300 ease-in-out
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* 1. Navigation Rail (Left) */}
                <NavigationRail
                    servers={servers}
                    selectedServer={selectedServer}
                    onSelectServer={(s) => {
                        setSelectedServer(s);
                        // Don't close menu yet, user needs to pick a channel
                    }}
                    onOpenCreateModal={() => toggleModal('server', true)}
                    onOpenJoinModal={() => toggleModal('join', true)}
                />

                {/* 2. Sidebar (Middle) */}
                <div className="flex flex-col h-full bg-black/90 md:bg-transparent  shadow-2xl md:shadow-none">
                    {selectedServer ? (
                        <ServerSidebar
                            server={selectedServer}
                            channels={channels}
                            selectedChannel={selectedChannel}
                            onSelectChannel={(channel) => {
                                setSelectedChannel(channel);
                                setTargetMessageId(null);
                                setMobileMenuOpen(false); // Close on selection
                            }}
                            user={user}
                            isOwner={isOwner}
                            onOpenInvite={() => toggleModal('invite', true)}
                            onOpenSettings={() => toggleModal('settings', true)}
                            onOpenCreateChannel={() => toggleModal('channel', true)}
                            onDeleteServer={handleDeleteServer}
                            onLeaveServer={handleLeaveServer}
                            onDeleteChannel={handleDeleteChannel}
                        />
                    ) : (
                        <DMSidebar
                            conversations={conversations}
                            selectedConversation={selectedConversation}
                            onSelect={(c) => {
                                setSelectedConversation(c);
                                setMobileMenuOpen(false); // Close on selection
                            }}
                            onOpenDMModal={() => toggleModal('dm', true)}
                            currentUser={user}
                            onDelete={handleDeleteConversation}
                        />
                    )}

                    {/* User Panel (Bottom) */}
                    <UserPanel user={user} onOpenSettings={() => toggleModal('userSettings', true)} />
                </div>

                {/* Backdrop for mobile to close menu */}
                <div
                    className={`md:hidden flex-1 select-none cursor-pointer ${mobileMenuOpen ? 'block' : 'hidden'}`}
                    onClick={() => setMobileMenuOpen(false)}
                />
            </div>

            {/* 3. Main Chat Area (Right) */}
            <div className="flex-1 flex flex-col min-w-0 bg-transparent">
                {selectedServer ? (
                    selectedChannel ? (
                        <ChatArea
                            channelId={selectedChannel._id}
                            channelName={selectedChannel.name}
                            serverId={selectedServer._id}
                            onStartDM={handleStartDM}
                            onChannelSelect={(channelId, messageId) => {
                                const ch = channels.find(c => c._id === channelId);
                                if (ch) {
                                    setSelectedChannel(ch);
                                    setTargetMessageId(messageId);
                                }
                            }}
                            targetMessageId={targetMessageId}
                            socket={socket}
                            onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            <div>Welcome to {selectedServer.name}. Select a channel.</div>
                        </div>
                    )
                ) : (
                    selectedConversation ? (
                        <ChatArea
                            conversationId={selectedConversation._id}
                            serverId={selectedConversation._id}
                            channelName={(() => {
                                // Calculate name safely
                                const other = selectedConversation.participants?.find(p => p._id !== user.id || p !== user.id);
                                return typeof other === 'object' ? other?.username : 'DM';
                            })()}
                            onStartDM={handleStartDM}
                            socket={socket}
                            onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            <div>Select a conversation to start chatting.</div>
                        </div>
                    )
                )}
            </div>

            {/* 4. Modals */}
            {modals.server && <CreateServerModal onClose={() => toggleModal('server', false)} onServerCreated={handleServerCreated} />}
            {modals.join && <JoinServerModal onClose={() => toggleModal('join', false)} onServerJoined={handleServerJoined} />}
            {modals.channel && selectedServer && <CreateChannelModal serverId={selectedServer._id} categories={selectedServer.categories || []} onClose={() => toggleModal('channel', false)} onChannelCreated={(c) => { setChannels([...channels, c]); setSelectedChannel(c); }} />}
            {modals.invite && selectedServer && <InviteModal server={selectedServer} onClose={() => toggleModal('invite', false)} />}
            {modals.settings && selectedServer && <ServerSettingsModal server={selectedServer} onClose={() => toggleModal('settings', false)} onServerUpdated={(u) => { setServers(servers.map(s => s._id === u._id ? u : s)); setSelectedServer(u); }} />}
            {modals.dm && <CreateDMModal onClose={() => toggleModal('dm', false)} onConversationCreated={(c) => { setConversations([c, ...conversations]); setSelectedConversation(c); setSelectedServer(null); }} />}
            {modals.userSettings && <UserSettingsModal onClose={() => toggleModal('userSettings', false)} currentThemeColor={themeColor} onThemeChange={setThemeColor} />}

        </div >
    );
};