<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EquipmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'serial_number' => strtoupper(fake()->bothify('EQ-####')),
            'description' => fake()->randomElement(['Refrigerator', 'Blender', 'Chiller', 'Freezer', 'Oven', 'Stove']),
            'condition' => 'working',
        ];
    }
}