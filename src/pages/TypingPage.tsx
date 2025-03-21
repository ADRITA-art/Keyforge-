import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";

const SERVER_URL = "http://localhost:5000";

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  height: 100vh;
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
`;

const AnimatedStatItem = styled(motion.div)`
  text-align: center;
  background: rgba(74, 144, 226, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  min-width: 100px;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #4a90e2;
  text-shadow: 0 0 10px rgba(74, 144, 226, 0.3);
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
`;

const Paragraph = styled.div`
  font-size: 1.2rem;
  line-height: 1.6;
  color: #fff;
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 8px;
`;

const Input = styled.textarea`
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid #4a90e2;
  border-radius: 8px;
  color: #fff;
  font-size: 1.1rem;
  resize: none;
  height: 200px;
  transition: all 0.3s ease;
  flex-grow: 1;

  &:focus {
    outline: none;
    border-color: #64b5f6;
    box-shadow: 0 0 20px rgba(74, 144, 226, 0.3);
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
  justify-content: space-between;
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

const TypingPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username;

  const [paragraph, setParagraph] = useState("");
  const [input, setInput] = useState("");
  const [players, setPlayers] = useState<{ [key: string]: { progress: number } }>({});
  
  const socketRef = useRef<Socket | null>(null); // Moved inside component

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
      });

      socketRef.current.on("progressUpdate", (roomData: any) => {
        setPlayers(roomData.players);
      });

      socketRef.current.on("playerJoined", ({ playerId }) => {
        setPlayers((prev) => ({
          ...prev,
          [playerId]: { progress: 0 },
        }));
      });

      socketRef.current.on("winner", ({ playerId }: { playerId: string }) => {
        alert(playerId === username ? "🎉 You won!" : `${playerId} won!`);
        navigate("/");
      });

      return () => {
        socketRef.current?.disconnect();
        socketRef.current = null;
      };
    }
  }, [roomId, username, navigate]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    if (socketRef.current) {
      const progress = (value.length / paragraph.length) * 100;
      socketRef.current.emit("updateProgress", { roomId, playerId: username, progress });
    }
  };

  return (
    <Container>
      <p>{paragraph || "Waiting for paragraph..."}</p>
      <textarea value={input} onChange={handleInput} placeholder="Start typing..." autoFocus />
      <h3>Leaderboard</h3>
      {Object.entries(players).map(([playerId, data]) => (
        <p key={playerId}>{playerId}: {Math.round(data.progress)}%</p>
      ))}
    </Container>
  );
};

export default TypingPage;