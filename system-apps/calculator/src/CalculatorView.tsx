import React, { useState } from 'react';
import { Button } from '@browser-os/ui';
import { Window } from '@browser-os/windowing';
import '@browser-os/ui/dist/ui.css';
import './Calculator.css';

export interface CalculatorViewProps {
  window: Window;
}

/**
 * CalculatorView - Pure UI component for calculator
 */
export const CalculatorView: React.FC<CalculatorViewProps> = ({ window }) => {
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
        <Button onClick={clear} className="calculator-button function">C</Button>
        <Button onClick={() => inputOperation('/')} className="calculator-button operator">÷</Button>
        <Button onClick={() => inputOperation('*')} className="calculator-button operator">×</Button>
        <Button onClick={() => inputOperation('-')} className="calculator-button operator">−</Button>
        
        <Button onClick={() => inputNumber('7')} className="calculator-button">7</Button>
        <Button onClick={() => inputNumber('8')} className="calculator-button">8</Button>
        <Button onClick={() => inputNumber('9')} className="calculator-button">9</Button>
        <Button onClick={() => inputOperation('+')} className="calculator-button operator">+</Button>
        
        <Button onClick={() => inputNumber('4')} className="calculator-button">4</Button>
        <Button onClick={() => inputNumber('5')} className="calculator-button">5</Button>
        <Button onClick={() => inputNumber('6')} className="calculator-button">6</Button>
        <Button onClick={performCalculation} className="calculator-button equals">=</Button>
        
        <Button onClick={() => inputNumber('1')} className="calculator-button">1</Button>
        <Button onClick={() => inputNumber('2')} className="calculator-button">2</Button>
        <Button onClick={() => inputNumber('3')} className="calculator-button">3</Button>
        <Button className="calculator-button" style={{ gridRow: 'span 2' }}></Button>
        
        <Button onClick={() => inputNumber('0')} className="calculator-button" style={{ gridColumn: 'span 2' }}>0</Button>
        <Button onClick={inputDecimal} className="calculator-button">.</Button>
      </div>
    </div>
  );
};

