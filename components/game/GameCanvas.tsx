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

interface GameCanvasProps {
    level: LevelWithCategory;
    onComplete: (stats: GameStats) => void;
    maxHints?: number;
}

export default function GameCanvas({ level, onComplete, maxHints = 3 }: GameCanvasProps) {
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
        if (hintsUsed >= maxHints || foundDifferences.length === level.differences.length) return;

        // Find an unfound difference
        const unfoundIndices = level.differences
            .map((_, index) => index)
            .filter((index) => !foundDifferences.includes(index));

        if (unfoundIndices.length === 0) return;

        const randomIndex = unfoundIndices[Math.floor(Math.random() * unfoundIndices.length)];
        setHintsUsed((prev) => prev + 1);
        setHintRegions((prev) => [...prev, randomIndex]);

        soundEffects.playHint();

        // Remove hint after 3 seconds
        setTimeout(() => {
            setHintRegions((prev) => prev.filter((i) => i !== randomIndex));
        }, 3000);
    };

    const progress = (foundDifferences.length / level.differences.length) * 100;

    return (
        <div className="flex flex-col gap-4 w-full max-w-7xl mx-auto">
            {/* Game HUD */}
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 flex flex-wrap justify-between items-center gap-4 shadow-lg">
                {/* Progress */}
                <div className="flex items-center gap-3">
                    <div className="text-white">
                        <span className="text-2xl font-bold">{foundDifferences.length}</span>
                        <span className="text-gray-400">/{level.differences.length}</span>
                    </div>
                    <div className="w-48 h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Timer */}
                <div className="flex items-center gap-2 text-white">
                    <span className="text-2xl">⏱️</span>
                    <span className="text-2xl font-mono font-bold">{formatTime(timeElapsed)}</span>
                </div>

                {/* Combo */}
                {combo > 1 && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 ${comboAnimation ? 'animate-bounce' : ''}`}>
                        <span className="text-white font-bold text-lg">🔥 {combo}x COMBO!</span>
                    </div>
                )}

                {/* Hints */}
                <button
                    onClick={handleHint}
                    disabled={hintsUsed >= maxHints || foundDifferences.length === level.differences.length}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                        hintsUsed >= maxHints
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-yellow-500 text-white hover:bg-yellow-600 hover:scale-105'
                    }`}
                >
                    <span className="text-lg">💡</span>
                    <span>Hints: {maxHints - hintsUsed}</span>
                </button>
            </div>

            {/* Game Images */}
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                {/* Image 1 */}
                <div className="relative w-full md:w-1/2 aspect-video cursor-crosshair group" onClick={(e) => handleImageClick(e, 1)}>
                    <Image
                        ref={imageRef}
                        src={level.image_url_1}
                        alt="Original"
                        fill
                        className="object-cover rounded-lg shadow-lg pointer-events-none select-none"
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

                {/* Image 2 */}
                <div className="relative w-full md:w-1/2 aspect-video cursor-crosshair group" onClick={(e) => handleImageClick(e, 2)}>
                    <Image
                        src={level.image_url_2}
                        alt="Difference"
                        fill
                        className="object-cover rounded-lg shadow-lg pointer-events-none select-none"
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
            </div>
        </div>
    );
}
