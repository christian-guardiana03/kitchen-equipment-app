<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Equipment;
use App\Http\Resources\EquipmentResource;
use App\Http\Requests\StoreEquipmentRequest;
use App\Http\Requests\UpdateEquipmentRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class EquipmentController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Equipment::class);

        $equipment = $request->user()->isSuperAdmin()
            ? Equipment::with('user', 'registeredEquipment.site')->get()
            : $request->user()->equipment()->with('registeredEquipment.site')->get();
    
        return EquipmentResource::collection($equipment);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEquipmentRequest $request)
    {
        $equipment = Equipment::create([
            'user_id' => $request->user()->id,
            'serial_number' => $request->serial_number,
            'description' => $request->description,
            'condition' => $request->condition,
        ]);

        return new EquipmentResource($equipment);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Equipment $equipment)
    {
        $this->authorize('view', $equipment);
        return new EquipmentResource($equipment);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEquipmentRequest $request, Equipment $equipment)
    {
        $this->authorize('update', $equipment);
        $equipment->update($request->validated());
        return new EquipmentResource($equipment);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Equipment $equipment)
    {
        $this->authorize('delete', $equipment);
        $equipment->delete();
        return response()->noContent();
    }
}
