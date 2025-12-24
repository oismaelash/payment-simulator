/**
 * Environment variables configuration
 * 
 * These variables should be set in your .env file with the VITE_ prefix.
 * Example:
 * VITE_GITHUB_URL=https://github.com/oismaelash/payment-simulator
 * VITE_YOUTUBE_VIDEO_ID=AfZSg9Lpjww
 */

export const GITHUB_URL = import.meta.env.VITE_GITHUB_URL || "https://github.com/oismaelash/payment-simulator";
export const YOUTUBE_VIDEO_ID = import.meta.env.VITE_YOUTUBE_VIDEO_ID || "AfZSg9Lpjww";

// Construct YouTube embed URL from video ID
export const YOUTUBE_EMBED_URL = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}`;

