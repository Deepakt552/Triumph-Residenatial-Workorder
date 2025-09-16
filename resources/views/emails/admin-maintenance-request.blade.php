<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Maintenance Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
        }
        .header {
            background-color: #003366;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 20px;
        }
        .footer {
            background-color: #f4f4f4;
            padding: 10px 20px;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
        .details {
            margin: 20px 0;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
        }
        .detail-row {
            margin-bottom: 10px;
        }
        .detail-label {
            font-weight: bold;
        }
        .translation-box {
            background-color: #f9f9f9;
            border-left: 3px solid #003366;
            padding: 10px;
            margin-top: 5px;
        }
        .alert {
            background-color: #fff3cd;
            border: 1px solid #ffeeba;
            color: #856404;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>New Maintenance Request</h1>
    </div>
    
    <div class="content">
        <p>{{ $messageContent }}</p>
        
        @if($maintenanceRequest->selected_language === 'es')
        <div class="alert">
            <strong>Note:</strong> This request was submitted in Spanish and has been automatically translated to English.
        </div>
        @endif
        
        <div class="details">
            <div class="detail-row">
                <span class="detail-label">Submission Date:</span>
                <span>{{ $maintenanceRequest->created_at->format('F j, Y, g:i a') }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Tenant:</span>
                <span>{{ $maintenanceRequest->tenant_name }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Contact:</span>
                <span>{{ $maintenanceRequest->tenant_email }} | {{ $maintenanceRequest->tenant_phone }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Building:</span>
                <span>{{ $maintenanceRequest->building_name }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Unit:</span>
                <span>{{ $maintenanceRequest->unit_number }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Scheduled Date:</span>
                <span>{{ $maintenanceRequest->scheduled_date->format('F j, Y') }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Scheduled Time:</span>
                <span>{{ $maintenanceRequest->scheduled_time }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Permission to Enter:</span>
                <span>{{ $maintenanceRequest->permission_to_enter ? 'Yes' : 'No' }}</span>
            </div>
            
            @if(!$maintenanceRequest->permission_to_enter && (!empty($maintenanceRequest->no_permission_reason) || !empty($maintenanceRequest->no_permission_reason_translated)))
            <div class="detail-row">
                <span class="detail-label">Reason for No Permission:</span>
                @if($maintenanceRequest->selected_language === 'es')
                    <p>{{ $maintenanceRequest->no_permission_reason_translated ?: $maintenanceRequest->no_permission_reason }}</p>
                    @if(!empty($maintenanceRequest->no_permission_reason_original))
                    <div class="translation-box">
                        <strong>Original (Spanish):</strong> {{ $maintenanceRequest->no_permission_reason_original }}
                    </div>
                    @endif
                @else
                    <p>{{ $maintenanceRequest->no_permission_reason }}</p>
                @endif
            </div>
            @endif
            
            <div class="detail-row">
                <span class="detail-label">Work Requested:</span>
                @if($maintenanceRequest->selected_language === 'es')
                    <p>{{ $maintenanceRequest->work_requested_translated ?: $maintenanceRequest->work_requested }}</p>
                    @if(!empty($maintenanceRequest->work_requested_original))
                    <div class="translation-box">
                        <strong>Original (Spanish):</strong> {{ $maintenanceRequest->work_requested_original }}
                    </div>
                    @endif
                @else
                    <p>{{ $maintenanceRequest->work_requested }}</p>
                @endif
            </div>
            
            @if(!empty($maintenanceRequest->special_instructions) || !empty($maintenanceRequest->special_instructions_translated))
            <div class="detail-row">
                <span class="detail-label">Special Instructions:</span>
                @if($maintenanceRequest->selected_language === 'es')
                    <p>{{ $maintenanceRequest->special_instructions_translated ?: $maintenanceRequest->special_instructions }}</p>
                    @if(!empty($maintenanceRequest->special_instructions_original))
                    <div class="translation-box">
                        <strong>Original (Spanish):</strong> {{ $maintenanceRequest->special_instructions_original }}
                    </div>
                    @endif
                @else
                    <p>{{ $maintenanceRequest->special_instructions }}</p>
                @endif
            </div>
            @endif
            
            <div class="detail-row">
                <span class="detail-label">Is Emergency:</span>
                <span>{{ $maintenanceRequest->is_emergency ? 'Yes' : 'No' }}</span>
            </div>
        </div>
        
        <p>Please review this request and take appropriate action.</p>
    </div>
    
    <div class="footer">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>&copy; {{ date('Y') }}  Triumph Residential services</p>
    </div>
</body>
</html> 