<?php

require_once __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Mail;
use App\Mail\MaintenanceRequestStatusUpdated;
use App\Models\MaintenanceRequest;

try {
    // Test 1: Simple raw email
    echo "Testing simple raw email...\n";
    Mail::raw('This is a test email', function($message) {
        $message->to('itdev@navkarservices.com')
            ->subject('Test Email');
    });
    echo "Raw email sent successfully\n\n";

    // Test 2: Find a maintenance request
    echo "Finding a maintenance request...\n";
    $request = MaintenanceRequest::first();
    
    if (!$request) {
        echo "Error: No maintenance request found in database\n";
        exit;
    }
    
    echo "Found maintenance request #{$request->work_order_number}\n\n";
    
    // Test 3: Send approval email
    echo "Testing approval email...\n";
    Mail::to($request->tenant_email)
        ->send(new MaintenanceRequestStatusUpdated($request, 'approved', 'This is a test approval message'));
    echo "Approval email sent successfully to {$request->tenant_email}\n\n";
    
    // Test 4: Send rejection email
    echo "Testing rejection email...\n";
    Mail::to($request->tenant_email)
        ->send(new MaintenanceRequestStatusUpdated($request, 'rejected', 'This is a test rejection message'));
    echo "Rejection email sent successfully to {$request->tenant_email}\n\n";
    
    echo "All email tests completed successfully\n";
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
} 