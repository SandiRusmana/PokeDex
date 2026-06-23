<?php

namespace App\Http\Controllers;

use App\Models\PokemonHistory;

class PokemonHistoryController extends Controller
{
    public function index()
    {
        $histories = PokemonHistory::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $histories
        ]);
    }
}
