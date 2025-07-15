// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, AuthError } from '@supabase/supabase-js';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Verificar sesión actual
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          setIsAuthenticated(false);
          setUser(null);
        } else {
          setIsAuthenticated(!!session);
          setUser(session?.user || null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setIsAuthenticated(!!session);
        setUser(session?.user || null);
        setIsLoading(false);

        // Opcional: redirigir después de logout
        if (event === 'SIGNED_OUT') {
          window.location.href = '/';
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    signUp,
    resetPassword,
  };
}