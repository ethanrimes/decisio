'use client'

import { UnderstandingMeterProps } from '@/types'

export function UnderstandingMeter({ level, className = "" }: UnderstandingMeterProps) {
  // Validate and clamp the level between 0 and 4
  const validLevel = Math.max(0, Math.min(4, level));

  // Define colors and widths for each level
  const getColorAndWidth = (level: number) => {
    switch (level) {
      case 0:
        return { color: 'bg-gray-200', width: 'w-0' };
      case 1:
        return { color: 'bg-red-500', width: 'w-1/4' };
      case 2:
        return { color: 'bg-orange-500', width: 'w-2/4' };
      case 3:
        return { color: 'bg-yellow-500', width: 'w-3/4' };
      case 4:
        return { color: 'bg-green-500', width: 'w-full' };
      default:
        return { color: 'bg-gray-200', width: 'w-0' };
    }
  };

  const { color, width } = getColorAndWidth(validLevel);

  return (
    <div className={`flex items-center ${className}`}>
      {/* Container for the meter */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden w-32"> {/* Adjust width here */}
        {/* Progress bar with smooth transition */}
        <div 
          className={`h-full ${color} ${width} transition-all duration-500 ease-in-out`}
          role="progressbar"
          aria-valuenow={validLevel}
          aria-valuemin={0}
          aria-valuemax={4}
        />
      </div>
      
      {/* Optional: Understanding level label */}
      <div className="text-xs text-gray-500 ml-2"> {/* Added margin-left for spacing */}
        {validLevel === 0 && "No Understanding"}
        {validLevel === 1 && "Basic Understanding"}
        {validLevel === 2 && "Moderate Understanding"}
        {validLevel === 3 && "Good Understanding"}
        {validLevel === 4 && "Complete Understanding"}
      </div>
    </div>
  );
} 