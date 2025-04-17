<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DevisesSeed extends Seeder
{
    public function run(): void
    {
        DB::table('devises')->insert([
            'code' => 'USD',
            'name' => 'Dollar américain',
            'symbol' => '$',
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
}

