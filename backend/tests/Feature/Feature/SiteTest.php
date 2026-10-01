<?php

namespace Tests\Feature\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;

class SiteTest extends TestCase
{
    /**
     * A basic feature test example.
     */
    public function test_create_duplicate_site_validation(): void
    {
        $admin = User::factory()->create(['user_type' => 'admin']);
        $this->actingAs($admin)->postJson('/api/sites', [
            'description' => 'Jollibee - Mexico',
        ])->assertStatus(201);

        $siteResponse = $this->actingAs($admin)->postJson('/api/sites', [
            'description' => 'Jollibee - Mexico',
        ])->assertStatus(422);
        $siteResponse->assertJsonValidationErrors(['description']);
    }
}
