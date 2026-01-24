
import { useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { X, UserPlus } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const CreateDMModal = ({ onClose, onConversationCreated }) => {
    const { user } = useUser();
    const [recipientId, setRecipientId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!recipientId.trim()) return;

        setIsLoading(true);
        setError('');

        try {
            const res = await axios.post(`${API_URL}/api/conversations`, {
                user1Id: user.id,
                user2Id: recipientId.trim()
            });
            onConversationCreated(res.data);
            onClose();
        } catch (err) {
            console.error('Failed to create conversation', err);
            setError('Failed to create or find conversation. Check the ID.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#36393f] text-white rounded-lg w-[440px] p-0 relative shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-[#202225] flex justify-between items-center bg-[#2f3136]">
                    <h2 className="text-sm font-bold uppercase tracking-wide">Select Friends</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    <div className="mb-4">
                        <div className="text-xs text-gray-400 mb-2">
                            ADD BY USER ID (TEMPORARY)
                        </div>
                        <div className="bg-[#202225] border border-[#202225] rounded p-2.5 flex items-center focus-within:border-blue-500 transition-colors">
                            <input
                                type="text"
                                value={recipientId}
                                onChange={(e) => setRecipientId(e.target.value)}
                                className="w-full bg-transparent border-none focus:outline-none text-white text-sm placeholder-gray-500"
                                placeholder="Enter User ID (e.g. user_2...)"
                                autoFocus
                            />
                        </div>
                        {error && <div className="text-red-400 text-xs mt-2">{error}</div>}
                        <div className="text-[10px] text-gray-500 mt-2">
                            * In a real app, you would search by username#tag. For this prototype, please paste the Clerk User ID of the person you want to chat with.
                        </div>
                    </div>

                    <div className="bg-[#2f3136] p-4 -m-4 mt-4 flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-white hover:underline mr-4 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !recipientId.trim()}
                            className="bg-[#5865F2] hover:bg-[#4752c4] text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
                        >
                            {isLoading ? 'Creating...' : <>Create DM</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
