/**
 * Centralized AI Service for Tuitility
 * Handles Gemini API calls, error reporting, and admin notifications.
 */

import { toast } from 'react-toastify';

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Sends an automated email alert to the administrator when the AI API fails.
 */
const sendAIAlertEmail = async (toolName, errorMessage) => {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Tuitility AI System',
        email: 'system@tuitility.com',
        subject: `URGENT: AI API Failure in ${toolName}`,
        message: `The AI API integration in "${toolName}" has encountered an error.\n\nError Message: ${errorMessage}\n\nPlease check the Gemini API key or usage limits immediately.`,
        formType: 'ai-alert',
        toolName: toolName
      })
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Admin alert email failed: /api/contact not found. This is expected in local "npm run dev". Use "vercel dev" to test serverless functions locally.');
      } else {
        console.error('Failed to send admin alert email:', await response.text());
      }
    }
  } catch (error) {
    console.error('Error triggering AI alert email:', error);
  }
};

/**
 * Calls the Gemini AI API with the provided prompt.
 * Falls back to static content on failure and notifies the admin.
 */
export const callGeminiAI = async (prompt, toolName, fallbackContent) => {
  const apiKey = import.meta.env.VITE_GEMINI_API || import.meta.env.GEMINI_API;

  if (!apiKey) {
    const errorMsg = "Gemini API key is not configured in the environment.";
    console.error(errorMsg);
    toast.error(`AI Service Error: ${errorMsg}`);
    await sendAIAlertEmail(toolName, errorMsg);
    return fallbackContent;
  }

  try {
    const response = await fetch(`${API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      const errorMsg = `API Error ${response.status}: ${errorData}`;
      console.error(errorMsg);
      toast.warn(`The AI service is currently unavailable. Generating a standard report instead.`);
      await sendAIAlertEmail(toolName, errorMsg);
      return fallbackContent;
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      throw new Error("Empty response from AI API");
    }

    return resultText;
  } catch (error) {
    console.error(`AI call failed for ${toolName}:`, error);
    toast.error(`AI Generation Error: ${error.message}`);
    await sendAIAlertEmail(toolName, error.message);
    return fallbackContent;
  }
};

/**
 * Formats AI markdown-like response into HTML-friendly structure
 */
export const formatAIResponse = (text) => {
  if (!text) return '';
  
  // Replace section headers
  let formatted = text.replace(/^(Understanding Your Results|Personalized Self-Care Strategies|Moving Forward|Summary|Recommendations):/gm, '<h4>$1</h4>');
  
  // Format bold text
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Format lists
  formatted = formatted.replace(/^\s*[\*\-]\s+(.+)$/gm, '<li>$1</li>');
  
  // Wrap list items in <ul> if they aren't already
  formatted = formatted.replace(/(<li>.*?<\/li>(\s*<li>.*?<\/li>)*)/gs, '<ul>$1</ul>');
  
  // Replace double line breaks with paragraphs
  formatted = formatted.replace(/\n\n/g, '</p><p>');
  
  // Wrap in initial paragraph if needed
  if (!formatted.startsWith('<')) {
    formatted = '<p>' + formatted + '</p>';
  }
  
  return formatted;
};
