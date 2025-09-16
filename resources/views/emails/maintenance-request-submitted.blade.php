<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $language === 'es' ? 'Solicitud de Mantenimiento Enviada' : 'Maintenance Request Submitted' }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
        }
       .header {
    color: black;
    padding: 20px;
    text-align: center;
    text-decoration: underline;
    text-decoration-color: #003366;
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
        .contact-info {
            margin: 20px 0;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 4px solid #003366;
            border-radius: 5px;
        }
        .contact-info h3 {
            margin-top: 0;
            color: #003366;
        }
        .highlight {
            font-weight: bold;
            color: #d9534f;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $language === 'es' ? 'Solicitud de Mantenimiento Enviada' : 'Maintenance Request Submitted' }}</h1>
    </div>
    
    <div class="content">
        <p>{{ $messageContent }}</p>
        
        <div class="details">
            <div class="detail-row">
                <span class="detail-label">{{ $language === 'es' ? 'Fecha de Envío:' : 'Submission Date:' }}</span>
                <span>{{ $maintenanceRequest->created_at->format('F j, Y, g:i a') }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">{{ $language === 'es' ? 'Edificio:' : 'Building:' }}</span>
                <span>{{ $maintenanceRequest->building_name }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">{{ $language === 'es' ? 'Unidad:' : 'Unit:' }}</span>
                <span>{{ $maintenanceRequest->unit_number }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">{{ $language === 'es' ? 'Fecha Programada:' : 'Scheduled Date:' }}</span>
                <span>{{ $maintenanceRequest->scheduled_date->format('F j, Y') }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">{{ $language === 'es' ? 'Hora Programada:' : 'Scheduled Time:' }}</span>
                <span>{{ $maintenanceRequest->scheduled_time }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">{{ $language === 'es' ? 'Trabajo Solicitado:' : 'Work Requested:' }}</span>
                <p>{{ $language === 'es' ? ($maintenanceRequest->work_requested_original ?? $maintenanceRequest->work_requested) : $maintenanceRequest->work_requested }}</p>
            </div>
            
            @if(!empty($maintenanceRequest->special_instructions))
            <div class="detail-row">
                <span class="detail-label">{{ $language === 'es' ? 'Instrucciones Especiales:' : 'Special Instructions:' }}</span>
                <p>{{ $language === 'es' ? ($maintenanceRequest->special_instructions_original ?? $maintenanceRequest->special_instructions) : $maintenanceRequest->special_instructions }}</p>
            </div>
            @endif
        </div>
        
        <div class="contact-info">
            <h3>{{ $language === 'es' ? 'Información de Contacto Importante' : 'Important Notes' }}</h3>
            
            <p class="highlight">
                {{ $language === 'es' ? 'Si no recibe confirmación de orden de trabajo en 24 horas (solo días laborables), llame al' : 'If you do not get work order confirmation in 24 hours (Working Days Only) please call' }} 
                <strong>213-797-0311</strong> {{ $language === 'es' ? 'o envíenos un correo electrónico a' : 'or email us at' }} 
                <strong>workorder@triumphresidential.com</strong>
            </p>
            
            <p class="highlight">
                {{ $language === 'es' ? 'Si su trabajo no se completa dentro de 5 días, llámenos al' : 'If your work is not done within 5 days please call us at' }} 
                <strong>213-797-0311</strong> {{ $language === 'es' ? 'o envíenos un correo electrónico a' : 'or email us at' }} 
                <strong>workorder@triumphresidential.com</strong>
            </p>
        </div>
        
        <p>{{ $language === 'es' ? 'Si tiene alguna pregunta, por favor contáctenos.' : 'If you have any questions, please contact us.' }}</p>
        
        <p>{{ $language === 'es' ? 'Gracias,' : 'Thank you,' }}<br>Triumph Residential Services</p>
    </div>
    
    <div class="footer">
        <p>{{ $language === 'es' ? 'Este es un correo electrónico automático. Por favor no responda a este mensaje.' : 'This is an automated email. Please do not reply to this message.' }}</p>
        <p>&copy; {{ date('Y') }} Triumph Residential Services</p>
    </div>
</body>
</html>