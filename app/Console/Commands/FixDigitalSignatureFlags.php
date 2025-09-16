<?php

namespace App\Console\Commands;

use App\Models\MaintenanceRequest;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class FixDigitalSignatureFlags extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fix-digital-signature-flags';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix missing digital signature flags in maintenance requests';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Fixing digital signature flags...');
        
        // Find all maintenance requests that have a signature but no digital signature flag
        $requests = MaintenanceRequest::where('is_digital_signature', false)
            ->where(function($query) {
                $query->whereNotNull('signature_file_path')
                      ->orWhereNotNull('tenant_signature');
            })
            ->get();
            
        $this->info("Found {$requests->count()} maintenance requests to fix");
        
        $fixed = 0;
        
        foreach ($requests as $request) {
            $hasSignature = !empty($request->signature_file_path) || !empty($request->tenant_signature);
            
            if ($hasSignature) {
                $request->is_digital_signature = true;
                $request->save();
                
                $fixed++;
                
                $this->info("Fixed request #{$request->id} - {$request->tenant_name}");
                
                Log::info('Fixed digital signature flag via command', [
                    'id' => $request->id,
                    'has_signature_path' => !empty($request->signature_file_path),
                    'has_tenant_signature' => !empty($request->tenant_signature)
                ]);
            }
        }
        
        $this->info("Fixed $fixed maintenance requests");
        
        return Command::SUCCESS;
    }
}
