import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState<boolean | null>(null);

  const { updatePassword, supabase } = useAuth();
  const navigate = useNavigate();

useEffect(() => {
  const handlePasswordRecovery = async () => {
    try {
      // Verificar si hay una sesión activa (después de la confirmación del token)
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setValidToken(false);
        setError('Error verificando la sesión. Solicita un nuevo enlace.');
        return;
      }

      if (session && session.user) {
        setValidToken(true);
        console.log('Usuario autenticado para reset:', session.user.email);
      } else {
        setValidToken(false);
        setError('Token de reseteo inválido o expirado. Solicita un nuevo enlace.');
      }
    } catch (error) {
      console.error('Error in password recovery flow:', error);
      setValidToken(false);
      setError('Error inesperado. Solicita un nuevo enlace.');
    }
  };

  handlePasswordRecovery();

  // También escuchar cambios en el estado de auth
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
    console.log('Auth event in ResetPassword:', event);
    
    if (event === 'PASSWORD_RECOVERY') {
      setValidToken(true);
    } else if (event === 'SIGNED_OUT') {
      setValidToken(false);
      setError('La sesión ha expirado. Solicita un nuevo enlace.');
    }
  });

  return () => subscription.unsubscribe();
}, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }
    
    try {
      await updatePassword(password);
      setSuccess(true);
      
      // Redirigir al login después de un momento
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Contraseña actualizada exitosamente' }
        });
      }, 2000);
    } catch (err: any) {
      console.error('Reset password failed:', err);
      setError('Error al actualizar la contraseña. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (validToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 text-xl">✕</span>
              </div>
              <h2 className="text-xl font-semibold">Token inválido</h2>
              <p className="text-sm text-muted-foreground">
                El enlace de reseteo es inválido o ha expirado. 
                Solicita uno nuevo.
              </p>
              <Button asChild className="w-full">
                <Link to="/forgot-password">Solicitar nuevo enlace</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="text-xl font-semibold">Contraseña actualizada</h2>
              <p className="text-sm text-muted-foreground">
                Tu contraseña ha sido actualizada exitosamente. 
                Redirigiendo al login...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Nueva Contraseña</CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Ingresa tu nueva contraseña
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Nueva contraseña
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar contraseña
              </label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar contraseña'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}