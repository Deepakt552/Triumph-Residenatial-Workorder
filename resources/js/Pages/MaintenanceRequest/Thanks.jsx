import { Head, Link } from '@inertiajs/react';
import FormOnlyLayout from '@/Layouts/FormOnlyLayout';
import { useEffect, useState } from 'react';
import { translations, getTranslation } from '@/utils/translations';
import axios from 'axios';

export default function Thanks(props) {
    const [showConfetti, setShowConfetti] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [language, setLanguage] = useState(props.language || 'en');
    const formData = props.formData || null;

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

        // Trigger confetti after a small delay
        setTimeout(() => {
            setShowConfetti(true);
        }, 600);

        // Cleanup confetti after some time
        const timer = setTimeout(() => {
            setShowConfetti(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, [props.language]);

    // Translation helper function
    const t = (key) => getTranslation(language, key);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        
        // Create a date object from the string
        const date = new Date(dateString);
        
        // Format the date using Los Angeles (Pacific) timezone
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Los_Angeles'
        }).format(date);
    };

    // Handle clearing cache and redirecting to the create page
    const handleClearCacheAndRedirect = async (e) => {
        e.preventDefault();
        
        try {
            // Clear browser sessionStorage
            sessionStorage.removeItem('maintenance_form_data');
            
            // Clear any other cached form data in sessionStorage
            Object.keys(sessionStorage).forEach(key => {
                if (key.startsWith('maintenance_form_')) {
                    sessionStorage.removeItem(key);
                }
            });
            
            // Clear server-side session
            await axios.get(route('maintenance.clear-session'));
            
            // Redirect to the form
            window.location.href = `${route('maintenance.create')}?lang=${language}`;
        } catch (error) {
            console.error('Error clearing cache:', error);
            // Redirect anyway even if there's an error
            window.location.href = `${route('maintenance.create')}?lang=${language}`;
        }
    };

    // Generate confetti elements
    const renderConfetti = () => {
        const confettiElements = [];
        const colors = ['#FFC700', '#FF0000', '#2E3191', '#41BBC7', '#9BC53D', '#F64C72'];
        
        for (let i = 0; i < 100; i++) {
            const left = Math.random() * 100;
            const width = Math.random() * 10 + 5;
            const height = Math.random() * 10 + 5;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const animationDuration = Math.random() * 3 + 2;
            const animationDelay = Math.random() * 0.5;
            
            confettiElements.push(
                <div 
                    key={i}
                    className="absolute"
                    style={{
                        left: `${left}%`,
                        top: '-10px',
                        width: `${width}px`,
                        height: `${height}px`,
                        backgroundColor: color,
                        borderRadius: '50%',
                        pointerEvents: 'none',
                        animation: `confetti ${animationDuration}s ease-in ${animationDelay}s forwards`,
                        opacity: 0,
                    }}
                />
            );
        }
        
        return confettiElements;
    };

    return (
        <FormOnlyLayout>
            <Head title={t('thankYou')}>
                <style>
                    {`
                        @keyframes fadeIn {
                            0% { opacity: 0; transform: translateY(20px); }
                            100% { opacity: 1; transform: translateY(0); }
                        }
                        
                        @keyframes bounce {
                            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                            40% { transform: translateY(-20px); }
                            60% { transform: translateY(-10px); }
                        }
                        
                        @keyframes rotate {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        
                        @keyframes pulse {
                            0% { transform: scale(1); }
                            50% { transform: scale(1.1); }
                            100% { transform: scale(1); }
                        }
                        
                        @keyframes confetti {
                            0% { opacity: 1; transform: translateY(0); }
                            100% { opacity: 0; transform: translateY(600px); }
                        }
                    `}
                </style>
            </Head>
            
            <div className="py-12 relative overflow-hidden">
                {showConfetti && renderConfetti()}
                
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-lg sm:rounded-lg transition-all duration-500 transform">
                        <div className="p-8 bg-white border-b border-gray-200">
                            <div className="text-center">
                                <div 
                                    className={`mb-8 transition-all duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                                    style={{ animation: loaded ? 'bounce 1s ease-in-out 1s' : 'none' }}
                                >
                                    <svg className="mx-auto h-24 w-24 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth="2" 
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            style={{ 
                                                strokeDasharray: 100,
                                                strokeDashoffset: loaded ? 0 : 100,
                                                transition: 'stroke-dashoffset 1s ease-in-out',
                                            }}
                                        ></path>
                                    </svg>
                                </div>
                                
                                <h2 
                                    className="text-3xl font-bold text-gray-800 mb-4 transition-all duration-500"
                                    style={{ 
                                        animation: loaded ? 'fadeIn 0.8s ease-out 0.3s forwards' : 'none',
                                        opacity: 0, 
                                    }}
                                >
                                    {t('thankYou')}
                                </h2>
                                
                                <p 
                                    className="text-xl text-gray-600 mb-8 transition-all duration-500"
                                    style={{ 
                                        animation: loaded ? 'fadeIn 0.8s ease-out 0.6s forwards' : 'none',
                                        opacity: 0, 
                                    }}
                                >
                                    {t('requestSubmittedSuccess')}
                                </p>
                                
                                <div 
                                    className="mb-8 transition-all duration-500"
                                    style={{ 
                                        animation: loaded ? 'fadeIn 0.8s ease-out 0.9s forwards' : 'none',
                                        opacity: 0, 
                                    }}
                                >
                                    <p className="text-gray-600">
                                        {t('confirmationEmailSent')}
                                    </p>
                                    <p className="text-gray-600 mt-2">
                                        {t('maintenanceTeamReview')}
                                    </p>
                                </div>
                                
                                {formData && (
                                    <div 
                                        className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-500"
                                        style={{ 
                                            animation: loaded ? 'fadeIn 0.8s ease-out 1.2s forwards' : 'none',
                                            opacity: 0, 
                                        }}
                                    >
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('requestDetails')}</h3>
                                        <div className="text-left text-sm">
                                            {/* <p className="mb-1"><span className="font-medium">{t('workOrderNumber')}:</span> {formData.work_order_number}</p> */}
                                            <p className="mb-1"><span className="font-medium">{t('submittedBy')}:</span> {formData.tenant_name}</p>
                                            <p className="mb-1"><span className="font-medium">{t('submittedOn')}:</span> {formatDate(formData.submission_time)}</p>
                                            {/* <p className="mb-1"><span className="font-medium">{t('validUntil')}:</span> {formatDate(formData.expires_at)}</p> */}
                                        </div>
                                        
                                        <div className="mt-4">
                                            <a 
                                                href={`${route('maintenance.form-pdf')}?id=${formData.request_id}&lang=${language}`}
                                                target="_blank"
                                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                rel="noopener noreferrer"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                                {t('viewPdf')}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                
                                {/* <div 
                                    className="mt-10 transition-all duration-500"
                                    style={{ 
                                        animation: loaded ? 'fadeIn 0.8s ease-out 1.2s forwards, pulse 2s infinite 2s' : 'none',
                                        opacity: 0, 
                                    }}
                                >
                                    <a
                                        href={`${route('maintenance.create')}?lang=${language}`}
                                        className="inline-flex items-center px-6 py-3 bg-indigo-600 border border-transparent rounded-md font-semibold text-sm text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition ease-in-out duration-150 shadow-lg hover:shadow-xl"
                                        onClick={handleClearCacheAndRedirect}
                                    >
                                        {t('submitAnotherRequest')}
                                    </a>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FormOnlyLayout>
    );
} 