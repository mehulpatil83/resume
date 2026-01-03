import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Builder from '@/pages/Builder';
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/builder" element={<Builder />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
