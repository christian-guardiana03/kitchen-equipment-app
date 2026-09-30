<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_a_user_with_admin_role(): void
    {
        $response = $this->postJson('/api/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'user_name' => 'testuser',
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'user_name' => 'testuser',
            'user_type' => 'admin',
        ]);
    }

    public function test_register_ignores_client_supplied_user_type(): void
    {
        $response = $this->postJson('/api/register', [
            'first_name' => 'Sneaky',
            'last_name' => 'User',
            'user_name' => 'sneaky',
            'email' => 'sneaky@example.com',
            'password' => 'password123',
            'user_type' => 'superadmin',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'user_name' => 'sneaky',
            'user_type' => 'admin',
        ]);
    }

    public function test_user_can_login_with_correct_credentials(): void
    {
        $user = User::factory()->create([
            'user_name' => 'chris',
            'password' => Hash::make('secret123'),
        ]);

        $response = $this->postJson('/api/login', [
            'user_name' => 'chris',
            'password' => 'secret123',
        ]);

        $response->assertStatus(200);
        $this->assertAuthenticatedAs($user);
    }

    public function test_login_fails_with_incorrect_password(): void
    {
        User::factory()->create([
            'user_name' => 'chris',
            'password' => Hash::make('secret123'),
        ]);

        $response = $this->postJson('/api/login', [
            'user_name' => 'chris',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422);
        $this->assertGuest();
    }
}