import { useState, useEffect, useRef, useCallback } from 'react';
import { LinkedList, generateNodes } from './linkedList';
import type { NodeData } from './linkedList';
import './App.css';

type GameStatus = 'idle' | 'playing' | 'gameover' | 'cleared';

const BOARD_W = 540;
const BOARD_H = 460;
const AUTO_INTERVAL = 700;
const FADE_DURATION = 600;

export default function App() {
  const [pointsInput, setPointsInput] = useState<string>('10');
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [nextExpected, setNextExpected] = useState<number>(1);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [elapsed, setElapsed] = useState<number>(0);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [msgVisible, setMsgVisible] = useState<boolean>(false);

  const listRef = useRef<LinkedList>(new LinkedList());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoPlayRef = useRef<boolean>(false);
  const nextExpRef = useRef<number>(1);
  const statusRef = useRef<GameStatus>('idle');
  const fadingCountRef = useRef<number>(0);
  const totalNRef = useRef<number>(0);

  autoPlayRef.current = autoPlay;
  nextExpRef.current = nextExpected;
  statusRef.current = status;

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };
  const stopAuto = () => {
    if (autoRef.current) { clearTimeout(autoRef.current); autoRef.current = null; }
  };

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setElapsed(e => parseFloat((e + 0.1).toFixed(1)));
    }, 100);
  };

  const initGame = useCallback((n: number) => {
    stopTimer();
    stopAuto();
    fadingCountRef.current = 0;
    totalNRef.current = n;

    const list = generateNodes(n, BOARD_W, BOARD_H);
    listRef.current = list;

    setNodes(list.toArray());
    setNextExpected(1);
    setElapsed(0);
    setStatus('playing');
    setMsgVisible(false);
    startTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlay = () => {
    const n = parseInt(pointsInput, 10);
    if (isNaN(n) || n < 1 || n > 500) return;
    initGame(n);
  };

  const handleRestart = () => {
    const n = parseInt(pointsInput, 10);
    if (isNaN(n) || n < 1) return;
    setAutoPlay(false);
    autoPlayRef.current = false;
    stopAuto();
    initGame(n);
  };

  const performClick = useCallback((id: number) => {
    if (statusRef.current !== 'playing') return;

    if (id !== nextExpRef.current) {
      stopTimer();
      stopAuto();
      setStatus('gameover');
      setStatusMessage('GAME OVER');
      setMsgVisible(true);
      return;
    }

    const totalN = totalNRef.current;
    listRef.current.updateNode(id, { clicked: true, fading: true });
    setNodes(listRef.current.toArray());
    fadingCountRef.current++;

    setNextExpected(id + 1);

    setTimeout(() => {
      listRef.current.updateNode(id, { fading: false });
      fadingCountRef.current--;
      setNodes(listRef.current.toArray());

      if (id === totalN) {
        const checkCleared = () => {
          if (fadingCountRef.current === 0) {
            stopTimer();
            stopAuto();
            setStatus('cleared');
            setStatusMessage('ALL CLEARED');
            setMsgVisible(true);
          } else {
            setTimeout(checkCleared, 80);
          }
        };
        checkCleared();
      }
    }, FADE_DURATION);
  }, []);

  const scheduleAutoClick = useCallback(() => {
    stopAuto();
    if (!autoPlayRef.current || statusRef.current !== 'playing') return;
    autoRef.current = setTimeout(() => {
      if (!autoPlayRef.current || statusRef.current !== 'playing') return;
      const next = nextExpRef.current;
      if (next <= totalNRef.current) {
        performClick(next);
        scheduleAutoClick();
      }
    }, AUTO_INTERVAL);
  }, [performClick]);

  const handleAutoToggle = () => {
    const newVal = !autoPlay;
    setAutoPlay(newVal);
    autoPlayRef.current = newVal;
    if (newVal && statusRef.current === 'playing') {
      scheduleAutoClick();
    } else {
      stopAuto();
    }
  };

  useEffect(() => {
    if (status === 'playing' && autoPlay) {
      scheduleAutoClick();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => () => { stopTimer(); stopAuto(); }, []);

  const activeNodes = nodes.filter(n => !n.clicked || n.fading);

  return (
    <div className="app">
      <div className="game-card">
        <h1 className="title">LET'S PLAY</h1>

        <div className="controls">
          <div className="control-row">
            <label>Points:</label>
            <input
              className="points-input"
              type="number"
              min={1}
              max={500}
              value={pointsInput}
              onChange={e => setPointsInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePlay()}
            />
          </div>
          <div className="control-row">
            <label>Time:</label>
            <span className="time-value">{elapsed.toFixed(1)}s</span>
          </div>
          {status !== 'idle' && (
            <div className="btn-row">
              <button className="btn btn-restart" onClick={handleRestart}>Restart</button>
              <button
                className={`btn btn-auto ${autoPlay ? 'on' : ''}`}
                onClick={handleAutoToggle}
              >
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

            {activeNodes.map(node => (
              <div
                key={node.id}
                className={`node${node.fading ? ' fading' : ''}${node.id === nextExpected && status === 'playing' ? ' next-target' : ''}`}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  width: node.radius * 2,
                  height: node.radius * 2,
                }}
                onClick={() => !node.clicked && performClick(node.id)}
              >
                <span className="node-num">{node.id}</span>
              </div>
            ))}
          </div>
        )}

        {status === 'playing' && (
          <div className="next-info">Next: <strong>{nextExpected}</strong></div>
        )}
      </div>
    </div>
  );
}
