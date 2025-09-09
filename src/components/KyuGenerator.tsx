import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { KyuGrade, KYU_GRADES, Duration, DURATIONS } from '../types/kyu';

const KyuGenerator: React.FC = () => {
  const [currentGrade, setCurrentGrade] = useState<KyuGrade | null>(null);
  const [previousGrade, setPreviousGrade] = useState<KyuGrade | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState<Duration>(10);
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(100);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Generate a random grade that's different from the current one
  const generateRandomGrade = useCallback((excludeGrade?: KyuGrade | null): KyuGrade => {
    let availableGrades = KYU_GRADES;
    if (excludeGrade) {
      availableGrades = KYU_GRADES.filter(grade => grade.kyu !== excludeGrade.kyu);
    }
    const randomIndex = Math.floor(Math.random() * availableGrades.length);
    return availableGrades[randomIndex];
  }, []);

  // Initialize with a random grade
  useEffect(() => {
    const initialGrade = generateRandomGrade();
    setCurrentGrade(initialGrade);
    setTimeLeft(duration);
  }, [generateRandomGrade, duration]);

  // Countdown timer
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      countdownRef.current = setTimeout(() => {
        setTimeLeft(prev => {
          const newTime = prev - 0.1;
          setProgress((newTime / duration) * 100);
          return newTime;
        });
      }, 100);
    } else if (timeLeft <= 0 && isRunning) {
      // Time's up, generate new grade
      const newGrade = generateRandomGrade(currentGrade);
      setPreviousGrade(currentGrade);
      setCurrentGrade(newGrade);
      setTimeLeft(duration);
      setProgress(100);
    }

    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [isRunning, timeLeft, duration, currentGrade, generateRandomGrade]);

  const handlePlay = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    const newGrade = generateRandomGrade(currentGrade);
    setPreviousGrade(currentGrade);
    setCurrentGrade(newGrade);
    setTimeLeft(duration);
    setProgress(100);
  };

  const handleDurationChange = (newDuration: Duration) => {
    setIsRunning(false);
    setDuration(newDuration);
    setTimeLeft(newDuration);
    setProgress(100);
  };

  const BeltCircle: React.FC<{ grade: KyuGrade; size?: 'small' | 'large' }> = ({ grade, size = 'large' }) => {
    const sizeClasses = size === 'large' ? 'w-16 h-16' : 'w-8 h-8';
    
    return (
      <div className={`${sizeClasses} relative rounded-full border-4 border-gray-800 shadow-lg`}>
        <div 
          className="w-full h-full rounded-full"
          style={{ backgroundColor: grade.color }}
        />
        {grade.hasStripe && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-1 bg-white rounded-full shadow-md" />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 flex items-center justify-center p-4">
      <div className="glassmorphism rounded-3xl p-8 max-w-md w-full shadow-2xl">
        {/* Title */}
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Générateur de Kyu
        </h1>

        {/* Previous Grade */}
        {previousGrade && (
          <div className="text-center mb-6 opacity-75">
            <p className="text-sm text-white/80 mb-2">Grade précédent :</p>
            <div className="flex items-center justify-center gap-3">
              <BeltCircle grade={previousGrade} size="small" />
              <div className="text-left">
                <p className="text-white font-semibold">{previousGrade.name}</p>
                <p className="text-white/70 text-sm">{previousGrade.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Grade */}
        {currentGrade && (
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <BeltCircle grade={currentGrade} />
              <div className="text-left">
                <p className="text-2xl font-bold text-white">{currentGrade.name}</p>
                <p className="text-white/90">{currentGrade.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-100 ease-linear rounded-full"
              style={{ width: `${Math.max(0, progress)}%` }}
            />
          </div>
          <p className="text-center text-white/80 text-sm mt-2">
            {timeLeft > 0 ? `${timeLeft.toFixed(1)}s` : '0.0s'}
          </p>
        </div>

        {/* Duration Selector */}
        <div className="mb-6">
          <p className="text-white text-center mb-3">Durée :</p>
          <div className="flex gap-2 justify-center">
            {DURATIONS.map((dur) => (
              <button
                key={dur}
                onClick={() => handleDurationChange(dur)}
                disabled={isRunning}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  duration === dur
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                } ${isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              >
                {dur}s
              </button>
            ))}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4 justify-center">
          {!isRunning ? (
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg"
            >
              <Play size={20} />
              Play
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg"
            >
              <Pause size={20} />
              Pause
            </button>
          )}
          
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg"
          >
            <RotateCcw size={20} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default KyuGenerator;
