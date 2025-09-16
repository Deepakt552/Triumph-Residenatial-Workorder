import { useState, useRef, useEffect, useCallback } from 'react';
import { Head, useForm, router as Inertia } from '@inertiajs/react';
import FormOnlyLayout from '@/Layouts/FormOnlyLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TextArea from '@/Components/TextArea';
import PrimaryButton from '@/Components/PrimaryButton';
import SignatureCanvas from 'react-signature-canvas';
import SignaturePad from '@/Components/SignatureCanvas';
import ImageUploadWithCompression from '@/Components/ImageUploadWithCompression';
import { DEFAULT_MAINTENANCE_COMPRESSION } from '@/utils/compressionConfig';
import toast from 'react-hot-toast';
import { translations, getTranslation } from '@/utils/translations';
import axios from 'axios';

export default function Create(props) {
    const [signatureError, setSignatureError] = useState('');
    const [signatureMethod, setSignatureMethod] = useState('draw'); // 'draw' or 'upload'
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState(props.language || 'en'); // Default to English or use prop
    const [checkingSession, setCheckingSession] = useState(true);
    const signatureRef = useRef(null);
    
    // Add form validation errors state
    const [validationErrors, setValidationErrors] = useState({});
    const [showErrors, setShowErrors] = useState(false);

    // Add state for the permission modal
    const [showPermissionModal, setShowPermissionModal] = useState(false);

    // Add state for the emergency modal
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    
    // Check if we should hide the emergency option
    const hideEmergencyOption = props.hideEmergencyOption || false;
    
    // Check if this is an emergency request
    const isEmergency = props.isEmergency || false;
    
    // State for draggable modals
    const [permissionModalPosition, setPermissionModalPosition] = useState({ x: 0, y: 0 });
    const [emergencyModalPosition, setEmergencyModalPosition] = useState({ x: 0, y: 0 });
    const [isDraggingPermission, setIsDraggingPermission] = useState(false);
    const [isDraggingEmergency, setIsDraggingEmergency] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const permissionModalRef = useRef(null);
    const emergencyModalRef = useRef(null);
    
    // Reset modal positions when modals are closed
    useEffect(() => {
        if (!showPermissionModal) {
            setPermissionModalPosition({ x: 0, y: 0 });
        }
        if (!showEmergencyModal) {
            setEmergencyModalPosition({ x: 0, y: 0 });
        }
    }, [showPermissionModal, showEmergencyModal]);
    
    // Mouse down handler for dragging permission modal
    const handlePermissionMouseDown = (e) => {
        if (permissionModalRef.current && e.target.closest('.modal-header')) {
            setIsDraggingPermission(true);
            const rect = permissionModalRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };
    
    // Mouse down handler for dragging emergency modal
    const handleEmergencyMouseDown = (e) => {
        if (emergencyModalRef.current && e.target.closest('.modal-header')) {
            setIsDraggingEmergency(true);
            const rect = emergencyModalRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };
    
    // Mouse move handler for dragging
    const handleMouseMove = (e) => {
        if (isDraggingPermission) {
            setPermissionModalPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        } else if (isDraggingEmergency) {
            setEmergencyModalPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        }
    };
    
    // Mouse up handler to stop dragging
    const handleMouseUp = () => {
        setIsDraggingPermission(false);
        setIsDraggingEmergency(false);
    };
    
    // Add event listeners for mouse events
    useEffect(() => {
        if (showPermissionModal || showEmergencyModal) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [showPermissionModal, showEmergencyModal, isDraggingPermission, isDraggingEmergency, dragOffset]);

    // Check if user has already submitted a form
    useEffect(() => {
        // Check if user has already submitted a form by making an AJAX request
        const checkFormSubmission = async () => {
            try {
                setCheckingSession(true);
                const response = await axios.get(route('maintenance.check-session'));
                
                if (response.data && response.data.has_submission) {
                    // User has already submitted a form, redirect to thanks page
                    toast.success('You have already submitted a maintenance request');
                    Inertia.visit(route('maintenance.thanks'));
                }
            } catch (error) {
                console.error('Error checking form submission:', error);
            } finally {
                setCheckingSession(false);
            }
        };

        checkFormSubmission();
    }, []);

    // Load language from session storage or URL parameter on component mount
    useEffect(() => {
        // First check props (from controller)
        if (props.language && ['en', 'es'].includes(props.language)) {
            setLanguage(props.language);
            sessionStorage.setItem('maintenance_form_language', props.language);
            return;
        }
        
        // Then check URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        
        // Then check session storage
        const savedLang = sessionStorage.getItem('maintenance_form_language');
        
        // Set language with priority: URL param > session storage > default (en)
        if (urlLang && ['en', 'es'].includes(urlLang)) {
            setLanguage(urlLang);
            sessionStorage.setItem('maintenance_form_language', urlLang);
        } else if (savedLang && ['en', 'es'].includes(savedLang)) {
            setLanguage(savedLang);
        }
    }, [props.language]);

    // Save language to session storage when it changes
    useEffect(() => {
        sessionStorage.setItem('maintenance_form_language', language);
    }, [language]);

    // Handle language change
    const handleLanguageChange = (e) => {
        const newLanguage = e.target.value;
        setLanguage(newLanguage);
        setData('selected_language', newLanguage);
    };

    // Translation helper function
    const t = (key) => getTranslation(language, key);

    // Initialize signature pad with proper settings when component mounts
    useEffect(() => {
        if (signatureRef.current) {
            // Clear any previous signature
            signatureRef.current.clear();
            
            // Set better pen properties
            signatureRef.current.penColor = 'black';
            signatureRef.current.velocityFilterWeight = 0.4;
            signatureRef.current.minWidth = 0.5;
            signatureRef.current.maxWidth = 2.5;
            signatureRef.current.dotSize = 2;
            signatureRef.current.throttle = 5;
        }
    }, [signatureMethod]);

    const { data, setData, post, processing, errors, reset } = useForm({
        building_name: '',
        unit_number: '',
        tenant_name: '',
        tenant_email: '',
        tenant_phone: '',
        work_requested: '',
        is_emergency: isEmergency,
        permission_to_enter: true, // Default to true as requested
        scheduled_date: '',
        scheduled_time: '',
        special_instructions: '',
        tenant_signature: '',
        signature_file: null,
        property_images: [],
        selected_language: language,
        no_permission_reason: '', // New field for reason when permission is denied
    });

    // Update form data when language changes
    useEffect(() => {
        setData('selected_language', language);
    }, [language]);

    // Add validation for Monday-Friday 9am-5pm scheduling
    const validateScheduling = (date, time) => {
        if (!date || !time) return false;
        
        try {
            // Fix timezone issues by appending T00:00:00 to ensure it's interpreted as midnight
            const dateStr = `${date}T00:00:00`;
            const scheduledDate = new Date(dateStr);
            const day = scheduledDate.getDay();
            
            // Check if it's a weekday (1-5 is Monday-Friday)
            if (day === 0 || day === 6) return false;
            
            // Parse the time (format: HH:MM)
            const [hours, minutes] = time.split(':').map(Number);
            
            // Check if time is between 9am and 5pm (9:00-17:00)
            return (hours >= 9 && hours < 17) || (hours === 17 && minutes === 0);
        } catch (error) {
            console.error('Date validation error:', error);
            return false;
        }
    };

    // Function to filter available dates (disable weekends)
    const filterWeekends = (date) => {
        try {
            const day = date.getDay();
            // Return true for Monday-Friday (1-5), false for Saturday and Sunday (0, 6)
            return day !== 0 && day !== 6;
        } catch (error) {
            console.error('Weekend filter error:', error);
            return false;
        }
    };

    // Handle permission to enter change
    const handlePermissionChange = (value) => {
        if (value === false) {
            // Show modal when selecting "No"
            setShowPermissionModal(true);
        } else {
            setData('permission_to_enter', true);
            setData('no_permission_reason', '');
        }
    };

    // Handle reason submission in modal
    const handleReasonSubmit = () => {
        if (data.no_permission_reason.trim() === '') {
            // Validation - reason is required
            toast.error(t('reasonRequired'));
            return;
        }
        
        setData('permission_to_enter', false);
        setShowPermissionModal(false);
    };

    // Handle closing the modal without changes
    const handleModalCancel = () => {
        setShowPermissionModal(false);
        setData('permission_to_enter', true); // Reset to Yes
        setData('no_permission_reason', '');
    };

    // Handle emergency change
    const handleEmergencyChange = (value) => {
        if (value === true) {
            // Show emergency modal when selecting "Yes"
            setShowEmergencyModal(true);
        } else {
            setData('is_emergency', false);
        }
    };

    // Handle emergency modal confirmation
    const handleEmergencyConfirm = () => {
        setData('is_emergency', true);
        setShowEmergencyModal(false);
    };

    // Handle closing the emergency modal
    const handleEmergencyCancel = () => {
        setShowEmergencyModal(false);
        setData('is_emergency', false); // Reset to No
    };

    // Validate form data and return errors object
    const validateForm = () => {
        const errors = {};
        
        // Required field validation
        if (!data.building_name) errors.building_name = 'buildingRequired';
        if (!data.unit_number) errors.unit_number = 'unitRequired';
        if (!data.tenant_name) errors.tenant_name = 'nameRequired';
        if (!data.tenant_email) errors.tenant_email = 'emailRequired';
        if (!data.tenant_phone) errors.tenant_phone = 'phoneRequired';
        if (!data.work_requested) errors.work_requested = 'workRequestRequired';
        if (data.work_requested && data.work_requested.length > 300) errors.work_requested = 'workRequestTooLong';
        if (!data.scheduled_date) errors.scheduled_date = 'dateRequired';
        if (!data.scheduled_time) errors.scheduled_time = 'timeRequired';
        // Special instructions is now optional
        
        // Property images validation - now required
        if (!data.property_images || data.property_images.length === 0) {
            errors.property_images = 'propertyImagesRequired';
        }
        
        // Email validation - more comprehensive regex
        if (data.tenant_email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.tenant_email)) {
            errors.tenant_email = 'emailInvalid';
        }
        
        // Phone validation - more flexible to allow various formats
        if (data.tenant_phone) {
            // Remove all non-digit characters for validation
            const digitsOnly = data.tenant_phone.replace(/\D/g, '');
            // Check if we have a reasonable number of digits (7-15)
            if (digitsOnly.length < 7 || digitsOnly.length > 15) {
                errors.tenant_phone = 'phoneInvalid';
            }
        }
        
        // Validate scheduling - must be Monday-Friday, 9am-5pm
        if (data.scheduled_date && data.scheduled_time) {
            if (!validateScheduling(data.scheduled_date, data.scheduled_time)) {
                errors.scheduled_time = 'schedulingInvalid';
            }
        }
        
        return errors;
    };

    // Handle field change and clear error for that field
    const handleFieldChange = (field, value) => {
        setData(field, value);
        if (showErrors) {
            setValidationErrors(prev => {
                const updated = {...prev};
                delete updated[field];
                return updated;
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate form
        const formErrors = validateForm();
        setValidationErrors(formErrors);
        setShowErrors(true);
        
        // Check if any validation errors
        if (Object.keys(formErrors).length > 0) {
            // Show toast notification for validation errors
            toast.error(t('fixFormErrors'));
            
            // Scroll to the first error
            const firstErrorField = document.querySelector('.text-red-600');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        
        // Validate signature
        if (signatureMethod === 'draw') {
            if (!signatureRef.current || signatureRef.current.isEmpty()) {
                setSignatureError(t('signatureRequired'));
                toast.error(t('signatureRequired'));
                document.getElementById('signature-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
        } else if (signatureMethod === 'upload' && !data.signature_file) {
            setSignatureError(t('signatureUploadRequired'));
            toast.error(t('signatureUploadRequired'));
            document.getElementById('signature-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        
        setSignatureError('');
        
        // Show loading toast
        const loadingToast = toast.loading(t('submitting'));
        
        // Show processing state
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = t('submitting');
        }
        
        // Create a FormData object to ensure file uploads work correctly
        const formData = new FormData();
        
        // Add all non-file form fields to FormData
        Object.keys(data).forEach(key => {
            if (key !== 'signature_file' && key !== 'tenant_signature' && key !== 'property_images') {
                formData.append(key, data[key]);
            }
        });
        
        // Add signature file if present
        if (data.signature_file instanceof File) {
            formData.append('signature_file', data.signature_file);
            console.log('Added signature file to form data');
        }
        
        // Set signature data before submission
        if (signatureMethod === 'draw' && signatureRef.current) {
            try {
                // Get signature data with maximum quality
                const signatureData = signatureRef.current.toDataURL('image/png', 1.0);
                
                // Verify signature data validity
                if (!signatureData || signatureData.length < 100 || !signatureData.startsWith('data:image/')) {
                    console.error('Invalid signature data', {
                        isEmpty: !signatureData,
                        length: signatureData ? signatureData.length : 0,
                        prefix: signatureData ? signatureData.substring(0, 30) : 'none'
                    });
                    throw new Error(t('invalidSignatureData'));
                }
                
                console.log('Signature data captured', {
                    prefix: signatureData.substring(0, 30) + '...',
                    length: signatureData.length
                });
                
                // Directly set on form data with proper format
                formData.append('tenant_signature', signatureData);
                
                // After adding the signature data, proceed with form submission
                submitFormWithData(formData, submitBtn, loadingToast);
            } catch (error) {
                handleSignatureError(error, submitBtn, loadingToast);
                return;
            }
        } else {
            // If not using drawn signature or in case of error, submit form directly
            submitFormWithData(formData, submitBtn, loadingToast);
        }
    };
    
    // Helper function to handle signature errors
    const handleSignatureError = (error, submitBtn, loadingToast) => {
        console.error('Error capturing signature:', error);
        const errorMessage = t('signatureError');
        setSignatureError(errorMessage);
        toast.error(errorMessage);
        toast.dismiss(loadingToast);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = t('submitRequest');
        }
        document.getElementById('signature-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    
    // Helper function to submit form with prepared form data
    const submitFormWithData = (formData, submitBtn, loadingToast) => {
        // Add property images if any
        if (data.property_images && data.property_images.length > 0) {
            data.property_images.forEach((file, index) => {
                if (file instanceof File) {
                    formData.append(`property_image_${index}`, file);
                }
            });
        }
        
        // Add selected language to form data
        formData.append('selected_language', language);
        
        // Log the selected language for debugging
        console.log('Submitting form with language:', language);
        console.log('Form data contains selected_language:', formData.get('selected_language'));
        
        // Verify all form data for debugging
        console.log('Form data entries:');
        for (let [key, value] of formData.entries()) {
            if (key === 'selected_language') {
                console.log(`${key}: ${value}`);
            }
        }
        
        // Submit the form
        post(route('maintenance.store'), {
            data: formData,
            forceFormData: true,
            preserveState: false,
            onProgress: (progress) => {
                console.log('Upload progress:', progress);
            },
            onSuccess: (response) => {
                toast.success(t('requestSubmitted'));
                toast.dismiss(loadingToast);
                
                // Pass language parameter to thanks page
                const thanksUrl = new URL(response?.redirect || route('maintenance.thanks'));
                thanksUrl.searchParams.set('lang', language);
                
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = t('redirecting');
                }
                
                try {
                    Inertia.visit(thanksUrl.toString());
                    
                    setTimeout(() => {
                        if (document.location.pathname !== new URL(thanksUrl).pathname) {
                            window.location.href = thanksUrl.toString();
                        }
                    }, 1000);
                    
                    setTimeout(() => {
                        if (document.location.pathname !== new URL(thanksUrl).pathname) {
                            window.location.replace(thanksUrl.toString());
                        }
                    }, 2000);
                } catch (e) {
                    console.error('Navigation error:', e);
                    window.location.href = thanksUrl.toString();
                }
            },
            onError: (errors) => {
                console.error('Submission errors:', errors);
                setValidationErrors(errors);
                setShowErrors(true);
                
                toast.dismiss(loadingToast);
                
                let errorMessage = t('submissionFailed');
                let scrollTarget = null;
                
                if (errors.tenant_signature) {
                    errorMessage = t('signatureError') + ': ' + errors.tenant_signature;
                    scrollTarget = 'signature-section';
                    setSignatureError(errorMessage);
                } 
                else if (errors.property_images) {
                    errorMessage = t('imageUploadError') + ': ' + errors.property_images;
                    scrollTarget = 'property-images-section';
                } 
                else if (errors.error) {
                    errorMessage = errors.error;
                    if (errors.error.toLowerCase().includes('signature')) {
                        scrollTarget = 'signature-section';
                        setSignatureError(errorMessage);
                    }
                }
                
                toast.error(errorMessage);
                setSignatureError(errorMessage);
                
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = t('submitRequest');
                }
                
                if (scrollTarget) {
                    document.getElementById(scrollTarget)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            },
        });
    };

    const clearSignature = () => {
        if (signatureMethod === 'draw') {
            signatureRef.current?.clear();
            setData('tenant_signature', '');
        } else {
            setData('signature_file', null);
        }
        setSignatureError('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && !file.type.startsWith('image/')) {
            setSignatureError('Please upload a valid image file');
            return;
        }
        setData('signature_file', file);
        setSignatureError('');
    };



    // Function to get error messages with priority to client-side validation
    const getErrorMessage = (field) => {
        return (showErrors && validationErrors[field]) || errors[field];
    };

    // Function to check if a signature canvas is empty (all white)
    const isSignatureEmpty = (canvas) => {
        try {
            const ctx = canvas.getContext('2d');
            const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            
            // Check if all pixels are white or transparent
            for (let i = 0; i < pixelData.length; i += 4) {
                // If any pixel has color or opacity, the signature is not empty
                if (pixelData[i] < 255 || pixelData[i+1] < 255 || pixelData[i+2] < 255 || pixelData[i+3] > 0) {
                    return false;
                }
            }
            
            return true;
        } catch (e) {
            console.error('Error checking if signature is empty:', e);
            return false; // Assume not empty on error
        }
    };

    // New function to handle signature save from SignaturePad component
    const handleSignatureSave = (dataURL) => {
        setData('tenant_signature', dataURL);
        console.log('Signature saved from component:', dataURL.substring(0, 30) + '...');
        setSignatureError('');
    };

    return (
        <FormOnlyLayout>
            <Head title={t('formTitle')}>
                <style>
                    {`
                        .draggable-modal {
                            position: fixed;
                            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                            border-radius: 0.5rem;
                            background-color: white;
                            z-index: 50;
                            overflow: hidden;
                            max-width: 28rem;
                            width: 100%;
                        }
                        
                        .modal-header {
                            cursor: move;
                            user-select: none;
                            display: flex;
                            align-items: center;
                            padding-bottom: 12px;
                        }
                    `}
                </style>
            </Head>
            
            {checkingSession ? (
                <div className="py-12">
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white border-b border-gray-200">
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="mt-4 text-gray-600">Loading...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-12 bg-gray-100">
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white shadow-lg border border-gray-200 sm:rounded-lg p-8">
                            {/* Language Selection */}
                            {/* <div className="flex justify-end mb-6">
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="language"
                                            value="en"
                                            checked={language === 'en'}
                                            onChange={handleLanguageChange}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">English</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="language"
                                            value="es"
                                            checked={language === 'es'}
                                            onChange={handleLanguageChange}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Español</span>
                                    </label>
                                </div>
                            </div> */}
                            
                            <h2 className="text-2xl font-serif font-bold text-center text-gray-800 mb-4">
                                {t('formTitle')}
                            </h2>
                            <p className="text-center text-gray-600 mb-8">
                                {t('formInstructions')}
                            </p>
                            
                            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                                {/* Property Information Section */}
                                <section className="border-b border-gray-300 pb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-serif font-medium text-gray-700">{t('propertyInfo')}</h3>
                                        <p className="text-sm text-gray-600">
                                            {t('date')}: {new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {timeZone: 'America/Los_Angeles'})}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel htmlFor="building_name" value={t('building')} className="font-medium" />
                                            <TextInput
                                                id="building_name"
                                                type="text"
                                                name="building_name"
                                                value={data.building_name}
                                                className="mt-1 w-full border-0 border-b-2 border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                                                onChange={(e) => handleFieldChange('building_name', e.target.value)}
                                                required
                                                placeholder={t('buildingPlaceholder')}
                                                aria-describedby="building_name-error"
                                            />
                                            <InputError id="building_name-error" message={t(getErrorMessage('building_name'))} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="unit_number" value={t('unit')} className="font-medium" />
                                            <TextInput
                                                id="unit_number"
                                                type="text"
                                                name="unit_number"
                                                value={data.unit_number}
                                                className="mt-1 w-full border-0 border-b-2 border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                                                onChange={(e) => handleFieldChange('unit_number', e.target.value)}
                                                required
                                                placeholder={t('unitPlaceholder')}
                                                aria-describedby="unit_number-error"
                                            />
                                            <InputError id="unit_number-error" message={t(getErrorMessage('unit_number'))} className="mt-2" />
                                        </div>
                                    </div>
                                </section>

                                {/* Tenant Information */}
                                <section className="border-b border-gray-300 pb-6">
                                    <h3 className="text-lg font-serif font-medium text-gray-700 mb-4">{t('tenantInfo')}</h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <InputLabel htmlFor="tenant_name" value={t('name')} className="w-32 inline-block font-medium" />
                                                <TextInput
                                                    id="tenant_name"
                                                    type="text"
                                                    name="tenant_name"
                                                    value={data.tenant_name}
                                                    className="mt-1 w-full border-0 border-b-2 border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                                                    onChange={(e) => handleFieldChange('tenant_name', e.target.value)}
                                                    required
                                                    aria-describedby="tenant_name-error"
                                                />
                                                <InputError id="tenant_name-error" message={t(getErrorMessage('tenant_name'))} className="mt-2" />
                                            </div>
                                            <div>
                                                <InputLabel htmlFor="tenant_phone" value={t('phone')} className="w-32 inline-block font-medium" />
                                                <TextInput
                                                    id="tenant_phone"
                                                    type="tel"
                                                    name="tenant_phone"
                                                    value={data.tenant_phone}
                                                    className="mt-1 w-full border-0 border-b-2 border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                                                    onChange={(e) => handleFieldChange('tenant_phone', e.target.value)}
                                                    required
                                                    aria-describedby="tenant_phone-error"
                                                />
                                                <InputError id="tenant_phone-error" message={t(getErrorMessage('tenant_phone'))} className="mt-2" />
                                            </div>
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="tenant_email" value={t('email')} className="w-32 inline-block font-medium" />
                                            <TextInput
                                                id="tenant_email"
                                                type="email"
                                                name="tenant_email"
                                                value={data.tenant_email}
                                                className="mt-1 w-full border-0 border-b-2 border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                                                onChange={(e) => handleFieldChange('tenant_email', e.target.value)}
                                                required
                                                aria-describedby="tenant_email-error"
                                            />
                                            <InputError id="tenant_email-error" message={t(getErrorMessage('tenant_email'))} className="mt-2" />
                                        </div>
                                    </div>
                                </section>

                                {/* Scheduling and Permission */}
                                <section className="border-b border-gray-300 pb-6">
                                    <h3 className="text-lg font-serif font-medium text-gray-700 mb-4">{t('schedulingAccess')}</h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <InputLabel htmlFor="scheduled_date" value={t('preferredDate')} className="w-32 inline-block font-medium" />
                                                <TextInput
                                                    id="scheduled_date"
                                                    type="date"
                                                    name="scheduled_date"
                                                    value={data.scheduled_date}
                                                    className="mt-1 w-full border-0 border-b-2 border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                                                    onChange={(e) => handleFieldChange('scheduled_date', e.target.value)}
                                                    required
                                                    min={new Date().toISOString().split('T')[0]}
                                                    onInput={(e) => {
                                                        if (e.target.value) {
                                                            try {
                                                                // Fix timezone issues by appending T00:00:00 to ensure it's interpreted as midnight
                                                                const dateStr = `${e.target.value}T00:00:00`;
                                                                const selectedDate = new Date(dateStr);
                                                                const day = selectedDate.getDay();
                                                                
                                                                console.log('Selected date:', e.target.value);
                                                                console.log('Day of week:', day, '(0=Sunday, 1=Monday, ..., 6=Saturday)');
                                                                
                                                                // Check if weekend (0 = Sunday, 6 = Saturday)
                                                                if (day === 0 || day === 6) {
                                                                    console.log('Weekend detected, clearing input');
                                                                    e.target.value = '';
                                                                    toast.error(t('weekendNotAllowed'));
                                                                    handleFieldChange('scheduled_date', '');
                                                                } else {
                                                                    console.log('Weekday selected:', ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]);
                                                                }
                                                            } catch (error) {
                                                                console.error('Date parsing error:', error);
                                                            }
                                                        }
                                                    }}
                                                    aria-describedby="scheduled_date-error"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">{t('weekdaysOnly')}</p>
                                                <InputError id="scheduled_date-error" message={t(getErrorMessage('scheduled_date'))} className="mt-2" />
                                            </div>
                                            <div>
                                                <InputLabel htmlFor="scheduled_time" value={t('preferredTime')} className="w-32 inline-block font-medium" />
                                                <TextInput
                                                    id="scheduled_time"
                                                    type="time"
                                                    name="scheduled_time"
                                                    value={data.scheduled_time}
                                                    className="mt-1 w-full border-0 border-b-2 border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent"
                                                    onChange={(e) => handleFieldChange('scheduled_time', e.target.value)}
                                                    required
                                                    min="09:00" 
                                                    max="17:00"
                                                    step="1800"  // 30-minute intervals
                                                    onInput={(e) => {
                                                        if (e.target.value) {
                                                            try {
                                                                const timeValue = e.target.value;
                                                                const [hours, minutes] = timeValue.split(':').map(Number);
                                                                
                                                                console.log('Selected time:', timeValue);
                                                                console.log('Hours:', hours, 'Minutes:', minutes);
                                                                
                                                                // Validate time is between 9am and 5pm
                                                                if (hours < 9 || hours > 17 || (hours === 17 && minutes > 0)) {
                                                                    console.log('Invalid time detected, clearing input');
                                                                    e.target.value = '';
                                                                    toast.error(t('timeNotAllowed'));
                                                                    handleFieldChange('scheduled_time', '');
                                                                } else {
                                                                    console.log('Valid time selected');
                                                                }
                                                            } catch (error) {
                                                                console.error('Time parsing error:', error);
                                                            }
                                                        }
                                                    }}
                                                    aria-describedby="scheduled_time-error"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">{t('businessHours')}</p>
                                                <InputError id="scheduled_time-error" message={t(getErrorMessage('scheduled_time'))} className="mt-2" />
                                            </div>
                                        </div>
                                        <div>
                                            <InputLabel
                                                value={t('permissionToEnter')}
                                                className="font-medium"
                                            />
                                            <div className="flex gap-6 mt-2">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="permission_to_enter"
                                                        checked={data.permission_to_enter}
                                                        onChange={() => handlePermissionChange(true)}
                                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">{t('yes')}</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="permission_to_enter"
                                                        checked={!data.permission_to_enter}
                                                        onChange={() => handlePermissionChange(false)}
                                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">{t('no')}</span>
                                                </label>
                                            </div>
                                            <InputError message={t(getErrorMessage('permission_to_enter'))} className="mt-2" />
                                        </div>
                                    </div>
                                </section>

                                {/* Work Request */}
                                <section className="border-b border-gray-300 pb-6">
                                    <h3 className="text-lg font-serif font-medium text-gray-700 mb-4">{t('workRequest')}</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <InputLabel htmlFor="work_requested" value={t('workRequested')} className="w-32 inline-block font-medium" />
                                            <TextArea
                                                id="work_requested"
                                                name="work_requested"
                                                value={data.work_requested}
                                                className="mt-1 w-full border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                                                onChange={(e) => handleFieldChange('work_requested', e.target.value.slice(0, 300))}
                                                required
                                                rows={3}
                                                maxLength={300}
                                                aria-describedby="work_requested-error"
                                            />
                                            <div className="flex justify-end mt-1 text-xs text-gray-500">
                                                {data.work_requested ? data.work_requested.length : 0}/300
                                            </div>
                                            <InputError id="work_requested-error" message={t(getErrorMessage('work_requested'))} className="mt-2" />
                                        </div>

                                        {!hideEmergencyOption && (
                                            <div>
                                                <InputLabel
                                                    value={t('isEmergency')}
                                                    className="font-medium"
                                                />
                                                <div className="flex gap-6 mt-2">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="is_emergency"
                                                            checked={data.is_emergency}
                                                            onChange={() => handleEmergencyChange(true)}
                                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">{t('yes')}</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="is_emergency"
                                                            checked={!data.is_emergency}
                                                            onChange={() => handleEmergencyChange(false)}
                                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">{t('no')}</span>
                                                    </label>
                                                </div>
                                                <InputError message={t(getErrorMessage('is_emergency'))} className="mt-2" />
                                            </div>
                                        )}

                                        <div id="property-images-section">
                                            <ImageUploadWithCompression
                                                label={t('uploadPhotos')}
                                                images={data.property_images}
                                                onChange={(images) => handleFieldChange('property_images', images)}
                                                error={getErrorMessage('property_images')}
                                                required={true}
                                                compressionOptions={DEFAULT_MAINTENANCE_COMPRESSION}
                                                t={t}
                                            />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="special_instructions" value={t('specialInstructions')} className="w-32 inline-block font-medium" />
                                            <TextArea
                                                id="special_instructions"
                                                name="special_instructions"
                                                value={data.special_instructions}
                                                className="mt-1 w-full border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                                                onChange={(e) => handleFieldChange('special_instructions', e.target.value)}
                                                rows={3}
                                                aria-describedby="special_instructions-error"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">{t('optional')}</p>
                                            <InputError id="special_instructions-error" message={t(getErrorMessage('special_instructions'))} className="mt-2" />
                                        </div>
                                    </div>
                                </section>

                                {/* Signature */}
                                <section id="signature-section" className="border-b border-gray-300 pb-6">
                                    <h3 className="text-lg font-serif font-medium text-gray-700 mb-4">{t('signature')}</h3>
                                    <div className="space-y-4">
                                        <div className="flex space-x-4">
                                            <button
                                                type="button"
                                                onClick={() => setSignatureMethod('draw')}
                                                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                                    signatureMethod === 'draw'
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                                aria-pressed={signatureMethod === 'draw'}
                                            >
                                                {t('drawSignature')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSignatureMethod('upload')}
                                                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                                    signatureMethod === 'upload'
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                                aria-pressed={signatureMethod === 'upload'}
                                            >
                                                {t('uploadSignature')}
                                            </button>
                                        </div>
                                        {signatureMethod === 'draw' ? (
                                            <>
                                                <p className="text-sm text-gray-600">
                                                    {t('drawSignatureInstructions')}
                                                </p>
                                                <SignaturePad 
                                                    onSave={handleSignatureSave} 
                                                    ref={signatureRef}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm text-gray-600">
                                                    {t('uploadSignatureInstructions')}
                                                </p>
                                                <input
                                                    type="file"
                                                    name="signature_file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="mt-2 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                    aria-describedby="signature_file-error"
                                                />
                                                {data.signature_file && (
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <p className="text-sm text-green-600">
                                                            {t('selected')} {data.signature_file.name}
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={clearSignature}
                                                            className="text-sm text-indigo-600 hover:text-indigo-800"
                                                        >
                                                            {t('clear')}
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {signatureError && (
                                            <p className="text-sm text-red-600" id="signature_file-error">
                                                {signatureError}
                                            </p>
                                        )}
                                    </div>
                                </section>

                                {/* Submission Notice */}
                                <section className="bg-yellow-50 p-4 rounded-lg text-sm">
                                    <h4 className="font-bold text-yellow-800">{t('important')}:</h4>
                                    <p className="text-yellow-700">
                                        {t('submissionConfirmation')}
                                    </p>
                                    <p className="text-yellow-700 mt-2 font-medium">
                                        {t('noCashPayments')}
                                    </p>
                                </section>

                                {/* Submit Button */}
                                <div className="flex justify-center">
                                    <PrimaryButton
                                        type="submit"
                                        className="px-8 py-3 text-lg font-medium bg-indigo-600 hover:bg-indigo-700 border-2 border-indigo-800 rounded-lg"
                                        disabled={processing || loading}
                                        aria-busy={processing}
                                    >
                                        {processing ? t('submitting') : t('submitRequest')}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal for Permission Denial Reason */}
            {showPermissionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div 
                        ref={permissionModalRef}
                        className="draggable-modal"
                        style={{
                            transform: `translate(${permissionModalPosition.x}px, ${permissionModalPosition.y}px)`,
                            transition: isDraggingPermission ? 'none' : 'transform 0.1s ease-out',
                            cursor: isDraggingPermission ? 'grabbing' : 'auto',
                        }}
                        onMouseDown={handlePermissionMouseDown}
                    >
                        <div className="p-6">
                            <div className="modal-header">
                                <h3 className="text-lg font-bold flex-grow">{t('reasonForNoPermission')}</h3>
                                <button
                                    onClick={handleModalCancel}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">{t('reasonForNoPermissionExplanation')}</p>
                            
                            <div className="mb-4">
                                <InputLabel htmlFor="no_permission_reason" value={t('reason')} className="font-medium" />
                                <TextArea
                                    id="no_permission_reason"
                                    name="no_permission_reason"
                                    value={data.no_permission_reason}
                                    className="mt-1 w-full border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                                    onChange={(e) => setData('no_permission_reason', e.target.value)}
                                    required
                                    rows={3}
                                />
                            </div>
                            
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleModalCancel}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReasonSubmit}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    {t('submit')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Emergency Modal */}
            {showEmergencyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div 
                        ref={emergencyModalRef}
                        className="draggable-modal"
                        style={{
                            transform: `translate(${emergencyModalPosition.x}px, ${emergencyModalPosition.y}px)`,
                            transition: isDraggingEmergency ? 'none' : 'transform 0.1s ease-out',
                            cursor: isDraggingEmergency ? 'grabbing' : 'auto',
                        }}
                        onMouseDown={handleEmergencyMouseDown}
                    >
                        <div className="p-6">
                            <div className="modal-header">
                                <h3 className="text-lg font-bold text-red-600 flex-grow">{t('emergencyContact')}</h3>
                                <button
                                    onClick={handleEmergencyCancel}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                {t('emergencyInstructions')}
                            </p>
                            <p className="text-base font-bold mb-6 text-center">
                                {t('emergencyPhoneNumber')}: 213-531-9789
                            </p>
                            
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleEmergencyCancel}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleEmergencyConfirm}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    {t('continue')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </FormOnlyLayout>
    );
}