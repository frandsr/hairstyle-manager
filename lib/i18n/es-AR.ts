// Spanish (Argentina) UI translations
export const translations = {
  // Navigation
  nav: {
    inicio: 'Inicio',
    historial: 'Trabajos',
    clientas: 'Clientas',
    configuracion: 'Configuración',
  },

  // Auth
  auth: {
    signInWithGoogle: 'Iniciar sesión con Google',
    signOut: 'Cerrar sesión',
    welcome: 'Bienvenida a EstilistaPro',
  },

  // Dashboard
  dashboard: {
    week: 'Semana',
    shiftMorning: 'Turno Mañana',
    shiftAfternoon: 'Turno Tarde',
    revenue: 'Facturación Total',
    commission: 'Mi Comisión',
    tips: 'Propinas',
    totalEarnings: 'Total Ganancia',
    target: 'Objetivo',
    newJob: 'Nuevo Trabajo',
    bonusAlert: '¡Te faltan {amount} para el próximo bono!',
    targetReached: '¡Objetivo alcanzado!',
    currentStreak: 'Racha actual: {count} semanas',
  },

  // Jobs
  jobs: {
    title: 'Trabajos',
    newJob: 'Nuevo Trabajo',
    editJob: 'Editar Trabajo',
    deleteJob: 'Eliminar Trabajo',
    client: 'Clienta',
    amount: 'Monto',
    tip: 'Propina',
    date: 'Fecha',
    description: 'Descripción',
    photos: 'Fotos',
    rating: 'Calificación',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    confirmDelete: '¿Estás segura de eliminar este trabajo?',
    noJobs: 'No hay trabajos registrados',
    search: 'Buscar por clienta, descripción o etiqueta...',
  },

  // Clients
  clients: {
    title: 'Mis Clientas',
    newClient: 'Nueva Clienta',
    editClient: 'Editar Clienta',
    deleteClient: 'Eliminar Clienta',
    name: 'Nombre',
    phone: 'Teléfono',
    notes: 'Notas',
    lastVisit: 'Última visita',
    totalJobs: 'Total de trabajos',
    search: 'Buscar clienta...',
    noClients: 'No hay clientas registradas',
    confirmDelete: '¿Estás segura de eliminar esta clienta?',
  },

  // Settings
  settings: {
    title: 'Configuración',
    weeklyTarget: 'Objetivo Semanal',
    baseCommissionRate: 'Comisión Base',
    streakBonusRate: 'Bono por Racha',
    currentStreak: 'Racha Actual',
    fixedBonusTiers: 'Niveles de Bono Fijo',
    shiftPatternStart: 'Inicio de Patrón de Turnos',
    save: 'Guardar Cambios',
    saved: 'Configuración guardada exitosamente',
    bonusTierThreshold: 'Facturación mínima',
    bonusTierAmount: 'Bono',
    addTier: 'Agregar Nivel',
    removeTier: 'Eliminar Nivel',
  },

  // Common
  common: {
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    close: 'Cerrar',
    back: 'Volver',
    edit: 'Editar',
    delete: 'Eliminar',
    save: 'Guardar',
    cancel: 'Cancelar',
  },

  // Days of week
  days: {
    saturday: 'Sábado',
    sunday: 'Domingo',
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    sat: 'Sáb',
    sun: 'Dom',
    mon: 'Lun',
    tue: 'Mar',
    wed: 'Mié',
    thu: 'Jue',
    fri: 'Vie',
  },
} as const;
