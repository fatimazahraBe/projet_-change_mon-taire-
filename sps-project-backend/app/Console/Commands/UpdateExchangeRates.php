<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Devise;
use App\Models\TauxEchange;

class UpdateExchangeRates extends Command
{
    protected $signature = 'update:exchange-rates';
    protected $description = 'Met à jour les devises et les taux de change depuis l\'API';

    public function handle()
    {
        $url = "https://v6.exchangerate-api.com/v6/3665331e12124ef37f9c4b64/latest/MAD";
        $response = Http::withoutVerifying()->get($url);

        $data = $response->json();

        if (!isset($data['conversion_rates'])) {
            $this->error("Erreur: Impossible de récupérer les taux.");
            return;
        }

        $baseDevise = "MAD"; // Toujours utiliser MAD comme devise cible
        $tauxList = $data['conversion_rates'];

        // 🔹 Mettre à jour la table `devises`
        foreach ($tauxList as $code => $taux) {
            Devise::updateOrCreate(
                ['code' => $code],
                [
                    'name' => $code, // Utiliser le code comme nom
                    'symbol' => $this->getDeviseSymbol($code)
                ]
            );
        }

        // 🔹 Mettre à jour la table `taux_echange` (MAD toujours comme devise cible)
        $deviseCible = Devise::where('code', $baseDevise)->first();

        if ($deviseCible) {
            foreach ($tauxList as $code => $taux) {
                $deviseSource = Devise::where('code', $code)->first();

                if ($deviseSource) {
                    TauxEchange::updateOrCreate(
                        [
                            'id_de_monnaie_de_change' => $deviseSource->id,
                            'id_de_monnaie_a_change' => $deviseCible->id,
                        'source' => "automatique"
                        ],
                        [
                            'taux' => $taux,
                            'date_d' => now(),
                            'date_f' => null
                        ]
                    );
                }
            }
        }

        $this->info("Les devises et les taux de change ont été mis à jour avec succès !");
    }

    /**
     * Retourne un symbole par défaut pour une devise (facultatif)
     */
    private function getDeviseSymbol($code)
    {
        $symbols = [
            "USD" => "$",
            "EUR" => "€",
            "GBP" => "£",
            "MAD" => "د.م.",
            "JPY" => "¥",
            "CAD" => "$"
        ];

        return $symbols[$code] ?? "";
    }
}
