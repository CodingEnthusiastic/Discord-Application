import React, { useState } from 'react';
import { Settings, Save, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * ModSettings Component
 * Allows server admins to configure AutoMod AI policies and thresholds
 */
export default function ModSettings({ serverId, onClose, onSave }) {
  const [settings, setSettings] = useState({
    blockThreshold: 0.7,
    warnThreshold: 0.5,
    enableAutoBlock: true,
    enableAutoWarn: true,
    enableAutoFlag: true,
    flagForReview: true,
    notifyModerators: true,
    logActivity: true,
    aiModel: 'gemini-1.5-flash',
    contextWindowSize: 5,
    policyDescription: 'Standard community guidelines enforcement'
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Call onSave callback or make API call
      if (onSave) {
        await onSave(serverId, settings);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings size={28} />
            AutoMod Settings
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-1">AI-Powered Moderation</p>
              <p>These settings control how the AutoMod AI analyzes messages. Higher thresholds = stricter moderation.</p>
            </div>
          </div>

          {/* Thresholds Section */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="font-bold text-lg">Moderation Thresholds</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Block Threshold: {Math.round(settings.blockThreshold * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.blockThreshold}
                onChange={e => handleChange('blockThreshold', parseFloat(e.target.value))}
                className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">
                Confidence level required to automatically block a message. Lower = more aggressive blocking.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Warning Threshold: {Math.round(settings.warnThreshold * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.warnThreshold}
                onChange={e => handleChange('warnThreshold', parseFloat(e.target.value))}
                className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">
                Confidence level required to warn a user. Messages above block threshold are blocked instead.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Context Window: {settings.contextWindowSize} messages
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={settings.contextWindowSize}
                onChange={e => handleChange('contextWindowSize', parseInt(e.target.value))}
                className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of previous messages to consider for context. Higher = better context understanding but slower.
              </p>
            </div>
          </div>

          {/* Actions Section */}
          <div className="space-y-3 border-b pb-6">
            <h3 className="font-bold text-lg">Moderation Actions</h3>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableAutoBlock}
                onChange={e => handleChange('enableAutoBlock', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-semibold text-gray-700">Enable Auto-Block</span>
              <span className="text-xs text-red-600">🚫</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableAutoWarn}
                onChange={e => handleChange('enableAutoWarn', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-semibold text-gray-700">Enable Auto-Warn</span>
              <span className="text-xs text-orange-600">⚠️</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableAutoFlag}
                onChange={e => handleChange('enableAutoFlag', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-semibold text-gray-700">Enable Auto-Flag</span>
              <span className="text-xs text-yellow-600">🚩</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.flagForReview}
                onChange={e => handleChange('flagForReview', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-semibold text-gray-700">Flag Uncertain Messages for Review</span>
            </label>
          </div>

          {/* Notifications Section */}
          <div className="space-y-3 border-b pb-6">
            <h3 className="font-bold text-lg">Notifications & Logging</h3>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifyModerators}
                onChange={e => handleChange('notifyModerators', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-semibold text-gray-700">Notify Moderators of Flagged Messages</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.logActivity}
                onChange={e => handleChange('logActivity', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-semibold text-gray-700">Log All Moderation Activity</span>
            </label>
          </div>

          {/* Policy Description */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg">Server Policy</h3>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Policy Description</label>
            <textarea
              value={settings.policyDescription}
              onChange={e => handleChange('policyDescription', e.target.value)}
              className="w-full border rounded-lg p-3 text-sm"
              rows="3"
              placeholder="Describe your server's moderation policy and guidelines..."
            />
            <p className="text-xs text-gray-500">
              This policy is used to provide context to the AI model when analyzing messages.
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">AI Model</label>
            <select
              value={settings.aiModel}
              onChange={e => handleChange('aiModel', e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast, Recommended)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Faster)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (More Accurate)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Flash models are faster and cheaper. Pro models are more accurate but slower.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 border-t p-4 flex gap-3 items-center justify-end">
          {saved && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
              <CheckCircle size={18} />
              Settings saved successfully
            </div>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 font-semibold border rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
