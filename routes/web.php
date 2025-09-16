<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MaintenanceRequestController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Dompdf\Dompdf;
use Illuminate\Support\Facades\Auth;

// Main route - redirect to admin dashboard if authenticated, otherwise to maintenance request form
Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('admin.dashboard');
    }
    return redirect()->route('maintenance.select-type');
});

// Maintenance Request Routes - these are the main routes we're using
Route::get('/maintenance-request/select-type', [MaintenanceRequestController::class, 'selectType'])->name('maintenance.select-type');
Route::get('/maintenance-request', [MaintenanceRequestController::class, 'create'])->name('maintenance.create');
Route::post('/maintenance-request', [MaintenanceRequestController::class, 'store'])->name('maintenance.store');
Route::get('/maintenance-request/thanks', [MaintenanceRequestController::class, 'thanks'])->name('maintenance.thanks');
Route::post('/maintenance-request/units', [MaintenanceRequestController::class, 'getUnits'])->name('maintenance.units');
Route::post('/maintenance-request/units-by-name', function (Request $request) {
    $buildingName = $request->input('building_name');
    
    if (!$buildingName) {
        return response()->json([]);
    }
    
    // Get unique unit numbers for the building name
    $units = \App\Models\MaintenanceRequest::where('building_name', $buildingName)
        ->whereNotNull('unit_number')
        ->distinct()
        ->pluck('unit_number')
        ->map(function ($unitNumber, $index) {
            return [
                'id' => $index + 1,
                'unit_number' => $unitNumber
            ];
        })
        ->values();
    
    return response()->json($units);
})->name('maintenance.units-by-name');
Route::post('/maintenance-request/building-details', [MaintenanceRequestController::class, 'getBuildingDetails'])->name('maintenance.building-details');
Route::get('/maintenance-request/check-session', [MaintenanceRequestController::class, 'checkSession'])->name('maintenance.check-session');
Route::get('/maintenance-request/clear-session', [MaintenanceRequestController::class, 'clearSession'])->name('maintenance.clear-session');

// PDF Form View Route
Route::get('/maintenance-request/form-pdf', [MaintenanceRequestController::class, 'viewFormPdf'])->name('maintenance.form-pdf');

// Signature Demo Route
Route::get('/signature-demo', function () {
    return Inertia::render('SignatureDemo');
})->name('signature.demo');

// Debug route - only available in debug mode
if (config('app.debug')) {
    Route::get('/maintenance-request/debug-signature/{id}', [MaintenanceRequestController::class, 'debugSignature'])->name('maintenance.debug-signature');
}

// Add a debugging route to check the language of a specific maintenance request
Route::get('/debug/maintenance-request/{id}/language', function ($id) {
    if (!config('app.debug')) {
        abort(404);
    }
    
    $request = \App\Models\MaintenanceRequest::find($id);
    if (!$request) {
        return response()->json(['error' => 'Maintenance request not found'], 404);
    }
    
    // Check the language directly from the database
    $dbLanguage = \Illuminate\Support\Facades\DB::table('maintenance_requests')
        ->where('id', $id)
        ->value('selected_language');
    
    return response()->json([
        'id' => $request->id,
        'model_language' => $request->selected_language,
        'db_language' => $dbLanguage,
        'tenant_name' => $request->tenant_name,
        'created_at' => $request->created_at,
        'updated_at' => $request->updated_at,
    ]);
});

// Admin Routes
Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/dashboard', function () {
        $stats = [
            'totalRequests' => \App\Models\MaintenanceRequest::count(),
            'pendingRequests' => \App\Models\MaintenanceRequest::where('status', 'pending')->count(),
            'approvedRequests' => \App\Models\MaintenanceRequest::where('status', 'approved')->count(),
            'rejectedRequests' => \App\Models\MaintenanceRequest::where('status', 'rejected')->count(),
            'recentRequests' => \App\Models\MaintenanceRequest::latest()->take(5)->get(),
        ];
        
        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
        ]);
    })->name('dashboard');
    
    // Property Management Routes
    Route::get('/properties', [\App\Http\Controllers\PropertyController::class, 'index'])->name('properties.index');
    Route::get('/properties/create', [\App\Http\Controllers\PropertyController::class, 'create'])->name('properties.create');
    Route::post('/properties', [\App\Http\Controllers\PropertyController::class, 'store'])->name('properties.store');
    Route::get('/properties/{property}', [\App\Http\Controllers\PropertyController::class, 'show'])->name('properties.show');
    Route::get('/properties/{property}/edit', [\App\Http\Controllers\PropertyController::class, 'edit'])->name('properties.edit');
    Route::put('/properties/{property}', [\App\Http\Controllers\PropertyController::class, 'update'])->name('properties.update');
    Route::delete('/properties/{property}', [\App\Http\Controllers\PropertyController::class, 'destroy'])->name('properties.destroy');
    Route::get('/get-properties', [\App\Http\Controllers\PropertyController::class, 'getProperties'])->name('properties.get');
    
    // Notification Routes
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'getNotifications'])->name('notifications');
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::delete('/notifications/{id}', [\App\Http\Controllers\NotificationController::class, 'delete'])->name('notifications.delete');
    Route::post('/notifications/clear-all', [\App\Http\Controllers\NotificationController::class, 'clearAll'])->name('notifications.clear-all');
    
    // User Management Routes
    Route::get('/users', function (Request $request) {
        $query = \App\Models\User::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            });
            
        $users = $query->latest()->paginate(10)->withQueryString();
        
        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search']),
        ]);
    })->name('users');
    
    // Create User Form
    Route::get('/users/create', function () {
        return Inertia::render('Admin/Users/Create');
    })->name('users.create');
    
    // Show User
    Route::get('/users/{id}', function ($id) {
        $user = \App\Models\User::findOrFail($id);
        
        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
        ]);
    })->name('users.show');
    
    // Store User
    Route::post('/users', function (Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|string|in:user,admin,super_admin',
        ]);
        
        // Only allow super_admin users to create new super_admin users
        $currentUser = Auth::user();
        $role = $validated['role'];
        if ($role === 'super_admin' && (!$currentUser->isSuperAdmin())) {
            // If current user is not super_admin, they cannot create super_admin users
            $role = 'admin';
            
            // Add a flash message to inform the user
            session()->flash('warning', 'Only Super Admins can create users with Super Admin role.');
        }
        
        $user = \App\Models\User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'role' => $role,
        ]);
        
        return redirect()->route('admin.users')->with('success', 'User created successfully');
    })->name('users.store');
    
    // Edit User Form
    Route::get('/users/{id}/edit', function ($id) {
        $user = \App\Models\User::findOrFail($id);
        
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
        ]);
    })->name('users.edit');
    
    // Update User
    Route::put('/users/{id}', function (Request $request, $id) {
        $user = \App\Models\User::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,'.$id,
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|string|in:user,admin,super_admin',
        ]);
        
        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
        ];
        
        // Only allow super_admin users to promote others to super_admin
        $currentUser = Auth::user();
        if ($validated['role'] === 'super_admin' && (!$currentUser->isSuperAdmin())) {
            // If current user is not super_admin, they cannot set role to super_admin
            $updateData['role'] = $user->role === 'super_admin' ? 'super_admin' : 'admin';
            
            // Add a flash message to inform the user
            session()->flash('warning', 'Only Super Admins can promote users to Super Admin role.');
        }
        
        if (!empty($validated['password'])) {
            $updateData['password'] = \Illuminate\Support\Facades\Hash::make($validated['password']);
        }
        
        $user->update($updateData);
        
        return redirect()->route('admin.users')->with('success', 'User updated successfully');
    })->name('users.update');
    
    // Delete User
    Route::delete('/users/{id}', function ($id) {
        $user = \App\Models\User::findOrFail($id);
        $user->delete();
        
        return redirect()->route('admin.users')->with('success', 'User deleted successfully');
    })->name('users.destroy');
    
    // Maintenance Requests
    Route::get('/maintenance-requests', function (Request $request) {
        $query = \App\Models\MaintenanceRequest::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('tenant_name', 'like', "%{$search}%")
                        ->orWhere('building_name', 'like', "%{$search}%")
                        ->orWhere('work_order_number', 'like', "%{$search}%");
                });
            })
            ->when($request->input('status'), function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->input('building_id'), function ($query, $buildingId) {
                // Check if building_id is numeric (from buildings table) or a string (building name)
                if (is_numeric($buildingId)) {
                    $query->where('building_id', $buildingId);
                } else {
                    $query->where('building_name', $buildingId);
                }
            })
            ->when($request->input('property_id'), function ($query, $propertyId) {
                $query->where('property_id', $propertyId);
            })
            ->when($request->input('unit_number'), function ($query, $unitNumber) {
                $query->where('unit_number', $unitNumber);
            })
            ->when($request->input('start_date'), function ($query, $startDate) {
                $query->whereDate('created_at', '>=', $startDate);
            })
            ->when($request->input('end_date'), function ($query, $endDate) {
                $query->whereDate('created_at', '<=', $endDate);
            })
            ->when($request->input('sort_field') && $request->input('sort_direction'), function ($query) use ($request) {
                $query->orderBy($request->input('sort_field'), $request->input('sort_direction'));
            }, function ($query) {
                $query->latest(); // Default sorting
            });
            
        $requests = $query->paginate(10)->withQueryString();
        
        // Get all buildings for the dropdown filter
        $buildings = \App\Models\Building::orderBy('name')->get();
        
        // Also get unique building names from maintenance requests that might not be in the buildings table
        $uniqueBuildingNames = \App\Models\MaintenanceRequest::select('building_name', 'building_id')
            ->whereNotNull('building_name')
            ->distinct()
            ->get()
            ->map(function($item) {
                return [
                    'id' => $item->building_id ?? $item->building_name,
                    'name' => $item->building_name,
                    'is_from_requests' => true
                ];
            });
        
        // Combine both collections and remove duplicates
        $buildingIds = $buildings->pluck('id')->toArray();
        $additionalBuildings = $uniqueBuildingNames->filter(function($item) use ($buildingIds) {
            return !in_array($item['id'], $buildingIds);
        });
        
        $allBuildings = $buildings->concat($additionalBuildings)->sortBy('name')->values();
        
        // Get status counts for the entire dataset (not just current page)
        $totalRequests = \App\Models\MaintenanceRequest::count();
        $pendingRequests = \App\Models\MaintenanceRequest::where('status', 'pending')->count();
        $approvedRequests = \App\Models\MaintenanceRequest::where('status', 'approved')->count();
        $rejectedRequests = \App\Models\MaintenanceRequest::where('status', 'rejected')->count();
        
        return Inertia::render('Admin/MaintenanceRequests/Index', [
            'requests' => $requests,
            'filters' => $request->only(['search', 'status', 'building_id', 'property_id', 'unit_number', 'start_date', 'end_date', 'sort_field', 'sort_direction']),
            'buildings' => $allBuildings,
            'stats' => [
                'total' => $totalRequests,
                'pending' => $pendingRequests,
                'approved' => $approvedRequests,
                'rejected' => $rejectedRequests,
            ],
        ]);
    })->name('maintenance-requests');
    
    // Show Maintenance Request
    Route::get('/maintenance-requests/{id}', function ($id) {
        $request = \App\Models\MaintenanceRequest::findOrFail($id);
        
        return Inertia::render('Admin/MaintenanceRequests/Show', [
            'request' => $request,
        ]);
    })->name('maintenance-requests.show');
    
    // Approve Maintenance Request
    Route::post('/maintenance-requests/{id}/approve', [\App\Http\Controllers\MaintenanceEmailController::class, 'approve'])
        ->name('maintenance-requests.approve');
    
    // Reject Maintenance Request
    Route::post('/maintenance-requests/{id}/reject', [\App\Http\Controllers\MaintenanceEmailController::class, 'reject'])
        ->name('maintenance-requests.reject');
    
    // Resend PDF to Tenant
    Route::post('/maintenance-requests/{id}/resend-pdf', [\App\Http\Controllers\MaintenanceEmailController::class, 'resendPdf'])
        ->name('maintenance-requests.resend-pdf');
    
    // Re-translate maintenance request (for fixing poor translations)
    Route::post('/maintenance-requests/{id}/retranslate', [MaintenanceRequestController::class, 'retranslateRequest'])
        ->name('maintenance-requests.retranslate');
    
    // Update property for maintenance request
    Route::post('/maintenance-requests/{id}/update-property', [MaintenanceRequestController::class, 'updateProperty'])
        ->name('maintenance-requests.update-property');
    
    // Delete Maintenance Request (admin only)
    Route::delete('/maintenance-requests/{id}', [\App\Http\Controllers\MaintenanceRequestController::class, 'destroy'])
        ->name('maintenance-requests.destroy');
    
    // Settings
    Route::get('/settings', function () {
        $settings = \Illuminate\Support\Facades\DB::table('settings')->first() ?? new \stdClass();
        
        return Inertia::render('Admin/Settings', [
            'settings' => $settings,
        ]);
    })->name('settings');
    
    // Update Settings
    Route::patch('/settings', function (Request $request) {
        $validated = $request->validate([
            'company_name' => 'nullable|string|max:255',
            'company_email' => 'nullable|email|max:255',
            'company_phone' => 'nullable|string|max:20',
            'company_address' => 'nullable|string|max:1000',
            'email_signature' => 'nullable|string|max:1000',
            'approval_template' => 'nullable|string|max:2000',
            'rejection_template' => 'nullable|string|max:2000',
        ]);
        
        \Illuminate\Support\Facades\DB::table('settings')->updateOrInsert(
            ['id' => 1],
            $validated + ['updated_at' => now()]
        );
        
        return back()->with('success', 'Settings updated successfully.');
    })->name('settings.update');
});

// Legacy/admin routes - commented out as we're only using the maintenance request routes and admin dashboard now

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';



