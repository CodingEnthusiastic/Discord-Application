import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { ChromePicker } from 'react-color';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const UserSettingsModal = ({ onClose, currentThemeColor, onThemeChange }) => {
    const { user } = useUser();
    const [color, setColor] = useState(currentThemeColor || '#5865F2');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axios.put(`${API_URL}/api/users/${user.id}/preferences`, {
                themeColor: color
            });
            onThemeChange(color);
            onClose();
        } catch (err) {
            console.error("Failed to save preference", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-[#1e1f22]/90 backdrop-blur-2xl text-white rounded-2xl w-[500px] p-6 relative shadow-2xl border border-white/10">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-xl font-bold mb-6">User Settings</h2>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-gray-300 uppercase mb-3">Theme Color</h3>
                        <p className="text-xs text-gray-400 mb-4">Customize the glow color of your app.</p>

                        <div className="flex justify-center bg-black/20 p-4 rounded-xl border border-white/5">
                            <ChromePicker
                                color={color}
                                onChange={(c) => setColor(c.hex)}
                                disableAlpha={true}
                                styles={{
                                    default: {
                                        picker: {
                                            background: '#2b2d31',
                                            borderRadius: '12px',
                                            boxShadow: 'none',
                                            width: '100%'
                                        },
                                        body: {
                                            background: '#2b2d31',
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-[#5865F2] hover:bg-[#4752c4] text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-indigo-500/20 transition-all flex items-center"
                        >
                            {isSaving ? 'Saving...' : <><Check className="w-4 h-4 mr-2" /> Save Changes</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
