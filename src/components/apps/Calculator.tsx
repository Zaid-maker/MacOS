import React, { useState } from 'react';

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperation = (op: string) => {
    const currentValue = parseFloat(display);
    
    if (previousValue !== null && operation && !newNumber) {
      handleEquals();
    } else {
      setPreviousValue(currentValue);
    }
    
    setOperation(op);
    setNewNumber(true);
  };

  const handleEquals = () => {
    if (previousValue === null || operation === null) return;

    const currentValue = parseFloat(display);
    let result = 0;

    switch (operation) {
      case '+':
        result = previousValue + currentValue;
        break;
      case '-':
        result = previousValue - currentValue;
        break;
      case '×':
        result = previousValue * currentValue;
        break;
      case '÷':
        result = previousValue / currentValue;
        break;
    }

    setDisplay(result.toString());
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
      setNewNumber(false);
    }
  };

  const handlePercent = () => {
    const value = parseFloat(display) / 100;
    setDisplay(value.toString());
  };

  const handleToggleSign = () => {
    const value = parseFloat(display) * -1;
    setDisplay(value.toString());
  };

  return (
    <div className="calculator">
      <div className="calculator-display">{display}</div>
      <div className="calculator-buttons">
        <button className="calc-btn function" onClick={handleClear}>AC</button>
        <button className="calc-btn function" onClick={handleToggleSign}>±</button>
        <button className="calc-btn function" onClick={handlePercent}>%</button>
        <button className="calc-btn operator" onClick={() => handleOperation('÷')}>÷</button>

        <button className="calc-btn" onClick={() => handleNumber('7')}>7</button>
        <button className="calc-btn" onClick={() => handleNumber('8')}>8</button>
        <button className="calc-btn" onClick={() => handleNumber('9')}>9</button>
        <button className="calc-btn operator" onClick={() => handleOperation('×')}>×</button>

        <button className="calc-btn" onClick={() => handleNumber('4')}>4</button>
        <button className="calc-btn" onClick={() => handleNumber('5')}>5</button>
        <button className="calc-btn" onClick={() => handleNumber('6')}>6</button>
        <button className="calc-btn operator" onClick={() => handleOperation('-')}>−</button>

        <button className="calc-btn" onClick={() => handleNumber('1')}>1</button>
        <button className="calc-btn" onClick={() => handleNumber('2')}>2</button>
        <button className="calc-btn" onClick={() => handleNumber('3')}>3</button>
        <button className="calc-btn operator" onClick={() => handleOperation('+')}>+</button>

        <button className="calc-btn zero" onClick={() => handleNumber('0')}>0</button>
        <button className="calc-btn" onClick={handleDecimal}>.</button>
        <button className="calc-btn operator" onClick={handleEquals}>=</button>
      </div>
    </div>
  );
};
