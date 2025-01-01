import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

export const PORT = process.env.PORT || 3001;
export const CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];

// Initialize Google AI
export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '');
export const model = genAI.getGenerativeModel({ model: "gemini-pro"});

// Video Search APIs
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
