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
        Schema::create('taux_echange', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_de_monnaie_de_change')->constrained('devises')->onDelete('cascade');
            $table->foreignId('id_de_monnaie_a_change')->constrained('devises')->onDelete('cascade'); 
            $table->decimal('taux', 10, 6); 
            $table->date('date_d')->nullable(); 
            $table->date('date_f')->nullable(); 
            $table->enum('source', ['api', 'manual'])->default('api'); // Source du taux
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('taux_echange');

    }
};
