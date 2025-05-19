<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Devise;
use App\Models\Prix_par_api;

class ResetDevises extends Command
{
    protected $signature = 'devises:reset';
    protected $description = 'Vide les tables des devises et taux de change';

    public function handle()
    {
        if ($this->confirm('⚠️ Voulez-vous vraiment supprimer TOUTES les devises et leurs taux associés ?')) {
            Prix_par_api::truncate();
            Devise::truncate();
            
            $this->info('Tables vidées avec succès !');
            $this->info('Exécutez maintenant: php artisan update:exchange-rates');
        }
    }
}
