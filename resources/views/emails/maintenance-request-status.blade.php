<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $language === 'es' ? 'Actualización de Solicitud de Mantenimiento' : 'Maintenance Request Update' }}</title>
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
        .status-approved {
            color: #28a745;
            font-weight: bold;
        }
        .status-rejected {
            color: #dc3545;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>
            @if($status === 'approved')
                {{ $language === 'es' ? 'Solicitud de Mantenimiento Aprobada' : 'Maintenance Request Approved' }}
            @elseif($status === 'rejected')
                {{ $language === 'es' ? 'Actualización de Solicitud de Mantenimiento' : 'Maintenance Request Update' }}
            @else
                {{ $language === 'es' ? 'Actualización de Solicitud de Mantenimiento' : 'Maintenance Request Update' }}
            @endif
        </h1>
    </div>
    
    <div class="content">
        <p>{{ $language === 'es' ? 'Estimado/a ' : 'Dear ' }} {{ $maintenanceRequest->tenant_name }},</p>
        
        <p>{{ $messageContent }}</p>
        
        <div class="details">
            <div class="detail-row">
                <span class="detail-label">{{ $language === 'es' ? 'Estado:' : 'Status:' }}</span>
                <span class="{{ $status === 'approved' ? 'status-approved' : 'status-rejected' }}">
                    @if($status === 'approved')
                        {{ $language === 'es' ? 'Aprobada' : 'Approved' }}
                    @elseif($status === 'rejected')
                        {{ $language === 'es' ? 'No Aprobada' : 'Not Approved' }}
                    @else
                        {{ ucfirst($status) }}
                    @endif
                </span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">{{ $language === 'es' ? 'Edificio:' : 'Building:' }}</span>
                <span>{{ $maintenanceRequest->building_name }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">{{ $language === 'es' ? 'Unidad:' : 'Unit:' }}</span>
                <span>{{ $maintenanceRequest->unit_number }}</span>
            </div>
            
            @if($status === 'approved')
            <div class="detail-row">
                <span class="detail-label">{{ $language === 'es' ? 'Fecha Programada:' : 'Scheduled Date:' }}</span>
                <span>{{ $maintenanceRequest->scheduled_date->format('F j, Y') }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">{{ $language === 'es' ? 'Hora Programada:' : 'Scheduled Time:' }}</span>
                <span>{{ $maintenanceRequest->scheduled_time }}</span>
            </div>
            @endif
        </div>
        
        <p>{{ $language === 'es' ? 'Si tiene alguna pregunta, por favor contáctenos.' : 'If you have any questions, please contact us.' }}</p>
        
        <p>{{ $language === 'es' ? 'Gracias,' : 'Thank you,' }}<br>{{ $companyName ?? 'Triumph Residential Services' }}</p>
    </div>
    
    <div class="footer">
        <p>{{ $language === 'es' ? 'Este es un correo electrónico automático. Por favor no responda a este mensaje.' : 'This is an automated email. Please do not reply to this message.' }}</p>
        <p>&copy; {{ date('Y') }} {{ $companyName ?? 'Triumph Residential Services' }}</p>
    </div>
</body>
</html> 