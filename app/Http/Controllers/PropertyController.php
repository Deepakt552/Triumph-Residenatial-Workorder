<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class PropertyController extends Controller
{
    /**
     * Display a listing of the properties.
     */
    public function index(Request $request)
    {
        $query = Property::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%");
                });
            })
            ->when($request->input('sort_field') && $request->input('sort_direction'), function ($query) use ($request) {
                $query->orderBy($request->input('sort_field'), $request->input('sort_direction'));
            }, function ($query) {
                $query->latest(); // Default sorting
            });
            
        $properties = $query->paginate(10)->withQueryString();
        
        return Inertia::render('Admin/Properties/Index', [
            'properties' => $properties,
            'filters' => $request->only(['search', 'sort_field', 'sort_direction']),
        ]);
    }

    /**
     * Show the form for creating a new property.
     */
    public function create()
    {
        return Inertia::render('Admin/Properties/Create');
    }

    /**
     * Store a newly created property in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'zip_code' => 'required|string|max:20',
            'description' => 'nullable|string|max:1000',
        ]);

        Property::create($validated);

        return redirect()->route('admin.properties.index')->with('success', 'Property created successfully');
    }

    /**
     * Display the specified property.
     */
    public function show(Property $property)
    {
        // Load the property's buildings
        $property->load('buildings');
        
        // Get maintenance requests for this property
        $maintenanceRequests = $property->maintenanceRequests()
            ->latest()
            ->take(10)
            ->get();
            
        return Inertia::render('Admin/Properties/Show', [
            'property' => $property,
            'buildings' => $property->buildings,
            'maintenanceRequests' => $maintenanceRequests,
        ]);
    }

    /**
     * Show the form for editing the specified property.
     */
    public function edit(Property $property)
    {
        return Inertia::render('Admin/Properties/Edit', [
            'property' => $property,
        ]);
    }

    /**
     * Update the specified property in storage.
     */
    public function update(Request $request, Property $property)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'zip_code' => 'required|string|max:20',
            'description' => 'nullable|string|max:1000',
            'active' => 'boolean',
        ]);

        $property->update($validated);

        return redirect()->route('admin.properties.index')->with('success', 'Property updated successfully');
    }

    /**
     * Remove the specified property from storage.
     */
    public function destroy(Property $property)
    {
        try {
            $property->delete();
            return redirect()->route('admin.properties.index')->with('success', 'Property deleted successfully');
        } catch (\Exception $e) {
            Log::error('Error deleting property: ' . $e->getMessage(), [
                'property_id' => $property->id,
                'exception' => $e
            ]);
            
            return redirect()->route('admin.properties.index')->with('error', 'Failed to delete property. It may be in use.');
        }
    }
    
    /**
     * Get properties for dropdown.
     */
    public function getProperties()
    {
        $properties = Property::where('active', true)
            ->orderBy('name')
            ->get(['id', 'name']);
            
        return response()->json($properties);
    }
} 