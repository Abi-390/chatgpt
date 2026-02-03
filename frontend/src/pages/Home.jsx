import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      navigate('/chat');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return null;
}
