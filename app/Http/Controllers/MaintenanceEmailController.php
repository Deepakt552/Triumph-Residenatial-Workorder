<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\MaintenanceRequestStatusUpdated;
use Illuminate\Support\Facades\Storage;
use Dompdf\Dompdf;
use App\Services\TranslationService;

class MaintenanceEmailController extends Controller
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
     * Approve a maintenance request and send an email notification.
     */
    public function approve(Request $request, $id)
    {
        // Log the request data for debugging
        Log::info('MaintenanceEmailController - Approve request data:', [
            'all_data' => $request->all(),
            'content_type' => $request->header('Content-Type'),
            'message' => $request->input('message'),
            'notes' => $request->input('notes'),
        ]);
        
        // Find the maintenance request
        $maintenanceRequest = MaintenanceRequest::findOrFail($id);
        Log::info('Found maintenance request:', [
            'id' => $maintenanceRequest->id,
            'tenant_email' => $maintenanceRequest->tenant_email,
            'status' => $maintenanceRequest->status,
            'language' => $maintenanceRequest->selected_language
        ]);
        
        // Update the status
        $maintenanceRequest->status = 'approved';
        $maintenanceRequest->save();
        
        // Translate the message if needed
        $messageContent = $request->input('message') ?: 'Your maintenance request has been approved. Our team will arrive as scheduled.';
        $translatedMessage = $messageContent;
        
        // If tenant selected Spanish, translate the message to Spanish
        if ($maintenanceRequest->selected_language === 'es') {
            $translatedMessage = $this->translationService->translate($messageContent, 'en', 'es');
        }
        
        // Send email
        $emailSent = false;
        $errorMessage = null;
        
        try {
            // For debugging
            Log::info('Attempting to send approval email to ' . $maintenanceRequest->tenant_email);
            
            // Using direct Mail::send approach that works in resendPdf instead of Mailable
            Mail::send('emails.maintenance-request-status', [
                'maintenanceRequest' => $maintenanceRequest,
                'status' => 'approved',
                'messageContent' => $maintenanceRequest->selected_language === 'es' ? $translatedMessage : $messageContent,
                'signature' => '',
                'companyName' => ' Triumph Residential services',
                'language' => $maintenanceRequest->selected_language,
            ], function ($message) use ($maintenanceRequest) {
                // Set subject based on language
                $subject = $maintenanceRequest->selected_language === 'es' 
                    ? 'Su Solicitud de Mantenimiento Ha Sido Aprobada - ' . $maintenanceRequest->building_name . ' - Unidad ' . $maintenanceRequest->unit_number
                    : 'Your Maintenance Request Has Been Approved - ' . $maintenanceRequest->building_name . ' - Unit ' . $maintenanceRequest->unit_number;
                    
                $message->to($maintenanceRequest->tenant_email)
                    ->subject($subject);
            });
            
            // Update email delivery status
            $maintenanceRequest->email_delivery_status = 'sent';
            $maintenanceRequest->save();
            
            // Log successful email sending
            Log::info('Approval email sent successfully', [
                'request_id' => $id,
                'email' => $maintenanceRequest->tenant_email,
                'message' => $request->input('message'),
                'language' => $maintenanceRequest->selected_language
            ]);
            
            $emailSent = true;
        } catch (\Exception $e) {
            // Update email delivery status
            $maintenanceRequest->email_delivery_status = 'failed';
            $maintenanceRequest->save();
            
            // Log email sending failure
            Log::error('Failed to send approval email', [
                'request_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $errorMessage = $e->getMessage();
        }
        
        // Return response
        if ($emailSent) {
            return response()->json([
                'success' => true,
                'message' => 'Maintenance request approved and email sent successfully to ' . $maintenanceRequest->tenant_email
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send email notification: ' . $errorMessage
            ], 500);
        }
    }
    
    /**
     * Reject a maintenance request and send an email notification.
     */
    public function reject(Request $request, $id)
    {
        // Validate the request
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
        ]);
        
        // Log the request data for debugging
        Log::info('MaintenanceEmailController - Reject request data:', [
            'all_data' => $request->all(),
            'content_type' => $request->header('Content-Type'),
            'message' => $request->input('message'),
            'notes' => $request->input('notes'),
        ]);
        
        // Find the maintenance request
        $maintenanceRequest = MaintenanceRequest::findOrFail($id);
        Log::info('Found maintenance request:', [
            'id' => $maintenanceRequest->id,
            'tenant_email' => $maintenanceRequest->tenant_email,
            'status' => $maintenanceRequest->status,
            'language' => $maintenanceRequest->selected_language
        ]);
        
        // Update the status and store the rejection reason
        $maintenanceRequest->status = 'rejected';
        $maintenanceRequest->rejection_reason = $request->input('message');
        $maintenanceRequest->save();
        
        // Translate the message if needed
        $messageContent = $request->input('message') ?: 'Unfortunately, we are unable to approve your maintenance request at this time.';
        $translatedMessage = $messageContent;
        
        // If tenant selected Spanish, translate the message to Spanish
        if ($maintenanceRequest->selected_language === 'es') {
            $translatedMessage = $this->translationService->translate($messageContent, 'en', 'es');
        }
        
        // Send email
        $emailSent = false;
        $errorMessage = null;
        
        try {
            // For debugging
            Log::info('Attempting to send rejection email to ' . $maintenanceRequest->tenant_email);
            
            // Using direct Mail::send approach that works in resendPdf instead of Mailable
            Mail::send('emails.maintenance-request-status', [
                'maintenanceRequest' => $maintenanceRequest,
                'status' => 'rejected',
                'messageContent' => $maintenanceRequest->selected_language === 'es' ? $translatedMessage : $messageContent,
                'signature' => '',
                'companyName' => ' Triumph Residential services',
                'language' => $maintenanceRequest->selected_language,
            ], function ($message) use ($maintenanceRequest) {
                // Set subject based on language
                $subject = $maintenanceRequest->selected_language === 'es' 
                    ? 'Actualización sobre Su Solicitud de Mantenimiento - ' . $maintenanceRequest->building_name . ' - Unidad ' . $maintenanceRequest->unit_number
                    : 'Update on Your Maintenance Request - ' . $maintenanceRequest->building_name . ' - Unit ' . $maintenanceRequest->unit_number;
                    
                $message->to($maintenanceRequest->tenant_email)
                    ->subject($subject);
            });
            
            // Update email delivery status
            $maintenanceRequest->email_delivery_status = 'sent';
            $maintenanceRequest->save();
            
            // Log successful email sending
            Log::info('Rejection email sent successfully', [
                'request_id' => $id,
                'email' => $maintenanceRequest->tenant_email,
                'message' => $request->input('message'),
                'language' => $maintenanceRequest->selected_language
            ]);
            
            $emailSent = true;
        } catch (\Exception $e) {
            // Update email delivery status
            $maintenanceRequest->email_delivery_status = 'failed';
            $maintenanceRequest->save();
            
            // Log email sending failure
            Log::error('Failed to send rejection email', [
                'request_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $errorMessage = $e->getMessage();
        }
        
        // Return response
        if ($emailSent) {
            return response()->json([
                'success' => true,
                'message' => 'Maintenance request rejected and email sent successfully to ' . $maintenanceRequest->tenant_email
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send email notification: ' . $errorMessage
            ], 500);
        }
    }
    
    /**
     * Resend the PDF for a maintenance request.
     */
    public function resendPdf(Request $request, $id)
    {
        // Validate the request
        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'message' => 'nullable|string|max:1000',
        ]);
        
        // Log the request data for debugging
        Log::info('MaintenanceEmailController - Resend PDF request data:', [
            'all_data' => $request->all(),
            'content_type' => $request->header('Content-Type'),
            'email' => $request->input('email'),
            'message' => $request->input('message')
        ]);
        
        // Find the maintenance request
        $maintenanceRequest = MaintenanceRequest::findOrFail($id);
        Log::info('Found maintenance request for PDF resend:', [
            'id' => $maintenanceRequest->id,
            'tenant_email' => $maintenanceRequest->tenant_email,
            'status' => $maintenanceRequest->status,
            'has_pdf' => !empty($maintenanceRequest->pdf_path)
        ]);
        
        // Check if PDF exists
        if (!$maintenanceRequest->pdf_path || !Storage::disk('public')->exists($maintenanceRequest->pdf_path)) {
            // Generate PDF if it doesn't exist
            Log::info('PDF not found, generating new one');
            
            $pdf = new Dompdf();
            $pdf->loadHtml(view('pdf.maintenance-request', [
                'request' => $maintenanceRequest,
                'date' => now()->setTimezone('America/Los_Angeles')->format('F j, Y'),
                'signatureImage' => $maintenanceRequest->tenant_signature,
                'tenant_signature' => $maintenanceRequest->tenant_signature,
                'is_digital_signature' => $maintenanceRequest->is_digital_signature ?? false,
                'language' => 'en', // Default to English language
            ])->render());
            $pdf->setPaper('A4', 'portrait');
            $pdf->render();
            
            $pdfFilename = 'maintenance_request_' . $maintenanceRequest->id . '_en.pdf';
            $pdfPath = 'maintenance_requests/' . $pdfFilename;
            Storage::disk('public')->put($pdfPath, $pdf->output());
            
            $maintenanceRequest->pdf_path = $pdfPath;
            $maintenanceRequest->save();
            
            Log::info('Generated new PDF', [
                'path' => $pdfPath
            ]);
        }
        
        // Send email
        $emailSent = false;
        $errorMessage = null;
        
        try {
            // For debugging
            Log::info('Attempting to send PDF to ' . $request->input('email'));
            
            Mail::send('emails.resend-pdf', [
                'maintenanceRequest' => $maintenanceRequest,
                'messageContent' => $request->input('message') ?: 'Here is a copy of your maintenance request form.'
            ], function ($message) use ($maintenanceRequest, $request) {
                $message->to($request->input('email'))
                    ->subject('Maintenance Request - ' . $maintenanceRequest->work_order_number)
                    ->attach(
                        Storage::disk('public')->path($maintenanceRequest->pdf_path),
                        ['as' => 'maintenance-request.pdf', 'mime' => 'application/pdf']
                    );
            });
            
            // Update email delivery status
            $maintenanceRequest->email_delivery_status = 'sent';
            $maintenanceRequest->save();
            
            // Log successful email sending
            Log::info('PDF resent successfully', [
                'request_id' => $id,
                'email' => $request->input('email'),
                'message' => $request->input('message')
            ]);
            
            $emailSent = true;
        } catch (\Exception $e) {
            // Update email delivery status
            $maintenanceRequest->email_delivery_status = 'failed';
            $maintenanceRequest->save();
            
            // Log email sending failure
            Log::error('Failed to resend PDF', [
                'request_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $errorMessage = $e->getMessage();
        }
        
        // Return response
        if ($emailSent) {
            return response()->json([
                'success' => true,
                'message' => 'Maintenance request PDF sent successfully to ' . $request->input('email')
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send PDF: ' . $errorMessage
            ], 500);
        }
    }
} 