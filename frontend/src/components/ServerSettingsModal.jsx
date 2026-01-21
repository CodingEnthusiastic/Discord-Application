// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useUser } from '@clerk/clerk-react';
// import { X, Save, Trash2, Hash, Shield, Image, LogOut, Upload } from 'lucide-react';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// export const ServerSettingsModal = ({ server, onClose, onServerUpdated }) => {
//     const { user } = useUser();
//     const [activeTab, setActiveTab] = useState('Overview');
//     const [hasChanges, setHasChanges] = useState(false);

//     // Overview State
//     const [name, setName] = useState(server.name);
//     const [icon, setIcon] = useState(server.icon || '');

//     // Category State
//     const [newCategory, setNewCategory] = useState('');
//     const [categories, setCategories] = useState(server.categories || []);

//     // Check for changes
//     useEffect(() => {
//         if (activeTab === 'Overview') {
//             const isChanged = name !== server.name || icon !== (server.icon || '');
//             setHasChanges(isChanged);
//         } else {
//             setHasChanges(false);
//         }
//     }, [name, icon, server, activeTab]);

//     const handleUpdateServer = async () => {
//         try {
//             const res = await axios.put(`${API_URL}/api/servers/${server._id}`, {
//                 userId: user.id,
//                 name,
//                 icon
//             });
//             onServerUpdated(res.data);
//             setHasChanges(false);
//             // Optional: Add a toast notification here
//         } catch (err) {
//             console.error(err);
//             alert('Failed to update');
//         }
//     };

//     const handleAddCategory = async (e) => {
//         e.preventDefault();
//         if (!newCategory.trim()) return;
//         try {
//             const res = await axios.post(`${API_URL}/api/servers/${server._id}/categories`, {
//                 userId: user.id,
//                 name: newCategory
//             });
//             setCategories(res.data.categories);
//             setNewCategory('');
//             onServerUpdated(res.data);
//         } catch (err) {
//             console.error(err);
//             alert(err.response?.data?.error || 'Failed to add category');
//         }
//     };

//     const handleDeleteCategory = async (categoryName) => {
//         if (!confirm(`Delete category "${categoryName}"? Channels will be moved to General.`)) return;
//         try {
//             const encodedName = encodeURIComponent(categoryName);
//             const res = await axios.delete(`${API_URL}/api/servers/${server._id}/categories/${encodedName}`, {
//                 data: { userId: user.id }
//             });
//             setCategories(res.data.categories);
//             onServerUpdated(res.data);
//         } catch (err) {
//             console.error(err);
//             alert('Failed to delete category');
//         }
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex animate-fade-in-up font-sans overflow-hidden">
//             {/* Backdrop with Blur */}
//             <div
//                 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
//                 onClick={hasChanges ? undefined : onClose}
//             ></div>

//             {/* Main Container */}
//             <div className="relative w-full h-full flex flex-col md:flex-row bg-[#202225] overflow-hidden shadow-2xl z-10">

//                 {/* Sidebar */}
//                 <div className="w-full md:w-[35%] lg:w-[25%] bg-[#2f3136] flex flex-col justify-between pt-12 pb-6 relative overflow-hidden">
//                     {/* Sidebar Content */}
//                     <div className="flex-1 px-4 md:px-6 relative z-10 flex flex-col items-end">
//                         <div className="w-full max-w-[200px] space-y-1">
//                             <h2 className="px-3 text-xs font-black text-gray-400 uppercase mb-4 tracking-wide text-ellipsis overflow-hidden whitespace-nowrap">
//                                 {server.name}
//                             </h2>

//                             <SidebarItem
//                                 label="Overview"
//                                 active={activeTab === 'Overview'}
//                                 onClick={() => setActiveTab('Overview')}
//                             />
//                             <SidebarItem
//                                 label="Categories"
//                                 active={activeTab === 'Categories'}
//                                 onClick={() => setActiveTab('Categories')}
//                             />

//                             <div className="h-[1px] bg-[#40444b] my-3 mx-2"></div>

//                             <div
//                                 onClick={onClose}
//                                 className="group flex items-center justify-between px-3 py-1.5 rounded text-gray-400 hover:bg-red-500/10 hover:text-red-400 cursor-pointer transition-colors"
//                             >
//                                 <span className="font-medium text-[15px]">Log Out</span>
//                                 <LogOut className="w-4 h-4 opacity-50 group-hover:opacity-100" />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Robot Decoration: Body */}
//                     <div className="absolute bottom-0 left-0 pointer-events-none opacity-40 z-0">
//                         <img
//                             src="/botbody.webp"
//                             className="relative w-[16vw] h-[17vw] -right-[2vw] animate-float"
//                             style={{ animationDuration: '6s' }}
//                             alt="Decoration"
//                         />
//                     </div>
//                 </div>

//                 {/* Content Area */}
//                 <div className="flex-1 bg-[#36393f] relative overflow-hidden flex flex-col">
//                     {/* Escape Button */}
//                     <div className="absolute top-8 right-8 z-50 flex flex-col items-center group cursor-pointer" onClick={onClose}>
//                         <div className="w-9 h-9 border-2 border-gray-400 rounded-full flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all group-hover:bg-white/10 group-active:scale-95">
//                             <X className="w-5 h-5 text-gray-200" />
//                         </div>
//                         <span className="text-[11px] font-bold text-gray-400 mt-1 opacity-70 group-hover:opacity-100 transition-opacity">ESC</span>


//                     </div>
//                      {/* Robot Face Interaction */}
//                         <img
//                             src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/662630272724e61320fb7ee2_WUMPUS.webp"
//                             className="absolute right-1 top-24 w-[10vw] h-[10vw]  group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-2 "
//                             alt="Robot Face"
//                         />

//                     {/* Scrollable Content */}
//                     <div className="flex-1 overflow-y-auto p-4 md:p-12 lg:p-16 custom-scrollbar">
//                         <div className="max-w-[700px] pb-24">
//                             <h1 className="text-xl font-bold text-white mb-6">{activeTab}</h1>

//                             {activeTab === 'Overview' && (
//                                 <div className="space-y-8 animate-fade-in-up" key="overview">
//                                     <div className="flex flex-col md:flex-row gap-8">
//                                         {/* Image Upload/Preview Area */}
//                                         <div className="flex flex-col items-center gap-4">
//                                             <div className="group relative w-32 h-32 rounded-full bg-[#202225] flex items-center justify-center overflow-hidden border-4 border-transparent hover:border-gray-600 transition-colors shadow-xl">
//                                                 {icon ? (
//                                                     <img src={icon} className="w-full h-full object-cover" alt="Server Icon" />
//                                                 ) : (
//                                                     <span className="text-4xl text-gray-400 font-medium">{name.substring(0, 2)}</span>
//                                                 )}
//                                                 <div className="absolute inset-0 bg-black/50 flex items-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
//                                                     <span className="text-[10px] font-bold uppercase text-white mt-8 tracking-wide">Change Icon</span>
//                                                 </div>
//                                                 <div className="absolute top-6">
//                                                     <Image className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
//                                                 </div>
//                                             </div>
//                                             <span className="text-xs text-gray-400 font-medium uppercas">Minimum Size: <span className="text-gray-300">128x128</span></span>
//                                         </div>

//                                         {/* Inputs */}
//                                         <div className="flex-1 space-y-6">
//                                             <div className="space-y-2">
//                                                 <label className="text-xs font-bold text-gray-300 uppercase tracking-wide">Server Name</label>
//                                                 <input
//                                                     value={name}
//                                                     onChange={(e) => setName(e.target.value)}
//                                                     className="w-full bg-[#202225] text-white p-2.5 rounded border-none focus:ring-2 focus:ring-[#5865F2] transition-shadow shadow-inner font-medium"
//                                                 />
//                                             </div>

//                                             <div className="space-y-2">
//                                                 <label className="text-xs font-bold text-gray-300 uppercase tracking-wide">Icon URL</label>
//                                                 <div className="flex gap-2">
//                                                     <input
//                                                         value={icon}
//                                                         onChange={(e) => setIcon(e.target.value)}
//                                                         className="flex-1 bg-[#202225] text-white p-2.5 rounded border-none focus:ring-2 focus:ring-[#5865F2] transition-shadow shadow-inner font-mono text-sm"
//                                                         placeholder="https://imgur.com/..."
//                                                     />
//                                                 </div>
//                                                 <p className="text-xs text-gray-400 mt-1">We recommend using a square image.</p>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     <div className="h-[1px] bg-[#42454a] w-full"></div>
//                                 </div>
//                             )}

//                             {activeTab === 'Categories' && (
//                                 <div className="animate-fade-in-up" key="categories">
//                                     <div className="flex gap-2 mb-6">
//                                         <input
//                                             value={newCategory}
//                                             onChange={(e) => setNewCategory(e.target.value)}
//                                             placeholder="Create Category"
//                                             className="flex-1 bg-[#202225] text-white p-2.5 rounded border-none focus:ring-2 focus:ring-[#5865F2] shadow-inner"
//                                             onKeyDown={(e) => e.key === 'Enter' && handleAddCategory(e)}
//                                         />
//                                         <button
//                                             onClick={handleAddCategory}
//                                             disabled={!newCategory.trim()}
//                                             className="bg-[#5865F2] hover:bg-[#4752c4] text-white px-5 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                                         >
//                                             Add
//                                         </button>
//                                     </div>

//                                     <div className="space-y-2">
//                                         {categories.map((cat, i) => (
//                                             <div key={i} className="group flex items-center justify-between bg-[#2f3136] hover:bg-[#34373c] p-3 rounded transition-colors border border-transparent hover:border-[#42454a]">
//                                                 <div className="flex items-center gap-2">
//                                                     <Hash className="w-4 h-4 text-gray-400" />
//                                                     <span className="font-bold text-gray-300 text-sm uppercase tracking-wide">{cat}</span>
//                                                 </div>
//                                                 <button
//                                                     onClick={() => handleDeleteCategory(cat)}
//                                                     className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded transition-all text-gray-400 hover:text-red-400"
//                                                     title="Delete Category"
//                                                 >
//                                                     <Trash2 className="w-4 h-4" />
//                                                 </button>
//                                             </div>
//                                         ))}
//                                         {categories.length === 0 && (
//                                             <div className="text-center py-12 border-2 border-dashed border-[#42454a] rounded-lg">
//                                                 <p className="text-gray-500 text-sm">No categories found. Create one to get started.</p>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Unsaved Changes Bar */}
//                     <div
//                         className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 w-[650px] bg-[#18191c] rounded-lg p-3 px-4 flex items-center justify-between shadow-2xl border border-black/20 transition-all duration-500 ease-out z-50 ${hasChanges ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}
//                     >
//                         <span className="text-white font-medium">Careful - you have unsaved changes!</span>
//                         <div className="flex items-center gap-4">
//                             <button
//                                 onClick={() => {
//                                     setName(server.name);
//                                     setIcon(server.icon || '');
//                                     setHasChanges(false);
//                                 }}
//                                 className="text-gray-300 hover:underline text-sm font-medium"
//                             >
//                                 Reset
//                             </button>
//                             <button
//                                 onClick={handleUpdateServer}
//                                 className="bg-[#248046] hover:bg-[#1a6334] text-white px-6 py-2 rounded-sm font-medium transition-colors shadow-md"
//                             >
//                                 Save Changes
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // Helper Subcomponent for Sidebar Items
// const SidebarItem = ({ label, active, onClick }) => (
//     <div
//         onClick={onClick}
//         className={`px-3 py-1.5 rounded cursor-pointer mb-0.5 transition-colors flex items-center justify-between group ${active
//                 ? 'bg-[#404249] text-white'
//                 : 'text-gray-400 hover:bg-[#35373c] hover:text-gray-200'
//             }`}
//     >
//         <span className={`text-[15px] font-medium ${active ? 'text-white' : ''}`}>{label}</span>
//     </div>
// );





import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import {
    X,
    Save,
    Trash2,
    Hash,
    Shield,
    Image,
    LogOut,
    Upload,
    Sparkles,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const ServerSettingsModal = ({ server, onClose, onServerUpdated }) => {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('Overview');
    const [hasChanges, setHasChanges] = useState(false);

    // Overview State
    const [name, setName] = useState(server.name);
    const [icon, setIcon] = useState(server.icon || '');

    // Category State
    const [newCategory, setNewCategory] = useState('');
    const [categories, setCategories] = useState(server.categories || []);

    useEffect(() => {
        if (activeTab === 'Overview') {
            const isChanged =
                name !== server.name || icon !== (server.icon || '');
            setHasChanges(isChanged);
        } else {
            setHasChanges(false);
        }
    }, [name, icon, server, activeTab]);

    const handleUpdateServer = async () => {
        try {
            const res = await axios.put(`${API_URL}/api/servers/${server._id}`, {
                userId: user.id,
                name,
                icon,
            });
            onServerUpdated(res.data);
            setHasChanges(false);
        } catch (err) {
            console.error(err);
            alert('Failed to update');
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        try {
            const res = await axios.post(
                `${API_URL}/api/servers/${server._id}/categories`,
                {
                    userId: user.id,
                    name: newCategory,
                }
            );
            setCategories(res.data.categories);
            setNewCategory('');
            onServerUpdated(res.data);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to add category');
        }
    };

    const handleDeleteCategory = async (categoryName) => {
        if (
            !confirm(
                `Delete category "${categoryName}"? Channels will be moved to General.`
            )
        )
            return;
        try {
            const encodedName = encodeURIComponent(categoryName);
            const res = await axios.delete(
                `${API_URL}/api/servers/${server._id}/categories/${encodedName}`,
                {
                    data: { userId: user.id },
                }
            );
            setCategories(res.data.categories);
            onServerUpdated(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to delete category');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex font-sans overflow-hidden">
            {/* Animated gradient backdrop */}
            <div
                className="absolute inset-0 bg-[#05060a] bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_55%),radial-gradient(circle_at_bottom,_#a855f7_0,_transparent_55%)] animate-[pulse_12s_ease-in-out_infinite] opacity-80"
                onClick={hasChanges ? undefined : onClose}
            />

            {/* Soft blur overlay */}
            <div className="absolute inset-0 backdrop-blur-[18px]" />

            {/* Main container */}
            <div className="relative mx-auto my-10 w-[95%] max-w-6xl h-[85vh] rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col md:flex-row animate-[modalEnter_420ms_cubic-bezier(0.16,1,0.3,1)]">
                {/* Neon border glow */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl border border-cyan-400/20 shadow-[0_0_40px_rgba(34,211,238,0.28)]" />

                {/* Sidebar */}
                <aside className="relative w-full md:w-[32%] lg:w-[26%] bg-[#05060a]/60 border-r border-white/5 flex flex-col justify-between pt-10 pb-6 overflow-hidden">
                    {/* vertical gradient strip */}
                    <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-cyan-400 via-fuchsia-500 to-amber-300" />

                    {/* glow orbs */}
                    <div className="pointer-events-none absolute -top-32 -left-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute bottom-0 -right-16 h-60 w-60 rounded-full bg-fuchsia-500/15 blur-3xl" />

                    <div className="relative z-10 flex-1 px-6 flex flex-col gap-6">
                        {/* server title + badge */}
                        <div className="space-y-2">
                            <p className="text-[11px] tracking-[0.22em] uppercase text-cyan-400/70 flex items-center gap-2">
                                <Sparkles className="w-3 h-3 text-cyan-300" />
                                Control Center
                            </p>
                            <h2 className="text-sm font-semibold text-gray-100 truncate neon-text">
                                {server.name}
                            </h2>
                            <p className="text-[11px] text-gray-400/80">
                                Tune your server aura, channels and identity with precision.
                            </p>
                        </div>

                        {/* tabs */}
                        <nav className="space-y-1 mt-4">
                            <SidebarItem
                                label="Overview"
                                active={activeTab === 'Overview'}
                                onClick={() => setActiveTab('Overview')}
                            />
                            <SidebarItem
                                label="Categories"
                                active={activeTab === 'Categories'}
                                onClick={() => setActiveTab('Categories')}
                            />
                        </nav>

                        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        {/* tiny status card */}
                        <div className="mt-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 shadow-[0_0_22px_rgba(15,23,42,0.9)]">
                            <p className="text-[11px] uppercase tracking-wide text-gray-400 flex items-center gap-2 mb-1">
                                <Shield className="w-3 h-3 text-emerald-400" />
                                Sync status
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-emerald-300 font-medium">
                                    Live & protected
                                </span>
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300" />
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* logout */}
                    <div className="relative z-10 px-6">
                        <button
                            onClick={onClose}
                            className="group flex w-full items-center justify-between rounded-xl border border-red-500/40 bg-red-500/5 px-3.5 py-2 text-xs font-medium text-red-200 hover:bg-red-500/15 transition"
                        >
                            <span>Exit control room</span>
                            <LogOut className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>

                    {/* robot deco */}
                    <img
                        src="/botbody.webp"
                        alt="Robot"
                        className="pointer-events-none absolute -left-5 bottom-0 w-[15vw] min-w-[140px] max-w-[220px] opacity-80 animate-[float_6s_ease-in-out_infinite]"
                    />
                </aside>

                {/* Content */}
                <section className="relative flex-1 bg-gradient-to-br from-slate-900/80 via-slate-950/80 to-black/90 flex flex-col">
                    {/* Close button block */}
                    <div className="absolute top-6 right-6 flex flex-col items-center gap-1 z-30">
                        <button
                            onClick={onClose}
                            className="group rounded-full border border-white/20 bg-black/50 w-9 h-9 flex items-center justify-center hover:border-white/60 hover:bg-white/5 transition-all active:scale-95 shadow-[0_0_18px_rgba(0,0,0,0.8)]"
                        >
                            <X className="w-5 h-5 text-gray-200 group-hover:text-white" />
                        </button>
                        <span className="text-[10px] font-semibold tracking-[0.18em] text-gray-400">
                            ESC
                        </span>
                    </div>

                    {/* floating head */}
                    <img
                        src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/662630272724e61320fb7ee2_WUMPUS.webp"
                        alt="Character"
                        className="pointer-events-none absolute right-4 top-20 w-[9vw] min-w-[120px] max-w-[160px] opacity-90 animate-[floatSoft_7s_ease-in-out_infinite]"
                    />

                    {/* scrollable content */}
                    <div className="flex-1 overflow-y-auto px-5 md:px-10 lg:px-16 pt-10 pb-24 space-y-6 custom-scrollbar">
                        <header className="flex items-center justify-between gap-4 mb-2">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.23em] text-cyan-400/80">
                                    Server {activeTab.toLowerCase()}
                                </p>
                                <h1 className="text-xl md:text-2xl font-semibold text-white">
                                    {activeTab}
                                </h1>
                            </div>
                            <div className="hidden md:flex items-center gap-2 text-[11px] text-gray-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Live preview updates in real time
                            </div>
                        </header>

                        {/* content glass card */}
                        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_60px_rgba(15,23,42,0.9)] p-6 md:p-8 space-y-8 animate-[fadeSlide_380ms_ease-out]">
                            {activeTab === 'Overview' && (
                                <div className="space-y-8">
                                    <div className="flex flex-col md:flex-row gap-8">
                                        {/* avatar */}
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="group relative w-32 h-32 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center overflow-hidden border border-white/15 shadow-[0_0_40px_rgba(59,130,246,0.35)]">
                                                {icon ? (
                                                    <img
                                                        src={icon}
                                                        alt="Server Icon"
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <span className="text-3xl text-gray-300 font-semibold">
                                                        {name.substring(0, 2)}
                                                    </span>
                                                )}

                                                {/* overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                                    <Image className="w-7 h-7 text-white mb-1" />
                                                    <span className="text-[10px] tracking-[0.18em] uppercase text-white">
                                                        Change icon
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-gray-400 text-center">
                                                Recommended: square image, at least 128×128.
                                            </p>
                                        </div>

                                        {/* inputs */}
                                        <div className="flex-1 space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-semibold text-gray-300 uppercase tracking-[0.23em]">
                                                    Server name
                                                </label>
                                                <input
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full rounded-xl bg-black/50 border border-white/10 text-white text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400/80 focus:border-transparent transition-shadow shadow-inner placeholder:text-gray-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-semibold text-gray-300 uppercase tracking-[0.23em]">
                                                    Icon URL
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        value={icon}
                                                        onChange={(e) => setIcon(e.target.value)}
                                                        placeholder="https://imgur.com/..."
                                                        className="flex-1 rounded-xl bg-black/50 border border-white/10 text-white text-xs md:text-sm px-3 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-fuchsia-500/80 focus:border-transparent transition-shadow placeholder:text-gray-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="hidden sm:flex items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-3 text-[11px] font-medium text-cyan-100 hover:bg-cyan-500/20 transition"
                                                    >
                                                        <Upload className="w-3.5 h-3.5 mr-1" />
                                                        Auto
                                                    </button>
                                                </div>
                                                <p className="text-[11px] text-gray-400">
                                                    Paste a direct image link. Transparent PNGs look
                                                    extra clean.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                                    <div className="grid gap-4 md:grid-cols-3 text-[11px] text-gray-400">
                                        <div>
                                            <p className="uppercase tracking-[0.2em] text-gray-500 mb-1">
                                                Snapshot
                                            </p>
                                            <p className="text-gray-300">
                                                Preview how your identity renders across the network.
                                            </p>
                                        </div>
                                        <div>
                                            <p className="uppercase tracking-[0.2em] text-gray-500 mb-1">
                                                Tip
                                            </p>
                                            <p>
                                                Short, memorable names and sharp icons increase join
                                                rates.
                                            </p>
                                        </div>
                                        <div>
                                            <p className="uppercase tracking-[0.2em] text-gray-500 mb-1">
                                                Theme pulse
                                            </p>
                                            <p>Neon glass mode active. Visual hierarchy optimized.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Categories' && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-semibold text-gray-300 uppercase tracking-[0.23em]">
                                            Create category
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                value={newCategory}
                                                onChange={(e) => setNewCategory(e.target.value)}
                                                placeholder="e.g. LOBBY, RANKED, EVENTS"
                                                onKeyDown={(e) =>
                                                    e.key === 'Enter' && handleAddCategory(e)
                                                }
                                                className="flex-1 rounded-xl bg-black/50 border border-white/10 text-white text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400/80 placeholder:text-gray-500"
                                            />
                                            <button
                                                onClick={handleAddCategory}
                                                disabled={!newCategory.trim()}
                                                className="rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 text-xs font-semibold text-white shadow-[0_0_24px_rgba(59,130,246,0.6)] hover:shadow-[0_0_34px_rgba(244,114,182,0.7)] transition disabled:opacity-40 disabled:shadow-none"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {categories.map((cat, i) => (
                                            <div
                                                key={i}
                                                className="group flex items-center justify-between rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/60 px-3.5 py-2.5 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Hash className="w-4 h-4 text-gray-400 group-hover:text-cyan-300 transition" />
                                                    <span className="text-xs font-semibold text-gray-100 tracking-[0.16em] uppercase">
                                                        {cat}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteCategory(cat)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/25 transition text-gray-400 hover:text-red-300"
                                                    title="Delete Category"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}

                                        {categories.length === 0 && (
                                            <div className="text-center py-10 rounded-2xl border border-dashed border-white/15 bg-black/40">
                                                <p className="text-sm text-gray-400">
                                                    No categories yet. Craft your first channel cluster to
                                                    organize the chaos.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Save bar */}
                    <div
                        className={`absolute left-1/2 bottom-6 -translate-x-1/2 w-[90%] max-w-3xl rounded-2xl border border-white/10 bg-black/70 backdrop-blur-2xl shadow-[0_0_40px_rgba(15,23,42,0.9)] px-4 py-3 flex items-center justify-between text-sm text-white transition-all duration-400 ${hasChanges
                                ? 'translate-y-0 opacity-100'
                                : 'translate-y-10 opacity-0 pointer-events-none'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5 mr-1">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300" />
                            </span>
                            <span className="font-medium text-[13px]">
                                Unsaved changes detected.
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setName(server.name);
                                    setIcon(server.icon || '');
                                    setHasChanges(false);
                                }}
                                className="text-[12px] text-gray-300 hover:text-gray-100 hover:underline"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleUpdateServer}
                                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-1.5 text-[12px] font-semibold text-white shadow-[0_0_24px_rgba(16,185,129,0.8)] hover:bg-emerald-400 transition"
                            >
                                <Save className="w-3.5 h-3.5" />
                                Save changes
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

const SidebarItem = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`relative w-full flex items-center justify-between rounded-xl px-3 py-2 mb-1 text-[13px] font-medium transition-colors ${active
                ? 'bg-white/10 text-white shadow-[0_0_24px_rgba(59,130,246,0.6)]'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-100'
            }`}
    >
        <span>{label}</span>
        {active && (
            <span className="absolute inset-x-3 bottom-1 h-[2px] rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300" />
        )}
    </button>
);
