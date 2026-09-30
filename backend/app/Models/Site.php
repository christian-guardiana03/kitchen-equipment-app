<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Site extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'description',
        'active',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function registeredEquipment()
    {
        return $this->hasMany(RegisteredEquipment::class);
    }

    public function equipment()
    {
        return $this->hasManyThrough(Equipment::class, RegisteredEquipment::class, 'site_id', 'id', 'id', 'equipment_id');
    }
}
