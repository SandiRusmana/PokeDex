<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MyPokemon;
use App\Models\PokemonHistory;

class MyPokemonController extends Controller
{
    public function index()
    {
        $myPokemon = MyPokemon::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $myPokemon
        ]);
    }

    public function catch(Request $request)
    {
        $validated = $request->validate([
            'pokemon_id' => 'required|integer',
            'name' => 'required|string',
            'image' => 'required|url',
            'types' => 'required|array',
            'height' => 'required|integer',
            'weight' => 'required|integer',
        ]);

        // 50% chance to catch
        $isCaught = rand(0, 1) === 1;

        if ($isCaught) {
            $pokemon = MyPokemon::create($validated);

            PokemonHistory::create([
                'pokemon_id' => $validated['pokemon_id'],
                'name'       => $validated['name'],
                'image'      => $validated['image'],
                'action'     => 'catch',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pokemon caught successfully!',
                'data' => $pokemon
            ], 201);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to catch the Pokemon. It broke free!'
        ], 200);
    }

    public function destroy($id)
    {
        $pokemon = MyPokemon::find($id);

        if (!$pokemon) {
            return response()->json([
                'success' => false,
                'message' => 'Pokemon not found in your collection.'
            ], 404);
        }

        PokemonHistory::create([
            'pokemon_id' => $pokemon->pokemon_id,
            'name'       => $pokemon->name,
            'image'      => $pokemon->image,
            'action'     => 'release',
        ]);

        $pokemon->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pokemon has been released successfully!'
        ], 200);
    }
}
