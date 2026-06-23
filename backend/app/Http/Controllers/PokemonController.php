<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PokemonController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $limit = $search ? 2000 : 20;

        $response = Http::get("https://pokeapi.co/api/v2/pokemon?limit={$limit}");
        
        if ($response->successful()) {
            $data = $response->json();
            $results = collect($data['results']);

            if ($search) {
                $results = $results->filter(function ($pokemon) use ($search) {
                    return Str::contains(strtolower($pokemon['name']), strtolower($search));
                })->take(20)->values();
            }

            $pokemonList = $results->map(function ($pokemon) {
                $parts = explode('/', rtrim($pokemon['url'], '/'));
                $id = end($parts);
                
                return [
                    'id' => $id,
                    'name' => ucfirst($pokemon['name']),
                    'image' => "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{$id}.png",
                    'url' => $pokemon['url']
                ];
            });

            return response()->json($pokemonList);
        }

        return response()->json(['error' => 'Failed to fetch data from PokeAPI'], 500);
    }

    public function show($id)
    {
        $response = Http::get("https://pokeapi.co/api/v2/pokemon/{$id}");

        if ($response->successful()) {
            $data = $response->json();
            
            $types = collect($data['types'])->map(function ($item) {
                return ucfirst($item['type']['name']);
            })->toArray();

            $abilities = collect($data['abilities'])->map(function ($item) {
                return ucfirst($item['ability']['name']);
            })->toArray();

            $stats = collect($data['stats'])->map(function ($item) {
                return [
                    'name' => ucfirst($item['stat']['name']),
                    'value' => $item['base_stat']
                ];
            })->toArray();

            $pokemonId = $data['id'];

            return response()->json([
                'id' => $pokemonId,
                'name' => ucfirst($data['name']),
                'image' => "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{$pokemonId}.png",
                'types' => $types,
                'height' => $data['height'],
                'weight' => $data['weight'],
                'abilities' => $abilities,
                'stats' => $stats
            ]);
        }

        return response()->json(['error' => 'Pokemon not found'], 404);
    }
}
