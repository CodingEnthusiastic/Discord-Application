import { AlertTriangle, Flag, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export const ModerationIndicator = ({ moderation, compact = false }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!moderation || !moderation.analyzed) {
    return null;
  }

  const { 
    severity, 
    type, 
    reason, 
    flagged, 
    warned, 
    blocked,
    confidence,
    action 
  } = moderation;

  // Map action to icon and colors
  const getActionStyle = (action) => {
    const styles = {
      block: {
        icon: AlertTriangle,
        bg: 'bg-red-900/20',
        border: 'border-red-500/30',
        text: 'text-red-200',
        badge: 'bg-red-600',
        badgeText: 'text-red-100',
        label: 'Blocked',
        iconColor: 'text-red-500'
      },
      warn: {
        icon: AlertCircle,
        bg: 'bg-orange-900/20',
        border: 'border-orange-500/30',
        text: 'text-orange-200',
        badge: 'bg-orange-600',
        badgeText: 'text-orange-100',
        label: 'Warning',
        iconColor: 'text-orange-500'
      },
      flag: {
        icon: Flag,
        bg: 'bg-yellow-900/20',
        border: 'border-yellow-500/30',
        text: 'text-yellow-200',
        badge: 'bg-yellow-600',
        badgeText: 'text-yellow-100',
        label: 'Flagged',
        iconColor: 'text-yellow-500'
      },
      allow: {
        icon: CheckCircle,
        bg: 'bg-green-900/10',
        border: 'border-green-500/20',
        text: 'text-green-300',
        badge: 'bg-green-600',
        badgeText: 'text-green-100',
        label: 'Approved',
        iconColor: 'text-green-400'
      }
    };
    return styles[action] || styles.allow;
  };

  const style = getActionStyle(action || 'allow');
  const Icon = style.icon;

  if (blocked) {
    return (
      <div className={`${style.bg} border ${style.border} rounded px-3 py-2 my-2 flex items-start gap-2`}>
        <Icon className={`w-5 h-5 ${style.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="text-sm flex-1">
          <p className={`font-semibold ${style.text}`}>🚫 Message Blocked</p>
          <p className="text-xs text-red-300 mt-1">{reason}</p>
          <div className="text-xs text-red-400 mt-1">
            <span>Type: {type} • Confidence: {Math.round(confidence * 100)}%</span>
          </div>
        </div>
      </div>
    );
  }

  if (flagged) {
    return (
      <div className={`${style.bg} border ${style.border} rounded px-3 py-2 my-2 flex items-start gap-2 cursor-pointer`}
           onClick={() => setShowDetails(!showDetails)}>
        <Icon className={`w-5 h-5 ${style.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="text-sm flex-1">
          <p className={`font-semibold ${style.text}`}>🚩 Flagged for Moderator Review</p>
          {!compact && (
            <>
              <p className="text-xs text-yellow-300 mt-1">{reason}</p>
              <div className="text-xs text-yellow-400 mt-1">
                <span>Type: {type} • Severity: {severity}</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (warned) {
    return (
      <div className={`${style.bg} border ${style.border} rounded px-3 py-2 my-2 flex items-start gap-2`}>
        <Icon className={`w-5 h-5 ${style.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="text-sm flex-1">
          <p className={`font-semibold ${style.text}`}>⚠️ Community Guidelines Warning</p>
          <p className="text-xs text-orange-300 mt-1">{reason}</p>
          <div className="text-xs text-orange-400 mt-1">
            <span>Type: {type}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};


