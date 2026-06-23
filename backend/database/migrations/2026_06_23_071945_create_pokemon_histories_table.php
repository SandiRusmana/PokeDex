<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pokemon_histories', function (Blueprint $table) {
            $table->id();
            $table->integer('pokemon_id');
            $table->string('name');
            $table->string('image');
            $table->enum('action', ['catch', 'release']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pokemon_histories');
    }
};
