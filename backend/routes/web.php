<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PokemonController;
use App\Http\Controllers\MyPokemonController;
use App\Http\Controllers\PokemonHistoryController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/api/pokemon', [PokemonController::class, 'index']);
Route::get('/api/pokemon-with-types', [PokemonController::class, 'indexWithTypes']);
Route::get('/api/pokemon/{id}', [PokemonController::class, 'show']);
Route::post('/api/pokemon/catch', [MyPokemonController::class, 'catch']);
Route::get('/api/my-pokemon', [MyPokemonController::class, 'index']);
Route::delete('/api/my-pokemon/{id}', [MyPokemonController::class, 'destroy']);
Route::get('/api/pokemon-history', [PokemonHistoryController::class, 'index']);
