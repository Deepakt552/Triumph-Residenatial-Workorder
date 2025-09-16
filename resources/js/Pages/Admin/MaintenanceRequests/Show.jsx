import { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import TextArea from '@/Components/TextArea';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function Show({ request, auth }) {
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [showResendModal, setShowResendModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPropertyModal, setShowPropertyModal] = useState(false);
    const [animate, setAnimate] = useState(false);
    const [showPdfDropdown, setShowPdfDropdown] = useState(false);
    const [properties, setProperties] = useState([]);
    const [loadingProperties, setLoadingProperties] = useState(false);
    const pdfDropdownRef = useRef(null);
    
    useEffect(() => {
        // Trigger animation after component mounts
        setAnimate(true);
        
        // Load properties for the dropdown
        setLoadingProperties(true);
        axios.get(route('admin.properties.get'))
            .then(response => {
                if (Array.isArray(response.data)) {
                    setProperties(response.data);
                } else {
                    console.warn('Unexpected response format for properties:', response.data);
                    setProperties([]);
                }
                setLoadingProperties(false);
            })
            .catch(error => {
                console.error('Error fetching properties:', error);
                setLoadingProperties(false);
                setProperties([]);
            });
    }, []);
    
    // Add click outside handler for PDF dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (pdfDropdownRef.current && !pdfDropdownRef.current.contains(event.target)) {
                setShowPdfDropdown(false);
            }
        }
        
        // Add event listener when dropdown is open
        if (showPdfDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        
        // Cleanup
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showPdfDropdown]);
    
    const { data, setData, post, processing, reset, errors } = useForm({
        message: '',
        notes: '',
        email: request.tenant_email,
        property_id: request.property_id || '',
    });

    const deleteForm = useForm({});

    // Check if user is super admin
    const isSuperAdmin = auth.user && auth.user.role === 'super_admin';

    const handleApprove = (e) => {
        e.preventDefault();
        
        console.log('Approve button clicked');
        
        // Get form data
        const message = data.message || '';
        const notes = data.notes || '';
        
        console.log('Approval data:', { message, notes });
        
        const loadingToast = toast.loading('Sending approval email to ' + request.tenant_email + '...');
        
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        
        // Use fetch API for direct API call
        fetch(route('admin.maintenance-requests.approve', request.id), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                notes: notes
            })
        })
        .then(response => {
            console.log('Approval response status:', response.status);
            
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Server error occurred');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Approval success response:', data);
            toast.dismiss(loadingToast);
            toast.success(data.message || 'Maintenance request approved and email sent successfully!', {
                duration: 5000,
                style: {
                    background: '#10B981',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                },
                iconTheme: {
                    primary: 'white',
                    secondary: '#10B981',
                },
            });
            setShowApproveModal(false);
            reset();
            // Reload the page to see the updated status
            setTimeout(() => {
                window.location.reload();
            }, 3000); // Increased from 2000 to 3000 ms
        })
        .catch(error => {
            console.log('Approval error:', error);
            toast.dismiss(loadingToast);
            toast.error(error.message || 'Failed to send approval email. Please try again.', {
                duration: 5000,
                style: {
                    background: '#EF4444',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                },
            });
        });
    };

    const handleReject = (e) => {
        e.preventDefault();
        
        console.log('Reject button clicked');
        
        // Check if message is empty for reject (server also validates this)
        if (!data.message || data.message.trim() === '') {
            toast.error('Please provide a reason for rejection.', {
                style: {
                    background: '#EF4444',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                },
            });
            return;
        }
        
        console.log('Reject validation passed with message:', data.message);
        
        const loadingToast = toast.loading('Sending rejection email to ' + request.tenant_email + '...');
        
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        
        // Use fetch API for direct API call
        fetch(route('admin.maintenance-requests.reject', request.id), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                message: data.message,
                notes: data.notes || ''
            })
        })
        .then(response => {
            console.log('Rejection response status:', response.status);
            
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Server error occurred');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Rejection success response:', data);
            toast.dismiss(loadingToast);
            toast.success(data.message || 'Maintenance request rejected and email sent successfully!', {
                duration: 5000,
                style: {
                    background: '#10B981',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                },
                iconTheme: {
                    primary: 'white',
                    secondary: '#10B981',
                },
            });
            setShowRejectModal(false);
            reset();
            // Reload the page to see the updated status
            setTimeout(() => {
                window.location.reload();
            }, 3000); // Increased from 2000 to 3000 ms
        })
        .catch(error => {
            console.log('Rejection error:', error);
            toast.dismiss(loadingToast);
            toast.error(error.message || 'Failed to send rejection email. Please try again.', {
                duration: 5000,
                style: {
                    background: '#EF4444',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                },
            });
        });
    };

    const handleResendPdf = (e) => {
        e.preventDefault();
        
        console.log('Resend PDF button clicked');
        
        // Check if email is empty
        if (!data.email || data.email.trim() === '') {
            toast.error('Please provide an email address.', {
                style: {
                    background: '#EF4444',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                },
            });
            return;
        }
        
        console.log('Resend PDF validation passed with email:', data.email);
        
        const loadingToast = toast.loading('Sending maintenance request PDF to ' + data.email + '...');
        
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        
        // Use fetch API for direct API call
        fetch(route('admin.maintenance-requests.resend-pdf', request.id), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: data.email,
                message: data.message || ''
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Server error occurred');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Resend PDF success response:', data);
            toast.dismiss(loadingToast);
            toast.success(data.message || 'Maintenance request PDF sent successfully!', {
                duration: 5000,
                style: {
                    background: '#10B981',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                },
                iconTheme: {
                    primary: 'white',
                    secondary: '#10B981',
                },
            });
            setShowResendModal(false);
            reset();
        })
        .catch(error => {
            console.log('Resend PDF error:', error);
            toast.dismiss(loadingToast);
            toast.error(error.message || 'Failed to send PDF. Please try again.', {
                duration: 5000,
                style: {
                    background: '#EF4444',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                },
            });
        });
    };

    const handleDelete = (e) => {
        e.preventDefault();
        
        const loadingToast = toast.loading('Deleting maintenance request...');
        
        deleteForm.delete(route('admin.maintenance-requests.destroy', request.id), {
            onSuccess: () => {
                toast.dismiss(loadingToast);
                toast.success('Maintenance request deleted successfully!', {
                    duration: 5000,
                    style: {
                        background: '#10B981',
                        color: 'white',
                        padding: '16px',
                        borderRadius: '8px',
                    },
                });
                // Redirect to maintenance requests list
                window.location.href = route('admin.maintenance-requests');
            },
            onError: (error) => {
                toast.dismiss(loadingToast);
                toast.error(error.message || 'Failed to delete maintenance request. Please try again.', {
                    duration: 5000,
                    style: {
                        background: '#EF4444',
                        color: 'white',
                        padding: '16px',
                        borderRadius: '8px',
                    },
                });
            }
        });
    };

    const handleAssignProperty = (e) => {
        e.preventDefault();
        
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        
        // Use fetch API for direct API call
        fetch(route('admin.maintenance-requests.update-property', request.id), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                property_id: data.property_id,
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Server error occurred');
                });
            }
            return response.json();
        })
        .then(data => {
            toast.success('Property assigned successfully!');
            setShowPropertyModal(false);
            // Reload the page to see the updated property
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        })
        .catch(error => {
            toast.error(error.message || 'Failed to assign property. Please try again.');
        });
    };

    return (
        <AdminLayout
            header="Maintenance Request Details"
        >
            <Head title="Maintenance Request Details" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Back button */}
                    <div className="mb-6 opacity-0 transition-all duration-500" style={{ 
                        opacity: animate ? 1 : 0,
                        transform: animate ? 'translateY(0)' : 'translateY(10px)'
                    }}>
                        <Link
                            href={route('admin.maintenance-requests')}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-primary-600 shadow-sm hover:bg-gray-50 hover:text-primary-500 transition-colors duration-150 border border-gray-200"
                        >
                            <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Back to Maintenance Requests
                        </Link>
                    </div>

                    {/* Request header with actions */}
                    <div className="mb-6 overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100 opacity-0 transition-all duration-500" style={{ 
                        opacity: animate ? 1 : 0,
                        transform: animate ? 'translateY(0)' : 'translateY(20px)',
                        transitionDelay: '100ms'
                    }}>
                        <div className="px-6 py-6 mb-20">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="flex items-center">
                                        <h3 className="text-xl font-medium text-gray-900">
                                            Tenant: {request.tenant_name}
                                        </h3>
                                        <StatusBadge status={request.status} />
                                        {request.selected_language && (
                                            <span className="ml-3 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 border border-blue-200">
                                                {request.selected_language === 'es' ? 'Spanish Form' : 'English Form'}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Submitted on {new Date(request.created_at).toLocaleDateString()}
                                    </p>
                                    {request.is_emergency && (
                                        <div className="mt-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 border border-red-200">
                                            <svg className="mr-1 h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            Emergency Request
                                        </div>
                                    )}
                                    {request.status === 'rejected' && request.rejection_reason && (
                                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                                            <h4 className="text-sm font-medium text-red-800">Rejection Reason:</h4>
                                            <p className="mt-1 text-sm text-red-700">{request.rejection_reason}</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
                                    <button 
                                        onClick={() => window.open(`${route('maintenance.form-pdf')}?id=${request.id}&lang=${request.selected_language || 'en'}`, '_blank')}
                                        className="inline-flex items-center px-4 py-3 text-sm font-medium rounded-md text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm transition-all duration-200"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        View PDF
                                    </button>
                                    
                                    <button
                                        type="button"
                                        onClick={() => setShowResendModal(true)}
                                        className="inline-flex items-center px-4 py-3 text-sm font-medium rounded-md text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm transition-all duration-200"
                                    >
                                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                        Resend PDF
                                    </button>
                                    
                                    {request.status === 'pending' && (
                                        <>
                                            <PrimaryButton
                                                onClick={() => setShowApproveModal(true)}
                                                className="inline-flex items-center px-4 py-3 text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-all duration-200"
                                            >
                                                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                Approve
                                            </PrimaryButton>
                                            
                                            <DangerButton
                                                onClick={() => setShowRejectModal(true)}
                                                className="inline-flex items-center px-4 py-3 text-sm font-medium rounded-md text-white bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 shadow-sm transition-all duration-200"
                                            >
                                                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                                Reject
                                            </DangerButton>
                                        </>
                                    )}
                                    
                                    {isSuperAdmin && (
                                        <DangerButton
                                            onClick={() => setShowDeleteModal(true)}
                                            className="inline-flex items-center px-4 py-3 text-sm font-medium rounded-md text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition-all duration-200"
                                        >
                                            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            Delete
                                        </DangerButton>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Request details */}
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100 opacity-0 transition-all duration-500" style={{ 
                        opacity: animate ? 1 : 0,
                        transform: animate ? 'translateY(0)' : 'translateY(20px)',
                        transitionDelay: '200ms'
                    }}>
                        <div className="px-6 py-6">
                            <div className="border-b border-gray-200 pb-4">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Request Information</h3>
                                <p className="mt-1 text-sm text-gray-500">Details about the maintenance request and tenant information</p>
                            </div>
                            
                            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="col-span-1 rounded-lg bg-primary-50 p-5 hover:shadow transition-shadow duration-300">
                                    <h4 className="text-sm font-medium uppercase tracking-wide text-primary-800">Tenant Information</h4>
                                    <div className="mt-3 space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Name</label>
                                            <div className="mt-1 text-sm font-medium text-gray-900">{request.tenant_name}</div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Email</label>
                                            <div className="mt-1 text-sm text-gray-900">{request.tenant_email}</div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Phone</label>
                                            <div className="mt-1 text-sm text-gray-900">{request.tenant_phone}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="col-span-1 rounded-lg bg-primary-50 p-5 hover:shadow transition-shadow duration-300">
                                    <h4 className="text-sm font-medium uppercase tracking-wide text-primary-800">Property Information</h4>
                                    <div className="mt-3 space-y-3">
                                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                                            <dt className="text-sm font-medium text-gray-500">Building</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                {request.building_name}
                                            </dd>
                                        </div>
                                        
                                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                                            <dt className="text-sm font-medium text-gray-500">Property</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                {request.property && request.property.name
                                                    ? request.property.name
                                                    : (
                                                        // Try to find property name from properties array using property_id
                                                        properties.find(p => String(p.id) === String(request.property_id))?.name || 'Not assigned'
                                                    )
                                                }
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPropertyModal(true)}
                                                    className="ml-2 text-primary-600 hover:text-primary-900"
                                                >
                                                    {request.property ? 'Change' : 'Assign'} Property
                                                </button>
                                            </dd>
                                        </div>
                                        
                                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                                            <dt className="text-sm font-medium text-gray-500">Unit</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                {request.unit_number}
                                            </dd>
                                        </div>
                                        
                                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                                            <dt className="text-sm font-medium text-gray-500">Address</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                <div>{request.property_address}</div>
                                                <div>{request.city}, {request.state} {request.zip_code}</div>
                                            </dd>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="col-span-1 rounded-lg bg-primary-50 p-5 hover:shadow transition-shadow duration-300">
                                    <h4 className="text-sm font-medium uppercase tracking-wide text-primary-800">Schedule Information</h4>
                                    <div className="mt-3 space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Preferred Date</label>
                                            <div className="mt-1 text-sm font-medium text-gray-900">{request.scheduled_date}</div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Preferred Time</label>
                                            <div className="mt-1 text-sm text-gray-900">{request.scheduled_time}</div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Permission to Enter</label>
                                            <div className="mt-1 text-sm text-gray-900">{request.permission_to_enter ? 'Yes' : 'No'}</div>
                                            {!request.permission_to_enter && request.no_permission_reason && (
                                                <div className="mt-2 text-xs text-gray-500">
                                                    Reason: {request.no_permission_reason}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 rounded-lg bg-gray-50 p-5 hover:shadow transition-shadow duration-300">
                                <h4 className="text-sm font-medium uppercase tracking-wide text-gray-700">Work Request Details</h4>
                                <div className="mt-3">
                                    <label className="block text-xs font-medium text-gray-500">Work Requested</label>
                                    <div className="mt-2 whitespace-pre-wrap rounded-md bg-white p-4 text-sm text-gray-900 border border-gray-200">{request.work_requested}</div>
                                </div>
                                
                                {request.special_instructions && (
                                    <div className="mt-4">
                                        <label className="block text-xs font-medium text-gray-500">Special Instructions</label>
                                        <div className="mt-2 whitespace-pre-wrap rounded-md bg-white p-4 text-sm text-gray-900 border border-gray-200">{request.special_instructions}</div>
                                    </div>
                                )}
                            </div>

                            {/* Property Images */}
                            {request.property_images && (
                                <div className="mt-6 rounded-lg bg-gray-50 p-5 hover:shadow transition-shadow duration-300">
                                    <h4 className="text-sm font-medium uppercase tracking-wide text-gray-700">Property Images</h4>
                                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {Array.isArray(request.property_images) ? (
                                            request.property_images.map((image, index) => (
                                                <div key={index} className="relative">
                                                    <a 
                                                        href={`/storage/${image.replace(/^\/storage\//, '')}`}
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="block"
                                                    >
                                                        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                                                            <img 
                                                                src={`/storage/${image.replace(/^\/storage\//, '')}`}
                                                                alt={`Property image ${index + 1}`}
                                                                className="h-full w-full object-cover object-center"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    console.error("Failed to load image:", image);
                                                                    // Use a data URI for the placeholder instead of a file path
                                                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Cpath d='M30,40 L70,40 L70,70 L30,70 Z' fill='none' stroke='%23d1d5db' stroke-width='2'/%3E%3Cpath d='M40,50 C42.5,50 44.5,47.5 44.5,45 C44.5,42.5 42.5,40 40,40 C37.5,40 35,42.5 35,45 C35,47.5 37.5,50 40,50 Z' fill='%23d1d5db'/%3E%3Cpath d='M30,70 L50,50 L60,60 L70,50 L70,70 Z' fill='none' stroke='%23d1d5db' stroke-width='2'/%3E%3C/svg%3E";
                                                                }}
                                                            />
                                                        </div>
                                                        <p className="mt-1 text-xs text-center text-gray-500">Click to view</p>
                                                    </a>
                                                </div>
                                            ))
                                        ) : (
                                            // Try to parse the JSON string if it's not already an array
                                            typeof request.property_images === 'string' && request.property_images.length > 0 ? (
                                                (() => {
                                                    try {
                                                        const images = JSON.parse(request.property_images);
                                                        return Array.isArray(images) ? images.map((image, index) => (
                                                            <div key={index} className="relative">
                                                                <a 
                                                                    href={`/storage/${image.replace(/^\/storage\//, '')}`}
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="block"
                                                                >
                                                                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                                                                        <img 
                                                                            src={`/storage/${image.replace(/^\/storage\//, '')}`}
                                                                            alt={`Property image ${index + 1}`}
                                                                            className="h-full w-full object-cover object-center"
                                                                            onError={(e) => {
                                                                                e.target.onerror = null;
                                                                                console.error("Failed to load image:", image);
                                                                                // Use a data URI for the placeholder instead of a file path
                                                                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Cpath d='M30,40 L70,40 L70,70 L30,70 Z' fill='none' stroke='%23d1d5db' stroke-width='2'/%3E%3Cpath d='M40,50 C42.5,50 44.5,47.5 44.5,45 C44.5,42.5 42.5,40 40,40 C37.5,40 35,42.5 35,45 C35,47.5 37.5,50 40,50 Z' fill='%23d1d5db'/%3E%3Cpath d='M30,70 L50,50 L60,60 L70,50 L70,70 Z' fill='none' stroke='%23d1d5db' stroke-width='2'/%3E%3C/svg%3E";
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <p className="mt-1 text-xs text-center text-gray-500">Click to view</p>
                                                                </a>
                                                            </div>
                                                        )) : (
                                                            <div className="col-span-full flex justify-center items-center p-6">
                                                                <div className="text-center">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                    <p className="mt-2 text-gray-500">No images available</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    } catch (e) {
                                                        console.error("Error parsing property_images JSON:", e);
                                                        return (
                                                            <div className="col-span-full flex justify-center items-center p-6">
                                                                <div className="text-center">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                                    </svg>
                                                                    <p className="mt-2 text-gray-500">Error loading images</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                })()
                                            ) : (
                                                <div className="col-span-full flex justify-center items-center p-6">
                                                    <div className="text-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <p className="mt-2 text-gray-500">No images available</p>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Approve Modal */}
            <Modal show={showApproveModal} onClose={() => setShowApproveModal(false)}>
                <form onSubmit={handleApprove} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Approve Maintenance Request
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Send an approval notification to the tenant for this maintenance request.
                    </p>
                    
                    <div className="mt-6">
                        <InputLabel htmlFor="message" value="Message (Optional)" />
                        <TextArea
                            id="message"
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            className="mt-1 block w-full focus:border-primary-500 focus:ring-primary-500"
                            placeholder="Add an optional message to include in the approval email."
                            rows={4}
                        />
                    </div>
                    
                    <div className="mt-6">
                        <InputLabel htmlFor="notes" value="Admin Notes (Not Visible to Tenant)" />
                        <TextArea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="mt-1 block w-full focus:border-primary-500 focus:ring-primary-500"
                            placeholder="Add optional internal notes about this approval."
                            rows={3}
                        />
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowApproveModal(false)} className="mr-3">
                            Cancel
                        </SecondaryButton>
                        
                        <PrimaryButton type="submit" disabled={processing}>
                            Approve Request
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
            
            {/* Reject Modal */}
            <Modal show={showRejectModal} onClose={() => setShowRejectModal(false)}>
                <form onSubmit={handleReject} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Reject Maintenance Request
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Send a rejection notification to the tenant for this maintenance request.
                    </p>
                    
                    <div className="mt-6">
                        <InputLabel htmlFor="message" value="Reason for Rejection (Required)" />
                        <TextArea
                            id="message"
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            className="mt-1 block w-full focus:border-primary-500 focus:ring-primary-500"
                            placeholder="Provide a reason for rejecting this maintenance request."
                            required
                            rows={4}
                        />
                        {errors.message && <div className="text-sm text-accent-600 mt-1">{errors.message}</div>}
                    </div>
                    
                    <div className="mt-6">
                        <InputLabel htmlFor="notes" value="Admin Notes (Not Visible to Tenant)" />
                        <TextArea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="mt-1 block w-full focus:border-primary-500 focus:ring-primary-500"
                            placeholder="Add optional internal notes about this rejection."
                            rows={3}
                        />
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowRejectModal(false)} className="mr-3">
                            Cancel
                        </SecondaryButton>
                        
                        <DangerButton type="submit" disabled={processing}>
                            Reject Request
                        </DangerButton>
                    </div>
                </form>
            </Modal>
            
            {/* Resend PDF Modal */}
            <Modal show={showResendModal} onClose={() => setShowResendModal(false)}>
                <form onSubmit={handleResendPdf} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Resend Maintenance Request PDF
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Send the maintenance request PDF to a specified email address.
                    </p>
                    
                    <div className="mt-6">
                        <InputLabel htmlFor="email" value="Email Address" />
                        <TextInput
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="mt-1 block w-full focus:border-primary-500 focus:ring-primary-500"
                            placeholder="Enter email address"
                            required
                        />
                        {errors.email && <div className="text-sm text-accent-600 mt-1">{errors.email}</div>}
                    </div>
                    
                    <div className="mt-6">
                        <InputLabel htmlFor="message" value="Message (Optional)" />
                        <TextArea
                            id="message"
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            className="mt-1 block w-full focus:border-primary-500 focus:ring-primary-500"
                            placeholder="Add an optional message to include in the email."
                            rows={4}
                        />
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowResendModal(false)} className="mr-3">
                            Cancel
                        </SecondaryButton>
                        
                        <PrimaryButton type="submit" disabled={processing}>
                            Send PDF
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
            
            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <form onSubmit={handleDelete} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Delete Maintenance Request
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Are you sure you want to delete this maintenance request? This action cannot be undone.
                    </p>
                    
                    <div className="mt-4 rounded-md bg-gray-50 p-4">
                        <p className="text-sm font-medium text-gray-700">Request Details:</p>
                        <ul className="mt-2 text-sm text-gray-600">
                            <li>Tenant: {request.tenant_name}</li>
                            <li>Building: {request.building_name}</li>
                            <li>Unit: {request.unit_number}</li>
                            <li>Date: {new Date(request.created_at).toLocaleDateString()}</li>
                            <li>Status: {request.status.charAt(0).toUpperCase() + request.status.slice(1)}</li>
                        </ul>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)} className="mr-3">
                            Cancel
                        </SecondaryButton>
                        
                        <DangerButton type="submit" disabled={deleteForm.processing}>
                            {deleteForm.processing ? 'Deleting...' : 'Delete Request'}
                        </DangerButton>
                    </div>
                </form>
            </Modal>

            {/* Property Assignment Modal */}
            <Modal show={showPropertyModal} onClose={() => setShowPropertyModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        {request.property ? 'Change Property' : 'Assign Property'}
                    </h2>
                    <form onSubmit={handleAssignProperty} className="mt-4">
                        <div>
                            <label htmlFor="property_id" className="block text-sm font-medium text-gray-700">
                                Select Property
                            </label>
                            <select
                                id="property_id"
                                name="property_id"
                                value={data.property_id}
                                onChange={(e) => setData('property_id', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                disabled={loadingProperties}
                                required
                            >
                                <option value="">Select a property</option>
                                {properties.map((property) => (
                                    <option key={property.id} value={property.id}>
                                        {property.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-6 flex justify-end space-x-4">
                            <SecondaryButton type="button" onClick={() => setShowPropertyModal(false)}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={processing || !data.property_id}>
                                {processing ? 'Saving...' : 'Save'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AdminLayout>
    );
}

// Status Badge Component
function StatusBadge({ status }) {
    let bgColor = '';
    let textColor = '';
    
    switch (status) {
        case 'pending':
            bgColor = 'bg-accent-100';
            textColor = 'text-accent-800';
            break;
        case 'approved':
            bgColor = 'bg-green-100';
            textColor = 'text-green-800';
            break;
        case 'rejected':
            bgColor = 'bg-red-100';
            textColor = 'text-red-800';
            break;
        default:
            bgColor = 'bg-gray-100';
            textColor = 'text-gray-800';
    }
    
    return (
        <span className={`ml-3 inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium ${bgColor} ${textColor}`}>
            {status === 'pending' && (
                <svg className="-ml-1 mr-1.5 h-2 w-2 text-accent-500" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                </svg>
            )}
            {status === 'approved' && (
                <svg className="-ml-1 mr-1.5 h-2 w-2 text-green-500" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                </svg>
            )}
            {status === 'rejected' && (
                <svg className="-ml-1 mr-1.5 h-2 w-2 text-red-500" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                </svg>
            )}
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}