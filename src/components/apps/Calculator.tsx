import type React from 'react';
import { useEffect, useState } from 'react';

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);
  const [memory, setMemory] = useState<number>(0);
  const [scientificMode, setScientificMode] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleNumber(e.key);
      } else if (e.key === '.') {
        handleDecimal();
      } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        const opMap: { [key: string]: string } = { '+': '+', '-': '-', '*': '×', '/': '÷' };
        handleOperation(opMap[e.key]);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Escape' || e.key === 'c') {
        handleClear();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [display, previousValue, operation, newNumber]);

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

    const calculation = `${previousValue} ${operation} ${currentValue} = ${result}`;
    setHistory((prev) => [calculation, ...prev].slice(0, 10));
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

  const handleBackspace = () => {
    if (display.length > 1 && !newNumber) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setNewNumber(true);
    }
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

  const handleSquare = () => {
    const value = parseFloat(display);
    setDisplay((value * value).toString());
  };

  const handleSquareRoot = () => {
    const value = parseFloat(display);
    setDisplay(Math.sqrt(value).toString());
  };

  const handleSin = () => {
    const value = parseFloat(display);
    setDisplay(Math.sin(value).toString());
  };

  const handleCos = () => {
    const value = parseFloat(display);
    setDisplay(Math.cos(value).toString());
  };

  const handleTan = () => {
    const value = parseFloat(display);
    setDisplay(Math.tan(value).toString());
  };

  const handleLog = () => {
    const value = parseFloat(display);
    setDisplay(Math.log10(value).toString());
  };

  const handleLn = () => {
    const value = parseFloat(display);
    setDisplay(Math.log(value).toString());
  };

  const handleMemoryClear = () => setMemory(0);
  const handleMemoryRecall = () => setDisplay(memory.toString());
  const handleMemoryAdd = () => setMemory(memory + parseFloat(display));
  const handleMemorySubtract = () => setMemory(memory - parseFloat(display));

  return (
    <div className="calculator">
      <div className="calculator-header">
        <button className={`calc-mode-btn ${!scientificMode ? 'active' : ''}`} onClick={() => setScientificMode(false)}>
          Basic
        </button>
        <button className={`calc-mode-btn ${scientificMode ? 'active' : ''}`} onClick={() => setScientificMode(true)}>
          Scientific
        </button>
      </div>
      <div className="calculator-display">
        <div className="calculator-memory">{memory !== 0 && `M: ${memory}`}</div>
        <div className="calculator-main-display">{display}</div>
      </div>
      {history.length > 0 && <div className="calculator-history">{history[0]}</div>}
      <div className={`calculator-buttons ${scientificMode ? 'scientific' : ''}`}>
        {scientificMode && (
          <>
            <button className="calc-btn function" onClick={handleMemoryClear}>
              MC
            </button>
            <button className="calc-btn function" onClick={handleMemoryRecall}>
              MR
            </button>
            <button className="calc-btn function" onClick={handleMemoryAdd}>
              M+
            </button>
            <button className="calc-btn function" onClick={handleMemorySubtract}>
              M-
            </button>

            <button className="calc-btn function" onClick={handleSin}>
              sin
            </button>
            <button className="calc-btn function" onClick={handleCos}>
              cos
            </button>
            <button className="calc-btn function" onClick={handleTan}>
              tan
            </button>
            <button className="calc-btn function" onClick={handleLog}>
              log
            </button>

            <button className="calc-btn function" onClick={handleLn}>
              ln
            </button>
            <button className="calc-btn function" onClick={handleSquare}>
              x²
            </button>
            <button className="calc-btn function" onClick={handleSquareRoot}>
              √
            </button>
            <button className="calc-btn function" onClick={handleBackspace}>
              ⌫
            </button>
          </>
        )}

        <button className="calc-btn function" onClick={handleClear}>
          AC
        </button>
        <button className="calc-btn function" onClick={handleToggleSign}>
          ±
        </button>
        <button className="calc-btn function" onClick={handlePercent}>
          %
        </button>
        <button className="calc-btn operator" onClick={() => handleOperation('÷')}>
          ÷
        </button>

        <button className="calc-btn" onClick={() => handleNumber('7')}>
          7
        </button>
        <button className="calc-btn" onClick={() => handleNumber('8')}>
          8
        </button>
        <button className="calc-btn" onClick={() => handleNumber('9')}>
          9
        </button>
        <button className="calc-btn operator" onClick={() => handleOperation('×')}>
          ×
        </button>

        <button className="calc-btn" onClick={() => handleNumber('4')}>
          4
        </button>
        <button className="calc-btn" onClick={() => handleNumber('5')}>
          5
        </button>
        <button className="calc-btn" onClick={() => handleNumber('6')}>
          6
        </button>
        <button className="calc-btn operator" onClick={() => handleOperation('-')}>
          −
        </button>

        <button className="calc-btn" onClick={() => handleNumber('1')}>
          1
        </button>
        <button className="calc-btn" onClick={() => handleNumber('2')}>
          2
        </button>
        <button className="calc-btn" onClick={() => handleNumber('3')}>
          3
        </button>
        <button className="calc-btn operator" onClick={() => handleOperation('+')}>
          +
        </button>

        <button className="calc-btn zero" onClick={() => handleNumber('0')}>
          0
        </button>
        <button className="calc-btn" onClick={handleDecimal}>
          .
        </button>
        <button className="calc-btn operator" onClick={handleEquals}>
          =
        </button>
      </div>
    </div>
  );
};
