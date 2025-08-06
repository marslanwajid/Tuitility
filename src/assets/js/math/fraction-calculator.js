console.log('Fraction calculator script loaded');

window.addEventListener('error', function(event) {
    console.error('Caught unhandled error:', event.error);
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');

    const fractionCalculatorForm = document.getElementById('calculator-form');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Set default values for 2 fractions tab
    setDefaultValues();

    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding tab
            button.classList.add('active');
            const targetTab = document.getElementById(tabId);
            if (targetTab) {
                targetTab.classList.add('active');
            }
            
            // Reset form and hide results when switching tabs
            if (fractionCalculatorForm) {
                fractionCalculatorForm.reset();
                setDefaultValues();
                hideResult();
            }
        });
    });

    console.log('Form found:', !!fractionCalculatorForm);

    if (fractionCalculatorForm) {
        fractionCalculatorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            
            try {
                const activeTab = document.querySelector('.tab-content.active');
                if (!activeTab) {
                    throw new Error('No active tab found');
                }

                const fractions = Array.from(activeTab.querySelectorAll('.input-group'));
                const operators = Array.from(activeTab.querySelectorAll('.operator-select'));
                
                console.log('Found fractions:', fractions.length, 'operators:', operators.length);
                
                if (fractions.length === 0) {
                    throw new Error('No fraction inputs found');
                }

                let result = calculateFractions(fractions, operators);
                displayResult(result);
            } catch (error) {
                console.error('Error in form submission:', error);
                displayError('Calculation error. Please check your inputs and try again.');
            }
        });

        fractionCalculatorForm.addEventListener('reset', function() {
            setTimeout(() => {
                setDefaultValues();
                hideResult();
            }, 10);
        });
    }

    // Set default values for demonstration
    function setDefaultValues() {
        try {
            const activeTab = document.querySelector('.tab-content.active');
            if (!activeTab) return;

            const fractionInputs = activeTab.querySelectorAll('.input-group');
            
            // Set default values based on active tab
            if (fractionInputs.length >= 2) {
                // First fraction: 1/2
                const firstTop = fractionInputs[0].querySelector('.input-field.top');
                const firstBottom = fractionInputs[0].querySelector('.input-field.bottom');
                if (firstTop && firstBottom) {
                    firstTop.value = '1';
                    firstBottom.value = '2';
                }

                // Second fraction: 1/4
                const secondTop = fractionInputs[1].querySelector('.input-field.top');
                const secondBottom = fractionInputs[1].querySelector('.input-field.bottom');
                if (secondTop && secondBottom) {
                    secondTop.value = '1';
                    secondBottom.value = '4';
                }
            }

            if (fractionInputs.length >= 3) {
                // Third fraction: 1/8
                const thirdTop = fractionInputs[2].querySelector('.input-field.top');
                const thirdBottom = fractionInputs[2].querySelector('.input-field.bottom');
                if (thirdTop && thirdBottom) {
                    thirdTop.value = '1';
                    thirdBottom.value = '8';
                }
            }

            if (fractionInputs.length >= 4) {
                // Fourth fraction: 1/16
                const fourthTop = fractionInputs[3].querySelector('.input-field.top');
                const fourthBottom = fractionInputs[3].querySelector('.input-field.bottom');
                if (fourthTop && fourthBottom) {
                    fourthTop.value = '1';
                    fourthBottom.value = '16';
                }
            }
        } catch (error) {
            console.error('Error setting default values:', error);
        }
    }

    // Utility functions
    function getGCD(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b !== 0) {
            let temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    function simplifyFraction(numerator, denominator) {
        if (denominator === 0) {
            throw new Error('Division by zero');
        }
        
        const gcd = getGCD(numerator, denominator);
        const simplifiedNum = numerator / gcd;
        const simplifiedDen = denominator / gcd;
        
        // Ensure positive denominator
        if (simplifiedDen < 0) {
            return { numerator: -simplifiedNum, denominator: -simplifiedDen };
        }
        
        return { numerator: simplifiedNum, denominator: simplifiedDen };
    }

    function fractionToString(fraction) {
        if (fraction.denominator === 1) {
            return fraction.numerator.toString();
        }
        return `${fraction.numerator}/${fraction.denominator}`;
    }

    function fractionToMixedNumber(fraction) {
        const absNumerator = Math.abs(fraction.numerator);
        const whole = Math.floor(absNumerator / fraction.denominator);
        const numerator = absNumerator % fraction.denominator;
        const sign = fraction.numerator < 0 ? '-' : '';
        
        if (whole === 0) {
            return fractionToString(fraction);
        } else if (numerator === 0) {
            return `${sign}${whole}`;
        } else {
            return `${sign}${whole} ${numerator}/${fraction.denominator}`;
        }
    }

    // Arithmetic operations
    function addFractions(f1, f2) {
        const numerator = f1.numerator * f2.denominator + f2.numerator * f1.denominator;
        const denominator = f1.denominator * f2.denominator;
        return simplifyFraction(numerator, denominator);
    }

    function subtractFractions(f1, f2) {
        const numerator = f1.numerator * f2.denominator - f2.numerator * f1.denominator;
        const denominator = f1.denominator * f2.denominator;
        return simplifyFraction(numerator, denominator);
    }

    function multiplyFractions(f1, f2) {
        const numerator = f1.numerator * f2.numerator;
        const denominator = f1.denominator * f2.denominator;
        return simplifyFraction(numerator, denominator);
    }

    function divideFractions(f1, f2) {
        if (f2.numerator === 0) {
            throw new Error('Division by zero');
        }
        const numerator = f1.numerator * f2.denominator;
        const denominator = f1.denominator * f2.numerator;
        return simplifyFraction(numerator, denominator);
    }

    function calculateFractions(fractions, operators) {
        if (!fractions || fractions.length === 0) {
            throw new Error('No fractions provided');
        }

        let result = getFractionValue(fractions[0]);
        let steps = [`Start with: ${fractionToString(result)}`];
        
        for (let i = 0; i < operators.length && i < fractions.length - 1; i++) {
            const nextFraction = getFractionValue(fractions[i + 1]);
            const operator = operators[i].value;
            
            steps.push(`\n${fractionToString(result)} ${operator} ${fractionToString(nextFraction)}`);
            
            switch (operator) {
                case '+':
                    result = addFractions(result, nextFraction);
                    break;
                case '-':
                    result = subtractFractions(result, nextFraction);
                    break;
                case '*':
                    result = multiplyFractions(result, nextFraction);
                    break;
                case '/':
                    result = divideFractions(result, nextFraction);
                    break;
                default:
                    throw new Error(`Unknown operator: ${operator}`);
            }
            
            steps.push(`= ${fractionToString(result)}`);
        }
        
        const decimal = formatDecimal(result.numerator / result.denominator);
        const mixedNumber = fractionToMixedNumber(result);
        
        steps.push(`\nDecimal: ${decimal}`);
        if (mixedNumber !== fractionToString(result)) {
            steps.push(`Mixed number: ${mixedNumber}`);
        }
        
        return {
            fraction: fractionToString(result),
            decimal: decimal,
            mixedNumber: mixedNumber,
            steps: steps
        };
    }

    function getFractionValue(fractionElement) {
        if (!fractionElement) {
            throw new Error('Invalid fraction element');
        }

        const topInput = fractionElement.querySelector('.input-field.top');
        const bottomInput = fractionElement.querySelector('.input-field.bottom');
        
        if (!topInput || !bottomInput) {
            throw new Error('Missing fraction input fields');
        }

        const numerator = parseInt(topInput.value) || 0;
        const denominator = parseInt(bottomInput.value) || 1;
        
        if (denominator === 0) {
            throw new Error('Denominator cannot be zero');
        }
        
        return { numerator, denominator };
    }

    function formatDecimal(number) {
        if (!isFinite(number)) {
            return 'Undefined';
        }
        
        // Round to 6 decimal places and remove trailing zeros
        let str = number.toFixed(6);
        str = str.replace(/\.?0+$/, "");
        return str;
    }

    function displayResult(result) {
        try {
            const resultSection = document.getElementById('result-section');
            const resultValue = document.getElementById('result-value');
            const stepsContainer = document.getElementById('steps');

            if (!resultSection || !resultValue || !stepsContainer) {
                throw new Error('Result display elements not found');
            }

            // Show result section
            resultSection.style.display = 'block';

            // Display main result
            resultValue.innerHTML = `
                <div style="margin-bottom: 10px;">
                    <strong>Fraction:</strong> ${result.fraction}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Decimal:</strong> ${result.decimal}
                </div>
                ${result.mixedNumber !== result.fraction ? 
                    `<div><strong>Mixed Number:</strong> ${result.mixedNumber}</div>` : ''
                }
            `;

            // Display calculation steps
            stepsContainer.innerHTML = result.steps
                .map(step => `<div class="step">${step}</div>`)
                .join('');

            // Scroll to results
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        } catch (error) {
            console.error('Error displaying result:', error);
            displayError('Error displaying results');
        }
    }

    function displayError(message) {
        try {
            const resultSection = document.getElementById('result-section');
            const resultValue = document.getElementById('result-value');

            if (resultSection && resultValue) {
                resultSection.style.display = 'block';
                resultValue.innerHTML = `<div style="color: #e74c3c; font-weight: bold;">${message}</div>`;
                
                const stepsContainer = document.getElementById('steps');
                if (stepsContainer) {
                    stepsContainer.innerHTML = '';
                }
            }
        } catch (error) {
            console.error('Error displaying error message:', error);
        }
    }

    function hideResult() {
        try {
            const resultSection = document.getElementById('result-section');
            if (resultSection) {
                resultSection.style.display = 'none';
            }
        } catch (error) {
            console.error('Error hiding result:', error);
        }
    }

    // Input validation and formatting
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('input-field')) {
            // Ensure positive integers only
            let value = e.target.value.replace(/[^0-9]/g, '');
            
            // Special handling for denominators (cannot be 0)
            if (e.target.classList.contains('bottom') && value === '0') {
                value = '1';
            }
            
            e.target.value = value;
        }
    });

    // Performance optimization for scroll events
    let ticking = false;
    function handleScroll() {
        // Scroll handling code if needed
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
}); 