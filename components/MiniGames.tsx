
import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, Activity, Zap, Box, Gamepad2, Crown, Globe, Wifi, User, Users, Loader2 } from 'lucide-react';

interface MiniGamesProps {
  onClose: () => void;
}

type GameType = 'MENU' | 'SNAKE' | 'PONG' | 'SLOPE';
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'CYBERPUNK';
type GameMode = 'SOLO' | 'ONLINE';

const DIFFICULTIES: Record<Difficulty, number> = {
  EASY: 1,
  MEDIUM: 1.5,
  HARD: 2,
  CYBERPUNK: 3.5
};

const ONLINE_OPPONENTS = [
  { name: 'NeonViper', skill: 0.08 },
  { name: 'KAI_Zero', skill: 0.12 },
  { name: 'ChronosUser_99', skill: 0.05 },
  { name: 'GhostShell', skill: 0.15 },
  { name: 'VelocitY', skill: 0.1 },
];

// --- SHARED HOOKS ---
const useGameLoop = (callback: (time: number) => void, active: boolean) => {
  const reqRef = useRef<number>(0);
  const loop = (time: number) => {
    callback(time);
    reqRef.current = requestAnimationFrame(loop);
  };
  useEffect(() => {
    if (active) reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current);
  }, [active, callback]);
};

// --- GAME 1: NEON SNAKE ---
const SnakeGame: React.FC<{ difficulty: Difficulty; onGameOver: (score: number) => void }> = ({ difficulty, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const GRID_SIZE = 20;
  const CELL_SIZE = 20;
  const lastUpdateRef = useRef(0);

  const snakeRef = useRef([{ x: 10, y: 10 }]);
  const foodRef = useRef({ x: 15, y: 15 });
  const dirRef = useRef({ x: 1, y: 0 });
  const nextDirRef = useRef({ x: 1, y: 0 });
  const touchStartRef = useRef<{x:number, y:number} | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const d = dirRef.current;
      switch(e.key) {
        case 'ArrowUp': if (d.y === 0) nextDirRef.current = { x: 0, y: -1 }; break;
        case 'ArrowDown': if (d.y === 0) nextDirRef.current = { x: 0, y: 1 }; break;
        case 'ArrowLeft': if (d.x === 0) nextDirRef.current = { x: -1, y: 0 }; break;
        case 'ArrowRight': if (d.x === 0) nextDirRef.current = { x: 1, y: 0 }; break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const d = dirRef.current;

    if (absDx > absDy && absDx > 30) {
        if (dx > 0 && d.x === 0) nextDirRef.current = { x: 1, y: 0 };
        else if (dx < 0 && d.x === 0) nextDirRef.current = { x: -1, y: 0 };
    } else if (absDy > absDx && absDy > 30) {
        if (dy > 0 && d.y === 0) nextDirRef.current = { x: 0, y: 1 };
        else if (dy < 0 && d.y === 0) nextDirRef.current = { x: 0, y: -1 };
    }
    touchStartRef.current = null;
  };

  useGameLoop((time) => {
    if (gameOver) return;
    
    const baseSpeed = difficulty === 'CYBERPUNK' ? 40 : 150 / DIFFICULTIES[difficulty];
    
    if (time - lastUpdateRef.current > baseSpeed) {
      lastUpdateRef.current = time;
      
      dirRef.current = nextDirRef.current;
      const head = { ...snakeRef.current[0] };
      head.x += dirRef.current.x;
      head.y += dirRef.current.y;

      if (head.x < 0) head.x = GRID_SIZE - 1;
      if (head.x >= GRID_SIZE) head.x = 0;
      if (head.y < 0) head.y = GRID_SIZE - 1;
      if (head.y >= GRID_SIZE) head.y = 0;

      if (snakeRef.current.some(s => s.x === head.x && s.y === head.y)) {
        setGameOver(true);
        onGameOver(score);
        return;
      }

      snakeRef.current.unshift(head);

      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        setScore(s => s + 10);
        foodRef.current = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE)
        };
      } else {
        snakeRef.current.pop();
      }
    }

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 400, 400);
      
      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      for(let i=0; i<GRID_SIZE; i++) {
        ctx.beginPath(); ctx.moveTo(i*CELL_SIZE, 0); ctx.lineTo(i*CELL_SIZE, 400); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i*CELL_SIZE); ctx.lineTo(400, i*CELL_SIZE); ctx.stroke();
      }

      // Food
      ctx.fillStyle = '#bc13fe';
      ctx.shadowBlur = 15; ctx.shadowColor = '#bc13fe';
      ctx.beginPath();
      ctx.arc(foodRef.current.x * CELL_SIZE + 10, foodRef.current.y * CELL_SIZE + 10, 6, 0, Math.PI*2);
      ctx.fill();

      // Snake
      ctx.shadowBlur = 10; ctx.shadowColor = '#00f3ff';
      snakeRef.current.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? '#ffffff' : '#00f3ff';
        ctx.globalAlpha = i===0 ? 1 : 0.6;
        ctx.fillRect(seg.x*CELL_SIZE+1, seg.y*CELL_SIZE+1, CELL_SIZE-2, CELL_SIZE-2);
      });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }
  }, !gameOver);

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 text-white font-mono text-xl font-bold z-10">{score}</div>
      <canvas ref={canvasRef} width={400} height={400} className="bg-black/60 rounded-xl border border-white/10" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} />
      {gameOver && <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-2xl bg-black/90 rounded-xl backdrop-blur-sm">TERMINATED</div>}
      <div className="mt-4 text-center text-[10px] text-gray-500 uppercase tracking-widest">Swipe to Navigate</div>
    </div>
  );
};

// --- GAME 2: CYBER PONG (PvP / PvE) ---
const PongGame: React.FC<{ difficulty: Difficulty; mode: GameMode; opponentName?: string; onGameOver: (score: number) => void }> = ({ difficulty, mode, opponentName, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  
  const ballRef = useRef({ x: 200, y: 200, dx: 4, dy: 4 });
  const p1Ref = useRef(150);
  const p2Ref = useRef(150);
  
  // For Online Simulation: Human-like delays
  const reactionTimer = useRef(0);
  const targetYRef = useRef(150);

  const paddleHeight = 60;
  const paddleWidth = 8;

  const handleMove = (y: number) => {
      p1Ref.current = Math.max(0, Math.min(340, y - paddleHeight/2));
  };

  useGameLoop((time) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const ball = ballRef.current;
    let speedMult = DIFFICULTIES[difficulty];
    if (mode === 'ONLINE') speedMult = 1.5; // Standardized speed for online
    
    // Update Ball
    ball.x += ball.dx * speedMult;
    ball.y += ball.dy * speedMult;

    // Wall Collision
    if (ball.y <= 0 || ball.y >= 400) ball.dy *= -1;

    // Paddle Collision Physics (AABB)
    // P1
    if (ball.x <= 20 + paddleWidth && ball.x >= 20 && ball.y >= p1Ref.current && ball.y <= p1Ref.current + paddleHeight) {
        ball.dx = Math.abs(ball.dx) * 1.05; // Slight speed up
        ball.x = 20 + paddleWidth + 1; // Push out
        setScore(s => s + 10);
    }
    // P2 (AI / Remote)
    if (ball.x >= 380 - paddleWidth && ball.x <= 380 && ball.y >= p2Ref.current && ball.y <= p2Ref.current + paddleHeight) {
        ball.dx = -Math.abs(ball.dx) * 1.05;
        ball.x = 380 - paddleWidth - 1;
    }

    // Score Reset
    if (ball.x < 0) {
        setAiScore(s => s + 1);
        ballRef.current = { x: 200, y: 200, dx: 4, dy: (Math.random() - 0.5) * 8 };
    }
    if (ball.x > 400) {
        setScore(s => s + 50);
        ballRef.current = { x: 200, y: 200, dx: -4, dy: (Math.random() - 0.5) * 8 };
    }

    // P2 Logic
    if (mode === 'SOLO') {
        // Perfect Tracking AI
        const targetY = ball.y - paddleHeight/2;
        const aiSpeed = difficulty === 'EASY' ? 0.05 : difficulty === 'HARD' ? 0.15 : 0.1;
        p2Ref.current += (targetY - p2Ref.current) * aiSpeed;
    } else {
        // "Human" Simulation (Reaction Delay + Error)
        // Only update target if ball is moving towards P2 and crossed midline
        if (ball.dx > 0 && ball.x > 200) {
           if (time - reactionTimer.current > 200) { // 200ms reaction delay
               targetYRef.current = ball.y - paddleHeight/2 + (Math.random() * 20 - 10); // Slight error
               reactionTimer.current = time;
           }
        }
        const humanSpeed = 0.08; // Not instant
        p2Ref.current += (targetYRef.current - p2Ref.current) * humanSpeed;
    }
    p2Ref.current = Math.max(0, Math.min(340, p2Ref.current));

    // Render
    ctx.clearRect(0, 0, 400, 400);
    ctx.fillStyle = '#000000'; ctx.fillRect(0,0,400,400);
    
    // Center Line
    ctx.beginPath(); ctx.setLineDash([5, 15]); ctx.moveTo(200,0); ctx.lineTo(200,400); 
    ctx.strokeStyle = '#333'; ctx.stroke(); ctx.setLineDash([]);

    // Paddles
    ctx.fillStyle = '#00f3ff'; ctx.shadowBlur = 15; ctx.shadowColor = '#00f3ff';
    ctx.fillRect(20, p1Ref.current, paddleWidth, paddleHeight);
    
    ctx.fillStyle = mode === 'ONLINE' ? '#ffcc00' : '#ff0055'; 
    ctx.shadowColor = mode === 'ONLINE' ? '#ffcc00' : '#ff0055';
    ctx.fillRect(380, p2Ref.current, paddleWidth, paddleHeight);

    // Ball
    ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff';
    ctx.beginPath(); ctx.arc(ball.x, ball.y, 5, 0, Math.PI*2); ctx.fill();
    
  }, true);

  return (
    <div className="relative">
        {mode === 'ONLINE' && (
             <div className="absolute -top-8 left-0 right-0 flex justify-between text-[10px] font-mono uppercase tracking-widest text-gray-500">
                 <div className="flex items-center gap-1"><User size={10}/> YOU</div>
                 <div className="flex items-center gap-1"><Wifi size={10} className="text-green-500"/> LIVE</div>
                 <div className="flex items-center gap-1">{opponentName} <Users size={10}/></div>
             </div>
        )}
        <div className="absolute top-4 left-0 right-0 flex justify-center gap-12 text-mono font-bold text-3xl z-10">
            <span className="text-neon-primary">{score}</span>
            <span className={mode === 'ONLINE' ? "text-yellow-400" : "text-red-500"}>{aiScore}</span>
        </div>
        <canvas 
            ref={canvasRef} width={400} height={400}
            className="bg-black rounded-xl border border-white/10 touch-none cursor-none"
            onTouchMove={(e) => handleMove(e.touches[0].clientY - (e.target as HTMLElement).getBoundingClientRect().top)}
            onMouseMove={(e) => handleMove(e.nativeEvent.offsetY)}
        />
        <div className="mt-4 text-center text-[10px] text-gray-500 uppercase tracking-widest">Touch & Drag to Deflect</div>
    </div>
  );
};

// --- GAME 3: NEON RUNNER 3D ---
const SlopeGame: React.FC<{ difficulty: Difficulty; onGameOver: (score: number) => void }> = ({ difficulty, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [scoreDisplay, setScoreDisplay] = useState(0);

  const gameState = useRef({
    playerX: 0, // -1 to 1
    speed: 0,
    distance: 0,
    obstacles: [] as {x: number, z: number, type: number}[],
  });

  // Init
  useEffect(() => {
    gameState.current.speed = difficulty === 'EASY' ? 0.05 : difficulty === 'CYBERPUNK' ? 0.15 : 0.08;
  }, [difficulty]);

  // Controls
  const handleTouchStart = (e: React.TouchEvent) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      gameState.current.playerX = x < rect.width/2 ? -0.7 : 0.7;
  };
  const handleTouchEnd = () => { gameState.current.playerX = 0; };
  
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') gameState.current.playerX = -0.7;
      if (e.key === 'ArrowRight') gameState.current.playerX = 0.7;
    };
    const up = () => { gameState.current.playerX = 0; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useGameLoop(() => {
    if (gameOver) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const state = gameState.current;

    // Logic
    state.distance += state.speed;
    setScoreDisplay(Math.floor(state.distance * 100));

    // Spawn Obstacles
    if (Math.random() < (0.05 * (DIFFICULTIES[difficulty]))) {
        state.obstacles.push({
            x: Math.random() > 0.5 ? 0.7 : -0.7,
            z: 10, // Spawn far away
            type: Math.floor(Math.random() * 2)
        });
    }

    // Update Obstacles
    state.obstacles.forEach(o => o.z -= state.speed);
    
    // Collision
    state.obstacles.forEach(o => {
        if (o.z < 0.2 && o.z > -0.2) {
            if (Math.abs(o.x - state.playerX) < 0.5) {
                setGameOver(true);
                onGameOver(Math.floor(state.distance * 100));
            }
        }
    });
    state.obstacles = state.obstacles.filter(o => o.z > -1);

    // RENDER 3D
    const width = 400;
    const height = 400;
    const cx = width / 2;
    const cy = height / 2;
    const fov = 300; 
    const horizonY = cy - 50;

    ctx.clearRect(0, 0, width, height);
    
    // Sky
    const grad = ctx.createLinearGradient(0, 0, 0, horizonY);
    grad.addColorStop(0, '#000');
    grad.addColorStop(1, '#1a0b2e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, horizonY);

    // Ground (Retro Grid)
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, horizonY, width, height - horizonY);

    // Project 3D Point to 2D
    const project = (x: number, y: number, z: number) => {
        if (z <= 0) z = 0.01; // Prevent div by zero
        const scale = fov / z;
        return {
            x: cx + x * scale * 150, // Spread X
            y: cy + y * scale * 50 + 50, // Camera Height offset
            scale: scale
        };
    };

    // Draw Vertical Grid Lines
    ctx.strokeStyle = difficulty === 'CYBERPUNK' ? '#ff00ff' : 'rgba(0, 243, 255, 0.4)';
    ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i+=1) {
        const pStart = project(i, 0, 0.1); // Near
        const pEnd = project(i, 0, 20);    // Far
        ctx.beginPath();
        ctx.moveTo(pStart.x, pStart.y);
        ctx.lineTo(pEnd.x, horizonY); // Vanishing point
        ctx.stroke();
    }

    // Draw Horizontal Lines (Moving towards player)
    const offset = (state.distance * 2) % 1; 
    for (let z = 10; z > 0; z -= 1) {
        const actualZ = z - offset;
        if (actualZ <= 0.1) continue;
        const p1 = project(-20, 0, actualZ);
        const p2 = project(20, 0, actualZ);
        ctx.beginPath();
        ctx.moveTo(0, p1.y);
        ctx.lineTo(width, p2.y);
        ctx.globalAlpha = Math.min(1, 1/actualZ); // Fog
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Draw Player
    const pPos = project(state.playerX, 0, 0.5);
    ctx.shadowBlur = 20; ctx.shadowColor = 'white';
    ctx.fillStyle = 'white';
    ctx.beginPath(); 
    ctx.arc(pPos.x, pPos.y, 10, 0, Math.PI*2); 
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Obstacles
    state.obstacles.sort((a,b) => b.z - a.z).forEach(o => {
        if (o.z <= 0.1) return;
        const pos = project(o.x, 0, o.z);
        const size = 40 * pos.scale * 0.02;
        
        ctx.fillStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 20;
        const h = size * 30; 
        ctx.fillRect(pos.x - (size*10), pos.y - h, size*20, h);
    });

  }, !gameOver);

  return (
    <div className="relative">
       <div className="absolute top-4 right-4 text-white font-mono text-xl font-bold z-10 drop-shadow-md">DIST: {scoreDisplay}m</div>
       <canvas 
            ref={canvasRef} width={400} height={400}
            className={`rounded-xl border border-white/10 touch-none ${difficulty === 'CYBERPUNK' ? 'animate-pulse' : ''}`}
            onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
       />
       {gameOver && <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-xl flex-col">
           <div className="text-red-500 font-bold text-3xl tracking-widest animate-bounce">CRASH</div>
           <div className="text-white mt-2 font-mono">SCORE: {scoreDisplay}</div>
       </div>}
       <div className="mt-4 text-center text-[10px] text-gray-500 uppercase tracking-widest">Hold Left/Right to Steer</div>
    </div>
  );
};

// --- MATCHMAKING UI ---
const Matchmaking: React.FC<{ onMatchFound: (name: string) => void, onCancel: () => void }> = ({ onMatchFound, onCancel }) => {
  const [status, setStatus] = useState(0); // 0: Connect, 1: Search, 2: Found
  const [dots, setDots] = useState('.');

  useEffect(() => {
    const dTimer = setInterval(() => setDots(d => d.length > 2 ? '.' : d + '.'), 500);
    return () => clearInterval(dTimer);
  }, []);

  useEffect(() => {
    // Simulate connection steps
    setTimeout(() => setStatus(1), 1500); // Connect -> Search
    setTimeout(() => setStatus(2), 4500); // Search -> Found
    setTimeout(() => {
       const randomOpponent = ONLINE_OPPONENTS[Math.floor(Math.random() * ONLINE_OPPONENTS.length)];
       onMatchFound(randomOpponent.name);
    }, 6000);
  }, []);

  return (
    <div className="h-[400px] flex flex-col items-center justify-center text-center p-8">
       {status < 2 ? (
         <>
           <div className="relative mb-8">
              <div className="absolute inset-0 bg-neon-primary/20 blur-xl rounded-full animate-pulse"></div>
              <Globe size={64} className="text-white relative z-10 animate-spin-slow" style={{ animationDuration: '10s' }} />
           </div>
           <h3 className="text-xl font-mono font-bold text-white mb-2">
             {status === 0 ? "Connecting to Server" : "Searching for Opponent"}
             {dots}
           </h3>
           <p className="text-xs text-gray-500 mb-8 font-mono">
             {status === 0 ? "Region: EU-West (12ms)" : "Skill Rating: 1240 ± 50"}
           </p>
           <button onClick={onCancel} className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/10 text-xs text-gray-400 transition-colors">
             Cancel
           </button>
         </>
       ) : (
         <div className="animate-spring-in">
            <div className="w-24 h-24 bg-neon-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-neon-primary">
               <Users size={40} className="text-neon-primary" />
            </div>
            <div className="text-neon-primary font-bold tracking-widest mb-1">MATCH FOUND</div>
            <div className="text-2xl text-white font-mono mb-8">Connecting...</div>
         </div>
       )}
    </div>
  );
}

// --- MENU SYSTEM ---
export const MiniGames: React.FC<MiniGamesProps> = ({ onClose }) => {
  const [mode, setMode] = useState<GameType>('MENU');
  const [gameMode, setGameMode] = useState<GameMode>('SOLO');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [highScores, setHighScores] = useState({ snake: 0, pong: 0, slope: 0 });
  const [opponent, setOpponent] = useState<string | null>(null);
  const [isMatchmaking, setIsMatchmaking] = useState(false);

  useEffect(() => {
      const s = localStorage.getItem('chronos_scores');
      if (s) setHighScores(JSON.parse(s));
  }, []);

  const saveScore = (game: string, score: number) => {
      const newScores = { ...highScores, [game]: Math.max(highScores[game as keyof typeof highScores], score) };
      setHighScores(newScores);
      localStorage.setItem('chronos_scores', JSON.stringify(newScores));
  };

  const startOnlineMatch = () => {
    setIsMatchmaking(true);
  };

  const handleMatchFound = (name: string) => {
    setOpponent(name);
    setTimeout(() => {
      setIsMatchmaking(false);
      setMode('PONG');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-black border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 relative z-10">
            <div className="flex items-center gap-3">
                {(mode !== 'MENU' || isMatchmaking) && (
                    <button onClick={() => { setMode('MENU'); setIsMatchmaking(false); setOpponent(null); }} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                )}
                <h2 className="text-xl font-bold text-white font-mono tracking-[0.2em] flex items-center gap-2">
                    <Gamepad2 size={20} className="text-neon-primary" />
                    {mode === 'MENU' && !isMatchmaking ? 'ARCADE' : isMatchmaking ? 'NETWORK' : mode}
                </h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-red-500/20 hover:text-red-500 text-gray-500 transition-colors">
                <X size={20} />
            </button>
        </div>

        {isMatchmaking ? (
           <Matchmaking onMatchFound={handleMatchFound} onCancel={() => setIsMatchmaking(false)} />
        ) : mode === 'MENU' ? (
            <div className="space-y-6 relative z-10">
                {/* Game Mode Toggle */}
                <div className="flex p-1 bg-white/5 rounded-xl border border-white/5 mb-4">
                   <button onClick={() => setGameMode('SOLO')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${gameMode === 'SOLO' ? 'bg-white text-black' : 'text-gray-500'}`}>SOLO PLAY</button>
                   <button onClick={() => setGameMode('ONLINE')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${gameMode === 'ONLINE' ? 'bg-neon-primary text-black' : 'text-gray-500'}`}>
                      ONLINE PvP <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                   </button>
                </div>

                {gameMode === 'SOLO' && (
                  <div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 text-center">AI Difficulty</div>
                      <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                          {(Object.keys(DIFFICULTIES) as Difficulty[]).map(d => (
                              <button 
                                  key={d}
                                  onClick={() => setDifficulty(d)}
                                  className={`flex-1 py-2 text-[9px] font-bold rounded-lg transition-all duration-300 ${difficulty === d ? 'bg-neon-primary text-black shadow-[0_0_15px_rgba(var(--neon-primary),0.4)]' : 'text-gray-500 hover:text-white'}`}
                              >
                                  {d}
                              </button>
                          ))}
                      </div>
                  </div>
                )}

                {gameMode === 'ONLINE' ? (
                   <div className="space-y-4">
                      <div className="p-6 border border-neon-primary/30 bg-neon-primary/5 rounded-2xl text-center">
                         <Globe className="mx-auto text-neon-primary mb-3" size={32} />
                         <h3 className="text-white font-bold mb-1">Ranked Matchmaking</h3>
                         <p className="text-xs text-gray-400 mb-4">Find an opponent online for a 1v1 Pong duel.</p>
                         <button onClick={startOnlineMatch} className="w-full py-3 bg-neon-primary text-black font-bold rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(var(--neon-primary),0.4)]">
                            FIND MATCH
                         </button>
                      </div>
                      <div className="text-[10px] text-gray-600 text-center">
                         Server Status: <span className="text-green-500">ONLINE</span> • 124 Players Queued
                      </div>
                   </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setMode('SNAKE')} className="h-32 bg-gradient-to-br from-green-900/20 to-black border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-green-400 transition-all group">
                            <Activity size={28} className="text-green-400 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-white tracking-wider">SNAKE</span>
                            <span className="text-[9px] text-gray-500">HI: {highScores.snake}</span>
                        </button>
                        <button onClick={() => setMode('PONG')} className="h-32 bg-gradient-to-br from-purple-900/20 to-black border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-purple-400 transition-all group">
                            <Box size={28} className="text-purple-400 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-white tracking-wider">PONG</span>
                            <span className="text-[9px] text-gray-500">HI: {highScores.pong}</span>
                        </button>
                    </div>

                    <button onClick={() => setMode('SLOPE')} className="w-full h-24 relative group overflow-hidden rounded-2xl border border-white/10">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-purple-900/20 opacity-50"></div>
                        <div className="absolute inset-0 flex items-center justify-between px-8 relative z-10">
                            <div className="text-left">
                                <div className="text-neon-primary font-bold text-lg tracking-widest group-hover:text-white transition-colors">NEON RUNNER</div>
                                <div className="text-[9px] text-gray-400">3D INFINITY MODE</div>
                            </div>
                            <Zap className="text-neon-primary group-hover:scale-110 transition-transform" />
                        </div>
                    </button>
                  </>
                )}
                
                <div className="text-center pt-4">
                   <Crown size={14} className="mx-auto text-yellow-500 mb-1" />
                   <div className="text-[9px] text-gray-600 font-mono">ROYAL EDITION • v4.1</div>
                </div>
            </div>
        ) : (
            <div className="flex justify-center">
                {mode === 'SNAKE' && <SnakeGame difficulty={difficulty} onGameOver={(s) => saveScore('snake', s)} />}
                {mode === 'PONG' && <PongGame difficulty={difficulty} mode={gameMode} opponentName={opponent || 'CPU'} onGameOver={(s) => saveScore('pong', s)} />}
                {mode === 'SLOPE' && <SlopeGame difficulty={difficulty} onGameOver={(s) => saveScore('slope', s)} />}
            </div>
        )}
      </div>
    </div>
  );
};
