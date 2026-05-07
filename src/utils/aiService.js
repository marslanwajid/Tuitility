/**
 * Centralized AI Service for Tuitility
 * Handles Gemini AI calls through a secure server-side proxy to hide API keys.
 */

import { toast } from 'react-toastify';

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
 * Calls the secure Gemini AI Proxy endpoint.
 * Falls back to static content on failure and notifies the admin.
 */
export const callGeminiAI = async (prompt, toolName, fallbackContent) => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt,
        model: 'gemini-2.5-flash' // Using the model verified by user
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMsg = errorData.details || errorData.message || `Status ${response.status}`;
      
      console.error(`AI Proxy Error (${toolName}):`, errorMsg);
      
      if (response.status === 404) {
        toast.warn("AI Proxy not found locally. Running with standard report.");
        console.warn('AI Proxy (/api/gemini) not found. Use "vercel dev" to test AI features locally.');
      } else {
        toast.warn(`The AI service is currently unavailable. Generating a standard report instead.`);
        await sendAIAlertEmail(toolName, errorMsg);
      }
      
      return fallbackContent;
    }

    const data = await response.json();
    return data.text;
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
