<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class PokemonController extends Controller
{
    /**
     * Daftar Pokémon (tanpa types).
     * Tetap dipertahankan untuk backward compatibility.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');
        $cacheKey = $search
            ? 'pokemon_list_search_' . md5(strtolower($search))
            : 'pokemon_list_default';

        $pokemonList = Cache::remember($cacheKey, 3600, function () use ($search) {
            $limit = $search ? 2000 : 20;

            $response = Http::timeout(10)->get("https://pokeapi.co/api/v2/pokemon?limit={$limit}");

            if (!$response->successful()) {
                return null;
            }

            $data = $response->json();
            $results = collect($data['results']);

            if ($search) {
                $results = $results->filter(function ($pokemon) use ($search) {
                    $parts = explode('/', rtrim($pokemon['url'], '/'));
                    $id = end($parts);

                    if (is_numeric($search)) {
                        return Str::contains($id, $search);
                    }

                    return Str::contains(strtolower($pokemon['name']), strtolower($search));
                })->take(20)->values();
            }

            return $results->map(function ($pokemon) {
                $parts = explode('/', rtrim($pokemon['url'], '/'));
                $id = end($parts);

                return [
                    'id' => $id,
                    'name' => ucfirst($pokemon['name']),
                    'image' => "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{$id}.png",
                    'url' => $pokemon['url']
                ];
            })->toArray();
        });

        if ($pokemonList === null) {
            // Hapus cache null supaya retry berikutnya coba fetch ulang
            Cache::forget($cacheKey);
            return response()->json(['error' => 'Failed to fetch data from PokeAPI'], 500);
        }

        return response()->json($pokemonList);
    }

    /**
     * Daftar Pokémon DENGAN types — endpoint baru.
     * Frontend cukup 1x call, dapat list + types sekaligus.
     * Menghilangkan N+1 problem (21 calls → 1 call).
     */
    public function indexWithTypes(Request $request)
    {
        $search = $request->query('search');
        $cacheKey = $search
            ? 'pokemon_with_types_search_' . md5(strtolower($search))
            : 'pokemon_with_types_default';

        $pokemonList = Cache::remember($cacheKey, 3600, function () use ($search) {
            // 1. Ambil list dulu
            $limit = $search ? 2000 : 20;
            $response = Http::timeout(10)->get("https://pokeapi.co/api/v2/pokemon?limit={$limit}");

            if (!$response->successful()) {
                return null;
            }

            $data = $response->json();
            $results = collect($data['results']);

            if ($search) {
                $results = $results->filter(function ($pokemon) use ($search) {
                    $parts = explode('/', rtrim($pokemon['url'], '/'));
                    $id = end($parts);

                    if (is_numeric($search)) {
                        return Str::contains($id, $search);
                    }

                    return Str::contains(strtolower($pokemon['name']), strtolower($search));
                })->take(20)->values();
            }

            $basicList = $results->map(function ($pokemon) {
                $parts = explode('/', rtrim($pokemon['url'], '/'));
                $id = end($parts);
                return [
                    'id' => $id,
                    'name' => ucfirst($pokemon['name']),
                    'image' => "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{$id}.png",
                    'url' => $pokemon['url']
                ];
            })->toArray();

            // 2. Fetch detail per Pokémon secara paralel untuk ambil types
            //    Gunakan Http::pool() agar semua request berjalan concurrent
            $ids = array_column($basicList, 'id');

            $responses = Http::pool(function ($pool) use ($ids) {
                foreach ($ids as $id) {
                    $pool->as("pokemon_{$id}")
                        ->retry(2, 200)
                        ->timeout(10)
                        ->get("https://pokeapi.co/api/v2/pokemon/{$id}");
                }
            });

            // 3. Gabungkan types ke list
            return array_map(function ($pokemon) use ($responses) {
                $key = "pokemon_{$pokemon['id']}";
                $types = [];

                if (
                    isset($responses[$key])
                    && !($responses[$key] instanceof \Throwable)
                    && $responses[$key]->successful()
                ) {
                    $detail = $responses[$key]->json();
                    $types = collect($detail['types'])->map(function ($item) {
                        return ucfirst($item['type']['name']);
                    })->toArray();

                    // Bonus: cache detail individual juga (24 jam)
                    Cache::put("pokemon_detail_{$pokemon['id']}", [
                        'id' => $detail['id'],
                        'name' => ucfirst($detail['name']),
                        'image' => "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{$detail['id']}.png",
                        'types' => $types,
                        'height' => $detail['height'] / 10,
                        'weight' => $detail['weight'] / 10,
                        'abilities' => collect($detail['abilities'])->map(fn($item) => ucfirst($item['ability']['name']))->toArray(),
                        'stats' => collect($detail['stats'])->map(fn($item) => [
                            'name' => ucfirst($item['stat']['name']),
                            'value' => $item['base_stat']
                        ])->toArray(),
                    ], 86400);
                }

                return array_merge($pokemon, ['types' => $types]);
            }, $basicList);
        });

        if ($pokemonList === null) {
            Cache::forget($cacheKey);
            return response()->json(['error' => 'Failed to fetch data from PokeAPI'], 500);
        }

        return response()->json($pokemonList);
    }

    /**
     * Detail satu Pokémon (by ID).
     * Di-cache 24 jam karena data Pokémon statis.
     */
    public function show($id)
    {
        $pokemon = Cache::remember("pokemon_detail_{$id}", 86400, function () use ($id) {
            $response = Http::timeout(10)->get("https://pokeapi.co/api/v2/pokemon/{$id}");

            if (!$response->successful()) {
                return null;
            }

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

            return [
                'id' => $pokemonId,
                'name' => ucfirst($data['name']),
                'image' => "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{$pokemonId}.png",
                'types' => $types,
                'height' => $data['height'] / 10,
                'weight' => $data['weight'] / 10,
                'abilities' => $abilities,
                'stats' => $stats
            ];
        });

        if ($pokemon === null) {
            Cache::forget("pokemon_detail_{$id}");
            return response()->json(['error' => 'Pokemon not found'], 404);
        }

        return response()->json($pokemon);
    }
}
