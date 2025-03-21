import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";

const SERVER_URL = "https://keyforge-backend.onrender.com";

const PageWrapper = styled(motion.div)`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 1rem;
  position: relative;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 2rem;
  }

  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(74, 144, 226, 0.1) 0%, transparent 70%);
    animation: rotate 20s linear infinite;
  }

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(circle at 20% 20%, rgba(74, 144, 226, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(46, 204, 113, 0.1) 0%, transparent 50%);
    animation: pulse 8s ease-in-out infinite;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
`;

const Container = styled(motion.div)`
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  border-radius: 30px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.2),
    0 0 0 2px rgba(255, 255, 255, 0.1),
    0 0 100px rgba(74, 144, 226, 0.15),
    inset 0 0 50px rgba(74, 144, 226, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.15);
  position: relative;
  z-index: 1;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 4rem;
  }

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(74, 144, 226, 0.1) 0%, transparent 70%);
    animation: rotate 20s linear infinite;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, 
      rgba(74, 144, 226, 0.1) 0%,
      rgba(46, 204, 113, 0.1) 50%,
      rgba(74, 144, 226, 0.1) 100%
    );
    animation: gradientShift 8s ease-in-out infinite;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 
      0 15px 45px rgba(0, 0, 0, 0.3),
      0 0 0 2px rgba(255, 255, 255, 0.2),
      0 0 150px rgba(74, 144, 226, 0.25),
      inset 0 0 70px rgba(74, 144, 226, 0.15);
    border-color: rgba(255, 255, 255, 0.25);
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes gradientShift {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
`;

const Title = styled(motion.h1)`
  font-size: 3rem;
  margin-bottom: 2.5rem;
  color: #fff;
  text-shadow: 
    0 0 20px rgba(74, 144, 226, 0.7),
    0 0 40px rgba(74, 144, 226, 0.5),
    0 0 60px rgba(74, 144, 226, 0.3);
  font-weight: 900;
  letter-spacing: 3px;
  position: relative;
  display: inline-block;
  background: linear-gradient(45deg, #4a90e2, #2ecc71, #4a90e2);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleGlow 3s ease-in-out infinite, gradientFlow 5s linear infinite;

  @media (min-width: 768px) {
    font-size: 5rem;
    margin-bottom: 4rem;
  }

  @keyframes titleGlow {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.3); }
  }

  @keyframes gradientFlow {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 150px;
    height: 4px;
    background: linear-gradient(90deg, transparent, #4a90e2, transparent);
    border-radius: 2px;
    animation: lineGlow 3s ease-in-out infinite;
    box-shadow: 0 0 20px rgba(74, 144, 226, 0.5);
  }

  @keyframes lineGlow {
    0%, 100% { opacity: 0.5; width: 150px; }
    50% { opacity: 1; width: 200px; }
  }
`;

const Form = styled(motion.form)`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  border: 2px solid rgba(74, 144, 226, 0.2);
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 0 40px rgba(74, 144, 226, 0.15),
    inset 0 0 30px rgba(0, 0, 0, 0.2);

  @media (min-width: 768px) {
    gap: 1.8rem;
    padding: 2.5rem;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(74, 144, 226, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

const Input = styled(motion.input)`
  padding: 1.2rem;
  border: 2px solid rgba(74, 144, 226, 0.4);
  border-radius: 15px;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  width: 100%;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 0 20px rgba(74, 144, 226, 0.1),
    inset 0 0 15px rgba(0, 0, 0, 0.2);

  @media (min-width: 768px) {
    padding: 1.4rem;
    font-size: 1.2rem;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
    font-weight: 400;
  }

  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 
      0 0 30px rgba(74, 144, 226, 0.2),
      inset 0 0 20px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
    background: rgba(0, 0, 0, 0.5);
  }
`;

const Button = styled(motion.button)`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  border: 2px solid rgba(74, 144, 226, 0.5);
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 5px 15px rgba(74, 144, 226, 0.2),
    0 0 0 1px rgba(74, 144, 226, 0.1);

  @media (min-width: 768px) {
    padding: 1.2rem 2.5rem;
    font-size: 1.2rem;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  &:hover {
    background: linear-gradient(135deg, #357abd 0%, #2868a0 100%);
    transform: translateY(-2px);
    border-color: rgba(74, 144, 226, 0.8);
    box-shadow: 
      0 8px 25px rgba(74, 144, 226, 0.3),
      0 0 0 2px rgba(74, 144, 226, 0.2);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 
      0 4px 15px rgba(74, 144, 226, 0.2),
      0 0 0 1px rgba(74, 144, 226, 0.1);
  }
`;

const ButtonGroup = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const GenerateButton = styled(Button)`
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  border: 2px solid rgba(46, 204, 113, 0.5);
  box-shadow: 
    0 5px 15px rgba(46, 204, 113, 0.2),
    0 0 0 1px rgba(46, 204, 113, 0.1);
  
  &:hover {
    background: linear-gradient(135deg, #27ae60 0%, #219a52 100%);
    border-color: rgba(46, 204, 113, 0.8);
    box-shadow: 
      0 8px 25px rgba(46, 204, 113, 0.3),
      0 0 0 2px rgba(46, 204, 113, 0.2);
  }

  &:active {
    box-shadow: 
      0 4px 15px rgba(46, 204, 113, 0.2),
      0 0 0 1px rgba(46, 204, 113, 0.1);
  }
`;

const RoomDisplay = styled(motion.div)`
  background: rgba(0, 0, 0, 0.4);
  padding: 1.5rem;
  border-radius: 15px;
  margin: 1.5rem 0;
  border: 2px solid rgba(74, 144, 226, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  box-shadow: 
    0 0 40px rgba(74, 144, 226, 0.15),
    inset 0 0 30px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    padding: 2rem;
  }
`;

const RoomNumber = styled.span`
  font-size: 1.4rem;
  font-weight: 700;
  color: #4a90e2;
  letter-spacing: 3px;
  text-shadow: 
    0 0 15px rgba(74, 144, 226, 0.5),
    0 0 30px rgba(74, 144, 226, 0.3);
  animation: numberPulse 2s ease-in-out infinite;
  background: linear-gradient(45deg, #4a90e2, #2ecc71);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (min-width: 768px) {
    font-size: 1.8rem;
  }

  @keyframes numberPulse {
    0%, 100% { opacity: 0.8; filter: brightness(1); }
    50% { opacity: 1; filter: brightness(1.2); }
  }
`;

const CopyButton = styled(motion.button)`
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(74, 144, 226, 0.4);
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  color: #4a90e2;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  width: 100%;
  box-shadow: 
    0 0 20px rgba(74, 144, 226, 0.1),
    inset 0 0 15px rgba(0, 0, 0, 0.2);

  @media (min-width: 768px) {
    width: auto;
  }

  &:hover {
    background: rgba(74, 144, 226, 0.2);
    transform: translateY(-2px);
    box-shadow: 
      0 0 30px rgba(74, 144, 226, 0.2),
      inset 0 0 20px rgba(0, 0, 0, 0.3);
    border-color: rgba(74, 144, 226, 0.8);
  }
`;

const Credit = styled(motion.p)`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  font-weight: 500;
  margin-top: 2.5rem;
  font-style: italic;
  text-shadow: 
    0 0 15px rgba(74, 144, 226, 0.3),
    0 0 30px rgba(74, 144, 226, 0.2);
  position: relative;
  display: inline-block;
  letter-spacing: 1px;

  &::before, &::after {
    content: '❤';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    color: #e74c3c;
    animation: heartBeat 1.5s ease-in-out infinite;
    text-shadow: 0 0 10px rgba(231, 76, 60, 0.5);
  }

  &::before {
    left: -25px;
  }

  &::after {
    right: -25px;
  }

  @keyframes heartBeat {
    0%, 100% { transform: translateY(-50%) scale(1); }
    50% { transform: translateY(-50%) scale(1.3); }
  }

  @media (min-width: 768px) {
    font-size: 1.1rem;
  }
`;

const RoomPage: React.FC = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [generatedRoom, setGeneratedRoom] = useState<string | null>(null);
  const [showCopied, setShowCopied] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SERVER_URL, { transports: ["websocket"] });

      socketRef.current.on("disconnect", () => {
        console.log("Disconnected from server");
      });

      return () => {
        socketRef.current?.disconnect();
        socketRef.current = null;
      };
    }
  }, []);

  const generateRoomId = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedRoom(newRoomId);
    setRoomId(newRoomId);
  };

  const copyToClipboard = async () => {
    if (generatedRoom) {
      await navigator.clipboard.writeText(generatedRoom);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId && username) {
      socketRef.current?.emit("joinRoom", { roomId, playerId: username });
      navigate(`/room/${roomId}`, { state: { username } });
    }
  };

  return (
    <PageWrapper
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Title
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          KeyForge
        </Title>
        <Form
          onSubmit={handleSubmit}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            whileFocus={{ scale: 1.02 }}
          />
          <Input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            whileFocus={{ scale: 1.02 }}
          />
          <ButtonGroup>
            <Button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
            >
              Join Room
            </Button>
            <GenerateButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.preventDefault();
                generateRoomId();
              }}
            >
              Generate Room
            </GenerateButton>
          </ButtonGroup>
        </Form>

        <AnimatePresence>
          {generatedRoom && (
            <RoomDisplay
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
                  Your Room ID:
                </p>
                <RoomNumber>{generatedRoom}</RoomNumber>
              </div>
              <CopyButton
                onClick={copyToClipboard}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showCopied ? 'Copied!' : 'Copy'}
              </CopyButton>
            </RoomDisplay>
          )}
        </AnimatePresence>

        <Credit
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Made by Adrita
        </Credit>
      </Container>
    </PageWrapper>
  );
};

export default RoomPage;