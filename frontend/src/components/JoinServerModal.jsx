import { useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { X, Compass } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const JoinServerModal = ({ onClose, onServerJoined }) => {
    const { user } = useUser();
    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inviteCode.trim()) return;

        setIsLoading(true);
        setError('');
        try {
            const res = await axios.post(`${API_URL}/api/servers/join`, {
                inviteCode: inviteCode.trim(),
                userId: user.id
            });
            onServerJoined(res.data);
            onClose();
        } catch (err) {
            console.error('Failed to join server', err);
            setError(err.response?.data?.error || 'Failed to join server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white text-gray-900 rounded-lg w-[440px] p-6 relative shadow-xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2 text-[#060607]">Join a Server</h2>
                    <p className="text-[#4f5660] text-sm">Enter an invite below to join an existing server</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-[#4f5660] uppercase mb-2">Invite Link or Code</label>
                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            className="w-full bg-[#e3e5e8] border border-transparent rounded p-2.5 text-base focus:outline-none focus:border-blue-400 text-black placeholder-gray-500"
                            placeholder="hTKzmak"
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                    </div>

                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-[#4f5660] uppercase mb-2">Invites should look like</h3>
                        <div className="text-xs text-[#4f5660]">hTKzmak</div>
                        <div className="text-xs text-[#4f5660]">https://discord.gg/hTKzmak</div>
                        <div className="text-xs text-[#4f5660]">https://discord.gg/cool-people</div>
                    </div>

                    <div className="bg-[#f2f3f5] -m-6 p-4 rounded-b-lg flex justify-between items-center mt-6">
                        <button type="button" onClick={onClose} className="text-[#4f5660] hover:underline text-sm font-medium">Back</button>
                        <button
                            type="submit"
                            disabled={isLoading || !inviteCode.trim()}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded shadow transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                            {isLoading ? 'Joining...' : 'Join Server'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
