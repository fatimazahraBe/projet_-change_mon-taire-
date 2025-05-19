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
        Schema::create('PrixApi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('devise_achat')->constrained('devises')->onDelete('cascade');
            $table->foreignId('devise_vente')->constrained('devises')->onDelete('cascade'); 
            $table->decimal('taux', 10, 6);  
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
