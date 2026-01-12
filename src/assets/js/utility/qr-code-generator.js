/**
 * QR Code Generator JavaScript
 * Handles QR code generation using QRious library
 * Individual classes and IDs for scoping
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get form elements with individual IDs
    const qrText = document.getElementById('qrgen-text');
    const qrStyle = document.getElementById('qrgen-style');
    const fgColor = document.getElementById('qrgen-fg-color');
    const bgColor = document.getElementById('qrgen-bg-color');
    const qrTemplate = document.getElementById('qrgen-template');
    const customTextGroup = document.getElementById('qrgen-custom-text-group');
    const customText = document.getElementById('qrgen-custom-text');
    const logoInput = document.getElementById('qrgen-logo');
    const qrPreview = document.getElementById('qrgen-preview');
    const generateBtn = document.getElementById('qrgen-generate-btn');
    
    // Show/hide custom text input based on template selection
    if (qrTemplate) {
        qrTemplate.addEventListener('change', function() {
            if (customTextGroup) {
                customTextGroup.style.display = 
                    this.value === 'custom' ? 'block' : 'none';
            }
        });
    }

    // Generate QR code function
    function generateQR() {
        if (!qrText || !qrText.value) {
            alert('Please enter text or URL to generate QR code');
            return;
        }

        if (!window.QRious) {
            alert('QR code library not loaded. Please refresh the page.');
            return;
        }

        // Clear previous QR code
        if (qrPreview) {
            qrPreview.innerHTML = '';
            qrPreview.style.display = 'block';
        }

        // Generate QR code
        const qr = new window.QRious({
            value: qrText.value,
            size: 512,
            foreground: fgColor ? fgColor.value : '#000000',
            background: 'transparent',
            padding: 0,
            level: 'H'
        });

        // Create image element for QR code
        const qrImage = new Image();
        qrImage.src = qr.toDataURL();
        
        // Wait for QR image to load before drawing
        qrImage.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size and add space for text if needed
            if (qrTemplate && qrTemplate.value === 'custom' && customText && customText.value) {
                canvas.width = 512;
                canvas.height = 612;
                
                // Make canvas background transparent
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Calculate QR code position to center it
                const qrPadding = 40;
                const qrSize = 512 - (qrPadding * 2);
                
                // Draw QR code with padding
                ctx.drawImage(qrImage, qrPadding, qrPadding, qrSize, qrSize);
                
                // Add custom text with modern styling
                const textY = 565;
                const fontSize = 28;
                ctx.font = `bold ${fontSize}px Arial`;
                const textWidth = ctx.measureText(customText.value).width;
                const textPadding = 20;
                
                // Draw text background with rounded corners
                ctx.fillStyle = '#FFFFFF';
                const textBgRadius = 8;
                roundRect(
                    ctx,
                    (canvas.width - textWidth) / 2 - textPadding,
                    textY - fontSize,
                    textWidth + (textPadding * 2),
                    fontSize + textPadding,
                    textBgRadius
                );
                
                // Draw text
                ctx.fillStyle = '#000000';
                ctx.textAlign = 'center';
                ctx.fillText(customText.value, canvas.width / 2, textY);

                // Handle logo if present
                if (logoInput && logoInput.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const logo = new Image();
                        logo.src = e.target.result;
                        logo.onload = function() {
                            // Calculate center position for logo
                            const centerSize = qrSize * 0.25;
                            const centerX = qrPadding + (qrSize - centerSize) / 2;
                            const centerY = qrPadding + (qrSize - centerSize) / 2;
                            
                            // Clear center area
                            ctx.clearRect(centerX, centerY, centerSize, centerSize);
                            
                            // Draw logo slightly smaller than cleared area
                            const logoSize = centerSize * 0.9;
                            const logoX = centerX + (centerSize - logoSize) / 2;
                            const logoY = centerY + (centerSize - logoSize) / 2;
                            ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
                            
                            if (qrPreview) {
                                qrPreview.appendChild(canvas);
                            }
                        };
                    };
                    reader.readAsDataURL(logoInput.files[0]);
                } else {
                    // If no logo, don't clear the center
                    if (qrPreview) {
                        qrPreview.appendChild(canvas);
                    }
                }
            } else {
                // Standard QR code without text
                canvas.width = 512;
                canvas.height = 512;
                
                // Calculate QR code position to center it
                const qrPadding = 40;
                const qrSize = 512 - (qrPadding * 2);
                
                // Draw QR code with padding
                ctx.drawImage(qrImage, qrPadding, qrPadding, qrSize, qrSize);
                
                if (logoInput && logoInput.files[0]) {
                    // Handle logo for standard QR code
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const logo = new Image();
                        logo.src = e.target.result;
                        logo.onload = function() {
                            const centerSize = qrSize * 0.25;
                            const centerX = qrPadding + (qrSize - centerSize) / 2;
                            const centerY = qrPadding + (qrSize - centerSize) / 2;
                            
                            ctx.clearRect(centerX, centerY, centerSize, centerSize);
                            
                            const logoSize = centerSize * 0.9;
                            const logoX = centerX + (centerSize - logoSize) / 2;
                            const logoY = centerY + (centerSize - logoSize) / 2;
                            ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
                            
                            if (qrPreview) {
                                qrPreview.appendChild(canvas);
                            }
                        };
                    };
                    reader.readAsDataURL(logoInput.files[0]);
                } else {
                    // If no logo, don't clear the center
                    if (qrPreview) {
                        qrPreview.appendChild(canvas);
                    }
                }
            }
        };
    }

    // Generate button click event
    if (generateBtn) {
        generateBtn.addEventListener('click', generateQR);
    }

    // Generate on Enter key in text input
    if (qrText) {
        qrText.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                generateQR();
            }
        });
    }

    // Export buttons
    document.querySelectorAll('.qrgen-export-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!qrPreview || !qrPreview.firstChild) {
                alert('Please generate a QR code first');
                return;
            }
            const format = this.dataset.format;
            const canvas = qrPreview.querySelector('canvas') || 
                         convertImageToCanvas(qrPreview.querySelector('img'));
            
            // Set proper MIME type and handle transparency
            let mimeType = 'image/png';
            let quality = 1;
            
            switch(format) {
                case 'png':
                    mimeType = 'image/png';
                    break;
                case 'webp':
                    mimeType = 'image/webp';
                    break;
                case 'jpeg':
                    mimeType = 'image/jpeg';
                    // Fill white background for JPEG
                    const ctx = canvas.getContext('2d');
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    break;
            }
            
            // Convert to desired format and download
            const link = document.createElement('a');
            link.download = `qr-code.${format}`;
            link.href = canvas.toDataURL(mimeType, quality);
            link.click();
        });
    });

    // Hide QR preview section initially
    if (qrPreview) {
        qrPreview.style.display = 'none';
    }
});

// Helper function to convert image to canvas
function convertImageToCanvas(image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    return canvas;
}

// Helper function to draw rounded rectangles
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

// Load QRious library dynamically
function loadQRiousLibrary() {
    return new Promise((resolve, reject) => {
        if (window.QRious) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load QRious library'));
        document.head.appendChild(script);
    });
}

// Initialize QR Code Generator
function initQRCodeGenerator() {
    loadQRiousLibrary()
        .then(() => {
            console.log('QR Code Generator initialized successfully');
        })
        .catch(error => {
            console.error('Error initializing QR Code Generator:', error);
        });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQRCodeGenerator);
} else {
    initQRCodeGenerator();
}



