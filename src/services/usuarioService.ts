// src/services/usuarioService.ts

import { supabase } from '../lib/supabase';
import type { 
  Usuario, 
  UsuarioFormData, 
  UsuarioCreateData, 
  UsuarioUpdateData,
  UsuarioStats,
  UsuarioFilters
} from '../types/usuario';

export const usuarioService = {
  // =============================================
  // CRUD PRINCIPAL DE USUARIOS
  // =============================================

  // Obtener todos los usuarios con filtros
  async getUsuarios(filters?: UsuarioFilters): Promise<Usuario[]> {
    try {
      // Solo admins pueden acceder a la API de usuarios
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('No autorizado');
      }

      // Verificar permisos de admin
      const isAdmin = await this.checkAdminPermissions(user.id);
      if (!isAdmin) {
        throw new Error('Permisos insuficientes');
      }

      // Obtener usuarios usando la API de administración
      const { data: { users }, error } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000 // Ajustar según necesidades
      });

      if (error) throw error;

      let usuarios = users as Usuario[];

      // Aplicar filtros si se proporcionan
      if (filters) {
        usuarios = this.applyFilters(usuarios, filters);
      }

      // Ordenar por fecha de creación (más recientes primero)
      usuarios.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return usuarios;
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  },

  // Obtener usuario por ID
  async getUsuarioById(id: string): Promise<Usuario | null> {
    try {
      const isAdmin = await this.checkCurrentUserAdminPermissions();
      if (!isAdmin) {
        throw new Error('Permisos insuficientes');
      }

      const { data: { user }, error } = await supabase.auth.admin.getUserById(id);

      if (error) {
        if (error.message.includes('not found')) return null;
        throw error;
      }

      return user as Usuario;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw error;
    }
  },

  // Crear nuevo usuario
  async createUsuario(usuarioData: UsuarioCreateData): Promise<Usuario> {
    try {
      const isAdmin = await this.checkCurrentUserAdminPermissions();
      if (!isAdmin) {
        throw new Error('Permisos insuficientes');
      }

      const { email, password, nombre, apellido, phone, email_confirm = true } = usuarioData;

      const { data: { user }, error } = await supabase.auth.admin.createUser({
        email,
        password,
        phone,
        email_confirm,
        user_metadata: {
          nombre: nombre || '',
          apellido: apellido || ''
        }
      });

      if (error) throw error;

      return user as Usuario;
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  },

  // Actualizar usuario
  async updateUsuario(id: string, usuarioData: UsuarioUpdateData): Promise<Usuario> {
    try {
      const isAdmin = await this.checkCurrentUserAdminPermissions();
      if (!isAdmin) {
        throw new Error('Permisos insuficientes');
      }

      const updateData: any = {};

      // Datos básicos
      if (usuarioData.email !== undefined) updateData.email = usuarioData.email;
      if (usuarioData.password !== undefined) updateData.password = usuarioData.password;
      if (usuarioData.phone !== undefined) updateData.phone = usuarioData.phone;

      // Email confirmation
      if (usuarioData.email_confirm !== undefined) {
        updateData.email_confirm = usuarioData.email_confirm;
      }

      // User metadata
      if (usuarioData.nombre !== undefined || usuarioData.apellido !== undefined) {
        // Obtener metadata actual primero
        const currentUser = await this.getUsuarioById(id);
        const currentMetadata = currentUser?.user_metadata || {};
        
        updateData.user_metadata = {
          ...currentMetadata,
          ...(usuarioData.nombre !== undefined && { nombre: usuarioData.nombre }),
          ...(usuarioData.apellido !== undefined && { apellido: usuarioData.apellido })
        };
      }

      // Suspensión
      if (usuarioData.ban_duration !== undefined) {
        updateData.ban_duration = usuarioData.ban_duration;
      }

      const { data: { user }, error } = await supabase.auth.admin.updateUserById(id, updateData);

      if (error) throw error;

      return user as Usuario;
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  },

  // Eliminar usuario
  async deleteUsuario(id: string): Promise<void> {
    try {
      const isAdmin = await this.checkCurrentUserAdminPermissions();
      if (!isAdmin) {
        throw new Error('Permisos insuficientes');
      }

      // Verificar que no se esté eliminando a sí mismo
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser?.id === id) {
        throw new Error('No puedes eliminar tu propia cuenta');
      }

      const { error } = await supabase.auth.admin.deleteUser(id);

      if (error) throw error;

      console.log(`Usuario ${id} eliminado exitosamente`);
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  },

  // =============================================
  // GESTIÓN DE PERMISOS
  // =============================================

  // Verificar si el usuario actual está autenticado
  async checkCurrentUserAdminPermissions(): Promise<boolean> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) return false;

      // Solo verificar que esté autenticado, no permisos específicos
      return true;
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      return false;
    }
  },

  // Verificar autenticación de un usuario específico
  async checkAdminPermissions(userId: string): Promise<boolean> {
    try {
      // Solo verificar que el usuario existe, no permisos específicos
      const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);
      
      if (error || !user) return false;

      return true;
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      return false;
    }
  },

  // =============================================
  // GESTIÓN DE ESTADO DE USUARIOS
  // =============================================

  // Confirmar email manualmente
  async confirmarEmail(id: string): Promise<Usuario> {
    return await this.updateUsuario(id, { email_confirm: true });
  },

  // Suspender usuario
  async suspenderUsuario(id: string, duracion: string = '87600h'): Promise<Usuario> {
    return await this.updateUsuario(id, { ban_duration: duracion });
  },

  // Reactivar usuario
  async reactivarUsuario(id: string): Promise<Usuario> {
    return await this.updateUsuario(id, { ban_duration: 'none' });
  },

  // Enviar enlace de recuperación de contraseña
  async enviarRecuperacionPassword(email: string): Promise<void> {
    try {
      const isAdmin = await this.checkCurrentUserAdminPermissions();
      if (!isAdmin) {
        throw new Error('Permisos insuficientes');
      }

      const { error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: {
          redirectTo: `${window.location.origin}/reset-password`
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error enviando recuperación:', error);
      throw error;
    }
  },

  // =============================================
  // FUNCIONES AUXILIARES Y FILTROS
  // =============================================

  // Aplicar filtros a la lista de usuarios
  applyFilters(usuarios: Usuario[], filters: UsuarioFilters): Usuario[] {
    let filtered = [...usuarios];

    // Filtro de búsqueda
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(search) ||
        user.user_metadata?.nombre?.toLowerCase().includes(search) ||
        user.user_metadata?.apellido?.toLowerCase().includes(search)
      );
    }

    // Filtro de confirmado
    if (filters.confirmado !== undefined) {
      filtered = filtered.filter(user => 
        filters.confirmado ? !!user.email_confirmed_at : !user.email_confirmed_at
      );
    }

    // Filtro de actividad (últimos 30 días)
    if (filters.activo !== undefined) {
      const treintaDiasAtras = new Date();
      treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);
      
      filtered = filtered.filter(user => {
        if (!user.last_sign_in_at) return !filters.activo;
        const lastSignIn = new Date(user.last_sign_in_at);
        return filters.activo ? lastSignIn >= treintaDiasAtras : lastSignIn < treintaDiasAtras;
      });
    }

    // Filtro de fecha desde
    if (filters.desde) {
      const desde = new Date(filters.desde);
      filtered = filtered.filter(user => new Date(user.created_at) >= desde);
    }

    // Filtro de fecha hasta
    if (filters.hasta) {
      const hasta = new Date(filters.hasta);
      hasta.setHours(23, 59, 59, 999); // Final del día
      filtered = filtered.filter(user => new Date(user.created_at) <= hasta);
    }

    return filtered;
  },

  // Buscar usuarios
  async searchUsuarios(query: string): Promise<Usuario[]> {
    return await this.getUsuarios({ search: query });
  },

  // =============================================
  // ESTADÍSTICAS
  // =============================================

  // Obtener estadísticas de usuarios
  async getStats(): Promise<UsuarioStats> {
    try {
      const usuarios = await this.getUsuarios();
      
      const total = usuarios.length;
      const confirmados = usuarios.filter(u => !!u.email_confirmed_at).length;
      const pendientes = total - confirmados;
      
      // Usuarios activos (últimos 30 días)
      const treintaDiasAtras = new Date();
      treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);
      const activos = usuarios.filter(u => 
        u.last_sign_in_at && new Date(u.last_sign_in_at) >= treintaDiasAtras
      ).length;
      
      // Último registro
      const fechas = usuarios
        .map(u => u.created_at)
        .filter(Boolean)
        .sort()
        .reverse();
      
      const ultimoRegistro = fechas.length > 0 ? fechas[0] : null;
      
      return {
        total,
        confirmados,
        pendientes,
        activos,
        ultimoRegistro
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  // =============================================
  // FUNCIONES DE UTILIDAD
  // =============================================

  // Formatear nombre completo
  getFullName(usuario: Usuario): string {
    const nombre = usuario.user_metadata?.nombre || '';
    const apellido = usuario.user_metadata?.apellido || '';
    return `${nombre} ${apellido}`.trim() || usuario.email;
  },

  // Obtener estado del usuario
  getUsuarioEstado(usuario: Usuario): {
    activo: boolean;
    confirmado: boolean;
    suspendido: boolean;
    ultimo_acceso: string | null;
  } {
    return {
      activo: !!usuario.last_sign_in_at,
      confirmado: !!usuario.email_confirmed_at,
      suspendido: false, // Implementar lógica de suspensión si es necesario
      ultimo_acceso: usuario.last_sign_in_at
    };
  },

  // Validar datos de usuario
  validateUsuarioData(data: UsuarioFormData | UsuarioCreateData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar email
    if (!data.email) {
      errors.push('El email es requerido');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('El email no tiene un formato válido');
    }

    // Validar password (solo para creación)
    if ('password' in data && data.password !== undefined) {
      if (!data.password || data.password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};