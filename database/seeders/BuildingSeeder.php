<?php

namespace Database\Seeders;

use App\Models\Building;
use App\Models\Unit;
use Illuminate\Database\Seeder;

class BuildingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample buildings
        $buildings = [
            [
                'name' => 'Ocaen Breeze',
                'address' => '123 Sunset Blvd',
                'city' => 'Los Angeles',
                'state' => 'CA',
                'zip_code' => '90210',
                'units' => ['101', '102', '103', '201', '202', '203', '301', '302', '303']
            ],
            [
                'name' => '900 Vermont',
                'address' => '456 Ocean Drive',
                'city' => 'Santa Monica',
                'state' => 'CA',
                'zip_code' => '90401',
                'units' => ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3']
            ],
            [
                'name' => 'westlake city light',
                'address' => '789 Main Street',
                'city' => 'Los Angeles',
                'state' => 'CA',
                'zip_code' => '90014',
                'units' => ['101', '102', '103', '201', '202', '203']
            ],
        ];

        foreach ($buildings as $buildingData) {
            $units = $buildingData['units'];
            unset($buildingData['units']);
            
            $building = Building::create($buildingData);
            
            // Create units for this building
            foreach ($units as $unitNumber) {
                Unit::create([
                    'building_id' => $building->id,
                    'unit_number' => $unitNumber,
                    'occupied' => true,
                ]);
            }
        }
    }
} 