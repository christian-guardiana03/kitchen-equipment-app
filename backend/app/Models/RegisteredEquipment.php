<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegisteredEquipment extends Model
{
    protected $fillable = [
        'site_id',
        'equipment_id',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function equipment()
    {
        return $this->belongsTo(Equipment::class);
    }
}
