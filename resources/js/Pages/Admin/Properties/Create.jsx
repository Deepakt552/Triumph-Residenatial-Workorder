import { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import TextArea from '@/Components/TextArea';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import toast from 'react-hot-toast';

export default function Create({ auth }) {
    const [animate, setAnimate] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        description: '',
        active: true,
    });
    
    useEffect(() => {
        // Trigger animation after component mounts
        setAnimate(true);
    }, []);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        post(route('admin.properties.store'), {
            onSuccess: () => {
                toast.success('Property created successfully');
                reset();
            },
            onError: (error) => {
                toast.error(error.message || 'Failed to create property');
            }
        });
    };
    
    return (
        <AdminLayout
            header="Create Property"
        >
            <Head title="Create Property" />
            
            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Page header */}
                    <div className="mb-8 rounded-lg bg-gradient-to-r from-primary-700 to-primary-600 p-6 shadow-lg transition-all duration-500" style={{ 
                        opacity: animate ? 1 : 0,
                        transform: animate ? 'translateY(0)' : 'translateY(20px)'
                    }}>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-2xl font-medium text-white">Create Property</h1>
                                <p className="mt-1 text-sm text-primary-100">
                                    Add a new property to the system
                                </p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <Link
                                    href={route('admin.properties.index')}
                                    className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-primary-700 shadow-sm hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 transition-colors duration-150"
                                >
                                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back to Properties
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Property Form */}
                    <div className="overflow-hidden rounded-lg bg-white shadow transition-all duration-500" style={{ 
                        opacity: animate ? 1 : 0,
                        transform: animate ? 'translateY(0)' : 'translateY(20px)',
                        transitionDelay: '100ms'
                    }}>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Property Name */}
                                <div>
                                    <InputLabel htmlFor="name" value="Property Name" required />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>
                                
                                {/* Address */}
                                <div>
                                    <InputLabel htmlFor="address" value="Address" required />
                                    <TextInput
                                        id="address"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.address} className="mt-2" />
                                </div>
                                
                                {/* City */}
                                <div>
                                    <InputLabel htmlFor="city" value="City" required />
                                    <TextInput
                                        id="city"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.city} className="mt-2" />
                                </div>
                                
                                {/* State */}
                                <div>
                                    <InputLabel htmlFor="state" value="State" required />
                                    <TextInput
                                        id="state"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.state}
                                        onChange={(e) => setData('state', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.state} className="mt-2" />
                                </div>
                                
                                {/* Zip Code */}
                                <div>
                                    <InputLabel htmlFor="zip_code" value="Zip Code" required />
                                    <TextInput
                                        id="zip_code"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.zip_code}
                                        onChange={(e) => setData('zip_code', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.zip_code} className="mt-2" />
                                </div>
                                
                                {/* Active Status */}
                                <div className="flex items-center mt-6">
                                    <input
                                        id="active"
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        checked={data.active}
                                        onChange={(e) => setData('active', e.target.checked)}
                                    />
                                    <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                                        Active
                                    </label>
                                    <InputError message={errors.active} className="mt-2" />
                                </div>
                            </div>
                            
                            {/* Description */}
                            <div className="mt-6">
                                <InputLabel htmlFor="description" value="Description" />
                                <TextArea
                                    id="description"
                                    className="mt-1 block w-full"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>
                            
                            {/* Form Actions */}
                            <div className="mt-6 flex items-center justify-end space-x-4">
                                <Link
                                    href={route('admin.properties.index')}
                                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Property'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 