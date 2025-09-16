import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef(null);
    
    // Fetch notifications when component mounts
    useEffect(() => {
        fetchNotifications();
        
        // Set up polling to check for new notifications every 30 seconds
        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);
        
        // Clean up interval on unmount
        return () => clearInterval(interval);
    }, []);
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);
    
    // Fetch notifications from the server
    const fetchNotifications = async () => {
        try {
            const response = await axios.get(route('admin.notifications'));
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };
    
    // Mark a notification as read
    const markAsRead = async (id) => {
        try {
            setIsLoading(true);
            await axios.post(route('admin.notifications.read', id));
            
            // Update local state
            setNotifications(notifications.map(notification => 
                notification.id === id ? { ...notification, is_read: true } : notification
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            setIsLoading(true);
            await axios.post(route('admin.notifications.read-all'));
            
            // Update local state
            setNotifications(notifications.map(notification => ({ ...notification, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Delete a notification
    const deleteNotification = async (id) => {
        try {
            setIsLoading(true);
            await axios.delete(route('admin.notifications.delete', id));
            
            // Update local state
            const updatedNotifications = notifications.filter(notification => notification.id !== id);
            setNotifications(updatedNotifications);
            
            // Recalculate unread count
            const newUnreadCount = updatedNotifications.filter(notification => !notification.is_read).length;
            setUnreadCount(newUnreadCount);
        } catch (error) {
            console.error('Error deleting notification:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Clear all notifications
    const clearAllNotifications = async () => {
        try {
            setIsLoading(true);
            await axios.post(route('admin.notifications.clear-all'));
            
            // Update local state
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Error clearing notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Toggle dropdown
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };
    
    // Handle notification click
    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        setIsOpen(false);
    };
    
    // Format the time of the notification
    const formatTime = (dateString) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch (error) {
            return 'Unknown time';
        }
    };
    
    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell icon with badge */}
            <button 
                onClick={toggleDropdown}
                className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
                aria-label="Notifications"
            >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                    />
                </svg>
                
                {/* Badge showing unread count */}
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>
            
            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 text-sm font-medium text-gray-700 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <span>Notifications</span>
                        <div className="flex space-x-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-primary-600 hover:text-primary-800 disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    Mark all as read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearAllNotifications}
                                    className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Notification list */}
                    <div className="max-h-72 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div 
                                    key={notification.id} 
                                    className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${!notification.is_read ? 'bg-primary-50' : ''}`}
                                >
                                    <Link 
                                        href={route('admin.maintenance-requests.show', notification.maintenance_request_id)}
                                        className="block"
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex justify-between">
                                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                            <div className="flex items-center">
                                                <span className="text-xs text-gray-500">{formatTime(notification.created_at)}</span>
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        deleteNotification(notification.id);
                                                    }}
                                                    className="ml-2 text-gray-400 hover:text-gray-600"
                                                    aria-label="Delete notification"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                                        {!notification.is_read && (
                                            <div className="mt-2 flex justify-end">
                                                <span className="inline-block w-2 h-2 bg-primary-600 rounded-full"></span>
                                            </div>
                                        )}
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <p className="mt-2 text-sm">No notifications</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 