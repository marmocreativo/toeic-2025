// src/components/public/RegistroWizard.tsx
import { useState, useEffect, useCallback, type JSX } from "react";
import { debounce } from 'lodash';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
//import { Calendar, dateFns } from "@/components/ui/calendar";
import { X, CheckCircle, AlertCircle, Clock, AlertTriangle, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";

import { useLanguage } from "@/hooks/useLanguage";

import type { ExamenCompleto } from "@/types/examen";

type RegistroWizardProps = {
  onClose?: () => void;
  onFinish?: () => void;
  examen?: ExamenCompleto;
};

// Tipos para los datos del formulario
interface PersonalData {
  tipoDocumento: string;
  documento: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correo: string;
  telefono: string;
}

interface ExamData {
  empresaId: number;
  examenId: number;
  llave: string;
  contactoId: number;
}

interface Empresa {
  id: number;
  nombre: string;
  tipo_candidatos: "independientes" | "empresas" | "todos";
}

interface Examen {
  id: number;
  nombre: string;
  requiere_llave: boolean;
  tipo_candidatos: "independientes" | "empresas" | "todos";
}

interface Contacto {
  id: number;
  nombre: string;
  empresa_id: number;
}

interface FechaDisponible {
  id: string;
  title: string;
  start: string;
  end: string;
  status: "libre" | "espacios_disponibles" | "sin_espacio";
  backgroundColor: string;
}

interface ApiResponse<T> {
  status: string;
  message?: string;
  data?: T;
  exists?: boolean;
  matches?: MatchInfo[];
}

interface MatchInfo {
  id: number;
  campo: string;
  valor: string;
  message: string;
}

export default function RegistroWizard({ onClose, onFinish }: RegistroWizardProps) {
  const { language } = useLanguage();
  const [step, setStep] = useState(0); // 0..3
  const [alertType, setAlertType] = useState<'success' | 'warning' | 'error' | null>(null);
  const [camposObligatoriosValidos, setCamposObligatoriosValidos] = useState(false);
  
  // Estados del formulario
  const [personalData, setPersonalData] = useState<PersonalData>({
    tipoDocumento: "",
    documento: "",
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    correo: "",
    telefono: "",
  });
  
  const [examData, setExamData] = useState<ExamData>({
    empresaId: 0,
    examenId: 0,
    llave: "",
    contactoId: 0,
  });

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [paso2Valido, setPaso2Valido] = useState(false);
  
  // Estados de validación y mensajes
  const [_isPersonalDataValid, setIsPersonalDataValid] = useState(false);
  const [userExistsMessage, setUserExistsMessage] = useState("");
  const [userExists, setUserExists] = useState<boolean | null>(null);
  
  const [_isExamDataValid, setIsExamDataValid] = useState(false);
  
  // Estados para datos de APIs
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [fechasDisponibles, setFechasDisponibles] = useState<FechaDisponible[]>([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  
  // Estados de carga
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
const [currentDate, setCurrentDate] = useState<Date>(new Date());
const [showCalendar, setShowCalendar] = useState<boolean>(true);

  const texts = {
    es: {
      title: "Registro de examen",
      steps: ["Datos personales", "Selección de examen", "Fecha y hora", "Confirmación"],
      back: "Atrás",
      next: "Siguiente",
      finish: "Finalizar registro",
      close: "Cerrar",
      whatsappButton: "Registrar por WhatsApp",
      whatsappButtonDesc: "Enviar datos por WhatsApp para registro manual",
      
      // ... resto de textos existentes
      tipoDocumento: "Tipo de documento *",
      documento: "Número de documento *",
      nombre: "Nombre *",
      apellidoPaterno: "Apellido paterno *",
      apellidoMaterno: "Apellido materno",
      correo: "Correo electrónico *",
      telefono: "Teléfono *",
      userExists: "Hola, parece que ya te has registrado antes para realizar el examen. Por favor comunícate con nosotros para continuar con tu registro.",
      userNotExists: "Puedes continuar con tu registro",
      
      // Paso 2
      tipoRegistro: "¿Eres independiente o te envían de alguna empresa? *",
      examen: "Selecciona el examen *",
      llave: "Llave *",
      contacto: "¿Quién te ha enviado a registrarte?",
      
      // Paso 3
      selectDate: "Selecciona una fecha",
      selectTime: "Selecciona un horario",
      libre: "Libre",
      espaciosDisponibles: "Espacios disponibles",
      sinEspacio: "Sin espacio",
      
      // Paso 4
      confirmTitle: "Confirma tu registro",
      confirmDesc: "Revisa todos los datos antes de finalizar",
      
      // Validaciones
      requiredField: "Este campo es obligatorio",
      invalidEmail: "Correo electrónico inválido",
      invalidPhone: "Teléfono inválido",
    },
    en: {
      title: "Exam registration",
      steps: ["Personal data", "Exam selection", "Date and time", "Confirmation"],
      back: "Back",
      next: "Next",
      finish: "Finish registration",
      close: "Close",
      whatsappButton: "Register via WhatsApp",
      whatsappButtonDesc: "Send data via WhatsApp for manual registration",
      
      // ... resto de textos existentes
      tipoDocumento: "Document type *",
      documento: "Document number *",
      nombre: "First name *",
      apellidoPaterno: "Last name *",
      apellidoMaterno: "Middle name",
      correo: "Email *",
      telefono: "Phone *",
      userExists: "Hello, it seems you have already registered for the exam before. Please contact us to continue with your registration.",
      userNotExists: "You can continue with your registration",
      
      // Paso 2
      tipoRegistro: "Are you independent or sent by a company? *",
      examen: "Select exam *",
      llave: "Key *",
      contacto: "Who sent you to register?",
      
      // Paso 3
      selectDate: "Select a date",
      selectTime: "Select a time",
      libre: "Available",
      espaciosDisponibles: "Limited spaces",
      sinEspacio: "No space",
      
      // Paso 4
      confirmTitle: "Confirm your registration",
      confirmDesc: "Review all data before finishing",
      
      // Validaciones
      requiredField: "This field is required",
      invalidEmail: "Invalid email",
      invalidPhone: "Invalid phone",
    },
  };
  const t = texts[language];

  const totalSteps = 4;
  const percent = ((step + 1) / totalSteps) * 100;


  // Validación de datos del examen
  useEffect(() => {
    const selectedExam = examenes.find(e => e.id === examData.examenId);
    const needsKey = selectedExam?.requiere_llave;
    const hasRequiredKey = !needsKey || examData.llave;
    
    const isValid = examData.examenId > 0 && hasRequiredKey;
    setIsExamDataValid(!!isValid);
  }, [examData, examenes]);

  // Validar datos personales
  useEffect(() => {
  const camposCompletos = personalData.tipoDocumento && 
                         personalData.documento && 
                         personalData.nombre && 
                         personalData.apellidoPaterno && 
                         personalData.correo && 
                         personalData.telefono &&
                         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalData.correo) &&
                         /^\+?[\d\s-()]+$/.test(personalData.telefono);
  
  setCamposObligatoriosValidos(!!camposCompletos);

  const isValid = personalData.tipoDocumento && 
                   personalData.documento && 
                   personalData.nombre && 
                   personalData.apellidoPaterno && 
                   personalData.correo && 
                   personalData.telefono &&
                   /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalData.correo) &&
                   /^\+?[\d\s-()]+$/.test(personalData.telefono);
    
    setIsPersonalDataValid(!!isValid);
}, [personalData]);


// Valido el registro del usuario
const checkUserExists = async (documento: string, correo: string) => {
  setLoading(true);
  
  try {
    const response = await fetch('https://reviewquality.mx/api/existe_usuario', {
      method: 'POST',
      mode: 'cors',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        TipoDocumento: personalData.tipoDocumento,
        Documento: documento,
        Correo: correo
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ApiResponse<any> = await response.json();
    
    if (data.status === 'success') {
      setUserExists(data.exists || false);
      setAlertType(data.exists ? 'error' : 'success');
      
      if (data.exists) {
        setUserExistsMessage(t.userExists);
      } else {
        // Usuario no existe
        const message = data.message || t.userNotExists;
        setUserExistsMessage(message);
      }

    }
    if (data.status === 'warning') {
      setUserExists(true);
      setAlertType('warning');
      
      const message = data.message || 'Advertencia en la validación';
      setUserExistsMessage(message);
    }
    if (data.status === 'error') {
      console.error('Error from API:', data);
      setUserExists(null);
      setAlertType('error');
      setUserExistsMessage('Error al verificar usuario');
    }
  } catch (error) {
    console.error('Error checking user:', error);
    setUserExists(null);
    setUserExistsMessage('Error de conexión');
  } finally {
    setLoading(false);
  }
};

// versión debounced de checkUserExists
const debouncedCheckUserExists = useCallback(
  debounce((documento: string, correo: string) => {
    checkUserExists(documento, correo);
  }, 500),
  [personalData.tipoDocumento] // Agregar dependencias necesarias
);

useEffect(() => {
  return () => {
    debouncedCheckUserExists.cancel();
  };
}, [debouncedCheckUserExists]);

/** EMPRESAS Y EXÁMENES */
const loadEmpresas = async () => {
  try {
    const response = await fetch('https://reviewquality.mx/api/empresas', {
      method: 'GET',
      headers: { 
        'Accept': 'application/json'
      }
    });
    
    const data: ApiResponse<Empresa[]> = await response.json();
    
    // Verificar la estructura de la respuesta
    
    // Si la API devuelve un objeto con 'data' array
    const empresasList = data.data ? data.data : (data as unknown as Empresa[]);
    
    // Verificar que sea un array antes de mapear
    if (!Array.isArray(empresasList)) {
      console.error('API response is not an array:', empresasList);
      setEmpresas([{ id: 0, nombre: "Soy independiente", tipo_candidatos: "independientes" }]);
      return;
    }
    
    // Agregar la opción "Soy independiente" al inicio
    const empresasWithIndependent: Empresa[] = [
      { id: 0, nombre: "Soy independiente", tipo_candidatos: "independientes" },
      ...empresasList.map((empresa: any) => ({
        id: empresa.id,
        nombre: empresa.nombre,
        tipo_candidatos: "todos" as const
      }))
    ];
    
    setEmpresas(empresasWithIndependent);
  } catch (error) {
    console.error('Error loading empresas:', error);
    setEmpresas([
      { id: 0, nombre: "Soy independiente", tipo_candidatos: "independientes" }
    ]);
  }
};
//Effect para validar el paso 2
useEffect(() => {
  console.log('=== useEffect VALIDACION PASO 2 ===');
  console.log('examData:', examData);
  
  const empresaSeleccionada = examData.empresaId > 0 || examData.empresaId === 0; // Permitir 0 para "Soy independiente"
  const examenSeleccionado = examData.examenId > 0;
  
  console.log('Validaciones paso 2:', {
    empresaSeleccionada,
    empresaId: examData.empresaId,
    examenSeleccionado,
    examenId: examData.examenId
  });
  
  // Validar llave si es requerida
  const selectedExam = examenes.find(e => e.id === examData.examenId);
  const requiereLlave = selectedExam?.requiere_llave;
  const tieneLlaveRequerida = !requiereLlave || (requiereLlave && examData.llave.trim() !== '');
  
  console.log('Validación llave:', {
    selectedExam: selectedExam?.nombre,
    requiereLlave,
    llave: examData.llave,
    tieneLlaveRequerida
  });
  
  const esValido = empresaSeleccionada && examenSeleccionado && tieneLlaveRequerida;
  
  console.log('RESULTADO PASO 2 VÁLIDO:', esValido);
  setPaso2Valido(esValido);
}, [examData, examenes]);

// Effect específico para cargar exámenes cuando cambia la empresa
useEffect(() => {
  console.log('=== useEffect CARGA EXAMENES ===');
  console.log('empresaId cambió a:', examData.empresaId);
  
  // Solo cargar si hay una empresa válida seleccionada
  if (examData.empresaId >= 0) { // Incluye 0 para "Soy independiente"
    console.log('Disparando loadExamenes con empresaId:', examData.empresaId);
    loadExamenes(examData.empresaId);
    loadContactos(examData.empresaId);
  } else {
    console.log('No se carga exámenes - empresaId no válido');
    setExamenes([]);
    setContactos([]);
  }
}, [examData.empresaId]);

const loadExamenes = async (empresaId: number) => {
  console.log('=== EJECUTANDO loadExamenes ===');
  console.log('empresaId recibido:', empresaId);
  
  try {
    const tipoCandidato = empresaId === 0 ? "independientes" : "empresas";
    console.log('tipoCandidato determinado:', tipoCandidato);
    
    const url = `https://reviewquality.mx/api/examenes?tipo_candidato=${tipoCandidato}`;
    console.log('URL a consultar:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json'
      }
    });
    
    console.log('Response status loadExamenes:', response.status);
    
    const data: ApiResponse<Examen[]> = await response.json();
    console.log('Data recibida loadExamenes:', data);
    
    const examenesList = data.data ? data.data : (data as unknown as any[]);
    
    if (!Array.isArray(examenesList)) {
      console.error('API response is not an array:', examenesList);
      setExamenes([]);
      return;
    }
    
    const examenesFormatted: Examen[] = examenesList.map((examen: any) => ({
      id: Number(examen.id),
      nombre: String(examen.nombre),
      requiere_llave: examen.requiere_llave === "si",
      tipo_candidatos: tipoCandidato as "independientes" | "empresas" | "todos"
    }));
    
    console.log('Exámenes formateados:', examenesFormatted);
    setExamenes(examenesFormatted);
  } catch (error) {
    console.error('Error loading examenes:', error);
    setExamenes([]);
  }
};

const loadContactos = async (empresaId: number) => {
  if (empresaId === 0) {
    setContactos([{ id: 0, nombre: "Nadie", empresa_id: 0 }]);
    return;
  }
  
  try {
    const response = await fetch(`https://reviewquality.mx/api/contactos?id_empresa=${empresaId}`, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json'
      }
    });
    
    const data: ApiResponse<any[]> = await response.json();
    
    const contactosList = data.data ? data.data : (data as unknown as any[]);
    
    if (!Array.isArray(contactosList)) {
      console.error('API response is not an array:', contactosList);
      setContactos([{ id: 0, nombre: "Nadie", empresa_id: empresaId }]);
      return;
    }
    
    const contactosFormatted: Contacto[] = [
      { id: 0, nombre: "Nadie", empresa_id: empresaId },
      ...contactosList.map((contacto: any) => ({
        id: Number(contacto.id),
        nombre: `${contacto.nombre} ${contacto.apellidoPat} ${contacto.apellidoMat || ''}`.trim(),
        empresa_id: empresaId
      }))
    ];
    
    setContactos(contactosFormatted);
  } catch (error) {
    console.error('Error loading contactos:', error);
    setContactos([{ id: 0, nombre: "Nadie", empresa_id: empresaId }]);
  }
};
  const loadFechasDisponibles = async () => {
    // Solo cargar fechas si ya se seleccionó un examen
    if (examData.examenId === 0) {
      setFechasDisponibles([]);
      return;
    }
    
    try {
      const response = await fetch(`https://reviewquality.mx/api/fechas_disponibles?id_examen=${examData.examenId}`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        // Función para mapear title a status
        const getStatusFromTitle = (title: string) => {
          switch (title.toLowerCase()) {
            case 'libre':
              return 'libre';
            case 'vacantes':
              return 'espacios_disponibles';
            case 'lleno':
              return 'sin_espacio';
            default:
              return 'libre'; // Por defecto
          }
        };

        // Mapear la respuesta de la API al formato interno
        const fechasFormatted: FechaDisponible[] = data.data.map((fecha: any, index: number) => ({
          id: `${fecha.fecha}-${fecha.hora}-${index}`,
          title: fecha.title,
          start: fecha.start,
          end: fecha.end,
          status: getStatusFromTitle(fecha.title),
          backgroundColor: fecha.color
        }));
        
        setFechasDisponibles(fechasFormatted);
      } else {
        console.error('Error from API:', data);
        setFechasDisponibles([]);
      }
    } catch (error) {
      console.error('Error loading fechas disponibles:', error);
      setFechasDisponibles([]);
    }
  };

   const generateWhatsAppMessage = (): string => {
    const empresaNombre = empresas.find(e => e.id === examData.empresaId)?.nombre || '';
    const examenNombre = examenes.find(e => e.id === examData.examenId)?.nombre || '';
    const contactoNombre = contactos.find(c => c.id === examData.contactoId)?.nombre || '';
    const fechaFormateada = selectedDate ? new Date(selectedDate).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '';

    const mensaje = language === 'es' ? 
      `🎯 SOLICITUD DE REGISTRO EXAMEN TOEIC

📋 DATOS PERSONALES:
• Tipo de documento: ${personalData.tipoDocumento.toUpperCase()}
• Número: ${personalData.documento}
• Nombre completo: ${personalData.nombre} ${personalData.apellidoPaterno} ${personalData.apellidoMaterno}
• Correo electrónico: ${personalData.correo}
• Teléfono: ${personalData.telefono}

🏢 DATOS DEL EXAMEN:
• Tipo de registro: ${empresaNombre}
• Examen: ${examenNombre}${examData.llave ? `\n• Llave: ${examData.llave}` : ''}
• Contacto: ${contactoNombre}

📅 FECHA Y HORA SOLICITADA:
• Fecha: ${fechaFormateada}
• Hora: ${selectedTime}

Por favor, confirmen la disponibilidad y procedan con mi registro. ¡Gracias!` :
      `🎯 TOEIC EXAM REGISTRATION REQUEST

📋 PERSONAL DATA:
• Document type: ${personalData.tipoDocumento.toUpperCase()}
• Number: ${personalData.documento}
• Full name: ${personalData.nombre} ${personalData.apellidoPaterno} ${personalData.apellidoMaterno}
• Email: ${personalData.correo}
• Phone: ${personalData.telefono}

🏢 EXAM DATA:
• Registration type: ${empresaNombre}
• Exam: ${examenNombre}${examData.llave ? `\n• Key: ${examData.llave}` : ''}
• Contact: ${contactoNombre}

📅 REQUESTED DATE AND TIME:
• Date: ${fechaFormateada}
• Time: ${selectedTime}

Please confirm availability and proceed with my registration. Thank you!`;

    return mensaje;
  };

  // Función para manejar el registro por WhatsApp
  const handleWhatsAppRegistration = (): void => {
    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/525581008950?text=${encodedMessage}`;
    
    // Abrir WhatsApp en nueva ventana
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    
    // Opcional: cerrar el modal después de un breve delay
    setTimeout(() => {
      onFinish?.();
    }, 1000);
  };

 const submitRegistration = async () => {
  setSubmitting(true);
  
  try {
    console.log('=== ENVIANDO REGISTRO ===');
    
    // Preparar datos para envío
    const empresaSeleccionada = empresas.find(e => e.id === examData.empresaId);
    const examenSeleccionado = examenes.find(e => e.id === examData.examenId);
    const contactoSeleccionado = contactos.find(c => c.id === examData.contactoId);
    
    //log para eliminar error typescript
    console.log(empresaSeleccionada);
    console.log(contactoSeleccionado);
    
    // Formatear fecha para el backend (YYYY-MM-DD)
    const fechaFormateada = selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : '';
    
    const datosEnvio = {
      // Datos personales
      TipoDocumento: personalData.tipoDocumento,
      Documento: personalData.documento,
      Nombre: personalData.nombre,
      ApellidoPat: personalData.apellidoPaterno,
      ApellidoMat: personalData.apellidoMaterno || '',
      Correo: personalData.correo,
      Telefono: personalData.telefono,
      
      // Datos del examen
      EmpresaId: examData.empresaId,
      ExamenId: examData.examenId,
      ExamenNombre: examenSeleccionado?.nombre || '',
      ContactoId: examData.contactoId,
      TipoCandidato: examData.empresaId === 0 ? 'independiente' : 'empresa',
      
      // Fecha y hora
      Fecha: fechaFormateada,
      Hora: selectedTime,
      
      // Datos adicionales
      Sede: 'Sede Principal', // Puedes hacer esto configurable
      Llave: examData.llave || ''
    };
    
    console.log('Datos a enviar:', datosEnvio);
    
    const response = await fetch('https://reviewquality.mx/api/agendar', {
      method: 'POST',
      mode: 'cors',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(datosEnvio)
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Response data:', result);
    
    if (result.status === 'success') {
      // Éxito
      setAlertType('success');
      setUserExistsMessage(result.message || '¡Registro exitoso! Te hemos enviado un correo de confirmación.');
      
      // Esperar un poco para mostrar el mensaje y luego cerrar
      setTimeout(() => {
        onFinish?.();
      }, 2000);
      
    } else if (result.status === 'error') {
      // Error del servidor
      setAlertType('error');
      setUserExistsMessage(result.message || 'Error al procesar el registro. Por favor intenta nuevamente.');
      
    } else {
      // Estado desconocido
      setAlertType('warning');
      setUserExistsMessage('Respuesta inesperada del servidor. Por favor verifica tu registro.');
    }
    
  } catch (error) {
    console.error('Error submitting registration:', error);
    setAlertType('error');
    setUserExistsMessage('Error de conexión. Por favor verifica tu internet e intenta nuevamente.');
  } finally {
    setSubmitting(false);
  }
};



  // Cargar datos iniciales
  useEffect(() => {
    loadEmpresas();
  }, []);

  // Cargar exámenes cuando cambia la empresa
  useEffect(() => {
    if (examData.empresaId >= 0) {
      loadExamenes(examData.empresaId);
      loadContactos(examData.empresaId);
    }
  }, [examData.empresaId, empresas]);

  // Cargar fechas cuando se selecciona un examen
  useEffect(() => {
    if (examData.examenId > 0) {
      loadFechasDisponibles();
    }
  }, [examData.examenId]);

// Verificar usuario cuando se completan los campos requeridos para la validación
useEffect(() => {
  
  // Validar si el correo es válido cuando está presente
  const isValidEmail = personalData.correo && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalData.correo);
  
  // Condición 1: TipoDocumento + Documento (ambos presentes)
  const hasCompleteDocument = personalData.tipoDocumento && personalData.documento;
  
  // Condición 2: Solo Correo válido (sin documento ni tipo)
  const hasValidEmailOnly = isValidEmail && !personalData.tipoDocumento && !personalData.documento;
  
  // Solo ejecutar si se cumple alguna condición válida
  if (hasCompleteDocument || hasValidEmailOnly) {
    
    // Determinar qué parámetros enviar
    const documentoParam = hasCompleteDocument ? personalData.documento : '';
    const correoParam = isValidEmail ? personalData.correo : '';
    
    debouncedCheckUserExists(documentoParam, correoParam);
  } else {
    setUserExists(null);
    setUserExistsMessage("");
  }
}, [personalData.tipoDocumento, personalData.documento, personalData.correo]);

  const canGoNext = () => {
  switch (step) {
    case 0: 
      return camposObligatoriosValidos && (userExists === false || userExists === null);
    case 1: 
      console.log('Evaluando canGoNext paso 2 - paso2Valido:', paso2Valido);
      return paso2Valido;
    case 2: 
      return selectedDate && selectedTime;
    case 3: 
      return true;
    default: 
      return false;
  }
};

  const goNext = () => {
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    } else {
      submitRegistration();
    }
  };

  const goBack = () => setStep(s => Math.max(0, s - 1));

  const renderStep = () => {
    switch (step) {
      case 0:
        const getFieldError = (fieldName: string) => {
          if (!camposObligatoriosValidos) {
            switch (fieldName) {
              case 'tipoDocumento':
                return !personalData.tipoDocumento ? 'Campo obligatorio' : null;
              case 'documento':
                return !personalData.documento ? 'Campo obligatorio' : null;
              case 'nombre':
                return !personalData.nombre ? 'Campo obligatorio' : null;
              case 'apellidoPaterno':
                return !personalData.apellidoPaterno ? 'Campo obligatorio' : null;
              case 'correo':
                if (!personalData.correo) return 'Campo obligatorio';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalData.correo)) return 'Correo inválido';
                return null;
              case 'telefono':
                if (!personalData.telefono) return 'Campo obligatorio';
                if (!/^\+?[\d\s-()]+$/.test(personalData.telefono)) return 'Teléfono inválido';
                return null;
              default:
                return null;
            }
          }
          return null;
        };

        return (
          <div className="space-y-6">
            {/* Primera fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipoDocumento">{t.tipoDocumento}</Label>
                <Select value={personalData.tipoDocumento} onValueChange={(value) => 
                  setPersonalData(prev => ({ ...prev, tipoDocumento: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ife">INE / IFE</SelectItem>
                    <SelectItem value="pasaporte">PASAPORTE</SelectItem>
                    <SelectItem value="cedula">CEDULA</SelectItem>
                    <SelectItem value="cartilla">CARTILLA</SelectItem>
                    <SelectItem value="other">FM2/FM3</SelectItem>
                  </SelectContent>
                </Select>
                  {getFieldError('tipoDocumento') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('tipoDocumento')}</p>
                  )}
              </div>
              <div>
                <Label htmlFor="documento">{t.documento}</Label>
                <Input
                  id="documento"
                  value={personalData.documento}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, documento: e.target.value }))}
                  placeholder="Ingresa el número de documento"
                />
                {getFieldError('documento') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('documento')}</p>
                  )}
              </div>
            </div>

            {/* Segunda fila */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nombre">{t.nombre}</Label>
                <Input
                  id="nombre"
                  value={personalData.nombre}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Nombre"
                />
                {getFieldError('nombre') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('nombre')}</p>
                  )}
              </div>
              <div>
                <Label htmlFor="apellidoPaterno">{t.apellidoPaterno}</Label>
                <Input
                  id="apellidoPaterno"
                  value={personalData.apellidoPaterno}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, apellidoPaterno: e.target.value }))}
                  placeholder="Apellido paterno"
                />
                {getFieldError('apellidoPaterno') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('apellidoPaterno')}</p>
                  )}
              </div>
              <div>
                <Label htmlFor="apellidoMaterno">{t.apellidoMaterno}</Label>
                <Input
                  id="apellidoMaterno"
                  value={personalData.apellidoMaterno}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, apellidoMaterno: e.target.value }))}
                  placeholder="Apellido materno"
                />
              </div>
            </div>

            {/* Tercera fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="correo">{t.correo}</Label>
                <Input
                  id="correo"
                  type="email"
                  value={personalData.correo}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, correo: e.target.value }))}
                  placeholder="correo@ejemplo.com"
                />
                {getFieldError('correo') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('correo')}</p>
                  )}
              </div>
              <div>
                <Label htmlFor="telefono">{t.telefono}</Label>
                <Input
                  id="telefono"
                  value={personalData.telefono}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, telefono: e.target.value }))}
                  placeholder="555 123 4567"
                />
                {getFieldError('telefono') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('telefono')}</p>
                  )}
              </div>
            </div>

            {/* Mensaje de validación de usuario */}
            {loading && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Verificando datos...</AlertDescription>
              </Alert>
            )}

            {userExistsMessage && (
              <Alert 
                variant={alertType === 'error' ? "destructive" : "default"}
                className={
                  alertType === 'warning' 
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-800 dark:border-yellow-400 dark:bg-yellow-900/20 dark:text-yellow-400' 
                    : ''
                }
              >
                {alertType === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                ) : alertType === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{userExistsMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            {/* Primera fila */}
            <div>
              <Label htmlFor="empresa">{t.tipoRegistro}</Label>
              <Select value={examData.empresaId.toString()}
                onValueChange={(value) => {
                const nuevaEmpresaId = parseInt(value);
                console.log('=== CAMBIO DE EMPRESA ===');
                console.log('Valor anterior:', examData.empresaId);
                console.log('Valor nuevo:', nuevaEmpresaId);
                
                setExamData(prev => {
                  const nuevoState = { 
                    ...prev, 
                    empresaId: nuevaEmpresaId, 
                    examenId: 0, 
                    contactoId: 0,
                    llave: "" // Reset llave también
                  };
                  console.log('Nuevo examData state:', nuevoState);
                  return nuevoState;
                });
              }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map(empresa => (
                    <SelectItem key={empresa.id} value={empresa.id.toString()}>
                      {empresa.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Segunda fila */}
            {examData.empresaId >= 0 && (
              <div>
                <Label htmlFor="examen">{t.examen}</Label>
                <Select value={examData.examenId.toString()}
                  onValueChange={(value) => {
                  const nuevoExamenId = parseInt(value);
                  console.log('=== CAMBIO DE EXAMEN ===');
                  console.log('Valor anterior:', examData.examenId);
                  console.log('Valor nuevo:', nuevoExamenId);
                  
                  setExamData(prev => {
                    const nuevoState = { ...prev, examenId: nuevoExamenId, llave: "" };
                    console.log('Nuevo examData state:', nuevoState);
                    return nuevoState;
                  });
                }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar examen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {examenes.map(examen => (
                      <SelectItem key={examen.id} value={examen.id.toString()}>
                        {examen.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Tercera fila - Llave si es requerida */}
            {examData.examenId > 0 && examenes.find(e => e.id === examData.examenId)?.requiere_llave && (
              <div>
                <Label htmlFor="llave">{t.llave}</Label>
                <Input
                  id="llave"
                  value={examData.llave}
                  onChange={(e) => setExamData(prev => ({ ...prev, llave: e.target.value }))}
                  placeholder="Ingresa la llave del examen"
                />
              </div>
            )}

            {/* Cuarta fila - Contacto */}
            {examData.empresaId >= 0 && (
              <div>
                <Label htmlFor="contacto">{t.contacto}</Label>
                <Select value={examData.contactoId.toString()} onValueChange={(value) => 
                  setExamData(prev => ({ ...prev, contactoId: parseInt(value) }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar contacto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contactos.map(contacto => (
                      <SelectItem key={contacto.id} value={contacto.id.toString()}>
                        {contacto.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );

      case 2:
  // Obtener fechas disponibles para una fecha específica
  const getFechasParaDia = (dia: number, mes: number, año: number): FechaDisponible[] => {
    const fecha = new Date(año, mes, dia);
    const fechaString = fecha.toISOString().split('T')[0];
    
    return fechasDisponibles.filter(f => {
      const fechaDisponible = new Date(f.start).toISOString().split('T')[0];
      return fechaDisponible === fechaString && f.status !== "sin_espacio";
    });
  };

  // Obtener el estado del día
  const getEstadoDia = (dia: number, mes: number, año: number): string => {
    const fechas = getFechasParaDia(dia, mes, año);
    if (fechas.length === 0) return 'no_disponible';
    
    const tieneLibre = fechas.some(f => f.status === 'libre');
    const tieneEspacios = fechas.some(f => f.status === 'espacios_disponibles');
    
    if (tieneLibre) return 'libre';
    if (tieneEspacios) return 'espacios_disponibles';
    return 'no_disponible';
  };

  // Manejar selección de día
  const handleDayClick = (dia: number, mes: number, año: number): void => {
    const fechas = getFechasParaDia(dia, mes, año);
    if (fechas.length === 0) return;

    const fecha = new Date(año, mes, dia);
    const fechaISOString = fecha.toISOString();
    
    setSelectedDate(fechaISOString);
    
    // Extraer horarios disponibles
    const horarios = fechas.map(f => {
      const date = new Date(f.start);
      return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
    });
    
    setHorariosDisponibles(horarios);
    setSelectedTime(""); // Reset time selection
    
    // NUEVO: Ocultar el calendario cuando se selecciona un día
    setShowCalendar(false);
  };

  //Función para volver a mostrar el calendario
  const showCalendarAgain = (): void => {
    setShowCalendar(true);
    setSelectedDate("");
    setSelectedTime("");
    setHorariosDisponibles([]);
  };

  // Generar calendario
  const generateCalendar = (): JSX.Element => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const meses: string[] = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const diasSemana: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    // Función para obtener clases CSS del día
    const getClasesDia = (dia: number): string => {
      const estado = getEstadoDia(dia, currentDate.getMonth(), currentDate.getFullYear());
      const fecha = new Date(currentDate.getFullYear(), currentDate.getMonth(), dia);
      const isSelected = selectedDate && new Date(selectedDate).toDateString() === fecha.toDateString();
      
      let clases = "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors cursor-pointer ";
      
      if (isSelected) {
        clases += "ring-2 ring-primary bg-primary text-primary-foreground ";
      } else {
        switch (estado) {
          case 'libre':
            clases += "bg-green-100 text-green-800 hover:bg-green-200 ";
            break;
          case 'espacios_disponibles':
            clases += "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 ";
            break;
          case 'no_disponible':
            clases += "bg-gray-100 text-gray-400 cursor-not-allowed ";
            break;
          default:
            clases += "hover:bg-gray-100 ";
        }
      }
      
      return clases;
    };

    const goToPreviousMonth = (): void => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = (): void => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return (
      <Card>
        <CardContent className="p-4">
          {/* Header del calendario */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h3 className="text-lg font-semibold">
              {meses[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {diasSemana.map((dia: string) => (
              <div key={dia} className="p-2 text-center text-sm font-medium text-gray-600">
                {dia}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {/* Espacios vacíos para días de la semana anterior */}
            {Array.from({ length: firstDayWeekday }, (_, i) => (
              <div key={`empty-${i}`} className="w-10 h-10"></div>
            ))}
            
            {/* Días del mes */}
            {days.map((dia: number) => (
              <div
                key={dia}
                className={getClasesDia(dia)}
                onClick={() => handleDayClick(dia, currentDate.getMonth(), currentDate.getFullYear())}
              >
                {dia}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
  <div className="space-y-6">
    <div>
      <h4 className="text-lg font-medium mb-4">{t.selectDate}</h4>
      
      {/* Mostrar fecha seleccionada si hay una */}
      {selectedDate && !showCalendar && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-800 font-medium">
                Fecha seleccionada: {new Date(selectedDate).toLocaleDateString('es-MX', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-blue-600 text-sm">
                Ahora selecciona un horario disponible
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={showCalendarAgain}
            >
              Cambiar fecha
            </Button>
          </div>
        </div>
      )}

      {/* Mostrar calendario solo si showCalendar es true */}
      {showCalendar && (
        <>
          {/* Leyenda de colores */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>{t.libre}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>{t.espaciosDisponibles}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
              <span>No disponible</span>
            </div>
          </div>

          {/* Calendario generado */}
          {generateCalendar()}
        </>
      )}

      {/* Selección de horario - Solo mostrar si hay fecha seleccionada */}
      {selectedDate && horariosDisponibles.length > 0 && (
        <div className="mt-6">
          <h5 className="text-md font-medium mb-3">{t.selectTime}</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {horariosDisponibles.map((hora: string) => (
              <Button
                key={hora}
                variant={selectedTime === hora ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTime(hora)}
              >
                <Clock className="w-4 h-4 mr-2" />
                {hora}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Confirmación final - Solo mostrar cuando se haya seleccionado fecha Y hora */}
      {selectedDate && selectedTime && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-green-800 font-medium">
              ✅ {new Date(selectedDate).toLocaleDateString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} a las {selectedTime}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={showCalendarAgain}
              className="text-green-700 hover:text-green-800"
            >
              Cambiar
            </Button>
          </div>
        </div>
      )}
    </div>
  </div>
);


case 3:
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.confirmTitle}</CardTitle>
          <CardDescription>{t.confirmDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Datos personales */}
          <div>
            <h4 className="font-semibold mb-2">Datos personales</h4>
            <div className="text-sm space-y-1">
              <p><strong>Documento:</strong> {personalData.tipoDocumento.toUpperCase()} - {personalData.documento}</p>
              <p><strong>Nombre:</strong> {personalData.nombre} {personalData.apellidoPaterno} {personalData.apellidoMaterno}</p>
              <p><strong>Correo:</strong> {personalData.correo}</p>
              <p><strong>Teléfono:</strong> {personalData.telefono}</p>
            </div>
          </div>

          <Separator />

          {/* Datos del examen */}
          <div>
            <h4 className="font-semibold mb-2">Examen seleccionado</h4>
            <div className="text-sm space-y-1">
              <p><strong>Empresa:</strong> {empresas.find(e => e.id === examData.empresaId)?.nombre}</p>
              <p><strong>Examen:</strong> {examenes.find(e => e.id === examData.examenId)?.nombre}</p>
              {examData.llave && <p><strong>Llave:</strong> {examData.llave}</p>}
              <p><strong>Contacto:</strong> {contactos.find(c => c.id === examData.contactoId)?.nombre}</p>
            </div>
          </div>

          <Separator />

          {/* Fecha y hora */}
          <div>
            <h4 className="font-semibold mb-2">Fecha y hora</h4>
            <div className="text-sm space-y-1">
              <p><strong>Fecha:</strong> {selectedDate && new Date(selectedDate).toLocaleDateString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
              <p><strong>Hora:</strong> {selectedTime}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mensaje de envío */}
      {submitting && (
        <Alert>
          <AlertCircle className="h-4 w-4 animate-spin" />
          <AlertDescription>Enviando registro...</AlertDescription>
        </Alert>
      )}

      {/* Retroalimentación del resultado */}
      {!submitting && userExistsMessage && (alertType === 'success' || alertType === 'error' || alertType === 'warning') && (
        <Alert 
          variant={alertType === 'error' ? "destructive" : "default"}
          className={
            alertType === 'warning' 
              ? 'border-yellow-500 bg-yellow-50 text-yellow-800 dark:border-yellow-400 dark:bg-yellow-900/20 dark:text-yellow-400'
              : alertType === 'success'
              ? 'border-green-500 bg-green-50 text-green-800 dark:border-green-400 dark:bg-green-900/20 dark:text-green-400'
              : ''
          }
        >
          {alertType === 'warning' ? (
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          ) : alertType === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{userExistsMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );      

      default:
        return <div>Paso no encontrado</div>;
    }
  };

  return (
    <div className="w-full">
      {/* Header inline para el wizard */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold">{t.title}</h3>
          <p className="text-sm text-muted-foreground">
            {t.steps[step]} ({step + 1} / {totalSteps})
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label={t.close}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Separator className="my-4" />

      {/* Progreso */}
      <div className="mb-4">
        <Progress value={percent} />
      </div>

      {/* Indicador de pasos */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6 overflow-x-auto">
        {t.steps.map((label, i) => (
          <div key={i} className="flex items-center flex-shrink-0">
            <div
              className={`h-6 px-2 rounded-full border whitespace-nowrap ${
                i === step
                  ? "bg-primary text-white border-primary"
                  : i < step
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {label}
            </div>
            {i < t.steps.length - 1 && <div className="w-4 h-px bg-border mx-2" />}
          </div>
        ))}
      </div>

      {/* Contenido del paso */}
      <div className="min-h-[400px] rounded-lg border border-border p-6 bg-background">
        {renderStep()}
      </div>

      {/* Controles */}
      <div className="mt-6 flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={step === 0 ? onClose : goBack}
          disabled={submitting}
        >
          {step === 0 ? t.close : t.back}
        </Button>

        <div className="flex items-center gap-3">
          {/* Botón de WhatsApp - solo mostrar en el paso de confirmación */}
          {step === totalSteps - 1 && (
            <Button 
              variant="outline"
              onClick={handleWhatsAppRegistration}
              disabled={!canGoNext() || submitting}
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t.whatsappButton}
            </Button>
          )}

          {/* Botón principal */}
          <Button 
            onClick={goNext} 
            disabled={!canGoNext() || submitting}
          >
            {step === totalSteps - 1 ? t.finish : t.next}
          </Button>
        </div>
      </div>
    </div>
  );
}