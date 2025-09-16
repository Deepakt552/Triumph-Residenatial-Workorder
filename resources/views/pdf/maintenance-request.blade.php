<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <title>{{ $language === 'es' ? 'Solicitud de Mantenimiento' : 'Maintenance Request' }} #{{ $request->work_order_number }}</title>
    <style>
        @page {
            size: A4;
            margin: 25px;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1;
            color: #333;
            margin-left: 20px;
            margin-right: 20px;
            padding: 0;
            font-size: 12px;
        }
        .container {
            width: 100%;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 15px;
            position: relative;
            padding-bottom: 10px;
        }
        .title {
            font-size: 16px;
            font-weight: bold;
            margin: 0;
            text-transform: uppercase;
            color: #333;
            padding: 5px 0;
        }
        .timestamp {
            position: absolute;
            top: 5px;
            right: 5px;
            font-size: 10px;
            color: #666;
            border: 1px solid #ccc;
            padding: 5px;
            text-align: center;
            min-width: 100px;
        }
        .form-row {
            display: table;
            width: 100%;
            margin-bottom: 10px;
            border-collapse: collapse;
        }
        .form-field {
            display: table-cell;
            padding-right: 10px;
            vertical-align: top;
        }
        .form-field label {
            font-size: 12px;
            color: #000;
            display: inline;
            margin-right: 5px;
            font-weight: bold;
        }
        .form-field .value {
            display: inline;
        }
        .underline {
            display: inline-block;
            border-bottom: 1px solid #000;
            min-width: 150px;
            height: 12px;
            vertical-align: middle;
        }
        .form-field.large {
            width: 40%;
        }
        .form-field.medium {
            width: 30%;
        }
        .form-field.small {
            width: 20%;
        }
        .form-field.tiny {
            width: 10%;
        }
        .text-area-container {
            width: 100%;
            margin-top: 5px;
            margin-bottom: 5px;
        }
        .text-area-line {
            width: 100%;
            border-bottom: 1px solid #000;
            min-height: 24px;
            margin-bottom: 5px;
            word-wrap: break-word;
            overflow: visible;
            position: relative;
            padding-bottom: 2px;
            line-height: 1.5;
        }
        /* Improved styling for multi-line text with proper underlines */
        .multi-line-text {
            width: 100%;
            line-height: 1.5;
            position: relative;
            min-height: 20px;
        }
        .multi-line-text-content {
            position: relative;
            z-index: 2;
            word-wrap: break-word;
            white-space: pre-wrap;
        }
        .text-underline {
            width: 100%;
            border-bottom: 1px solid #000;
            height: 24px;
            margin-bottom: 5px;
            position: relative;
            overflow: visible;
        }
        .text-underline-content {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            z-index: 2;
            white-space: pre-wrap;
            word-break: break-word;
            overflow: visible;
            line-height: 1.5;
            padding-bottom: 2px;
        }
        .multi-line-text span {
            background: white;
            padding-bottom: 2px;
            box-decoration-break: clone;
            -webkit-box-decoration-break: clone;
            position: relative;
            border-bottom: 1px solid #000;
        }
        .permission-text {
            font-style: italic;
            font-size: 12px;
            margin-bottom: 6px;
        }
        .checkbox-option {
            display: inline-block;
            margin-right: 20px;
            padding: 3px 0;
        }
        .radio-button {
            display: inline-block;
            width: 12px;
            height: 12px;
            border: 1px solid #000;
            border-radius: 50%;
            vertical-align: middle;
            margin-right: 5px;
            position: relative;
        }
        .radio-button.checked {
            position: relative;
        }
        .radio-button.checked:after {
            content: '';
            position: absolute;
            width: 6px;
            height: 6px;
            background-color: #000;
            border-radius: 50%;
            top: 3px;
            left: 3px;
        }
        .horizontal-line {
            border-bottom: 1px dashed #000;
            width: 100%;
            margin: 15px 0;
        }
        .office-use {
            text-align: center;
            font-weight: bold;
            margin: 8px 0;
            font-size: 12px;
        }
        .maintenance-work-area {
            width: 100%;
            margin-top: 5px;
        }
        .work-line {
            width: 100%;
            border-bottom: 1px solid #000;
            height: 20px;
            margin-bottom: 5px;
        }
        .job-status {
            margin: 8px 0;
        }
        .signature-line {
            border-top: 1px solid #000;
            width: 100%;
            margin-top: 20px;
            padding-top: 2px;
            font-size: 9px;
            color: #666;
            text-align: center;
        }
        .warning-text {
            text-align: center;
            font-size: 9px;
            font-weight: bold;
            margin-top: 15px;
            padding: 5px;
            border: 1px solid #ccc;
        }
        .footer-text {
            text-align: right;
            font-size: 8px;
            margin-top: 8px;
            font-style: italic;
        }
        .signature-container {
            min-height: 30px;
            margin-top: 4px;
        }
        .signature-img {
            max-height: 50px;
            max-width: 200px;
            display: block;
            margin-bottom: 5px;
        }
        /* Make all form field labels and other text labels bold and black */
        label, .form-row span:not(.underline), .checkbox-option, .job-status label {
            font-weight: bold;
            color: #000;
        }
    </style>
    @php
    // Define translations for PDF
    $translations = [
        'en' => [
            'title' => 'MAINTENANCE REQUEST AND WORK ORDER',
            'buildingName' => 'Building Name',
            'unitNumber' => 'Unit #',
            'date' => 'Date',
            'workOrderNumber' => 'WO #',
            'tenantName' => 'Tenant Name',
            'phone' => 'Telephone #',
            'email' => 'Email',
            'workRequested' => 'Work Requested',
            'isEmergency' => 'Is this an emergency?',
            'yes' => 'Yes',
            'no' => 'No',
            'permissionToEnter' => 'I give Permission to the Property Management to enter to the Unit without anyone being present.',
            'scheduledDate' => 'Time & Date To Schedule for maintenance to enter unit',
            'scheduledTime' => 'Scheduled Time',
            'specialInstructions' => 'Special Instructions',
            'tenantSignature' => 'Tenant Signature',
            'officeUseOnly' => 'OFFICE USE',
            'priority' => 'Circle one',
            'emergency' => 'A - Urgent',
            'routine' => 'B - Routine',
            'deferred' => 'C - Low',
            'preventive' => 'PM - Preventive Maintenance',
            'workDone' => 'Work Done and Material Used',
            'jobComplete' => 'Job Status',
            'willReturn' => 'Will return to complete',
            'incompleteReason' => 'incomplete because of',
            'laborCost' => 'Cost of Labor$',
            'materialCost' => 'Cost of Material $',
            'totalCost' => 'Total Repair Cost $',
            'chargeableTo' => 'Chargeable to',
            'tenant' => 'Tenant',
            'property' => 'Property',
            'maintenancePerson' => 'Maintenance performed by',
            'maintenanceSignature' => 'Maintenance Signature',
            'tenantSignatureReceived' => 'Tenant Signature (after job is completed)',
            'managerSignature' => 'Manager Signature (after job is completed)',
            'warning' => 'NO CASH - PLEASE CALL 213-797-0311 IF ANY EMPLOYEE DEMANDS CASH THANK YOU IT\'S A PLEASURE TO BE OF SERVICE.',
            'footer' => 'Revised 3/15/2018',
            'digitalSignature' => 'Digital Signature',
            'startDate' => 'Start Date',
            'timeStamp' => 'Time Stamp',
            'maintenanceWork' => 'Maintenance - Work Done and Material Used:',
        ],
        'es' => [
            'title' => 'SOLICITUD DE MANTENIMIENTO Y ORDEN DE TRABAJO',
            'buildingName' => 'Nombre del Edificio',
            'unitNumber' => 'Unidad #',
            'date' => 'Fecha',
            'workOrderNumber' => 'Orden de Trabajo #',
            'tenantName' => 'Nombre del Inquilino',
            'phone' => 'Teléfono #',
            'email' => 'Correo Electrónico',
            'workRequested' => 'Trabajo Solicitado',
            'isEmergency' => '¿Es una emergencia?',
            'yes' => 'Sí',
            'no' => 'No',
            'permissionToEnter' => 'Doy permiso a la Administración de la Propiedad para ingresar a la Unidad sin que nadie esté presente.',
            'scheduledDate' => 'Hora y fecha para programar el mantenimiento para entrar a la unidad',
            'scheduledTime' => 'Hora Programada',
            'specialInstructions' => 'Instrucciones Especiales',
            'tenantSignature' => 'Firma del Inquilino',
            'officeUseOnly' => 'USO DE OFICINA',
            'priority' => 'Marque uno',
            'emergency' => 'A - Urgente',
            'routine' => 'B - Rutina',
            'deferred' => 'C - Bajo',
            'preventive' => 'PM - Mantenimiento Preventivo',
            'workDone' => 'Trabajo Realizado y Material Utilizado',
            'jobComplete' => 'Estado del Trabajo',
            'willReturn' => 'Regresará para completar',
            'incompleteReason' => 'incompleto debido a',
            'laborCost' => 'Costo de Mano de Obra$',
            'materialCost' => 'Costo de Material $',
            'totalCost' => 'Costo Total de Reparación $',
            'chargeableTo' => 'Facturable a',
            'tenant' => 'Inquilino',
            'property' => 'Propiedad',
            'maintenancePerson' => 'Mantenimiento realizado por',
            'maintenanceSignature' => 'Firma de Mantenimiento',
            'tenantSignatureReceived' => 'Firma del Inquilino (después de que se complete el trabajo)',
            'managerSignature' => 'Firma del Gerente (después de que se complete el trabajo)',
            'warning' => 'NO EFECTIVO - POR FAVOR LLAME AL 213-797-0311 SI ALGÚN EMPLEADO EXIGE EFECTIVO GRACIAS ES UN PLACER ESTAR A SU SERVICIO.',
            'footer' => 'Revisado 3/15/2018',
            'digitalSignature' => 'Firma Digital',
            'startDate' => 'Fecha de Inicio',
            'timeStamp' => 'Sello de Tiempo',
            'maintenanceWork' => 'Mantenimiento - Trabajo Realizado y Material Utilizado:',
        ]
    ];

    // Determine which language to use with fallbacks
    // 1. Use explicitly passed language parameter
    // 2. Use the language from the request model
    // 3. Default to English
    $lang = 'en'; // Default
    
    // Debug language parameters
    $debugLanguageParams = [
        'passed_language' => $language ?? 'not passed',
        'model_language' => $request->selected_language ?? 'not set in model',
        'request_id' => $request->id ?? 'unknown',
    ];
    
    if (isset($language) && in_array($language, ['en', 'es'])) {
        $lang = $language;
        $debugLanguageParams['source'] = 'passed parameter';
    } elseif (isset($request->selected_language) && in_array($request->selected_language, ['en', 'es'])) {
        $lang = $request->selected_language;
        $debugLanguageParams['source'] = 'model attribute';
    } else {
        $debugLanguageParams['source'] = 'default fallback';
    }
    
    // Use forced language if provided (for testing)
    if (isset($force_language) && in_array($force_language, ['en', 'es'])) {
        $lang = $force_language;
        $debugLanguageParams['source'] = 'forced from controller';
    }
    
    // Get translations for the selected language
    $t = $translations[$lang];

    // Format date based on language - use m/d/Y for both languages to match Los Angeles format
    $dateFormat = 'm/d/Y';
    $timeFormat = $lang === 'es' ? 'H:i' : 'h:i A';
    $formattedDate = date($dateFormat); // Use current date for the "Date" field
    $formattedScheduledDate = $request->scheduled_date ? date($dateFormat, strtotime($request->scheduled_date)) : '';
    
    // Use the request's creation date for the timestamp instead of current time
    $requestDateTime = isset($request->created_at) ? 
        \Carbon\Carbon::parse($request->created_at)->setTimezone('America/Los_Angeles')->format($dateFormat . ' ' . $timeFormat) :
        \Carbon\Carbon::now()->setTimezone('America/Los_Angeles')->format($dateFormat . ' ' . $timeFormat);
    
    // Log the language used for debugging
    if (function_exists('Log')) {
        \Log::info('PDF language used', array_merge([
            'language' => $lang,
        ], $debugLanguageParams));
    }
    @endphp
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">{{ $t['title'] }}</div>
            <div class="timestamp">{{ $requestDateTime }}</div>
        </div>
        
        <!-- First Row: Building Name, Unit #, Date, WO # -->
        <div class="form-row">
            <div class="form-field large">
                <label>{{ $t['buildingName'] }}</label>
                <span class="underline">{{ $request->building_name ?: '' }}</span>
            </div>
            <div class="form-field small">
                <label>{{ $t['unitNumber'] }}</label>
                <span class="underline" style="min-width: 50px;">{{ $request->unit_number ?: '' }}</span>
            </div>
            <div class="form-field medium">
                <label>{{ $t['date'] }}</label>
                <span class="underline" style="min-width: 80px;">{{ $formattedDate }}</span>
            </div>
            <div class="form-field small">
                <label>{{ $t['workOrderNumber'] }}</label>
                <span class="underline" style="min-width: 50px;"></span>
            </div>
        </div>
        
        <!-- Second Row: Tenant Name, Telephone # -->
        <div class="form-row">
            <div class="form-field large">
                <label>{{ $t['tenantName'] }}:</label>
                <span class="underline" style="min-width: 200px;">{{ $request->tenant_name ?: '' }}</span>
            </div>
            <div class="form-field large">
                <label>{{ $t['phone'] }}</label>
                <span class="underline" style="min-width: 150px;">{{ $request->tenant_phone ?: '' }}</span>
            </div>
        </div>
        
        <!-- Third Row: Time & Date To Schedule -->
        <div class="form-row">
            <div class="form-field" style="width: 100%;">
                <label>{{ $t['scheduledDate'] }}:</label>
                <span class="underline" style="min-width: 300px;">{{ $formattedScheduledDate }} {{ $request->scheduled_time ?: '' }}</span>
            </div>
        </div>
        
        <!-- Permission to enter -->
        <div class="form-row">
            <div class="form-field" style="width: 100%;">
                <div class="permission-text">"{{ $t['permissionToEnter'] }}"</div>
                <div style="padding: 5px 0;">
                    <span class="checkbox-option">
                        <span class="radio-button {{ $request->permission_to_enter ? 'checked' : '' }}"></span> {{ $t['yes'] }}
                    </span>
                    <span class="checkbox-option">
                        <span class="radio-button {{ !$request->permission_to_enter ? 'checked' : '' }}"></span> {{ $t['no'] }}
                    </span>
                </div>
            </div>
        </div>
        
        <!-- Tenant Signature -->
        <div class="form-row">
            <div class="form-field" style="width: 20%; vertical-align: bottom;">
                <label>{{ $t['tenantSignature'] }}:</label>
            </div>
            <div class="form-field" style="width: 80%;">
                <div style="min-height: 20px; margin-bottom: 0px;">
                    @if(!empty($signatureImage))
                        <img src="{{ $signatureImage }}" class="signature-img" alt="Tenant Signature">
                    @elseif(!empty($request->tenant_signature))
                        <img src="{{ $request->tenant_signature }}" class="signature-img" alt="Tenant Signature">
                    @elseif(!empty($tenant_signature))
                        <img src="{{ $tenant_signature }}" class="signature-img" alt="Tenant Signature">
                    @endif
                </div>
                <div style="border-bottom: 1px solid #000; width: 40%;"></div>
            </div>
        </div>
        
        <!-- Tenant - Work Requested -->
        <div class="form-row">
            <div class="form-field" style="width: 100%;">
                <label>Tenant - {{ $t['workRequested'] }}:</label>
                <div class="text-area-container">
                    @php
                        // Get the work requested text based on language and admin settings
                        if(isset($forAdmin) && $forAdmin && $language === 'en' && $request->selected_language === 'es') {
                            $workRequestedText = $request->work_requested_translated ?: $request->work_requested ?: '';
                        } else {
                            $workRequestedText = $language === 'es' ? ($request->work_requested_original ?: $request->work_requested ?: '') : ($request->work_requested ?: '');
                        }
                        
                        // Better line splitting that preserves words
                        $maxLineLength = 130; // Increased from 80 to 90 for fuller lines
                        $words = explode(' ', $workRequestedText);
                        $lines = [];
                        $currentLine = '';
                        
                        foreach ($words as $word) {
                            if (strlen($currentLine) + strlen($word) + 1 <= $maxLineLength) {
                                $currentLine .= ($currentLine ? ' ' : '') . $word;
                            } else {
                                $lines[] = $currentLine;
                                $currentLine = $word;
                            }
                        }
                        
                        if ($currentLine) {
                            $lines[] = $currentLine;
                        }
                        
                        // Ensure we have exactly 3 lines (empty or not)
                        while (count($lines) < 3) {
                            $lines[] = '';
                        }
                        
                        // Limit to maximum 3 lines
                        $lines = array_slice($lines, 0, 3);
                    @endphp
                    
                    @foreach($lines as $line)
                        <div class="text-area-line">
                            {{ $line }}
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
        
        <!-- Special Instructions - Removed from PDF -->
        
        <!-- No Permission Reason - Removed from PDF -->
        
        <!-- Office Use Section -->
        <div class="horizontal-line"></div>
        <div class="office-use">{{ $t['officeUseOnly'] }}</div>
        <div class="horizontal-line"></div>
        
        <!-- Priority Options -->
        <div class="form-row">
            <div style="width: 100%; padding: 5px 0;">
                {{ $t['priority'] }}: 
                <span class="checkbox-option">
                    <span class="radio-button"></span> {{ $t['emergency'] }}
                </span>
                <span class="checkbox-option">
                    <span class="radio-button"></span> {{ $t['routine'] }}
                </span>
                <span class="checkbox-option">
                    <span class="radio-button"></span> {{ $t['deferred'] }}
                </span>
                <span class="checkbox-option">
                    <span class="radio-button"></span> {{ $t['preventive'] }}
                </span>
            </div>
        </div>
        
        <!-- Maintenance Work Done -->
        <div class="form-row">
            <div class="form-field" style="width: 70%;">
                <label>{{ $t['maintenanceWork'] }}</label>
            </div>
            <div class="form-field" style="width: 30%;">
                <label>{{ $t['startDate'] }}:</label>
                <span class="underline" style="min-width: 100px;"></span>
            </div>
        </div>
        
        <!-- Work lines that span full width -->
        <div class="form-row">
            <div class="form-field" style="width: 100%;">
                <div class="work-line"></div>
                <div class="work-line"></div>
                <div class="work-line"></div>
                <div class="work-line"></div>
                <div class="work-line"></div>
                <div class="work-line"></div>
               
            </div>
        </div>
        
        <!-- Job Status -->
        <div class="form-row job-status">
            <div class="form-field" style="width: 40%;">
                <label>{{ $t['jobComplete'] }}: Complete</label>
                <span class="radio-button"></span> YES / NO
                <span style="margin-left: 10px;">{{ $t['date'] }}:</span>
                <span class="underline" style="min-width: 80px;"></span>
            </div>
            <div class="form-field" style="width: 60%;">
                <span>{{ $t['incompleteReason'] }}</span>
                <span class="underline" style="min-width: 150px;"></span>
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-field" style="width: 100%;">
                <label>{{ $t['willReturn'] }}:</label>
                <span class="underline" style="min-width: 400px;"></span>
            </div>
        </div>
        
        <!-- Cost Section -->
        <div class="form-row">
            <div class="form-field" style="width: 100%;">
                <div style="margin-bottom: 4px;">Cost or repairs:</div>
                  <div style="display: flex; align-items: center; width: 100%; margin-bottom: 4px;">
                    <span>Total Hours</span>
                    <span class="underline" style="min-width: 80px; margin: 0 15px 0 5px;"></span>
                   
                </div>
                <div style="display: flex; align-items: center; width: 100%;">
                    <span>{{ $t['laborCost'] }}</span>
                    <span class="underline" style="min-width: 80px; margin: 0 15px 0 5px;"></span>
                    <span>{{ $t['materialCost'] }}</span>
                    <span class="underline" style="min-width: 80px; margin: 0 15px 0 5px;"></span>
                    <span>{{ $t['totalCost'] }}</span>
                    <span class="underline" style="min-width: 80px; margin-left: 5px;"></span>
                </div>
            </div>
        </div>
        
        <!-- Chargeable to -->
        <div class="form-row" style="margin-top: 5px;">
            <div class="form-field" style="width: 100%;">
                <label>{{ $t['chargeableTo'] }}:</label>
                <div style="margin-top: 5px; padding: 3px 0;">
                    <span class="checkbox-option">
                        <span class="radio-button"></span> {{ $t['tenant'] }}
                    </span>
                    <span class="checkbox-option">
                        <span class="radio-button"></span> {{ $t['property'] }}:
                        <span class="underline" style="min-width: 100px;"></span>
                    </span>
                </div>
            </div>
        </div>
        
        <!-- Signatures -->
        <div class="form-row" style="margin-top: 15px;">
            <div class="form-field" style="width: 50%;">
                <div class="signature-line">{{ $t['maintenancePerson'] }} 1 (Name/Date)</div>
            </div>
            <div class="form-field" style="width: 50%;">
                <div class="signature-line">{{ $t['maintenanceSignature'] }}</div>
            </div>
        </div>
        
        <div class="form-row" style="margin-top: 15px;">
            <div class="form-field" style="width: 50%;">
                <div class="signature-line">{{ $t['maintenancePerson'] }} 2 (Name/Date)</div>
            </div>
            <div class="form-field" style="width: 50%;">
                <div class="signature-line">{{ $t['maintenanceSignature'] }}</div>
            </div>
        </div>
        
        <div class="form-row" style="margin-top: 15px;">
            <div class="form-field" style="width: 50%;">
                <div class="signature-line">{{ $t['managerSignature'] }}</div>
            </div>
            <div class="form-field" style="width: 50%;">
                <div class="signature-line">{{ $t['tenantSignatureReceived'] }}</div>
            </div>
        </div>
        
        <!-- Warning Notice -->
        <div class="warning-text">
            {{ $t['warning'] }}
        </div>
        
      
    </div>
</body>
</html> 