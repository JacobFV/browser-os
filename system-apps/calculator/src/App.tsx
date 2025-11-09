import React, { useState } from 'react';
import './Calculator.css';

export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState<string>('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (op: string) => {
    const currentValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(currentValue);
    } else if (operation) {
      const result = calculate(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForNewValue(true);
    setOperation(op);
  };

  const calculate = (prev: number, current: number, op: string): number => {
    switch (op) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case '*':
        return prev * current;
      case '/':
        return prev / current;
      default:
        return current;
    }
  };

  const performCalculation = () => {
    if (previousValue !== null && operation) {
      const currentValue = parseFloat(display);
      const result = calculate(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  return (
    <div className="calculator-app">
      <div className="calculator-display">{display}</div>
      <div className="calculator-buttons">
        <button onClick={clear} className="calculator-button function">C</button>
        <button onClick={() => inputOperation('/')} className="calculator-button operator">÷</button>
        <button onClick={() => inputOperation('*')} className="calculator-button operator">×</button>
        <button onClick={() => inputOperation('-')} className="calculator-button operator">−</button>
        
        <button onClick={() => inputNumber('7')} className="calculator-button">7</button>
        <button onClick={() => inputNumber('8')} className="calculator-button">8</button>
        <button onClick={() => inputNumber('9')} className="calculator-button">9</button>
        <button onClick={() => inputOperation('+')} className="calculator-button operator">+</button>
        
        <button onClick={() => inputNumber('4')} className="calculator-button">4</button>
        <button onClick={() => inputNumber('5')} className="calculator-button">5</button>
        <button onClick={() => inputNumber('6')} className="calculator-button">6</button>
        <button onClick={performCalculation} className="calculator-button equals">=</button>
        
        <button onClick={() => inputNumber('1')} className="calculator-button">1</button>
        <button onClick={() => inputNumber('2')} className="calculator-button">2</button>
        <button onClick={() => inputNumber('3')} className="calculator-button">3</button>
        <button className="calculator-button" style={{ gridRow: 'span 2' }}></button>
        
        <button onClick={() => inputNumber('0')} className="calculator-button" style={{ gridColumn: 'span 2' }}>0</button>
        <button onClick={inputDecimal} className="calculator-button">.</button>
      </div>
    </div>
  );
};

