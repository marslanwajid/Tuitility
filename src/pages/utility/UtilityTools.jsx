import React from 'react'
import CategoryPage from '../../components/CategoryPage'

const UtilityTools = () => {
  const utilityTools = [
    { name: 'QR Code Generator', desc: 'Generate QR codes instantly', url: '/qr-code-generator', category: 'Generators', icon: 'fas fa-qrcode' },
    { name: 'Password Generator', desc: 'Create secure passwords', url: '/password-generator', category: 'Security', icon: 'fas fa-key' },
    { name: 'Word Counter', desc: 'Count words, characters, and paragraphs', url: '/word-counter', category: 'Text Tools', icon: 'fas fa-font' },
    { name: 'OCR PDF Generator', desc: 'Extract text from PDF documents using OCR', url: '/ocr-pdf-generator', category: 'PDF Tools', icon: 'fas fa-file-alt' },
    { name: 'OCR Tool', desc: 'Extract text from images (Coming Soon)', url: '#', category: 'Image Tools', icon: 'fas fa-file-alt' },
    { name: 'Text to Speech', desc: 'Convert text to audio', url: '/converter-tools/text-to-speech-converter', category: 'Audio', icon: 'fas fa-volume-up' },
    { name: 'Gen Z Translator', desc: 'Translate modern slang and expressions', url: '/genz-translator', category: 'Language', icon: 'fas fa-language' },
    { name: 'RGB to HEX', desc: 'Convert color formats', url: '/converter-tools/rgb-to-hex-converter', category: 'Converters', icon: 'fas fa-palette' },
    { name: 'Text Case Converter', desc: 'Change text case formats', url: '/converter-tools/text-case-converter', category: 'Text Tools', icon: 'fas fa-font' },
    { name: 'Morse Code Translator', desc: 'Convert text to Morse code and decode', url: '/morse-code-translator', category: 'Converters', icon: 'fas fa-signal' },
    { name: 'HTML to Markdown', desc: 'Convert HTML markup to Markdown', url: '/html-to-markdown-converter', category: 'Converters', icon: 'fab fa-html5' },
    { name: 'English to IPA', desc: 'Convert text to phonetic notation', url: '/utility-tools/english-to-ipa-translator', category: 'Language', icon: 'fas fa-microphone-alt' },
    { name: 'Audio Bitrate Converter', desc: 'Convert audio between different bitrates', url: '/utility-tools/audio-bitrate-converter', category: 'Audio', icon: 'fas fa-music' },
    { name: 'Instagram Reels Downloader', desc: 'Download Instagram Reels videos', url: '/utility-tools/converter-tools/reels-downloader', category: 'Social Media', icon: 'fab fa-instagram' },
    { name: 'TikTok Downloader', desc: 'Download TikTok videos without watermark', url: '/utility-tools/converter-tools/tiktok-downloader', category: 'Social Media', icon: 'fab fa-tiktok' },
    { name: 'QR Code Scanner', desc: 'Scan and decode QR codes instantly', url: '/utility-tools/converter-tools/qr-code-scanner', category: 'Utility', icon: 'fas fa-qrcode' },
    { name: 'QR Code Generator', desc: 'Scan and decode QR codes', url: '/converter-tools/qr-code-scanner', category: 'Generators', icon: 'fas fa-search' },
    { name: 'Aspect Ratio Converter', desc: 'Calculate and convert aspect ratios', url: '/utility-tools/image-tools/aspect-ratio-converter', category: 'Image Tools', icon: 'fas fa-expand-arrows-alt' },
    { name: 'Color Blindness Simulator', desc: 'Simulate color vision deficiencies', url: '/utility-tools/image-tools/color-blindness-simulator', category: 'Image Tools', icon: 'fas fa-eye' },
    { name: 'RGB to Pantone', desc: 'Convert RGB to Pantone colors', url: '/utility-tools/converter-tools/rgb-to-pantone-converter', category: 'Converters', icon: 'fas fa-palette' },
    { name: 'Gold Weight Converter', desc: 'Convert precious metal weights', url: '/converter-tools/gold-precious-metal-weight-converter', category: 'Converters', icon: 'fas fa-coins' },
    { name: 'Image to WebP Converter', desc: 'Convert images to WebP format', url: '/image-tools/image-to-webp-converter', category: 'Image Tools', icon: 'fas fa-image' },
    { name: 'Aspect Ratio Converter', desc: 'Calculate and convert aspect ratios', url: '/image-tools/aspect-ratio-converter', category: 'Image Tools', icon: 'fas fa-expand-arrows-alt' },
    { name: 'Color Blindness Simulator', desc: 'Simulate color vision deficiencies', url: '/image-tools/color-blindness-simulator', category: 'Image Tools', icon: 'fas fa-low-vision' }
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
      description="Essential utility tools for everyday tasks including text processing, file conversion, image editing, and various online utilities."
      tools={utilityTools}
      categories={categories}
      searchPlaceholder="Search utility tools..."
      baseUrl="/utility-tools"
    />
  )
}

export default UtilityTools 