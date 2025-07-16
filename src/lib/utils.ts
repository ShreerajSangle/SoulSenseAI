import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} ${days === 1 ? 'day' : 'days'} ago`
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function capitalizeFirst(text: string): string {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Therapeutic-specific utilities
export function getEmotionColor(emotion: string): string {
  const emotionColors: Record<string, string> = {
    joy: 'text-yellow-600 bg-yellow-50',
    sadness: 'text-blue-600 bg-blue-50',
    anger: 'text-red-600 bg-red-50',
    fear: 'text-purple-600 bg-purple-50',
    surprise: 'text-orange-600 bg-orange-50',
    disgust: 'text-green-600 bg-green-50',
    anxiety: 'text-indigo-600 bg-indigo-50',
    calm: 'text-teal-600 bg-teal-50',
    excited: 'text-pink-600 bg-pink-50',
    confused: 'text-gray-600 bg-gray-50',
    hopeful: 'text-emerald-600 bg-emerald-50',
    grateful: 'text-rose-600 bg-rose-50',
  }
  return emotionColors[emotion.toLowerCase()] || 'text-gray-600 bg-gray-50'
}

export function getPersonaColor(persona: string): string {
  const personaColors: Record<string, string> = {
    maya: 'from-purple-400 to-pink-400',
    sarah: 'from-blue-400 to-indigo-400',
    alex: 'from-orange-400 to-red-400',
    marcus: 'from-green-400 to-emerald-400',
  }
  return personaColors[persona.toLowerCase()] || 'from-gray-400 to-gray-500'
}

export function formatMoodScore(score: number): string {
  if (score >= 8) return 'Great'
  if (score >= 6) return 'Good'
  if (score >= 4) return 'Okay'
  if (score >= 2) return 'Low'
  return 'Very Low'
}

export function getMoodEmoji(score: number): string {
  if (score >= 8) return '😊'
  if (score >= 6) return '🙂'
  if (score >= 4) return '😐'
  if (score >= 2) return '😞'
  return '😢'
}