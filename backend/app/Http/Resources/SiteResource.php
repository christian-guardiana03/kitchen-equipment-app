<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SiteResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'description' => $this->description,
            'active' => $this->active,
            'equipment_count' => $this->registeredEquipment()->count(),
            'equipment' => $this->registeredEquipment->map(fn ($registration) => [
                'id' => $registration->equipment->id,
                'serial_number' => $registration->equipment->serial_number,
                'description' => $registration->equipment->description,
                'condition' => $registration->equipment->condition,
                'registered_equipment' => [
                    'id' => $registration->id,
                ],
            ])->values(),
        ];
    }
}
