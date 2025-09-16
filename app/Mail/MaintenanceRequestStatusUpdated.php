<?php

namespace App\Mail;

use App\Models\MaintenanceRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class MaintenanceRequestStatusUpdated extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public MaintenanceRequest $maintenanceRequest,
        public string $status,
        public ?string $message = null
    ) {
        // Add debug logging
        \Illuminate\Support\Facades\Log::info('MaintenanceRequestStatusUpdated constructed', [
            'request_id' => $maintenanceRequest->id,
            'status' => $status,
            'message_length' => $message ? strlen($message) : 0,
            'tenant_email' => $maintenanceRequest->tenant_email,
        ]);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->status === 'approved' 
            ? 'Your Maintenance Request Has Been Approved - ' . $this->maintenanceRequest->building_name . ' - Unit ' . $this->maintenanceRequest->unit_number
            : 'Update on Your Maintenance Request - ' . $this->maintenanceRequest->building_name . ' - Unit ' . $this->maintenanceRequest->unit_number;
        
        // Log the envelope creation
        \Illuminate\Support\Facades\Log::info('MaintenanceRequestStatusUpdated envelope created', [
            'subject' => $subject,
            'request_id' => $this->maintenanceRequest->id,
        ]);
        
        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        // Log content creation
        \Illuminate\Support\Facades\Log::info('MaintenanceRequestStatusUpdated content starting', [
            'request_id' => $this->maintenanceRequest->id,
            'status' => $this->status,
        ]);
        
        // Get settings from database
        $settings = DB::table('settings')->first() ?? new \stdClass();
        
        // Get appropriate template based on status
        if ($this->status === 'approved') {
            $template = $settings->approval_template ?? 'Your maintenance request has been approved. Our team will arrive as scheduled on {scheduled_date} at {scheduled_time}.';
        } else {
            $template = $settings->rejection_template ?? 'Unfortunately, we are unable to approve your maintenance request at this time.';
        }
        
        // Replace variables in template
        $messageContent = $this->processTemplate($template);
        
        // Use custom message if provided
        if ($this->message) {
            $messageContent = $this->message;
        }
        
        // Add email signature if available
        $signature = $settings->email_signature ?? '';
        
        return new Content(
            view: 'emails.maintenance-request-status',
            with: [
                'maintenanceRequest' => $this->maintenanceRequest,
                'status' => $this->status,
                'messageContent' => $messageContent,
                'signature' => $signature,
                'companyName' => $settings->company_name ?? ' Triumph Residential services',
            ],
        );
    }

    /**
     * Process template by replacing variables with actual values.
     */
    private function processTemplate(string $template): string
    {
        $replacements = [
            '{tenant_name}' => $this->maintenanceRequest->tenant_name,
            '{work_order_number}' => $this->maintenanceRequest->work_order_number,
            '{scheduled_date}' => $this->maintenanceRequest->scheduled_date?->format('l, F j, Y'),
            '{scheduled_time}' => $this->maintenanceRequest->scheduled_time,
        ];
        
        return str_replace(array_keys($replacements), array_values($replacements), $template);
    }
} 