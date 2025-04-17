<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('echanges_devise', function (Blueprint $table) {
            $table->id();
            $table->string('type_echange');
            $table->unsignedBigInteger('id_devise');
            $table->unsignedBigInteger('id_prix');
            $table->decimal('montant', 15, 2);
            $table->string('status');
            $table->datetime('date_transaction');
            $table->decimal('montant_converti', 15, 2);
            $table->timestamps();
            
            $table->foreign('id_devise')->references('id')->on('devises');
            $table->foreign('id_prix')->references('id')->on('definie_prixes');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('echanges');
    }
};