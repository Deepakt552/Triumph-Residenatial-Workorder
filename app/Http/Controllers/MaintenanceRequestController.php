<?php

namespace App\Http\Controllers;

use App\Models\Building;
use App\Models\MaintenanceRequest;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Dompdf\Dompdf;
use App\Mail\MaintenanceRequestSubmitted;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Services\TranslationService;
use Illuminate\Support\Facades\Auth;

class MaintenanceRequestController extends Controller
{
    protected $translationService;
    
    /**
     * Create a new controller instance.
     */
    public function __construct(TranslationService $translationService)
    {
        $this->translationService = $translationService;
    }

    /**
     * Show the request type selection page.
     */
    public function selectType(Request $request)
    {
        // Get language from request if available
        $language = $request->query('lang', 'en');
        
        // Only allow valid languages
        if (!in_array($language, ['en', 'es'])) {
            $language = 'en';
        }
        
        return Inertia::render('MaintenanceRequest/SelectType', [
            'language' => $language
        ]);
    }

    /**
     * Show the maintenance request form.
     */
    public function create(Request $request)
    {
        // Get language from request if available
        $language = $request->query('lang', 'en');
        
        // Only allow valid languages
        if (!in_array($language, ['en', 'es'])) {
            $language = 'en';
        }
        
        // Check if this is an emergency request from the query parameter
        $isEmergency = $request->query('emergency') === 'true';
        
        return Inertia::render('MaintenanceRequest/Create', [
            'language' => $language,
            'isEmergency' => $isEmergency,
            'hideEmergencyOption' => true // This flag tells the frontend to hide the emergency checkbox
        ]);
    }
    
    /**
     * Get units for a building.
     */
    public function getUnits(Request $request)
    {
        Log::info('Unit fetch request received', [
            'request_data' => $request->all()
        ]);
        
        try {
            $request->validate([
                'building_id' => 'required|exists:buildings,id',
            ]);
            
            // Check if building exists
            $building = Building::findOrFail($request->building_id);
            Log::info('Building found', ['building' => $building->name]);
            
            // Get units for this building
            $units = Unit::where('building_id', $request->building_id)
                ->select('id', 'unit_number')
                ->orderBy('unit_number')
                ->get();
                
            // Log the units being returned for debugging
            Log::info('Units fetched for building ID: ' . $request->building_id, [
                'count' => $units->count(),
                'units' => $units->toArray()
            ]);
            
            // If no units found, seed some test units
            if ($units->isEmpty()) {
                Log::warning('No units found for building, creating test units', [
                    'building_id' => $request->building_id
                ]);
                
                // Create some test units for this building
                $testUnits = [];
                for ($i = 101; $i <= 110; $i++) {
                    $unit = Unit::create([
                        'building_id' => $request->building_id,
                        'unit_number' => (string)$i,
                        'occupied' => true
                    ]);
                    $testUnits[] = $unit;
                }
                
                // Fetch the newly created units
                $units = Unit::where('building_id', $request->building_id)
                    ->select('id', 'unit_number')
                    ->orderBy('unit_number')
                    ->get();
                    
                Log::info('Test units created and fetched', [
                    'count' => $units->count(),
                    'units' => $units->toArray()
                ]);
            }
            
            return response()->json($units);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error fetching units: ' . $e->getMessage(), [
                'building_id' => $request->input('building_id'),
                'errors' => $e->errors()
            ]);
            
            // Return empty units array with a 200 status code instead of an error
            return response()->json([]);
        } catch (\Exception $e) {
            Log::error('Error fetching units: ' . $e->getMessage(), [
                'building_id' => $request->input('building_id'),
                'exception' => $e
            ]);
            
            // Return empty units array with a 200 status code instead of an error
            return response()->json([]);
        }
    }
    
    /**
     * Get building details.
     */
    public function getBuildingDetails(Request $request)
    {
        try {
            $request->validate([
                'building_id' => 'required|exists:buildings,id',
            ]);
            
            $building = Building::findOrFail($request->building_id);
            
            return response()->json([
                'address' => $building->address,
                'city' => $building->city,
                'state' => $building->state,
                'zip_code' => $building->zip_code,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching building details: ' . $e->getMessage(), [
                'building_id' => $request->input('building_id'),
                'exception' => $e
            ]);
            
            return response()->json(['error' => 'Failed to fetch building details'], 500);
        }
    }

    /**
     * Store a new maintenance request.
     */
    public function store(Request $request)
    {
        // Log all request data for debugging
        Log::info('Maintenance request form submission', [
            'all_data' => $request->all(),
            'selected_language' => $request->input('selected_language'),
            'has_selected_language' => $request->has('selected_language'),
        ]);
        
        // Basic validation rules for regular form fields
        $validated = $request->validate([
            'building_id' => 'nullable|exists:buildings,id',
            'building_name' => 'required|string|max:255',
            'unit_id' => 'nullable|exists:units,id',
            'unit_number' => 'required|string|max:50',
            'tenant_name' => 'required|string|max:255',
            'tenant_email' => 'required|email|max:255',
            'tenant_phone' => 'required|string|max:20',
            'work_requested' => 'required|string|max:300',
            'is_emergency' => 'boolean',
            'permission_to_enter' => 'required|boolean',
            'no_permission_reason' => 'required_if:permission_to_enter,false|nullable|string',
            'scheduled_date' => 'required|date',
            'scheduled_time' => 'required|string|max:50',
            'special_instructions' => 'nullable|string',
            'tenant_signature' => 'nullable|string',
            'signature_file' => 'nullable|file|mimes:jpeg,png,jpg,gif|max:2048',
            'selected_language' => 'required|string|in:en,es',
        ]);
        
        // Validate that at least one property image is uploaded
        if (!$request->hasAny(['property_image_0', 'property_image_1', 'property_image_2', 'property_image_3', 'property_image_4']) && 
            !$request->hasFile('property_images') && 
            !$request->hasFile('property_images.*')) {
            return back()
                ->withInput()
                ->withErrors(['property_images' => 'At least one property image is required.']);
        }

        try {
            // Get selected language from form data or default to English
            $selectedLanguage = $request->input('selected_language', 'en');
            if (!in_array($selectedLanguage, ['en', 'es'])) {
                $selectedLanguage = 'en';
            }
            
            // Set the selected language
            $validated['selected_language'] = $selectedLanguage;
            
            // Log the selected language for debugging
            Log::info('Selected language for maintenance request', [
                'language' => $selectedLanguage,
                'request_data' => $request->only(['selected_language']),
                'has_selected_language' => $request->has('selected_language'),
                'raw_selected_language' => $request->input('selected_language'),
                'all_request_keys' => array_keys($request->all()),
                'validated_data_keys' => array_keys($validated)
            ]);
            
            // Handle translations if the form is submitted in Spanish
            if ($selectedLanguage === 'es') {
                // Store original Spanish text
                $validated['work_requested_original'] = $validated['work_requested'];
                $validated['special_instructions_original'] = $validated['special_instructions'] ?? '';
                $validated['no_permission_reason_original'] = $validated['no_permission_reason'] ?? '';
                
                // Translate to English
                $validated['work_requested_translated'] = $this->translationService->translate(
                    $validated['work_requested'], 
                    'es', 
                    'en'
                );
                
                if (!empty($validated['special_instructions'])) {
                    $validated['special_instructions_translated'] = $this->translationService->translate(
                        $validated['special_instructions'], 
                        'es', 
                        'en'
                    );
                }
                
                if (!empty($validated['no_permission_reason'])) {
                    $validated['no_permission_reason_translated'] = $this->translationService->translate(
                        $validated['no_permission_reason'], 
                        'es', 
                        'en'
                    );
                }
                
                // For admin display, use the translated English version in the main fields
                $validated['work_requested'] = $validated['work_requested_translated'];
                
                if (!empty($validated['special_instructions'])) {
                    $validated['special_instructions'] = $validated['special_instructions_translated'];
                }
                
                if (!empty($validated['no_permission_reason'])) {
                    $validated['no_permission_reason'] = $validated['no_permission_reason_translated'];
                }
                
                // Log translation results
                Log::info('Translation results', [
                    'original_work_requested' => $validated['work_requested_original'],
                    'translated_work_requested' => $validated['work_requested_translated'],
                    'original_special_instructions' => $validated['special_instructions_original'] ?? null,
                    'translated_special_instructions' => $validated['special_instructions_translated'] ?? null,
                    'original_no_permission_reason' => $validated['no_permission_reason_original'] ?? null,
                    'translated_no_permission_reason' => $validated['no_permission_reason_translated'] ?? null,
                ]);
            } else {
                // For English submissions, store the same text in both original and translated fields
                $validated['work_requested_original'] = $validated['work_requested'];
                $validated['work_requested_translated'] = $validated['work_requested'];
                
                if (!empty($validated['special_instructions'])) {
                    $validated['special_instructions_original'] = $validated['special_instructions'];
                    $validated['special_instructions_translated'] = $validated['special_instructions'];
                }
                
                if (!empty($validated['no_permission_reason'])) {
                    $validated['no_permission_reason_original'] = $validated['no_permission_reason'];
                    $validated['no_permission_reason_translated'] = $validated['no_permission_reason'];
                }
            }
            
            // Use the manually entered building name directly
            // $validated['building_name'] is already set from the form input
            
            // Set some default property details if building_id is not provided or invalid
            if (empty($validated['building_id']) || $validated['building_id'] == '1') {
                $validated['property_address'] = '';
                $validated['city'] = '';
                $validated['state'] = '';
                $validated['zip_code'] = '';
            } else {
                // If a valid building_id is provided, get the details
                try {
                    $building = Building::findOrFail($validated['building_id']);
                    $validated['property_address'] = $building->address;
                    $validated['city'] = $building->city;
                    $validated['state'] = $building->state;
                    $validated['zip_code'] = $building->zip_code;
                } catch (\Exception $e) {
                    // If there's an error finding the building, use empty values
                    $validated['property_address'] = '';
                    $validated['city'] = '';
                    $validated['state'] = '';
                    $validated['zip_code'] = '';
                }
            }
            
            // Generate a work order number
            $validated['work_order_number'] = 'WO-' . now()->setTimezone('America/Los_Angeles')->format('Ymd') . '-' . strtoupper(substr(uniqid(), -5));
            
            // Set a default priority level
            $validated['priority'] = 'B'; // Use B (Routine) as the default priority
            
            // Handle signature file upload
            if ($request->hasFile('signature_file')) {
                // Store the uploaded file in public storage
                $path = $request->file('signature_file')->store('digital_signature', 'public');
                $validated['signature_file_path'] = $path;
                // Clear any drawn signature if a file was uploaded
                $validated['tenant_signature'] = null;
                // Flag as digital signature
                $validated['is_digital_signature'] = true;
                
                Log::info('Signature file uploaded', [
                    'path' => $path,
                    'is_digital_signature' => true
                ]);
            } elseif ($request->filled('tenant_signature')) {
                // Process signature
                if ($signatureData = $request->input('tenant_signature')) {
                    // Log the signature data for debugging
                    Log::info('Received signature data', [
                        'signature_prefix' => substr($signatureData, 0, 50) . '...',
                        'signature_length' => strlen($signatureData),
                        'is_valid_data_url' => Str::startsWith($signatureData, 'data:image'),
                        'memory_usage' => memory_get_usage(true) / 1024 / 1024 . ' MB'
                    ]);
                    
                    try {
                    // Ensure the signature data has the proper prefix for data URLs
                    if (!Str::startsWith($signatureData, 'data:image/png')) {
                        // If it's missing the prefix, add it
                        if (Str::startsWith($signatureData, 'base64,')) {
                            $signatureData = 'data:image/png;' . $signatureData;
                            Log::info('Added prefix to signature data starting with base64,');
                        } else if (!Str::startsWith($signatureData, 'data:')) {
                            $signatureData = 'data:image/png;base64,' . $signatureData;
                            Log::info('Added complete prefix to signature data');
                        }
                        
                        Log::info('Fixed signature data URL format', [
                            'prefix' => substr($signatureData, 0, 30) . '...',
                            'length' => strlen($signatureData)
                        ]);
                    }
                    
                        // Extract the base64 part from the data URL
                        if (strpos($signatureData, ',') !== false) {
                        $base64Content = substr($signatureData, strpos($signatureData, ',') + 1);
                        
                        // Validate base64 content length
                        if (strlen($base64Content) < 100) {
                            Log::error('Base64 content too short', [
                                'length' => strlen($base64Content)
                            ]);
                            throw new \Exception('Digital signature data is too small or incomplete');
                        }
                        
                        // Try to decode it to ensure it's valid
                        $decodedContent = base64_decode($base64Content, true);
                        
                        if ($decodedContent === false) {
                            // Invalid base64 - log the error
                            Log::error('Invalid base64 content in signature data', [
                                'content_start' => substr($base64Content, 0, 30) . '...',
                                'content_length' => strlen($base64Content)
                            ]);
                            throw new \Exception('Invalid digital signature data format');
                        }
                        
                        // Check if decoded content looks like a valid image (has minimum size)
                        if (strlen($decodedContent) < 100) {
                            Log::error('Decoded signature content too small', [
                                'size' => strlen($decodedContent)
                            ]);
                            throw new \Exception('Digital signature data is invalid or corrupted');
                        }
                            
                            // Create directory if it doesn't exist (with error handling)
                            $dirPath = storage_path('app/public/digital_signature');
                            if (!is_dir($dirPath)) {
                                if (!mkdir($dirPath, 0755, true)) {
                                    Log::error('Failed to create digital_signature directory', [
                                        'directory' => $dirPath,
                                        'exists' => is_dir($dirPath),
                                        'writable' => is_writable(dirname($dirPath))
                                    ]);
                                    throw new \Exception('Failed to create digital_signature directory');
                                }
                            }
                            
                            // Create safe tenant name for filename
                            $tenantName = !empty($validated['tenant_name']) 
                                ? preg_replace('/[^a-zA-Z0-9]/', '_', $validated['tenant_name']) 
                                : 'tenant';
                                
                            // Generate timestamp and unique ID
                            $timestamp = date('Y-m-d_H-i-s');
                            $uniqueId = substr(md5(uniqid()), 0, 8);
                            
                            // Create filename with tenant name, timestamp and unique ID
                            $filename = 'signature_' . $tenantName . '_' . $timestamp . '_' . $uniqueId . '.png';
                            $path = 'digital_signature/' . $filename;
                            $fullPath = storage_path('app/public/' . $path);
                            
                            Log::info('Attempting to save signature file', [
                                'full_path' => $fullPath,
                                'directory_exists' => file_exists(dirname($fullPath)),
                                'directory_writable' => is_writable(dirname($fullPath)),
                                'content_size' => strlen($decodedContent)
                            ]);
                            
                            // Try multiple save methods
                            $saveSuccess = false;
                            $saveError = null;
                            
                            // Method 1: Using Laravel Storage
                            try {
                                // Ensure directory exists
                                Storage::makeDirectory('public/digital_signature');
                                
                                // Save the signature data
                                $storageResult = Storage::put('public/' . $path, $decodedContent);
                                $fileExists = file_exists($fullPath);
                                $fileSize = $fileExists ? filesize($fullPath) : 0;
                                
                                if ($storageResult && $fileExists && $fileSize > 0) {
                                    $saveSuccess = true;
                                    Log::info('Signature saved successfully using Storage', [
                                        'path' => $path,
                                        'file_exists' => $fileExists,
                                        'file_size' => $fileSize
                                    ]);
                                } else {
                                    Log::warning('Storage::put succeeded but file not found', [
                                        'storage_result' => $storageResult,
                                        'file_exists' => $fileExists,
                                        'file_size' => $fileSize,
                                        'full_path' => $fullPath
                                    ]);
                                }
                            } catch (\Exception $e) {
                                $saveError = $e->getMessage();
                                Log::error('Failed to save signature with Storage::put', [
                                    'error' => $saveError,
                                    'exception' => $e
                                ]);
                            }
                            
                            // Method 2: Direct file writing if Storage failed
                            if (!$saveSuccess) {
                                try {
                                    // Make sure the directory exists
                                    if (!is_dir(dirname($fullPath))) {
                                        mkdir(dirname($fullPath), 0755, true);
                                    }
                                    
                                    // Try to write the file directly
                                    if (file_put_contents($fullPath, $decodedContent)) {
                                        $fileExists = file_exists($fullPath);
                                        $fileSize = $fileExists ? filesize($fullPath) : 0;
                                        
                                        if ($fileExists && $fileSize > 0) {
                                            $saveSuccess = true;
                                            Log::info('Signature saved successfully using file_put_contents', [
                                                'path' => $fullPath,
                                                'file_size' => $fileSize
                                            ]);
                                        } else {
                                            Log::warning('file_put_contents succeeded but file not found or empty', [
                                                'file_exists' => $fileExists,
                                                'file_size' => $fileSize,
                                                'full_path' => $fullPath,
                                                'dir_exists' => is_dir(dirname($fullPath)),
                                                'dir_writable' => is_writable(dirname($fullPath))
                                            ]);
                                        }
                                    } else {
                                        Log::error('file_put_contents failed to write signature file', [
                                            'full_path' => $fullPath,
                                            'dir_exists' => is_dir(dirname($fullPath)),
                                            'dir_writable' => is_writable(dirname($fullPath)),
                                            'php_error' => error_get_last()
                                        ]);
                                    }
                                } catch (\Exception $e) {
                                    if (!$saveError) $saveError = $e->getMessage();
                                    Log::error('Failed to save signature with file_put_contents', [
                                        'error' => $e->getMessage(),
                                        'exception' => $e,
                                        'trace' => $e->getTraceAsString()
                                    ]);
                                }
                            }
                            
                            // Method 3: Save as temporary file then move
                            if (!$saveSuccess) {
                                try {
                                    $tempFile = tempnam(sys_get_temp_dir(), 'sig_');
                                    if (file_put_contents($tempFile, $decodedContent)) {
                                        if (rename($tempFile, $fullPath)) {
                                            $fileExists = file_exists($fullPath);
                                            $fileSize = $fileExists ? filesize($fullPath) : 0;
                                            
                                            if ($fileExists && $fileSize > 0) {
                                                $saveSuccess = true;
                                                Log::info('Signature saved successfully using temp file method', [
                                                    'path' => $fullPath,
                                                    'file_size' => $fileSize
                                                ]);
                                            }
                                        } else {
                                            Log::error('Failed to move temp signature file', [
                                                'from' => $tempFile,
                                                'to' => $fullPath
                                            ]);
                                            // Clean up temp file
                                            @unlink($tempFile);
                                        }
                                    }
                                } catch (\Exception $e) {
                                    if (!$saveError) $saveError = $e->getMessage();
                                    Log::error('Failed to save signature with temp file method', [
                                        'error' => $e->getMessage()
                                    ]);
                                    // Clean up temp file if it exists
                                    if (isset($tempFile) && file_exists($tempFile)) {
                                        @unlink($tempFile);
                                    }
                                }
                            }
                            
                            // If any method succeeded, set the path
                            if ($saveSuccess) {
                                // Verify the file was actually saved
                                if (file_exists($fullPath) && filesize($fullPath) > 0) {
                                    $validated['signature_file_path'] = $path;
                                    $validated['tenant_signature'] = $signatureData; // Keep for backward compatibility
                                    $validated['is_digital_signature'] = true; // Flag to indicate this is a digital signature
                                    
                                    Log::info('Digital signature saved successfully', [
                                        'path' => $path,
                                        'tenant' => $tenantName,
                                        'file_size' => filesize($fullPath)
                                    ]);
                                } else {
                                    // File doesn't exist or is empty despite save success
                                    Log::error('Signature file verification failed', [
                                        'path' => $fullPath,
                                        'exists' => file_exists($fullPath),
                                        'size' => file_exists($fullPath) ? filesize($fullPath) : 0
                                    ]);
                                    throw new \Exception('Signature file verification failed - file not found or empty');
                                }
                            } else {
                                // All methods failed, throw exception with details
                                Log::error('All signature save methods failed', [
                                    'last_error' => $saveError
                                ]);
                                throw new \Exception('Could not save digital signature file: ' . ($saveError ?: 'Unknown error'));
                            }
                            
                        } else {
                            Log::error('Invalid signature data format - missing comma separator');
                            throw new \Exception('Invalid signature data format');
                        }
                    } catch (\Exception $e) {
                        Log::error('Error processing signature: ' . $e->getMessage(), [
                            'exception' => $e,
                            'trace' => $e->getTraceAsString()
                        ]);
                        throw new \Exception('Failed to process signature: ' . $e->getMessage());
                    }
                } else {
                    Log::warning('No signature data provided');
                }
            } else {
                Log::warning('No signature provided');
            }
            
            // Handle property images
            $propertyImagePaths = [];
            
            // Log all request data for debugging
            Log::info('Request data for maintenance request:', [
                'files' => array_keys($request->allFiles()),
                'has_data' => !empty($request->allFiles())
            ]);
            
            // Check for property images in the request files array
            foreach ($request->allFiles() as $key => $file) {
                // Check for both formats: property_images[] and property_image_X
                if (strpos($key, 'property_image_') === 0 || strpos($key, 'property_images') === 0) {
                    // If it's a single file
                    if ($file instanceof \Illuminate\Http\UploadedFile && $file->isValid()) {
                        // Store in public disk with property_images directory
                        $path = $file->store('property_images', 'public');
                        $propertyImagePaths[] = $path;
                        
                        Log::info('Property image uploaded (individual):', [
                            'key' => $key,
                            'path' => $path,
                            'size' => $file->getSize(),
                            'mime' => $file->getMimeType(),
                            'full_path' => Storage::disk('public')->path($path),
                            'exists' => Storage::disk('public')->exists($path)
                        ]);
                    } 
                    // If it's an array of files
                    else if (is_array($file)) {
                        foreach ($file as $index => $singleFile) {
                            if ($singleFile instanceof \Illuminate\Http\UploadedFile && $singleFile->isValid()) {
                                // Store in public disk with property_images directory
                                $path = $singleFile->store('property_images', 'public');
                                $propertyImagePaths[] = $path;
                                
                                Log::info('Property image uploaded (from array):', [
                                    'key' => $key,
                                    'index' => $index,
                                    'path' => $path,
                                    'size' => $singleFile->getSize(),
                                    'mime' => $singleFile->getMimeType(),
                                    'full_path' => Storage::disk('public')->path($path),
                                    'exists' => Storage::disk('public')->exists($path)
                                ]);
                            } else {
                                Log::warning('Invalid file in property images array', [
                                    'key' => $key,
                                    'index' => $index,
                                    'is_file' => $singleFile instanceof \Illuminate\Http\UploadedFile,
                                    'is_valid' => $singleFile instanceof \Illuminate\Http\UploadedFile ? $singleFile->isValid() : 'not a file'
                                ]);
                            }
                        }
                    } else {
                        Log::warning('Invalid property image data', [
                            'key' => $key,
                            'type' => gettype($file),
                            'is_array' => is_array($file),
                            'is_file' => $file instanceof \Illuminate\Http\UploadedFile
                        ]);
                    }
                }
            }
            
            // Store property image paths as JSON
            if (!empty($propertyImagePaths)) {
                $validated['property_images'] = json_encode($propertyImagePaths);
                Log::info('Property images stored', [
                    'count' => count($propertyImagePaths),
                    'paths' => $propertyImagePaths
                ]);
            } else {
                $validated['property_images'] = null;
            }

            // Create the maintenance request
            $maintenanceRequest = new MaintenanceRequest($validated);
            
            // Explicitly set the selected language
            $maintenanceRequest->selected_language = $selectedLanguage;
            
            // Save the maintenance request
            $maintenanceRequest->save();
            
            // Force update the selected_language directly in the database to ensure it's set
            DB::statement("UPDATE maintenance_requests SET selected_language = ? WHERE id = ?", [
                $selectedLanguage, $maintenanceRequest->id
            ]);
            
            // Refresh the model to get the updated value
            $maintenanceRequest = $maintenanceRequest->fresh();
            
            Log::info('Maintenance request created with explicit language', [
                'id' => $maintenanceRequest->id,
                'selected_language' => $maintenanceRequest->selected_language,
                'expected_language' => $selectedLanguage,
                'selected_language_after_refresh' => $maintenanceRequest->selected_language
            ]);
            
            // Ensure the is_digital_signature flag is set if there's a signature
            if (!$maintenanceRequest->is_digital_signature && 
                (!empty($maintenanceRequest->signature_file_path) || !empty($maintenanceRequest->tenant_signature))) {
                $maintenanceRequest->is_digital_signature = true;
                $maintenanceRequest->save();
                
                Log::info('Fixed missing is_digital_signature flag', [
                    'id' => $maintenanceRequest->id,
                    'has_signature_path' => !empty($maintenanceRequest->signature_file_path),
                    'has_tenant_signature' => !empty($maintenanceRequest->tenant_signature)
                ]);
            }
            
            Log::info('Maintenance request created', [
                'id' => $maintenanceRequest->id,
                'work_order' => $maintenanceRequest->work_order_number,
                'has_signature_path' => !empty($validated['signature_file_path']),
                'signature_path' => $validated['signature_file_path'] ?? 'null',
                'is_digital_signature' => $validated['is_digital_signature'] ?? false,
                'has_tenant_signature' => !empty($validated['tenant_signature'])
            ]);

            // Store form submission data in session for 24 hours
            $formData = [
                'submitted' => true,
                'submission_time' => now()->setTimezone('America/Los_Angeles')->toDateTimeString(),
                'expires_at' => now()->setTimezone('America/Los_Angeles')->addHours(24)->toDateTimeString(),
                'request_id' => $maintenanceRequest->id,
                'work_order_number' => $maintenanceRequest->work_order_number,
                'tenant_name' => $validated['tenant_name'],
                'tenant_email' => $validated['tenant_email'],
            ];
            
            // Store in session
            session(['maintenance_form_submitted' => $formData]);
            
            // Log session data
            Log::info('Maintenance form session data stored', [
                'session_data' => $formData,
                'request_id' => $maintenanceRequest->id
            ]);
            
            // Generate PDF in the background
            try {
                $this->generateAndSendPDF($maintenanceRequest);
            } catch (\Exception $e) {
                Log::error('Error with PDF generation or email sending: ' . $e->getMessage(), [
                    'exception' => $e,
                    'request_id' => $maintenanceRequest->id
                ]);
                // Continue despite PDF error
            }

            // Create notifications for admin users
            \App\Http\Controllers\NotificationController::createNewRequestNotification($maintenanceRequest);

            // Store the request ID in the session for the thank you page
            session(['maintenance_request_id' => $maintenanceRequest->id]);
            
            // Return JSON success response for AJAX request
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Maintenance request submitted successfully',
                    'redirect' => route('maintenance.thanks'),
                    'request_id' => $maintenanceRequest->id,
                    'work_order' => $maintenanceRequest->work_order_number
                ]);
            }
            
            // For regular requests, return a redirect response
            return redirect()->route('maintenance.thanks');
            
        } catch (\Exception $e) {
            $errorMessage = $e->getMessage();
            $errorType = 'general';
            
            // Categorize error for better client response
            if (stripos($errorMessage, 'signature') !== false) {
                $errorType = 'signature';
            } elseif (stripos($errorMessage, 'image') !== false || stripos($errorMessage, 'file') !== false) {
                $errorType = 'file';
            }
            
            Log::error('Error creating maintenance request: ' . $errorMessage, [
                'request_data' => $request->except(['tenant_signature', 'signature_file']),
                'exception' => $e,
                'trace' => $e->getTraceAsString(),
                'error_type' => $errorType
            ]);
            
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create maintenance request: ' . $errorMessage,
                    'error' => $errorMessage,
                    'error_type' => $errorType,
                    'tenant_signature' => $errorType === 'signature' ? 'Signature processing failed: ' . $errorMessage : null,
                    'debug_info' => config('app.debug') ? [
                        'message' => $errorMessage,
                        'file' => $e->getFile(),
                        'line' => $e->getLine()
                    ] : null
                ], 500);
            }
            
            return back()->withErrors([
                'error' => 'Failed to create maintenance request: ' . $errorMessage,
                'tenant_signature' => $errorType === 'signature' ? 'Signature processing failed: ' . $errorMessage : null
            ]);
        }
    }
    
    /**
     * Generate and send PDF to tenant and admin.
     */
    private function generateAndSendPDF(MaintenanceRequest $maintenanceRequest)
    {
        try {
            // Make sure we have the latest data with translations
            $maintenanceRequest = $maintenanceRequest->fresh();
            
            // Generate PDF in English for admin
            $adminPdf = new Dompdf();
            $adminPdf->loadHtml(view('pdf.maintenance-request', [
                'request' => $maintenanceRequest,
                'date' => now()->setTimezone('America/Los_Angeles')->format('F j, Y'),
                'signatureImage' => $maintenanceRequest->tenant_signature,
                'tenant_signature' => $maintenanceRequest->tenant_signature,
                'is_digital_signature' => $maintenanceRequest->is_digital_signature ?? false,
                'language' => 'en', // Always English for admin
                'forAdmin' => true, // Flag to show original Spanish text alongside translations
            ])->render());
            $adminPdf->setPaper('A4', 'portrait');
            $adminPdf->render();
            
            $adminPdfFilename = 'maintenance_request_' . $maintenanceRequest->id . '_en_admin.pdf';
            $adminPdfPath = 'maintenance_requests/' . $adminPdfFilename;
            Storage::disk('public')->put($adminPdfPath, $adminPdf->output());
            
            // Generate PDF in tenant's selected language
            $tenantPdf = new Dompdf();
            $tenantPdf->loadHtml(view('pdf.maintenance-request', [
                'request' => $maintenanceRequest,
                'date' => now()->setTimezone('America/Los_Angeles')->format('F j, Y'),
                'signatureImage' => $maintenanceRequest->tenant_signature,
                'tenant_signature' => $maintenanceRequest->tenant_signature,
                'is_digital_signature' => $maintenanceRequest->is_digital_signature ?? false,
                'language' => $maintenanceRequest->selected_language, // Use tenant's selected language
                'forAdmin' => false, // Flag to hide translation notes
            ])->render());
            $tenantPdf->setPaper('A4', 'portrait');
            $tenantPdf->render();
            
            $tenantPdfFilename = 'maintenance_request_' . $maintenanceRequest->id . '_' . $maintenanceRequest->selected_language . '.pdf';
            $tenantPdfPath = 'maintenance_requests/' . $tenantPdfFilename;
            Storage::disk('public')->put($tenantPdfPath, $tenantPdf->output());
            
            // Save the tenant's PDF path to the database
            $maintenanceRequest->pdf_path = $tenantPdfPath;
            $maintenanceRequest->save();
            
            // Send email to tenant
            $this->sendTenantEmail($maintenanceRequest, $tenantPdfPath);
            
            // Send email to admin
            $this->sendAdminEmail($maintenanceRequest, $adminPdfPath);
            
            return true;
        } catch (\Exception $e) {
            Log::error('Error generating or sending PDF: ' . $e->getMessage(), [
                'request_id' => $maintenanceRequest->id,
                'exception' => $e
            ]);
            
            return false;
        }
    }
    
    /**
     * Send email to tenant with PDF attachment.
     */
    private function sendTenantEmail(MaintenanceRequest $maintenanceRequest, $pdfPath)
    {
        try {
            // Use the tenant's selected language for the email
            $language = $maintenanceRequest->selected_language;
            
            // Determine email subject and message based on language
            $subject = ($language === 'es') 
                ? 'Solicitud de Mantenimiento - ' . $maintenanceRequest->building_name . ' - Unidad ' . $maintenanceRequest->unit_number
                : 'Maintenance Request - ' . $maintenanceRequest->building_name . ' - Unit ' . $maintenanceRequest->unit_number;
                
            $message = ($language === 'es')
                ? 'Gracias por enviar su solicitud de mantenimiento. Adjunto encontrará una copia de su solicitud.'
                : 'Thank you for submitting your maintenance request. Please find a copy of your request attached.';
            
            Mail::send('emails.maintenance-request-submitted', [
                'maintenanceRequest' => $maintenanceRequest,
                'messageContent' => $message,
                'language' => $language,
            ], function ($mail) use ($maintenanceRequest, $pdfPath, $subject) {
                $mail->to($maintenanceRequest->tenant_email)
                    ->subject($subject)
                    ->attach(
                        Storage::disk('public')->path($pdfPath),
                        ['as' => 'maintenance-request.pdf', 'mime' => 'application/pdf']
                    );
            });
            
            // Update email delivery status
            $maintenanceRequest->email_delivery_status = 'sent';
            $maintenanceRequest->save();
            
            return true;
        } catch (\Exception $e) {
            // Update email delivery status
            $maintenanceRequest->email_delivery_status = 'failed';
            $maintenanceRequest->save();
            
            Log::error('Error sending tenant email: ' . $e->getMessage(), [
                'request_id' => $maintenanceRequest->id,
                'exception' => $e
            ]);
            
            return false;
        }
    }
    
    /**
     * Send email to admin with PDF attachment.
     */
    private function sendAdminEmail(MaintenanceRequest $maintenanceRequest, $pdfPath)
    {
        try {
            // Always use the specific admin email
            $adminEmail = 'itdev@navkarservices.com';
            
            Mail::send('emails.admin-maintenance-request', [
                'maintenanceRequest' => $maintenanceRequest,
                'messageContent' => 'A new maintenance request has been submitted.',
                'language' => 'en', // Always English for admin
            ], function ($mail) use ($maintenanceRequest, $pdfPath, $adminEmail) {
                $mail->to($adminEmail)
                    ->subject('New Maintenance Request - ' . $maintenanceRequest->building_name . ' - Unit ' . $maintenanceRequest->unit_number)
                    ->attach(
                        Storage::disk('public')->path($pdfPath),
                        ['as' => 'maintenance-request.pdf', 'mime' => 'application/pdf']
                    );
            });
            
            // We don't update email_delivery_status here since that's for tenant emails
            
            return true;
        } catch (\Exception $e) {
            Log::error('Error sending admin email: ' . $e->getMessage(), [
                'request_id' => $maintenanceRequest->id,
                'exception' => $e
            ]);
            
            return false;
        }
    }

    /**
     * Show the thank you page after submission.
     */
    public function thanks(Request $request)
    {
        // Get language from request if available
        $language = $request->query('lang', 'en');
        
        // Only allow valid languages
        if (!in_array($language, ['en', 'es'])) {
            $language = 'en';
        }
        
        // Check if user has submitted a form
        $formSubmitted = session('maintenance_form_submitted');
        
        // If no form submission found in session, redirect to form
        if (!$formSubmitted) {
            Log::info('User attempted to access thanks page without form submission');
            return redirect()->route('maintenance.create', ['lang' => $language]);
        }
        
        // Check if the submission has expired (24 hours)
        if (now()->setTimezone('America/Los_Angeles')->gt(new \DateTime($formSubmitted['expires_at']))) {
            Log::info('Form submission session expired', [
                'session_data' => $formSubmitted,
                'current_time' => now()->setTimezone('America/Los_Angeles')->toDateTimeString()
            ]);
            
            // Clear expired session data
            session()->forget('maintenance_form_submitted');
            
            // Redirect to form
            return redirect()->route('maintenance.create', ['lang' => $language]);
        }
        
        Log::info('User accessing thanks page with valid session', [
            'session_data' => $formSubmitted
        ]);
        
        return Inertia::render('MaintenanceRequest/Thanks', [
            'language' => $language,
            'formData' => $formSubmitted
        ]);
    }
    
    /**
     * Debug endpoint to check signature status (only available in debug mode)
     */
    public function debugSignature($id)
    {
        if (!config('app.debug')) {
            abort(404);
        }
        
        $request = MaintenanceRequest::findOrFail($id);
        
        $signatureInfo = [
            'id' => $request->id,
            'has_signature_file_path' => !empty($request->signature_file_path),
            'signature_file_path' => $request->signature_file_path,
            'has_tenant_signature' => !empty($request->tenant_signature),
            'tenant_signature_length' => $request->tenant_signature ? strlen($request->tenant_signature) : 0,
            'is_digital_signature' => (bool)$request->is_digital_signature,
            'file_exists' => !empty($request->signature_file_path) ? 
                file_exists(storage_path('app/public/' . $request->signature_file_path)) : false,
        ];
        
        if (!empty($request->signature_file_path)) {
            $fullPath = storage_path('app/public/' . $request->signature_file_path);
            if (file_exists($fullPath)) {
                $signatureInfo['file_size'] = filesize($fullPath);
                $signatureInfo['file_readable'] = is_readable($fullPath);
                $signatureInfo['file_content_sample'] = substr(base64_encode(file_get_contents($fullPath)), 0, 50) . '...';
            }
        }
        
        return response()->json($signatureInfo);
    }

    /**
     * Display the maintenance request form as a PDF.
     */
    public function viewFormPdf(Request $request)
    {
        try {
            // Get language preference if specified
            $language = $request->query('lang', 'en');
            
            // Only allow valid languages
            if (!in_array($language, ['en', 'es'])) {
                $language = 'en';
            }
            
            // Get request ID if provided
            $requestId = $request->query('id');
            
            // Create a new instance of Dompdf with options
            $options = new \Dompdf\Options();
            $options->set('isHtml5ParserEnabled', true);
            $options->set('isRemoteEnabled', true);
            $options->set('isFontSubsettingEnabled', true);
            
            // If a specific request ID is provided, show that request's PDF
            if ($requestId) {
                $maintenanceRequest = MaintenanceRequest::findOrFail($requestId);
                
                // Set language from the request if available
                if (!empty($maintenanceRequest->selected_language) && in_array($maintenanceRequest->selected_language, ['en', 'es'])) {
                    $language = $maintenanceRequest->selected_language;
                }
                
                // Get signature image
                $signatureImage = null;
                
                // Try to get signature from file
                if (!empty($maintenanceRequest->signature_file_path)) {
                    $path = storage_path('app/public/' . $maintenanceRequest->signature_file_path);
                    if (file_exists($path)) {
                        try {
                            $imageData = file_get_contents($path);
                            $base64Image = base64_encode($imageData);
                            $signatureImage = 'data:image/png;base64,' . $base64Image;
                        } catch (\Exception $e) {
                            Log::error('Error processing signature file for PDF view: ' . $e->getMessage());
                        }
                    }
                }
                
                // If no file signature, try using tenant_signature
                if (empty($signatureImage) && !empty($maintenanceRequest->tenant_signature)) {
                    $signatureImage = $maintenanceRequest->tenant_signature;
                }
                
                // Generate PDF from the existing request
                $html = view('pdf.maintenance-request', [
                    'request' => $maintenanceRequest,
                    'language' => $language,
                    'signatureImage' => $signatureImage,
                    'date' => now()->setTimezone('America/Los_Angeles')->format('F j, Y')
                ])->render();
            } else {
                // Create a new maintenance request for PDF generation (blank form)
                $maintenanceRequest = new MaintenanceRequest();
                
                // Generate the PDF content using our blank form template
                $html = view('pdf.maintenance-request-form', [
                    'request' => $maintenanceRequest,
                    'language' => $language,
                    'date' => now()->setTimezone('America/Los_Angeles')->format('F j, Y')
                ])->render();
            }
            
            // Generate the PDF
            $dompdf = new Dompdf($options);
            $dompdf->loadHtml($html);
            $dompdf->setPaper('letter', 'portrait');
            $dompdf->render();
            
            // Output the PDF to the browser
            return $dompdf->stream('maintenance_request_form.pdf', [
                'Attachment' => false
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error generating maintenance request form PDF: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            
            return response()->view('errors.pdf-generation-failed', [
                'message' => 'Failed to generate PDF: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Check if the user has already submitted a form.
     */
    public function checkSession(Request $request)
    {
        // Get the form submission data from session
        $formSubmitted = session('maintenance_form_submitted');
        
        // Check if there's a submission and it hasn't expired
        if ($formSubmitted) {
            // Check if the submission has expired (24 hours)
            if (now()->setTimezone('America/Los_Angeles')->gt(new \DateTime($formSubmitted['expires_at']))) {
                // Submission has expired, clear the session
                session()->forget('maintenance_form_submitted');
                
                Log::info('Form submission session expired during check', [
                    'session_data' => $formSubmitted,
                    'current_time' => now()->setTimezone('America/Los_Angeles')->toDateTimeString()
                ]);
                
                return response()->json([
                    'has_submission' => false,
                    'message' => 'Previous submission has expired'
                ]);
            }
            
            // Valid submission exists
            Log::info('Valid form submission found during check', [
                'session_data' => $formSubmitted
            ]);
            
            return response()->json([
                'has_submission' => true,
                'submission_data' => [
                    'work_order_number' => $formSubmitted['work_order_number'],
                    'submission_time' => $formSubmitted['submission_time'],
                    'expires_at' => $formSubmitted['expires_at']
                ]
            ]);
        }
        
        // No submission found
        return response()->json([
            'has_submission' => false,
            'message' => 'No previous submission found'
        ]);
    }
    
    /**
     * Clear the maintenance form session data
     */
    public function clearSession(Request $request)
    {
        // Get the current session data for logging
        $formSubmitted = session('maintenance_form_submitted');
        
        // Clear the session data
        session()->forget('maintenance_form_submitted');
        
        // Log the action
        Log::info('Maintenance form session data cleared manually', [
            'previous_session_data' => $formSubmitted,
            'user_agent' => $request->header('User-Agent'),
            'ip' => $request->ip()
        ]);
        
        // Return success response
        return response()->json([
            'success' => true,
            'message' => 'Session data cleared successfully'
        ]);
    }

    /**
     * Re-translate a maintenance request from Spanish to English.
     * This is useful for fixing existing requests with poor translations.
     * 
     * @param int $id The ID of the maintenance request to re-translate
     * @return \Illuminate\Http\JsonResponse
     */
    public function retranslateRequest($id)
    {
        try {
            // Find the maintenance request
            $maintenanceRequest = MaintenanceRequest::findOrFail($id);
            
            // Only re-translate if the request was originally in Spanish
            if ($maintenanceRequest->selected_language !== 'es') {
                return response()->json([
                    'success' => false,
                    'message' => 'This request is not in Spanish and does not need translation.'
                ]);
            }
            
            // Store original values for logging
            $originalTranslations = [
                'work_requested' => $maintenanceRequest->work_requested,
                'work_requested_translated' => $maintenanceRequest->work_requested_translated,
                'special_instructions' => $maintenanceRequest->special_instructions,
                'special_instructions_translated' => $maintenanceRequest->special_instructions_translated,
                'no_permission_reason' => $maintenanceRequest->no_permission_reason,
                'no_permission_reason_translated' => $maintenanceRequest->no_permission_reason_translated,
            ];
            
            // Re-translate work requested
            if (!empty($maintenanceRequest->work_requested_original)) {
                $maintenanceRequest->work_requested_translated = $this->translationService->translate(
                    $maintenanceRequest->work_requested_original,
                    'es',
                    'en'
                );
                $maintenanceRequest->work_requested = $maintenanceRequest->work_requested_translated;
            }
            
            // Re-translate special instructions
            if (!empty($maintenanceRequest->special_instructions_original)) {
                $maintenanceRequest->special_instructions_translated = $this->translationService->translate(
                    $maintenanceRequest->special_instructions_original,
                    'es',
                    'en'
                );
                $maintenanceRequest->special_instructions = $maintenanceRequest->special_instructions_translated;
            }
            
            // Re-translate no permission reason
            if (!empty($maintenanceRequest->no_permission_reason_original)) {
                $maintenanceRequest->no_permission_reason_translated = $this->translationService->translate(
                    $maintenanceRequest->no_permission_reason_original,
                    'es',
                    'en'
                );
                $maintenanceRequest->no_permission_reason = $maintenanceRequest->no_permission_reason_translated;
            }
            
            // Save the updated request
            $maintenanceRequest->save();
            
            // Log the translation changes
            Log::info('Maintenance request re-translated', [
                'request_id' => $maintenanceRequest->id,
                'original' => $originalTranslations,
                'new' => [
                    'work_requested' => $maintenanceRequest->work_requested,
                    'work_requested_translated' => $maintenanceRequest->work_requested_translated,
                    'special_instructions' => $maintenanceRequest->special_instructions,
                    'special_instructions_translated' => $maintenanceRequest->special_instructions_translated,
                    'no_permission_reason' => $maintenanceRequest->no_permission_reason,
                    'no_permission_reason_translated' => $maintenanceRequest->no_permission_reason_translated,
                ]
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Maintenance request successfully re-translated.',
                'translations' => [
                    'work_requested' => $maintenanceRequest->work_requested_translated,
                    'special_instructions' => $maintenanceRequest->special_instructions_translated,
                    'no_permission_reason' => $maintenanceRequest->no_permission_reason_translated,
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error re-translating maintenance request: ' . $e->getMessage(), [
                'request_id' => $id,
                'exception' => $e
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to re-translate maintenance request: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Update the property for a maintenance request.
     */
    public function updateProperty($id, Request $request)
    {
        try {
            $validated = $request->validate([
                'property_id' => 'required|exists:properties,id',
            ]);
            
            $maintenanceRequest = MaintenanceRequest::findOrFail($id);
            $maintenanceRequest->update([
                'property_id' => $validated['property_id'],
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Property updated successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating property for maintenance request: ' . $e->getMessage(), [
                'id' => $id,
                'property_id' => $request->input('property_id'),
                'exception' => $e
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update property',
            ], 500);
        }
    }

    /**
     * Remove the specified maintenance request from storage.
     */
    public function destroy($id)
    {
        $user = Auth::user();
        if (!$user || !$user->isSuperAdmin()) {
            abort(403, 'Unauthorized - Only Super Administrators can delete maintenance requests');
        }
        
        // Get the current page and other query parameters
        $currentPage = request()->query('page');
        $queryParams = request()->only(['search', 'status', 'building_id', 'start_date', 'end_date', 'sort_field', 'sort_direction', 'page']);
        
        $request = MaintenanceRequest::findOrFail($id);
        $request->delete();
        
        // Redirect back to the same page with the same filters
        return redirect()->route('admin.maintenance-requests', $queryParams)->with('success', 'Maintenance request deleted successfully.');
    }
}