// components/layout/DMSidebar.jsx
import { Plus, X } from 'lucide-react';
import { formatDiscordTime } from '../../utils/dateUtils';

export const DMSidebar = ({
    conversations,
    selectedConversation,
    onSelect,
    onOpenDMModal,
    currentUser,
    onDelete
}) => {

    return (
        <div className="w-60 bg-white/5 backdrop-blur-2xl flex flex-col h-full border-r border-white/10">
            {/* Search Header */}
            <div className="h-12 border-b border-white/10 flex items-center px-4 shadow-sm shrink-0">
                <button
                    onClick={onOpenDMModal}
                    className="bg-black/20 text-left text-gray-300 text-xs w-full p-1.5 rounded-md focus:outline-none hover:bg-black/40 hover:text-white transition-all shadow-inner border border-white/5"
                >
                    Find or start a conversation...
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                <div className="flex items-center justify-between text-xs font-bold text-gray-400 px-2 mb-2 uppercase group">
                    <span>Direct Messages</span>
                    <Plus onClick={onOpenDMModal} className="w-3 h-3 cursor-pointer hover:text-white" />
                </div>

                {conversations.map(conv => {
                    // Logic: Find the participant that is NOT the current user
                    // We assume 'participants' is an array of Objects populated by backend
                    // If it is just IDs, this will fail. ensure backend uses .populate()
                    const otherUser = conv.participants.find(p => p._id !== currentUser?.id) || conv.participants[0];

                    // Fallback name/image if data is missing
                    const displayName = otherUser?.firstName || otherUser?.username || "Unknown User";
                    const displayImage = otherUser?.imageUrl;

                    // console.log("[DEBUG] Conversation:", conv);
                    // console.log("[DEBUG] Other User:", otherUser);
                    // console.log("name", displayName);
                    // console.log("image", displayImage);


                    return (
                        <div
                            key={conv._id}
                            onClick={() => onSelect(conv)}
                            className={`flex items-center px-2 py-2 rounded-lg cursor-pointer group transition-all border border-transparent ${selectedConversation?._id === conv._id
                                ? 'bg-white/10 text-white shadow-lg border-white/5 backdrop-blur-md'
                                : 'text-gray-400 hover:bg-white/5 hover:text-gray-100 hover:border-white/5'
                                }`}
                        >
                            <div className="relative mr-3">
                                <img
                                    src={displayImage || "https://discord.com/assets/c9006004b97560d2b274.svg"}
                                    alt="avatar"
                                    className="w-8 h-8 rounded-full bg-indigo-500 object-cover shadow-sm ring-2 ring-transparent group-hover:ring-white/10 transition-all"
                                    onError={(e) => { e.target.src = "https://discord.com/assets/c9006004b97560d2b274.svg" }}
                                />
                                {otherUser?.isOnline ? (
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-[2px] border-[#2f3136]" title="Online"></div>
                                ) : (
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-gray-500 rounded-full border-[2px] border-[#2f3136]" title="Offline"></div>
                                )}
                            </div>

                            <div className="flex-1 truncate">
                                <div className="font-medium text-sm truncate">
                                    {displayName}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {otherUser?.isOnline
                                        ? "Online"
                                        : formatDiscordTime(otherUser?.lastSeen)
                                    }
                                </div>
                            </div>

                            <X
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(conv._id);
                                }}
                                className="w-4 h-4 ml-auto hidden group-hover:block hover:text-red-400 text-gray-500 transition-colors"
                            />
                        </div>
                    );
                })}

                {conversations.length === 0 && (
                    <div className="text-center text-gray-500 text-xs mt-4">
                        No conversations yet.<br />Start one by adding friends!
                    </div>
                )}
            </div>
        </div>
    );
};