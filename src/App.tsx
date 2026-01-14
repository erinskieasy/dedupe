import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Comparison from './pages/Comparison';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/compare" element={<Comparison />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
