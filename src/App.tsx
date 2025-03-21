import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from '@emotion/styled';
import RoomPage from './pages/RoomPage';
import TypingPage from './pages/TypingPage';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
`;

const App: React.FC = () => {
  return (
    <Router>
      <AppContainer>
        <Routes>
          <Route path="/" element={<RoomPage />} />
          <Route path="/room/:roomId" element={<TypingPage />} />
        </Routes>
      </AppContainer>
    </Router>
  );
};

export default App; 