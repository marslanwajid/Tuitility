import React from 'react'
import CategoryPage from '../../components/CategoryPage'

const UtilityTools = () => {
  const utilityTools = [
    { name: 'QR Code Generator', desc: 'Generate QR codes instantly', url: '/utility-tools/converter-tools/qr-code-generator', category: 'Generators', icon: 'fas fa-qrcode' },
    { name: 'Password Generator', desc: 'Create secure passwords', url: '/utility-tools/converter-tools/password-generator', category: 'Security', icon: 'fas fa-key' },
    { name: 'Word Counter', desc: 'Count words, characters, and paragraphs', url: '/utility-tools/converter-tools/word-counter', category: 'Text Tools', icon: 'fas fa-font' },
    { name: 'Text to Speech', desc: 'Convert text to audio', url: '/utility-tools/converter-tools/text-to-speech-converter', category: 'Audio', icon: 'fas fa-volume-up' },
    { name: 'OCR Tool', desc: 'Extract text from images', url: '/utility-tools/image-tools/ocr', category: 'Image Tools', icon: 'fas fa-file-alt' },
    { name: 'RGB to HEX', desc: 'Convert color formats', url: '/utility-tools/converter-tools/rgb-to-hex-converter', category: 'Converters', icon: 'fas fa-palette' },
    { name: 'Text Case Converter', desc: 'Change text case formats', url: '/utility-tools/converter-tools/text-case-converter', category: 'Text Tools', icon: 'fas fa-font' },
    { name: 'Morse Code Translator', desc: 'Convert text to Morse code and decode', url: '/utility-tools/converter-tools/morse-code-translator', category: 'Converters', icon: 'fas fa-signal' },
    { name: 'HTML to Markdown', desc: 'Convert HTML markup to Markdown', url: '/utility-tools/converter-tools/html-to-markdown-converter', category: 'Converters', icon: 'fab fa-html5' },
    { name: 'Gen Z Translator', desc: 'Translate modern slang and expressions', url: '/utility-tools/converter-tools/genz-translator', category: 'Language', icon: 'fas fa-language' },
    { name: 'English to IPA', desc: 'Convert text to phonetic notation', url: '/utility-tools/converter-tools/english-to-ipa-translator', category: 'Language', icon: 'fas fa-microphone-alt' },
    { name: 'Calories to Exercise', desc: 'Convert calories to exercise activities', url: '/utility-tools/converter-tools/calories-to-exercise-converter', category: 'Fitness', icon: 'fas fa-running' },
    { name: 'Audio Bitrate Converter', desc: 'Convert audio between different bitrates', url: '/utility-tools/converter-tools/audio-bitrate-converter', category: 'Audio', icon: 'fas fa-music' },
    { name: 'Instagram Reels Downloader', desc: 'Download Instagram Reels videos', url: '/utility-tools/converter-tools/reels-downloader', category: 'Social Media', icon: 'fab fa-instagram' },
    { name: 'QR Code Scanner', desc: 'Scan and decode QR codes', url: '/utility-tools/converter-tools/qr-code-scanner', category: 'Generators', icon: 'fas fa-search' },
    { name: 'RGB to Pantone', desc: 'Convert RGB to Pantone colors', url: '/utility-tools/converter-tools/rgb-to-pantone-converter', category: 'Converters', icon: 'fas fa-swatches' },
    { name: 'Gold Weight Converter', desc: 'Convert precious metal weights', url: '/utility-tools/converter-tools/gold-precious-metal-weight-converter', category: 'Converters', icon: 'fas fa-coins' },
    { name: 'Image to WebP Converter', desc: 'Convert images to WebP format', url: '/utility-tools/image-tools/image-to-webp-converter', category: 'Image Tools', icon: 'fas fa-image' },
    { name: 'Aspect Ratio Converter', desc: 'Calculate and convert aspect ratios', url: '/utility-tools/image-tools/aspect-ratio-converter', category: 'Image Tools', icon: 'fas fa-expand-arrows-alt' },
    { name: 'Color Blindness Simulator', desc: 'Simulate color vision deficiencies', url: '/utility-tools/image-tools/color-blindness-simulator', category: 'Image Tools', icon: 'fas fa-low-vision' }
  ]

  const categories = [
    { id: 'all', name: 'All Tools', icon: 'fas fa-th' },
    { id: 'Generators', name: 'Generators', icon: 'fas fa-magic' },
    { id: 'Security', name: 'Security', icon: 'fas fa-shield-alt' },
    { id: 'Text Tools', name: 'Text Tools', icon: 'fas fa-font' },
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