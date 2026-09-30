<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSiteRequest extends StoreSiteRequest
{
    // Inherits identical validation rules from StoreSiteRequest, but can be customized if needed.
}
