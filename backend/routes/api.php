<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [\App\Http\Controllers\Api\AuthController::class, 'register']);
Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
    Route::get('/me', [\App\Http\Controllers\Api\AuthController::class, 'me']);

    Route::apiResource('users', \App\Http\Controllers\Api\UserController::class)->except('store');
    Route::apiResource('sites', \App\Http\Controllers\Api\SiteController::class);
    Route::apiResource('equipment', \App\Http\Controllers\Api\EquipmentController::class);

    Route::get('/sites/{site}/available-equipment', [\App\Http\Controllers\Api\SiteController::class, 'availableEquipment']);
    Route::post('/sites/{site}/equipment', [\App\Http\Controllers\Api\SiteController::class, 'attachEquipment']);
    Route::delete('/sites/{site}/equipment/{registeredEquipment}', [\App\Http\Controllers\Api\SiteController::class, 'detachEquipment']);
});