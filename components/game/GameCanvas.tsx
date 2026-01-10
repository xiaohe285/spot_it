'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { LevelWithCategory } from '@/lib/levels';
import { soundEffects } from '@/utils/soundEffects';

export interface GameStats {
    score: number;
    timeElapsed: number;
    totalClicks: number;
    wrongClicks: number;
    accuracy: number;
    hintsUsed: number;
    maxCombo: number;
}

interface HeaderStats {
    progress: number;
    timeElapsed: number;
    combo: number;
    hintsUsed: number;
    maxHints: number;
    onHint: () => void;
    onSOS: () => void;
}

interface GameCanvasProps {
    level: LevelWithCategory;
    onComplete: (stats: GameStats) => void;
    maxHints?: number;
    onHeaderUpdate?: (stats: HeaderStats) => void;
}

export default function GameCanvas({ level, onComplete, maxHints = 3, onHeaderUpdate }: GameCanvasProps) {
    // Calculate max hints: should not be >= number of differences
    const actualMaxHints = Math.min(maxHints, level.differences.length - 1);

    const [foundDifferences, setFoundDifferences] = useState<number[]>([]);
    const [wrongClicks, setWrongClicks] = useState<{ x: number; y: number }[]>([]);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [totalClicks, setTotalClicks] = useState(0);
    const [wrongClickCount, setWrongClickCount] = useState(0);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [hintRegions, setHintRegions] = useState<number[]>([]);
    const [comboAnimation, setComboAnimation] = useState(false);
    const [scorePopups, setScorePopups] = useState<{ id: number; score: number; x: number; y: number }[]>([]);
    const [showHelpModal, setShowHelpModal] = useState(false);

    const imageRef = useRef<HTMLImageElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const popupIdRef = useRef(0);

    // Timer
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeElapsed((prev) => prev + 1);
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Handle window resize
    useEffect(() => {
        const updateSize = () => {
            if (imageRef.current) {
                setImageSize({
                    width: imageRef.current.offsetWidth,
                    height: imageRef.current.offsetHeight,
                });
            }
        };

        window.addEventListener('resize', updateSize);
        updateSize();

        const img = imageRef.current;
        if (img && img.complete) {
            updateSize();
        } else if (img) {
            img.onload = updateSize;
        }

        return () => window.removeEventListener('resize', updateSize);
    }, [level]);

    // Combo animation effect
    useEffect(() => {
        if (combo > 1) {
            setComboAnimation(true);
            const timer = setTimeout(() => setComboAnimation(false), 500);
            return () => clearTimeout(timer);
        }
    }, [combo]);

    // Update header stats
    useEffect(() => {
        if (onHeaderUpdate) {
            const progress = (foundDifferences.length / level.differences.length) * 100;
            onHeaderUpdate({
                progress,
                timeElapsed,
                combo,
                hintsUsed,
                maxHints: actualMaxHints,
                onHint: handleHint,
                onSOS: handleAskForHelp,
            });
        }
    }, [foundDifferences.length, timeElapsed, combo, hintsUsed, level.differences.length, actualMaxHints, onHeaderUpdate]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const showScorePopup = (score: number, x: number, y: number) => {
        const id = popupIdRef.current++;
        setScorePopups((prev) => [...prev, { id, score, x, y }]);
        setTimeout(() => {
            setScorePopups((prev) => prev.filter((p) => p.id !== id));
        }, 1000);
    };

    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>, imageIndex: number) => {
        if (foundDifferences.length === level.differences.length) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setTotalClicks((prev) => prev + 1);

        // Check if click hits a difference
        const hitIndex = level.differences.findIndex((diff, index) => {
            if (foundDifferences.includes(index)) return false;
            const dx = diff.x - x;
            const dy = diff.y - y;
            return (dx * dx + dy * dy) < (diff.radius * diff.radius);
        });

        if (hitIndex !== -1) {
            // Success!
            const newFound = [...foundDifferences, hitIndex];
            const newCombo = combo + 1;

            setFoundDifferences(newFound);
            setCombo(newCombo);
            setMaxCombo((prev) => Math.max(prev, newCombo));

            // Calculate score for this difference
            const baseScore = 200;
            const comboBonus = (newCombo - 1) * 50;
            const diffScore = baseScore + comboBonus;

            showScorePopup(diffScore, x, y);

            // Play sounds
            soundEffects.playSuccess();
            if (newCombo > 1) {
                soundEffects.playCombo(newCombo);
            }

            // Check if game complete
            if (newFound.length === level.differences.length) {
                if (timerRef.current) clearInterval(timerRef.current);

                const baseScore = 1000;
                const timeBonus = Math.max(0, 300 - timeElapsed);
                const accuracyBonus = Math.floor((newFound.length / (totalClicks + 1)) * 500);
                const comboBonus = maxCombo * 50;
                const hintPenalty = hintsUsed * 100;

                const finalScore = baseScore + timeBonus + accuracyBonus + comboBonus - hintPenalty;
                const accuracy = ((newFound.length / (totalClicks + 1)) * 100);

                soundEffects.playComplete();

                setTimeout(() => {
                    onComplete({
                        score: Math.max(0, finalScore),
                        timeElapsed,
                        totalClicks: totalClicks + 1,
                        wrongClicks: wrongClickCount,
                        accuracy,
                        hintsUsed,
                        maxCombo: Math.max(maxCombo, newCombo),
                    });
                }, 500);
            }
        } else {
            // Wrong click
            setCombo(0); // Reset combo
            setWrongClickCount((prev) => prev + 1);
            setWrongClicks((prev) => [...prev, { x, y }]);

            soundEffects.playError();

            setTimeout(() => {
                setWrongClicks((prev) => prev.slice(1));
            }, 1000);
        }
    };

    const handleHint = () => {
        if (hintsUsed >= actualMaxHints || foundDifferences.length === level.differences.length) return;

        // Find an unfound difference
        const unfoundIndices = level.differences
            .map((_, index) => index)
            .filter((index) => !foundDifferences.includes(index));

        if (unfoundIndices.length === 0) return;

        const randomIndex = unfoundIndices[Math.floor(Math.random() * unfoundIndices.length)];
        setHintsUsed((prev) => prev + 1);
        setHintRegions((prev) => [...prev, randomIndex]);

        soundEffects.playHint();

        // Remove hint after 4 seconds
        setTimeout(() => {
            setHintRegions((prev) => prev.filter((i) => i !== randomIndex));
        }, 4000);
    };

    const handleAskForHelp = () => {
        setShowHelpModal(true);
    };

    const shareToSocial = (platform: 'twitter' | 'facebook' | 'pinterest') => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://spotdiffs.com';
        const gameUrl = `${baseUrl}/game/${level.slug}`;
        const text = `Can you help me find the differences? I'm stuck on "${level.title}" (${foundDifferences.length}/${level.differences.length} found). Can you spot them?`;
        const hashtags = 'SpotTheDifference,PuzzleGame,HelpNeeded';

        let shareUrl = '';

        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(gameUrl)}&hashtags=${hashtags}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(gameUrl)}&quote=${encodeURIComponent(text)}`;
                break;
            case 'pinterest':
                const imageUrl = level.image_url_1;
                shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(gameUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(text)}`;
                break;
        }

        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    const progress = (foundDifferences.length / level.differences.length) * 100;

    return (
        <div className="flex flex-col gap-4 w-full max-w-7xl mx-auto">
            {/* Game HUD - Mobile Only */}
            <div className="md:hidden bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 flex justify-between items-center shadow-lg">
                {/* Left Side - Status Area */}
                <div className="flex items-center gap-4">
                    {/* Circular Progress */}
                    <div className="relative w-15 h-15">
                        {/* Background Circle */}
                        <svg className="w-15 h-15 transform -rotate-90" viewBox="0 0 60 60">
                            <circle
                                cx="30"
                                cy="30"
                                r="24"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="5"
                                className="text-gray-300 dark:text-gray-600"
                            />
                            {/* Progress Circle */}
                            <circle
                                cx="30"
                                cy="30"
                                r="24"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="5"
                                strokeLinecap="round"
                                className="text-emerald-500 transition-all duration-500"
                                style={{
                                    strokeDasharray: `${2 * Math.PI * 24}`,
                                    strokeDashoffset: `${2 * Math.PI * 24 * (1 - progress / 100)}`
                                }}
                            />
                        </svg>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-base font-bold text-gray-900 dark:text-white">
                                    {foundDifferences.length}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 leading-none">
                                    / {level.differences.length}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <span className="text-xl">⏱️</span>
                        <span className="text-xl font-mono font-bold">{formatTime(timeElapsed)}</span>
                    </div>

                    {/* Combo */}
                    {combo > 1 && (
                        <div className={`flex items-center gap-1 ${comboAnimation ? 'animate-bounce' : ''}`}>
                            <span className="text-xl">🔥</span>
                            <span className="text-lg font-bold text-orange-600 dark:text-orange-400">×{combo}</span>
                        </div>
                    )}
                </div>

                {/* Right Side - Tool Area */}
                <div className="flex items-center gap-3">
                    {/* Hint Button */}
                    <button
                        onClick={handleHint}
                        disabled={hintsUsed >= actualMaxHints || foundDifferences.length === level.differences.length}
                        className={`relative w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-200 ${
                            hintsUsed >= actualMaxHints
                                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-yellow-400 text-white hover:bg-yellow-500 hover:scale-110 hover:shadow-lg hover:shadow-yellow-300/50 cursor-pointer'
                        }`}
                    >
                        <span>💡</span>
                        {/* Hint Count Badge */}
                        {actualMaxHints - hintsUsed > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {actualMaxHints - hintsUsed}
                            </span>
                        )}
                    </button>

                    {/* SOS Button */}
                    <button
                        onClick={handleAskForHelp}
                        disabled={foundDifferences.length === level.differences.length}
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-200 text-white hover:scale-110 hover:shadow-lg cursor-pointer disabled:bg-gray-300 disabled:dark:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                        style={{ backgroundColor: '#ff690078' }}
                        onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#ff6900aa'}
                        onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#ff690078'}
                    >
                        <span>🆘</span>
                    </button>
                </div>
            </div>

            {/* Help Modal */}
            {showHelpModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowHelpModal(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ask Friends for Help</h2>
                            <button
                                onClick={() => setShowHelpModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Stuck on finding the differences? Share this puzzle with your friends and family! They might spot what you missed.
                        </p>

                        {/* Share Options */}
                        <div className="space-y-3">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Share via Social Media:</p>

                            <button
                                onClick={() => shareToSocial('twitter')}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1DA1F2] text-white rounded-lg font-semibold hover:bg-[#1a8cd8] transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                </svg>
                                Share on Twitter
                            </button>

                            <button
                                onClick={() => shareToSocial('facebook')}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1877F2] text-white rounded-lg font-semibold hover:bg-[#166fe5] transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                                Share on Facebook
                            </button>

                            <button
                                onClick={() => shareToSocial('pinterest')}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#E60023] text-white rounded-lg font-semibold hover:bg-[#d50020] transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
                                </svg>
                                Share on Pinterest
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* Game Images */}
            <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
                {/* Image 1 */}
                <div className={`relative w-full aspect-square cursor-crosshair group bg-gray-100 dark:bg-gray-900 rounded-lg ${
                    level.mode === 'single' ? 'max-w-2xl mx-auto' : 'md:w-1/2'
                }`} onClick={(e) => handleImageClick(e, 1)}>
                    <Image
                        ref={imageRef}
                        src={level.image_url_1}
                        alt="Original"
                        fill
                        className="object-contain rounded-lg shadow-lg pointer-events-none select-none"
                        priority
                    />

                    {/* Hint regions */}
                    {hintRegions.map((index) => {
                        const diff = level.differences[index];
                        return (
                            <div
                                key={`hint-1-${index}`}
                                className="absolute bg-yellow-400/30 border-2 border-yellow-400 rounded-lg animate-pulse"
                                style={{
                                    left: `${Math.max(0, diff.x - 12.5)}%`,
                                    top: `${Math.max(0, diff.y - 12.5)}%`,
                                    width: '25%',
                                    height: '25%',
                                }}
                            />
                        );
                    })}

                    {/* Found differences */}
                    {foundDifferences.map((diffIndex) => {
                        const diff = level.differences[diffIndex];
                        return (
                            <div key={`found-1-${diffIndex}`}>
                                <div
                                    className="absolute border-4 border-green-500 rounded-full animate-ping-once"
                                    style={{
                                        left: `${diff.x}%`,
                                        top: `${diff.y}%`,
                                        width: '10%',
                                        height: '10%',
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                />
                                <div
                                    className="absolute border-2 border-green-500 rounded-full bg-green-500/20"
                                    style={{
                                        left: `${diff.x}%`,
                                        top: `${diff.y}%`,
                                        width: '10%',
                                        height: '10%',
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                />
                            </div>
                        );
                    })}

                    {/* Wrong clicks */}
                    {wrongClicks.map((click, i) => (
                        <div
                            key={`wrong-1-${i}`}
                            className="absolute w-8 h-8 border-2 border-red-500 bg-red-500/30 rounded-full flex items-center justify-center animate-fade-out"
                            style={{
                                left: `${click.x}%`,
                                top: `${click.y}%`,
                                transform: 'translate(-50%, -50%)',
                            }}
                        >
                            <span className="text-red-600 font-bold">X</span>
                        </div>
                    ))}

                    {/* Score popups */}
                    {scorePopups.map((popup) => (
                        <div
                            key={popup.id}
                            className="absolute text-yellow-400 font-bold text-2xl animate-score-popup pointer-events-none"
                            style={{
                                left: `${popup.x}%`,
                                top: `${popup.y}%`,
                                transform: 'translate(-50%, -50%)',
                            }}
                        >
                            +{popup.score}
                        </div>
                    ))}
                </div>

                {/* Image 2 - Only show in compare mode */}
                {level.mode !== 'single' && level.image_url_2 && (
                    <div className="relative w-full md:w-1/2 aspect-square cursor-crosshair group bg-gray-100 dark:bg-gray-900 rounded-lg" onClick={(e) => handleImageClick(e, 2)}>
                    <Image
                        src={level.image_url_2}
                        alt="Difference"
                        fill
                        className="object-contain rounded-lg shadow-lg pointer-events-none select-none"
                        priority
                    />

                    {/* Hint regions */}
                    {hintRegions.map((index) => {
                        const diff = level.differences[index];
                        return (
                            <div
                                key={`hint-2-${index}`}
                                className="absolute bg-yellow-400/30 border-2 border-yellow-400 rounded-lg animate-pulse"
                                style={{
                                    left: `${Math.max(0, diff.x - 12.5)}%`,
                                    top: `${Math.max(0, diff.y - 12.5)}%`,
                                    width: '25%',
                                    height: '25%',
                                }}
                            />
                        );
                    })}

                    {/* Found differences */}
                    {foundDifferences.map((diffIndex) => {
                        const diff = level.differences[diffIndex];
                        return (
                            <div key={`found-2-${diffIndex}`}>
                                <div
                                    className="absolute border-4 border-green-500 rounded-full animate-ping-once"
                                    style={{
                                        left: `${diff.x}%`,
                                        top: `${diff.y}%`,
                                        width: '10%',
                                        height: '10%',
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                />
                                <div
                                    className="absolute border-2 border-green-500 rounded-full bg-green-500/20"
                                    style={{
                                        left: `${diff.x}%`,
                                        top: `${diff.y}%`,
                                        width: '10%',
                                        height: '10%',
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                />
                            </div>
                        );
                    })}

                    {/* Wrong clicks */}
                    {wrongClicks.map((click, i) => (
                        <div
                            key={`wrong-2-${i}`}
                            className="absolute w-8 h-8 border-2 border-red-500 bg-red-500/30 rounded-full flex items-center justify-center animate-fade-out"
                            style={{
                                left: `${click.x}%`,
                                top: `${click.y}%`,
                                transform: 'translate(-50%, -50%)',
                            }}
                        >
                            <span className="text-red-600 font-bold">X</span>
                        </div>
                    ))}
                </div>
                )}
            </div>
        </div>
    );
}
