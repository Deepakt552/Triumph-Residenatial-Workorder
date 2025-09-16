<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Maintenance Request PDF</title>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f7f9fc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            margin-top: 20px;
            margin-bottom: 20px;
        }
        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
            color: white;
            padding: 25px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px 25px;
            background-color: #ffffff;
        }
        .footer {
            padding: 20px;
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
            font-size: 0.875rem;
            color: #6b7280;
            text-align: center;
        }
        .details {
            margin-top: 25px;
            padding: 20px;
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
        }
        .details h3 {
            margin-top: 0;
            color: #374151;
            font-size: 18px;
            font-weight: 600;
            padding-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
        }
        .details-row {
            margin-bottom: 12px;
            display: flex;
            flex-wrap: wrap;
        }
        .details-label {
            font-weight: 600;
            color: #4b5563;
            min-width: 140px;
        }
        .details-value {
            color: #1f2937;
            flex: 1;
        }
        .pdf-notice {
            margin-top: 25px;
            padding: 15px;
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
            border-radius: 4px;
        }
        .pdf-notice h4 {
            margin-top: 0;
            color: #1e40af;
        }
        .contact-info {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
        }
        .signature {
            margin-top: 20px;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your Maintenance Request</h1>
        </div>
        
        <div class="content">
            <p>Dear {{ $maintenanceRequest->tenant_name }},</p>
            
            <p>{{ $messageContent }}</p>
            
            <div class="details">
                <h3>Request Details</h3>
                
              
                
                <div class="details-row">
                    <div class="details-label">Building:</div>
                    <div class="details-value">{{ $maintenanceRequest->building_name }}</div>
                </div>
                
                <div class="details-row">
                    <div class="details-label">Unit:</div>
                    <div class="details-value">{{ $maintenanceRequest->unit_number }}</div>
                </div>
                
                <div class="details-row">
                    <div class="details-label">Status:</div>
                    <div class="details-value">{{ ucfirst($maintenanceRequest->status) }}</div>
                </div>
            </div>
            
            <div class="pdf-notice">
                <h4>Maintenance Request PDF</h4>
                <p>
                    We have attached a PDF copy of your maintenance request to this email.
                    Please keep this for your records.
                </p>
            </div>
            
            <div class="contact-info">
                <p>If you have any questions, please don't hesitate to contact us at:</p>
                <p><strong>Phone:</strong> 213-797-0311</p>
                <p><strong>Email:</strong> workorder@triumphresidential.com</p>
            </div>
            
            <div class="signature">
                <p>Thank you,</p>
                <p><strong> Triumph Residential services</strong></p>
            </div>
        </div>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply directly to this email.</p>
            <p>&copy; {{ date('Y') }} Triumph Residential services. All rights reserved.</p>
        </div>
    </div>
</body>
</html> 