<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EquipmentResource extends JsonResource
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
        'serial_number' => $this->serial_number,
        'description' => $this->description,
        'condition' => $this->condition,
        'registered_equipment' => $this->registeredEquipment ? [
            'id' => $this->registeredEquipment->id,
            'site' => [
                'id' => $this->registeredEquipment->site->id,
                'description' => $this->registeredEquipment->site->description,
            ],
        ] : null,
    ];
    }
}
