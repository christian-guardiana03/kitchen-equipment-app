<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateEquipmentRequest extends StoreEquipmentRequest
{
    // Inherits identical validation rules from StoreEquipmentRequest, but can be customized if needed.
}
