import React, { useEffect, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, Trash2, MessageSquare, TrendingUp } from 'lucide-react';
import axios from 'axios';

/**
 * ModPanel Component
 * Admin dashboard for managing moderated messages and viewing statistics
 */
export default function ModPanel({ serverId, onClose }) {
  const [activeTab, setActiveTab] = useState('flagged');
  const [flaggedMessages, setFlaggedMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [resolveAction, setResolveAction] = useState('approve');
  const [resolveNotes, setResolveNotes] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch flagged messages
      const messagesRes = await axios.get('/api/automod/flagged-messages', {
        params: { serverId, limit: 50 }
      });
      setFlaggedMessages(messagesRes.data.messages || []);

      // Fetch statistics
      const statsRes = await axios.get('/api/automod/stats', {
        params: { serverId, timeWindow: 24 }
      });
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching moderation data:', err);
      setError('Failed to load moderation data');
    } finally {
      setLoading(false);
    }
  }, [serverId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResolveMessage = async (messageId) => {
    try {
      await axios.post(`/api/automod/resolve-message/${messageId}`, {
        action: resolveAction,
        notes: resolveNotes
      });

      setFlaggedMessages(prev => prev.filter(m => m._id !== messageId));
      setSelectedMessage(null);
      setResolveNotes('');
    } catch (err) {
      console.error('Error resolving message:', err);
      setError('Failed to resolve message');
    }
  };

  const severityColors = {
    none: 'bg-gray-100 text-gray-700',
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-orange-100 text-orange-700',
    high: 'bg-red-100 text-red-700',
    critical: 'bg-red-200 text-red-800'
  };

  const typeEmojis = {
    harassment: '😠',
    hate_speech: '🚫',
    violence: '⚔️',
    spam: '🤖',
    nsfw: '🔞',
    misinformation: '❌',
    none: '✅'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertCircle size={28} />
            AutoMod Dashboard
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-gray-100 border-b flex gap-4 px-6 pt-4">
          <button
            onClick={() => setActiveTab('flagged')}
            className={`pb-3 px-4 font-semibold border-b-2 transition ${
              activeTab === 'flagged'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageSquare size={18} className="inline mr-2" />
            Flagged Messages ({flaggedMessages.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-3 px-4 font-semibold border-b-2 transition ${
              activeTab === 'stats'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp size={18} className="inline mr-2" />
            Statistics
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading moderation data...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!loading && activeTab === 'flagged' && (
            <div className="space-y-4">
              {flaggedMessages.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
                  <p className="text-gray-600 text-lg">No flagged messages</p>
                </div>
              ) : (
                flaggedMessages.map(msg => (
                  <div
                    key={msg._id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => setSelectedMessage(msg)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{msg.senderName}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${severityColors[msg.moderation?.severity]}`}>
                            {msg.moderation?.severity?.toUpperCase() || 'UNKNOWN'}
                          </span>
                          <span className="text-lg">
                            {typeEmojis[msg.moderation?.type] || '❓'}
                          </span>
                        </div>
                        <p className="text-gray-700 break-words mb-2">{msg.content}</p>
                        <p className="text-sm text-gray-500">
                          {msg.moderation?.reason || 'No reason provided'}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs font-semibold text-gray-600">
                          Confidence: {Math.round((msg.moderation?.confidence || 0) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {!loading && activeTab === 'stats' && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.totalAnalyzed}</div>
                <div className="text-sm text-gray-600">Messages Analyzed</div>
                <div className="text-xs text-gray-500 mt-2">{stats.timeWindow}</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
                <div className="text-sm text-gray-600">Blocked</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">{stats.warned}</div>
                <div className="text-sm text-gray-600">Warned</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">{stats.flagged}</div>
                <div className="text-sm text-gray-600">Flagged</div>
              </div>

              {/* Severity Breakdown */}
              <div className="col-span-full bg-gray-50 border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Severity Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(stats.severity || {}).map(([severity, count]) => (
                    <div key={severity}>
                      <div className="text-lg font-bold">{count}</div>
                      <div className="text-xs text-gray-600 capitalize">{severity}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected Message Detail */}
        {selectedMessage && (
          <div className="bg-gray-50 border-t p-6 space-y-4">
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-bold mb-2">Message Details</h3>
              <p className="text-sm text-gray-700 mb-3 break-words">{selectedMessage.content}</p>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="font-semibold text-gray-600">Sender:</span> {selectedMessage.senderName}
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Type:</span> {selectedMessage.moderation?.type}
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Reason:</span> {selectedMessage.moderation?.reason}
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Confidence:</span>{' '}
                  {Math.round((selectedMessage.moderation?.confidence || 0) * 100)}%
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Action</label>
                  <select
                    value={resolveAction}
                    onChange={e => setResolveAction(e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm"
                  >
                    <option value="approve">✅ Approve (Remove Flag)</option>
                    <option value="block">🚫 Block (Confirm Block)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Moderator Notes</label>
                  <textarea
                    value={resolveNotes}
                    onChange={e => setResolveNotes(e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm"
                    rows="2"
                    placeholder="Add notes for the moderation action..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleResolveMessage(selectedMessage._id)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
