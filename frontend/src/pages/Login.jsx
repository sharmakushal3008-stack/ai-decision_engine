import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/Card';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(formData.email, formData.password);
      if (res.success) navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 relative z-10">
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-neonBlue to-neonPurple bg-clip-text text-transparent">Welcome Back</h2>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-black/30 border border-glassBorder rounded-lg p-3 text-white focus:outline-none focus:border-neonBlue transition-colors"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-black/30 border border-glassBorder rounded-lg p-3 text-white focus:outline-none focus:border-neonBlue transition-colors"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button type="submit" className="btn-primary mt-4 py-3 font-semibold">Login to Engine</button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
          New here? <Link to="/signup" className="text-neonBlue hover:underline">Create an account</Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
