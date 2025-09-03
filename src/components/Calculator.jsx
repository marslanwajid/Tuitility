import React, { useState, useEffect } from 'react'
import '../assets/css/hero-calculator.css'

const Calculator = () => {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState(null)
  const [operation, setOperation] = useState(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit))
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit)
    }
  }

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
      return
    }

    if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }

  const clearDisplay = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const newValue = calculate(currentValue, inputValue, operation)

      setDisplay(String(newValue))
      setPreviousValue(newValue)
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
  }

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue
      case '-':
        return firstValue - secondValue
      case '×':
        return firstValue * secondValue
      case '÷':
        return firstValue / secondValue
      default:
        return secondValue
    }
  }

  const handleEquals = () => {
    if (!previousValue || !operation) return

    const inputValue = parseFloat(display)
    const newValue = calculate(previousValue, inputValue, operation)

    setDisplay(String(newValue))
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(true)
  }

  const handlePercentage = () => {
    const currentValue = parseFloat(display)
    const newValue = currentValue / 100
    setDisplay(String(newValue))
  }

  const handlePlusMinus = () => {
    const currentValue = parseFloat(display)
    const newValue = -currentValue
    setDisplay(String(newValue))
  }

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key

      // Numbers 0-9
      if (/^[0-9]$/.test(key)) {
        inputDigit(parseInt(key))
      }
      // Decimal point
      else if (key === '.' || key === ',') {
        inputDecimal()
      }
      // Operators
      else if (key === '+') {
        performOperation('+')
      }
      else if (key === '-') {
        performOperation('-')
      }
      else if (key === '*') {
        performOperation('×')
      }
      else if (key === '/') {
        performOperation('÷')
      }
      // Equals
      else if (key === '=' || key === 'Enter') {
        event.preventDefault()
        handleEquals()
      }
      // Clear
      else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearDisplay()
      }
      // Percentage
      else if (key === '%') {
        handlePercentage()
      }
      // Plus/Minus
      else if (key === '±' || key === 'p' || key === 'P') {
        handlePlusMinus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [display, previousValue, operation, waitingForOperand])

  return (
    <div className="hero-calc">
      <div className="hero-calc-display">
        <div className="hero-calc-expression">
          {previousValue !== null && operation && (
            <span>{previousValue} {operation}</span>
          )}
        </div>
        <div className="hero-calc-result">{display}</div>
      </div>
      
      <div className="hero-calc-buttons">
        <button 
          className="hero-calc-btn hero-calc-function" 
          onClick={clearDisplay}
        >
          AC
        </button>
        <button 
          className="hero-calc-btn hero-calc-function" 
          onClick={handlePlusMinus}
        >
          ±
        </button>
        <button 
          className="hero-calc-btn hero-calc-function" 
          onClick={handlePercentage}
        >
          %
        </button>
        <button 
          className={`hero-calc-btn hero-calc-operator ${operation === '÷' ? 'active' : ''}`}
          onClick={() => performOperation('÷')}
        >
          ÷
        </button>
        
        <button 
          className="hero-calc-btn hero-calc-number" 
          onClick={() => inputDigit(7)}
        >
          7
        </button>
        <button 
          className="hero-calc-btn hero-calc-number" 
          onClick={() => inputDigit(8)}
        >
          8
        </button>
        <button 
          className="hero-calc-btn hero-calc-number" 
          onClick={() => inputDigit(9)}
        >
          9
        </button>
        <button 
          className={`hero-calc-btn hero-calc-operator ${operation === '×' ? 'active' : ''}`}
          onClick={() => performOperation('×')}
        >
          ×
        </button>
        
        <button 
          className="hero-calc-btn hero-calc-number" 
          onClick={() => inputDigit(4)}
        >
          4
        </button>
        <button 
          className="hero-calc-btn hero-calc-number" 
          onClick={() => inputDigit(5)}
        >
          5
        </button>
        <button 
          className="hero-calc-btn hero-calc-number" 
          onClick={() => inputDigit(6)}
        >
          6
        </button>
        <button 
          className={`hero-calc-btn hero-calc-operator ${operation === '-' ? 'active' : ''}`}
          onClick={() => performOperation('-')}
        >
          −
        </button>
        
        <button 
          className="hero-calc-btn hero-calc-number" 
          onClick={() => inputDigit(1)}
        >
          1
        </button>
        <button 
          className="hero-calc-btn hero-calc-number" 
          onClick={() => inputDigit(2)}
        >
          2
        </button>
        <button 
          className="hero-calc-btn hero-calc-number" 
          onClick={() => inputDigit(3)}
        >
          3
        </button>
        <button 
          className={`hero-calc-btn hero-calc-operator ${operation === '+' ? 'active' : ''}`}
          onClick={() => performOperation('+')}
        >
          +
        </button>
        
        <button 
          className="hero-calc-btn hero-calc-number hero-calc-zero" 
          onClick={() => inputDigit(0)}
        >
          0
        </button>
        <button 
          className="hero-calc-btn hero-calc-number" 
          onClick={inputDecimal}
        >
          .
        </button>
        <button 
          className="hero-calc-btn hero-calc-equals" 
          onClick={handleEquals}
        >
          =
        </button>
      </div>
    </div>
  )
}

export default Calculator 