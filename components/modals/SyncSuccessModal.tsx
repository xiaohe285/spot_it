'use client';

import { useState, useEffect } from 'react';

interface SyncSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncedCount: number;
  autoCloseDelay?: number; // Auto close delay in milliseconds
}

export default function SyncSuccessModal({ 
  isOpen, 
  onClose, 
  syncedCount, 
  autoCloseDelay = 4000 
}: SyncSuccessModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl transform transition-all duration-300 ${
          isClosing ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon with Animation */}
        <div className="text-center mb-4">
          <div className="relative inline-flex">
            {/* Animated Background Circle */}
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
              {/* Checkmark Icon */}
              <svg 
                className="w-10 h-10 text-white animate-bounce" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            
            {/* Floating Sparkles */}
            <div className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-ping">
              ✨
            </div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 text-blue-400 animate-ping delay-150">
              ⭐
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            同步成功！
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            已成功同步 <span className="font-bold text-green-600 dark:text-green-400">{syncedCount}</span> 条游戏记录到您的账户
          </p>
        </div>

        {/* Details */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-green-500 text-lg flex-shrink-0 mt-0.5">📊</div>
            <div className="text-left">
              <h4 className="font-bold text-green-800 dark:text-green-200 text-sm mb-1">
                记录已保存
              </h4>
              <p className="text-green-700 dark:text-green-300 text-xs leading-relaxed">
                您的游戏成绩、时间记录和成就数据现已安全保存在云端，可在任何设备上查看。
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-green-500/30"
          >
            <div className="flex items-center justify-center gap-2">
              <span>太棒了！</span>
              <span className="text-lg">🎉</span>
            </div>
          </button>
        </div>

        {/* Progress Bar for Auto Close */}
        {autoCloseDelay > 0 && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div 
                className="bg-gradient-to-r from-green-600 to-emerald-600 h-1 rounded-full transition-all duration-100 ease-linear"
                style={{
                  animation: `shrink ${autoCloseDelay}ms linear forwards`
                }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              弹框将在 {Math.ceil(autoCloseDelay / 1000)} 秒后自动关闭
            </p>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-all"
          aria-label="关闭"
        >
          <span className="text-lg font-bold">×</span>
        </button>
      </div>

      {/* Custom CSS for progress bar animation */}
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}