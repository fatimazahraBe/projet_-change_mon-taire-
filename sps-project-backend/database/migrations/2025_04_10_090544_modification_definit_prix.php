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
         Schema::table('definie_prixes', function (Blueprint $table) {
            $table->foreignId('devseID')->constrained('devises')->onDelete('cascade');
            $table->decimal('prix_achat', 10, 6); 
            $table->decimal('prix_vente', 10, 6);
            $table->date('date_d')->nullable(); 
            $table->date('date_f')->nullable();
           
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
