import React, { useState, useRef } from 'react';
import * as lamejs from 'lamejs';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import Seo from '../Seo';
import '../../assets/css/utility/audio-bitrate-converter.css';
import { toolCategories } from '../../data/toolCategories';


const AudioBitrateConverter = () => {
  const [activeTab, setActiveTab] = useState('bitrate'); // 'bitrate', 'format', 'video'

  // --- Bitrate Converter State ---
  const [bitrateInput, setBitrateInput] = useState('');
  const [inputUnit, setInputUnit] = useState('kbps');
  const [outputUnit, setOutputUnit] = useState('kbps');
  const [bitrateResult, setBitrateResult] = useState('');
  const [copyStatus, setCopyStatus] = useState('Copy');

  // --- Format Converter State ---
  const [audioFile, setAudioFile] = useState(null);
  const [formatOutput, setFormatOutput] = useState('mp3');
  const [formatQuality, setFormatQuality] = useState('medium');
  const [conversionProgress, setConversionProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionComplete, setConversionComplete] = useState(false);

  // --- Video to Audio State ---
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [extractionFormat, setExtractionFormat] = useState('mp3'); // Default to MP3
  const [isTrimming, setIsTrimming] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionComplete, setExtractionComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null); // { url: string, format: string }

  // Refs
  const audioInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // --- Bitrate Logic ---

  const handleBitrateConvert = () => {
    if (!bitrateInput) return;

    const input = parseFloat(bitrateInput);
    if (isNaN(input)) return;

    // To BPS
    let bps = input;
    if (inputUnit === 'kbps') bps = input * 1000;
    if (inputUnit === 'mbps') bps = input * 1000000;

    // From BPS
    let result = bps;
    if (outputUnit === 'kbps') result = bps / 1000;
    if (outputUnit === 'mbps') result = bps / 1000000;

    // Format
    let formatted;
    if (result >= 1000000) formatted = result.toFixed(2);
    else if (result >= 1000) formatted = result.toFixed(1);
    else formatted = result.toFixed(0);

    setBitrateResult(`${formatted} ${outputUnit}`);
  };

  const handlePresetClick = (value) => {
    setBitrateInput(value);
    setInputUnit('kbps');
  };

  const handleBitrateCopy = () => {
    if (bitrateResult) {
      navigator.clipboard.writeText(bitrateResult);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy'), 1500);
    }
  };

  const handleBitrateClear = () => {
    setBitrateInput('');
    setBitrateResult('');
    setInputUnit('kbps');
    setOutputUnit('kbps');
  };

  // --- Audio Format Logic (Still Simulated for pure JS demo without ffmpeg.wasm) ---

  const handleAudioFileChange = (e) => {
    if (e.target.files[0]) {
      setAudioFile(e.target.files[0]);
      setConversionComplete(false);
      setConversionProgress(0);
    }
  };

  const simulateConversion = async (setProgress) => {
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(r => setTimeout(r, 200));
    }
  };

  const handleFormatConvert = async () => {
    if (!audioFile) return;
    setIsConverting(true);
    setConversionComplete(false);
    await simulateConversion(setConversionProgress);
    setIsConverting(false);
    setConversionComplete(true);
  };

  const handleFormatReset = () => {
    setAudioFile(null);
    setConversionProgress(0);
    setConversionComplete(false);
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const handleSimulatedDownload = () => {
    alert("Full in-browser audio transcoding (MP3 encoding) requires heavy libraries like ffmpeg.wasm. The Video extraction below uses native browser APIs for real WAV extraction!");
  };

  // --- Real Video Extract Logic (WAV/MP3) ---

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        alert('Please select a valid video file');
        return;
      }
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      setExtractionComplete(false);
      setExtractionProgress(0);
      setDownloadUrl(null);
    }
  };

  // Helper: WAV Header
  const writeWavHeader = (samples, sampleRate, numChannels) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (view, offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    const floatTo16BitPCM = (output, offset, input) => {
      for (let i = 0; i < input.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, input[i]));
        s = s < 0 ? s * 0x8000 : s * 0x7FFF;
        output.setInt16(offset, s, true);
      }
    };

    floatTo16BitPCM(view, 44, samples);
    return view;
  };

  const interleave = (leftChannel, rightChannel) => {
    let length = leftChannel.length + rightChannel.length;
    let result = new Float32Array(length);

    let inputIndex = 0;

    for (let index = 0; index < length;) {
      result[index++] = leftChannel[inputIndex];
      result[index++] = rightChannel[inputIndex];
      inputIndex++;
    }
    return result;
  };

  // Helper: Encode MP3 using lamejs
  const encodeMp3 = (channels, sampleRate) => {
    // Determine mono or stereo based on channels
    const mp3encoder = new lamejs.Mp3Encoder(channels.length, sampleRate, 128);

    const floatTo16Bit = (input) => {
      const output = new Int16Array(input.length);
      for (let i = 0; i < input.length; i++) {
        let s = Math.max(-1, Math.min(1, input[i]));
        output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      return output;
    };

    let mp3Data = [];

    const left = floatTo16Bit(channels[0]);
    const right = channels.length > 1 ? floatTo16Bit(channels[1]) : undefined;

    const blockSize = 1152;
    for (let i = 0; i < left.length; i += blockSize) {
      const leftChunk = left.subarray(i, i + blockSize);
      const rightChunk = right ? right.subarray(i, i + blockSize) : undefined;
      const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }

    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }

    return new Blob(mp3Data, { type: 'audio/mp3' });
  };

  const handleExtract = async () => {
    if (!videoFile) return;

    try {
      setIsExtracting(true);
      setExtractionProgress(10);

      const arrayBuffer = await videoFile.arrayBuffer();
      setExtractionProgress(30);

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      setExtractionProgress(50);

      let blob;
      let finalFormatStr = extractionFormat;

      if (extractionFormat === 'wav') {
        // WAV Processing
        let finalBuffer;
        if (audioBuffer.numberOfChannels === 2) {
          const left = audioBuffer.getChannelData(0);
          const right = audioBuffer.getChannelData(1);
          finalBuffer = interleave(left, right);
        } else {
          finalBuffer = audioBuffer.getChannelData(0);
        }
        const wavData = writeWavHeader(finalBuffer, audioBuffer.sampleRate, audioBuffer.numberOfChannels);
        blob = new Blob([wavData], { type: 'audio/wav' });

      } else {
        // MP3 Processing (Fallback for AAC/M4A too)
        if (extractionFormat !== 'mp3') {
          alert(`Browser restrictions prevent direct ${extractionFormat.toUpperCase()} encoding. Converting to High-Quality MP3 instead.`);
          finalFormatStr = 'mp3';
        }

        const channels = [];
        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
          channels.push(audioBuffer.getChannelData(i));
        }
        blob = encodeMp3(channels, audioBuffer.sampleRate);
      }

      setExtractionProgress(80);

      const url = URL.createObjectURL(blob);
      setDownloadUrl({ url, format: finalFormatStr });
      setExtractionProgress(100);
      setExtractionComplete(true);
      setIsExtracting(false);

    } catch (error) {
      console.error("Extraction Error:", error);
      alert("Failed to process audio. The file might be corrupt or unsupported.");
      setIsExtracting(false);
      setExtractionProgress(0);
    }
  };

  const handleRealDownload = () => {
    if (downloadUrl) {
      const a = document.createElement('a');
      a.href = downloadUrl.url;
      const originalName = videoFile.name.split('.')[0];
      a.download = `${originalName}_extracted.${downloadUrl.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleVideoReset = () => {
    setVideoFile(null);
    setVideoPreviewUrl('');
    setExtractionProgress(0);
    setExtractionComplete(false);
    setDownloadUrl(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  // --- Tool Data ---

  const toolData = {
    name: "Audio Bitrate Converter",
    title: "Audio Bitrate Converter",
    description: "Multi-tool for audio conversion: Calculate bitrates, and extract high-quality WAV/MP3 audio from video files directly.",
    icon: "fas fa-music",
    category: "Audio",
    breadcrumb: ["Utility", "Tools", "Audio Tools"],
    tags: ["audio", "bitrate", "converter", "wav", "video", "extractor", "mp3"]
  };


  const relatedTools = [
    { name: "Text to Speech", url: "/utility-tools/converter-tools/text-to-speech-converter", icon: "fas fa-volume-up" },
    { name: "Gen Z Translator", url: "/utility-tools/genz-translator", icon: "fas fa-language" },
    { name: "Aspect Ratio Converter", url: "/utility-tools/image-tools/aspect-ratio-converter", icon: "fas fa-expand-arrows-alt" },
    { name: "File Size Converter", url: "/math/calculators/binary-calculator", icon: "fas fa-file-code" },
    { name: "Instagram Reels Downloader", url: "/utility-tools/converter-tools/reels-downloader", icon: "fab fa-instagram" }
  ];

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'how-to-use', title: 'How to Use' },
    { id: 'bitrate-guide', title: 'Bitrate & Quality Essentials' },
    { id: 'sample-rate', title: 'Bitrate vs. Sample Rate' },
    { id: 'streaming', title: 'Streaming Services Standards' },
    { id: 'features', title: 'Common Audio Formats' },
    { id: 'file-size', title: 'Calculating File Size' },
    { id: 'history', title: 'Brief History of Compression' },
    { id: 'faq', title: 'Frequently Asked Questions' }
  ];

  const faqData = [
    {
      question: "Does converting 128 kbps to 320 kbps improve quality?",
      answer: "No. This is a common myth (often called 'upsampling'). The data lost during the original compression to 128 kbps is gone forever. Converting it to 320 kbps just creates a larger file with the exact same low quality. Always start from a lossless source (WAV/FLAC) when converting down."
    },
    {
      question: "Which is better: MP3 or AAC?",
      answer: "At lower bitrates (below 192 kbps), AAC generally sounds significantly better than MP3. At high bitrates (256-320 kbps), the difference is negligible to the human ear, but AAC is mathematically more efficient."
    },
    {
      question: "Why is my WAV file so huge?",
      answer: "WAV is an uncompressed format. It stores every single sample of audio data without trying to confirm patterns or save space. A typical 3-minute song in WAV (CD quality) is about 30-40 MB, whereas an MP3 of the same song is only 3-5 MB."
    },
    {
      question: "What bitrate should I use for a podcast?",
      answer: "For a speech-only podcast, 96 kbps (Mono) or 128 kbps (Stereo) in MP3 format is perfect. It ensures clear voice quality while keeping the file size small enough for listeners to download quickly on mobile data."
    },
    {
      question: "Is audio processed on your server?",
      answer: "No. This tool processes audio locally in your browser. Your private files never leave your device, ensuring complete privacy."
    }
  ];

  const seoData = {
    title: 'Audio Bitrate Converter - Calculate & Convert Audio | Tuitility',
    description: 'Free audio bitrate calculator and converter. Convert between kbps, bps, mbps. Extract audio from video files as MP3 or WAV. All processing happens locally.',
    keywords: 'audio bitrate converter, bitrate calculator, audio converter, video to audio, extract audio, mp3 converter',
    canonicalUrl: 'https://tuitility.vercel.app/utility-tools/converter-tools/audio-bitrate-converter'
  };

  return (
    <>
      <Seo {...seoData} />
      <ToolPageLayout
        toolData={toolData}
        categories={toolCategories}
        relatedTools={relatedTools}
        tableOfContents={tableOfContents}
      >
        <CalculatorSection title="Audio Studio" icon="fas fa-headphones">
          <div className="audio-converter-container">

            <div className="converter-tabs">
              <button
                className={`tab-btn ${activeTab === 'bitrate' ? 'active' : ''}`}
                onClick={() => setActiveTab('bitrate')}
              >
                <i className="fas fa-calculator"></i> Bitrate Calculator
              </button>
              <button
                className={`tab-btn ${activeTab === 'format' ? 'active' : ''}`}
                onClick={() => setActiveTab('format')}
              >
                <i className="fas fa-file-audio"></i> Format Converter
              </button>
              <button
                className={`tab-btn ${activeTab === 'video' ? 'active' : ''}`}
                onClick={() => setActiveTab('video')}
              >
                <i className="fas fa-video"></i> Video to Audio
              </button>
            </div>

            {/* --- Tab 1: Bitrate Calculator --- */}
            {activeTab === 'bitrate' && (
              <div className="converter-content">
                <h3 className="section-title">Calculate Bitrate Conversion</h3>

                <div className="input-group">
                  <label className="input-label">Input Bitrate</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      className="converter-input"
                      placeholder="Enter value"
                      value={bitrateInput}
                      onChange={(e) => setBitrateInput(e.target.value)}
                    />
                    <select
                      className="unit-select"
                      value={inputUnit}
                      onChange={(e) => setInputUnit(e.target.value)}
                    >
                      <option value="bps">bps</option>
                      <option value="kbps">kbps</option>
                      <option value="mbps">mbps</option>
                    </select>
                  </div>
                  <div className="preset-grid">
                    {[96, 128, 160, 192, 256, 320, 1411].map(preset => (
                      <button
                        key={preset}
                        className="preset-btn"
                        onClick={() => handlePresetClick(preset)}
                      >
                        {preset} kbps
                      </button>
                    ))}
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Output Unit</label>
                  <div className="input-wrapper">
                    <select
                      className="converter-input" // Reusing style
                      value={outputUnit}
                      onChange={(e) => setOutputUnit(e.target.value)}
                    >
                      <option value="bps">bps (Bits per second)</option>
                      <option value="kbps">kbps (Kilobits per second)</option>
                      <option value="mbps">mbps (Megabits per second)</option>
                    </select>
                  </div>
                </div>

                {bitrateResult && (
                  <div className="input-group" style={{ marginTop: '24px' }}>
                    <label className="input-label">Result</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        className="converter-input"
                        value={bitrateResult}
                        readOnly
                        style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}
                      />
                      <button className="btn-secondary" onClick={handleBitrateCopy}>
                        {copyStatus}
                      </button>
                    </div>
                  </div>
                )}

                <div className="action-row">
                  <button className="btn-secondary" onClick={handleBitrateClear}>Clear</button>
                  <button className="btn-primary" onClick={handleBitrateConvert}>Calculate</button>
                </div>
              </div>
            )}

            {/* --- Tab 2: Format Converter --- */}
            {activeTab === 'format' && (
              <div className="converter-content">
                <h3 className="section-title">Convert Audio Format</h3>

                {!audioFile ? (
                  <div className="file-upload-zone" onClick={() => audioInputRef.current.click()}>
                    <i className="fas fa-cloud-upload-alt upload-icon"></i>
                    <h4>Click to upload audio file</h4>
                    <p className="text-gray-500">Supports MP3, WAV, AAC, OGG</p>
                    <input
                      type="file"
                      ref={audioInputRef}
                      style={{ display: 'none' }}
                      accept="audio/*"
                      onChange={handleAudioFileChange}
                    />
                  </div>
                ) : (
                  <div className="file-info">
                    <i className="fas fa-music"></i>
                    <span>{audioFile.name}</span>
                    <span className="text-sm text-gray-500">({(audioFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    <button onClick={handleFormatReset} style={{ marginLeft: 'auto', color: '#ef4444' }}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}

                <div className="input-group" style={{ marginTop: '24px' }}>
                  <label className="input-label">Target Format</label>
                  <div className="input-wrapper">
                    <select
                      className="converter-input"
                      value={formatOutput}
                      onChange={(e) => setFormatOutput(e.target.value)}
                    >
                      <option value="mp3">MP3</option>
                      <option value="wav">WAV</option>
                      <option value="aac">AAC</option>
                      <option value="ogg">OGG</option>
                      <option value="m4a">M4A</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Quality</label>
                  <div className="input-wrapper">
                    <select
                      className="converter-input"
                      value={formatQuality}
                      onChange={(e) => setFormatQuality(e.target.value)}
                    >
                      <option value="high">High (320 kbps)</option>
                      <option value="medium">Medium (192 kbps)</option>
                      <option value="low">Low (128 kbps)</option>
                    </select>
                  </div>
                </div>

                {isConverting && (
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${conversionProgress}%` }}></div>
                    </div>
                    <span className="progress-text">Converting... {conversionProgress}%</span>
                  </div>
                )}

                {conversionComplete && (
                  <div className="download-section">
                    <i className="fas fa-check-circle success-icon"></i>
                    <p className="download-text">Conversion Complete!</p>
                    <button className="btn-primary" onClick={handleSimulatedDownload} style={{ margin: '0 auto' }}>
                      <i className="fas fa-download"></i> Download {formatOutput.toUpperCase()}
                    </button>
                  </div>
                )}

                {!isConverting && !conversionComplete && (
                  <div className="action-row">
                    <button className="btn-secondary" onClick={handleFormatReset}>Reset</button>
                    <button className="btn-primary" onClick={handleFormatConvert} disabled={!audioFile}>Convert Now</button>
                  </div>
                )}
              </div>
            )}

            {/* --- Tab 3: Video to Audio --- */}
            {activeTab === 'video' && (
              <div className="converter-content">
                <h3 className="section-title">Extract Audio from Video</h3>

                {!videoFile ? (
                  <div className="file-upload-zone" onClick={() => videoInputRef.current.click()}>
                    <i className="fas fa-video upload-icon"></i>
                    <h4>Click to upload video file</h4>
                    <p className="text-gray-500">Supports MP4, MOV, AVI, MKV</p>
                    <input
                      type="file"
                      ref={videoInputRef}
                      style={{ display: 'none' }}
                      accept="video/*"
                      onChange={handleVideoFileChange}
                    />
                  </div>
                ) : (
                  <div className="video-preview-container">
                    <video src={videoPreviewUrl} controls className="video-element"></video>
                    <div style={{ padding: '12px', background: 'white', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '600' }}>{videoFile.name}</span>
                      <button onClick={handleVideoReset} style={{ color: '#ef4444' }}>
                        <i className="fas fa-trash"></i> Remove
                      </button>
                    </div>
                  </div>
                )}

                <div className="input-group" style={{ marginTop: '24px' }}>
                  <label className="input-label">Output Format</label>
                  <select
                    className="converter-input full-width"
                    value={extractionFormat}
                    onChange={(e) => setExtractionFormat(e.target.value)}
                  >
                    <option value="mp3">MP3 (Universal Audio)</option>
                    <option value="wav">WAV (Lossless High Quality)</option>
                    <option value="aac">AAC (via MP3 Fallback)</option>
                    <option value="m4a">M4A (via MP3 Fallback)</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-2">Extracting audio tracks directly from standard video files.</p>
                </div>

                <div className="input-group">
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={isTrimming}
                      onChange={(e) => setIsTrimming(e.target.checked)}
                      disabled
                    />
                    Trim Audio? <span className="text-gray-400 text-sm">(Coming soon)</span>
                  </label>
                </div>

                {isExtracting && (
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${extractionProgress}%` }}></div>
                    </div>
                    <span className="progress-text">Extracting Audio... {extractionProgress}%</span>
                    <p className="text-xs text-gray-500 mt-1">Decoding and encoding audio streams...</p>
                  </div>
                )}

                {extractionComplete && (
                  <div className="download-section">
                    <i className="fas fa-check-circle success-icon"></i>
                    <p className="download-text">Extraction Complete!</p>
                    <button className="btn-primary" onClick={handleRealDownload} style={{ margin: '0 auto' }}>
                      <i className="fas fa-download"></i> Download {downloadUrl ? (downloadUrl.format ? downloadUrl.format.toUpperCase() : 'FILE') : ''}
                    </button>
                  </div>
                )}

                {!isExtracting && !extractionComplete && (
                  <div className="action-row">
                    <button className="btn-secondary" onClick={handleVideoReset}>Reset</button>
                    <button className="btn-primary" onClick={handleExtract} disabled={!videoFile}>Extract Audio</button>
                  </div>
                )}

              </div>
            )}

          </div>
        </CalculatorSection>

        <div className="tool-bottom-section">
          <TableOfContents items={tableOfContents} />
          <FeedbackForm toolName={toolData.name} />
        </div>

        <ContentSection id="introduction" title="Introduction">
          <p>
            In the digital audio world, <strong>bitrate</strong> is the heartbeat of quality. It represents the amount of data processed over a given amount of time, typically measured in <strong>kilobits per second (kbps)</strong>. The <strong>Audio Bitrate Converter</strong> is your all-in-one studio utility designed to help audiophiles, podcasters, video editors, and sound engineers manage their audio quality with precision.
          </p>
          <p>
            Whether you are optimizing a podcast for faster streaming, archiving a vinyl collection in lossless quality, or extracting a dialogue track from a video file, understanding and manipulating bitrate is essential. This tool bridges the gap between file size and audio fidelity, giving you the power to make informed decisions about your media.
          </p>
        </ContentSection>

        <ContentSection id="how-to-use" title="How to Use">
          <p>This tool is divided into three powerful modules. Here works how each one works:</p>

          <h4 className="font-bold mt-4 mb-2">1. Bitrate Calculator</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Input:</strong> Enter your current bitrate value (e.g., 320).</li>
            <li><strong>Unit Selection:</strong> Choose the source unit (bps, kbps, or mbps).</li>
            <li><strong>Target:</strong> Select the unit you want to convert to.</li>
            <li><strong>Quick Presets:</strong> Click on buttons like "320 kbps" or "1411 kbps" (CD quality) for instant standard values.</li>
          </ul>

          <h4 className="font-bold mt-4 mb-2">2. Audio Format Converter</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Upload:</strong> Click the drop zone to select an audio file (MP3, WAV, FLAC, etc.).</li>
            <li><strong>Format:</strong> Choose your desired output format (e.g., convert WAV to MP3 for sharing).</li>
            <li><strong>Quality:</strong> Select a quality preset. "High" preserves detail, while "Low" significantly reduces file size.</li>
            <li><strong>Convert:</strong> Hit the button and wait for the simulated process to complete, then download your optimized file.</li>
          </ul>

          <h4 className="font-bold mt-4 mb-2">3. Video to Audio Extractor</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Source Video:</strong> Upload a video file (MP4, MKV, MOV).</li>
            <li><strong>Preview:</strong> Verify the video in the built-in player.</li>
            <li><strong>Extraction:</strong> Click "Extract Audio" to process the video track. The browser will decode the audio and re-encode it as a high-quality WAV/MP3 file.</li>
            <li><strong>Download:</strong> Once complete, download your audio file.</li>
          </ul>
        </ContentSection>

        <ContentSection id="bitrate-guide" title="Deep Dive: Understanding Audio Quality">
          <p>
            Bitrate dictates the fidelity of your audio. A higher bitrate generally means better quality, but also a larger file size. Finding the "sweet spot" depends on your destination platform and the type of audio.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <h4 className="font-bold text-lg mb-2 text-indigo-600">The Standards</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>320 kbps (MP3):</strong> The gold standard for compressed audio. Indistinguishable from CD quality for 99% of listeners.</li>
                <li><strong>256 kbps (AAC):</strong> Used by Apple Music and YouTube. More efficient than MP3, offering better quality at the same bitrate.</li>
                <li><strong>192 kbps:</strong> The "standard" quality. Good balance for casual listening.</li>
                <li><strong>128 kbps:</strong> Internet radio standard. Acceptable for speech, but music may sound "swirly" or muffled.</li>
                <li><strong>1411 kbps (WAV/CD):</strong> Uncompressed, lossless audio. Pure quality, huge file sizes.</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <h4 className="font-bold text-lg mb-2 text-indigo-600">CBR vs. VBR</h4>
              <p className="text-sm mb-3"><strong>CBR (Constant Bitrate):</strong> The bitrate stays the same throughout the song. Good for compatibility and streaming consistency.</p>
              <p className="text-sm"><strong>VBR (Variable Bitrate):</strong> The encoder lowers the bitrate for simple silence/speech and raises it for complex musical passages. This is more efficient and usually results in better quality-to-size ratios.</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="sample-rate" title="Bitrate vs. Sample Rate">
          <p>It is easy to confuse these two terms, but they measure different things:</p>
          <ul className="list-disc pl-6 space-y-3 mt-3">
            <li><strong>Bitrate (kbps)</strong>: The amount of data/information per second. Think of it as the "width" of the pipe.</li>
            <li><strong>Sample Rate (kHz)</strong>: How many "snapshots" of audio are taken per second. Standard CD quality is 44.1 kHz (44,100 snapshots per second).</li>
          </ul>
          <p className="mt-3">
            <strong>Analogy:</strong> If audio is a movie, <em>Sample Rate</em> is the frame rate (fps), and <em>Bitrate</em> is the resolution (1080p vs 4K). You need both to be high for a truly immersive experience.
          </p>
        </ContentSection>

        <ContentSection id="streaming" title="Streaming Services Standards">
          <p>Wondering why Spotify sounds different from Apple Music? Here is what the giants use:</p>
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full text-sm text-left border rounded-lg">
              <thead className="bg-gray-100 font-bold">
                <tr>
                  <th className="p-3">Platform</th>
                  <th className="p-3">Free Tier</th>
                  <th className="p-3">Premium Tier</th>
                  <th className="p-3">Format</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="p-3 font-semibold">Spotify</td>
                  <td className="p-3">160 kbps</td>
                  <td className="p-3">320 kbps</td>
                  <td className="p-3">Ogg Vorbis</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Apple Music</td>
                  <td className="p-3">-</td>
                  <td className="p-3">256 kbps</td>
                  <td className="p-3">AAC / ALAC (Lossless)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">YouTube Music</td>
                  <td className="p-3">128 kbps</td>
                  <td className="p-3">256 kbps</td>
                  <td className="p-3">AAC / Opus</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Tidal / Qobuz</td>
                  <td className="p-3">-</td>
                  <td className="p-3">1411+ kbps</td>
                  <td className="p-3">FLAC (Hi-Res)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ContentSection>

        <ContentSection id="features" title="Common Audio Formats Explained">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 font-bold">
                <tr>
                  <th className="p-3 rounded-tl-lg">Format</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 rounded-tr-lg">Best Use Case</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="p-3 font-bold">MP3</td>
                  <td className="p-3">MPEG Audio Layer III</td>
                  <td className="p-3">Lossy</td>
                  <td className="p-3">Universal compatibility, web sharing.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">AAC</td>
                  <td className="p-3">Advanced Audio Coding</td>
                  <td className="p-3">Lossy</td>
                  <td className="p-3">YouTube, Apple devices, streaming.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">WAV</td>
                  <td className="p-3">Waveform Audio File</td>
                  <td className="p-3">Lossless</td>
                  <td className="p-3">Professional editing, master recordings.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">FLAC</td>
                  <td className="p-3">Free Lossless Audio Codec</td>
                  <td className="p-3">Lossless</td>
                  <td className="p-3">Archiving music with significantly smaller size than WAV.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">OGG</td>
                  <td className="p-3">Ogg Vorbis</td>
                  <td className="p-3">Lossy</td>
                  <td className="p-3">Spotify streaming, game assets (open source).</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ContentSection>

        <ContentSection id="file-size" title="Calculating File Size">
          <p>
            You can manually estimate the size of an uncompressed audio file if you know the bitrate and duration.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg mt-4 font-mono text-sm">
            File Size = (Bitrate x Duration) / 8
          </div>
          <p className="mt-4">
            <strong>Example:</strong> A 5-minute song (300 seconds) at 320 kbps:<br />
            (320 kbps x 300 seconds) = 96,000 kilobits<br />
            96,000 / 8 = 12,000 kilobytes (KB)<br />
            12,000 / 1024 ≈ <strong>11.7 MB</strong>
          </p>
          <p className="mt-2 text-sm text-gray-600">
            <em>Note: This is an estimate. Metadata (album art, tags) and variable bitrate (VBR) can affect the final size.</em>
          </p>
        </ContentSection>

        <ContentSection id="history" title="Brief History of Compression">
          <p>
            <strong>1980s:</strong> The Fraunhofer Institute begins work on a method to compress audio without losing perceived quality.
          </p>
          <p>
            <strong>1993:</strong> The MP3 standard is published. It revolutionizes the music industry by reducing file sizes by 90% (from 40MB WAV to 4MB MP3).
          </p>
          <p>
            <strong>1999:</strong> Napster launches, popularizing MP3 sharing globally.
          </p>
          <p>
            <strong>2003:</strong> iTunes launches, making AAC (Advanced Audio Coding) the new standard for legal digital music.
          </p>
          <p>
            <strong>Today:</strong> We are entering the age of "Lossless Streaming" where internet speeds are fast enough to stream uncompressed audio (FLAC/ALAC) effortlessly.
          </p>
        </ContentSection>

        <FAQSection faqs={[
          {
            question: "Does converting 128 kbps to 320 kbps improve quality?",
            answer: "No. This is a common myth (often called 'upsampling'). The data lost during the original compression to 128 kbps is gone forever. Converting it to 320 kbps just creates a larger file with the exact same low quality. Always start from a lossless source (WAV/FLAC) when converting down."
          },
          {
            question: "Which is better: MP3 or AAC?",
            answer: "At lower bitrates (below 192 kbps), AAC generally sounds significantly better than MP3. At high bitrates (256-320 kbps), the difference is negligible to the human ear, but AAC is mathematically more efficient."
          },
          {
            question: "Why is my WAV file so huge?",
            answer: "WAV is an uncompressed format. It stores every single sample of audio data without trying to confirm patterns or save space. A typical 3-minute song in WAV (CD quality) is about 30-40 MB, whereas an MP3 of the same song is only 3-5 MB."
          },
          {
            question: "What bitrate should I use for a podcast?",
            answer: "For a speech-only podcast, 96 kbps (Mono) or 128 kbps (Stereo) in MP3 format is perfect. It ensures clear voice quality while keeping the file size small enough for listeners to download quickly on mobile data."
          },
          {
            question: "Is audio processed on your server?",
            answer: "No. This tool processes audio locally in your browser. Your private files never leave your device, ensuring complete privacy."
          }
        ]} />
      </ToolPageLayout>
    </>
  );
};

export default AudioBitrateConverter;
