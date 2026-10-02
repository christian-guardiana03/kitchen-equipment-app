<?php

namespace Tests\Feature\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;

class EquipmentTest extends TestCase
{
    use RefreshDatabase;
    /**
     * A basic feature test example.
     */
    public function test_create_duplicate_equipment_validation(): void
    {
        $admin = User::factory()->create(['user_type' => 'admin']);
        $this->actingAs($admin)->postJson('/api/equipment', [
            'description' => 'Test Equipment',
            'serial_number' => 'Test-001',
            'condition' => 'working',
        ])->assertStatus(201);

        $response = $this->actingAs($admin)->postJson('/api/equipment', [
            'description' => 'Test Equipment',
            'serial_number' => 'Test-001',
            'condition' => 'working',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['serial_number']);
    }
}
