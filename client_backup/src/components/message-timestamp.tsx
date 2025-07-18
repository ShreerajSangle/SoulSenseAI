import React from 'react';
import { format } from 'date-fns';

interface MessageTimestampProps {
  timestamp: Date | string;
  className?: string;
}

export default function MessageTimestamp({ timestamp, className = '' }: MessageTimestampProps) {
  const formatTimestamp = (ts: Date | string) => {
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return format(date, 'h:mm a'); // "2:30 PM"
    } else {
      return format(date, 'MMM d, h:mm a'); // "Jan 2, 2:30 PM"
    }
  };

  return (
    <div 
      className={`opacity-0 group-hover:opacity-70 transition-opacity duration-200 text-xs text-gray-500 dark:text-gray-400 ${className}`}
    >
      {formatTimestamp(timestamp)}
    </div>
  );
}