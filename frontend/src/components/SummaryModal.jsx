import { useState } from 'react';
import { X, Loader } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const SummaryModal = ({ isOpen, onClose, channelId, serverId, userId }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('1day');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const periodOptions = [
    { value: '1day', label: 'Last 24 Hours', icon: '📅' },
    { value: '3days', label: 'Last 3 Days', icon: '📊' },
    { value: '7days', label: 'Last 7 Days', icon: '📈' },
  ];

  const handleRequestSummary = async () => {
    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/summary-reminder/summary/request`,
        {
          userId,
          serverId,
          channelId,
          period: selectedPeriod,
        }
      );

      if (response.data.success) {
        setSummary(response.data.summary);
      } else {
        setError(response.data.error || 'Failed to generate summary');
      }
    } catch (err) {
      console.error('Error generating summary:', err);
      setError(err.response?.data?.error || 'Error generating summary');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-700 px-6 py-4 flex justify-between items-center border-b border-slate-600">
          <h2 className="text-xl font-bold text-white">📝 Chat Summary</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!summary ? (
            <div className="space-y-6">
              {/* Period Selection */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Select Time Period
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {periodOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedPeriod(option.value)}
                      className={`p-4 rounded-lg border-2 transition ${
                        selectedPeriod === option.value
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="font-semibold">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg">
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleRequestSummary}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold px-8 py-3 rounded-lg transition flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>✨ Generate Summary</>
                  )}
                </button>
              </div>

              {/* Info */}
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-sm text-slate-300">
                <p className="font-semibold text-white mb-2">💡 How it works:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>AI analyzes all messages in the selected period</li>
                  <li>Extracts key topics and highlights</li>
                  <li>Detects overall sentiment</li>
                  <li>Shows engagement metrics</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Back Button */}
              <button
                onClick={() => setSummary(null)}
                className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition"
              >
                ← Generate Another Summary
              </button>

              {/* Summary Content */}
              <div className="space-y-6">
                {/* Key Topics */}
                {summary.summaryContent?.keyTopics?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">
                      📌 Key Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {summary.summaryContent.keyTopics.map((topic, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-600/50"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Highlights */}
                {summary.summaryContent?.highlights?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">
                      ⭐ Highlights
                    </h3>
                    <div className="space-y-2">
                      {summary.summaryContent.highlights.map((highlight, idx) => (
                        <div
                          key={idx}
                          className="bg-yellow-600/10 border-l-4 border-yellow-500 p-3 rounded text-slate-200"
                        >
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Discussion */}
                {summary.summaryContent?.mainDiscussions && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">
                      💬 Main Discussion
                    </h3>
                    <p className="text-slate-300 leading-relaxed bg-slate-700/30 p-4 rounded-lg">
                      {summary.summaryContent.mainDiscussions}
                    </p>
                  </div>
                )}

                {/* Engagement Metrics */}
                {summary.summaryContent?.engagement && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">
                      📊 Engagement Metrics
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-slate-700 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400">
                          {summary.summaryContent.engagement.messageCount}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Total Messages
                        </div>
                      </div>
                      <div className="bg-slate-700 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">
                          {summary.summaryContent.engagement.participantsCount}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Participants
                        </div>
                      </div>
                      <div className="bg-slate-700 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-400">
                          {summary.summaryContent.engagement.channelsActive?.length || 0}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Channels Active
                        </div>
                      </div>
                      <div className="bg-slate-700 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-orange-400">
                          {Math.round(summary.metadata.processingTime / 1000)}s
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Processing Time
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sentiment */}
                {summary.summaryContent?.sentiment && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">
                      😊 Overall Sentiment
                    </h3>
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-4 py-2 rounded-lg font-semibold text-white ${
                          summary.summaryContent.sentiment.overall === 'positive'
                            ? 'bg-green-600'
                            : summary.summaryContent.sentiment.overall === 'negative'
                            ? 'bg-red-600'
                            : 'bg-yellow-600'
                        }`}
                      >
                        {summary.summaryContent.sentiment.overall === 'positive' && '😊'}
                        {summary.summaryContent.sentiment.overall === 'negative' && '😞'}
                        {summary.summaryContent.sentiment.overall === 'neutral' && '😐'}
                        {` ${summary.summaryContent.sentiment.overall.toUpperCase()}`}
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary Meta */}
                <div className="text-xs text-slate-400 bg-slate-700/30 p-3 rounded">
                  Generated on{' '}
                  {new Date(summary.createdAt).toLocaleString()}
                  {summary.cached && ' (Cached)'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryModal;
