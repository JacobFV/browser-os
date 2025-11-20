import React, { useState } from 'react';
import './Calculator.css';

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isNewNumber, setIsNewNumber] = useState(true);
  const [lastOperator, setLastOperator] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);

  const handleNumber = (num: string) => {
    if (isNewNumber) {
      setDisplay(num);
      setIsNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (isNewNumber) {
      setDisplay('0.');
      setIsNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : NaN;
      default: return b;
    }
  };

  const handleOperator = (op: string) => {
    const current = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(current);
      setEquation(`${current} ${op}`);
    } else if (lastOperator && !isNewNumber) {
      const result = calculate(previousValue, current, lastOperator);
      setPreviousValue(result);
      setDisplay(String(result));
      setEquation(`${result} ${op}`);
    } else {
        setEquation(`${previousValue} ${op}`);
    }

    setIsNewNumber(true);
    setLastOperator(op);
  };

  const handleEquals = () => {
    if (lastOperator && previousValue !== null) {
      const current = parseFloat(display);
      const result = calculate(previousValue, current, lastOperator);
      setDisplay(String(result));
      setPreviousValue(null);
      setLastOperator(null);
      setEquation('');
      setIsNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setPreviousValue(null);
    setLastOperator(null);
    setIsNewNumber(true);
  };

  const handlePercentage = () => {
    const current = parseFloat(display);
    setDisplay(String(current / 100));
    setIsNewNumber(true);
  };

  const handleSignToggle = () => {
    const current = parseFloat(display);
    setDisplay(String(current * -1));
  };

  return (
    <div className="calculator-app">
      <div className="calculator-display">
        <div className="calculator-equation">{equation}</div>
        <div className="calculator-current">{display}</div>
      </div>
      <div className="calculator-keypad">
        <button className="calculator-key clear" onClick={handleClear}>C</button>
        <button className="calculator-key" onClick={handleSignToggle}>+/-</button>
        <button className="calculator-key" onClick={handlePercentage}>%</button>
        <button className="calculator-key operator" onClick={() => handleOperator('÷')}>÷</button>
        
        <button className="calculator-key" onClick={() => handleNumber('7')}>7</button>
        <button className="calculator-key" onClick={() => handleNumber('8')}>8</button>
        <button className="calculator-key" onClick={() => handleNumber('9')}>9</button>
        <button className="calculator-key operator" onClick={() => handleOperator('×')}>×</button>
        
        <button className="calculator-key" onClick={() => handleNumber('4')}>4</button>
        <button className="calculator-key" onClick={() => handleNumber('5')}>5</button>
        <button className="calculator-key" onClick={() => handleNumber('6')}>6</button>
        <button className="calculator-key operator" onClick={() => handleOperator('-')}>-</button>
        
        <button className="calculator-key" onClick={() => handleNumber('1')}>1</button>
        <button className="calculator-key" onClick={() => handleNumber('2')}>2</button>
        <button className="calculator-key" onClick={() => handleNumber('3')}>3</button>
        <button className="calculator-key operator" onClick={() => handleOperator('+')}>+</button>
        
        <button className="calculator-key zero" onClick={() => handleNumber('0')}>0</button>
        <button className="calculator-key" onClick={handleDecimal}>.</button>
        <button className="calculator-key equals" onClick={handleEquals}>=</button>
      </div>
    </div>
  );
};

