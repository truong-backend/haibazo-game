import { useState, useEffect, useRef, useCallback } from 'react';
import { LinkedList, generateNodes } from './linkedList';
import type { NodeData } from './linkedList';
import './App.css';

type GameStatus = 'idle' | 'playing' | 'gameover' | 'cleared';

const BOARD_W = 548;
const BOARD_H = 430;
const COUNTDOWN = 3;
const FADE_MS = 500;
const AUTO_MS = 800;
const TICK_MS = 100;

interface CountdownEntry {
  remaining: number;
  tickInt: ReturnType<typeof setInterval>;
}

export default function App() {
  const [pointsInput, setPointsInput] = useState<string>('10');
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [nextExpected, setNextExpected] = useState<number>(1);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [elapsed, setElapsed] = useState<number>(0);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [msgVisible, setMsgVisible] = useState<boolean>(false);
  const [countdownMap, setCountdownMap] = useState<Record<number, number>>({});
  const [errMsg, setErrMsg] = useState<string>('');

  const listRef = useRef<LinkedList>(new LinkedList());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownsRef = useRef<Record<number, CountdownEntry>>({});
  const autoPlayRef = useRef<boolean>(false);
  const nextExpRef = useRef<number>(1);
  const statusRef = useRef<GameStatus>('idle');
  const fadingCountRef = useRef<number>(0);
  const totalNRef = useRef<number>(0);

  autoPlayRef.current = autoPlay;
  nextExpRef.current = nextExpected;
  statusRef.current = status;

  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  const stopAuto = () => { if (autoRef.current) { clearTimeout(autoRef.current); autoRef.current = null; } };
  const killAllCountdowns = () => {
    Object.values(countdownsRef.current).forEach(c => clearInterval(c.tickInt));
    countdownsRef.current = {};
    setCountdownMap({});
  };

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setElapsed(e => Math.round((e + 0.1) * 10) / 10);
    }, 100);
  };

  const validatePoints = (): number | null => {
    const raw = pointsInput.trim();
    if (!raw) { setErrMsg('Points không được để trống!'); return null; }
    const n = parseInt(raw, 10);
    if (isNaN(n) || n <= 0) { setErrMsg('Points phải là số dương (> 0)!'); return null; }
    if (n > 300) { setErrMsg('Points tối đa là 300!'); return null; }
    setErrMsg('');
    return n;
  };

  const initGame = useCallback((n: number) => {
    stopTimer(); stopAuto(); killAllCountdowns();
    fadingCountRef.current = 0;
    totalNRef.current = n;
    const list = generateNodes(n, BOARD_W, BOARD_H);
    listRef.current = list;
    setNodes(list.toArray());
    setNextExpected(1);
    setElapsed(0);
    setStatus('playing');
    setMsgVisible(false);
    setCountdownMap({});
    startTimer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlay = () => { const n = validatePoints(); if (n) initGame(n); };

  const handleRestart = () => {
    const n = validatePoints(); if (!n) return;
    setAutoPlay(false); autoPlayRef.current = false; stopAuto();
    killAllCountdowns();
    initGame(n);
  };

  const fadingOut = useCallback((id: number) => {
    fadingCountRef.current++;
    listRef.current.updateNode(id, { fading: true });
    setNodes(listRef.current.toArray());

    setTimeout(() => {
      fadingCountRef.current--;
      listRef.current.updateNode(id, { fading: false });
      setNodes(listRef.current.toArray());

      if (id === totalNRef.current) {
        const check = () => {
          const cdDone = Object.keys(countdownsRef.current).length === 0;
          if (fadingCountRef.current === 0 && cdDone) {
            stopTimer(); stopAuto();
            setStatus('cleared');
            setStatusMessage('ALL CLEARED');
            setMsgVisible(true);
          } else setTimeout(check, 80);
        };
        check();
      }
    }, FADE_MS);
  }, []);

  const startCountdown = useCallback((id: number) => {
    let remaining = COUNTDOWN;
    countdownsRef.current[id] = { remaining, tickInt: 0 as unknown as ReturnType<typeof setInterval> };
    setCountdownMap(prev => ({ ...prev, [id]: remaining }));

    const tickInt = setInterval(() => {
      remaining = Math.max(0, Math.round((remaining - 0.1) * 10) / 10);
      countdownsRef.current[id] = { ...countdownsRef.current[id], remaining };
      setCountdownMap(prev => ({ ...prev, [id]: remaining }));

      if (remaining <= 0) {
        clearInterval(tickInt);
        delete countdownsRef.current[id];
        setCountdownMap(prev => { const c = { ...prev }; delete c[id]; return c; });
        fadingOut(id);
      }
    }, TICK_MS);

    countdownsRef.current[id].tickInt = tickInt;
  }, [fadingOut]);

  const performClick = useCallback((id: number) => {
    if (statusRef.current !== 'playing') return;

    if (id !== nextExpRef.current) {
      killAllCountdowns();
      stopTimer(); stopAuto();
      setStatus('gameover');
      setStatusMessage('GAME OVER');
      setMsgVisible(true);
      return;
    }

    listRef.current.updateNode(id, { clicked: true });
    setNodes(listRef.current.toArray());
    setNextExpected(id + 1);
    startCountdown(id);
  }, [startCountdown]);

  const scheduleAutoClick = useCallback(() => {
    stopAuto();
    if (!autoPlayRef.current || statusRef.current !== 'playing') return;
    autoRef.current = setTimeout(() => {
      if (!autoPlayRef.current || statusRef.current !== 'playing') return;
      const next = nextExpRef.current;
      if (next <= totalNRef.current && !countdownsRef.current[next]) {
        performClick(next);
      }
      scheduleAutoClick();
    }, AUTO_MS);
  }, [performClick]);

  const handleAutoToggle = () => {
    const newVal = !autoPlay;
    setAutoPlay(newVal); autoPlayRef.current = newVal;
    if (newVal && statusRef.current === 'playing') scheduleAutoClick();
    else stopAuto();
  };

  useEffect(() => {
    if (status === 'playing' && autoPlay) scheduleAutoClick();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => () => { stopTimer(); stopAuto(); killAllCountdowns(); }, []);

  const activeNodes = nodes.filter(n => !n.clicked || n.fading || countdownMap[n.id] !== undefined);

  return (
    <div className="app">
      <div className="game-card">
        <h1 className="title">LET'S PLAY</h1>

        <div className="controls">
          <div className="control-row">
            <label>Points:</label>
            <input
              className={`points-input${errMsg ? ' err' : ''}`}
              type="number" min={1} max={300}
              value={pointsInput}
              onChange={e => { setPointsInput(e.target.value); setErrMsg(''); }}
              onKeyDown={e => e.key === 'Enter' && (status === 'idle' ? handlePlay() : handleRestart())}
            />
          </div>
          {errMsg && <div className="errmsg">{errMsg}</div>}
          <div className="control-row">
            <label>Time:</label>
            <span className="time-value">{elapsed.toFixed(1)}s</span>
          </div>
          {status !== 'idle' && (
            <div className="btn-row">
              <button className="btn btn-restart" onClick={handleRestart}>Restart</button>
              <button className={`btn btn-auto${autoPlay ? ' on' : ''}`} onClick={handleAutoToggle}>
                Auto Play {autoPlay ? 'ON' : 'OFF'}
              </button>
            </div>
          )}
        </div>

        {status === 'idle' && (
          <div className="start-area">
            <button className="btn btn-start" onClick={handlePlay}>Play</button>
          </div>
        )}

        {status !== 'idle' && (
          <div className="board" style={{ width: BOARD_W, height: BOARD_H }}>
            {msgVisible && (
              <div className={`overlay ${status}`}>
                <div className="overlay-msg">{statusMessage}</div>
              </div>
            )}

            {activeNodes.map(node => {
              const cdVal = countdownMap[node.id];
              const isCounting = cdVal !== undefined;
              const isNext = node.id === nextExpected && status === 'playing' && !isCounting;
              const pct = isCounting ? cdVal / COUNTDOWN : 1;
              const r = node.radius - 3;
              const circ = 2 * Math.PI * r;
              const dash = circ * pct;

              return (
                <div
                  key={node.id}
                  className={`node${node.fading ? ' fading' : ''}${isNext ? ' next-target' : ''}${isCounting ? ' counting' : ''}`}
                  style={{ left: `${node.x}%`, top: `${node.y}%`, width: node.radius * 2, height: node.radius * 2 }}
                  onClick={() => !node.clicked && !isCounting && performClick(node.id)}
                >
                  {isCounting && (
                    <div className="ring-wrap">
                      <svg viewBox={`0 0 ${node.radius * 2} ${node.radius * 2}`} width="100%" height="100%">
                        <circle cx={node.radius} cy={node.radius} r={r} fill="none" stroke="#eee" strokeWidth={3} />
                        <circle
                          cx={node.radius} cy={node.radius} r={r}
                          fill="none" stroke="#c94040" strokeWidth={3}
                          strokeDasharray={`${dash} ${circ}`}
                          transform={`rotate(-90 ${node.radius} ${node.radius})`}
                        />
                      </svg>
                    </div>
                  )}
                  <span className="node-num">{node.id}</span>
                  {isCounting && <span className="node-cd">{cdVal.toFixed(1)}</span>}
                </div>
              );
            })}
          </div>
        )}

        {status === 'playing' && (
          <div className="next-info">Next: <strong>{nextExpected}</strong></div>
        )}
      </div>
    </div>
  );
}