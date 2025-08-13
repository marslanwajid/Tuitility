console.log('LCD calculator script loaded');

window.addEventListener('error', function(event) {
    console.error('Caught unhandled error:', event.error);
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');

    const calculatorForm = document.getElementById('calculator-form');
    const resultSection = document.getElementById('result-section');
    const lcdValue = document.getElementById('lcd-value');
    const equivalentFractionsList = document.getElementById('equivalent-fractions-list');
    const solutionSteps = document.getElementById('solution-steps');
    const numbersInput = document.getElementById('numbers');

    // Set default value
    if (!numbersInput.value) {
        numbersInput.value = '1/4, 1/6, 1/8';
    }

    // Function to find GCD of two numbers
    function findGCD(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b) {
            let t = b;
            b = a % b;
            a = t;
        }
        return a;
    }

    // Function to find LCM of two numbers
    function findLCM(a, b) {
        return Math.abs(a * b) / findGCD(a, b);
    }

    // Function to find LCM of array of numbers
    function findLCMOfArray(arr) {
        let lcm = arr[0];
        for (let i = 1; i < arr.length; i++) {
            lcm = findLCM(lcm, arr[i]);
        }
        return lcm;
    }

    // Function to parse mixed number or fraction string
    function parseFraction(str) {
        try {
            str = str.trim();
            let whole = 0, num = 0, den = 1;

            if (str.includes(' ')) {
                // Mixed number
                let parts = str.split(' ');
                whole = parseInt(parts[0]);
                let fraction = parts[1].split('/');
                num = parseInt(fraction[0]);
                den = parseInt(fraction[1]);
                num = whole * den + num;
            } else if (str.includes('/')) {
                // Fraction
                let parts = str.split('/');
                num = parseInt(parts[0]);
                den = parseInt(parts[1]);
            } else {
                // Whole number
                num = parseInt(str);
                den = 1;
            }

            // Validate the result
            if (isNaN(num) || isNaN(den) || den === 0) {
                throw new Error('Invalid fraction');
            }

            return { numerator: num, denominator: den };
        } catch (error) {
            throw new Error(`Invalid input: "${str}"`);
        }
    }

    // Helper function to format fractions for display
    function formatFraction(fraction) {
        if (fraction.denominator === 1) {
            return fraction.numerator;
        }
        return `\\frac{${fraction.numerator}}{${fraction.denominator}}`;
    }

    // Helper function to format original input
    function formatOriginalInput(fraction) {
        if (fraction.denominator === 1) {
            return fraction.numerator.toString();
        }
        const whole = Math.floor(fraction.numerator / fraction.denominator);
        const remainder = fraction.numerator % fraction.denominator;
        if (whole > 0 && remainder > 0) {
            return `${whole}\\;\\frac{${remainder}}{${fraction.denominator}}`;
        }
        return `\\frac{${fraction.numerator}}{${fraction.denominator}}`;
    }

    function showError(message) {
        solutionSteps.innerHTML = `<div class="error" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 1rem; border-radius: 8px; text-align: center; font-weight: 600;">${message}</div>`;
        lcdValue.textContent = '';
        equivalentFractionsList.innerHTML = '';
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    calculatorForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        try {
            // Get input values
            const input = numbersInput.value.trim();
            
            if (!input) {
                showError('Please enter some numbers or fractions');
                return;
            }

            const inputArray = input.split(',');
            if (inputArray.length < 2) {
                showError('Please enter at least 2 numbers or fractions separated by commas');
                return;
            }

            const fractions = inputArray.map(str => parseFraction(str.trim()));
            
            // Get all denominators
            const denominators = fractions.map(f => f.denominator);
            
            // Calculate LCD
            const lcd = findLCMOfArray(denominators);
            
            // Calculate equivalent fractions
            const equivalentFractions = fractions.map(f => {
                const multiplier = lcd / f.denominator;
                return {
                    original: f,
                    multiplier: multiplier,
                    result: {
                        numerator: f.numerator * multiplier,
                        denominator: lcd
                    }
                };
            });

            // Display LCD
            lcdValue.textContent = lcd;

            // Display equivalent fractions
            let equivalentHTML = '<div class="step"><table class="styled-table">';
            equivalentHTML += '<thead><tr><th>Original</th><th>Equivalent Fraction</th></tr></thead><tbody>';
            equivalentFractions.forEach(ef => {
                const originalStr = formatOriginalInput(ef.original);
                equivalentHTML += `
                    <tr style="background-color: transparent;">
                        <td>\\(${originalStr}\\)</td>
                        <td>\\(\\frac{${ef.result.numerator}}{${ef.result.denominator}}\\)</td>
                    </tr>`;
            });
            equivalentHTML += '</tbody></table></div>';
            equivalentFractionsList.innerHTML = equivalentHTML;

            // Display solution steps
            let stepsHTML = `
                <div class="step">
                    <strong>Step 1: Rewrite the input values as fractions:</strong>
                    <p>\\[${fractions.map(f => formatFraction(f)).join(',\\;')}\\]</p>
                </div>
                
                <div class="step">
                    <strong>Step 2: Find the least common multiple of the denominators:</strong>
                    <p>Denominators: ${denominators.join(', ')}</p>
                    <p>\\[\\text{LCD} = \\text{LCM}(${denominators.join(', ')}) = ${lcd}\\]</p>
                </div>
                
                <div class="step">
                    <strong>Step 3: Convert each fraction to have the LCD as denominator:</strong>
                </div>
            `;

            equivalentFractions.forEach(ef => {
                const originalStr = formatOriginalInput(ef.original);
                stepsHTML += `
                    <div class="step">
                        <p>\\[${originalStr} = 
                        ${formatFraction(ef.original)} \\times 
                        \\frac{${ef.multiplier}}{${ef.multiplier}} = 
                        \\frac{${ef.result.numerator}}{${ef.result.denominator}}\\]</p>
                    </div>
                `;
            });

            solutionSteps.innerHTML = stepsHTML;

            // Show result section
            resultSection.style.display = 'block';
            resultSection.scrollIntoView({ behavior: 'smooth' });

            // Render MathJax
            if (window.MathJax) {
                MathJax.typesetPromise([resultSection])
                    .then(() => {
                        console.log('MathJax rendering completed');
                    })
                    .catch((err) => console.log('MathJax error:', err));
            }

        } catch (error) {
            console.error('Calculation error:', error);
            showError(error.message || 'An error occurred during calculation');
        }
    });

    // Reset form
    calculatorForm.addEventListener('reset', function() {
        try {
            resultSection.style.display = 'none';
            lcdValue.textContent = '';
            equivalentFractionsList.innerHTML = '';
            solutionSteps.innerHTML = '';
            
            // Reset to default value
            setTimeout(() => {
                numbersInput.value = '1/4, 1/6, 1/8';
            }, 100);
        } catch (error) {
            console.error('Reset error:', error);
        }
    });
});

// Sticky sidebar functionality with performance optimization
let ticking = false;
const sidebar = document.querySelector('.tool-sidebar');

if (sidebar) {
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    function handleScroll() {
        try {
            const scrollPosition = window.scrollY;
            const header = document.querySelector('header');
            const headerHeight = header ? header.offsetHeight : 0;

            if (scrollPosition > headerHeight) {
                sidebar.classList.add('scrolled');
            } else {
                sidebar.classList.remove('scrolled');
            }
        } catch (error) {
            console.error('Scroll handling error:', error);
        }
    }
}
