import React from 'react';
import { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import toast from 'react-hot-toast';

export default function Index({ properties, filters, auth }) {
    // Ensure filters object exists and has expected properties
    const safeFilters = filters || {};
    
    const [searchTerm, setSearchTerm] = useState(safeFilters.search || '');
    const [sortField, setSortField] = useState(safeFilters.sort_field || 'created_at');
    const [sortDirection, setSortDirection] = useState(safeFilters.sort_direction || 'desc');
    const [animate, setAnimate] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [propertyToDelete, setPropertyToDelete] = useState(null);
    
    const { delete: destroy, processing } = useForm();
    
    useEffect(() => {
        // Trigger animation after component mounts
        setAnimate(true);
    }, []);
    
    // Handle sort change
    const handleSort = (field) => {
        const direction = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(direction);
        
        applyFilters(field, direction);
    };
    
    // Extract the filter application logic to a reusable function
    const applyFilters = (field = sortField, direction = sortDirection) => {
        // Create a params object with only non-empty values
        const params = {};
        
        if (searchTerm) params.search = searchTerm;
        if (field) params.sort_field = field;
        if (direction) params.sort_direction = direction;
        
        // Preserve the current page if available
        if (safeFilters.page) {
            params.page = safeFilters.page;
        }
        
        // Navigate to the filtered route
        router.get(route('admin.properties.index'), params);
    };
    
    // Handle search and filter submission
    const handleFilterSubmit = (e) => {
        e.preventDefault();
        applyFilters();
    };
    
    // Handle clearing all filters
    const clearFilters = () => {
        setSearchTerm('');
        
        router.get(route('admin.properties.index'), {
            sort_field: sortField,
            sort_direction: sortDirection
        });
    };
    
    // Render sort indicator
    const renderSortIndicator = (field) => {
        if (sortField !== field) return null;
        
        return sortDirection === 'asc' ? (
            <svg className="ml-1 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414 6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
        ) : (
            <svg className="ml-1 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 15.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
        );
    };
    
    // Check if any filters are active
    const hasActiveFilters = searchTerm;
    
    // Handle delete confirmation
    const confirmDelete = (property) => {
        setPropertyToDelete(property);
        setShowDeleteModal(true);
    };
    
    // Handle delete
    const handleDelete = () => {
        destroy(route('admin.properties.destroy', propertyToDelete.id), {
            onSuccess: () => {
                toast.success('Property deleted successfully');
                setShowDeleteModal(false);
            },
            onError: (error) => {
                toast.error(error.message || 'Failed to delete property');
            }
        });
    };
    
    // Check if user is super admin
    const isSuperAdmin = auth.user && auth.user.role === 'super_admin';
    
    return (
        <AdminLayout
            header="Properties"
        >
            <Head title="Properties" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Page header */}
                    <div className="mb-8 rounded-lg bg-gradient-to-r from-primary-700 to-primary-600 p-6 shadow-lg transition-all duration-500" style={{ 
                        opacity: animate ? 1 : 0,
                        transform: animate ? 'translateY(0)' : 'translateY(20px)'
                    }}>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-2xl font-medium text-white">Properties</h1>
                                <p className="mt-1 text-sm text-primary-100">
                                    Manage all properties in the system
                                </p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <Link
                                    href={route('admin.properties.create')}
                                    className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-primary-700 shadow-sm hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 transition-colors duration-150"
                                >
                                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    New Property
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Search & Filters */}
                    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm transition-all duration-500" style={{ 
                        opacity: animate ? 1 : 0,
                        transform: animate ? 'translateY(0)' : 'translateY(20px)',
                        transitionDelay: '100ms'
                    }}>
                        <form onSubmit={handleFilterSubmit}>
                            <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-x-4 md:space-y-0">
                                <div className="flex-1">
                                    <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
                                    <input
                                        type="text"
                                        id="search"
                                        name="search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by name, address, or city..."
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    />
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                    >
                                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Search
                                    </button>
                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                        >
                                            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Properties Table */}
                    <div className="overflow-hidden rounded-lg bg-white shadow transition-all duration-500" style={{ 
                        opacity: animate ? 1 : 0,
                        transform: animate ? 'translateY(0)' : 'translateY(20px)',
                        transitionDelay: '150ms'
                    }}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center">
                                                <span>Property Name</span>
                                                {renderSortIndicator('name')}
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                                            onClick={() => handleSort('address')}
                                        >
                                            <div className="flex items-center">
                                                <span>Address</span>
                                                {renderSortIndicator('address')}
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                                            onClick={() => handleSort('city')}
                                        >
                                            <div className="flex items-center">
                                                <span>City</span>
                                                {renderSortIndicator('city')}
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                        >
                                            Status
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                                            onClick={() => handleSort('created_at')}
                                        >
                                            <div className="flex items-center">
                                                <span>Created</span>
                                                {renderSortIndicator('created_at')}
                                            </div>
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {properties && properties.data && properties.data.length > 0 ? (
                                        properties.data.map((property) => (
                                            <tr key={property.id} className="hover:bg-gray-50">
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                    <Link href={route('admin.properties.show', property.id)} className="text-primary-600 hover:text-primary-900">
                                                        {property.name}
                                                    </Link>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {property.address}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {property.city}, {property.state} {property.zip_code}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                        property.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {property.active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {new Date(property.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        <Link
                                                            href={route('admin.properties.edit', property.id)}
                                                            className="text-primary-600 hover:text-primary-900"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => confirmDelete(property)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No properties found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {properties && properties.links && (
                            <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
                                <Pagination links={properties.links} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Delete Property
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Are you sure you want to delete this property? This action cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end space-x-4">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={handleDelete} disabled={processing}>
                            {processing ? 'Deleting...' : 'Delete Property'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
} 