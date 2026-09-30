<?php

namespace Tests\Feature;

use App\Models\Equipment;
use App\Models\RegisteredEquipment;
use App\Models\Site;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EquipmentAssignmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_equipment_cannot_be_assigned_to_two_sites(): void
    {   
        
        $admin = User::factory()->create(['user_type' => 'admin']);
        $siteA = Site::factory()->create(['user_id' => $admin->id]);
        $siteB = Site::factory()->create(['user_id' => $admin->id]);
        $equipment = Equipment::factory()->create(['user_id' => $admin->id]);

        $this->actingAs($admin)
            ->postJson("/api/sites/{$siteA->id}/equipment", ['equipment_id' => $equipment->id])
            ->assertStatus(204);

        $response = $this->actingAs($admin)
            ->postJson("/api/sites/{$siteB->id}/equipment", ['equipment_id' => $equipment->id]);

        $response->assertStatus(422);
        $this->assertDatabaseCount('registered_equipment', 1); // the UNIQUE constraint holds
    }

    public function test_equipment_can_only_be_assigned_by_the_sites_owner(): void
    {
        $siteOwner = User::factory()->create(['user_type' => 'admin']);
        $otherAdmin = User::factory()->create(['user_type' => 'admin']);
        $site = Site::factory()->create(['user_id' => $siteOwner->id]);
        $foreignEquipment = Equipment::factory()->create(['user_id' => $otherAdmin->id]);

        $response = $this->actingAs($siteOwner)
            ->postJson("/api/sites/{$site->id}/equipment", ['equipment_id' => $foreignEquipment->id]);

        $response->assertStatus(403);
    }

    public function test_superadmin_can_assign_equipment_owned_by_the_site_owner(): void
    {
        $superAdmin = User::factory()->create(['user_type' => 'superadmin']);
        $siteOwner = User::factory()->create(['user_type' => 'admin']);
        $site = Site::factory()->create(['user_id' => $siteOwner->id]);
        $equipment = Equipment::factory()->create(['user_id' => $siteOwner->id]);

        // SuperAdmin manages the site on the owner's behalf, using the owner's own equipment.
        $response = $this->actingAs($superAdmin)
            ->postJson("/api/sites/{$site->id}/equipment", ['equipment_id' => $equipment->id]);

        $response->assertStatus(204);
    }

    public function test_deleting_a_site_unlinks_equipment_without_deleting_it(): void
    {
        $admin = User::factory()->create(['user_type' => 'admin']);
        $site = Site::factory()->create(['user_id' => $admin->id]);
        $equipment = Equipment::factory()->create(['user_id' => $admin->id]);

        RegisteredEquipment::create([
            'equipment_id' => $equipment->id,
            'site_id' => $site->id,
        ]);

        $this->actingAs($admin)->deleteJson("/api/sites/{$site->id}")->assertStatus(204);

        $this->assertDatabaseMissing('sites', ['id' => $site->id]);
        $this->assertDatabaseMissing('registered_equipment', ['site_id' => $site->id]);
        $this->assertDatabaseHas('equipment', ['id' => $equipment->id]); // equipment survives
    }
}