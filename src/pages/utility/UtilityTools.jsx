import React from 'react'
import CategoryPage from '../../components/CategoryPage'

const UtilityTools = () => {
  const utilityTools = [
    { name: 'Image to WebP Converter', desc: 'Convert image files to efficient WebP format for faster web delivery and lighter assets.', url: '/image-tools/image-to-webp-converter', category: 'Image Tools', icon: 'fas fa-image' },
    { name: 'Instagram Reels Downloader', desc: 'Download Instagram Reels videos for offline viewing and content reference workflows.', url: '/converter-tools/reels-downloader', category: 'Social Media', icon: 'fab fa-instagram' },
    { name: 'TikTok Downloader', desc: 'Download TikTok videos quickly for offline access and content management use.', url: '/converter-tools/tiktok-downloader', category: 'Social Media', icon: 'fab fa-tiktok' },
    { name: 'PDF to Image Converter', desc: 'Turn PDF pages into image files for previews, sharing, or visual extraction.', url: '/converter-tools/pdf-to-image-converter', category: 'PDF Tools', icon: 'fas fa-file-image' },
    { name: 'OCR PDF Generator', desc: 'Extract readable text from PDF files using OCR for searchable document workflows.', url: '/ocr-pdf-generator', category: 'PDF Tools', icon: 'fas fa-file-alt' },
    { name: 'PDF Merger', desc: 'Combine multiple PDF files into a single ordered document.', url: '/converter-tools/merge-pdf', category: 'PDF Tools', icon: 'fas fa-file-pdf' },
    { name: 'PDF Splitter', desc: 'Split PDF files into separate page groups or smaller documents.', url: '/converter-tools/split-pdf', category: 'PDF Tools', icon: 'fas fa-cut' },
    { name: 'Delete PDF Pages', desc: 'Remove selected pages from a PDF without rebuilding the document manually.', url: '/converter-tools/delete-pdf-pages', category: 'PDF Tools', icon: 'fas fa-trash-alt' },
    { name: 'PDF Organizer', desc: 'Reorder PDF pages to restructure documents for export and sharing.', url: '/converter-tools/organize-pdf-pages', category: 'PDF Tools', icon: 'fas fa-sort-amount-down' },
    { name: 'Word Counter', desc: 'Count words, characters, sentences, and paragraphs in pasted text or uploaded documents.', url: '/word-counter', category: 'Text Tools', icon: 'fas fa-font' },
    { name: 'Password Generator', desc: 'Create strong passwords for secure accounts and safer credential practices.', url: '/password-generator', category: 'Security', icon: 'fas fa-key' },
    { name: 'Gen Z Translator', desc: 'Translate between modern internet slang and standard phrasing for clearer communication.', url: '/genz-translator', category: 'Language', icon: 'fas fa-language' },
    { name: 'RGB to HEX', desc: 'Convert RGB color values into HEX codes for design and development work.', url: '/converter-tools/rgb-to-hex-converter', category: 'Converters', icon: 'fas fa-palette' },
    { name: 'Text Case Converter', desc: 'Switch text between upper, lower, title, sentence, and other case styles.', url: '/converter-tools/text-case-converter', category: 'Text Tools', icon: 'fas fa-font' },
    { name: 'Morse Code Translator', desc: 'Encode text into Morse code and decode Morse back into readable text.', url: '/morse-code-translator', category: 'Converters', icon: 'fas fa-signal' },
    { name: 'HTML to Markdown', desc: 'Convert between HTML and Markdown for cleaner writing and content migration workflows.', url: '/html-to-markdown-converter', category: 'Converters', icon: 'fab fa-html5' },
    { name: 'English to IPA', desc: 'Convert English text into IPA phonetic notation for pronunciation support.', url: '/english-to-ipa-translator', category: 'Language', icon: 'fas fa-microphone-alt' },
    { name: 'Audio Bitrate Converter', desc: 'Convert between audio bitrate values for encoding and quality comparison tasks.', url: '/audio-bitrate-converter', category: 'Audio', icon: 'fas fa-music' },
    { name: 'QR Code Scanner', desc: 'Scan and decode QR codes from image or camera input quickly.', url: '/converter-tools/qr-code-scanner', category: 'Utility', icon: 'fas fa-qrcode' },
    { name: 'QR Code Generator', desc: 'Generate branded QR codes for links, text, downloads, and print use cases.', url: '/qr-code-generator', category: 'Generators', icon: 'fas fa-search' },
    { name: 'Aspect Ratio Converter', desc: 'Calculate and convert aspect ratios for images, video, and responsive design.', url: '/image-tools/aspect-ratio-converter', category: 'Image Tools', icon: 'fas fa-expand-arrows-alt' },
    { name: 'Color Blindness Simulator', desc: 'Preview how visuals may appear under common color vision deficiencies.', url: '/image-tools/color-blindness-simulator', category: 'Image Tools', icon: 'fas fa-eye' },
    { name: 'RGB to Pantone', desc: 'Convert RGB color values toward Pantone-style matching workflows.', url: '/converter-tools/rgb-to-pantone-converter', category: 'Converters', icon: 'fas fa-palette' },
    { name: 'RGB to HEX Converter', desc: 'Translate RGB values into web-ready HEX color codes.', url: '/converter-tools/rgb-to-hex-converter', category: 'Converters', icon: 'fas fa-palette' },
    { name: 'Gold Weight Converter', desc: 'Convert precious metal weight units for jewelry, bullion, and trade calculations.', url: '/converter-tools/gold-precious-metal-weight-converter', category: 'Converters', icon: 'fas fa-coins' },
  ]

  const categories = [
    { id: 'all', name: 'All Tools', icon: 'fas fa-th' },
    { id: 'Generators', name: 'Generators', icon: 'fas fa-magic' },
    { id: 'Security', name: 'Security', icon: 'fas fa-shield-alt' },
    { id: 'Text Tools', name: 'Text Tools', icon: 'fas fa-font' },
    { id: 'PDF Tools', name: 'PDF Tools', icon: 'fas fa-file-pdf' },
    { id: 'Audio', name: 'Audio', icon: 'fas fa-music' },
    { id: 'Image Tools', name: 'Image Tools', icon: 'fas fa-image' },
    { id: 'Converters', name: 'Converters', icon: 'fas fa-exchange-alt' },
    { id: 'Language', name: 'Language', icon: 'fas fa-language' },
    { id: 'Fitness', name: 'Fitness', icon: 'fas fa-running' },
    { id: 'Social Media', name: 'Social Media', icon: 'fas fa-share-alt' }
  ]

  return (
    <CategoryPage
      title="Utility Tools"
      description="Explore utility tools for QR codes, PDF workflows, OCR, text conversion, image optimization, color matching, language utilities, and digital productivity tasks. Use this category as a connected utility hub where document tools, text tools, image tools, and scanning tools link naturally into one another."
      tools={utilityTools}
      categories={categories}
      searchPlaceholder="Search utility tools..."
      baseUrl="/utility-tools"
    />
  )
}

export default UtilityTools 
