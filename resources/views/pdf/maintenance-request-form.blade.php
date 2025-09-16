<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Maintenance Request Form</title>
    <style>
        @page {
            size: letter;
            margin: 0.5in;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.3;
            color: #000000;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            padding: 10px 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            position: relative;
        }
        .title {
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .timestamp {
            position: absolute;
            top: 0;
            right: 0;
            font-size: 10px;
        }
        .form-row {
            margin-bottom: 15px;
            width: 100%;
            display: block;
            position: relative;
        }
        .form-field {
            display: inline-block;
            margin-bottom: 10px;
        }
        .underline {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 100px;
        }
        .dashed-line {
            border-bottom: 1px dashed #000;
            margin: 15px 0;
            width: 100%;
        }
        .office-use {
            text-align: center;
            margin: 10px 0;
            font-weight: bold;
        }
        .checkbox {
            display: inline-block;
            margin-right: 15px;
        }
        .signature-line {
            border-top: 1px solid #000;
            margin-top: 25px;
            padding-top: 5px;
            font-size: 10px;
            text-align: center;
        }
        .note {
            text-align: center;
            font-size: 10px;
            margin-top: 10px;
            font-weight: bold;
        }
        .revised {
            font-size: 8px;
            margin-top: 10px;
        }
        .label {
            display: inline-block;
            vertical-align: top;
        }
        .multi-line {
            line-height: 1.5;
            margin-bottom: 5px;
        }
        .spacer {
            display: inline-block;
            width: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">MAINTENANCE REQUEST AND WORK ORDER</div>
            <div class="timestamp">{{ $date ?? \Carbon\Carbon::now()->setTimezone('America/Los_Angeles')->format('F j, Y h:i A') }}</div>
        </div>
        
        <div class="form-row">
            <span class="label">Building Name</span>
            <span class="underline" style="width: 200px;">_______________________</span>
            <span class="spacer"></span>
            <span class="label">Unit #</span>
            <span class="underline" style="width: 40px;">_____</span>
            <span class="spacer"></span>
            <span class="label">Date</span>
            <span class="underline" style="width: 100px;">____________</span>
            <span class="spacer"></span>
            <span class="label">WO #</span>
            <span class="underline" style="width: 80px;">__________</span>
        </div>
        
        <div class="form-row">
            <span class="label">Tenant Name:</span>
            <span class="underline" style="width: 250px;">_______________________</span>
            <span class="spacer"></span>
            <span class="label">Telephone #</span>
            <span class="underline" style="width: 200px;">_______________________</span>
        </div>
        
        <div class="form-row">
            <div class="multi-line">
                <span class="label">Time & Date To Schedule for maintenance to enter unit:</span>
                <span class="underline" style="width: 400px;">_________________________________________________</span>
            </div>
        </div>
        
        <div class="form-row">
            <div class="multi-line">
                <span class="label">"I give Permission to the Property Management to enter to the Unit without anyone being present. Yes</span>
                <span class="underline" style="width: 30px;">_____</span>
                <span class="label">No</span>
                <span class="underline" style="width: 30px;">_____</span>
            </div>
        </div>
        
        <div class="form-row">
            <span class="label">Tenant Signature:</span>
            <span class="underline" style="width: 300px;">_______________________</span>
        </div>
        
        <div class="form-row">
            <span class="label">Tenant - Work Requested:</span>
        </div>
        
        <div class="form-row">
            <span class="underline" style="width: 100%; display: block;">_________________________________________________</span>
        </div>
        
        <div class="form-row">
            <span class="underline" style="width: 100%; display: block;">_________________________________________________</span>
        </div>
        
        <div class="form-row">
            <span class="underline" style="width: 100%; display: block;">_________________________________________________</span>
        </div>
        
        <div class="form-row">
            <span class="underline" style="width: 100%; display: block;">_________________________________________________</span>
        </div>
        
        <div class="form-row">
            <span class="underline" style="width: 100%; display: block;">_________________________________________________</span>
        </div>
        
        <div class="form-row">
            <span class="underline" style="width: 100%; display: block;">_________________________________________________</span>
        </div>
        
        <div class="form-row">
            <span class="label">Job Status: Complete</span>
            <span class="spacer"></span>
            <span class="label">_YES / NO_</span>
            <span class="spacer"></span>
            <span class="label">Date:</span>
            <span class="underline" style="width: 100px;">____________</span>
            <span class="spacer"></span>
            <span class="label">incomplete because of</span>
            <span class="underline" style="width: 150px;">_______________</span>
        </div>
        
        <div class="form-row">
            <span class="label">Will return to complete:</span>
            <span class="underline" style="width: 400px;">_________________________________________________</span>
        </div>
        
        <div class="form-row">
            <span class="label">Cost or repairs:</span>
            <br>
            <span class="label">Total Hours</span>
            <span class="underline" style="width: 50px;">_______</span>
            <span class="spacer"></span>
            <span class="label">Cost of Labor $</span>
            <span class="underline" style="width: 80px;">_________</span>
            <span class="spacer"></span>
            <span class="label">Cost of Material $</span>
            <span class="underline" style="width: 80px;">_________</span>
            <span class="spacer"></span>
            <span class="label">Total Repair Cost $</span>
            <span class="underline" style="width: 80px;">_________</span>
        </div>
        
        <div class="form-row">
            <span class="label">Chargeable to:</span>
            <span class="spacer"></span>
            <span class="label">Tenant</span>
            <span class="underline" style="width: 50px;">_____</span>
            <span class="spacer"></span>
            <span class="label">Property:</span>
            <span class="underline" style="width: 50px;">_____</span>
        </div>
        
        <div class="form-row" style="margin-top: 20px;">
            <div style="width: 45%; float: left;">
                <span class="underline" style="width: 100%; display: block;">_______________________</span>
                <div class="signature-line">Maintenance performed by 1 (Name/Date)</div>
            </div>
            <div style="width: 45%; float: right;">
                <span class="underline" style="width: 100%; display: block;">_______________________</span>
                <div class="signature-line">Maintenance Signature</div>
            </div>
        </div>
        
        <div class="form-row" style="margin-top: 40px; clear: both;">
            <div style="width: 45%; float: left;">
                <span class="underline" style="width: 100%; display: block;">_______________________</span>
                <div class="signature-line">Maintenance performed by 2 (Name/Date)</div>
            </div>
            <div style="width: 45%; float: right;">
                <span class="underline" style="width: 100%; display: block;">_______________________</span>
                <div class="signature-line">Maintenance Signature</div>
            </div>
        </div>
        
        <div class="form-row" style="margin-top: 40px; clear: both;">
            <div style="width: 45%; float: left;">
                <span class="underline" style="width: 100%; display: block;">_______________________</span>
                <div class="signature-line">Manager Signature (after job is completed)</div>
            </div>
            <div style="width: 45%; float: right;">
                <span class="underline" style="width: 100%; display: block;">_______________________</span>
                <div class="signature-line">Tenant Signature (after job is completed)</div>
            </div>
        </div>
        
        <div class="form-row" style="margin-top: 30px; clear: both;">
            <div class="note">
                NO CASH – PLEASE CALL 213-531-9789 IF ANY EMPLOYEE DEMANDS CASH
                <br>
                THANK YOU! IT'S A PLEASURE TO BE OF SERVICE.
            </div>
        </div>
        
      
    </div>
</body>
</html> 