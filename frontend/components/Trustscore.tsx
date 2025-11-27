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
    <div className="flex items-center space-x-4">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#1e293b"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={`${score * 2.83} 283`}
            strokeLinecap="round"
            className={getColor()}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{score}</span>
        </div>
      </div>
      <div>
        <p className={`text-lg font-semibold ${getColor()}`}>
          {getLabel()}
        </p>
        <p className="text-sm text-slate-400">Trust Score</p>
      </div>
    </div>
  );
}