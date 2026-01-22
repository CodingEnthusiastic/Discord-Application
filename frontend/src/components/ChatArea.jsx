import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Hash, Bell, Pin, Users, Inbox, HelpCircle, MessageSquare, Menu } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { FaDiscord } from "react-icons/fa";
import { SummaryModal } from './SummaryModal';
import MessageReactions from './MessageReactions';
import SearchBar from './SearchBar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const ChatArea = ({ channelId, conversationId, channelName = 'general', onStartDM, socket, serverId, targetMessageId, onChannelSelect, onMobileMenuToggle }) => {
    const { user } = useUser();
    // Socket is now passed as a prop
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [activeProfile, setActiveProfile] = useState(null);
    const [activeReactionId, setActiveReactionId] = useState(null); // Track active picker
    const [summaryModalOpen, setSummaryModalOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [pinsOpen, setPinsOpen] = useState(false);
    const [membersOpen, setMembersOpen] = useState(false);
    const [inboxOpen, setInboxOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const [justJumped, setJustJumped] = useState(false);


    //alpha
    // Fetch initial messages
    useEffect(() => {
        if (!channelId && !conversationId) return;

        const fetchMessages = async () => {
            try {
                let url = '';
                if (channelId) {
                    url = `${API_URL}/api/channels/${channelId}/messages`;
                } else if (conversationId) {
                    url = `${API_URL}/api/conversations/${conversationId}/messages`;
                }
                const res = await axios.get(url);
                setMessages(res.data);
            } catch (err) {
                console.error("Failed to load messages", err);
            }
        };
        fetchMessages();
    }, [channelId, conversationId]);

    // Socket listener
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg) => {
            setMessages((prev) => [...prev, msg]);

            if (msg?.senderId !== user?.id) {
                try {
                    const audio = new Audio();
                    audio.play().catch(e => { });
                } catch (e) { }
            }
        };

        socket.on('new_message', handleNewMessage);
        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, user]);

    // Scroll Logic
    useEffect(() => {
        if (targetMessageId && messages.length > 0) {
            const el = document.getElementById(targetMessageId);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                el.classList.add('bg-gray-700/50', 'transition-colors', 'duration-1000');
                setTimeout(() => el.classList.remove('bg-gray-700/50'), 2000);
                setJustJumped(true);
            }
        } else if (!justJumped) {
            // Defaults to bottom if not jumping
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, targetMessageId]);

    // Reset jump flag when channel changes
    useEffect(() => {
        setJustJumped(false);
    }, [channelId, conversationId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !user) return;


        const messageData = {
            content: input,
            senderId: user.id || 'guest',
            senderName: user.firstName || user.username || 'Guest',
            senderAvatar: user?.imageUrl
        };

        if (channelId) messageData.channelId = channelId;
        if (conversationId) messageData.conversationId = conversationId;
        if (serverId) messageData.serverId = serverId;

        try {
            await axios.post(`${API_URL}/api/messages`, messageData);
            setInput('');
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-black/20 flex-1 backdrop-blur-sm">
            {/* Header */}
            <div className="h-12 border-b border-white/10 flex items-center px-4 justify-between shadow-sm bg-white/5 backdrop-blur-xl z-10">
                <div className="flex items-center text-white font-bold">
                    <button
                        onClick={onMobileMenuToggle}
                        className="md:hidden mr-3 text-gray-400 hover:text-white"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <Hash className="w-5 h-5 text-gray-400 mr-2" />
                    {channelName}
                </div>

                <div className="flex items-center space-x-4 text-gray-400">
                    <button
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                        title="Notifications"
                        className="relative w-5 h-5 cursor-pointer hover:text-gray-200 transition-colors"
                    >
                        <Bell className="w-5 h-5" />
                        {notificationsOpen && (
                            <div className="absolute top-8 right-0 bg-[#18191c] border border-white/10 rounded-lg p-3 w-64 shadow-xl z-50">
                                <div className="text-white text-sm font-semibold mb-2">Notifications</div>
                                <div className="text-gray-400 text-xs">No new notifications</div>
                            </div>
                        )}
                    </button>
                    <button
                        onClick={() => setPinsOpen(!pinsOpen)}
                        title="Pinned Messages"
                        className="relative w-5 h-5 cursor-pointer hover:text-gray-200 transition-colors"
                    >
                        <Pin className="w-5 h-5" />
                        {pinsOpen && (
                            <div className="absolute top-8 right-0 bg-[#18191c] border border-white/10 rounded-lg p-3 w-64 shadow-xl z-50">
                                <div className="text-white text-sm font-semibold mb-2">Pinned Messages</div>
                                <div className="text-gray-400 text-xs">No pinned messages in this channel</div>
                            </div>
                        )}
                    </button>
                    <button
                        onClick={() => setMembersOpen(!membersOpen)}
                        title="Members"
                        className="relative w-5 h-5 cursor-pointer hover:text-gray-200 transition-colors"
                    >
                        <Users className="w-5 h-5" />
                        {membersOpen && (
                            <div className="absolute top-8 -right-20 bg-[#18191c] border border-white/10 rounded-lg p-3 w-48 shadow-xl z-50">
                                <div className="text-white text-sm font-semibold mb-2">Members</div>
                                <div className="text-gray-400 text-xs">Loading members...</div>
                            </div>
                        )}
                    </button>
                    {channelId && serverId && (
                        <button
                            onClick={() => setSummaryModalOpen(true)}
                            title="Generate chat summary"
                            className="w-5 h-5 cursor-pointer hover:text-gray-200 transition flex items-center justify-center"
                        >
                            <MessageSquare className="w-5 h-5" />
                        </button>
                    )}
                    <div className="relative hidden md:block">
                        <SearchBar
                            serverId={serverId}
                            onStartDM={onStartDM}
                            onChannelSelect={onChannelSelect}
                        />
                    </div>
                    <button
                        onClick={() => setInboxOpen(!inboxOpen)}
                        title="Inbox"
                        className="relative w-5 h-5 cursor-pointer hover:text-gray-200 transition-colors"
                    >
                        <Inbox className="w-5 h-5" />
                        {inboxOpen && (
                            <div className="absolute top-8 right-0 bg-[#18191c] border border-white/10 rounded-lg p-3 w-64 shadow-xl z-50">
                                <div className="text-white text-sm font-semibold mb-2">Inbox</div>
                                <div className="text-gray-400 text-xs">You're all caught up!</div>
                            </div>
                        )}
                    </button>
                    <button
                        onClick={() => alert('Help & Support - Coming Soon')}
                        title="Help & Support"
                        className="w-5 h-5 cursor-pointer hover:text-gray-200 transition-colors"
                    >
                        <HelpCircle className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center mt-10 space-y-4 animate-fade-in-up">
                        <div className="relative w-64 h-64">
                            {/* Decorative Elements */}
                            <img 
                                src="/coindis.webp" 
                                className="absolute top-[1vw] -right-[30vw] w-[12vw] h-[12vw] animate-spin-slow opacity-30" 
                                alt="floating coin"
                            />
                            <img 
                                src="/tadyleaf.webp" 
                                className="absolute bottom-[7vw]  w-[28vw] h-[8vw] delay-75 animate-wiggle opacity-90" 
                                style={{ animationDelay: '1s' }}
                                alt="floating leaf"
                            />
                            <img 
                                src="/disegg.webp" 
                                className="absolute top-4 -left-[30vw] w-[14vw] h-[14vw] animate-float opacity-60 " 
                                style={{ animationDelay: '2s' }}
                                alt="floating egg"
                            />

                            {/* Main Characters */}
                            <div className="absolute top-[17.4vw] z-20 inset-0 flex items-center justify-center">
                                <img 
                                    src="/taddy.webp" 
                                    className="w-60 h-60 object-contain z-10" 
                                    alt="Taddy"
                                />
                                {/* <img 
                                    src="/botbody.webp" 
                                    className="absolute -right-8 bottom-0 w-24 h-24 object-contain animate-wiggle z-20" 
                                    style={{ animationDelay: '0.5s' }}
                                    alt="Bot Body"
                                /> */}
                            </div>
                        </div>

                        <div className="text-center z-10">
                            <h3 className="text-5xl font-bold text-white mb-2">Welcome to #{channelName}!</h3>
                            <p className="text-gray-400 text-sm ">
                                This is the start of the <span className="font-semibold text-gray-300">#{channelName}</span> channel.
                                Say hello to your new friends!
                            </p>
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => {
                    // Check if the message is sent by the current logged-in user
                    const isCurrentUser = msg.senderId === user?.id;

                    return (
                        <div
                            key={i}
                            id={msg._id} // ID for scroll target
                            className={`flex w-full ${isCurrentUser ? 'justify-end' : 'justify-start'} rounded px-2`} // Added padding and rounded for highlight effect
                        >
                            <div
                                className={`flex max-w-[80%] md:max-w-[70%] gap-3
                                     ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}
                                    `}
                            >
                                {/* Avatar */}
                                <img
                                    src={msg?.senderAvatar}
                                    alt="avatar"
                                    className="w-10 h-10 rounded-full hover:opacity-80 cursor-pointer flex-shrink-0 mt-1 shadow-sm border border-white/10"
                                    onClick={(e) => {
                                        const rect = e.target.getBoundingClientRect();
                                        // Adjust popover position based on side
                                        const xPos = isCurrentUser ? rect.left - 250 : rect.right + 10;
                                        setActiveProfile({ x: xPos, y: rect.top, user: msg });
                                    }}
                                />

                                {/* Message Content Wrapper */}
                                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>

                                    {/* Name and Time */}
                                    <div className={`flex items-center space-x-2 mb-1 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                                        <span
                                            className="text-white font-medium text-sm hover:underline cursor-pointer"
                                            onClick={(e) => {
                                                const rect = e.target.getBoundingClientRect();
                                                const xPos = isCurrentUser ? rect.left - 250 : rect.right + 10;
                                                setActiveProfile({ x: xPos, y: rect.top, user: msg });
                                            }}
                                        >
                                            {msg.senderName}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    {/* The Bubble */}
                                    <div
                                        className={`px-4 py-2.5 rounded-2xl text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap shadow-md break-words max-w-full border border-white/5 ${isCurrentUser
                                            ? 'bg-[#5865F2]/20 text-white rounded-tr-none shadow-indigo-500/20'  // Discord Blurple for Me
                                            : 'bg-black/40 backdrop-blur-md text-gray-100 rounded-tl-none' // Glass for Others
                                            }`}
                                    >
                                        {msg.content}
                                    </div>

                                    {/* Reactions */}
                                    <div className="mt-1">
                                        <MessageReactions
                                            messageId={msg._id}
                                            userId={user?.id}
                                            userName={user?.firstName || user?.username}
                                            socket={socket}
                                            activeReactionId={activeReactionId}
                                            onTogglePicker={() => setActiveReactionId(activeReactionId === msg._id ? null : msg._id)}
                                            isCurrentUser={isCurrentUser}
                                        />
                                    </div>

                                </div>

                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* User Profile Popover */}
            {activeProfile && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/50"
                        onClick={() => setActiveProfile(null)}
                    ></div>
                    <div
                        className="fixed z-50 bg-[#18191c]/90 backdrop-blur-xl rounded-2xl shadow-2xl w-72 -mt-20 overflow-hidden border border-white/10 animate-in fade-in zoom-in-95 duration-100"
                        style={{ left: activeProfile.x, top: Math.min(activeProfile.y, window.innerHeight - 300) }}
                    >
                        <div className="h-20 bg-[#5865F2] relative">
                            <img
                                src={activeProfile.user.senderAvatar}
                                className="w-20 h-20 rounded-full border-[6px] border-[#18191c] absolute -bottom-10 left-4 bg-[#18191c]"
                            />
                        </div>
                        <div className="pt-12 p-4">
                            <div className="font-bold text-white text-xl">{activeProfile.user.senderName}</div>
                            <div className="text-gray-400 text-sm mb-4">#{activeProfile.user.senderId?.slice(-4)}</div>

                            <div className="border-t border-white/10 my-3"></div>

                            <div className="uppercase text-xs font-bold text-gray-400 mb-2">Note</div>
                            <input
                                placeholder={`Message @${activeProfile.user.senderName}`}
                                className="w-full bg-black/20 text-gray-200 text-sm p-2 rounded-lg mb-2 border border-white/5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        onStartDM && onStartDM(activeProfile.user.senderId);
                                        setActiveProfile(null);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Input Area */}
            <div className="px-3 py-1 bg-transparent flex-shrink-0">
                <form onSubmit={handleSendMessage} className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center shadow-lg relative transition-colors focus-within:border-white/20 focus-within:bg-black/40">
                    <button 
                        type="button" 
                        onClick={() => alert('File Upload - Coming Soon')}
                        className="text-gray-400 hover:text-gray-200 mr-3 bg-white/10 hover:bg-white/20 rounded-full p-1 h-6 w-6 flex items-center justify-center shrink-0 transition-colors"
                        title="Upload File"
                    >
                        <span className="font-bold text-xs pb-0.5">+</span>
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Message # ${channelName}`}
                        className="bg-transparent flex-1 text-white  outline-none placeholder-gray-500 text-sm md:text-base py-1"
                    />
                    <div className="flex items-center space-x-3 ml-2 text-gray-400 shrink-0">
                        <Send className={`w-5 h-5 cursor-pointer transition-colors ${input.trim() ? 'text-[#5865F2] hover:text-blue-400' : 'hover:text-white'}`} onClick={handleSendMessage} title="Send Message" />
                    </div>
                </form>
            </div>

            {/* Summary Modal */}
            <SummaryModal
                isOpen={summaryModalOpen}
                onClose={() => setSummaryModalOpen(false)}
                channelId={channelId}
                serverId={serverId}
                userId={user?.id}
            />
        </div>
    );
};