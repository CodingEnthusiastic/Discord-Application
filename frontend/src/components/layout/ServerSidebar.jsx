import React, { useState } from 'react';
import { ChevronDown, X, UserPlus, Settings, Plus, Trash2, LogOut, Volume2, Hash } from 'lucide-react';

export const ServerSidebar = ({
    server,
    channels,
    selectedChannel,
    onSelectChannel,
    user,
    isOwner,
    onOpenInvite,
    onOpenSettings,
    onOpenCreateChannel,
    onDeleteServer,
    onLeaveServer,
    onDeleteChannel
}) => {
    const [showDropdown, setShowDropdown] = useState(false);

    // Group Channels by Category
    const groupedChannels = channels.reduce((acc, channel) => {
        const cat = channel.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(channel);
        return acc;
    }, {});

    const definedCategories = server.categories || [];
    const otherCategories = Object.keys(groupedChannels).filter(c => !definedCategories.includes(c));
    const sortedCategories = [...definedCategories, ...otherCategories];

    return (
        <div className="w-60 bg-white/5 backdrop-blur-2xl border-r border-white/10 flex flex-col h-full">
            {/* Server Header Dropdown */}
            <div
                className="h-12 border-b border-white/10 flex items-center px-4 font-bold text-white hover:bg-white/5 cursor-pointer transition-colors shadow-sm justify-between relative shrink-0"
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <span className="truncate">{server.name}</span>
                {showDropdown ? <X className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}

                {showDropdown && (
                    <div className="absolute top-12 left-2 right-2 bg-[#18191c]/90 backdrop-blur-lg rounded-xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 border border-white/10 overflow-hidden">
                        <div className="flex items-center justify-between text-[#949cf7] hover:bg-[#5865F2] hover:text-white px-2 py-2 rounded-lg pointer-events-auto cursor-pointer transition-colors"
                            onClick={(e) => { e.stopPropagation(); onOpenInvite(); setShowDropdown(false); }}>
                            <span>Invite People</span><UserPlus className="w-4 h-4" />
                        </div>
                        {isOwner ? (
                            <>
                                <div className="flex items-center justify-between text-gray-300 hover:bg-[#5865F2] hover:text-white px-2 py-2 rounded-lg pointer-events-auto cursor-pointer transition-colors"
                                    onClick={(e) => { e.stopPropagation(); onOpenSettings(); setShowDropdown(false); }}>
                                    <span>Server Settings</span><Settings className="w-4 h-4" />
                                </div>
                                <div className="flex items-center justify-between text-gray-300 hover:bg-[#5865F2] hover:text-white px-2 py-2 rounded-lg pointer-events-auto cursor-pointer transition-colors"
                                    onClick={(e) => { e.stopPropagation(); onOpenCreateChannel(); setShowDropdown(false); }}>
                                    <span>Create Channel</span><Plus className="w-4 h-4" />
                                </div>
                                <div className="h-[1px] bg-white/10 my-1 mx-1"></div>
                                <div className="flex items-center justify-between text-red-500 hover:bg-red-500 hover:text-white px-2 py-2 rounded-lg pointer-events-auto cursor-pointer transition-colors"
                                    onClick={(e) => { e.stopPropagation(); onDeleteServer(); }}>
                                    <span>Delete Server</span><Trash2 className="w-4 h-4" />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="h-[1px] bg-white/10 my-1 mx-1"></div>
                                <div className="flex items-center justify-between text-red-500 hover:bg-red-500 hover:text-white px-2 py-2 rounded-lg pointer-events-auto cursor-pointer transition-colors"
                                    onClick={(e) => { e.stopPropagation(); onLeaveServer(); }}>
                                    <span>Leave Server</span><LogOut className="w-4 h-4" />
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Channels List */}
            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 custom-scrollbar">
                {sortedCategories.map(category => {
                    const categoryChannels = groupedChannels[category];
                    if (!categoryChannels || categoryChannels.length === 0) return null;
                    return (
                        <div key={category} className="mb-4">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-400 px-2 mb-1 hover:text-gray-200 cursor-pointer uppercase group transition-colors">
                                <div className="flex items-center"><ChevronDown className="w-3 h-3 mr-0.5" /><span>{category}</span></div>
                                {isOwner && <Plus onClick={onOpenCreateChannel} className="w-3 h-3 cursor-pointer hover:text-white" />}
                            </div>
                            <div className="space-y-[2px]">
                                {categoryChannels.map(channel => (
                                    <div
                                        key={channel._id}
                                        onClick={() => onSelectChannel(channel)}
                                        className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer group transition-all border border-transparent ${selectedChannel?._id === channel._id ? 'bg-white/10 text-white backdrop-blur-md shadow-sm border-white/5' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 hover:border-white/5'
                                            }`}
                                    >
                                        <div className="flex items-center overflow-hidden">
                                            {channel.type === 'voice' ? (
                                                <Volume2 className="w-4 h-4 mr-1.5 shrink-0 text-gray-500 group-hover:text-gray-400" />
                                            ) : (
                                                <Hash className="w-4 h-4 mr-1.5 shrink-0 text-gray-500 group-hover:text-gray-400" />
                                            )}
                                            <span className="font-medium truncate">{channel.name}</span>
                                        </div>
                                        {isOwner && (
                                            <Trash2
                                                onClick={(e) => { e.stopPropagation(); onDeleteChannel(channel._id, channel.name); }}
                                                className="w-3 h-3 hidden group-hover:block text-gray-500 hover:text-red-400"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};