<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Site;
use App\Models\Equipment;
use App\Models\RegisteredEquipment;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::create([
            'first_name' => 'Super Admin',
            'user_name' => 'superadmin',
            'email' => 'superadmin@example.com',
            'password' => Hash::make('password'),
            'user_type' => 'superadmin',
        ]);

        $admin = User::create([
            'first_name' => 'Admin User',
            'user_name' => 'adminuser',
            'email' => 'adminuser@example.com',
            'password' => bcrypt('password'),
            'user_type' => 'admin',
        ]);

        $site = Site::create(['user_id' => $admin->id, 'description' => 'Jollibee - Angeles', 'active' => true]);
        $equipment = Equipment::create(['user_id' => $admin->id, 'serial_number' => 'FRZ-001', 'description' => 'Freezer', 'condition' => 'working']);
        RegisteredEquipment::create(['site_id' => $site->id, 'equipment_id' => $equipment->id]);
    }
}
