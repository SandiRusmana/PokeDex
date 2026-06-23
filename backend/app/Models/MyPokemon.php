<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MyPokemon extends Model
{
    protected $fillable = [
        'pokemon_id', 'name', 'image', 'types', 'height', 'weight'
    ];

    protected $casts = [
        'types' => 'array'
    ];
}
