import React, { useState, useRef, useEffect } from 'react'
import JSZip from 'jszip'
import imageCompression from 'browser-image-compression'
import ToolPageLayout from '../../tool/ToolPageLayout'
import CalculatorSection from '../../tool/CalculatorSection'
import ContentSection from '../../tool/ContentSection'
import FAQSection from '../../tool/FAQSection'
import TableOfContents from '../../tool/TableOfContents'
import FeedbackForm from '../../tool/FeedbackForm'
import '../../../assets/css/utility/image-to-webp.css'

const ImageToWebP = () => {
  // State for converter logic
  const [files, setFiles] = useState([])
  const [quality, setQuality] = useState(80)
  const [isConverting, setIsConverting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const [useAdvanced, setUseAdvanced] = useState(false) // Toggle for advanced mode
  
  const fileInputRef = useRef(null)

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) URL.revokeObjectURL(file.preview)
      })
    }
  }, [files])

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files)
    handleFiles(selectedFiles)
  }

  const handleFiles = (newFiles) => {
    const imageFiles = newFiles
      .filter(file => file.type.startsWith('image/'))
      .map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }))

    if (imageFiles.length === 0 && newFiles.length > 0) {
      setError('Please select valid image files.')
    } else {
      setError('')
    }

    setFiles(prev => [...prev, ...imageFiles])
  }

  const removeFile = (index) => {
    setFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const clearAll = () => {
    files.forEach(file => URL.revokeObjectURL(file.preview))
    setFiles([])
    setError('')
  }

  // Standard Canvas-based Conversion (Original)
  const convertToWebPStandard = (file, qualityLevel) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Conversion failed'))
          }
        }, 'image/webp', qualityLevel)
      }
      img.onerror = () => reject(new Error('Image loading failed'))
      img.src = file.preview
    })
  }

  // Advanced Browser-Image-Compression Conversion
  const convertToWebPAdvanced = async (file, qualityLevel) => {
    // browser-image-compression uses 0-1 range for quality, but also 'maxSizeMB' etc.
    // We want to primarily control format and quality.
    // Note: The library optimizes significantly, so file size might be very small.
    const options = {
      maxSizeMB: 50, // Set high to avoid resizing unless huge
      maxWidthOrHeight: 4096, // Reasonable limit, prevents crash on massive images
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: qualityLevel,
      alwaysKeepResolution: true // Try to keep resolution if possible
    }
    
    try {
      const compressedFile = await imageCompression(file, options)
      return compressedFile // This returns a Blob/File
    } catch (error) {
      throw error
    }
  }

  const handleConvert = async () => {
    if (files.length === 0) return
    
    setIsConverting(true)
    setError('')
    const qualityLevel = quality / 100

    try {
      if (files.length === 1) {
        let blob
        if (useAdvanced) {
          blob = await convertToWebPAdvanced(files[0], qualityLevel)
        } else {
          blob = await convertToWebPStandard(files[0], qualityLevel)
        }

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${files[0].name.split('.')[0]}.webp`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        const zip = new JSZip()
        
        // Map conversions based on selected mode
        const conversionPromises = files.map(async (file) => {
          let blob
          if (useAdvanced) {
            blob = await convertToWebPAdvanced(file, qualityLevel)
          } else {
            blob = await convertToWebPStandard(file, qualityLevel)
          }
          zip.file(`${file.name.split('.')[0]}.webp`, blob)
        })

        await Promise.all(conversionPromises)
        
        const content = await zip.generateAsync({ type: 'blob' })
        const url = URL.createObjectURL(content)
        const a = document.createElement('a')
        a.href = url
        a.download = 'converted_images.zip'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error converting images:', error)
      setError('An error occurred during conversion. Please try again.')
    } finally {
      setIsConverting(false)
    }
  }

  // Tool Data
  const toolData = {
    name: 'Image to WebP Converter',
    description: 'Convert your JPG, PNG, and GIF images to high-efficient WebP format. Reduce file size significantly while maintaining quality for faster website loading speeds.',
    icon: 'fas fa-image',
    category: 'Utility',
    breadcrumb: ['Utility', 'Tools', 'Image to WebP Converter']
  }

  const categories = [
    { name: 'Utility', url: '/utility-tools', icon: 'fas fa-tools' },
    { name: 'Math', url: '/math', icon: 'fas fa-calculator' },
    { name: 'Finance', url: '/finance', icon: 'fas fa-dollar-sign' },
    { name: 'Health', url: '/health', icon: 'fas fa-heartbeat' },
    { name: 'Science', url: '/science', icon: 'fas fa-flask' }
  ]

  const relatedTools = [
    { name: 'Word Counter', url: '/utility-tools/word-counter', icon: 'fas fa-font' },
    { name: 'Password Generator', url: '/utility-tools/password-generator', icon: 'fas fa-key' },
    { name: 'QR Code Generator', url: '/utility-tools/qr-code-generator', icon: 'fas fa-qrcode' },
    { name: 'OCR PDF Generator', url: '/utility-tools/ocr-pdf-generator', icon: 'fas fa-file-pdf' }
  ]

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'features', title: 'Key Features' },
    { id: 'how-to-use', title: 'Step-by-Step Guide' },
    { id: 'why-webp', title: 'Why Choose WebP?' },
    { id: 'comparison', title: 'WebP vs Other Formats' },
    { id: 'technical-specs', title: 'Technical Specifications' },
    { id: 'performance', title: 'Web Performance Impact' },
    { id: 'faqs', title: 'Frequently Asked Questions' }
  ]

  const faqData = [
    {
      question: "What makes WebP better than JPEG or PNG?",
      answer: "WebP generally offers a 25-34% reduction in file size compared to JPEG at equivalent quality. Compared to PNG, WebP lossless images are about 26% smaller. This smaller size means your website loads faster, which is crucial for SEO and user experience."
    },
    {
      question: "Does converting to WebP lose image quality?",
      answer: "It depends on the settings. WebP supports both lossy and lossless compression. If you choose 'lossless' (or high quality settings), the difference is indistinguishable to the human eye. With lossy compression, you can trade a small amount of quality for significant file size savings."
    },
    {
      question: "What is the difference between Standard and Advanced mode?",
      answer: "Standard mode uses your browser's built-in canvas converter, which is fast and lightweight. Advanced mode uses a specialized library that runs in the background (multi-threaded), preventing the browser from slowing down when converting heavy batches of images."
    },
    {
      question: "Which browsers support WebP?",
      answer: "WebP is now supported by all modern browsers, including Google Chrome, Mozilla Firefox, Microsoft Edge, Opera, and Safari (on macOS 11+ and iOS 14+). It has effectively become the universal standard for modern web images."
    },
    {
      question: "Can I convert images to WebP on mobile?",
      answer: "Yes! Our tool is fully responsive and works directly in your mobile browser. You can select photos from your gallery and download the converted WebP files directly to your phone."
    },
    {
      question: "Is there a limit to how many files I can convert?",
      answer: "No, there are no hard limits. You can select multiple files at once. However, for browser performance, we recommend converting in batches of 20-50 images if they are very large."
    },
    {
      question: "How do I open WebP files on my computer?",
      answer: "Most modern image viewers and web browsers can open WebP files directly. If you need to edit them, professional software like Adobe Photoshop (with a plugin or newer versions) and GIMP support WebP natively."
    },
    {
      question: "Does WebP support animation?",
      answer: "Yes, WebP supports animation and interacts similarly to GIF files. It can often provide better quality and much smaller file sizes than traditional GIFs."
    }
  ]

  return (
    <ToolPageLayout
      toolData={toolData}
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection
        title="Image to WebP Converter"
        subtitle="Transform your images into high-performance WebP format instantly"
        icon="fas fa-image"
        error={error}
      >
        <div className="image-to-webp-tool">
          <div 
            className={`upload-area ${isDragging ? 'dragover' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              id="fileInput" 
              ref={fileInputRef}
              multiple 
              accept="image/*" 
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
            <div className="upload-icon">
              <i className="fas fa-cloud-upload-alt"></i>
            </div>
            <div className="upload-text">Drag & Drop images here</div>
            <div className="upload-subtext">or click to browse</div>
            <button className="browse-btn">
              Select Images
            </button>
          </div>

          {files.length > 0 && (
            <>
              <div className="controls-section">
                <div className="control-group">
                  <div className="control-label">
                    <span>Compression Quality</span>
                    <span>{quality}%</span>
                  </div>
                  <div className="quality-slider-container">
                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Smaller Size</span>
                    <input 
                      type="range" 
                      min="1" 
                      max="100" 
                      value={quality} 
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="quality-slider"
                    />
                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Better Quality</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
                    Tip: A quality of 80% is recommended for the best balance between size and visual clarity.
                  </p>
                </div>
                
                {/* Advanced Mode Toggle */}
                <div className="control-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '1rem', fontWeight: '500', color: '#1a1a1a' }}>Advanced Optimization</span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Use multi-threaded processing for improved performance on large files.</span>
                    </div>
                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                        <input 
                            type="checkbox" 
                            checked={useAdvanced}
                            onChange={(e) => setUseAdvanced(e.target.checked)}
                            style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span className="slider round" style={{ 
                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                            backgroundColor: useAdvanced ? '#1a1a1a' : '#ccc', transition: '.4s', borderRadius: '34px'
                        }}></span>
                        <span style={{ 
                            position: 'absolute', content: '""', height: '18px', width: '18px', left: useAdvanced ? '24px' : '4px', bottom: '4px', 
                            backgroundColor: 'white', transition: '.4s', borderRadius: '50%' 
                        }}></span>
                    </label>
                </div>

                <button 
                  className="convert-btn" 
                  onClick={handleConvert}
                  disabled={isConverting}
                  style={{ marginTop: '1.5rem' }}
                >
                  {isConverting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Processing Images...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic"></i> Convert ({useAdvanced ? 'Advanced' : 'Standard'})
                    </>
                  )}
                </button>
              </div>

              <div className="preview-section">
                <div className="preview-header">
                  <h3>Queue ({files.length})</h3>
                  <button className="clear-btn" onClick={clearAll}>Clear Queue</button>
                </div>
                <div className="preview-grid">
                  {files.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="preview-item">
                      <img src={file.preview} alt={file.name} />
                      <div className="file-info" style={{position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '4px', color: '#fff', fontSize: '0.7rem', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {file.name}
                      </div>
                      <button 
                        className="remove-btn" 
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(index)
                        }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </CalculatorSection>

      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

      {/* DETAILED CONTENT SECTIONS */}
      
      <ContentSection id="introduction" title="Introduction">
        <p>
          In the modern web landscape, speed is everything. Every kilobyte counts when it comes to page load times, SEO rankings, and user retention. 
          The <strong>Image to WebP Converter</strong> is a powerful, client-side utility designed to empower webmasters, designers, and developers 
          to instantly optimize their image assets.
        </p>
        <p>
          This tool allows you to convert traditional image formats like JPEG, PNG, and GIF into the next-generation <strong>WebP Format</strong>. 
          Developed by Google, WebP provides superior lossless and lossy compression for images on the web. By using WebP, you can create smaller, 
          richer images that make the web faster, without sacrificing quality.
        </p>
        <p>
          Whether you are optimizing a portfolio, an e-commerce store, or a blog, converting your library to WebP is one of the single most effective 
          optimizations you can perform to improve your Core Web Vitals and PageSpeed Insights scores.
        </p>
      </ContentSection>

      <ContentSection id="features" title="Key Features">
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
          <div className="feature-item" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h4 style={{ color: '#1a1a1a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fas fa-bolt" style={{ color: '#1a1a1a' }}></i> Blazing Fast Conversion
            </h4>
            <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
              Unlike other tools that queue your files on a slow server, our converter runs directly in your browser using advanced WebAssembly technology. 
              This means near-instant conversions with zero upload latency.
            </p>
          </div>
          <div className="feature-item" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h4 style={{ color: '#1a1a1a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fas fa-lock" style={{ color: '#1a1a1a' }}></i> 100% Privacy & Security
            </h4>
            <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
              Your photos never leave your device. Since all processing operates locally, you can safely convert sensitive personal documents or 
              private client work without worrying about data breaches or server storage policies.
            </p>
          </div>
          <div className="feature-item" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h4 style={{ color: '#1a1a1a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fas fa-boxes" style={{ color: '#1a1a1a' }}></i> Dual-Mode Processing
            </h4>
            <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
              Choose between <strong>Standard Mode</strong> for quick, lightweight conversions or <strong>Advanced Mode</strong> to leverage multi-threaded 
              Web Workers for processing large batches without slowing down your browser.
            </p>
          </div>
          <div className="feature-item" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h4 style={{ color: '#1a1a1a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fas fa-sliders-h" style={{ color: '#1a1a1a' }}></i> Granular Quality Control
            </h4>
            <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
              You have full control over the compression algorithm. Adjust the quality slider from 1% to 100% to find the exact sweet spot 
              between file size savings and visual fidelity for your specific needs.
            </p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="how-to-use" title="Step-by-Step Guide">
        <div style={{ background: '#fff', borderRadius: '8px' }}>
          <p style={{ marginBottom: '1.5rem' }}>
            Converting your image library is simple and requires no technical knowledge. Follow these four easy steps:
          </p>
          <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li>
              <strong>Select Your Images:</strong> Click the large "Select Images" button or simply drag and drop your files into the dotted upload zone. 
              We support standard web formats including JPG, PNG, and GIF.
            </li>
            <li>
              <strong>Choose Optimization Mode:</strong> Toggle "Advanced Optimization" if you are converting a large batch of high-resolution images. 
              For single or small images, the Standard mode is perfectly sufficient.
            </li>
            <li>
              <strong>Configure Quality:</strong> Use the "Compression Quality" slider to determine how aggressively you want to compress the images. 
              <br/><em>Recommendation: 80% is the industry standard for web use, providing significant savings with negligible visual loss.</em>
            </li>
            <li>
              <strong>Start Conversion:</strong> Click the "Convert Images to WebP" button. You will see a spinner indicating that the browser is processing your files.
            </li>
            <li>
              <strong>Download & Save:</strong> Once finished, your files will download automatically. If you converted a single file, it will be a <code>.webp</code> image. 
              If you converted multiple, look for a <code>converted_images.zip</code> file in your downloads folder.
            </li>
          </ol>
        </div>
      </ContentSection>

      <ContentSection id="why-webp" title="Why Choose WebP?">
        <h3>The Evolution of Web Images</h3>
        <p>
          For decades, the web relied on JPEG for photos and PNG for graphics. While reliable, these formats are aging. JPEG compresses well but removes details and does not support transparency. 
          PNG supports transparency and is lossless but results in massive file sizes.
        </p>
        <p>
          <strong>WebP solves both problems.</strong> It combines the best of both worlds:
        </p>
        <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li><strong>Superior Compression:</strong> WebP files are on average 26% smaller than PNGs and 25-34% smaller than JPEGs at the same quality index (SSIM).</li>
          <li><strong>Transparency Support:</strong> Unlike JPEG, WebP supports an alpha channel (transparency) even with lossy compression, allowing for small logos and transparent graphics.</li>
          <li><strong>Animation:</strong> WebP enables animated images that are significantly smaller than equivalent GIFs, making it perfect for efficient dynamic content.</li>
        </ul>
      </ContentSection>

      <ContentSection id="comparison" title="WebP vs Other Formats">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', border: '1px solid #e5e7eb' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1a1a1a' }}>Feature</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1a1a1a' }}>WebP</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1a1a1a' }}>JPEG</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1a1a1a' }}>PNG</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '1rem', fontWeight: '500' }}>Compression Type</td>
                <td style={{ padding: '1rem', color: '#059669', fontWeight: 'bold' }}>Lossy & Lossless</td>
                <td style={{ padding: '1rem' }}>Lossy only</td>
                <td style={{ padding: '1rem' }}>Lossless only</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '1rem', fontWeight: '500' }}>Transparency</td>
                <td style={{ padding: '1rem', color: '#059669', fontWeight: 'bold' }}>Yes (Lossy & Lossless)</td>
                <td style={{ padding: '1rem', color: '#ef4444' }}>No</td>
                <td style={{ padding: '1rem' }}>Yes</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '1rem', fontWeight: '500' }}>Animation</td>
                <td style={{ padding: '1rem', color: '#059669', fontWeight: 'bold' }}>Yes</td>
                <td style={{ padding: '1rem', color: '#ef4444' }}>No</td>
                <td style={{ padding: '1rem' }}>Yes (APNG, rarely used)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '1rem', fontWeight: '500' }}>Typical Size Savings</td>
                <td style={{ padding: '1rem', color: '#059669', fontWeight: 'bold' }}>High (25-35% savings)</td>
                <td style={{ padding: '1rem' }}>Medium</td>
                <td style={{ padding: '1rem', color: '#ef4444' }}>None (Large files)</td>
              </tr>
              <tr>
                <td style={{ padding: '1rem', fontWeight: '500' }}>Browser Support</td>
                <td style={{ padding: '1rem' }}>Modern Browsers (96%+)</td>
                <td style={{ padding: '1rem' }}>Universal (100%)</td>
                <td style={{ padding: '1rem' }}>Universal (100%)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ContentSection>

      <ContentSection id="technical-specs" title="Technical Specifications">
        <p>
          Our converter offers two distinct processing engines:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1a1a1a' }}>1. Standard Engine</h4>
                 <ul style={{ paddingLeft: '1.2rem', marginBottom: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <li><strong>Technology:</strong> HTML5 Canvas API</li>
                    <li><strong>Method:</strong> Synchronous `canvas.toBlob()`</li>
                    <li><strong>Best For:</strong> Small files, single images, quick conversions.</li>
                </ul>
            </div>
             <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1a1a1a' }}>2. Advanced Engine</h4>
                 <ul style={{ paddingLeft: '1.2rem', marginBottom: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <li><strong>Technology:</strong> Web Workers & `browser-image-compression`</li>
                    <li><strong>Method:</strong> Multi-threaded background processing</li>
                    <li><strong>Best For:</strong> Large batches, high-resolution photos, preventing UI freeze.</li>
                </ul>
            </div>
        </div>
      </ContentSection>

      <ContentSection id="performance" title="Web Performance Impact">
        <p>
          Google has explicitly stated that page speed is a ranking factor for mobile searches. Images are often the heaviest resources on a webpage. 
          By serving WebP images instead of JPEGs, you can often cut your total page weight by 30% or more.
        </p>
        <div style={{ background: '#f0fdf4', padding: '1rem', borderLeft: '4px solid #1a1a1a', marginTop: '1rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#1a1a1a' }}>Did you know?</h4>
          <p style={{ margin: 0, color: '#1a1a1a' }}>
            YouTube improved page load time by 10% simply by switching to WebP thumbnails. Facebook saw a 25-35% data saving by switching to WebP for their mobile apps.
          </p>
        </div>
      </ContentSection>

      <FAQSection faqs={faqData} />
    </ToolPageLayout>
  )
}

export default ImageToWebP
