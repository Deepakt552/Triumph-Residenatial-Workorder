import { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function Index({ requests, filters, auth, buildings, stats }) {
    // Ensure filters object exists and has expected properties
    const safeFilters = filters || {};
    
    // Debug what's coming from the backend
    useEffect(() => {
        console.log('Filters received from backend:', safeFilters);
    }, [safeFilters]);
    
    const [searchTerm, setSearchTerm] = useState(safeFilters.search || '');
    const [startDate, setStartDate] = useState(safeFilters.start_date || '');
    const [endDate, setEndDate] = useState(safeFilters.end_date || '');
    const [buildingId, setBuildingId] = useState(safeFilters.building_id || '');
    const [unitId, setUnitId] = useState(safeFilters.unit_id || '');
    const [unitNumber, setUnitNumber] = useState(safeFilters.unit_number || '');
    const [propertyId, setPropertyId] = useState(safeFilters.property_id || '');
    const [units, setUnits] = useState([]);
    const [properties, setProperties] = useState([]);
    const [sortField, setSortField] = useState(safeFilters.sort_field || 'created_at');
    const [sortDirection, setSortDirection] = useState(safeFilters.sort_direction || 'desc');
    const [animate, setAnimate] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState(null);
    const [loadingUnits, setLoadingUnits] = useState(false);
    const [loadingProperties, setLoadingProperties] = useState(false);
    
    const { delete: destroy, processing } = useForm();
    
    useEffect(() => {
        // Trigger animation after component mounts
        setAnimate(true);
    }, []);
    
    // Fetch properties on component mount
    useEffect(() => {
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
                if (error.response && error.response.status !== 422) {
                    toast.error('Failed to load properties. Please try again later.');
                }
            });
    }, []);
    
    // Fetch buildings when property changes
    useEffect(() => {
        if (propertyId) {
            setBuildingId(''); // Reset building selection when property changes
            setUnitNumber(''); // Reset unit selection when property changes
            
            // Logic to fetch buildings for the selected property would go here
            // This would be similar to the existing building fetch logic
        }
    }, [propertyId]);
    
    // Fetch units when building changes
    useEffect(() => {
        if (buildingId) {
            setLoadingUnits(true);
            setUnitNumber(''); // Reset unit selection when building changes
            
            // Check if buildingId is numeric (from buildings table) or a string (building name)
            if (!isNaN(parseInt(buildingId))) {
                // Fetch units from the buildings table
                axios.post(route('maintenance.units'), { building_id: buildingId })
                    .then(response => {
                        if (Array.isArray(response.data)) {
                            setUnits(response.data);
                        } else {
                            console.warn('Unexpected response format for units:', response.data);
                            setUnits([]);
                        }
                        setLoadingUnits(false);
                    })
                    .catch(error => {
                        console.error('Error fetching units:', error);
                        setLoadingUnits(false);
                        setUnits([]);
                        // Only show toast for network errors, not for validation errors
                        if (error.response && error.response.status !== 422) {
                            toast.error('Failed to load units. Please try again later.');
                        }
                    });
            } else {
                // Fetch units from the maintenance requests table by building name
                axios.post(route('maintenance.units-by-name'), { building_name: buildingId })
                    .then(response => {
                        if (Array.isArray(response.data)) {
                            setUnits(response.data);
                        } else {
                            console.warn('Unexpected response format for units by name:', response.data);
                            setUnits([]);
                        }
                        setLoadingUnits(false);
                    })
                    .catch(error => {
                        console.error('Error fetching units by name:', error);
                        setLoadingUnits(false);
                        setUnits([]);
                    });
            }
        } else {
            setUnits([]);
            setUnitNumber('');
        }
    }, [buildingId]);
    
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
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        if (buildingId) params.building_id = buildingId;
        if (propertyId) params.property_id = propertyId;
        if (unitNumber) params.unit_number = unitNumber;
        if (field) params.sort_field = field;
        if (direction) params.sort_direction = direction;
        
        // If a status filter is active, preserve it
        if (safeFilters.status) {
            params.status = safeFilters.status;
        }
        
        // Preserve the current page if available
        if (safeFilters.page) {
            params.page = safeFilters.page;
        }
        
        console.log('Applying filters with params:', params);
        
        // Navigate to the filtered route
        router.get(route('admin.maintenance-requests'), params);
    };
    
    // Handle search and filter submission
    const handleFilterSubmit = (e) => {
        e.preventDefault();
        applyFilters();
    };
    
    // Handle clearing all filters
    const clearFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
        setBuildingId('');
        setPropertyId('');
        setUnitNumber('');
        setUnits([]);
        
        router.get(route('admin.maintenance-requests'), {
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
    const hasActiveFilters = searchTerm || startDate || endDate || buildingId || propertyId || safeFilters.status;
    
    // Handle delete confirmation
    const confirmDelete = (request) => {
        setRequestToDelete(request);
        setShowDeleteModal(true);
    };
    
    // Handle delete
    const handleDelete = () => {
        destroy(route('admin.maintenance-requests.destroy', requestToDelete.id), {
            onSuccess: () => {
                toast.success('Maintenance request deleted successfully');
                setShowDeleteModal(false);
            },
            onError: (error) => {
                toast.error(error.message || 'Failed to delete maintenance request');
            }
        });
    };
    
    // Check if user is super admin
    const isSuperAdmin = auth.user && auth.user.role === 'super_admin';
    
    return (
        <AdminLayout
            header="Maintenance Requests"
        >
            <Head title="Maintenance Requests" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Page header */}
                    <div className="mb-8 rounded-lg bg-gradient-to-r from-primary-700 to-primary-600 p-6 shadow-lg transition-all duration-500" style={{ 
                        opacity: animate ? 1 : 0,
                        transform: animate ? 'translateY(0)' : 'translateY(20px)'
                    }}>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-2xl font-medium text-white">Maintenance Requests</h1>
                                <p className="mt-1 text-sm text-primary-100">
                                    Manage and track all maintenance requests from tenants
                                </p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <Link
                                    href={route('maintenance.create')}
                                    className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-primary-700 shadow-sm hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 transition-colors duration-150"
                                >
                                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    New Request
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-500" style={{ 
                        opacity: animate ? 1 : 0,
                        transform: animate ? 'translateY(0)' : 'translateY(20px)',
                        transitionDelay: '50ms'
                    }}>
                        <div className="rounded-lg bg-white p-5 shadow-sm hover:shadow transition-shadow duration-300 border border-gray-100">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">All Requests</dt>
                                        <dd className="text-2xl font-medium text-gray-900">{stats.total}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        
                        <div className="rounded-lg bg-white p-5 shadow-sm hover:shadow transition-shadow duration-300 border border-gray-100">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">Pending</dt>
                                        <dd className="text-2xl font-medium text-gray-900">
                                            {stats.pending}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        
                        <div className="rounded-lg bg-white p-5 shadow-sm hover:shadow transition-shadow duration-300 border border-gray-100">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">Approved</dt>
                                        <dd className="text-2xl font-medium text-gray-900">
                                            {stats.approved}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        
                        <div className="rounded-lg bg-white p-5 shadow-sm hover:shadow transition-shadow duration-300 border border-gray-100">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">Rejected</dt>
                                        <dd className="text-2xl font-medium text-gray-900">
                                            {stats.rejected}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and filters */}
                    <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all duration-500" style={{ 
                        opacity: animate ? 1 : 0,
                        transform: animate ? 'translateY(0)' : 'translateY(20px)',
                        transitionDelay: '100ms'
                    }}>
                        <form onSubmit={handleFilterSubmit}>
                            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                <div className="w-full md:w-1/3">
                                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            id="search"
                                            name="search"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search by tenant, building, or unit"
                                            className="block w-full rounded-md border-gray-300 pl-10 pr-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
                                </div>
                                
                                <div className="w-full md:w-1/3">
                                    <label htmlFor="property" className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                                    <select
                                        id="property"
                                        name="property"
                                        value={propertyId}
                                        onChange={(e) => setPropertyId(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                        disabled={loadingProperties}
                                    >
                                        <option value="">All Properties</option>
                                        {properties.map((property) => (
                                            <option key={property.id} value={property.id}>
                                                {property.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="w-full md:w-1/3">
                                    <label htmlFor="building_id" className="block text-sm font-medium text-gray-700 mb-1">Building</label>
                                    <select
                                        id="building_id"
                                        name="building_id"
                                        value={buildingId}
                                        onChange={(e) => setBuildingId(e.target.value)}
                                        className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    >
                                        <option value="">All Buildings</option>
                                        {buildings && buildings.map((building) => (
                                            <option key={building.id} value={building.id}>
                                                {building.name}
                                                {building.from_requests ? " (From Requests)" : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="w-full md:w-1/3">
                                    <label htmlFor="unit_number" className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                    <select
                                        id="unit_number"
                                        name="unit_number"
                                        value={unitNumber}
                                        onChange={(e) => setUnitNumber(e.target.value)}
                                        className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                        disabled={loadingUnits || !buildingId}
                                    >
                                        <option value="">Select Unit</option>
                                        {loadingUnits ? (
                                            <option value="" disabled>Loading units...</option>
                                        ) : (
                                            units && units.map((unit) => (
                                                <option key={unit.id} value={unit.unit_number}>
                                                    {unit.unit_number}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    {!buildingId && (
                                        <p className="mt-1 text-xs text-gray-500"></p>
                                    )}
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-2/3">
                                    <div className="w-full sm:w-1/2">
                                        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            id="start_date"
                                            name="start_date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                        />
                                    </div>
                                    
                                    <div className="w-full sm:w-1/2">
                                        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            id="end_date"
                                            name="end_date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                        />
                                    </div>
                                    
                                    <div className="w-full sm:w-1/3 flex items-end space-x-2">
                                        <button
                                            type="submit"
                                            className="flex-1 inline-flex justify-center items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                            </svg>
                                            Apply
                                        </button>
                                        
                                        {hasActiveFilters && (
                                            <button
                                                type="button"
                                                onClick={clearFilters}
                                                className="inline-flex justify-center items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <StatusFilter currentStatus={safeFilters.status} />
                                
                                {/* Show active filters summary */}
                                {hasActiveFilters && (
                                    <div className="ml-auto text-sm text-gray-500">
                                        <span>Active filters: </span>
                                        {safeFilters.status && (
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 mr-1">
                                                Status: {safeFilters.status}
                                            </span>
                                        )}
                                        {buildingId && buildings && (
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 mr-1">
                                                Building: {buildings.find(b => b.id.toString() === buildingId.toString())?.name || buildingId}
                                            </span>
                                        )}
                                        {unitNumber && (
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 mr-1">
                                                Unit: {unitNumber}
                                            </span>
                                        )}
                                        {startDate && (
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 mr-1">
                                                From: {startDate}
                                            </span>
                                        )}
                                        {endDate && (
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 mr-1">
                                                To: {endDate}
                                            </span>
                                        )}
                                        {searchTerm && (
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                                Search: "{searchTerm}"
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Requests table */}
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100 transition-all duration-500" style={{ 
                        opacity: animate ? 1 : 0,
                        transform: animate ? 'translateY(0)' : 'translateY(20px)',
                        transitionDelay: '200ms'
                    }}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th 
                                            scope="col" 
                                            className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('tenant_name')}
                                        >
                                            <div className="flex items-center">
                                                Tenant
                                                {renderSortIndicator('tenant_name')}
                                            </div>
                                        </th>
                                        <th 
                                            scope="col" 
                                            className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('building_name')}
                                        >
                                            <div className="flex items-center">
                                                Building / Unit
                                                {renderSortIndicator('building_name')}
                                            </div>
                                        </th>
                                        <th 
                                            scope="col" 
                                            className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                        >
                                            Image
                                        </th>
                                        <th 
                                            scope="col" 
                                            className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('created_at')}
                                        >
                                            <div className="flex items-center">
                                                Date
                                                {renderSortIndicator('created_at')}
                                            </div>
                                        </th>
                                        <th 
                                            scope="col" 
                                            className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('status')}
                                        >
                                            <div className="flex items-center">
                                                Status
                                                {renderSortIndicator('status')}
                                            </div>
                                        </th>
                                        <th 
                                            scope="col" 
                                            className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                        >
                                            Email Status
                                        </th>
                                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {requests.data.length > 0 ? (
                                        requests.data.map((request, index) => (
                                            <tr 
                                                key={request.id}
                                                className="hover:bg-gray-50 transition-colors duration-150"
                                            >
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    <div className="font-medium text-gray-900">{request.tenant_name}</div>
                                                    <div className="text-xs text-gray-400">{request.tenant_email}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    <div>{request.building_name}</div>
                                                    <div className="text-xs text-gray-400">Unit: {request.unit_number}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {request.property_images ? (
                                                        (() => {
                                                            try {
                                                                if (Array.isArray(request.property_images)) {
                                                                    if (request.property_images.length > 0) {
                                                                        return (
                                                                            <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                                                                                <img 
                                                                                    src={`/storage/${request.property_images[0].replace(/^\/storage\//, '')}`}
                                                                                    alt="Property image" 
                                                                                    className="h-full w-full object-cover object-center"
                                                                                    onError={(e) => {
                                                                                        e.target.onerror = null;
                                                                                        console.error("Failed to load image:", request.property_images[0]);
                                                                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Cpath d='M30,40 L70,40 L70,70 L30,70 Z' fill='none' stroke='%23d1d5db' stroke-width='2'/%3E%3Cpath d='M40,50 C42.5,50 44.5,47.5 44.5,45 C44.5,42.5 42.5,40 40,40 C37.5,40 35,42.5 35,45 C35,47.5 37.5,50 40,50 Z' fill='%23d1d5db'/%3E%3Cpath d='M30,70 L50,50 L60,60 L70,50 L70,70 Z' fill='none' stroke='%23d1d5db' stroke-width='2'/%3E%3C/svg%3E";
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        );
                                                                    }
                                                                }
                                                                else if (typeof request.property_images === 'string' && request.property_images.length > 0) {
                                                                    const images = JSON.parse(request.property_images);
                                                                    if (Array.isArray(images) && images.length > 0) {
                                                                        return (
                                                                            <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                                                                                <img 
                                                                                    src={`/storage/${images[0].replace(/^\/storage\//, '')}`}
                                                                                    alt="Property image" 
                                                                                    className="h-full w-full object-cover object-center"
                                                                                    onError={(e) => {
                                                                                        e.target.onerror = null;
                                                                                        console.error("Failed to load image:", images[0]);
                                                                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Cpath d='M30,40 L70,40 L70,70 L30,70 Z' fill='none' stroke='%23d1d5db' stroke-width='2'/%3E%3Cpath d='M40,50 C42.5,50 44.5,47.5 44.5,45 C44.5,42.5 42.5,40 40,40 C37.5,40 35,42.5 35,45 C35,47.5 37.5,50 40,50 Z' fill='%23d1d5db'/%3E%3Cpath d='M30,70 L50,50 L60,60 L70,50 L70,70 Z' fill='none' stroke='%23d1d5db' stroke-width='2'/%3E%3C/svg%3E";
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        );
                                                                    }
                                                                }
                                                                return (
                                                                    <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                    </div>
                                                                );
                                                            } catch (e) {
                                                                console.error("Error parsing property_images:", e);
                                                                return (
                                                                    <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                                        </svg>
                                                                    </div>
                                                                );
                                                            }
                                                        })()
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {new Date(request.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                    <StatusBadge status={request.status} />
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                    {request.email_delivery_status === 'sent' && (
                                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                            <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                                                                <circle cx="4" cy="4" r="3" />
                                                            </svg>
                                                            Sent
                                                        </span>
                                                    )}
                                                    {request.email_delivery_status === 'failed' && (
                                                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                                            <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-red-400" fill="currentColor" viewBox="0 0 8 8">
                                                                <circle cx="4" cy="4" r="3" />
                                                            </svg>
                                                            Failed
                                                        </span>
                                                    )}
                                                    {!request.email_delivery_status && (
                                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                                            <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-gray-400" fill="currentColor" viewBox="0 0 8 8">
                                                                <circle cx="4" cy="4" r="3" />
                                                            </svg>
                                                            Unknown
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                    <div className="flex space-x-3">
                                                        <Link 
                                                            href={route('admin.maintenance-requests.show', request.id)} 
                                                            className="text-primary-600 hover:text-primary-900 flex items-center bg-primary-50 px-2.5 py-1.5 rounded-md hover:bg-primary-100 transition-colors duration-150"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            View
                                                        </Link>
                                                        {isSuperAdmin && (
                                                            <button
                                                                onClick={() => confirmDelete(request)}
                                                                className="text-red-600 hover:text-red-900 flex items-center bg-red-50 px-2.5 py-1.5 rounded-md hover:bg-red-100 transition-colors duration-150"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                Delete
                                                            </button>
                                                        )}
                                                        {request.status === 'pending' && (
                                                            <>
                                                              
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500">
                                                <div className="flex flex-col items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    <p className="font-medium">No maintenance requests found</p>
                                                    <p className="text-gray-400 mt-1">Try adjusting your search or filter criteria</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    {/* Pagination */}
                    <div className="mt-6 transition-all duration-500" style={{ 
                        opacity: animate ? 1 : 0,
                        transform: animate ? 'translateY(0)' : 'translateY(20px)',
                        transitionDelay: '300ms'
                    }}>
                        <Pagination links={requests.links} />
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Delete Maintenance Request
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Are you sure you want to delete this maintenance request? This action cannot be undone.
                    </p>
                    
                    {requestToDelete && (
                        <div className="mt-4 rounded-md bg-gray-50 p-4">
                            <p className="text-sm font-medium text-gray-700">Request Details:</p>
                            <ul className="mt-2 text-sm text-gray-600">
                                <li>Tenant: {requestToDelete.tenant_name}</li>
                                <li>Building: {requestToDelete.building_name}</li>
                                <li>Unit: {requestToDelete.unit_number}</li>
                                <li>Date: {new Date(requestToDelete.created_at).toLocaleDateString()}</li>
                            </ul>
                        </div>
                    )}
                    
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)} className="mr-3">
                            Cancel
                        </SecondaryButton>
                        
                        <DangerButton onClick={handleDelete} disabled={processing}>
                            {processing ? 'Deleting...' : 'Delete Request'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}

// Status Filter Component
function StatusFilter({ currentStatus }) {
    const statuses = [
        { value: '', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
    ];
    
    return (
        <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <div className="flex items-center flex-wrap gap-2">
                {statuses.map((status) => (
                    <Link
                        key={status.value}
                        href={route('admin.maintenance-requests', {
                            ...status.value ? { status: status.value } : {},
                            ...(currentStatus && currentStatus !== status.value ? { page: 1 } : {})
                        })}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                            currentStatus === status.value
                                ? 'bg-primary-100 text-primary-800 border border-primary-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                        } transition-colors duration-150`}
                    >
                        {status.label}
                    </Link>
                ))}
            </div>
        </div>
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
        <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium ${bgColor} ${textColor}`}>
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