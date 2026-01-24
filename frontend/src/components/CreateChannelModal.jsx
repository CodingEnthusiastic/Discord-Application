// import { useState } from 'react';
// import axios from 'axios';
// import { useUser } from '@clerk/clerk-react';
// import { X, Hash, Volume2 } from 'lucide-react';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// export const CreateChannelModal = ({ serverId, categories = [], onClose, onChannelCreated }) => {
//     const { user } = useUser();
//     const [name, setName] = useState('');
//     const [type, setType] = useState('text');
//     const [category, setCategory] = useState('General');
//     const [isLoading, setIsLoading] = useState(false);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!name.trim()) return;

//         setIsLoading(true);
//         try {
//             const res = await axios.post(`${API_URL}/api/channels`, {
//                 name,
//                 type,
//                 category,
//                 serverId,
//                 userId: user.id
//             });
//             onChannelCreated(res.data);
//             onClose();
//         } catch (err) {
//             console.error('Failed to create channel', err);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//             <div className="bg-[#36393f] text-white rounded-lg w-[460px] p-0 relative shadow-xl overflow-hidden">
//                 <div className="p-4 border-b border-[#202225] flex justify-between items-center">
//                     <h2 className="text-lg font-bold">Create Channel</h2>
//                     <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
//                         <X className="w-6 h-6" />
//                     </button>
//                 </div>

//                 <form onSubmit={handleSubmit} className="p-4">
//                     <div className="mb-4">
//                         <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Channel Type</label>
//                         <div className="space-y-2">
//                             <div
//                                 onClick={() => setType('text')}
//                                 className={`flex items-center p-3 rounded cursor-pointer ${type === 'text' ? 'bg-[#40444b]' : 'hover:bg-[#40444b]'}`}
//                             >
//                                 <Hash className="w-6 h-6 mr-3 text-gray-400" />
//                                 <div>
//                                     <div className="font-medium text-gray-200">Text</div>
//                                     <div className="text-xs text-gray-400">Send messages, images, GIFS, emoji, opinions, and puns</div>
//                                 </div>
//                                 <div className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center ${type === 'text' ? 'border-white bg-white' : 'border-gray-500'}`}>
//                                     {type === 'text' && <div className="w-2 h-2 rounded-full bg-black"></div>}
//                                 </div>
//                             </div>

//                             <div
//                                 onClick={() => setType('voice')}
//                                 className={`flex items-center p-3 rounded cursor-pointer ${type === 'voice' ? 'bg-[#40444b]' : 'hover:bg-[#40444b]'}`}
//                             >
//                                 <Volume2 className="w-6 h-6 mr-3 text-gray-400" />
//                                 <div>
//                                     <div className="font-medium text-gray-200">Voice</div>
//                                     <div className="text-xs text-gray-400">Hang out together with voice, video, and screenshare</div>
//                                 </div>
//                                 <div className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center ${type === 'voice' ? 'border-white bg-white' : 'border-gray-500'}`}>
//                                     {type === 'voice' && <div className="w-2 h-2 rounded-full bg-black"></div>}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//             </div>

//             <div className="mb-4">
//                 <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Channel Category</label>
//                 <select
//                     value={category}
//                     onChange={(e) => setCategory(e.target.value)}
//                     className="w-full bg-[#202225] border-none text-white text-sm rounded p-2 focus:outline-none"
//                 >
//                     <option value="General">General</option>
//                     {categories.filter(c => c !== 'General').map((cat, i) => (
//                         <option key={i} value={cat}>{cat}</option>
//                     ))}
//                 </select>
//             </div>

//             <div className="mb-4">
//                 <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Channel Name</label>
//                 <div className="flex bg-[#202225] rounded p-2 items-center">
//                     <Hash className="w-4 h-4 text-gray-500 mr-2" />
//                     <input
//                         type="text"
//                         value={name}
//                         onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
//                         className="w-full bg-transparent border-none focus:outline-none text-white text-sm"
//                         placeholder="new-channel"
//                         autoFocus
//                     />
//                 </div>
//             </div>

//             <div className="bg-[#2f3136] p-4 -m-4 mt-4 flex justify-end">
//                 <button type="button" onClick={onClose} className="text-white hover:underline mr-6">Cancel</button>
//                 <button
//                     type="submit"
//                     disabled={isLoading || !name.trim()}
//                     className="bg-[#5865F2] hover:bg-[#4752c4] text-white px-6 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
//                 >
//                     {isLoading ? 'Creating...' : 'Create Channel'}
//                 </button>
//             </div>
//         </form>
//             </div >
//         </div >
//     );
// };




import { useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { X, Hash, Volume2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const CreateChannelModal = ({ serverId, categories = [], onClose, onChannelCreated }) => {
    const { user } = useUser();
    const [name, setName] = useState('');
    const [type, setType] = useState('text');
    const [category, setCategory] = useState('General');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/channels`, {
                name,
                type,
                category,
                serverId,
                userId: user.id
            });
            onChannelCreated(res.data);
            onClose();
        } catch (err) {
            console.error('Failed to create channel', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#36393f] text-white rounded-lg w-[460px] p-0 relative shadow-xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-[#202225] flex justify-between items-center">
                    <h2 className="text-lg font-bold">Create Channel</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4">
                    {/* Channel Type Selection */}
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Channel Type</label>
                        <div className="space-y-2">
                            {/* Text Selection */}
                            <div
                                onClick={() => setType('text')}
                                className={`flex items-center p-3 rounded cursor-pointer ${type === 'text' ? 'bg-[#40444b]' : 'hover:bg-[#40444b]'}`}
                            >
                                <Hash className="w-6 h-6 mr-3 text-gray-400" />
                                <div>
                                    <div className="font-medium text-gray-200">Text</div>
                                    <div className="text-xs text-gray-400">Send messages, images, GIFS, emoji, opinions, and puns</div>
                                </div>
                                <div className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center ${type === 'text' ? 'border-white bg-white' : 'border-gray-500'}`}>
                                    {type === 'text' && <div className="w-2 h-2 rounded-full bg-black"></div>}
                                </div>
                            </div>

                            {/* Voice Selection */}
                            <div
                                onClick={() => setType('voice')}
                                className={`flex items-center p-3 rounded cursor-pointer ${type === 'voice' ? 'bg-[#40444b]' : 'hover:bg-[#40444b]'}`}
                            >
                                <Volume2 className="w-6 h-6 mr-3 text-gray-400" />
                                <div>
                                    <div className="font-medium text-gray-200">Voice</div>
                                    <div className="text-xs text-gray-400">Hang out together with voice, video, and screenshare</div>
                                </div>
                                <div className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center ${type === 'voice' ? 'border-white bg-white' : 'border-gray-500'}`}>
                                    {type === 'voice' && <div className="w-2 h-2 rounded-full bg-black"></div>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Channel Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-[#202225] border-none text-white text-sm rounded p-2 focus:outline-none"
                        >
                            <option value="General">General</option>
                            {categories.filter(c => c !== 'General').map((cat, i) => (
                                <option key={i} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Channel Name Input */}
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Channel Name</label>
                        <div className="flex bg-[#202225] rounded p-2 items-center">
                            <Hash className="w-4 h-4 text-gray-500 mr-2" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                className="w-full bg-transparent border-none focus:outline-none text-white text-sm"
                                placeholder="new-channel"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Footer / Action Buttons */}
                    <div className="bg-[#2f3136] p-4 -m-4 mt-4 flex justify-end">
                        <button type="button" onClick={onClose} className="text-white hover:underline mr-6">Cancel</button>
                        <button
                            type="submit"
                            disabled={isLoading || !name.trim()}
                            className="bg-[#5865F2] hover:bg-[#4752c4] text-white px-6 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Creating...' : 'Create Channel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};