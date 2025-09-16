<?php

namespace App\Mail;

use App\Models\MaintenanceRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Attachment;
use Dompdf\Dompdf;
use Illuminate\Support\Facades\DB;

class MaintenanceRequestSubmitted extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public MaintenanceRequest $maintenanceRequest,
        public Dompdf $pdf
    ) {
        // Double-check the language directly from the database
        try {
            $dbLanguage = DB::table('maintenance_requests')
                ->where('id', $this->maintenanceRequest->id)
                ->value('selected_language');
                
            if ($dbLanguage) {
                // Update the model if needed
                if ($this->maintenanceRequest->selected_language !== $dbLanguage) {
                    $this->maintenanceRequest->selected_language = $dbLanguage;
                    \Log::info('Updated language from DB in email constructor', [
                        'request_id' => $this->maintenanceRequest->id,
                        'previous_language' => $this->maintenanceRequest->selected_language,
                        'db_language' => $dbLanguage
                    ]);
                }
            }
        } catch (\Exception $e) {
            \Log::error('Error checking language from DB in email constructor: ' . $e->getMessage());
        }
        
        // Decode property images if they're stored as JSON
        if (!empty($this->maintenanceRequest->property_images) && is_string($this->maintenanceRequest->property_images)) {
            try {
                $this->maintenanceRequest->property_images = json_decode($this->maintenanceRequest->property_images, true) ?? [];
                \Log::info('Decoded property images in email constructor', [
                    'request_id' => $this->maintenanceRequest->id,
                    'image_count' => count($this->maintenanceRequest->property_images)
                ]);
            } catch (\Exception $e) {
                \Log::error('Error decoding property images in email constructor: ' . $e->getMessage());
                $this->maintenanceRequest->property_images = [];
            }
        }
        
        // Log the maintenanceRequest model for debugging
        \Log::info('MaintenanceRequestSubmitted constructor', [
            'request_id' => $this->maintenanceRequest->id,
            'selected_language' => $this->maintenanceRequest->selected_language,
            'has_selected_language' => isset($this->maintenanceRequest->selected_language),
            'attributes' => $this->maintenanceRequest->getAttributes()
        ]);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        // Get the selected language or default to English
        $language = $this->maintenanceRequest->selected_language ?? 'en';
        
        // Set the subject based on language
        $subject = $language === 'es' 
            ? 'Solicitud de Mantenimiento - ' . $this->maintenanceRequest->building_name . ' - Unidad ' . $this->maintenanceRequest->unit_number
            : 'Maintenance Request - ' . $this->maintenanceRequest->building_name . ' - Unit ' . $this->maintenanceRequest->unit_number;
            
        \Log::info('Email envelope created with language', [
            'language' => $language,
            'subject' => $subject,
            'request_id' => $this->maintenanceRequest->id
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
        // Get the selected language or default to English
        $language = $this->maintenanceRequest->selected_language ?? 'en';
        
        // Log for debugging
        \Log::info('Email content language for maintenance request', [
            'request_id' => $this->maintenanceRequest->id,
            'language' => $language,
            'has_language_field' => isset($this->maintenanceRequest->selected_language),
            'selected_language_value' => $this->maintenanceRequest->selected_language,
        ]);
        
        return new Content(
            view: 'emails.maintenance-request-submitted',
            with: [
                'language' => $language,
                'maintenanceRequest' => $this->maintenanceRequest
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $attachments = [];
        
        try {
            // Get the PDF content from the Dompdf instance
            $pdfContent = $this->pdf->output();
            
            // Add the PDF as an attachment
            $attachments[] = Attachment::fromData(fn () => $pdfContent, 'maintenance-request-' . $this->maintenanceRequest->work_order_number . '.pdf')
                ->withMime('application/pdf');
                
            \Log::info('PDF attached to email from Dompdf instance', [
                'request_id' => $this->maintenanceRequest->id,
                'pdf_size' => strlen($pdfContent)
            ]);
                
        } catch (\Exception $e) {
            \Log::error('Failed to attach PDF to email from Dompdf instance', [
                'error' => $e->getMessage(),
                'request_id' => $this->maintenanceRequest->id
            ]);
            
            // If we have a saved PDF path, try to attach that instead
            if ($this->maintenanceRequest->pdf_path) {
                $path = storage_path('app/public/' . $this->maintenanceRequest->pdf_path);
                if (file_exists($path)) {
                    try {
                        $attachments[] = Attachment::fromPath($path)
                            ->withMime('application/pdf');
                        
                        \Log::info('PDF attached to email from storage path', [
                            'request_id' => $this->maintenanceRequest->id,
                            'path' => $this->maintenanceRequest->pdf_path,
                            'file_size' => filesize($path)
                        ]);
                    } catch (\Exception $e) {
                        \Log::error('Failed to attach PDF from storage path', [
                            'error' => $e->getMessage(),
                            'path' => $path,
                            'request_id' => $this->maintenanceRequest->id
                        ]);
                    }
                } else {
                    \Log::warning('PDF file not found in storage', [
                        'path' => $path,
                        'request_id' => $this->maintenanceRequest->id
                    ]);
                }
            }
        }
        
        // Attach property images as separate attachments
        if (!empty($this->maintenanceRequest->property_images) && is_array($this->maintenanceRequest->property_images)) {
            foreach ($this->maintenanceRequest->property_images as $index => $imagePath) {
                $fullPath = storage_path('app/public/' . $imagePath);
                
                if (file_exists($fullPath)) {
                    try {
                        // Get file extension and mime type
                        $extension = pathinfo($fullPath, PATHINFO_EXTENSION);
                        $mimeType = 'image/' . ($extension ?: 'jpeg');
                        
                        // Add as attachment with a clear name
                        $attachments[] = Attachment::fromPath($fullPath)
                            ->as('property-image-' . ($index + 1) . '.' . $extension)
                            ->withMime($mimeType);
                        
                        \Log::info('Added property image to email attachment', [
                            'index' => $index,
                            'path' => $imagePath,
                            'mime' => $mimeType,
                            'file_size' => filesize($fullPath)
                        ]);
                    } catch (\Exception $e) {
                        \Log::error('Failed to attach property image', [
                            'error' => $e->getMessage(),
                            'index' => $index,
                            'path' => $imagePath,
                            'request_id' => $this->maintenanceRequest->id
                        ]);
                    }
                } else {
                    \Log::warning('Property image not found for email attachment', [
                        'index' => $index,
                        'path' => $imagePath,
                        'full_path' => $fullPath,
                        'request_id' => $this->maintenanceRequest->id
                    ]);
                }
            }
        }
        
        \Log::info('Email attachments prepared', [
            'request_id' => $this->maintenanceRequest->id,
            'attachment_count' => count($attachments)
        ]);
        
        return $attachments;
    }
} 