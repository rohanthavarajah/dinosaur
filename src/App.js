import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import runSprite from './sprites/run1.png';
import jump1Sprite from './sprites/jump1.png';
import jump2Sprite from './sprites/jump2.png';
import jump3Sprite from './sprites/jump3.png';
import backgroundImage from './sprites/cinematics/background.jpg';
import victoryBackground from './sprites/cinematics/youwonfinal.jpg';
import welcomeBackground from './sprites/cinematics/welcome3.jpg';

// Import enemy images
import enemy1 from './sprites/obstacles/enemy1final.png';
import enemy2 from './sprites/obstacles/enemy2final2.png';
import enemy3 from './sprites/obstacles/enemy3.png';
import enemy4 from './sprites/obstacles/enemy4.png';
import enemy5 from './sprites/obstacles/enemy5.png';
import enemy6 from './sprites/obstacles/enemy6.png';
import enemy7 from './sprites/obstacles/enemy7.png';
import enemy8 from './sprites/obstacles/enemy8.png';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [llamaPosition, setLlamaPosition] = useState(20);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [currentSprite, setCurrentSprite] = useState(runSprite);
  const [obstacleCount, setObstacleCount] = useState(0);
  const [defeatedObstacles, setDefeatedObstacles] = useState([]);
  const [currentBackground, setCurrentBackground] = useState(welcomeBackground);

  const ENEMY_IMAGES = [enemy1, enemy2, enemy3, enemy4, enemy5, enemy6, enemy7, enemy8];
  const OBSTACLE_SPAWN_POINTS = [3, 15, 27, 39, 51, 63, 75, 90];
  const OBSTACLE_NAMES = [
    "Eagles Left Tackle",
    "Eagles Safety", 
    "Spencer", 
    "Freezer Ginger", 
    "Strawberry Banana Protein Shake", 
    "Sauron", 
    "Lord Voldemort", 
    "Scooter"
  ];

  const jump = useCallback(() => {
    if (!isJumping && isPlaying) {
      setIsJumping(true);
      setCurrentSprite(jump1Sprite);
      setLlamaPosition(170);

      setTimeout(() => {
        setLlamaPosition(20);
        setIsJumping(false);
        setCurrentSprite(runSprite);
      }, 500);
    }
  }, [isJumping, isPlaying]);

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setObstacles([]);
    setCurrentSprite(runSprite);
    setObstacleCount(0);
    setDefeatedObstacles([]);
    setCurrentBackground(backgroundImage);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const scoreInterval = setInterval(() => {
      setScore(prevScore => {
        const newScore = prevScore + 0.25;
        if (newScore >= 100) {
          setIsPlaying(false);
          setGameOver(true);
          setHighScore(curr => Math.max(curr, newScore));
          setCurrentBackground(victoryBackground);
        }
        return newScore;
      });
    }, 100);

    return () => clearInterval(scoreInterval);
  }, [isPlaying]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (!isPlaying && !gameOver) {
          startGame();
        } else {
          jump();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, gameOver, jump]);

  useEffect(() => {
    if (!isPlaying) return;

    const gameInterval = setInterval(() => {
      setObstacles(prevObs => {
        const updatedObs = prevObs
          .map(obs => ({ ...obs, position: obs.position - 8 }))
          .filter(obs => {
            // Check if obstacle has been defeated
            if (obs.position <= -50) {
              setDefeatedObstacles(prev => [...prev, obs.index]);
              return false;
            }
            return true;
          });

        // Spawn obstacles at specific percentages with a more explicit check
        const currentObstacleIndex = Math.floor(obstacleCount);
        if (
          currentObstacleIndex < OBSTACLE_SPAWN_POINTS.length && 
          score >= OBSTACLE_SPAWN_POINTS[currentObstacleIndex]
        ) {
          console.log(`Spawning obstacle ${currentObstacleIndex + 1} at score ${Math.floor(score)}%`);
          updatedObs.push({ 
            position: 800, 
            id: Date.now(),
            height: 80,
            index: currentObstacleIndex,
            image: ENEMY_IMAGES[currentObstacleIndex]
          });
          setObstacleCount(prev => prev + 0.5);
        }

        const collision = updatedObs.some(obs => 
          Math.abs(obs.position - 100) < 35 && llamaPosition < 100
        );

        if (collision) {
          setIsPlaying(false);
          setGameOver(true);
          setHighScore(prev => Math.max(prev, score));
          clearInterval(gameInterval);
        }

        return updatedObs;
      });
    }, 20);

    return () => clearInterval(gameInterval);
  }, [isPlaying, score, llamaPosition, obstacleCount]);

  return (
    <div className="game-container" onClick={jump}>
      <div 
        className="background" 
        style={{ backgroundImage: `url(${currentBackground})` }} 
      />
      
      <div className="obstacle-list">
        {OBSTACLE_NAMES.map((name, index) => {
          const isDefeated = defeatedObstacles.includes(index);
          const isSpawned = Math.floor(obstacleCount) > index;
          if (!isSpawned) return null;
          return (
            <div 
              key={index} 
              className={`obstacle-name ${isDefeated ? 'defeated' : ''}`}
            >
              {name}
            </div>
          );
        })}
      </div>

      {!isPlaying && !gameOver && (
        <div className="start-screen">
          It's the final seconds of the fourth quarter and the Chiefs are down 5 points. In an unprecedented move Mahomes throws to a rookie fresh off the bench. Can she make it to the endzone? Press SPACE to start.
        </div>
      )}
      
      {gameOver && (
        <div className="game-over">
          <h2>{score >= 100 ? 'CHIEFS WIN!' : 'GAME OVER'}</h2>
          <p>{score >= 100 ? 'Happy Valentines Day Megha': `You made it: ${Math.floor(score)} Yards`}</p>
          <button onClick={startGame}>Play Again</button>
        </div>
      )}

      <div 
        className="llama"
        style={{ 
          bottom: `${llamaPosition}px`,
          backgroundImage: `url(${currentSprite})`,
          display: isPlaying ? 'block' : 'none'
        }}
      />

      {obstacles.map(obstacle => (
        <div
          key={obstacle.id}
          className="enemy"
          style={{ 
            left: `${obstacle.position}px`,
            height: `${obstacle.height}px`,
            backgroundImage: `url(${obstacle.image})`
          }}
        />
      ))}

      <div className="score">{Math.floor(score)} Yards</div>
      <div className="ground" />
    </div>
  );
}

export default App;
