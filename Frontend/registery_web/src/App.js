import { Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Dashboard from './components/Dashboard/Dashboard';


function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Route - Requires JWT Token */}
      <Route 
        path="/dashboard" 
        element={

            <Dashboard />
        } 
      />
    </Routes>
  );
}

export default App;