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
        Schema::table('clients', function (Blueprint $table) {
            $table->string('nom')->after("CodeClient")->nullable();
            $table->string('prenom')->after("nom")->nullable();
            $table->string('civilite')->after("nom")->nullable();
            $table->string('nationalite')->after("civilite")->nullable();
            $table->string('type')->after("nationalite")->nullable();
            $table->string('cin')->after("prenom")->nullable();
            $table->string('raison_sociale')->nullable()->change();
            $table->string('adresse')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            //
        });
    }
};
