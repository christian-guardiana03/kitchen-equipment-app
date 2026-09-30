<?php

namespace Tests\Feature;

use App\Models\Equipment;
use App\Models\Site;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserDeletionTest extends TestCase
{
    use RefreshDatabase;

    public function test_deleting_a_user_cascades_to_their_sites_and_equipment(): void
    {
        $superAdmin = User::factory()->create(['user_type' => 'superadmin']);
        $admin = User::factory()->create(['user_type' => 'admin']);
        $site = Site::factory()->create(['user_id' => $admin->id]);
        $equipment = Equipment::factory()->create(['user_id' => $admin->id]);

        $this->actingAs($superAdmin)->deleteJson("/api/users/{$admin->id}")->assertStatus(204);

        $this->assertDatabaseMissing('users', ['id' => $admin->id]);
        $this->assertDatabaseMissing('sites', ['id' => $site->id]);
        $this->assertDatabaseMissing('equipment', ['id' => $equipment->id]);
    }

    public function test_admin_cannot_delete_a_user(): void
    {
        $admin = User::factory()->create(['user_type' => 'admin']);
        $otherAdmin = User::factory()->create(['user_type' => 'admin']);

        $response = $this->actingAs($admin)->deleteJson("/api/users/{$otherAdmin->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('users', ['id' => $otherAdmin->id]);
    }
}