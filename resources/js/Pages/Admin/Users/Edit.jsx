import { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { motion } from 'framer-motion';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import toast from 'react-hot-toast';

export default function Edit({ user }) {
    const [animate, setAnimate] = useState(false);
    
    const { data, setData, put, errors, processing, recentlySuccessful } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        role: user.role || 'user',
    });
    
    useEffect(() => {
        // Trigger animation after component mounts
        setAnimate(true);
    }, []);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user.id), {
            onSuccess: () => {
                toast.success('User updated successfully');
            },
        });
    };
    
    return (
        <AdminLayout
            header="Edit User"
        >
            <Head title="Edit User" />

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
                                <h1 className="text-2xl font-medium text-white">Edit User</h1>
                                <p className="mt-1 text-sm text-gray-200">
                                    Update user information
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* User Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: animate ? 1 : 0, y: animate ? 0 : 20 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mb-6 rounded-lg bg-white p-6 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center">
                            <div className="h-16 w-16 flex-shrink-0 rounded-full bg-gradient-to-r from-[#303b6a] to-[#272f52] flex items-center justify-center">
                                <span className="text-white text-xl font-medium">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="ml-6">
                                <h2 className="text-xl font-medium text-gray-900">{user.name}</h2>
                                <p className="text-sm text-gray-500">{user.email}</p>
                                <div className="flex items-center mt-1">
                                    <p className="text-xs text-gray-400">User ID: {user.id}</p>
                                    <span className="mx-2 text-gray-300">•</span>
                                    <p className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                        {user.role || 'user'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: animate ? 1 : 0, y: animate ? 0 : 20 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100 p-6"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="name" value="Name" className="text-black font-bold" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Email" className="text-black font-bold" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="role" value="Role" className="text-black font-bold" />
                                <select
                                    id="role"
                                    name="role"
                                    value={data.role}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    onChange={(e) => setData('role', e.target.value)}
                                    required
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                                <p className="mt-1 text-sm text-gray-500">
                                    <span className="font-medium">User:</span> Basic access
                                    <br />
                                    <span className="font-medium">Admin:</span> Can manage maintenance requests but cannot delete them
                                    <br />
                                    <span className="font-medium">Super Admin:</span> Full access including deletion capabilities
                                </p>
                                <InputError message={errors.role} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password" value="New Password (leave blank to keep current)" className="text-black font-bold" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password_confirmation" value="Confirm New Password" className="text-black font-bold" />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                />
                                <InputError message={errors.password_confirmation} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end gap-4">
                                <a
                                    href={route('admin.users')}
                                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                >
                                    Cancel
                                </a>
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#303b6a] to-[#272f52] border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:from-[#3a4887] hover:to-[#32396a] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    disabled={processing}
                                >
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </AdminLayout>
    );
} 