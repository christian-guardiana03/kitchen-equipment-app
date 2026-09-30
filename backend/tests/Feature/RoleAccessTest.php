<?php

namespace Tests\Feature;

use App\Models\Site;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_cannot_view_the_users_list(): void
    {
        $admin = User::factory()->create(['user_type' => 'admin']);

        $response = $this->actingAs($admin)->getJson('/api/users');

        $response->assertStatus(403);
    }

    public function test_superadmin_can_view_the_users_list(): void
    {
        $superAdmin = User::factory()->create(['user_type' => 'superadmin']);
        User::factory()->count(3)->create();

        $response = $this->actingAs($superAdmin)->getJson('/api/users');

        $response->assertStatus(200);
        $response->assertJsonCount(3, 'data');
    }

    public function test_admin_only_sees_their_own_sites(): void
    {
        $admin = User::factory()->create(['user_type' => 'admin']);
        $otherAdmin = User::factory()->create(['user_type' => 'admin']);

        Site::factory()->count(2)->create(['user_id' => $admin->id]);
        Site::factory()->count(3)->create(['user_id' => $otherAdmin->id]);

        $response = $this->actingAs($admin)->getJson('/api/sites');

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');
    }

    public function test_superadmin_sees_every_site(): void
    {
        $superAdmin = User::factory()->create(['user_type' => 'superadmin']);
        $admin = User::factory()->create(['user_type' => 'admin']);

        Site::factory()->count(2)->create(['user_id' => $admin->id]);

        $response = $this->actingAs($superAdmin)->getJson('/api/sites');

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');
    }

    public function test_admin_cannot_delete_another_admins_site(): void
    {
        $admin = User::factory()->create(['user_type' => 'admin']);
        $otherAdmin = User::factory()->create(['user_type' => 'admin']);
        $site = Site::factory()->create(['user_id' => $otherAdmin->id]);

        $response = $this->actingAs($admin)->deleteJson("/api/sites/{$site->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('sites', ['id' => $site->id]);
    }
}