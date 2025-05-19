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
        Schema::create('transactionapi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->string('client_type');
            $table->foreignId('from_currency_id')->constrained('devises')->onDelete('cascade');
            $table->foreignId('to_currency_id')->constrained('devises')->onDelete('cascade');
            $table->decimal('montant', 15, 2);
            $table->decimal('taux', 10, 6);
            $table->foreignId('taux_id')->constrained('PrixApi')->onDelete('cascade');
            $table->decimal('montant_convirtir', 15, 2);
            $table->string('status');
            $table->timestamps();
            $table->date('dateTransa')->nullable();
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
