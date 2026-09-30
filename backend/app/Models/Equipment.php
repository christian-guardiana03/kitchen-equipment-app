<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'serial_number',
        'description',
        'condition',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function registeredEquipment()
    {
        return $this->hasOne(RegisteredEquipment::class);
    }
}
