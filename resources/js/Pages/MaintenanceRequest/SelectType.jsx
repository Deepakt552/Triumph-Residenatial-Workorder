import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import FormOnlyLayout from '@/Layouts/FormOnlyLayout';
import { translations, getTranslation } from '@/utils/translations';
import Modal from '@/Components/Modal';

export default function SelectType(props) {
    const [language, setLanguage] = useState(props.language || 'en');
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const [loaded, setLoaded] = useState(false);
    
    // State for draggable modal
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const modalRef = useRef(null);
    
    // Reset modal position when modal is closed
    useEffect(() => {
        if (!showEmergencyModal) {
            setModalPosition({ x: 0, y: 0 });
        }
    }, [showEmergencyModal]);

    useEffect(() => {
        // First check URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        
        // Then check session storage
        const savedLang = sessionStorage.getItem('maintenance_form_language');
        
        // Set language with priority: URL param > props > session storage > default (en)
        if (urlLang && ['en', 'es'].includes(urlLang)) {
            setLanguage(urlLang);
            sessionStorage.setItem('maintenance_form_language', urlLang);
        } else if (props.language && ['en', 'es'].includes(props.language)) {
            setLanguage(props.language);
            sessionStorage.setItem('maintenance_form_language', props.language);
        } else if (savedLang && ['en', 'es'].includes(savedLang)) {
            setLanguage(savedLang);
        }

        // Start loading animation
        setTimeout(() => {
            setLoaded(true);
        }, 300);
    }, [props.language]);

    // Translation helper function
    const t = (key) => getTranslation(language, key);

    // Handle language change
    const handleLanguageChange = (e) => {
        const newLanguage = e.target.value;
        setLanguage(newLanguage);
        sessionStorage.setItem('maintenance_form_language', newLanguage);
    };

    // Navigate to regular maintenance form
    const goToRegularMaintenance = () => {
        // Store in sessionStorage that this is not an emergency
        sessionStorage.setItem('maintenance_form_is_emergency', 'false');
        // Redirect to maintenance request form
        window.location.href = `${route('maintenance.create')}?lang=${language}`;
    };

    // Close emergency modal and redirect to maintenance form
    const proceedWithEmergency = () => {
        setShowEmergencyModal(false);
        // Redirect to create route with the emergency flag
        window.location.href = `${route('maintenance.create')}?lang=${language}&emergency=true`;
    };
    
    // Mouse down handler for dragging
    const handleMouseDown = (e) => {
        if (modalRef.current && e.target.closest('.modal-header')) {
            setIsDragging(true);
            const rect = modalRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };
    
    // Mouse move handler for dragging
    const handleMouseMove = (e) => {
        if (isDragging) {
            setModalPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        }
    };
    
    // Mouse up handler to stop dragging
    const handleMouseUp = () => {
        setIsDragging(false);
    };
    
    // Add event listeners for mouse events
    useEffect(() => {
        if (showEmergencyModal) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [showEmergencyModal, isDragging, dragOffset]);

    return (
        <FormOnlyLayout>
            <Head title="Maintenance Request Type">
                <style>
                    {`
                        @keyframes fadeIn {
                            0% { opacity: 0; transform: translateY(20px); }
                            100% { opacity: 1; transform: translateY(0); }
                        }
                        
                        @keyframes pulse {
                            0% { transform: scale(1); }
                            50% { transform: scale(1.05); }
                            100% { transform: scale(1); }
                        }
                        
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
                        }
                    `}
                </style>
            </Head>
            
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-lg sm:rounded-lg">
                        <div className="p-8 bg-white border-b border-gray-200">
                            {/* Language Selector */}
                            {/* <div className="flex justify-end mb-6">
                                <select
                                    value={language}
                                    onChange={handleLanguageChange}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                >
                                    <option value="en">{t('english')}</option>
                                    <option value="es">{t('spanish')}</option>
                                </select>
                            </div> */}
                            
                            <div className="text-center">
                                <h2 
                                    className="text-3xl font-bold text-gray-800 mb-6 transition-all duration-500"
                                    style={{ 
                                        animation: loaded ? 'fadeIn 0.8s ease-out forwards' : 'none',
                                        opacity: 0
                                    }}
                                >
                                    {t('selectRequestType')}
                                </h2>
                                
                                <div 
                                    className="mb-6 transition-all duration-500"
                                    style={{ 
                                        animation: loaded ? 'fadeIn 0.8s ease-out 0.3s forwards' : 'none',
                                        opacity: 0
                                    }}
                                >
                                    <p className="text-lg text-gray-600">
                                        {t('selectRequestTypeDescription')}
                                    </p>
                                </div>
                                
                                <div 
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
                                    style={{ 
                                        animation: loaded ? 'fadeIn 0.8s ease-out 0.6s forwards' : 'none',
                                        opacity: 0
                                    }}
                                >
                                    {/* Regular Maintenance Option */}
                                    <div 
                                        className="p-6 border-2 border-indigo-200 rounded-lg bg-indigo-50 cursor-pointer hover:bg-indigo-100 hover:border-indigo-300 transition-all duration-300"
                                        onClick={goToRegularMaintenance}
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mb-4">
                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-bold text-indigo-800 mb-2">{t('regularMaintenance')}</h3>
                                            <p className="text-gray-600 text-center">{t('regularMaintenanceDescription')}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Emergency Maintenance Option */}
                                    <div 
                                        className="p-6 border-2 border-red-200 rounded-lg bg-red-50 cursor-pointer hover:bg-red-100 hover:border-red-300 transition-all duration-300"
                                        onClick={() => setShowEmergencyModal(true)}
                                        style={{ animation: 'pulse 2s infinite' }}
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-bold text-red-800 mb-2">{t('emergencyMaintenance')}</h3>
                                            <p className="text-gray-600 text-center">{t('emergencyMaintenanceDescription')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Draggable Emergency Modal */}
            {showEmergencyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
                    <div 
                        ref={modalRef}
                        className="draggable-modal"
                        style={{
                            transform: `translate(${modalPosition.x}px, ${modalPosition.y}px)`,
                            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                            cursor: isDragging ? 'grabbing' : 'auto',
                        }}
                        onMouseDown={handleMouseDown}
                    >
                        <div className="p-6">
                            <div className="flex items-center text-red-600 mb-4 modal-header">
                                <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <h3 className="text-xl font-bold flex-grow">{t('emergencyContact')}</h3>
                                <button
                                    onClick={() => setShowEmergencyModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="text-gray-700 mb-6">
                                <p className="mb-4">{t('emergencyInstructions')}</p>
                                
                                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                    <p className="font-bold mb-2">{t('emergencyPhoneNumber')}:</p>
                                    <a 
                                        href="tel:213-531-9789" 
                                        className="inline-flex items-center text-xl font-bold text-red-600 hover:text-red-800"
                                    >
                                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        213-797-0311 
                                    </a>
                                </div>
                            </div>
                            
                            <div className="flex justify-end">
                                <button
                                    className="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-sm text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-150"
                                    onClick={() => setShowEmergencyModal(false)}
                                >
                                    {t('close')}
                                </button>
                                
                              
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </FormOnlyLayout>
    );
} 