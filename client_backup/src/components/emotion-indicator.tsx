import React from 'react';
import { Badge } from "@/components/ui/badge";

interface EmotionIndicatorProps {
  emotions: string[];
  intensity?: number;
  className?: string;
}

const emotionEmojis: Record<string, string> = {
  joy: "😊",
  happiness: "😊", 
  sadness: "😔",
  depression: "😔",
  anxiety: "😰",
  fear: "😨",
  anger: "😠",
  surprise: "😮",
  disgust: "🤢",
  love: "💕",
  optimism: "🌟",
  pessimism: "😞",
  excitement: "🤩",
  gratitude: "🙏",
  confusion: "😕",
  curiosity: "🤔",
  neutral: "😐",
  overwhelm: "😵",
  stress: "😓",
  grief: "😢",
  loneliness: "🥺",
  hope: "✨",
  relief: "😌",
  pride: "😌"
};

const emotionColors: Record<string, string> = {
  joy: "bg-yellow-100 text-yellow-800 border-yellow-300",
  happiness: "bg-yellow-100 text-yellow-800 border-yellow-300",
  sadness: "bg-blue-100 text-blue-800 border-blue-300",
  depression: "bg-blue-100 text-blue-800 border-blue-300", 
  anxiety: "bg-orange-100 text-orange-800 border-orange-300",
  fear: "bg-red-100 text-red-800 border-red-300",
  anger: "bg-red-100 text-red-800 border-red-300",
  surprise: "bg-purple-100 text-purple-800 border-purple-300",
  disgust: "bg-green-100 text-green-800 border-green-300",
  love: "bg-pink-100 text-pink-800 border-pink-300",
  optimism: "bg-green-100 text-green-800 border-green-300",
  pessimism: "bg-gray-100 text-gray-800 border-gray-300",
  excitement: "bg-yellow-100 text-yellow-800 border-yellow-300",
  gratitude: "bg-green-100 text-green-800 border-green-300",
  confusion: "bg-gray-100 text-gray-800 border-gray-300",
  curiosity: "bg-blue-100 text-blue-800 border-blue-300",
  neutral: "bg-gray-100 text-gray-600 border-gray-300",
  overwhelm: "bg-red-100 text-red-800 border-red-300",
  stress: "bg-orange-100 text-orange-800 border-orange-300",
  grief: "bg-blue-100 text-blue-800 border-blue-300",
  loneliness: "bg-purple-100 text-purple-800 border-purple-300",
  hope: "bg-green-100 text-green-800 border-green-300",
  relief: "bg-green-100 text-green-800 border-green-300",
  pride: "bg-yellow-100 text-yellow-800 border-yellow-300"
};

export default function EmotionIndicator({ emotions, intensity, className = '' }: EmotionIndicatorProps) {
  if (!emotions || emotions.length === 0) return null;

  const primaryEmotion = emotions[0];
  const emoji = emotionEmojis[primaryEmotion.toLowerCase()] || "💭";
  const colorClass = emotionColors[primaryEmotion.toLowerCase()] || "bg-gray-100 text-gray-600 border-gray-300";
  
  // Format emotion name for display
  const displayEmotion = primaryEmotion.charAt(0).toUpperCase() + primaryEmotion.slice(1);
  
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <Badge 
        variant="outline" 
        className={`${colorClass} text-xs font-medium px-2 py-1 rounded-full border transition-all duration-200 hover:scale-105`}
      >
        <span className="text-sm mr-1">{emoji}</span>
        {displayEmotion}
        {intensity && intensity > 0.7 && (
          <span className="ml-1 text-xs opacity-70">
            {intensity > 0.9 ? "+++" : intensity > 0.8 ? "++" : "+"}
          </span>
        )}
      </Badge>
      
      {/* Show additional emotions if multiple detected */}
      {emotions.length > 1 && emotions.slice(1, 3).map((emotion, index) => {
        const secondaryEmoji = emotionEmojis[emotion.toLowerCase()] || "💭";
        const secondaryColor = emotionColors[emotion.toLowerCase()] || "bg-gray-100 text-gray-600 border-gray-300";
        const secondaryDisplay = emotion.charAt(0).toUpperCase() + emotion.slice(1);
        
        return (
          <Badge 
            key={index}
            variant="outline" 
            className={`${secondaryColor} text-xs font-medium px-2 py-1 rounded-full border opacity-70 transition-all duration-200 hover:scale-105`}
          >
            <span className="text-sm mr-1">{secondaryEmoji}</span>
            {secondaryDisplay}
          </Badge>
        );
      })}
    </div>
  );
}