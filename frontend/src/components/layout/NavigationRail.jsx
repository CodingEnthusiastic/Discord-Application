// components/layout/NavigationRail.jsx
import { FaDiscord } from 'react-icons/fa';
import { Plus, Compass } from 'lucide-react';

export const NavigationRail = ({
    servers,
    selectedServer,
    onSelectServer,
    onOpenCreateModal,
    onOpenJoinModal
}) => {
    return (
        <div className="w-[72px] bg-white/5 backdrop-blur-2xl flex flex-col items-center py-4 space-y-2 overflow-y-auto no-scrollbar scroll-smooth shrink-0 border-r border-white/10 z-20">
            {/* Home Button */}
            <div
                onClick={() => onSelectServer(null)}
                className={`w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all flex items-center justify-center cursor-pointer mb-2 group shadow-xl relative
                ${!selectedServer ? 'bg-[#5865F2] rounded-[16px]' : 'bg-white/10 hover:bg-[#5865F2]'}`}
            >
                <FaDiscord className="w-7 h-7 text-white" />
            </div>

            <div className="w-8 h-[2px] bg-white/10 rounded-lg mb-2"></div>

            {/* Server List */}
            {servers.map((server) => (
                <div
                    key={server._id}
                    onClick={() => onSelectServer(server)}
                    className={`group relative w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all cursor-pointer flex items-center justify-center font-bold overflow-hidden text-gray-200 shadow-lg border border-transparent hover:border-white/10
                    ${selectedServer?._id === server._id ? 'bg-[#5865F2] rounded-[16px] text-white' : 'bg-white/10 hover:bg-[#5865F2] hover:text-white'}`}
                >
                    <span className={`absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-lg transform transition-all my-auto h-2 
                        ${selectedServer?._id === server._id ? 'h-10 translate-x-[-4px]' : '-translate-x-full group-hover:translate-x-[-4px] group-hover:h-5'}`
                    }></span>
                    {server.icon ? (
                        <img src={server.icon} alt={server.name} className="w-full h-full object-cover" />
                    ) : (
                        <span>{server.name.substring(0, 2).toUpperCase()}</span>
                    )}
                </div>
            ))}

            {/* Action Buttons */}
            <div onClick={onOpenCreateModal} className="w-12 h-12 bg-white/10 rounded-[24px] hover:rounded-[16px] hover:bg-green-600 transition-all text-green-500 hover:text-white flex items-center justify-center cursor-pointer group shadow-lg">
                <Plus className="w-6 h-6" />
            </div>
            <div onClick={onOpenJoinModal} className="w-12 h-12 bg-white/10 rounded-[24px] hover:rounded-[16px] hover:bg-green-600 transition-all text-green-500 hover:text-white flex items-center justify-center cursor-pointer shadow-lg">
                <Compass className="w-6 h-6" />
            </div>
        </div>
    );
};