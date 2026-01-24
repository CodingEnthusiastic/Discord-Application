import React, { useState } from 'react';
import { Smile, X } from 'lucide-react';

/**
 * ReactionPicker Component
 * Shows emoji selector for reacting to messages
 */
export const ReactionPicker = ({ messageId, onReactionAdd, onClose, isOpen, isCurrentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Popular Discord reactions
  const reactionEmojis = [
    { emoji: '👍', name: 'thumbs_up', category: 'popular' },
    { emoji: '❤️', name: 'heart', category: 'popular' },
    { emoji: '😂', name: 'joy', category: 'popular' },
    { emoji: '🎉', name: 'tada', category: 'popular' },
    { emoji: '😢', name: 'cry', category: 'popular' },
    { emoji: '🔥', name: 'fire', category: 'popular' },
    { emoji: '😍', name: 'heart_eyes', category: 'emotions' },
    { emoji: '🤔', name: 'thinking', category: 'emotions' },
    { emoji: '😱', name: 'shocked', category: 'emotions' },
    { emoji: '🙏', name: 'pray', category: 'emotions' },
    { emoji: '🎮', name: 'video_game', category: 'activities' },
    { emoji: '🚀', name: 'rocket', category: 'objects' },
    { emoji: '✅', name: 'check_mark', category: 'symbols' },
    { emoji: '❌', name: 'x_mark', category: 'symbols' },
    { emoji: '🙈', name: 'see_no_evil', category: 'emotions' },
    { emoji: '👀', name: 'eyes', category: 'emotions' },
    { emoji: '🎯', name: 'target', category: 'objects' },
    { emoji: '⭐', name: 'star', category: 'objects' },
    { emoji: '🌟', name: 'glowing_star', category: 'objects' },
    { emoji: '💯', name: 'hundred', category: 'symbols' },
    { emoji: '🤢', name: 'nauseated', category: 'emotions' },
    { emoji: '🤡', name: 'clown', category: 'emotions' },
    { emoji: '🍆', name: 'eggplant', category: 'food' },
    { emoji: '🍑', name: 'peach', category: 'food' },
    { emoji: '💀', name: 'skull', category: 'emotions' },
    { emoji: '🧠', name: 'brain', category: 'body' },
    { emoji: '👻', name: 'ghost', category: 'emotions' },
    { emoji: '👽', name: 'alien', category: 'emotions' },
    { emoji: '👾', name: 'invader', category: 'activities' },
    { emoji: '🤖', name: 'robot', category: 'activities' }
  ];

  const filtered = reactionEmojis.filter(r =>
    r.emoji.includes(searchTerm) ||
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className={`absolute bottom-full mb-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.7)] z-50 p-4 w-72 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/10 overflow-hidden
      ${isCurrentUser
        ? 'origin-bottom-right -right-12 sm:right-0'
        : 'origin-bottom-left -left-12 sm:left-0'
      }
    `}>
      {/* Decorative gradient background blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
              <Smile size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              React
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full transition-all duration-200"
          >
            <X size={16} />
          </button>
        </div>

        <input
          type="text"
          autoFocus
          placeholder="Search reaction..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-xl px-3 py-2 mb-3 placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
        />

        <div className="grid grid-cols-7 gap-1 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
          {filtered.map((reaction, idx) => (
            <button
              key={idx}
              onClick={() => onReactionAdd(reaction.emoji, reaction.name)}
              className="group relative aspect-square flex items-center justify-center rounded-xl hover:bg-white/10 transition-all duration-200 hover:scale-110 active:scale-95"
              title={reaction.name}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 rounded-xl transition-all duration-300" />
              <span className="text-xl relative z-10 filter drop-shadow-lg group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all">
                {reaction.emoji}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-6 flex flex-col items-center">
            <span className="text-2xl mb-2 opacity-50">🤔</span>
            <span>No mood found</span>
          </div>
        )}
      </div>
    </div>
  );
};
