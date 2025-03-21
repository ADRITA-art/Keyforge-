import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { io, Socket } from "socket.io-client";

const SERVER_URL = "http://localhost:5000";

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 2rem;
`;

const Container = styled.div`
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: 3rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h1`
  font-size: 4rem;
  margin-bottom: 3rem;
  color: #fff;
  text-shadow: 0 0 20px rgba(74, 144, 226, 0.5);
  font-weight: 800;
  letter-spacing: 2px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Input = styled.input`
  padding: 1.2rem;
  border: 2px solid rgba(74, 144, 226, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  width: 100%;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 20px rgba(74, 144, 226, 0.2);
  }
`;

const Button = styled(motion.button)`
  padding: 1.2rem 2.5rem;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    background: linear-gradient(135deg, #357abd 0%, #2868a0 100%);
    transform: translateY(-2px);
  }
`;

const RoomList = styled.div`
  margin-top: 3rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
`;

const RoomCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);

  h3 {
    color: #fff;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.1rem;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-5px);
  }
`;

const SectionTitle = styled.h2`
  color: #fff;
  font-size: 2rem;
  margin: 2rem 0;
  text-shadow: 0 0 10px rgba(74, 144, 226, 0.3);
`;

const RoomPage: React.FC = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null); // Moved inside function

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SERVER_URL, { transports: ["websocket"] });

      socketRef.current.on("playerJoined", ({ playerId }) => {
        setUsers((prev) => [...new Set([...prev, playerId])]);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Disconnected from server");
      });

      return () => {
        socketRef.current?.disconnect();
        socketRef.current = null;
      };
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId && username) {
      socketRef.current?.emit("joinRoom", { roomId, playerId: username });
      navigate(`/room/${roomId}`, { state: { username } });
    }
  };

  return (
    <PageWrapper>
      <Container>
        <Title>KeyForge</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit">
            Join Room
          </Button>
        </Form>
        <p>Connected Users: {users.join(", ") || "No users yet"}</p>
      </Container>
    </PageWrapper>
  );
};

export default RoomPage;