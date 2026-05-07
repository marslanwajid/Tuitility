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
 * Formats AI markdown response into clean, professional HTML.
 */
export const formatAIResponse = (text) => {
  if (!text) return '';
  
  let formatted = text;

  // 1. Handle Headers (e.g., ### Understanding Your Results)
  formatted = formatted.replace(/^###\s+(.+)$/gm, '<h4 class="ai-header">$1</h4>');
  formatted = formatted.replace(/^##\s+(.+)$/gm, '<h3 class="ai-header">$1</h3>');
  formatted = formatted.replace(/^#\s+(.+)$/gm, '<h2 class="ai-header">$1</h2>');

  // 2. Handle Bold Text (**text**)
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // 3. Handle Numbered Lists (1. Item)
  formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
  
  // 4. Handle Bullet Lists (* Item or - Item)
  formatted = formatted.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>');

  // 5. Wrap <li> groups in <ul>
  // This logic looks for contiguous blocks of <li> and wraps them
  formatted = formatted.replace(/(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/gs, '<ul>$1</ul>');

  // 6. Handle Paragraphs (Double line breaks)
  // Avoid breaking headers or lists
  const parts = formatted.split(/\n\n+/);
  formatted = parts.map(part => {
    if (part.startsWith('<h') || part.startsWith('<ul') || part.startsWith('<li')) {
      return part;
    }
    return `<p>${part.replace(/\n/g, ' ')}</p>`;
  }).join('');

  return formatted;
};
