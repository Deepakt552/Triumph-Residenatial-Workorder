import { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Index({ users, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [animate, setAnimate] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    
    const { delete: destroy, processing } = useForm();
    
    useEffect(() => {
        // Trigger animation after component mounts
        setAnimate(true);
    }, []);
    
    const confirmDelete = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };
    
    const handleDelete = () => {
        destroy(route('admin.users.destroy', userToDelete.id), {
            onSuccess: () => {
                toast.success('User deleted successfully');
                setIsDeleteModalOpen(false);
            },
        });
    };
    
    return (
        <AdminLayout
            header="User Management"
        >
            <Head title="User Management" />

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
                                <h1 className="text-2xl font-medium text-white">User Management</h1>
                                <p className="mt-1 text-sm text-gray-200">
                                    Manage system users and their access
                                </p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <Link
                                    href={route('admin.users.create')}
                                    className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-[#303b6a] shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#303b6a] transition-colors duration-150"
                                >
                                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add New User
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Overview */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: animate ? 1 : 0, y: animate ? 0 : 20 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        <div className="rounded-lg bg-white p-5 shadow-sm hover:shadow transition-shadow duration-300 border border-gray-100">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-r from-[#303b6a] to-[#272f52] text-white shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-bold text-black">Total Users</dt>
                                        <dd className="text-2xl font-medium text-gray-900">{users.total}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        
                        <div className="rounded-lg bg-white p-5 shadow-sm hover:shadow transition-shadow duration-300 border border-gray-100">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-r from-[#f32d21] to-[#ff6b52] text-white shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-bold text-black">New This Month</dt>
                                        <dd className="text-2xl font-medium text-gray-900">
                                            {users.data.filter(u => {
                                                const createdDate = new Date(u.created_at);
                                                const now = new Date();
                                                return createdDate.getMonth() === now.getMonth() && 
                                                       createdDate.getFullYear() === now.getFullYear();
                                            }).length}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        
                        <div className="rounded-lg bg-white p-5 shadow-sm hover:shadow transition-shadow duration-300 border border-gray-100">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-bold text-black">Last Activity</dt>
                                        <dd className="text-base font-medium text-gray-900">
                                            {users.data.length > 0 ? new Date(users.data[0].updated_at).toLocaleDateString() : 'N/A'}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Search and filters */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: animate ? 1 : 0, y: animate ? 0 : 20 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                    >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="w-full md:w-1/2 lg:w-1/3">
                                <form>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            name="search"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search by name or email"
                                            className="block w-full rounded-md border-gray-300 pl-10 pr-10 focus:border-[#303b6a] focus:ring-[#303b6a] sm:text-sm"
                                        />
                                        {searchTerm && (
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setSearchTerm('')}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>

                    {/* Users table */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: animate ? 1 : 0, y: animate ? 0 : 20 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100"
                    >
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-black">
                                            ID
                                        </th>
                                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-black">
                                            Name
                                        </th>
                                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-black">
                                            Email
                                        </th>
                                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-black">
                                            Role
                                        </th>
                                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-black">
                                            Created Date
                                        </th>
                                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-black">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {users.data.length > 0 ? (
                                        users.data.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                    {user.id}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-[#303b6a] to-[#272f52] flex items-center justify-center">
                                                            <span className="text-white font-medium">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {user.email}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {user.role === 'super_admin' && (
                                                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 border border-purple-200">
                                                            Super Admin
                                                        </span>
                                                    )}
                                                    {user.role === 'admin' && (
                                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 border border-blue-200">
                                                            Admin
                                                        </span>
                                                    )}
                                                    {(!user.role || user.role === 'user') && (
                                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 border border-gray-200">
                                                            User
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                    <div className="flex space-x-3">
                                                        <Link
                                                            href={route('admin.users.edit', user.id)}
                                                            className="rounded-md bg-blue-50 px-2.5 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => confirmDelete(user)}
                                                            className="rounded-md bg-red-50 px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No users found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {users.data.length > 0 && (
                            <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
                                <Pagination links={users.links} />
                            </div>
                        )}
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
                                                Are you sure you want to delete the user "{userToDelete?.name}"? This action cannot be undone.
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