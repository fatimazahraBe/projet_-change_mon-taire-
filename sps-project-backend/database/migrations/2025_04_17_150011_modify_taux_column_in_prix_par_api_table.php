<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('PrixApi', function (Blueprint $table) {
            $table->decimal('taux', 20, 10)->change(); 
        });
    }
    
    public function down()
    {
        Schema::table('PrixApi', function (Blueprint $table) {
            $table->decimal('taux', 10, 6)->change(); 
        });
    }
};
