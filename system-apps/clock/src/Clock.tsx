import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@browser-os/ui';
import './Clock.css';

type Tab = 'clock' | 'stopwatch' | 'timer';

export const Clock: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('clock');

  return (
    <div className="clock-app">
      <div className="clock-tabs">
        <div 
          className={`clock-tab ${activeTab === 'clock' ? 'active' : ''}`}
          onClick={() => setActiveTab('clock')}
        >
          Clock
        </div>
        <div 
          className={`clock-tab ${activeTab === 'stopwatch' ? 'active' : ''}`}
          onClick={() => setActiveTab('stopwatch')}
        >
          Stopwatch
        </div>
        <div 
          className={`clock-tab ${activeTab === 'timer' ? 'active' : ''}`}
          onClick={() => setActiveTab('timer')}
        >
          Timer
        </div>
      </div>
      
      <div className="clock-content">
        {activeTab === 'clock' && <ClockView />}
        {activeTab === 'stopwatch' && <StopwatchView />}
        {activeTab === 'timer' && <TimerView />}
      </div>
    </div>
  );
};

const ClockView: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <>
      <div className="clock-display">{formatTime(time)}</div>
      <div className="clock-date">{formatDate(time)}</div>
    </>
  );
};

const StopwatchView: React.FC = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(t => t + 10);
      }, 10);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const handleLap = () => {
    setLaps([time, ...laps]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  return (
    <>
      <div className="stopwatch-display">{formatTime(time)}</div>
      <div className="clock-controls">
        {!isRunning ? (
          <Button variant="primary" onClick={() => setIsRunning(true)} className="clock-button-round">Start</Button>
        ) : (
          <Button variant="ghost" onClick={() => setIsRunning(false)} className="clock-button-round clock-button-stop">Stop</Button>
        )}
        <Button variant="secondary" onClick={handleLap} disabled={!isRunning && time === 0} className="clock-button-round">Lap</Button>
        <Button variant="secondary" onClick={handleReset} className="clock-button-round">Reset</Button>
      </div>
      
      {laps.length > 0 && (
        <div className="laps-list">
          {laps.map((lap, index) => (
            <div key={index} className="lap-item">
              <span className="lap-number">Lap {laps.length - index}</span>
              <span>{formatTime(lap)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const TimerView: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [inputHours, setInputHours] = useState('00');
  const [inputMinutes, setInputMinutes] = useState('05');
  const [inputSeconds, setInputSeconds] = useState('00');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1000) {
            setIsRunning(false);
            // Could trigger an alarm sound here
            return 0;
          }
          return t - 1000;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    if (timeLeft === 0) {
      const h = parseInt(inputHours) || 0;
      const m = parseInt(inputMinutes) || 0;
      const s = parseInt(inputSeconds) || 0;
      const totalMs = (h * 3600 + m * 60 + s) * 1000;
      if (totalMs > 0) {
        setTimeLeft(totalMs);
        setInitialTime(totalMs);
        setIsRunning(true);
      }
    } else {
      setIsRunning(true);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string, max: number) => {
    if (/^\d*$/.test(value)) {
      const num = parseInt(value);
      if (!value || (num >= 0 && num <= max)) {
        setter(value.slice(-2));
      }
    }
  };

  return (
    <>
      {timeLeft === 0 && !isRunning ? (
        <div className="timer-input">
          <input 
            value={inputHours} 
            onChange={e => handleInputChange(setInputHours, e.target.value, 99)}
            placeholder="00"
            onBlur={() => setInputHours(inputHours.padStart(2, '0'))}
          />
          :
          <input 
            value={inputMinutes} 
            onChange={e => handleInputChange(setInputMinutes, e.target.value, 59)}
            placeholder="00"
            onBlur={() => setInputMinutes(inputMinutes.padStart(2, '0'))}
          />
          :
          <input 
            value={inputSeconds} 
            onChange={e => handleInputChange(setInputSeconds, e.target.value, 59)}
            placeholder="00"
            onBlur={() => setInputSeconds(inputSeconds.padStart(2, '0'))}
          />
        </div>
      ) : (
        <div className="timer-display">{formatTime(timeLeft)}</div>
      )}

      <div className="clock-controls">
        {!isRunning ? (
          <Button variant="primary" onClick={startTimer} className="clock-button-round">Start</Button>
        ) : (
          <Button variant="ghost" onClick={() => setIsRunning(false)} className="clock-button-round clock-button-stop">Pause</Button>
        )}
        <Button variant="secondary" onClick={resetTimer} className="clock-button-round">Reset</Button>
      </div>
    </>
  );
};

