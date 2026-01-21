// import React, { useState, useEffect, useCallback } from 'react';
// import { Smile } from 'lucide-react';
// import axios from 'axios';
// import { ReactionPicker } from './ReactionPicker';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// /**
//  * MessageReactions Component
//  * Displays reactions on a message and allows adding/removing
//  */
// const MessageReactions = ({ 
//   messageId, 
//   userId, 
//   userName, 
//   socket 
// }) => {
//   const [reactions, setReactions] = useState([]);
//   const [showPicker, setShowPicker] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const fetchReactions = useCallback(async () => {
//     try {
//       const response = await axios.get(`${API_URL}/api/reactions/${messageId}`);
//       setReactions(response.data.reactions || []);
//     } catch (error) {
//       console.error('Error fetching reactions:', error);
//     }
//   }, [messageId]);

//   // Fetch reactions on mount
//   useEffect(() => {
//     if (messageId) {
//       fetchReactions();
//     }
//   }, [messageId, fetchReactions]);

//   // Listen for real-time reaction updates
//   useEffect(() => {
//     if (!socket) return;

//     const handleReactionAdded = (data) => {
//       if (data.messageId === messageId) {
//         fetchReactions();
//       }
//     };

//     const handleReactionRemoved = (data) => {
//       if (data.messageId === messageId) {
//         fetchReactions();
//       }
//     };

//     socket.on('reaction_added', handleReactionAdded);
//     socket.on('reaction_removed', handleReactionRemoved);

//     return () => {
//       socket.off('reaction_added', handleReactionAdded);
//       socket.off('reaction_removed', handleReactionRemoved);
//     };
//   }, [socket, messageId, fetchReactions]);

//   const handleAddReaction = async (emoji, emojiName) => {
//     try {
//       setLoading(true);
//       await axios.post(`${API_URL}/api/reactions/add`, {
//         messageId,
//         emoji,
//         emojiName,
//         userId,
//         userName
//       });
//       setShowPicker(false);
//       await fetchReactions();
//     } catch (error) {
//       if (error.response?.status === 400) {
//         // User already reacted - remove instead
//         await handleRemoveReaction(emoji);
//       } else {
//         console.error('Error adding reaction:', error);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRemoveReaction = async (emoji) => {
//     try {
//       setLoading(true);
//       await axios.post(`${API_URL}/api/reactions/remove`, {
//         messageId,
//         emoji,
//         userId
//       });
//       await fetchReactions();
//     } catch (error) {
//       console.error('Error removing reaction:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReactionClick = async (emoji) => {
//     // Check if user already reacted with this emoji
//     const userReacted = reactions
//       .find(r => r.emoji === emoji)
//       ?.users.some(u => u.userId === userId);

//     if (userReacted) {
//       await handleRemoveReaction(emoji);
//     } else {
//       await handleAddReaction(emoji, 'custom');
//     }
//   };

//   if (!reactions || reactions.length === 0) {
//     return (
//       <div className="relative">
//         <button
//           onClick={() => setShowPicker(!showPicker)}
//           className="text-gray-400 hover:text-white text-xs p-1 rounded hover:bg-gray-700/50 transition flex items-center gap-1"
//           title="React"
//         >
//           <Smile size={14} />
//         </button>
//         <ReactionPicker
//           messageId={messageId}
//           onReactionAdd={handleAddReaction}
//           onClose={() => setShowPicker(false)}
//           isOpen={showPicker}
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="flex items-center gap-1 mt-1 flex-wrap">
//       {reactions.map((reaction, idx) => {
//         const userReacted = reaction.users.some(u => u.userId === userId);
//         return (
//           <button
//             key={idx}
//             onClick={() => handleReactionClick(reaction.emoji)}
//             disabled={loading}
//             className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition ${
//               userReacted
//                 ? 'bg-blue-600/40 border border-blue-500/60 text-blue-200'
//                 : 'bg-gray-700/50 border border-gray-600/50 text-gray-300 hover:bg-gray-700'
//             }`}
//             title={reaction.users.map(u => u.username).join(', ')}
//           >
//             <span>{reaction.emoji}</span>
//             <span className="text-[10px] font-semibold">{reaction.count}</span>
//           </button>
//         );
//       })}

//       <div className="relative">
//         <button
//           onClick={() => setShowPicker(!showPicker)}
//           className="text-gray-400 hover:text-white text-xs p-1 rounded hover:bg-gray-700/50 transition"
//           title="Add reaction"
//         >
//           <Smile size={14} />
//         </button>
//         <ReactionPicker
//           messageId={messageId}
//           onReactionAdd={handleAddReaction}
//           onClose={() => setShowPicker(false)}
//           isOpen={showPicker}
//         />
//       </div>
//     </div>
//   );
// };

// export default MessageReactions;


import React, { useState, useEffect } from 'react';
import { Smile } from 'lucide-react';
import axios from 'axios';
import { ReactionPicker } from './ReactionPicker';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * MessageReactions Component
 * Displays reactions on a message and allows adding/removing
 */
const MessageReactions = ({
    messageId,
    userId,
    userName,
    socket,
    activeReactionId,
    onTogglePicker,
    isCurrentUser
}) => {
    const [reactions, setReactions] = useState([]);
    // const [showPicker, setShowPicker] = useState(false); // Controlled by parent
    const [loading, setLoading] = useState(false);

    const showPicker = activeReactionId === messageId;

    // Fetch reactions on mount
    useEffect(() => {
        if (messageId) {
            fetchReactions();
        }
    }, [messageId]);

    // Listen for real-time reaction updates
    useEffect(() => {
        if (!socket) return;

        const handleReactionAdded = (data) => {
            if (data.messageId === messageId) {
                fetchReactions();
            }
        };

        const handleReactionRemoved = (data) => {
            if (data.messageId === messageId) {
                fetchReactions();
            }
        };

        socket.on('reaction_added', handleReactionAdded);
        socket.on('reaction_removed', handleReactionRemoved);

        return () => {
            socket.off('reaction_added', handleReactionAdded);
            socket.off('reaction_removed', handleReactionRemoved);
        };
    }, [socket, messageId]);

    const fetchReactions = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/reactions/${messageId}`);
            setReactions(response.data.reactions || []);
        } catch (error) {
            console.error('Error fetching reactions:', error);
        }
    };

    const handleAddReaction = async (emoji, emojiName) => {
        try {
            setLoading(true);
            await axios.post(`${API_URL}/api/reactions/add`, {
                messageId,
                emoji,
                emojiName,
                userId,
                userName
            });
            onTogglePicker(); // Close picker
            await fetchReactions();
        } catch (error) {
            if (error.response?.status === 400) {
                // User already reacted - remove instead
                await handleRemoveReaction(emoji);
            } else {
                console.error('Error adding reaction:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveReaction = async (emoji) => {
        try {
            setLoading(true);
            await axios.post(`${API_URL}/api/reactions/remove`, {
                messageId,
                emoji,
                userId
            });
            await fetchReactions();
        } catch (error) {
            console.error('Error removing reaction:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReactionClick = async (emoji) => {
        // Check if user already reacted with this emoji
        const userReacted = reactions
            .find(r => r.emoji === emoji)
            ?.users.some(u => u.userId === userId);

        if (userReacted) {
            await handleRemoveReaction(emoji);
        } else {
            await handleAddReaction(emoji, 'custom');
        }
    };

    if (!reactions || reactions.length === 0) {
        return (
            <div className="relative group">
                <button
                    onClick={onTogglePicker}
                    className="text-gray-400  group-hover:opacity-100 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-110 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                    title="Add Reaction"
                >
                    <Smile size={16} />
                </button>
                <ReactionPicker
                    messageId={messageId}
                    onReactionAdd={handleAddReaction}
                    onClose={onTogglePicker}
                    isOpen={showPicker}
                    isCurrentUser={isCurrentUser}
                />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {reactions.map((reaction, idx) => {
                const userReacted = reaction.users.some(u => u.userId === userId);
                return (
                    <button
                        key={idx}
                        onClick={() => handleReactionClick(reaction.emoji)}
                        disabled={loading}
                        className={`
              group relative flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all duration-300 transform hover:scale-105 active:scale-95
              border overflow-hidden
              ${userReacted
                                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200 hover:bg-indigo-500/30 hover:border-indigo-400 hover:shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)]'
                                : 'bg-black/20 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-gray-200'
                            }
            `}
                        title={reaction.users.map(u => u.username).join(', ')}
                    >
                        {/* Active glow effect */}
                        {userReacted && (
                            <div className="absolute inset-0 bg-indigo-500/10 blur-sm rounded-xl -z-10" />
                        )}

                        <span className="text-sm filter drop-shadow-sm group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all">
                            {reaction.emoji}
                        </span>
                        <span className={`${userReacted ? 'text-indigo-200' : 'text-gray-500 group-hover:text-gray-300'}`}>
                            {reaction.count}
                        </span>
                    </button>
                );
            })}

            <div className="relative">
                <button
                    onClick={onTogglePicker}
                    className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-110 hover:rotate-90 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                    title="Add reaction"
                >
                    <Smile size={16} />
                </button>
                <ReactionPicker
                    messageId={messageId}
                    onReactionAdd={handleAddReaction}
                    onClose={onTogglePicker}
                    isOpen={showPicker}
                    isCurrentUser={isCurrentUser}
                />
            </div>
        </div>
    );
};


export default MessageReactions;