<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PokemonHistory extends Model
{
    protected $fillable = [
        'pokemon_id', 'name', 'image', 'action'
    ];
}
