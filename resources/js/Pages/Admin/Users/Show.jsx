import { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { motion } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';

export default function Show({ user }) {
    const [animate, setAnimate] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const pdfRef = useRef();
    
    const { delete: destroy, processing } = useForm();
    
    useEffect(() => {
        // Trigger animation after component mounts
        setAnimate(true);
    }, []);
    
    const confirmDelete = () => {
        setIsDeleteModalOpen(true);
    };
    
    const handleDelete = () => {
        destroy(route('admin.users.destroy', user.id), {
            onSuccess: () => {
                toast.success('User deleted successfully');
                setIsDeleteModalOpen(false);
            },
        });
    };
    
    // Handle PDF generation
    const handlePrint = useReactToPrint({
        content: () => pdfRef.current,
        documentTitle: `User_${user.id}_${user.name}`,
        onBeforeGetContent: () => {
            return new Promise((resolve) => {
                toast.loading('Preparing PDF...');
                resolve();
            });
        },
        onAfterPrint: () => {
            toast.dismiss();
            toast.success('PDF generated successfully!');
        },
    });
    
    return (
        <AdminLayout
            header="User Details"
        >
            <Head title={`User: ${user.name}`} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Page header */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: animate ? 1 : 0, y: animate ? 0 : 20 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8 rounded-lg bg-gradient-to-r from-[#303b6a] to-[#272f52] p-6 shadow-lg"
                    >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-2xl font-medium text-white">User Details</h1>
                                <p className="mt-1 text-sm text-gray-200">
                                    View detailed information about this user
                                </p>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-3 md:mt-0">
                                <Link
                                    href={route('admin.users.edit', user.id)}
                                    className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-[#303b6a] shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#303b6a] transition-colors duration-150"
                                >
                                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit User
                                </Link>
                                <button
                                    onClick={handlePrint}
                                    className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-[#303b6a] shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#303b6a] transition-colors duration-150"
                                >
                                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    Export PDF
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-150"
                                >
                                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete User
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* User details content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: animate ? 1 : 0, y: animate ? 0 : 20 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100"
                        ref={pdfRef}
                    >
                        {/* User Profile Header */}
                        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6">
                            <div className="flex flex-col md:flex-row md:items-center">
                                <div className="flex items-center">
                                    <div className="h-24 w-24 flex-shrink-0 rounded-full bg-gradient-to-r from-[#303b6a] to-[#272f52] flex items-center justify-center">
                                        <span className="text-white text-3xl font-medium">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="ml-6">
                                        <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                                        <p className="text-lg text-gray-600">{user.email}</p>
                                        <div className="mt-2 flex items-center">
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800">
                                                <svg className="-ml-1 mr-1.5 h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 8 8">
                                                    <circle cx="4" cy="4" r="3" />
                                                </svg>
                                                Active
                                            </span>
                                            <span className="ml-4 text-sm text-gray-500">
                                                User ID: #{user.id}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex flex-grow justify-end md:mt-0">
                                    <div className="rounded-md bg-gray-50 p-4 shadow-sm border border-gray-200">
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-black">Account Created</p>
                                            <p className="mt-1 text-xl font-medium text-gray-900">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(user.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* User Information */}
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-black mb-4 border-b pb-2">Account Information</h3>
                            
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <dl className="space-y-6">
                                        <div>
                                            <dt className="text-sm font-bold text-black">Full Name</dt>
                                            <dd className="mt-1 text-lg text-gray-900">{user.name}</dd>
                                        </div>
                                        
                                        <div>
                                            <dt className="text-sm font-bold text-black">Email Address</dt>
                                            <dd className="mt-1 text-lg text-gray-900">{user.email}</dd>
                                        </div>
                                        
                                        <div>
                                            <dt className="text-sm font-bold text-black">Email Verified</dt>
                                            <dd className="mt-1 text-lg text-gray-900">
                                                {user.email_verified_at 
                                                    ? `Yes, on ${new Date(user.email_verified_at).toLocaleDateString()}`
                                                    : 'Not verified'}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                                
                                <div>
                                    <dl className="space-y-6">
                                        <div>
                                            <dt className="text-sm font-bold text-black">User ID</dt>
                                            <dd className="mt-1 text-lg text-gray-900">#{user.id}</dd>
                                        </div>
                                        
                                        <div>
                                            <dt className="text-sm font-bold text-black">Account Created</dt>
                                            <dd className="mt-1 text-lg text-gray-900">
                                                {new Date(user.created_at).toLocaleDateString()} at {new Date(user.created_at).toLocaleTimeString()}
                                            </dd>
                                        </div>
                                        
                                        <div>
                                            <dt className="text-sm font-bold text-black">Last Updated</dt>
                                            <dd className="mt-1 text-lg text-gray-900">
                                                {new Date(user.updated_at).toLocaleDateString()} at {new Date(user.updated_at).toLocaleTimeString()}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                            
                            {/* System Notes - Would be visible in app but hidden in PDF */}
                            <div className="mt-8 print:hidden">
                                <h3 className="text-lg font-bold text-black mb-4 border-b pb-2">System Notes</h3>
                                <div className="rounded-md bg-yellow-50 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-yellow-800">Password Information</h3>
                                            <div className="mt-2 text-sm text-yellow-700">
                                                <p>
                                                    For security reasons, user passwords are hashed and cannot be viewed. 
                                                    To change a password, use the Edit User page.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Footer for PDF version only */}
                        <div className="hidden print:block bg-gray-50 p-4 text-center text-sm text-gray-500 border-t">
                            <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                            <p>Maintenance Request System - User Information Report</p>
                        </div>
                    </motion.div>
                    
                    {/* Action buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: animate ? 1 : 0, y: animate ? 0 : 20 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-6 print:hidden"
                    >
                        <div className="flex justify-end space-x-3">
                            <Link
                                href={route('admin.users')}
                                className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Back to Users List
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        
                        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
                        
                        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">Delete User</h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to delete the user "{user.name}"? This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={processing}
                                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    {processing ? 'Deleting...' : 'Delete'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
} 