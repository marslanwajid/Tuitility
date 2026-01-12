import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FeedbackForm from '../tool/FeedbackForm';
import TableOfContents from '../tool/TableOfContents';
import { toolCategories } from '../CategoryNavigation';
import '../../assets/css/utility/rgb-to-hex-converter.css';

const RgbToHexConverter = () => {
  const [rgb, setRgb] = useState({ r: 255, g: 0, b: 0 });
  const [hex, setHex] = useState('FF0000');
  const [copied, setCopied] = useState({ rgb: false, hex: false });

  const toolData = {
    name: "RGB to HEX Converter",
    desc: "Convert RGB color values to Hexadecimal color codes.",
    category: "Utility",
    icon: "fas fa-palette",
    path: "/utility-tools/rgb-to-hex-converter",
    breadcrumb: ["Utility", "Tools", "RGB to Hex"]
  };

  const relatedTools = [
      {
        id: "image-color-picker",
        name: "Image Color Picker",
        desc: "Pick colors from images",
        path: "/utility-tools/image-color-picker",
        icon: "fas fa-eye-dropper"
      },
      {
        id: "aspect-ratio-converter",
        name: "Aspect Ratio Calculator",
        desc: "Calculate aspect ratios",
        path: "/utility-tools/image-tools/aspect-ratio-converter",
        icon: "fas fa-compress"
      }
  ];

  const tableOfContents = [
      { id: 'converter', title: 'Converter' },
      { id: 'introduction', title: 'Introduction' },
      { id: 'how-it-works', title: 'How it Works' },
      { id: 'rgb-model', title: 'RGB Color Model' },
      { id: 'hex-code', title: 'Hexadecimal Color Code' },
      { id: 'web-design', title: 'Web Design & CSS' },
      { id: 'color-theory', title: 'Color Theory Basics' },
      { id: 'accessibility', title: 'Accessibility & Contrast' },
      { id: 'common-colors', title: 'Common Color Codes' },
      { id: 'faq', title: 'FAQ' }
  ];

  const faqs = [
      { 
        question: "What is the difference between RGB and Hex?", 
        answer: "RGB uses decimal numbers (0-255) to define the intensity of Red, Green, and Blue light. Hex uses a 6-digit hexadecimal format (0-9, A-F) to represent the same values. They result in the exact same color, but Hex is more compact and commonly used in HTML/CSS." 
      },
      { 
        question: "How do I convert RGB to Hex manually?", 
        answer: "To convert RGB to Hex manually, take the decimal value of each color channel (Red, Green, Blue) and convert it to base-16. For example, RGB(255, 0, 0): 255 in hex is FF, 0 is 00, 0 is 00. Result: #FF0000." 
      },
      { 
        question: "Why do some Hex codes have only 3 digits?", 
        answer: "A 3-digit Hex code is a shorthand for a 6-digit code where each digit is repeated. For example, #F00 expands to #FF0000. This only works when each pair of characters is identical (e.g., #112233 can be #123)." 
      },
      { 
        question: "What is an Alpha channel (RGBA)?", 
        answer: "The Alpha channel represents opacity or transparency. In RGBA(255, 0, 0, 0.5), the 0.5 indicates 50% transparency. In Hex, this is represented by two extra digits at the end (e.g., #FF000080)." 
      },
      { 
        question: "What is the range of RGB values?", 
        answer: "Each color channel (Red, Green, Blue) ranges from 0 to 255. 0 means no light (dark), and 255 means full intensity. Combined, this allows for 16,777,216 possible color combinations." 
      },
  ];

  const rgbToHex = (r, g, b) => {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  };

  const hexToRgb = (hex) => {
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const handleRgbChange = (key, value) => {
      let val = parseInt(value);
      if (isNaN(val)) val = 0;
      val = Math.max(0, Math.min(255, val));

      const newRgb = { ...rgb, [key]: val };
      setRgb(newRgb);
      setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleHexChange = (value) => {
      // Remove non-hex chars
      let cleanHex = value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
      setHex(cleanHex);

      if (cleanHex.length === 6) {
          const newRgb = hexToRgb(cleanHex);
          if (newRgb) {
              setRgb(newRgb);
          }
      }
  };

  const handleColorPicker = (e) => {
      const val = e.target.value.substring(1).toUpperCase();
      handleHexChange(val);
  };

  const copyToClipboard = async (type) => {
      let text = type === 'rgb' ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : `#${hex}`;
      try {
          await navigator.clipboard.writeText(text);
          setCopied({ ...copied, [type]: true });
          setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
      } catch (err) {
          console.error("Failed to copy", err);
      }
  };

  const getContrastColor = (r, g, b) => {
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  return (
    <ToolPageLayout toolData={toolData} categories={toolCategories} relatedTools={relatedTools} tableOfContents={tableOfContents}>

      <CalculatorSection title="RGB <-> Hex Converter" icon="fas fa-palette">
          <div className="rgb-converter-container" id="converter">
              
              <div className="rgb-controls">
                  <div className="rgb-group">
                      <label>RGB Color</label>
                      <div className="rgb-inputs">
                          <div className="rgb-input-wrapper">
                              <label>R</label>
                              <input type="number" value={rgb.r} onChange={(e) => handleRgbChange('r', e.target.value)} />
                          </div>
                          <div className="rgb-input-wrapper">
                              <label>G</label>
                              <input type="number" value={rgb.g} onChange={(e) => handleRgbChange('g', e.target.value)} />
                          </div>
                          <div className="rgb-input-wrapper">
                              <label>B</label>
                              <input type="number" value={rgb.b} onChange={(e) => handleRgbChange('b', e.target.value)} />
                          </div>
                      </div>
                      <button className={`rgb-copy-btn ${copied.rgb ? 'active' : ''}`} onClick={() => copyToClipboard('rgb')}>
                          {copied.rgb ? <><i className="fas fa-check"></i> Copied!</> : <><i className="fas fa-copy"></i> Copy RGB</>}
                      </button>
                  </div>

                  <div className="rgb-group">
                      <label>Hex Color</label>
                      <div className="hex-input-wrapper">
                          <span className="hex-hash">#</span>
                          <input type="text" value={hex} onChange={(e) => handleHexChange(e.target.value)} maxLength={6} />
                      </div>
                      <button className={`rgb-copy-btn ${copied.hex ? 'active' : ''}`} onClick={() => copyToClipboard('hex')}>
                          {copied.hex ? <><i className="fas fa-check"></i> Copied!</> : <><i className="fas fa-copy"></i> Copy Hex</>}
                      </button>
                  </div>
              </div>

              <div className="rgb-preview-section">
                  <div className="rgb-color-preview" style={{ 
                      backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
                      color: getContrastColor(rgb.r, rgb.g, rgb.b)
                  }}>
                      <div className="rgb-preview-text">
                          <span>#{hex}</span>
                          <small>rgb({rgb.r}, {rgb.g}, {rgb.b})</small>
                      </div>
                      <input type="color" className="rgb-hidden-picker" value={`#${hex.length === 6 ? hex : '000000'}`} onChange={handleColorPicker} />
                      <div className="rgb-picker-hint">Click to Pick Color</div>
                  </div>
              </div>

          </div>
      </CalculatorSection>

      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

      <ContentSection id="introduction" title="Introduction">
          <div className="content-block">
              <p>In the digital world, color is more than just aesthetics; it's data. The two most common ways to represent this data are RGB (Red, Green, Blue) and Hex (Hexadecimal). While they describe the exact same colors, they speak different languages. RGB uses decimal numbers friendly to human logic, while Hex uses a compact alphanumeric code optimized for computers and code.</p>
              <p>This <strong>RGB to Hex Converter</strong> bridges that gap, allowing designers, developers, and artists to seamlessly translate between these two standards. Whether you're tweaking CSS for a website, setting up a brand palette, or editing digital art, understanding and converting these formats is an essential skill.</p>
          </div>
      </ContentSection>

      <ContentSection id="how-it-works" title="How the Conversion Works">
          <div className="content-block">
              <p>The conversion between RGB and Hex is mathematical. RGB specifies the intensity of Red, Green, and Blue light on a scale of 0 to 255. When we convert this to Hex, we are simply changing the base numbering system from <strong>Decimal (Base-10)</strong> to <strong>Hexadecimal (Base-16)</strong>.</p>
              <p>For example, to convert RGB(255, 0, 0) (Pure Red):</p>
              <ul>
                  <li>Red: 255 in decimal becomes <strong>FF</strong> in hex.</li>
                  <li>Green: 0 in decimal becomes <strong>00</strong> in hex.</li>
                  <li>Blue: 0 in decimal becomes <strong>00</strong> in hex.</li>
              </ul>
              <p>Combining these gives us <strong>#FF0000</strong>.</p>
          </div>
      </ContentSection>

      <ContentSection id="rgb-model" title="What is the RGB Color Model?">
          <div className="content-block">
              <p>RGB is an <strong>additive color model</strong>. This means it creates colors by adding light together. It is the standard for anything that emits light, such as computer monitors, television screens, and smartphone displays.</p>
              <h3>Key Characteristics:</h3>
              <ul>
                  <li><strong>Channels:</strong> Consists of three channels: Red, Green, and Blue.</li>
                  <li><strong>Range:</strong> Each channel has a value from 0 (no light) to 255 (maximum intensity).</li>
                  <li><strong>Combinations:</strong> With 256 variations per channel, RGB can produce over 16.7 million distinct colors (256 x 256 x 256).</li>
                  <li><strong>White & Black:</strong> RGB(255, 255, 255) is pure white, while RGB(0, 0, 0) is pure black.</li>
              </ul>
          </div>
      </ContentSection>

      <ContentSection id="hex-code" title="Understanding Hexadecimal Color Codes">
          <div className="content-block">
              <p>A Hex code is a six-digit, alphanumeric representation of a color. It is heavily used in HTML, CSS, and SVG format. The format essentially packs the three RGB values into a single string starting with a hash (#).</p>
              <h3>Structure breakdown (#RRGGBB):</h3>
              <ul>
                  <li><strong>RR:</strong> The first two characters represent the Red value.</li>
                  <li><strong>GG:</strong> The middle two characters represent the Green value.</li>
                  <li><strong>BB:</strong> The last two characters represent the Blue value.</li>
              </ul>
              <p>Because it uses Base-16, the digits go from 0-9 and then A-F (where A=10, B=11... F=15). <strong>FF</strong> represents the maximum value (255).</p>
          </div>
      </ContentSection>

      <ContentSection id="web-design" title="Usage in Web Design & CSS">
          <div className="content-block">
              <p>Hex codes are the industry standard for web design due to their compactness. It is much faster to type <code>#333</code> (using shorthand) than <code>rgb(51, 51, 51)</code>. However, modern CSS has evolved.</p>
              <h3>When to use what:</h3>
              <ul>
                  <li><strong>Use Hex:</strong> For static, solid colors. It's concise and universally supported.</li>
                  <li><strong>Use RGB/RGBA:</strong> When you need to programmatically adjust values or, more importantly, when you need <strong>transparency</strong> (alpha channel).</li>
                  <li><strong>Use HSL:</strong> When you need to create color variations (lighter, darker) by adjusting specific attributes like lightness or saturation.</li>
              </ul>
          </div>
      </ContentSection>

      <ContentSection id="color-theory" title="Color Theory Basics">
          <div className="content-block">
              <p>Understanding how RGB/Hex values relate to color theory can help you pick better colors:</p>
              <ul>
                  <li><strong>Grayscale:</strong> If R, G, and B values are equal (e.g., #808080 or rgb(128,128,128)), the result is a shade of gray.</li>
                  <li><strong>Warm Colors:</strong> Higher values in the Red channel mixed with Green typically produce warm tones like oranges and yellows.</li>
                  <li><strong>Cool Colors:</strong> Dominant Blue and Green values create cool, calming tones like teals and azures.</li>
                  <li><strong>Complementary:</strong> Inverting the RGB values (255 - value) gives you the mathematical opposite color, which provides high contrast.</li>
              </ul>
          </div>
      </ContentSection>

      <ContentSection id="accessibility" title="Accessibility & Contrast">
          <div className="content-block">
              <p>When selecting colors for text and backgrounds, contrast is critical for accessibility. The Web Content Accessibility Guidelines (WCAG) recommend a contrast ratio of at least 4.5:1 for normal text.</p>
              <p><strong>Tip:</strong> You can calculate the relative luminance of a color using its RGB values. Our tool automatically adjusts the text color in the preview box (black or white) based on the background brightness to demonstrate this principle of readable contrast.</p>
          </div>
      </ContentSection>

       <ContentSection id="common-colors" title="Common Color Codes Cheat Sheet">
          <div className="content-block">
              <p>Here are some of the most frequently used colors in web design along with their RGB and Hex equivalents:</p>
              <div className="table-container">
                  <table className="standard-table">
                      <thead>
                          <tr>
                              <th>Color Name</th>
                              <th>Hex Code</th>
                              <th>RGB Value</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr><td>Black</td><td>#000000</td><td>rgb(0, 0, 0)</td></tr>
                          <tr><td>White</td><td>#FFFFFF</td><td>rgb(255, 255, 255)</td></tr>
                          <tr><td>Red</td><td>#FF0000</td><td>rgb(255, 0, 0)</td></tr>
                          <tr><td>Green (Lime)</td><td>#00FF00</td><td>rgb(0, 255, 0)</td></tr>
                          <tr><td>Blue</td><td>#0000FF</td><td>rgb(0, 0, 255)</td></tr>
                          <tr><td>Yellow</td><td>#FFFF00</td><td>rgb(255, 255, 0)</td></tr>
                          <tr><td>Cyan</td><td>#00FFFF</td><td>rgb(0, 255, 255)</td></tr>
                          <tr><td>Magenta</td><td>#FF00FF</td><td>rgb(255, 0, 255)</td></tr>
                          <tr><td>Silver</td><td>#C0C0C0</td><td>rgb(192, 192, 192)</td></tr>
                          <tr><td>Gray</td><td>#808080</td><td>rgb(128, 128, 128)</td></tr>
                      </tbody>
                  </table>
              </div>
          </div>
      </ContentSection>

      <ContentSection id="faq" title="Frequently Asked Questions">
          <div className="content-block">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <h3 className="faq-question">{faq.question}</h3>
                <p className="faq-answer">{faq.answer}</p>
              </div>
            ))}
          </div>
      </ContentSection>
      
    </ToolPageLayout>
  );
};

export default RgbToHexConverter;
