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
    { Schema::table('clients', function (Blueprint $table) {
        $table->string('nom')->after("CodeClient")->nullable()->change();
            $table->string('prenom')->after("nom")->nullable()->change();
            $table->string('civilite')->after("nom")->nullable()->change();
            $table->string('nationalite')->after("civilite")->nullable()->change();
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
