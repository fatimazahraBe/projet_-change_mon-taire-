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
        Schema::table('taux_echange', function (Blueprint $table) {
       
            $table->date('date_d')->nullable()->change(); 
      
            $table->enum('source', ['automatique', 'manuelle'])->default('automatique')->change(); // Source du taux
           
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
