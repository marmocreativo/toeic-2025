// Función para limpiar HTML y convertir a texto plano
export const cleanHtmlToText = (html: string): string => {
  if (!html) return '';
  
  // Crear un elemento temporal para usar la API del navegador
  const tempElement = document.createElement('div');
  tempElement.innerHTML = html;
  
  // Obtener texto plano
  let text = tempElement.textContent || tempElement.innerText || '';
  
  // Limpiar espacios extra y saltos de línea
  text = text
    .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
    .replace(/\n+/g, ' ') // Saltos de línea a espacios
    .trim();
  
  return text;
};

// Función para convertir HTML a texto preservando saltos de línea
export const cleanHtmlToTextWithBreaks = (html: string): string => {
  if (!html) return '';
  
  let text = html
    // Reemplazar <br> y <br/> por saltos de línea
    .replace(/<br\s*\/?>/gi, '\n')
    // Reemplazar </p> por saltos de línea dobles
    .replace(/<\/p>/gi, '\n\n')
    // Remover todas las demás etiquetas HTML
    .replace(/<[^>]*>/g, '')
    // Decodificar entidades HTML
    .replace(/&nbsp;/g, ' ')
    .replace(/&iacute;/g, 'í')
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú')
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Limpiar espacios extra
    .replace(/\s+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\n+/g, '\n')
    .trim();
  
  return text;
};

// Función más completa para decodificar entidades HTML
export const decodeHtmlEntities = (text: string): string => {
  if (!text) return '';
  
  const entityMap: { [key: string]: string } = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&aacute;': 'á',
    '&eacute;': 'é',
    '&iacute;': 'í',
    '&oacute;': 'ó',
    '&uacute;': 'ú',
    '&Aacute;': 'Á',
    '&Eacute;': 'É',
    '&Iacute;': 'Í',
    '&Oacute;': 'Ó',
    '&Uacute;': 'Ú',
    '&ntilde;': 'ñ',
    '&Ntilde;': 'Ñ',
    '&uuml;': 'ü',
    '&Uuml;': 'Ü',
    '&ccedil;': 'ç',
    '&Ccedil;': 'Ç'
  };
  
  let result = text;
  
  // Reemplazar entidades conocidas
  for (const [entity, char] of Object.entries(entityMap)) {
    result = result.replace(new RegExp(entity, 'g'), char);
  }
  
  // Reemplazar entidades numéricas &#xxx;
  result = result.replace(/&#(\d+);/g, (_match, num) => {
    return String.fromCharCode(parseInt(num, 10));

  });
  
  return result;
};