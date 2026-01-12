import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/utility/password-generator.css';

const PasswordGenerator = () => {
  // Form state (scoped IDs and classes)
  const [password, setPassword] = useState('');
  const [passwordLength, setPasswordLength] = useState(16);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [excludeBrackets, setExcludeBrackets] = useState(false);
  const [noRepeats, setNoRepeats] = useState(false);
  const [strength, setStrength] = useState({ level: 'Medium', color: '#ffaa00', percentage: 60 });

  // Character sets
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*_-+=';
  const ambiguousChars = 'il1Lo0O';
  const bracketChars = '{}[]()<>';

  const generatePassword = () => {
    // Validate at least one character set is selected
    if (!includeLowercase && !includeUppercase && !includeNumbers && !includeSymbols) {
      alert('Please select at least one character set');
      return;
    }

    // Build character pool
    let charPool = '';

    if (includeLowercase) charPool += lowercaseChars;
    if (includeUppercase) charPool += uppercaseChars;
    if (includeNumbers) charPool += numberChars;
    if (includeSymbols) charPool += symbolChars;

    // Remove excluded characters
    if (excludeAmbiguous) {
      for (const char of ambiguousChars) {
        charPool = charPool.replace(new RegExp(char, 'g'), '');
      }
    }

    if (excludeBrackets) {
      for (const char of bracketChars) {
        charPool = charPool.replace(new RegExp('\\' + char, 'g'), '');
      }
    }

    // Check if no-repeats is possible with the selected length
    if (noRepeats && passwordLength > charPool.length) {
      alert(`Cannot generate a password with no repeats of length ${passwordLength} with the current character set (only ${charPool.length} unique characters available)`);
      return;
    }

    // Generate password
    let newPassword = '';

    if (noRepeats) {
      // For no repeats, shuffle the character pool and take the first 'length' characters
      const shuffledChars = charPool.split('').sort(() => 0.5 - Math.random());
      newPassword = shuffledChars.slice(0, passwordLength).join('');
    } else {
      // Generate random password
      for (let i = 0; i < passwordLength; i++) {
        const randomIndex = Math.floor(Math.random() * charPool.length);
        newPassword += charPool[randomIndex];
      }
    }

    // Ensure password meets requirements (at least one of each selected character type)
    let meetsRequirements = true;

    if (includeLowercase && !/[a-z]/.test(newPassword)) meetsRequirements = false;
    if (includeUppercase && !/[A-Z]/.test(newPassword)) meetsRequirements = false;
    if (includeNumbers && !/[0-9]/.test(newPassword)) meetsRequirements = false;
    if (includeSymbols && !/[!@#$%^&*_\-+=]/.test(newPassword)) meetsRequirements = false;

    if (!meetsRequirements) {
      // Try again if requirements not met
      generatePassword();
      return;
    }

    setPassword(newPassword);
    updateStrengthIndicator(newPassword);
  };

  const updateStrengthIndicator = (generatedPassword = null) => {
    // Calculate potential strength even without a generated password
    let strengthValue = 0;

    // Length factor (0-40 points)
    strengthValue += Math.min(40, passwordLength * 2.5);

    // Character set diversity (0-60 points)
    let charsetCount = 0;
    if (includeLowercase) charsetCount++;
    if (includeUppercase) charsetCount++;
    if (includeNumbers) charsetCount++;
    if (includeSymbols) charsetCount++;

    strengthValue += charsetCount * 15;

    // Normalize to 0-100
    strengthValue = Math.min(100, strengthValue);

    // Set color and text based on strength
    let color, text;

    if (strengthValue < 40) {
      color = '#ff4d4d'; // Red
      text = 'Weak';
    } else if (strengthValue < 70) {
      color = '#ffaa00'; // Orange
      text = 'Medium';
    } else if (strengthValue < 90) {
      color = '#2bd62b'; // Green
      text = 'Strong';
    } else {
      color = '#00aaff'; // Blue
      text = 'Very Strong';
    }

    setStrength({ level: text, color, percentage: strengthValue });
  };

  const copyPassword = async () => {
    if (!password) return;

    try {
      await navigator.clipboard.writeText(password);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const resetOptions = () => {
    setIncludeLowercase(true);
    setIncludeUppercase(true);
    setIncludeNumbers(true);
    setIncludeSymbols(false);
    setExcludeAmbiguous(false);
    setExcludeBrackets(false);
    setNoRepeats(false);
    setPasswordLength(16);
    setPassword('');
    updateStrengthIndicator();
  };

  // Update strength indicator when options change
  useEffect(() => {
    updateStrengthIndicator();
  }, [passwordLength, includeLowercase, includeUppercase, includeNumbers, includeSymbols]);

  const toolData = {
    name: 'Password Generator',
    title: 'Password Generator',
    description: 'Generate secure, customizable passwords with various character sets, length options, and strength indicators.',
    icon: 'fas fa-key',
    category: 'utility',
    breadcrumb: ['Utility', 'Tools', 'Password Generator'],
    tags: ['password', 'security', 'generator', 'utility', 'crypto']
  };

  const sidebarCategories = [
    { name: 'Utility Tools', url: '/utility-tools', icon: 'fas fa-tools' },
    { name: 'Math Calculators', url: '/math', icon: 'fas fa-calculator' },
    { name: 'Finance Calculators', url: '/finance', icon: 'fas fa-dollar-sign' },
    { name: 'Health Calculators', url: '/health', icon: 'fas fa-heartbeat' },
    { name: 'Knowledge Tools', url: '/knowledge', icon: 'fas fa-brain' },
    { name: 'Science Calculators', url: '/science', icon: 'fas fa-flask' }
  ];

  const relatedTools = [
    { name: 'QR Code Generator', url: '/utility-tools/qr-code-generator', icon: 'fas fa-qrcode' },
    { name: 'Text Case Converter', url: '/utility-tools/converter-tools/text-case-converter', icon: 'fas fa-font' },
    { name: 'Binary Converter', url: '/math/calculators/binary-calculator', icon: 'fas fa-exchange-alt' },
    { name: 'Hash Generator', url: '/utility-tools/hash-generator', icon: 'fas fa-fingerprint' }
  ];

  const faqs = [
    { question: 'What makes a password strong?', answer: 'A strong password combines length (12+ characters), multiple character types (uppercase, lowercase, numbers, symbols), and avoids common patterns or dictionary words.' },
    { question: 'Should I exclude ambiguous characters?', answer: 'Excluding ambiguous characters (like 0, O, l, 1) can help avoid confusion when manually typing passwords, but it slightly reduces security.' },
    { question: 'What is the no-repeats option?', answer: 'No-repeats ensures each character appears only once in the password, but requires the password length to be less than or equal to the available character set size.' }
  ];

  const tableOfContents = [
    { id: 'passgen-introduction', title: 'Introduction' },
    { id: 'passgen-what-is', title: 'What is Password Security?' },
    { id: 'passgen-howto', title: 'How to Use' },
    { id: 'passgen-calculation-method', title: 'Generation Method' },
    { id: 'passgen-examples', title: 'Examples' },
    { id: 'passgen-significance', title: 'Significance' },
    { id: 'passgen-functionality', title: 'Functionality' },
    { id: 'passgen-applications', title: 'Applications' }
  ];

  return (
    <ToolPageLayout toolData={toolData} categories={sidebarCategories} relatedTools={relatedTools}>
      <CalculatorSection>
        <div className="passgen-page">
          <div className="passgen-container">
            <div className="passgen-form">
              <div className="passgen-row">
                <label htmlFor="passgen-length">Password Length: {passwordLength}</label>
                <input 
                  id="passgen-length"
                  type="range" 
                  min="8" 
                  max="64" 
                  value={passwordLength}
                  onChange={(e) => setPasswordLength(parseInt(e.target.value))}
                  className="passgen-slider"
                />
                <input 
                  type="number" 
                  min="8" 
                  max="64" 
                  value={passwordLength}
                  onChange={(e) => {
                    const val = Math.min(64, Math.max(8, parseInt(e.target.value) || 8));
                    setPasswordLength(val);
                  }}
                  className="passgen-length-input"
                />
              </div>

              <div className="passgen-row">
                <h3>Character Sets</h3>
                <div className="passgen-checkboxes">
                  <label className="passgen-checkbox">
                    <input 
                      type="checkbox" 
                      checked={includeLowercase}
                      onChange={(e) => setIncludeLowercase(e.target.checked)}
                    />
                    <span>Lowercase (a-z)</span>
                  </label>
                  <label className="passgen-checkbox">
                    <input 
                      type="checkbox" 
                      checked={includeUppercase}
                      onChange={(e) => setIncludeUppercase(e.target.checked)}
                    />
                    <span>Uppercase (A-Z)</span>
                  </label>
                  <label className="passgen-checkbox">
                    <input 
                      type="checkbox" 
                      checked={includeNumbers}
                      onChange={(e) => setIncludeNumbers(e.target.checked)}
                    />
                    <span>Numbers (0-9)</span>
                  </label>
                  <label className="passgen-checkbox">
                    <input 
                      type="checkbox" 
                      checked={includeSymbols}
                      onChange={(e) => setIncludeSymbols(e.target.checked)}
                    />
                    <span>Symbols (!@#$%^&*)</span>
                  </label>
                </div>
              </div>

              <div className="passgen-row">
                <h3>Options</h3>
                <div className="passgen-checkboxes">
                  <label className="passgen-checkbox">
                    <input 
                      type="checkbox" 
                      checked={excludeAmbiguous}
                      onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                    />
                    <span>Exclude ambiguous characters (il1Lo0O)</span>
                  </label>
                  <label className="passgen-checkbox">
                    <input 
                      type="checkbox" 
                      checked={excludeBrackets}
                      onChange={(e) => setExcludeBrackets(e.target.checked)}
                    />
                    <span>Exclude brackets ({}[]())</span>
                  </label>
                  <label className="passgen-checkbox">
                    <input 
                      type="checkbox" 
                      checked={noRepeats}
                      onChange={(e) => setNoRepeats(e.target.checked)}
                    />
                    <span>No repeating characters</span>
                  </label>
                </div>
              </div>

              <div className="passgen-actions">
                <button className="passgen-generate" onClick={generatePassword}>
                  <i className="fas fa-key"></i> Generate Password
                </button>
                <button className="passgen-reset" onClick={resetOptions}>
                  <i className="fas fa-undo"></i> Reset
                </button>
              </div>
            </div>

            <div className="passgen-results">
              <div className="passgen-strength">
                <h3>Password Strength</h3>
                <div className="passgen-strength-bar">
                  <div 
                    className="passgen-strength-fill"
                    style={{ 
                      width: `${strength.percentage}%`,
                      backgroundColor: strength.color
                    }}
                  ></div>
                </div>
                <span className="passgen-strength-text" style={{ color: strength.color }}>
                  {strength.level}
                </span>
              </div>

              <div className="passgen-output">
                <h3>Generated Password</h3>
                <div className="passgen-password-display">
                  <input 
                    type="text" 
                    value={password || 'Generate a password to see it here'}
                    readOnly
                    className="passgen-password-input"
                  />
                  <button className="passgen-copy" onClick={copyPassword}>
                    <i className="fas fa-copy"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CalculatorSection>

      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

      <div className="passgen-content">
        <ContentSection id="passgen-introduction" title="Introduction">
          <p>Create secure, customizable passwords with our advanced Password Generator. Choose from multiple character sets, adjust length from 8 to 64 characters, and get real-time strength feedback. Perfect for accounts, applications, and any system requiring strong authentication.</p>
          <p>Our generator uses cryptographically secure random number generation and ensures your passwords meet complexity requirements while avoiding common weak patterns. Export generated passwords securely to your clipboard with one click.</p>
        </ContentSection>

        <ContentSection id="passgen-what-is" title="What is Password Security?">
          <p>Password security involves creating strong, unique passwords that resist common attack methods like brute force, dictionary attacks, and social engineering. A secure password combines length, complexity, and unpredictability to protect your digital accounts and sensitive information.</p>
          <p>Modern security best practices recommend passwords of at least 12 characters using multiple character types, avoiding personal information, and using unique passwords for each account. Password managers can help store and organize these complex passwords securely.</p>
        </ContentSection>

        <ContentSection id="passgen-howto" title="How to Use the Password Generator">
          <ul className="usage-steps">
            <li><strong>Set Password Length:</strong> Use the slider or input field to choose password length (8-64 characters). Longer passwords are generally more secure.</li>
            <li><strong>Select Character Sets:</strong> Choose which character types to include (lowercase, uppercase, numbers, symbols). More character types increase security.</li>
            <li><strong>Configure Advanced Options:</strong> Exclude ambiguous characters (il1Lo0O) or brackets ({}[]()) to avoid confusion when typing.</li>
            <li><strong>Enable No-Repeats:</strong> Optionally enable no-repeats mode to ensure each character appears only once in the password.</li>
            <li><strong>Generate Password:</strong> Click "Generate Password" to create a secure password based on your criteria.</li>
            <li><strong>Check Strength Indicator:</strong> Review the real-time strength analysis and adjust settings if needed.</li>
            <li><strong>Copy & Use:</strong> Copy the generated password to your clipboard and use it immediately for your accounts.</li>
          </ul>
        </ContentSection>

        <ContentSection id="passgen-calculation-method" title="Password Generation Method">
          <div className="assessment-method-section">
            <p>Our password generator uses a sophisticated approach to create secure passwords:</p>
            <ul>
              <li><strong>Cryptographically Secure Random:</strong> Uses browser's built-in random number generation for true randomness</li>
              <li><strong>Character Set Validation:</strong> Ensures generated passwords contain at least one character from each selected set</li>
              <li><strong>Strength Calculation:</strong> Real-time analysis based on length and character diversity (0-100 scale)</li>
              <li><strong>Ambiguity Filtering:</strong> Option to exclude confusing characters that look similar (0, O, l, 1)</li>
              <li><strong>No-Repeats Algorithm:</strong> Advanced shuffling ensures unique characters when possible</li>
              <li><strong>Multi-Attempt Validation:</strong> Regenerates passwords that don't meet complexity requirements</li>
            </ul>
          </div>
        </ContentSection>

        <ContentSection id="passgen-examples" title="Examples">
          <ul className="example-steps">
            <li>
              <strong>Basic Password (16 chars, letters + numbers):</strong> "Kj9mN2pQ7rS4tU1v"
              <br /><strong>Strength:</strong> Medium (60/100) - Good length but limited character diversity
            </li>
            <li>
              <strong>Strong Password (20 chars, all character types):</strong> "M@x9#nP2$qR5&wT8!"
              <br /><strong>Strength:</strong> Very Strong (95/100) - Excellent length and full character diversity
            </li>
            <li>
              <strong>No-Repeats Password (unique characters only):</strong> "Bx7#mK9$nP2&qR5wT"
              <br /><strong>Strength:</strong> Strong (85/100) - All unique characters with good diversity
            </li>
            <li>
              <strong>Exclude Ambiguous (no confusing chars):</strong> "H@k9#nP2$qR5&wT8!"
              <br /><strong>Strength:</strong> Very Strong (90/100) - High security without confusing characters
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="passgen-significance" title="Significance of Strong Passwords">
          <p>Strong passwords are essential for protecting your digital identity and sensitive information:</p>
          <ul>
            <li><strong>Account Protection:</strong> Prevents unauthorized access to your personal and professional accounts</li>
            <li><strong>Data Security:</strong> Protects sensitive information from cybercriminals and data breaches</li>
            <li><strong>Identity Theft Prevention:</strong> Reduces risk of identity theft and financial fraud</li>
            <li><strong>Business Security:</strong> Essential for protecting corporate data and maintaining business continuity</li>
            <li><strong>Compliance Requirements:</strong> Meets security standards for various industries and regulations</li>
            <li><strong>Peace of Mind:</strong> Provides confidence that your digital assets are properly secured</li>
          </ul>
        </ContentSection>

        <ContentSection id="passgen-functionality" title="Functionality">
          <p>Our Password Generator provides comprehensive functionality for creating secure passwords:</p>
          <ul>
            <li><strong>Flexible Length Control:</strong> Generate passwords from 8 to 64 characters with slider and input controls</li>
            <li><strong>Multiple Character Sets:</strong> Choose from lowercase, uppercase, numbers, and symbols</li>
            <li><strong>Advanced Filtering:</strong> Exclude ambiguous characters or brackets to avoid typing confusion</li>
            <li><strong>No-Repeats Mode:</strong> Ensure each character appears only once in the generated password</li>
            <li><strong>Real-time Strength Analysis:</strong> Instant feedback on password strength with color-coded indicators</li>
            <li><strong>One-Click Copy:</strong> Secure clipboard integration for immediate password use</li>
            <li><strong>Validation System:</strong> Automatic regeneration if passwords don't meet complexity requirements</li>
            <li><strong>Reset Functionality:</strong> Quick reset to default settings for new password generation</li>
          </ul>
        </ContentSection>

        <ContentSection id="passgen-applications" title="Applications">
          <div className="applications-grid">
            <div className="application-item">
              <h3>Personal Accounts</h3>
              <p>Create unique, strong passwords for social media, email, banking, and e-commerce accounts to protect your personal information.</p>
            </div>
            <div className="application-item">
              <h3>Workplace Security</h3>
              <p>Generate secure passwords for corporate systems, VPN access, administrative accounts, and business applications.</p>
            </div>
            <div className="application-item">
              <h3>Application Development</h3>
              <p>Create test passwords, API keys, secure tokens, and authentication credentials for software development projects.</p>
            </div>
            <div className="application-item">
              <h3>Network Security</h3>
              <p>Generate passwords for home networks, Wi-Fi routers, smart devices, and personal file encryption systems.</p>
            </div>
            <div className="application-item">
              <h3>Educational Use</h3>
              <p>Teach students about password security, demonstrate password strength concepts, and create secure academic accounts.</p>
            </div>
            <div className="application-item">
              <h3>Security Auditing</h3>
              <p>Create test passwords for security assessments, penetration testing, and vulnerability analysis projects.</p>
            </div>
          </div>
        </ContentSection>

        <FAQSection faqs={faqs} />
      </div>
    </ToolPageLayout>
  );
};

export default PasswordGenerator;
