import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";

const SERVER_URL = "http://localhost:5000";

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  min-height: 100vh;
  position: relative;
  padding-bottom: 3rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const AnimatedHeader = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem 2rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Title = styled.h1`
  color: #4a90e2;
  margin: 0;
  font-size: 1.8rem;
  text-shadow: 0 0 10px rgba(74, 144, 226, 0.3);
`;

const PlayerId = styled.div`
  color: #fff;
  font-size: 1rem;
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: "👤";
  }
`;

const Stats = styled.div`
  display: flex;
  gap: 3rem;
  color: #fff;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const AnimatedStatItem = styled(motion.div)`
  text-align: center;
  background: rgba(74, 144, 226, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  min-width: 100px;

  @media (max-width: 480px) {
    min-width: 80px;
    padding: 0.5rem;
  }
`;

const AnimatedStatValue = styled(motion.div)<{ isCorrect: boolean }>`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.isCorrect ? '#4a90e2' : '#ff4444'};
  text-shadow: 0 0 10px ${props => props.isCorrect ? 'rgba(74, 144, 226, 0.3)' : 'rgba(255, 68, 68, 0.3)'};
`;

const AnimatedTypingArea = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Paragraph = styled.div`
  font-size: 1.2rem;
  line-height: 1.6;
  color: #fff;
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 8px;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const AnimatedInput = styled(motion.textarea)<{ isCorrect: boolean }>`
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid ${props => props.isCorrect ? '#4a90e2' : '#ff4444'};
  border-radius: 8px;
  color: #fff;
  font-size: 1.1rem;
  resize: none;
  height: 200px;
  transition: all 0.3s ease;
  flex-grow: 1;

  @media (max-width: 768px) {
    font-size: 1rem;
    height: 150px;
  }

  &:focus {
    outline: none;
    border-color: ${props => props.isCorrect ? '#64b5f6' : '#ff6666'};
    box-shadow: 0 0 20px ${props => props.isCorrect ? 'rgba(74, 144, 226, 0.3)' : 'rgba(255, 68, 68, 0.3)'};
  }
`;

const Leaderboard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  height: fit-content;
  position: sticky;
  top: 2rem;

  @media (max-width: 1024px) {
    position: static;
    margin-top: 2rem;
  }
`;

const LeaderboardTitle = styled.h2`
  color: #4a90e2;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.5rem;
  text-shadow: 0 0 10px rgba(74, 144, 226, 0.3);
`;

const PlayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const PlayerItem = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(5px);
  }
`;

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const PlayerStats = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const PlayerAvatar = styled.div`
  width: 32px;
  height: 32px;
  background: #4a90e2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin-right: 0.5rem;
`;

const ProgressBar = styled(motion.div)`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin: 1rem 0;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)<{ progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #4a90e2, #64b5f6);
  width: ${props => props.progress}%;
  border-radius: 4px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  max-width: 500px;
  width: 90%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ModalTitle = styled.h2`
  color: #4a90e2;
  font-size: 2rem;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(74, 144, 226, 0.3);
`;

const WinnerInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const WinnerAvatar = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #4a90e2, #64b5f6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  box-shadow: 0 0 20px rgba(74, 144, 226, 0.5);
`;

const WinnerName = styled.div`
  color: #fff;
  font-size: 1.5rem;
  font-weight: bold;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const ModalButton = styled(motion.button)<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  background: ${props => props.variant === 'primary' ? '#4a90e2' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(74, 144, 226, 0.3);
  }
`;

const Credit = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  padding: 0.5rem;
  font-style: italic;
`;

const TypingPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username;

  const [paragraph, setParagraph] = useState("");
  const [input, setInput] = useState("");
  const [players, setPlayers] = useState<{ [key: string]: { progress: number, wpm: number } }>({});
  const [isCorrect, setIsCorrect] = useState(true);
  const [isRaceStarted, setIsRaceStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!username || !roomId) {
      navigate("/");
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io(SERVER_URL, { transports: ["websocket"] });

      socketRef.current.emit("joinRoom", { roomId, playerId: username });

      socketRef.current.on("paragraph", (text: string) => {
        setParagraph(text);
        setIsRaceStarted(true);
        setStartTime(Date.now());
      });

      socketRef.current.on("progressUpdate", (roomData: any) => {
        setPlayers(roomData.players);
      });

      socketRef.current.on("playerJoined", ({ playerId, players: updatedPlayers }) => {
        setPlayers(updatedPlayers);
      });

      socketRef.current.on("playerLeft", ({ playerId, players: updatedPlayers }) => {
        setPlayers(updatedPlayers);
      });

      socketRef.current.on("winner", ({ playerId }: { playerId: string }) => {
        setWinner(playerId);
        setShowWinnerModal(true);
      });

      return () => {
        socketRef.current?.disconnect();
        socketRef.current = null;
      };
    }
  }, [roomId, username, navigate]);

  useEffect(() => {
    if (isRaceStarted && startTime) {
      const interval = setInterval(() => {
        const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
        const wordsTyped = input.split(/\s+/).length;
        const currentWpm = Math.round(wordsTyped / timeElapsed);
        setWpm(currentWpm);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRaceStarted, startTime, input]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isRaceStarted) return;
    
    const value = e.target.value;
    setInput(value);

    if (socketRef.current) {
      const isCorrect = value === paragraph.slice(0, value.length);
      setIsCorrect(isCorrect);
      const progress = isCorrect ? (value.length / paragraph.length) * 100 : 0;
      socketRef.current.emit("updateProgress", { 
        roomId, 
        playerId: username, 
        progress,
        wpm 
      });
    }
  };

  const handlePlayAgain = () => {
    setShowWinnerModal(false);
    setWinner(null);
    setInput("");
    setParagraph("");
    setIsRaceStarted(false);
    setStartTime(null);
    setWpm(0);
    setIsCorrect(true);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <Container>
      <MainContent>
        <AnimatedHeader
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <HeaderLeft>
            <Title>Typing Race</Title>
            <PlayerId>{username}</PlayerId>
          </HeaderLeft>
          <Stats>
            <AnimatedStatItem
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div>Progress</div>
              <AnimatedStatValue 
                isCorrect={isCorrect}
                animate={{ 
                  scale: [1, 1.1, 1],
                  color: isCorrect ? '#4a90e2' : '#ff4444'
                }}
                transition={{ 
                  duration: 0.3,
                  ease: "easeInOut"
                }}
              >
                {Math.round(
                  (input === paragraph.slice(0, input.length) ? input.length / paragraph.length : 0) * 100
                )}%
              </AnimatedStatValue>
            </AnimatedStatItem>
            <AnimatedStatItem
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div>WPM</div>
              <AnimatedStatValue 
                isCorrect={true}
                animate={{ 
                  scale: [1, 1.1, 1],
                  color: '#4a90e2'
                }}
                transition={{ 
                  duration: 0.3,
                  ease: "easeInOut"
                }}
              >
                {wpm}
              </AnimatedStatValue>
            </AnimatedStatItem>
          </Stats>
        </AnimatedHeader>

        <AnimatedTypingArea
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paragraph>{paragraph || "Waiting for paragraph..."}</Paragraph>
          <ProgressBar>
            <ProgressFill 
              progress={input === paragraph.slice(0, input.length) ? (input.length / paragraph.length) * 100 : 0}
              animate={{
                width: input === paragraph.slice(0, input.length) ? `${(input.length / paragraph.length) * 100}%` : "0%"
              }}
              transition={{ duration: 0.3 }}
            />
          </ProgressBar>
          <AnimatedInput
            ref={inputRef}
            value={input}
            onChange={handleInput}
            placeholder="Start typing..."
            autoFocus
            isCorrect={isCorrect}
            disabled={!isRaceStarted}
            animate={{ 
              borderColor: isCorrect ? '#4a90e2' : '#ff4444',
              boxShadow: isCorrect 
                ? '0 0 20px rgba(74, 144, 226, 0.3)' 
                : '0 0 20px rgba(255, 68, 68, 0.3)'
            }}
            transition={{ 
              duration: 0.3,
              ease: "easeInOut"
            }}
          />
        </AnimatedTypingArea>
      </MainContent>

      <Leaderboard>
        <LeaderboardTitle>Leaderboard</LeaderboardTitle>
        <PlayerList>
          {Object.entries(players)
            .sort(([, a], [, b]) => b.progress - a.progress)
            .map(([playerId, data]) => (
              <PlayerItem
                key={playerId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <PlayerInfo>
                  <PlayerAvatar>
                    {playerId[0].toUpperCase()}
                  </PlayerAvatar>
                  <span>{playerId}</span>
                </PlayerInfo>
                <PlayerStats>
                  <span>{Math.round(data.progress)}%</span>
                  <span>{data.wpm} WPM</span>
                </PlayerStats>
              </PlayerItem>
            ))}
        </PlayerList>
      </Leaderboard>

      <Credit>Made by Adrita</Credit>

      <AnimatePresence>
        {showWinnerModal && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ModalContent
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ModalTitle>🎉 Race Complete! 🎉</ModalTitle>
              <WinnerInfo>
                <WinnerAvatar>
                  {winner?.[0].toUpperCase()}
                </WinnerAvatar>
                <WinnerName>
                  {winner === username ? "You won!" : `${winner} won!`}
                </WinnerName>
              </WinnerInfo>
              <ModalButtons>
                <ModalButton
                  variant="primary"
                  onClick={handleGoHome}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Play New Race
                </ModalButton>
                <ModalButton
                  onClick={handleGoHome}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Return Home
                </ModalButton>
              </ModalButtons>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default TypingPage;