export default function StarRating({ score }: { score: number }) {
  // score를 0~10 사이로 제한하고, 별 5개 기준으로 채움 정도 계산
  const percentage = (Math.max(0, Math.min(10, score)) / 10) * 100;

    return (
        <div className="flex items-center gap-2">
            <div className="relative text-gray-300 text-xl">
        
                <span>★★★★★</span>
            <div 
            className="absolute top-0 left-0 overflow-hidden text-yellow-500 whitespace-nowrap"
            style={{ width: `${percentage}%` }}
        >
            <span>★★★★★</span>
        </div>
        </div>
            <span className="font-bold text-lg">{score.toFixed(1)}</span>
        </div>
    );
}