// src/pages/auth/Confirm.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Confirm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { supabase } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleConfirmation = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      console.log('Confirm page - Token hash:', token_hash, 'Type:', type);

      if (!token_hash || !type) {
        setError('Parámetros de confirmación faltantes');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any
        });

        if (error) {
          console.error('Verification error:', error);
          setError('Token inválido o expirado');
          setTimeout(() => navigate('/forgot-password'), 3000);
          return;
        }

        console.log('Verification successful:', data);

        // Para recovery, redirigir a reset password
        if (type === 'recovery') {
          navigate('/reset-password');
        } else {
          navigate('/');
        }

      } catch (error) {
        console.error('Error during confirmation:', error);
        setError('Error durante la verificación');
        setTimeout(() => navigate('/forgot-password'), 3000);
      }
    };

    handleConfirmation();
  }, [searchParams, navigate, supabase]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Error de verificación</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Verificando enlace...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-4">Por favor espera un momento</p>
      </div>
    </div>
  );
}