// src/services/dashboardService.ts - Actualizado con usuarios

import { supabase } from '../lib/supabase';
import { usuarioService } from './usuarioService';

export interface DashboardStats {
  examenes: {
    total: number;
    publicados: number;
    borradores: number;
    conHorarios: number;
    conFAQs: number;
    conMuestras: number;
  };
  centros: {
    total: number;
    publicados: number;
    borradores: number;
    porEstado: { estado: string; cantidad: number; }[];
  };
  estados: {
    total: number;
    publicados: number;
    borradores: number;
  };
  paginas: {
    total: number;
    publicadas: number;
    borradores: number;
  };
  sliders: {
    total: number;
    publicados: number;
    borradores: number;
  };
  newsletters: {
    total: number;
    publicados: number;
    borradores: number;
    recientes: number;
  };
  // ✅ Nuevas estadísticas de usuarios
  usuarios: {
    total: number;
    confirmados: number;
    pendientes: number;
    activos: number;
    administradores: number;
    usuariosNormales: number;
  };
  actividad: {
    examenesRecientes: any[];
    centrosRecientes: any[];
    paginasRecientes: any[];
    newslettersRecientes: any[];
    usuariosRecientes: any[]; // ✅ Nueva actividad
  };
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Obtener estadísticas de exámenes
    const { data: examenes, error: examenesError } = await supabase
      .from('examenes')
      .select('id, titulo, publicado, created_at');

    if (examenesError) throw examenesError;

    // Obtener estadísticas de centros
    const { data: centros, error: centrosError } = await supabase
      .from('centros')
      .select(`
        id, nombre, publicado, created_at,
        estado:centros_estados(nombre)
      `);

    if (centrosError) throw centrosError;

    // Obtener estadísticas de estados
    const { data: estados, error: estadosError } = await supabase
      .from('centros_estados')
      .select('id, nombre, publicado, created_at');

    if (estadosError) throw estadosError;

    // Obtener estadísticas de páginas
    const { data: paginas, error: paginasError } = await supabase
      .from('paginas')
      .select('id, titulo, publicado, created_at');

    if (paginasError) throw paginasError;

    // Obtener estadísticas de sliders
    const { data: sliders, error: slidersError } = await supabase
      .from('sliders')
      .select('id, titulo, publicado, created_at');

    if (slidersError) throw slidersError;

    // Obtener estadísticas de newsletters
    const { data: newsletters, error: newslettersError } = await supabase
      .from('newsletters')
      .select('id, titulo, publicado, created_at, fecha_publicacion');

    if (newslettersError) throw newslettersError;

    // ✅ Obtener estadísticas de usuarios
    let usuariosStats = {
      total: 0,
      confirmados: 0,
      pendientes: 0,
      activos: 0,
      administradores: 0,
      usuariosNormales: 0
    };

    let usuariosRecientes: any[] = [];

    try {
      // Solo obtener estadísticas de usuarios si el usuario actual es admin
      const isAdmin = await usuarioService.checkCurrentUserAdminPermissions();
      if (isAdmin) {
        const statsUsuarios = await usuarioService.getStats();
        usuariosStats = {
          total: statsUsuarios.total,
          confirmados: statsUsuarios.confirmados,
          pendientes: statsUsuarios.pendientes,
          activos: statsUsuarios.activos,
          administradores: 0,
          usuariosNormales: 0
        };

        // Obtener usuarios recientes
        const usuarios = await usuarioService.getUsuarios();
        usuariosRecientes = usuarios
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map(user => ({
            id: user.id,
            email: user.email,
            nombre: usuarioService.getFullName(user),
            created_at: user.created_at,
            confirmado: !!user.email_confirmed_at
          }));
      }
    } catch (error) {
      console.warn('No se pudieron obtener estadísticas de usuarios:', error);
      // Continuar sin estadísticas de usuarios
    }

    // Obtener estadísticas adicionales de exámenes
    const { data: horarios, error: horariosError } = await supabase
      .from('examenes_horarios')
      .select('id_examen')
      .eq('publicado', true);

    const { data: faqs, error: faqsError } = await supabase
      .from('examenes_faq')
      .select('id_examen')
      .eq('publicado', true);

    const { data: muestras, error: muestrasError } = await supabase
      .from('examenes_muestras')
      .select('id_examen')
      .eq('publicado', true);

    if (horariosError || faqsError || muestrasError) {
      console.warn('Error al obtener estadísticas adicionales de exámenes');
    }

    // Procesar datos
    const examenesPublicados = examenes?.filter(e => e.publicado).length || 0;
    const examenesTotal = examenes?.length || 0;

    const centrosPublicados = centros?.filter(c => c.publicado).length || 0;
    const centrosTotal = centros?.length || 0;

    const estadosPublicados = estados?.filter(e => e.publicado).length || 0;
    const estadosTotal = estados?.length || 0;

    const paginasPublicadas = paginas?.filter(p => p.publicado).length || 0;
    const paginasTotal = paginas?.length || 0;

    const slidersPublicados = sliders?.filter(s => s.publicado).length || 0;
    const slidersTotal = sliders?.length || 0;

    const newslettersPublicados = newsletters?.filter(n => n.publicado).length || 0;
    const newslettersTotal = newsletters?.length || 0;

    // Newsletters recientes (últimos 6 meses)
    const seismesesAtras = new Date();
    seismesesAtras.setMonth(seismesesAtras.getMonth() - 6);
    const newslettersRecientes = newsletters?.filter(n => {
      const fecha = new Date(n.fecha_publicacion || n.created_at);
      return fecha >= seismesesAtras;
    }).length || 0;

    // Calcular centros por estado
    const centrosPorEstado = centros?.reduce((acc: any[], centro: any) => {
      const estadoNombre = centro.estado?.nombre || 'Sin estado';
      const existing = acc.find(item => item.estado === estadoNombre);
      if (existing) {
        existing.cantidad += 1;
      } else {
        acc.push({ estado: estadoNombre, cantidad: 1 });
      }
      return acc;
    }, []) || [];

    // Obtener IDs únicos de exámenes con contenido adicional
    const examenesConHorarios = new Set(horarios?.map(h => h.id_examen)).size;
    const examenesConFAQs = new Set(faqs?.map(f => f.id_examen)).size;
    const examenesConMuestras = new Set(muestras?.map(m => m.id_examen)).size;

    // Actividad reciente (últimos 5)
    const examenesRecientes = examenes
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5) || [];

    const centrosRecientes = centros
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5) || [];

    const paginasRecientes = paginas
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5) || [];

    const newslettersRecentesData = newsletters
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5) || [];

    return {
      examenes: {
        total: examenesTotal,
        publicados: examenesPublicados,
        borradores: examenesTotal - examenesPublicados,
        conHorarios: examenesConHorarios,
        conFAQs: examenesConFAQs,
        conMuestras: examenesConMuestras,
      },
      centros: {
        total: centrosTotal,
        publicados: centrosPublicados,
        borradores: centrosTotal - centrosPublicados,
        porEstado: centrosPorEstado.sort((a, b) => b.cantidad - a.cantidad),
      },
      estados: {
        total: estadosTotal,
        publicados: estadosPublicados,
        borradores: estadosTotal - estadosPublicados,
      },
      paginas: {
        total: paginasTotal,
        publicadas: paginasPublicadas,
        borradores: paginasTotal - paginasPublicadas,
      },
      sliders: {
        total: slidersTotal,
        publicados: slidersPublicados,
        borradores: slidersTotal - slidersPublicados,
      },
      newsletters: {
        total: newslettersTotal,
        publicados: newslettersPublicados,
        borradores: newslettersTotal - newslettersPublicados,
        recientes: newslettersRecientes,
      },
      // ✅ Estadísticas de usuarios
      usuarios: usuariosStats,
      actividad: {
        examenesRecientes,
        centrosRecientes,
        paginasRecientes,
        newslettersRecientes: newslettersRecentesData,
        usuariosRecientes, // ✅ Nueva actividad
      },
    };
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    throw error;
  }
};

export const getQuickActions = () => {
  return [
    {
      title: 'Nuevo Examen',
      description: 'Crear un nuevo examen',
      href: '/admin/examenes/nuevo',
      icon: 'BookOpen',
      color: 'blue',
    },
    {
      title: 'Nuevo Centro',
      description: 'Agregar centro de examen',
      href: '/admin/centros',
      icon: 'MapPin',
      color: 'green',
    },
    {
      title: 'Nueva Página',
      description: 'Crear página de contenido',
      href: '/admin/paginas/nueva',
      icon: 'FileText',
      color: 'purple',
    },
    {
      title: 'Nuevo Slider',
      description: 'Agregar slider al home',
      href: '/admin/sliders/nuevo',
      icon: 'Image',
      color: 'orange',
    },
    {
      title: 'Nuevo Newsletter',
      description: 'Subir newsletter PDF',
      href: '/admin/newsletters',
      icon: 'FileText',
      color: 'red',
    },
    // ✅ Nueva acción rápida
    {
      title: 'Nuevo Usuario',
      description: 'Crear cuenta de usuario',
      href: '/admin/usuarios/nuevo',
      icon: 'UserPlus',
      color: 'indigo',
    },
  ];
};