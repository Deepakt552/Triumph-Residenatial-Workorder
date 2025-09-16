<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

// Check if column exists
$columnExists = Schema::hasColumn('maintenance_requests', 'selected_language');
echo "Column 'selected_language' exists: " . ($columnExists ? 'Yes' : 'No') . PHP_EOL;

// If column exists, check its properties
if ($columnExists) {
    $columnInfo = DB::select("SHOW COLUMNS FROM maintenance_requests WHERE Field = 'selected_language'");
    if (!empty($columnInfo)) {
        $column = $columnInfo[0];
        echo "Column type: " . $column->Type . PHP_EOL;
        echo "Column default: " . $column->Default . PHP_EOL;
        echo "Column nullable: " . ($column->Null === 'YES' ? 'Yes' : 'No') . PHP_EOL;
    }
}

// Check recent records
$recentRecords = DB::table('maintenance_requests')
    ->orderBy('id', 'desc')
    ->limit(5)
    ->get();

if ($recentRecords->isNotEmpty()) {
    echo "\nRecent records:\n";
    echo str_repeat('-', 80) . PHP_EOL;
    echo sprintf("%-5s | %-20s | %-15s | %-15s\n", "ID", "Tenant Name", "Language", "Created At");
    echo str_repeat('-', 80) . PHP_EOL;
    
    foreach ($recentRecords as $record) {
        echo sprintf(
            "%-5s | %-20s | %-15s | %-15s\n",
            $record->id,
            substr($record->tenant_name ?? 'N/A', 0, 20),
            $record->selected_language ?? 'NULL',
            substr($record->created_at ?? 'N/A', 0, 15)
        );
    }
    echo str_repeat('-', 80) . PHP_EOL;
} else {
    echo "No records found in the maintenance_requests table.\n";
}

// Check if any records have Spanish language
$spanishRecords = DB::table('maintenance_requests')
    ->where('selected_language', 'es')
    ->count();

echo "\nNumber of records with Spanish language: " . $spanishRecords . PHP_EOL;

// Check if any records have NULL language
$nullLanguageRecords = DB::table('maintenance_requests')
    ->whereNull('selected_language')
    ->count();

echo "Number of records with NULL language: " . $nullLanguageRecords . PHP_EOL; 