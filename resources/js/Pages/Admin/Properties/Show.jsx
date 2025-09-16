import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';

export default function Show({ property, buildings, maintenanceRequests, auth }) {
    const [animate, setAnimate] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    useEffect(() => {
        // Trigger animation after component mounts
        setAnimate(true);
    }, []);
    
    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    
    return (
        <AdminLayout
            header={`Property: ${property.name}`}
        >
            <Head title={`Property: ${property.name}`} />
            
            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Page header */}
                    <div className="mb-8 rounded-lg bg-gradient-to-r from-primary-700 to-primary-600 p-6 shadow-lg transition-all duration-500" style={{ 
                        opacity: animate ? 1 : 0,
                        transform: animate ? 'translateY(0)' : 'translateY(20px)'
                    }}>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-2xl font-medium text-white">{property.name}</h1>
                                <p className="mt-1 text-sm text-primary-100">
                                    {property.address}, {property.city}, {property.state} {property.zip_code}
                                </p>
                            </div>
                            <div className="mt-4 flex space-x-3 md:mt-0">
                                <Link
                                    href={route('admin.properties.index')}
                                    className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-primary-700 shadow-sm hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 transition-colors duration-150"
                                >
                                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back to Properties
                                </Link>
                                <Link
                                    href={route('admin.properties.edit', property.id)}
                                    className="inline-flex items-center rounded-md bg-primary-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 transition-colors duration-150"
                                >
                                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Property
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Property Details */}
                    <div className="overflow-hidden rounded-lg bg-white shadow transition-all duration-500" style={{ 
                        opacity: animate ? 1 : 0,
                        transform: animate ? 'translateY(0)' : 'translateY(20px)',
                        transitionDelay: '100ms'
                    }}>
                        <div className="px-4 py-5 sm:p-6">
                            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div className="col-span-1 sm:col-span-2">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">Property Details</h3>
                                    <div className="mt-4 border-t border-gray-200 pt-4">
                                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Name</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{property.name}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Status</dt>
                                                <dd className="mt-1 text-sm">
                                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                        property.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {property.active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Address</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{property.address}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">City, State ZIP</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{property.city}, {property.state} {property.zip_code}</dd>
                                            </div>
                                            <div className="col-span-1 sm:col-span-2">
                                                <dt className="text-sm font-medium text-gray-500">Description</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{property.description || 'No description provided.'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Created</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{formatDate(property.created_at)}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{formatDate(property.updated_at)}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Buildings */}
                    <div className="mt-8 overflow-hidden rounded-lg bg-white shadow transition-all duration-500" style={{ 
                        opacity: animate ? 1 : 0,
                        transform: animate ? 'translateY(0)' : 'translateY(20px)',
                        transitionDelay: '150ms'
                    }}>
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Buildings</h3>
                                <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">
                                    {buildings.length} {buildings.length === 1 ? 'Building' : 'Buildings'}
                                </span>
                            </div>
                            
                            <div className="mt-4">
                                {buildings.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        Building Name
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        Address
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        Units
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        Created
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {buildings.map((building) => (
                                                    <tr key={building.id} className="hover:bg-gray-50">
                                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                            {building.name}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                            {building.address}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                            {building.units_count || 0}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                            {formatDate(building.created_at)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="rounded-md bg-gray-50 p-4 text-center">
                                        <p className="text-sm text-gray-500">No buildings associated with this property yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Maintenance Requests */}
                    <div className="mt-8 overflow-hidden rounded-lg bg-white shadow transition-all duration-500" style={{ 
                        opacity: animate ? 1 : 0,
                        transform: animate ? 'translateY(0)' : 'translateY(20px)',
                        transitionDelay: '200ms'
                    }}>
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Maintenance Requests</h3>
                                <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">
                                    {maintenanceRequests.length} {maintenanceRequests.length === 1 ? 'Request' : 'Requests'}
                                </span>
                            </div>
                            
                            <div className="mt-4">
                                {maintenanceRequests.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        ID
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        Tenant
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        Unit
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        Status
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        Created
                                                    </th>
                                                    <th scope="col" className="relative px-6 py-3">
                                                        <span className="sr-only">Actions</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {maintenanceRequests.map((request) => (
                                                    <tr key={request.id} className="hover:bg-gray-50">
                                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                            #{request.id}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                            {request.tenant_name}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                            {request.unit?.unit_number || 'N/A'}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                                request.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {request.status?.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                            {formatDate(request.created_at)}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                            <Link
                                                                href={route('admin.maintenance-requests.show', request.id)}
                                                                className="text-primary-600 hover:text-primary-900"
                                                            >
                                                                View
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="rounded-md bg-gray-50 p-4 text-center">
                                        <p className="text-sm text-gray-500">No maintenance requests associated with this property yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Delete Section */}
                    <div className="mt-8 overflow-hidden rounded-lg bg-white shadow transition-all duration-500" style={{ 
                        opacity: animate ? 1 : 0,
                        transform: animate ? 'translateY(0)' : 'translateY(20px)',
                        transitionDelay: '250ms'
                    }}>
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg font-medium leading-6 text-red-800">Danger Zone</h3>
                            <div className="mt-2 max-w-xl text-sm text-gray-500">
                                <p>Once deleted, all data associated with this property will be permanently removed.</p>
                            </div>
                            <div className="mt-5">
                                <DangerButton
                                    onClick={() => setShowDeleteModal(true)}
                                >
                                    Delete Property
                                </DangerButton>
                            </div>
                        </div>
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
                        <Link
                            href={route('admin.properties.destroy', property.id)}
                            method="delete"
                            as="button"
                            className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 focus:bg-red-700 active:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            Delete Property
                        </Link>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
} 