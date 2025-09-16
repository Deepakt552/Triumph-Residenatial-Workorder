import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

export default function Dashboard({ stats }) {
    const [animate, setAnimate] = useState(false);
    
    useEffect(() => {
        // Trigger animation after component mounts
        setAnimate(true);
    }, []);

    return (
        <AdminLayout
            header="Admin Dashboard"
        >
            <Head title="Admin Dashboard" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Welcome Banner */}
                    <div className="mb-8 overflow-hidden rounded-lg bg-gradient-to-r from-primary-700 to-primary-600 shadow-lg">
                        <div className="px-6 py-8 md:flex md:items-center md:justify-between">
                            <div className="text-center md:text-left">
                                <h1 className="text-2xl font-medium text-white md:text-3xl">Welcome to Property Management</h1>
                                <p className="mt-2 text-primary-100">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            <div className="mt-4 flex justify-center md:mt-0">
                                <Link 
                                    href={route('admin.maintenance-requests')} 
                                    className="mt-3 inline-flex items-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-primary-700 shadow-sm hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                >
                                    View All Requests
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Stats cards */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Total Requests */}
                        <StatCard
                            title="Total Requests"
                            value={stats.totalRequests}
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            }
                            bgColor="from-primary-600 to-primary-700"
                            delay={0}
                            animate={animate}
                        />

                        {/* Pending Requests */}
                        <StatCard
                            title="Pending Requests"
                            value={stats.pendingRequests}
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                            bgColor="from-accent-500 to-accent-600"
                            delay={100}
                            animate={animate}
                        />

                        {/* Approved Requests */}
                        <StatCard
                            title="Approved Requests"
                            value={stats.approvedRequests}
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                            bgColor="from-green-500 to-green-600"
                            delay={200}
                            animate={animate}
                        />

                        {/* Rejected Requests */}
                        <StatCard
                            title="Rejected Requests"
                            value={stats.rejectedRequests}
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                            bgColor="from-red-500 to-red-600"
                            delay={300}
                            animate={animate}
                        />
                    </div>

                    {/* Recent Requests */}
                    <div 
                        className="mt-8 transition-all duration-700 transform"
                        style={{ 
                            opacity: animate ? 1 : 0, 
                            transform: animate ? 'translateY(0)' : 'translateY(20px)',
                            transitionDelay: '400ms'
                        }}
                    >
                        <div className="rounded-lg bg-white shadow">
                            <div className="px-6 py-5 border-b border-gray-200">
                                <h3 className="text-lg font-medium leading-6 text-primary-800">Recent Maintenance Requests</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Work Order #
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Tenant
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Building / Unit
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {stats.recentRequests.map((request) => (
                                            <tr key={request.id}>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{request.work_order_number || '-'}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm text-gray-900">{request.tenant_name}</div>
                                                    <div className="text-sm text-gray-500">{request.tenant_email}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm text-gray-900">{request.building_name || 'N/A'}</div>
                                                    <div className="text-sm text-gray-500">Unit: {request.unit_number || 'N/A'}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {new Date(request.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <StatusBadge status={request.status} />
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                    <Link href={route('admin.maintenance-requests.show', request.id)} className="text-primary-600 hover:text-primary-900">
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        {stats.recentRequests.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                                    No maintenance requests found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="border-t border-gray-200 px-6 py-4 text-right">
                                <Link href={route('admin.maintenance-requests')} className="text-sm font-medium text-primary-600 hover:text-primary-500">
                                    View All <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

// Stat Card Component
function StatCard({ title, value, icon, bgColor, delay, animate }) {
    return (
        <div 
            className={`overflow-hidden rounded-lg bg-white shadow transition-all duration-500 transform`}
            style={{ 
                opacity: animate ? 1 : 0, 
                transform: animate ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${delay}ms`
            }}
        >
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className={`bg-gradient-to-r ${bgColor} flex h-12 w-12 items-center justify-center rounded-md text-white shadow-md`}>
                            {icon}
                        </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
                            <dd>
                                <div className="text-2xl font-medium text-gray-900">{value}</div>
                            </dd>
                        </dl>
                    </div>
                </div>
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
        case 'completed':
            bgColor = 'bg-blue-100';
            textColor = 'text-blue-800';
            break;
        default:
            bgColor = 'bg-gray-100';
            textColor = 'text-gray-800';
    }
    
    return (
        <span className={`inline-flex rounded-full px-2 text-xs font-medium leading-5 ${bgColor} ${textColor}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
} 