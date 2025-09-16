import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import NotificationBell from '@/Components/NotificationBell';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// NavItem component for sidebar navigation
function NavItem({ href, active, icon, label, collapsed }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <Link
                href={href}
                className={`
                    flex items-center px-4 py-3 my-1 text-sm font-medium rounded-xl transition-all duration-200
                    ${active
                        ? 'bg-gradient-to-r from-[#f32d21]/20 to-[#f32d21]/10 text-[#f32d21] shadow-sm'
                        : 'text-gray-100 hover:bg-white/10 hover:text-white'
                    }
                `}
            >
                <div className={`${collapsed ? 'mx-auto' : ''} flex items-center w-full`}>
                    <span className={`flex-shrink-0 ${active ? 'text-[#f32d21]' : 'text-gray-400'}`}>{icon}</span>
                    {!collapsed && <span className="ml-3">{label}</span>}
                    {active && !collapsed && (
                        <span className="ml-auto">
                            <div className="h-2 w-2 rounded-full bg-[#f32d21]"></div>
                        </span>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}

export default function AdminLayout({ header, children }) {
    const { props } = usePage();
    const flash = props.flash || {};
    const user = props.auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [animate, setAnimate] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    
    useEffect(() => {
        // Trigger animation after component mounts
        setAnimate(true);
        
        // Show flash messages as toast notifications
        if (flash.success) {
            toast.success(flash.success, {
                style: {
                    borderRadius: '10px',
                    background: '#fff',
                    color: '#333',
                }
            });
        }
        
        if (flash.error) {
            toast.error(flash.error, {
                style: {
                    borderRadius: '10px',
                    background: '#fff',
                    color: '#333',
                }
            });
        }
        
        if (flash.warning) {
            toast.warning(flash.warning, {
                style: {
                    borderRadius: '10px',
                    background: '#fff',
                    color: '#333',
                }
            });
        }
        
        if (flash.info) {
            toast.success(flash.info, {
                style: {
                    borderRadius: '10px',
                    background: '#fff',
                    color: '#333',
                }
            });
        }

        // Add scroll listener for header effect
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [flash]);

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar for desktop */}
            <motion.div 
                initial={{ width: sidebarOpen ? '16rem' : '5rem' }}
                animate={{ width: sidebarOpen ? '16rem' : '5rem' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`hidden md:block bg-gradient-to-b from-[#303b6a] to-[#272f52] text-white overflow-hidden shadow-xl rounded-r-sm`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white">
                        <AnimatePresence mode="wait">
                            {sidebarOpen ? (
                                <motion.div
                                    key="full-logo"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center space-x-3"
                                >
                                    <Link href={route('admin.dashboard')}>
                                        <ApplicationLogo className="h-12 w-auto" />
                                    </Link>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="small-logo"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex justify-center w-full"
                                >
                                    <Link href={route('admin.dashboard')} className="flex items-center justify-center">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#f32d21] to-[#303b6a] flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">WO</span>
                                        </div>
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-1.5 rounded-lg text-[#303b6a] hover:text-[#f32d21] hover:bg-gray-100 transition-colors duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {sidebarOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                )}
                            </svg>
                        </motion.button>
                    </div>

                    {/* Admin section */}
                    <AnimatePresence>
                        {sidebarOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                                className="px-4 py-4 border-b border-white/10"
                            >
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Administration
                                </h3>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Sidebar content */}
                    <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
                        <nav className="space-y-1">
                            <NavItem 
                                href={route('admin.dashboard')} 
                                active={route().current('admin.dashboard')}
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                    </svg>
                                }
                                label="Dashboard"
                                collapsed={!sidebarOpen}
                            />
                            
                            <NavItem 
                                href={route('admin.maintenance-requests')} 
                                active={route().current('admin.maintenance-requests') || route().current('admin.maintenance-requests.show')}
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                }
                                label="Maintenance Requests"
                                collapsed={!sidebarOpen}
                            />
                             <NavItem 
                                href={route('admin.properties.index')} 
                                active={route().current('admin.properties.*')}
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                    </svg>
                                }
                                label="Properties"
                                collapsed={!sidebarOpen}
                            />
                            {/* <NavItem 
                                href={route('admin.settings')} 
                                active={route().current('admin.settings')}
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                    </svg>
                                }
                                label="Settings"
                                collapsed={!sidebarOpen}
                            />
                             */}
                            <NavItem 
                                href={route('admin.users')} 
                                active={route().current('admin.users') || route().current('admin.users.show') || route().current('admin.users.create') || route().current('admin.users.edit')}
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                    </svg>
                                }
                                label="User Management"
                                collapsed={!sidebarOpen}
                            />
                        </nav>
                    </div>
                    
                    {/* User profile section */}
                    <div className="p-4 border-t border-white/10 backdrop-blur-sm bg-black/10">
                        <div className="flex flex-col">
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#f32d21] to-[#303b6a] flex items-center justify-center text-white font-medium shadow-md">
                                    {user?.name?.charAt(0) || 'A'}
                                </div>
                                <AnimatePresence>
                                    {sidebarOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="ml-3 flex-1"
                                        >
                                            <p className="text-sm font-medium text-white">{user?.name || 'Admin User'}</p>
                                            <p className="text-xs text-gray-300 truncate">{user?.email || 'admin@example.com'}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            
                            {/* User actions */}
                            <AnimatePresence>
                                {sidebarOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ duration: 0.2 }}
                                        className="mt-3 flex space-x-3"
                                    >
                                        <Link 
                                            href={route('profile.edit')} 
                                            className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors duration-200 text-center"
                                        >
                                            Profile
                                        </Link>
                                        <Link 
                                            href={route('logout')} 
                                            method="post" 
                                            as="button"
                                            className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-[#f32d21]/20 text-white hover:bg-[#f32d21]/30 transition-colors duration-200 text-center"
                                        >
                                            Log Out
                                        </Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            {/* Collapsed state button */}
                            {!sidebarOpen && (
                                <Link 
                                    href={route('logout')} 
                                    method="post" 
                                    as="button"
                                    className="mt-2 w-full text-xs p-1.5 rounded-lg bg-[#f32d21]/20 text-white hover:bg-[#f32d21]/30 transition-colors duration-200 flex items-center justify-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-40 md:hidden">
                        {/* Mobile menu backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-sm" 
                            onClick={() => setMobileMenuOpen(false)}
                            aria-hidden="true"
                        ></motion.div>

                        <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed inset-0 z-40 flex"
                        >
                            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-gradient-to-b from-[#303b6a] to-[#272f52] text-white rounded-r-2xl">
                                <div className="absolute top-0 right-0 -mr-12 pt-2">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        type="button"
                                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <span className="sr-only">Close sidebar</span>
                                        <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </motion.button>
                                </div>

                                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto custom-scrollbar">
                                    <div className="flex-shrink-0 flex items-center justify-center px-4 bg-white py-4">
                                        <ApplicationLogo className="h-12 w-auto" />
                                    </div>
                                    
                                    <div className="px-4 py-4 border-b border-white/10">
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Administration
                                        </h3>
                                    </div>
                                    
                                    <nav className="mt-4 px-4 space-y-2">
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <ResponsiveNavLink 
                                                href={route('admin.dashboard')} 
                                                active={route().current('admin.dashboard')}
                                                className={`rounded-xl px-3 py-2.5 text-base font-medium ${route().current('admin.dashboard') ? 'bg-gradient-to-r from-[#f32d21]/20 to-[#f32d21]/10 text-[#f32d21] shadow-sm' : 'text-white hover:bg-white/10'}`}
                                            >
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 ${route().current('admin.dashboard') ? 'text-[#f32d21]' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                                    </svg>
                                                    Dashboard
                                                </div>
                                            </ResponsiveNavLink>
                                        </motion.div>
                                        
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <ResponsiveNavLink 
                                                href={route('admin.maintenance-requests')} 
                                                active={route().current('admin.maintenance-requests') || route().current('admin.maintenance-requests.show')}
                                                className={`rounded-xl px-3 py-2.5 text-base font-medium ${route().current('admin.maintenance-requests') || route().current('admin.maintenance-requests.show') ? 'bg-gradient-to-r from-[#f32d21]/20 to-[#f32d21]/10 text-[#f32d21] shadow-sm' : 'text-white hover:bg-white/10'}`}
                                            >
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 ${route().current('admin.maintenance-requests') || route().current('admin.maintenance-requests.show') ? 'text-[#f32d21]' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                    </svg>
                                                    Maintenance Requests
                                                </div>
                                            </ResponsiveNavLink>
                                        </motion.div>
                                        
                                        {/* <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <ResponsiveNavLink 
                                                href={route('admin.settings')} 
                                                active={route().current('admin.settings')}
                                                className={`rounded-xl px-3 py-2.5 text-base font-medium ${route().current('admin.settings') ? 'bg-gradient-to-r from-[#f32d21]/20 to-[#f32d21]/10 text-[#f32d21] shadow-sm' : 'text-white hover:bg-white/10'}`}
                                            >
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 ${route().current('admin.settings') ? 'text-[#f32d21]' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                                    </svg>
                                                    Settings
                                                </div>
                                            </ResponsiveNavLink>
                                        </motion.div> */}
                                        
                                        <NavItem 
                                            href={route('admin.users')} 
                                            active={route().current('admin.users') || route().current('admin.users.show') || route().current('admin.users.create') || route().current('admin.users.edit')}
                                            icon={
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                                </svg>
                                            }
                                            label="User Management"
                                            collapsed={false}
                                        />
                                    </nav>
                                </div>
                                
                                <div className="flex-shrink-0 flex border-t border-white/10 backdrop-blur-sm bg-black/10 p-4">
                                    <div className="flex items-center w-full">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#f32d21] to-[#303b6a] flex items-center justify-center text-white font-medium shadow-md">
                                            {user?.name?.charAt(0) || 'A'}
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <p className="text-base font-medium text-white">{user?.name || 'Admin User'}</p>
                                            <p className="text-sm text-gray-300">{user?.email || 'admin@example.com'}</p>
                                        </div>
                                        <div className="flex flex-col space-y-2">
                                            <Link 
                                                href={route('profile.edit')} 
                                                className="text-xs px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors duration-200 text-center"
                                            >
                                                Profile
                                            </Link>
                                            <Link 
                                                href={route('logout')} 
                                                method="post" 
                                                as="button" 
                                                className="text-xs px-3 py-1.5 rounded-lg bg-[#f32d21]/20 text-white hover:bg-[#f32d21]/30 transition-colors duration-200 text-center"
                                            >
                                                Log Out
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top header */}
                <motion.div 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`bg-white ${scrolled ? 'shadow-md' : 'shadow-sm'} z-10 transition-all duration-300 ease-in-out sticky top-0`}
                >
                    <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div className="flex items-center">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setMobileMenuOpen(true)}
                                className="md:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-[#f32d21] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#303b6a]"
                            >
                                <span className="sr-only">Open sidebar</span>
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </motion.button>
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: animate ? 1 : 0, y: animate ? 0 : -10 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="ml-4 md:ml-0"
                            >
                                {header && (
                                    <h1 className="text-xl font-bold text-[#303b6a] flex items-center">
                                        <span className="mr-2 h-6 w-1 bg-gradient-to-b from-[#f32d21] to-[#303b6a] rounded-full"></span>
                                        {header}
                                    </h1>
                                )}
                            </motion.div>
                        </div>
                        
                        {/* Top right section with quick actions */}
                        <div className="flex items-center space-x-3">
                            {/* Notification Bell */}
                            <NotificationBell />
                            
                            {/* User dropdown */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                                    >
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-600 to-primary-800 flex items-center justify-center text-white font-medium mr-2">
                                                {user?.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>{user?.name}</div>

                                            <svg
                                                className="ml-2 -mr-0.5 h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                    </button>
                                </Dropdown.Trigger>
                            </Dropdown>
                        </div>
                    </div>
                </motion.div>

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8 custom-scrollbar">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="rounded-xl bg-white shadow-sm p-6 mb-8"
                    >
                        {children}
                    </motion.div>
                </main>
                
                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto flex justify-center items-center">
                        <div className="text-sm text-gray-500">
                            &copy; {new Date().getFullYear()} Triumph Residential Services, Inc. All rights reserved.
                        </div>
                   
                    </div>
                </footer>
            </div>
        </div>
    );
}

// Add this CSS to your global CSS file
// Create a style component for custom scrollbar and animations
const styles = `
    /* Custom scrollbar */
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    /* For Firefox */
    .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.1);
    }

    /* Fade-in animation */
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .animate-fadeIn {
        animation: fadeIn 0.5s ease-in-out;
    }
`;

// Add style tag to document head
if (typeof document !== 'undefined') {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = styles;
    document.head.appendChild(styleTag);
} 