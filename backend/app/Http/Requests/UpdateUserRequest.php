<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends RegisterRequest
{
    // Inherits identical validation rules from RegisterRequest, but can be customized if needed.
}
