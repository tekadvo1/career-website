import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignUp from './components/SignUp';
import VerifyEmail from './components/VerifyEmail';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<SignUp />} />
          <Route path="/verify" element={<VerifyEmail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
