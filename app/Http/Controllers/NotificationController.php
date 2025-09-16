<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getNotifications()
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->with('maintenanceRequest')
            ->get();
            
        $unreadCount = Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->count();
            
        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ]);
    }
    
    /**
     * Mark a notification as read.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);
        
        // Check if the notification belongs to the authenticated user
        if ($notification->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $notification->update(['is_read' => true]);
        
        return response()->json(['success' => true]);
    }
    
    /**
     * Mark all notifications as read.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);
            
        return response()->json(['success' => true]);
    }
    
    /**
     * Delete a notification.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function delete($id)
    {
        $notification = Notification::findOrFail($id);
        
        // Check if the notification belongs to the authenticated user
        if ($notification->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $notification->delete();
        
        return response()->json(['success' => true]);
    }
    
    /**
     * Clear all notifications.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function clearAll()
    {
        Notification::where('user_id', Auth::id())->delete();
        
        return response()->json(['success' => true]);
    }
    
    /**
     * Create a notification when a new maintenance request is submitted.
     *
     * @param  \App\Models\MaintenanceRequest  $maintenanceRequest
     * @return void
     */
    public static function createNewRequestNotification($maintenanceRequest)
    {
        // Get all admin users
        $adminUsers = \App\Models\User::all();
        
        foreach ($adminUsers as $user) {
            Notification::create([
                'user_id' => $user->id,
                'maintenance_request_id' => $maintenanceRequest->id,
                'type' => 'new_request',
                'title' => 'New Maintenance Request',
                'message' => "New maintenance request from {$maintenanceRequest->tenant_name} for {$maintenanceRequest->building_name}, Unit {$maintenanceRequest->unit_number}",
                'is_read' => false,
            ]);
        }
    }
}
