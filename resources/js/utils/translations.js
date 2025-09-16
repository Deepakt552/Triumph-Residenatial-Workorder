// Translations for the maintenance request form
export const translations = {
  en: {
    // Form title and instructions
    formTitle: "Maintenance Request Form",
    formInstructions: "Please complete all fields to submit your maintenance request",
    
    // Property Information
    propertyInfo: "Property Information",
    building: "Building",
    buildingPlaceholder: "Enter building name",
    unit: "Unit",
    unitPlaceholder: "Enter unit number",
    
    // Tenant Information
    tenantInfo: "Tenant Information",
    name: "Name",
    phone: "Phone",
    email: "Email",
    
    // Scheduling & Access
    schedulingAccess: "Scheduling & Access",
    preferredDate: "Preferred Date",
    preferredTime: "Preferred Time",
    permissionToEnter: "Permission to enter unit without tenant present",
    scheduleRestriction: "Maintenance is available Monday to Friday, 9AM to 5PM only",
    weekdaysOnly: "Only weekdays (Monday-Friday) are available",
    businessHours: "Business hours only (9AM-5PM)",
    timeNotAllowed: "Only times between 9AM and 5PM are allowed",
    yes: "Yes",
    no: "No",
    
    // Work Request
    workRequest: "Work Request",
    workRequested: "Work Requested",
    isEmergency: "Is this an emergency?",
    emergencyAlert: "IMPORTANT: This form is for maintenance requests only. For true emergencies, please call 213-531-9789 immediately. Do you still want to proceed with this request?",
    
    // Permission Modal
    reasonForNoPermission: "Reason for No Permission",
    reasonForNoPermissionExplanation: "Please provide a reason why you cannot give permission for maintenance to enter without you present.",
    reason: "Reason",
    reasonRequired: "Please provide a reason for not giving permission to enter",
    submit: "Submit",
    cancel: "Cancel",
    
    // Special Instructions
    specialInstructions: "Special Instructions",
    
    // Property Images
    propertyImages: "Property Images",
    uploadImages: "Upload Images",
    addMoreImages: "Add More Images",
    
    // Signature
    signature: "Signature",
    drawSignature: "Draw Signature",
    uploadSignature: "Upload Signature",
    signBelow: "Sign below to confirm your request. Use your finger on mobile or mouse on desktop.",
    signatureWillBeSaved: "Your signature will be saved and attached to the PDF.",
    uploadSignatureInstructions: "Upload an image of your signature. The file will be saved and attached to the PDF.",
    clear: "Clear",
    
    // Submission
    important: "Important:",
    submissionNotice: "By submitting, you confirm this is an official maintenance request. A work order will be emailed to you.",
    noCashPayments: "NO CASH PAYMENTS. Contact 213-531-9789 if any employee requests cash.",
    submitRequest: "Submit Request",
    submitting: "Submitting...",
    
    // Date display
    date: "Date",
    
    // Validation messages
    buildingRequired: "Building name is required",
    unitRequired: "Unit number is required",
    nameRequired: "Tenant name is required",
    emailRequired: "Email address is required",
    emailInvalid: "Please enter a valid email address",
    phoneRequired: "Phone number is required",
    phoneInvalid: "Please enter a valid phone number",
    workRequestRequired: "Work description is required",
    workRequestTooLong: "Work description cannot exceed 300 characters (about 3-4 lines)",
    dateRequired: "Date is required",
    timeRequired: "Time is required",
    schedulingInvalid: "Maintenance is only available Monday to Friday, 9AM to 5PM",
    specialInstructionsRequired: "Special instructions are required",
    signatureRequired: "Please provide a signature",
    signatureUploadRequired: "Please upload a signature image",
    fixFormErrors: "Please fix the form errors before submitting.",
    propertyImagesRequired: "Please upload at least one image of the issue",

    // Form submission messages
    requestSubmitted: "Request submitted successfully!",
    redirecting: "Redirecting...",
    submissionFailed: "Submission failed. Please try again.",
    signatureError: "Signature error",
    imageUploadError: "Image upload error",
    invalidSignatureData: "Invalid signature data generated. Please try again.",
    uploadPhotos: "Upload Photos of Issue (Required)",
    uploadPhotosInstructions: "You must upload photos showing the maintenance issue. Automatic compression: 2-5MB (50%), 5-8MB (60%), 8MB+ (70% max).",
    uploadedImages: "Uploaded Images",
    propertyImage: "Property image",
    removeImage: "Remove image",
    selected: "Selected",
    submissionConfirmation: "By submitting, you confirm this is an official maintenance request. A work order will be emailed to you.",

    // Thank you page translations
    thankYou: "Thank You!",
    requestSubmittedSuccess: "Your maintenance request has been submitted successfully.",
    confirmationEmailSent: "A confirmation email with the details of your request has been sent to your email address.",
    maintenanceTeamReview: "Our maintenance team will review your request and contact you soon.",
    submitAnotherRequest: "Submit Another Request",
    requestDetails: "Request Details",
    workOrderNumber: "Work Order Number",
    submittedBy: "Submitted By",
    submittedOn: "Submitted On",
    validUntil: "Valid Until",

    // New translations for emergency modal
    emergencyContact: "Emergency Contact",
    emergencyInstructions: "For true emergencies, please contact our customer service immediately. This form is only for regular maintenance requests.",
    emergencyPhoneNumber: "Emergency Phone Number",
    continue: "Continue Anyway",
    weekendNotAllowed: "Weekends are not available for scheduling. Please select a weekday (Monday-Friday).",
    optional: "Optional",

    // Language selector
    language: 'Language',
    english: 'English',
    spanish: 'Spanish',
    
    // Required fields
    requiredFields: 'Required fields are marked with an asterisk (*)',
    sessionError: 'Your session has expired. Please refresh the page and try again.',
    
    // Property information section
    buildingName: 'Building Name',
    unitNumber: 'Unit Number',
    
    // Tenant information section
    tenantName: 'Your Name',
    tenantEmail: 'Email Address',
    tenantPhone: 'Phone Number',
    
    // Request details section
    workRequestedPlaceholder: 'Please describe the issue in detail...',
    scheduledDate: 'Preferred Service Date',
    scheduledTime: 'Preferred Time',
    schedulingNote: 'Note: Maintenance is available Monday-Friday, 9am-5pm',
    specialInstructionsPlaceholder: 'Any additional information...',
    
    // Signature section
    signatureInstructions: 'Please sign below to authorize this maintenance request',
    signatureCanvasMissing: 'Signature pad is not available. Please try another browser.',
    clearSignature: 'Clear Signature',
    
    // File upload
    uploadPropertyImages: 'Upload Images (Optional)',
    uploadPropertyImagesHelper: 'You can upload up to 5 images (JPG, PNG, GIF) to help describe the issue',
    browseFiles: 'Browse Files',
    dragAndDrop: 'or drag and drop',
    maxFileSize: 'Maximum file size: 5MB',
    
    // Misc
    loading: 'Loading...',
    
    // PDF
    viewPdf: 'View PDF',
    
    // Request Type Selection page
    selectRequestType: 'Select Request Type',
    selectRequestTypeDescription: 'Please select the type of maintenance request you need to submit.',
    regularMaintenance: 'Regular Maintenance',
    regularMaintenanceDescription: 'For non-urgent repairs and maintenance issues that can be scheduled during regular business hours.',
    emergencyMaintenance: 'Emergency Maintenance',
    emergencyMaintenanceDescription: 'For urgent issues that require immediate attention, such as water leaks, electrical hazards, or other safety concerns.',
    close: 'Close',
    
    // Image compression translations
    compressingImages: 'Processing images...',
    compressionComplete: 'Compression Complete',
    processingComplete: 'Processing Complete',
    compressionError: 'Error processing images. Please try again.',
    invalidFileTypes: 'Please select only image files (JPEG, PNG, WebP, GIF)',
    tooManyImages: 'Too many images selected',
    filesTooLarge: 'Some files are too large',
    imagesSelected: 'images selected',
    maxImagesReached: 'Maximum reached',
    removeAll: 'Remove All',
    smaller: 'smaller',
    filesCompressed: 'files compressed',
    filesSkipped: 'files under 2MB (kept original)',
    noCompressionNeeded: 'No compression needed - all files under 2MB',
    filesUnder2MB: 'files under 2MB (kept original)',
    files2to5MB: 'files 2-5MB (50% compression)',
    files5to8MB: 'files 5-8MB (60% compression)',
    filesOver8MB: 'files over 8MB (70% max compression)',
  },
  es: {
    // Form title and instructions
    formTitle: "Formulario de Solicitud de Mantenimiento",
    formInstructions: "Por favor complete todos los campos para enviar su solicitud de mantenimiento",
    
    // Property Information
    propertyInfo: "Información de la Propiedad",
    building: "Edificio",
    buildingPlaceholder: "Ingrese el nombre del edificio",
    unit: "Unidad",
    unitPlaceholder: "Ingrese el número de unidad",
    
    // Tenant Information
    tenantInfo: "Información del Inquilino",
    name: "Nombre",
    phone: "Teléfono",
    email: "Correo Electrónico",
    
    // Scheduling & Access
    schedulingAccess: "Programación y Acceso",
    preferredDate: "Fecha Preferida",
    preferredTime: "Hora Preferida",
    permissionToEnter: "Permiso para entrar a la unidad sin el inquilino presente",
    scheduleRestriction: "El mantenimiento está disponible de lunes a viernes, de 9AM a 5PM solamente",
    weekdaysOnly: "Solo días laborables (Lunes-Viernes) están disponibles",
    businessHours: "Solo horario laboral (9AM-5PM)",
    timeNotAllowed: "Solo se permiten horas entre 9AM y 5PM",
    yes: "Sí",
    no: "No",
    
    // Work Request
    workRequest: "Solicitud de Trabajo",
    workRequested: "Trabajo Solicitado",
    isEmergency: "¿Es una emergencia?",
    emergencyAlert: "IMPORTANTE: Este formulario es solo para solicitudes de mantenimiento. Para emergencias verdaderas, llame al 213-531-9789 inmediatamente. ¿Aún desea continuar con esta solicitud?",
    
    // Permission Modal
    reasonForNoPermission: "Motivo para No Dar Permiso",
    reasonForNoPermissionExplanation: "Por favor proporcione un motivo por el cual no puede dar permiso para que el mantenimiento ingrese sin que usted esté presente.",
    reason: "Motivo",
    reasonRequired: "Por favor proporcione un motivo para no dar permiso de entrada",
    submit: "Enviar",
    cancel: "Cancelar",
    
    // Special Instructions
    specialInstructions: "Instrucciones Especiales",
    
    // Property Images
    propertyImages: "Imágenes de la Propiedad",
    uploadImages: "Subir Imágenes",
    addMoreImages: "Agregar Más Imágenes",
    
    // Signature
    signature: "Firma",
    drawSignature: "Dibujar Firma",
    uploadSignature: "Subir Firma",
    signBelow: "Firme abajo para confirmar su solicitud. Use su dedo en móvil o mouse en computadora.",
    signatureWillBeSaved: "Su firma será guardada y adjunta al PDF.",
    uploadSignatureInstructions: "Suba una imagen de su firma. El archivo será guardado y adjunto al PDF.",
    clear: "Borrar",
    
    // Submission
    important: "Importante:",
    submissionNotice: "Al enviar, confirma que esta es una solicitud de mantenimiento oficial. Se le enviará una orden de trabajo por correo electrónico.",
    noCashPayments: "NO SE ACEPTAN PAGOS EN EFECTIVO. Contacte al 213-531-9789 si algún empleado solicita efectivo.",
    submitRequest: "Enviar Solicitud",
    submitting: "Enviando...",
    
    // Date display
    date: "Fecha",
    
    // Validation messages
    buildingRequired: "El nombre del edificio es obligatorio",
    unitRequired: "El número de unidad es obligatorio",
    nameRequired: "El nombre del inquilino es obligatorio",
    emailRequired: "El correo electrónico es obligatorio",
    emailInvalid: "Por favor ingrese un correo electrónico válido",
    phoneRequired: "El número de teléfono es obligatorio",
    phoneInvalid: "Por favor ingrese un número de teléfono válido",
    workRequestRequired: "La descripción del trabajo es obligatoria",
    workRequestTooLong: "La descripción del trabajo no puede exceder los 300 caracteres (aproximadamente 3-4 líneas)",
    dateRequired: "La fecha es obligatoria",
    timeRequired: "La hora es obligatoria",
    schedulingInvalid: "El mantenimiento solo está disponible de lunes a viernes, de 9AM a 5PM",
    specialInstructionsRequired: "Las instrucciones especiales son obligatorias",
    signatureRequired: "Por favor proporcione una firma",
    signatureUploadRequired: "Por favor suba una imagen de firma",
    fixFormErrors: "Por favor corrija los errores del formulario antes de enviar.",
    propertyImagesRequired: "Por favor suba al menos una imagen del problema",

    // Form submission messages
    requestSubmitted: "¡Solicitud enviada exitosamente!",
    redirecting: "Redirigiendo...",
    submissionFailed: "Error al enviar. Por favor intente nuevamente.",
    signatureError: "Error de firma",
    imageUploadError: "Error al subir imagen",
    invalidSignatureData: "Datos de firma inválidos. Por favor intente nuevamente.",
    uploadPhotos: "Subir Fotos del Problema (Obligatorio)",
    uploadPhotosInstructions: "Debe subir fotos que muestren el problema de mantenimiento. Compresión automática: 2-5MB (50%), 5-8MB (60%), 8MB+ (70% máx).",
    uploadedImages: "Imágenes Subidas",
    propertyImage: "Imagen de la propiedad",
    removeImage: "Eliminar imagen",
    selected: "Seleccionado",
    submissionConfirmation: "Al enviar, confirma que esta es una solicitud de mantenimiento oficial. Se le enviará una orden de trabajo por correo electrónico.",

    // Thank you page translations
    thankYou: "¡Gracias!",
    requestSubmittedSuccess: "Su solicitud de mantenimiento ha sido enviada exitosamente.",
    confirmationEmailSent: "Se ha enviado un correo electrónico de confirmación con los detalles de su solicitud.",
    maintenanceTeamReview: "Nuestro equipo de mantenimiento revisará su solicitud y se pondrá en contacto pronto.",
    submitAnotherRequest: "Enviar Otra Solicitud",
    requestDetails: "Detalles de la Solicitud",
    workOrderNumber: "Número de Orden de Trabajo",
    submittedBy: "Enviado Por",
    submittedOn: "Enviado El",
    validUntil: "Válido Hasta",

    // New translations for emergency modal
    emergencyContact: "Contacto de Emergencia",
    emergencyInstructions: "Para emergencias reales, contacte a nuestro servicio al cliente inmediatamente. Este formulario es solo para solicitudes de mantenimiento regulares.",
    emergencyPhoneNumber: "Número de Teléfono de Emergencia",
    continue: "Continuar de Todos Modos",
    weekendNotAllowed: "Los fines de semana no están disponibles para programar. Por favor seleccione un día de semana (Lunes-Viernes).",
    optional: "Opcional",

    // Language selector
    language: 'Idioma',
    english: 'Inglés',
    spanish: 'Español',
    
    // Required fields
    requiredFields: 'Los campos obligatorios están marcados con un asterisco (*)',
    sessionError: 'Su sesión ha expirado. Por favor, actualice la página e inténtelo de nuevo.',
    
    // Property information section
    buildingName: 'Nombre del Edificio',
    unitNumber: 'Número de Unidad',
    
    // Tenant information section
    tenantName: 'Su Nombre',
    tenantEmail: 'Correo Electrónico',
    tenantPhone: 'Número de Teléfono',
    
    // Request details section
    workRequestedPlaceholder: 'Por favor describa el problema en detalle...',
    scheduledDate: 'Fecha de Servicio Preferida',
    scheduledTime: 'Hora Preferida',
    schedulingNote: 'Nota: El mantenimiento está disponible de lunes a viernes, de 9am a 5pm',
    specialInstructionsPlaceholder: 'Cualquier información adicional...',
    
    // Signature section
    signatureInstructions: 'Por favor firme a continuación para autorizar esta solicitud de mantenimiento',
    signatureCanvasMissing: 'El panel de firma no está disponible. Por favor, pruebe con otro navegador.',
    clearSignature: 'Borrar Firma',
    
    // File upload
    uploadPropertyImages: 'Subir Imágenes (Opcional)',
    uploadPropertyImagesHelper: 'Puede subir hasta 5 imágenes (JPG, PNG, GIF) para ayudar a describir el problema',
    browseFiles: 'Buscar Archivos',
    dragAndDrop: 'o arrastrar y soltar',
    maxFileSize: 'Tamaño máximo de archivo: 5MB',
    
    // Misc
    loading: 'Cargando...',
    
    // PDF
    viewPdf: 'Ver PDF',
    
    // Request Type Selection page
    selectRequestType: 'Seleccione el Tipo de Solicitud',
    selectRequestTypeDescription: 'Por favor, seleccione el tipo de solicitud de mantenimiento que necesita enviar.',
    regularMaintenance: 'Mantenimiento Regular',
    regularMaintenanceDescription: 'Para reparaciones no urgentes y problemas de mantenimiento que pueden programarse durante el horario comercial regular.',
    emergencyMaintenance: 'Mantenimiento de Emergencia',
    emergencyMaintenanceDescription: 'Para problemas urgentes que requieren atención inmediata, como fugas de agua, peligros eléctricos u otros problemas de seguridad.',
    close: 'Cerrar',
    
    // Image compression translations
    compressingImages: 'Procesando imágenes...',
    compressionComplete: 'Compresión Completa',
    processingComplete: 'Procesamiento Completo',
    compressionError: 'Error al procesar imágenes. Por favor intente nuevamente.',
    invalidFileTypes: 'Por favor seleccione solo archivos de imagen (JPEG, PNG, WebP, GIF)',
    tooManyImages: 'Demasiadas imágenes seleccionadas',
    filesTooLarge: 'Algunos archivos son demasiado grandes',
    imagesSelected: 'imágenes seleccionadas',
    maxImagesReached: 'Máximo alcanzado',
    removeAll: 'Eliminar Todas',
    smaller: 'más pequeño',
    filesCompressed: 'archivos comprimidos',
    filesSkipped: 'archivos menores a 2MB (originales conservados)',
    noCompressionNeeded: 'No se necesita compresión - todos los archivos son menores a 2MB',
    filesUnder2MB: 'archivos menores a 2MB (originales conservados)',
    files2to5MB: 'archivos 2-5MB (compresión 50%)',
    files5to8MB: 'archivos 5-8MB (compresión 60%)',
    filesOver8MB: 'archivos mayores a 8MB (compresión 70% máx)',
  }
};

// Function to get translation based on language and key
export const getTranslation = (language, key) => {
  return translations[language][key] || translations.en[key] || key;
}; 