<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\StoreSiteRequest;
use App\Http\Requests\UpdateSiteRequest;
use App\Http\Resources\EquipmentResource;
use App\Http\Resources\SiteResource;
use App\Models\Equipment;
use App\Models\Site;
use App\Models\RegisteredEquipment;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class SiteController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Site::class);

        $sites = $request->user()->isSuperAdmin()
            ? Site::with(['user', 'registeredEquipment.equipment'])->get()
            : $request->user()->sites()->with('registeredEquipment.equipment')->get();

        return SiteResource::collection($sites);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSiteRequest $request)
    {
        $site = Site::create([
            'user_id' => $request->user()->id,
            'description'  => $request->description,
            'active' => $request->boolean('active', true),
        ]);

        return new SiteResource($site);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Site $site)
    {
        $this->authorize('view', $site);
        $site->load('registeredEquipment.equipment');

        return new SiteResource($site);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSiteRequest $request, Site $site)
    {
        $this->authorize('update', $site);
        $site->update([
            ...$request->validated(),
            'active' => $request->boolean('active', true),
        ]);
        $site->load('registeredEquipment.equipment');

        return new SiteResource($site);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Site $site)
    {
        $this->authorize('delete', $site);
        $site->delete();
        return response()->noContent();
    }

    public function availableEquipment(Request $request, Site $site)
    {
        $this->authorize('view', $site);

        $equipment = Equipment::where('user_id', $site->user_id)
            ->whereDoesntHave('registeredEquipment')
            ->get();

        return EquipmentResource::collection($equipment);
    }

    public function attachEquipment(Request $request, Site $site)
    {
        $this->authorize('update', $site);

        $data = $request->validate([
            'equipment_id' => 'required|exists:equipment,id',
        ]);

        $equipment = Equipment::findOrFail($data['equipment_id']);

        abort_unless($equipment->user_id === $site->user_id, 403, 'You can only assign equipment you own.');
        abort_if($equipment->registeredEquipment()->exists(), 422, 'Equipment is already assigned to a site.');
    
        RegisteredEquipment::create([
            'equipment_id' => $equipment->id,
            'site_id' => $site->id,
        ]);

        return response()->noContent();
    }

    public function detachEquipment(Request $request, Site $site, RegisteredEquipment $registeredEquipment)
    {
        $this->authorize('update', $site);

        abort_unless($registeredEquipment->site_id === $site->id, 404);

        $registeredEquipment->delete();

        return response()->noContent();
    }
}
