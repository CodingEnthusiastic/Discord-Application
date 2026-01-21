import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const SearchBar = ({ serverId, onStartDM, onChannelSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef(null);

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim() && serverId) {
                setLoading(true);
                try {
                    const res = await axios.get(`${API_URL}/api/search`, {
                        params: { query, serverId }
                    });
                    setResults(res.data);
                    setIsOpen(true);
                } catch (error) {
                    console.error("Search failed:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(delayDebounceFn);
    }, [query, serverId]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleResultClick = (result) => {
        if (result.type === 'user') {
            if (onStartDM) onStartDM(result.clerkId);
        } else if (result.type === 'message') {
            if (onChannelSelect) onChannelSelect(result.channelId, result._id);
        }
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="relative w-64" ref={searchRef}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search users or messages..."
                    className="w-full bg-[#1e1f22] text-sm text-gray-200 rounded px-2 py-1 pl-2 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400"
                />
                <div className="absolute right-2 top-1.5 text-gray-400">
                    {loading ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Search size={14} />
                    )}
                </div>
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-[#2b2d31] rounded-md shadow-lg border border-[#1e1f22] z-50 max-h-96 overflow-y-auto">
                    <div className="p-2 text-xs font-semibold text-gray-400 uppercase">
                        Search Results
                    </div>
                    {results.map((result) => (
                        <div
                            key={result._id}
                            onClick={() => handleResultClick(result)}
                            className="p-2 hover:bg-[#35373c] cursor-pointer group transition-colors rounded mx-1"
                        >
                            {result.type === 'user' ? (
                                <div className="flex items-center gap-3">
                                    <img src={result.avatar} alt={result.username} className="w-8 h-8 rounded-full" />
                                    <div>
                                        <div className="font-medium text-gray-200 text-sm">{result.username}</div>
                                        {/* <div className="text-xs text-gray-400">{result.email}</div> */}
                                    </div>
                                    <span className="ml-auto text-[10px] text-gray-500 bg-[#1e1f22] px-1 rounded uppercase">USER</span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            {result.senderAvatar ? (
                                                <img src={result.senderAvatar} alt="" className="w-5 h-5 rounded-full" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full bg-gray-500 flex items-center justify-center text-[10px] text-white">
                                                    {result.senderName?.[0]}
                                                </div>
                                            )}
                                            <span className="font-medium text-gray-200 text-sm">{result.senderName}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-500 bg-[#1e1f22] px-1 rounded">
                                            #{result.channelName}
                                        </span>
                                    </div>
                                    <div className="text-gray-300 text-sm pl-7 line-clamp-2">
                                        {result.content}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {isOpen && results.length === 0 && query && !loading && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-[#2b2d31] rounded-md shadow-lg border border-[#1e1f22] z-50 p-4 text-center text-gray-400 text-sm">
                    No results found.
                </div>
            )}
        </div>
    );
};

export default SearchBar;
