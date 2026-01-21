import { useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const CreateServerModal = ({ onClose, onServerCreated }) => {
    const { user } = useUser();
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/servers`, {
                name,
                ownerId: user.id || 'guest',
                ownerName: user.firstName || 'Guest'
            });
            onServerCreated(res.data);
            onClose();
        } catch (err) {
            console.error('Failed to create server', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-[#1e1f22]/80 backdrop-blur-2xl text-white rounded-2xl w-96 p-6 relative shadow-2xl border border-white/10 scale-100 transition-all">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold text-center mb-2">Create Your Server</h2>
                <p className="text-gray-300 text-center mb-6 text-sm">Give your new server a personality with a name and an icon.</p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Server Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/40 text-white border border-white/10 rounded-lg p-2 focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-500"
                            placeholder="My awesome server"
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/10">
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white hover:underline transition-colors text-sm">Back</button>
                        <button
                            type="submit"
                            disabled={isLoading || !name.trim()}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:shadow-none font-medium"
                        >
                            {isLoading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
