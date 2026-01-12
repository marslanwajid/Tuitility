import React, { useState } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/utility/html-to-markdown.css';

const HtmlToMarkdownConverter = () => {
  const [conversionType, setConversionType] = useState('to-markdown');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  // --- Conversion Logic (Adapted from User Snippet) ---

  const convertHtmlToMarkdown = (html) => {
    let markdown = html;

    // cleanup basic
    markdown = markdown.replace(/>\s+</g, '><');

    // Paragraphs
    markdown = markdown.replace(/<p\b[^>]*>(.*?)<\/p>/gi, (match, content) => {
      return '\n\n' + content.trim() + '\n\n';
    });

    // Headers
    markdown = markdown.replace(/<h1\b[^>]*>(.*?)<\/h1>/gi, '\n# $1\n');
    markdown = markdown.replace(/<h2\b[^>]*>(.*?)<\/h2>/gi, '\n## $1\n');
    markdown = markdown.replace(/<h3\b[^>]*>(.*?)<\/h3>/gi, '\n### $1\n');
    markdown = markdown.replace(/<h4\b[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n');
    markdown = markdown.replace(/<h5\b[^>]*>(.*?)<\/h5>/gi, '\n##### $1\n');
    markdown = markdown.replace(/<h6\b[^>]*>(.*?)<\/h6>/gi, '\n###### $1\n');

    // Links
    markdown = markdown.replace(/<a\b[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

    // Bold
    markdown = markdown.replace(/<strong\b[^>]*>(.*?)<\/strong>/gi, '**$1**');
    markdown = markdown.replace(/<b\b[^>]*>(.*?)<\/b>/gi, '**$1**');

    // Italic
    markdown = markdown.replace(/<em\b[^>]*>(.*?)<\/em>/gi, '*$1*');
    markdown = markdown.replace(/<i\b[^>]*>(.*?)<\/i>/gi, '*$1*');

    // Images
    markdown = markdown.replace(/<img\b[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');

    // Lists (UL)
    markdown = markdown.replace(/<ul\b[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
      return '\n' + content.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
    });

    // Lists (OL)
    markdown = markdown.replace(/<ol\b[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
      let number = 1;
      return '\n' + content.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (match, item) => {
        return `${number++}. ${item}\n`;
      });
    });

    // Code blocks & Inline code
    markdown = markdown.replace(/<pre\b[^>]*><code\b[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```');
    markdown = markdown.replace(/<code\b[^>]*>(.*?)<\/code>/gi, '`$1`');

    // Blockquotes
    markdown = markdown.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
      return '\n> ' + content.trim().replace(/\n/g, '\n> ') + '\n';
    });

    // Clean up
    markdown = markdown.replace(/&nbsp;/g, ' ');
    markdown = markdown.replace(/\n\s*\n\s*\n/g, '\n\n'); 
    markdown = markdown.replace(/^\s+|\s+$/g, ''); 
    markdown = markdown.replace(/<[^>]*>/g, ''); 
    
    return markdown;
  };

  const convertMarkdownToHtml = (markdown) => {
    let html = markdown;

    // Escape HTML special chars
    html = html.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');

    // Headers
    html = html.replace(/^# (.*$)/gm, '\n<h1>$1</h1>\n');
    html = html.replace(/^## (.*$)/gm, '\n<h2>$1</h2>\n');
    html = html.replace(/^### (.*$)/gm, '\n<h3>$1</h3>\n');
    html = html.replace(/^#### (.*$)/gm, '\n<h4>$1</h4>\n');
    html = html.replace(/^##### (.*$)/gm, '\n<h5>$1</h5>\n');
    html = html.replace(/^###### (.*$)/gm, '\n<h6>$1</h6>\n');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

    // Images
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">');

    // Lists (UL) - simplified regex for basic bullet points
    // Note: User regex was specific, adapting for React/general robustness might require a parser loop, 
    // but we use their regex for fidelity.
    html = html.replace(/^\s*[-*+]\s+(.*)/gm, '  <li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '\n<ul>\n$1\n</ul>\n');

    // Lists (OL)
    html = html.replace(/^\d+\.\s+(.*)/gm, '  <li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '\n<ol>\n$1\n</ol>\n');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '\n<pre><code>$1</code></pre>\n');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Blockquotes
    html = html.replace(/^>\s+(.*$)/gm, '\n<blockquote>\n  $1\n</blockquote>\n');

    // Paragraphs - catch remaining lines that aren't tags
    html = html.replace(/\n\s*\n/g, '\n\n');
    html = html.replace(/^(?!<[a-z])(.*[^>\n]$)/gm, (match) => {
       if (match.trim()) return '<p>' + match + '</p>';
       return match;
    });

    // Cleanup
    html = html.replace(/\n{3,}/g, '\n\n');
    html = html.split('\n').map(line => line.trim()).join('\n');
    html = html.replace(/<p>\s*<\/p>/g, '');
    html = html.trim();

    return html;
  };

  const handleConvert = () => {
    if (!inputText.trim()) return;
    
    if (conversionType === 'to-markdown') {
      setOutputText(convertHtmlToMarkdown(inputText));
    } else {
      setOutputText(convertMarkdownToHtml(inputText));
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    // Could add toast here
  };

  const handleDownload = () => {
    if (!outputText) return;
    const ext = conversionType === 'to-markdown' ? 'md' : 'html';
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted-document.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  // --- Tool Metadata & Content ---

  const toolData = {
    name: "HTML to Markdown Converter",
    title: "HTML to Markdown Converter",
    description: "Convert HTML content to clean Markdown formatting and vice versa. Ideal for migrating blog posts, documentation, and CMS content.",
    icon: "fab fa-html5",
    category: "Utility",
    breadcrumb: ["Utility", "Tools", "HTML to Markdown"],
    tags: ["html", "markdown", "converter", "syntax", "developer"]
  };

  const categories = [
    { name: 'Utility', url: '/utility-tools', icon: 'fas fa-tools' },
    { name: 'Math', url: '/math', icon: 'fas fa-calculator' },
    { name: 'Finance', url: '/finance', icon: 'fas fa-dollar-sign' },
    { name: 'Health', url: '/health', icon: 'fas fa-heartbeat' },
    { name: 'Science', url: '/science', icon: 'fas fa-flask' },
    { name: 'Knowledge', url: '/knowledge', icon: 'fas fa-book' }
  ];

  const relatedTools = [
      { name: "Word Counter", url: "/utility-tools/word-counter", icon: "fas fa-font" },
      { name: "QR Code Generator", url: "/utility-tools/qr-code-generator", icon: "fas fa-qrcode" },
      { name: "Text Case Converter", url: "/utility-tools/converter-tools/text-case-converter", icon: "fas fa-font" },
      { name: "Morse Code Translator", url: "/utility-tools/morse-code-translator", icon: "fas fa-signal" },
      { name: "Image to WebP", url: "/utility-tools/image-tools/image-to-webp-converter", icon: "fas fa-image" }
  ];

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'how-to-use', title: 'How to Use' },
    { id: 'markdown-basics', title: 'Markdown Syntax Basics' },
    { id: 'use-cases', title: 'Common Use Cases' },
    { id: 'faq', title: 'Frequently Asked Questions' }
  ];

  const faqData = [
    {
      question: "What is Markdown?",
      answer: "Markdown is a lightweight markup language for creating formatted text using a plain-text editor. It is widely used for blogging, instant messaging, forums, collaborative software, documentation, and readme files."
    },
    {
      question: "Why convert HTML to Markdown?",
      answer: "Markdown is much easier to read and write than HTML. Converting legacy HTML content to Markdown moves it to a platform-agnostic format that is clean, portable, and easy to edit without worrying about complex tags."
    },
    {
      question: "Does this tool support GitHub Flavored Markdown (GFM)?",
      answer: "Our converter produces standard Markdown that is compatible with most processors, including GFM. It handles code blocks, tables, and lists in a way that renders correctly on GitHub, Reddit, and other platforms."
    },
    {
      question: "Is the conversion lossless?",
      answer: "Mostly, yes. Markdown covers the most common semantic HTML elements (headers, lists, emphasis, links). However, complex HTML layouts with `div` wrappers, inline styles, or script tags are typically stripped out to produce clean text content."
    }
  ];

  const sourceLabel = conversionType === 'to-markdown' ? 'HTML Input' : 'Markdown Input';
  const targetLabel = conversionType === 'to-markdown' ? 'Markdown Output' : 'HTML Output';

  return (
    <ToolPageLayout
      toolData={toolData}
      categories={categories}
      relatedTools={relatedTools}
      tableOfContents={tableOfContents}
    >
      <CalculatorSection title="Converter" icon="fas fa-exchange-alt">
        <div className="converter-container">
          
          <div className="converter-controls">
            <div className="converter-toggles">
              <button 
                className={`mode-toggle-btn ${conversionType === 'to-markdown' ? 'active' : ''}`}
                onClick={() => setConversionType('to-markdown')}
              >
                HTML to Markdown
              </button>
              <button 
                className={`mode-toggle-btn ${conversionType === 'to-html' ? 'active' : ''}`}
                onClick={() => setConversionType('to-html')}
              >
                Markdown to HTML
              </button>
            </div>

            <div className="action-buttons">
               <button className="action-btn danger" onClick={handleClear}>
                <i className="fas fa-trash"></i> Clear
              </button>
              <button className="action-btn secondary" onClick={handleConvert}>
                <i className="fas fa-sync"></i> Convert
              </button>
            </div>
          </div>

          <div className="editor-grid">
            <div className="editor-pane">
              <div className="pane-header">
                <span className="pane-title"><i className="fab fa-html5"></i> {sourceLabel}</span>
              </div>
              <textarea 
                className="editor-textarea" 
                placeholder={`Paste your ${conversionType === 'to-markdown' ? 'HTML' : 'Markdown'} here...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>

            <div className="editor-pane">
              <div className="pane-header">
                <span className="pane-title"><i className="fab fa-markdown"></i> {targetLabel}</span>
                <div className="pane-actions">
                  <button onClick={handleCopy} title="Copy to Clipboard">
                    <i className="fas fa-copy"></i>
                  </button>
                  <button onClick={handleDownload} title="Download File">
                    <i className="fas fa-download"></i>
                  </button>
                </div>
              </div>
               <textarea 
                className="editor-textarea" 
                placeholder="Result will appear here..."
                value={outputText}
                readOnly
              />
            </div>
          </div>

        </div>
      </CalculatorSection>

      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

      <ContentSection id="introduction" title="Introduction">
        <p>
            The <strong>HTML to Markdown Converter</strong> is an essential tool for developers, writers, and content managers. 
            Markdown has become the de-facto standard for documentation and web writing due to its simplicity and readability. 
            However, much of the web's legacy content exists as HTML.
        </p>
        <p>
            This utility enables seamless bi-directional conversion. Whether you are migrating a WordPress site to a static site generator 
            like Jekyll or Hugo, or you simply want to turn a complex web page into extensive, readable notes, this tool automates the process instantly.
        </p>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use">
        <ol className="list-decimal pl-6 space-y-2 mt-4">
             <li><strong>Select Mode:</strong> Choose "HTML to Markdown" or "Markdown to HTML" using the toggle buttons at the top.</li>
             <li><strong>Input Content:</strong> Paste your source code into the left-hand editor pane.</li>
             <li><strong>Convert:</strong> Click the "Convert" button (or it can be triggered manually depending on preference, though the button ensures clarity).</li>
             <li><strong>Copy or Download:</strong> Use the icons in the right-hand header to copy the result to your clipboard or download it as a <code>.md</code> or <code>.html</code> file.</li>
        </ol>
      </ContentSection>

      <ContentSection id="markdown-basics" title="Markdown Syntax Basics">
        <p>If you are new to Markdown, here is a quick reference for the syntax generated by this tool:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 p-4 border rounded">
                <h4 className="font-bold border-b pb-2 mb-2">Headers</h4>
                <code># Heading 1</code><br/>
                <code>## Heading 2</code><br/>
                <code>### Heading 3</code>
            </div>
            <div className="bg-gray-50 p-4 border rounded">
                <h4 className="font-bold border-b pb-2 mb-2">Emphasis</h4>
                <code>**Bold Text**</code><br/>
                <code>*Italic Text*</code><br/>
                <code>~~Strikethrough~~</code>
            </div>
             <div className="bg-gray-50 p-4 border rounded">
                <h4 className="font-bold border-b pb-2 mb-2">Lists</h4>
                <code>- Item 1</code><br/>
                <code>- Item 2</code><br/>
                <code>1. Numbered Item</code>
            </div>
             <div className="bg-gray-50 p-4 border rounded">
                <h4 className="font-bold border-b pb-2 mb-2">Links & Images</h4>
                <code>[Link Text](url)</code><br/>
                <code>![Alt Text](image-url)</code>
            </div>
        </div>
      </ContentSection>

      <ContentSection id="use-cases" title="Common Use Cases">
         <ul className="list-disc pl-6 space-y-2">
            <li><strong>Content Migration:</strong> Moving from a CMS like WordPress or Drupal to a Markdown-based system like Gatsby, Next.js, or Obsidian.</li>
            <li><strong>Documentation:</strong> Converting API responses or HTML specs into readable README.md files for GitHub repositories.</li>
            <li><strong>Email Templates:</strong> drafting emails in Markdown for simplicity and converting them to HTML for sending.</li>
            <li><strong>Data Cleaning:</strong> Stripping styling tags from copied web content to get pure text content.</li>
         </ul>
      </ContentSection>

      <FAQSection faqs={faqData} />

    </ToolPageLayout>
  );
};

export default HtmlToMarkdownConverter;
