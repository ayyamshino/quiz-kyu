import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { KyuGrade, KYU_GRADES, Duration, DURATIONS, QuizQuestion, QuizStats } from '../types/kyu';

const KyuQuiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState<Duration>(10);
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(100);
  const [stats, setStats] = useState<QuizStats>({
    totalQuestions: 0,
    correctAnswers: 0,
    streak: 0,
    bestStreak: 0
  });
  
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Generate random wrong answers
  const generateWrongAnswers = useCallback((correctGrade: KyuGrade, questionType: 'kyuToDescription' | 'descriptionToKyu'): string[] => {
    const wrongAnswers: string[] = [];
    const availableGrades = KYU_GRADES.filter(grade => grade.kyu !== correctGrade.kyu);
    
    // Shuffle and take 3 random wrong answers
    const shuffled = [...availableGrades].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < 3 && i < shuffled.length; i++) {
      if (questionType === 'kyuToDescription') {
        wrongAnswers.push(shuffled[i].description);
      } else {
        wrongAnswers.push(shuffled[i].name);
      }
    }
    
    return wrongAnswers;
  }, []);

  // Generate a new question
  const generateQuestion = useCallback((excludeGrade?: KyuGrade | null): QuizQuestion => {
    let availableGrades = KYU_GRADES;
    if (excludeGrade) {
      availableGrades = KYU_GRADES.filter(grade => grade.kyu !== excludeGrade.kyu);
    }
    
    const randomGrade = availableGrades[Math.floor(Math.random() * availableGrades.length)];
    const questionType = Math.random() < 0.5 ? 'kyuToDescription' : 'descriptionToKyu';
    
    let question: string;
    let correctAnswer: string;
    
    if (questionType === 'kyuToDescription') {
      question = `Quelle est la description du ${randomGrade.name} ?`;
      correctAnswer = randomGrade.description;
    } else {
      question = `Quel grade correspond à "${randomGrade.description}" ?`;
      correctAnswer = randomGrade.name;
    }
    
    const wrongAnswers = generateWrongAnswers(randomGrade, questionType);
    const allOptions = [correctAnswer, ...wrongAnswers];
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
    
    return {
      id: `${randomGrade.kyu}-${questionType}-${Date.now()}`,
      type: questionType,
      question,
      correctAnswer,
      options: shuffledOptions,
      correctGrade: randomGrade
    };
  }, [generateWrongAnswers]);

  // Initialize with a random question
  useEffect(() => {
    const initialQuestion = generateQuestion();
    setCurrentQuestion(initialQuestion);
    setTimeLeft(duration);
  }, [generateQuestion, duration]);

  // Countdown timer
  useEffect(() => {
    if (isRunning && timeLeft > 0 && !showResult) {
      countdownRef.current = setTimeout(() => {
        setTimeLeft(prev => {
          const newTime = prev - 0.1;
          setProgress((newTime / duration) * 100);
          return newTime;
        });
      }, 100);
    } else if (timeLeft <= 0 && isRunning && !showResult) {
      // Time's up, show result as incorrect
      setIsCorrect(false);
      setShowResult(true);
      updateStats(false);
    }

    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [isRunning, timeLeft, duration, showResult]);

  const updateStats = (correct: boolean) => {
    setStats(prev => {
      const newStats = {
        totalQuestions: prev.totalQuestions + 1,
        correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
        streak: correct ? prev.streak + 1 : 0,
        bestStreak: correct ? Math.max(prev.bestStreak, prev.streak + 1) : prev.bestStreak
      };
      return newStats;
    });
  };

  const nextQuestion = useCallback(() => {
    const newQuestion = generateQuestion(currentQuestion?.correctGrade);
    setCurrentQuestion(newQuestion);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(duration);
    setProgress(100);
  }, [generateQuestion, currentQuestion?.correctGrade, duration]);

  // Auto-advance to next question after showing result
  useEffect(() => {
    if (showResult && isRunning) {
      const timeout = setTimeout(() => {
        nextQuestion();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [showResult, isRunning, nextQuestion]);

  const handleAnswerSelect = (answer: string) => {
    if (showResult || !currentQuestion) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    updateStats(correct);
    
    if (isRunning) {
      setIsRunning(false);
    }
  };

  const handlePlay = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    nextQuestion();
    setStats({
      totalQuestions: 0,
      correctAnswers: 0,
      streak: 0,
      bestStreak: 0
    });
  };

  const handleDurationChange = (newDuration: Duration) => {
    setIsRunning(false);
    setDuration(newDuration);
    setTimeLeft(newDuration);
    setProgress(100);
  };

  const BeltCircle: React.FC<{ grade: KyuGrade; size?: 'small' | 'large' }> = ({ grade, size = 'small' }) => {
    const sizeClasses = size === 'large' ? 'w-12 h-12' : 'w-6 h-6';
    
    return (
      <div className={`${sizeClasses} relative rounded-full border-2 border-gray-800 shadow-lg`}>
        <div 
          className="w-full h-full rounded-full"
          style={{ backgroundColor: grade.color }}
        />
        {grade.hasStripe && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-0.5 bg-white rounded-full shadow-md" />
        )}
      </div>
    );
  };

  const getAccuracyPercentage = () => {
    return stats.totalQuestions > 0 ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 flex items-center justify-center p-4">
      <div className="glassmorphism rounded-3xl p-8 max-w-lg w-full shadow-2xl">
        {/* Title */}
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Quiz des Kyu
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{getAccuracyPercentage()}%</div>
            <div className="text-white/70 text-sm">Précision</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.streak}</div>
            <div className="text-white/70 text-sm">Série</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Trophy size={16} className="text-yellow-400" />
              <span className="text-2xl font-bold text-white">{stats.bestStreak}</span>
            </div>
            <div className="text-white/70 text-sm">Record</div>
          </div>
        </div>

        {/* Progress Bar */}
        {isRunning && (
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
        )}

        {/* Question */}
        {currentQuestion && (
          <div className="mb-6">
            <div className="bg-white/10 rounded-2xl p-6 mb-4">
              <h2 className="text-xl font-semibold text-white text-center mb-4">
                {currentQuestion.question}
              </h2>
              
              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  let buttonClass = "w-full p-4 rounded-xl font-semibold transition-all text-left ";
                  
                  if (showResult) {
                    if (option === currentQuestion.correctAnswer) {
                      buttonClass += "bg-green-500 text-white shadow-lg";
                    } else if (option === selectedAnswer && !isCorrect) {
                      buttonClass += "bg-red-500 text-white shadow-lg";
                    } else {
                      buttonClass += "bg-white/20 text-white/60";
                    }
                  } else {
                    buttonClass += "bg-white/20 text-white hover:bg-white/30 hover:scale-105 cursor-pointer";
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={showResult}
                      className={buttonClass}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {showResult && option === currentQuestion.correctAnswer && (
                          <CheckCircle size={20} className="text-white" />
                        )}
                        {showResult && option === selectedAnswer && !isCorrect && (
                          <XCircle size={20} className="text-white" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Result Feedback */}
            {showResult && (
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <BeltCircle grade={currentQuestion.correctGrade} />
                  <div className="text-left">
                    <p className="text-white font-semibold">{currentQuestion.correctGrade.name}</p>
                    <p className="text-white/80 text-sm">{currentQuestion.correctGrade.description}</p>
                  </div>
                </div>
                {isCorrect ? (
                  <p className="text-green-400 font-semibold">✓ Bonne réponse !</p>
                ) : (
                  <p className="text-red-400 font-semibold">✗ Mauvaise réponse</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Duration Selector */}
        <div className="mb-6">
          <p className="text-white text-center mb-3">Mode chronométré :</p>
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
          {!showResult && (
            <>
              {!isRunning ? (
                <button
                  onClick={handlePlay}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg"
                >
                  <Play size={20} />
                  Chrono
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
            </>
          )}
          
          <button
            onClick={nextQuestion}
            disabled={isRunning && !showResult}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg ${
              isRunning && !showResult 
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105'
            }`}
          >
            Suivant
          </button>
          
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

export default KyuQuiz;
