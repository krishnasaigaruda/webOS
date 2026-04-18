import React, { useState } from 'react';
import { WindowState } from '../../../store/useStore';

const MobileCalculator: React.FC<{ window: WindowState }> = () => {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<string | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [justEvaluated, setJustEvaluated] = useState(false);

  const inputDigit = (d: string) => {
    if (justEvaluated || display === '0') {
      setDisplay(d);
      setJustEvaluated(false);
    } else {
      setDisplay(display.length < 12 ? display + d : display);
    }
  };

  const inputDot = () => {
    if (justEvaluated) { setDisplay('0.'); setJustEvaluated(false); return; }
    if (!display.includes('.')) setDisplay(display + '.');
  };

  const clear = () => { setDisplay('0'); setPrev(null); setOp(null); setJustEvaluated(false); };

  const negate = () => setDisplay(String(-parseFloat(display)));
  const percent = () => setDisplay(String(parseFloat(display) / 100));

  const handleOp = (newOp: string) => {
    if (prev !== null && op && !justEvaluated) {
      const result = compute(parseFloat(prev), parseFloat(display), op);
      setDisplay(String(result));
      setPrev(String(result));
    } else {
      setPrev(display);
    }
    setOp(newOp);
    setJustEvaluated(true);
  };

  const equals = () => {
    if (prev === null || op === null) return;
    const result = compute(parseFloat(prev), parseFloat(display), op);
    setDisplay(String(result));
    setPrev(null);
    setOp(null);
    setJustEvaluated(true);
  };

  const compute = (a: number, b: number, op: string) => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b === 0 ? 0 : a / b;
      default: return b;
    }
  };

  const Btn: React.FC<{ label: string; onClick: () => void; kind?: 'num' | 'op' | 'fn'; wide?: boolean; active?: boolean }> = ({ label, onClick, kind = 'num', wide, active }) => {
    const styles: Record<string, React.CSSProperties> = {
      num: { background: '#333', color: '#fff' },
      op: { background: active ? '#fff' : '#ff9500', color: active ? '#ff9500' : '#fff' },
      fn: { background: '#a5a5a5', color: '#000' },
    };
    return (
      <button
        onClick={onClick}
        style={{
          ...styles[kind],
          border: 'none',
          fontSize: 30,
          fontWeight: 400,
          borderRadius: 999,
          height: 78,
          gridColumn: wide ? 'span 2' : undefined,
          cursor: 'pointer',
          padding: 0,
          textAlign: wide ? 'left' : 'center',
          paddingLeft: wide ? 32 : 0,
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ height: '100%', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 16, maxWidth: 420, margin: '0 auto', width: '100%' }}>
      <div style={{ fontSize: 72, fontWeight: 300, textAlign: 'right', padding: '40px 16px 24px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {display}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <Btn label="AC" kind="fn" onClick={clear} />
        <Btn label="+/−" kind="fn" onClick={negate} />
        <Btn label="%" kind="fn" onClick={percent} />
        <Btn label="÷" kind="op" active={op === '÷' && justEvaluated} onClick={() => handleOp('÷')} />

        <Btn label="7" onClick={() => inputDigit('7')} />
        <Btn label="8" onClick={() => inputDigit('8')} />
        <Btn label="9" onClick={() => inputDigit('9')} />
        <Btn label="×" kind="op" active={op === '×' && justEvaluated} onClick={() => handleOp('×')} />

        <Btn label="4" onClick={() => inputDigit('4')} />
        <Btn label="5" onClick={() => inputDigit('5')} />
        <Btn label="6" onClick={() => inputDigit('6')} />
        <Btn label="-" kind="op" active={op === '-' && justEvaluated} onClick={() => handleOp('-')} />

        <Btn label="1" onClick={() => inputDigit('1')} />
        <Btn label="2" onClick={() => inputDigit('2')} />
        <Btn label="3" onClick={() => inputDigit('3')} />
        <Btn label="+" kind="op" active={op === '+' && justEvaluated} onClick={() => handleOp('+')} />

        <Btn label="0" wide onClick={() => inputDigit('0')} />
        <Btn label="." onClick={inputDot} />
        <Btn label="=" kind="op" onClick={equals} />
      </div>
    </div>
  );
};

export default MobileCalculator;
