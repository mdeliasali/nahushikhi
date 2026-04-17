import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ToolsPage() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/tools/tarkib', { replace: true });
  }, [navigate]);
  
  return null;
}
