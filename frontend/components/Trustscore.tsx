interface TrustScoreProps {
  score: number;
}

export function TrustScore({ score }: TrustScoreProps) {
  const getColor = () => {
    if (score >= 90) return 'text-success-500';
    if (score >= 75) return 'text-warning-500';
    return 'text-danger-500';
  };

  const getLabel = () => {
    if (score >= 90) return 'High Confidence';
    if (score >= 75) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="flex items-center space-x-6">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#1e293b"
            strokeWidth="10"
          />
          {/* Gradient Stroke */}
          <defs>
            <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={score >= 90 ? 'url(#trustGradient)' : undefined}
            strokeWidth="10"
            strokeDasharray={`${score * 2.83} 283`}
            strokeLinecap="round"
            className={score < 90 ? getColor() : ''}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{score}</span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
      </div>
      <div className="space-y-1">
        <p className={`text-lg font-semibold ${getColor()}`}>{getLabel()}</p>
        <p className="text-sm text-slate-400">Trust Score</p>
      </div>
    </div>
  );
}
