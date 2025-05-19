<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Devise;
use App\Models\PrixApi;
use Illuminate\Support\Facades\DB;

class UpdateExchangeRates extends Command
{
    protected $signature = 'update:exchange-rates';
    protected $description = 'Met à jour les devises et les taux de change depuis les APIs Frankfurter et Open ER.';

    public function handle()
    {
        $baseDevise = "MAD";
        $this->info("🔄 Début de la mise à jour des devises et des taux...");

        // 1. Récupération des noms des devises avec gestion de mémoire améliorée
        $this->info("🌐 Récupération des noms complets des devises...");
        $currenciesInfo = $this->fetchCurrenciesInfo();

        // 2. Récupération des taux depuis Open ER API
        $this->info("📈 Récupération des taux de change depuis Open ER API...");
        $tauxResponse = Http::withoutVerifying()->get("https://open.er-api.com/v6/latest/{$baseDevise}");

        if ($tauxResponse->failed() || !isset($tauxResponse['rates'])) {
            $this->error("❌ Erreur lors de la récupération des taux. Vérifie la connexion API.");
            return;
        }

        $tauxList = $tauxResponse['rates'];
        $this->info("📊 Nombre de taux récupérés: " . count($tauxList));

        // 3. Mettre à jour la table des devises par lot (batch processing)
        $this->info("💱 Mise à jour des devises dans la base de données...");
        
        // Traiter les devises par lots pour économiser la mémoire
        $devisesBatch = [];
        foreach ($tauxList as $code => $taux) {
            $name = $currenciesInfo[$code]['name'] ?? $code;
            $symbol = $currenciesInfo[$code]['symbol'] ?? $this->getDeviseSymbol($code);

            $devisesBatch[] = [
                'code' => $code,
                'name' => $name,
                'symbol' => $symbol,
                'updated_at' => now(),
                'created_at' => now(),
            ];
            
            // Traiter par lots de 50 devises
            if (count($devisesBatch) >= 50) {
                $this->batchUpsertDevises($devisesBatch);
                $devisesBatch = []; // Libérer la mémoire
            }
        }
        
        // Traiter le dernier lot s'il reste des devises
        if (!empty($devisesBatch)) {
            $this->batchUpsertDevises($devisesBatch);
        }

        // Ajouter MAD si absent
        Devise::updateOrCreate(
            ['code' => $baseDevise],
            [
                'name' => $currenciesInfo[$baseDevise]['name'] ?? "Moroccan Dirham",
                'symbol' => $currenciesInfo[$baseDevise]['symbol'] ?? "د.م."
            ]
        );

        // Vérifier le nombre de devises en base
        $count = Devise::count();
        $this->info("📝 Nombre total de devises en base: {$count}");

        // 4. Mettre à jour les taux MAD -> autres & autres -> MAD
        $madDevise = Devise::where('code', $baseDevise)->first();
        
        if (!$madDevise) {
            $this->error("❌ Impossible de trouver la devise MAD en base de données!");
            return;
        }
        
        $this->info("💹 Devise de base (MAD) ID: {$madDevise->id}");
        $this->info("💹 Début de la mise à jour des taux...");

        $tauxCounter = 0;
        // Traiter par lots pour économiser la mémoire
        $tauxBatch = [];
        foreach ($tauxList as $code => $taux) {
            // Charger uniquement le ID de la devise au lieu de l'objet complet
            $autreDeviseId = DB::table('devises')->where('code', $code)->value('id');

            if (!$autreDeviseId) {
                $this->warn("⚠️ Devise introuvable en base pour le code: $code");
                continue;
            }

            if ($autreDeviseId != $madDevise->id) {
                try {
                    // MAD -> Autre devise
                    $tauxBatch[] = [
                        'devise_achat' => $madDevise->id,
                        'devise_vente' => $autreDeviseId,
                        'taux' => $taux,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ];
                    
                    // Autre devise -> MAD
                    $tauxBatch[] = [
                        'devise_achat' => $autreDeviseId,
                        'devise_vente' => $madDevise->id,
                        'taux' => 1 / $taux,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ];
                    
                    $tauxCounter += 2;
                    
                    // Traiter par lots de 100 taux
                    if (count($tauxBatch) >= 100) {
                        $this->batchUpsertTaux($tauxBatch);
                        // Afficher progression
                        $this->line("  - Traitement de {$tauxCounter} taux MAD directs...");
                        $tauxBatch = []; // Libérer la mémoire
                    }
                } catch (\Exception $e) {
                    $this->error("❌ Erreur lors de l'enregistrement du taux pour {$code}: " . $e->getMessage());
                    Log::error("Erreur taux de change: " . $e->getMessage());
                }
            }
        }
        
        // Traiter le dernier lot s'il reste des taux
        if (!empty($tauxBatch)) {
            $this->batchUpsertTaux($tauxBatch);
        }

        $this->info("📊 Nombre de taux directs ajoutés: {$tauxCounter}");
        
        // Vérifier le nombre de taux en base
        $countTaux = PrixApi::count();
        $this->info("📝 Nombre total de taux en base: {$countTaux}");

        // 5. Taux croisés - méthode optimisée avec traitement par lots
        $this->info("🔀 Mise à jour des taux croisés...");
       // $tauxCroisesCounter = $this->updateCrossRatesOptimized($madDevise->id);
        //$this->info("📊 Nombre de taux croisés ajoutés: {$tauxCroisesCounter}");

        // Vérifier à nouveau le nombre de taux en base
        $countTauxFinal = PrixApi::count();
        $this->info("📝 Nombre final de taux en base: {$countTauxFinal}");

        $this->info("✅ Mise à jour terminée avec succès !");
    }

    private function fetchCurrenciesInfo()
    {
        $url = "https://api.frankfurter.app/currencies";
        $response = Http::withoutVerifying()->get($url);

        $fallback = $this->getDefaultCurrenciesInfo();
        $data = $response->ok() ? $response->json() : [];

        $info = [];

        // Fusion API Frankfurter + fallback
        foreach ($fallback as $code => $details) {
            $nameFromApi = $data[$code] ?? null;
            $info[$code] = [
                'name' => $nameFromApi ?? $details['name'],
                'symbol' => $details['symbol']
            ];
        }

        foreach ($data as $code => $name) {
            if (!isset($info[$code])) {
                $fallbackSymbol = $this->getDefaultCurrenciesInfo()[$code]['symbol'] ?? "";
                $info[$code] = [
                    'name' => $name,
                    'symbol' => $fallbackSymbol
                ];
            }
        }

        // Ajouter les codes retournés par l'API Open ER mais inconnus ici
        $tauxResponse = Http::withoutVerifying()->get("https://open.er-api.com/v6/latest/MAD");
        if ($tauxResponse->ok()) {
            $codes = array_keys($tauxResponse['rates']);
            foreach ($codes as $code) {
                if (!isset($info[$code])) {
                    $fallback = $this->getDefaultCurrenciesInfo();
                    $info[$code] = [
                        'name' => $fallback[$code]['name'] ?? $this->getCurrencyFullName($code),
                        'symbol' => $fallback[$code]['symbol'] ?? $this->getDefaultSymbol($code)
                    ];

                    if (!isset($fallback[$code])) {
                        $this->line("ℹ️ Devise complémentaire ajoutée : $code");
                    }
                }
            }
        }

        return $info;
    }

    /**
     * Méthode optimisée pour mettre à jour les taux croisés par lots
     */
    private function updateCrossRatesOptimized($madDeviseId)
{
    $counter = 0;
    $batchSize = 100;
    $processedCount = 0;
    
    // Liste des devises principales que vous voulez traiter
    $principalCurrencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF"];
    
    // Récupérer seulement les IDs des devises principales
    $deviseIds = DB::table('devises')
                   ->whereIn('code', $principalCurrencies)
                   ->where('id', '!=', $madDeviseId)
                   ->pluck('id', 'code')
                   ->toArray();
    
    // Le reste de votre code reste identique...
}

    /**
     * Méthode pour insérer/mettre à jour les devises par lot
     */
    private function batchUpsertDevises($devises)
    {
        foreach ($devises as $devise) {
            DB::table('devises')->updateOrInsert(
                ['code' => $devise['code']],
                [
                    'name' => $devise['name'],
                    'symbol' => $devise['symbol'],
                    'updated_at' => $devise['updated_at'],
                    'created_at' => $devise['created_at']
                ]
            );
        }
    }
    
    /**
     * Méthode pour insérer/mettre à jour les taux par lot
     */
    private function batchUpsertTaux($taux)
    {
        foreach ($taux as $item) {
            DB::table('PrixApi')->updateOrInsert(
                [
                    'devise_achat' => $item['devise_achat'],
                    'devise_vente' => $item['devise_vente']
                ],
                [
                    'taux' => $item['taux'],
                    'updated_at' => $item['updated_at'],
                    'created_at' => $item['created_at']
                ]
            );
        }
    }

    private function getDeviseSymbol($code)
    {
        return $this->getDefaultCurrenciesInfo()[$code]['symbol'] ?? $this->getDefaultSymbol($code);
    }

    private function getDefaultSymbol($code)
    {
        // Règle générale simple pour les devises sans symbole connu
        return $code;
    }

    private function getCurrencyFullName($code)
    {
        $currencyNames = [
            "ANG" => "Netherlands Antillean Guilder",
            "AWG" => "Aruban Florin",
            "BAM" => "Bosnia and Herzegovina Convertible Mark",
            "BBD" => "Barbadian Dollar",
            "BDT" => "Bangladeshi Taka",
            "BHD" => "Bahraini Dinar",
            "BIF" => "Burundian Franc",
            "BMD" => "Bermudian Dollar",
            "BND" => "Brunei Dollar",
            "BOB" => "Bolivian Boliviano",
            "BSD" => "Bahamian Dollar",
            "BTN" => "Bhutanese Ngultrum",
            "BWP" => "Botswanan Pula",
            "BYN" => "Belarusian Ruble",
            "BZD" => "Belize Dollar",
            "CDF" => "Congolese Franc",
            "CLP" => "Chilean Peso",
            "COP" => "Colombian Peso",
            "CRC" => "Costa Rican Colón",
            "CUP" => "Cuban Peso",
            "CVE" => "Cape Verdean Escudo",
            "DJF" => "Djiboutian Franc",
            "DOP" => "Dominican Peso",
            "ERN" => "Eritrean Nakfa",
            "ETB" => "Ethiopian Birr",
            "FJD" => "Fijian Dollar",
            "FKP" => "Falkland Islands Pound",
            "FOK" => "Faroese Króna",
            "GEL" => "Georgian Lari",
            "GGP" => "Guernsey Pound",
            "GHS" => "Ghanaian Cedi",
            "GIP" => "Gibraltar Pound",
            "GMD" => "Gambian Dalasi",
            "GNF" => "Guinean Franc",
            "GTQ" => "Guatemalan Quetzal",
            "GYD" => "Guyanese Dollar",
            "HNL" => "Honduran Lempira",
            "HRK" => "Croatian Kuna",
            "HTG" => "Haitian Gourde",
            "IMP" => "Manx Pound",
            "IQD" => "Iraqi Dinar",
            "IRR" => "Iranian Rial",
            "JEP" => "Jersey Pound",
            "JMD" => "Jamaican Dollar",
            "JOD" => "Jordanian Dinar",
            "KES" => "Kenyan Shilling",
            "KGS" => "Kyrgystani Som",
            "KHR" => "Cambodian Riel",
            "KID" => "Kiribati Dollar",
            "KMF" => "Comorian Franc",
            "KPW" => "North Korean Won",
            "KYD" => "Cayman Islands Dollar",
            "KZT" => "Kazakhstani Tenge",
            "LAK" => "Laotian Kip",
            "LBP" => "Lebanese Pound",
            "LKR" => "Sri Lankan Rupee",
            "LRD" => "Liberian Dollar",
            "LSL" => "Lesotho Loti",
            "LYD" => "Libyan Dinar",
            "MDL" => "Moldovan Leu",
            "MGA" => "Malagasy Ariary",
            "MKD" => "Macedonian Denar",
            "MMK" => "Myanmar Kyat",
            "MNT" => "Mongolian Tugrik",
            "MOP" => "Macanese Pataca",
            "MRU" => "Mauritanian Ouguiya",
            "MUR" => "Mauritian Rupee",
            "MVR" => "Maldivian Rufiyaa",
            "MWK" => "Malawian Kwacha",
            "MZN" => "Mozambican Metical",
            "NAD" => "Namibian Dollar",
            "NGN" => "Nigerian Naira",
            "NIO" => "Nicaraguan Córdoba",
            "NPR" => "Nepalese Rupee",
            "OMR" => "Omani Rial",
            "PAB" => "Panamanian Balboa",
            "PEN" => "Peruvian Sol",
            "PGK" => "Papua New Guinean Kina",
            "PKR" => "Pakistani Rupee",
            "PYG" => "Paraguayan Guaraní",
            "RSD" => "Serbian Dinar",
            "RWF" => "Rwandan Franc",
            "SBD" => "Solomon Islands Dollar",
            "SCR" => "Seychellois Rupee",
            "SDG" => "Sudanese Pound",
            "SHP" => "Saint Helena Pound",
            "SLE" => "Sierra Leonean Leone",
            "SLL" => "Sierra Leonean Leone (old)",
            "SOS" => "Somali Shilling",
            "SRD" => "Surinamese Dollar",
            "SSP" => "South Sudanese Pound",
            "STN" => "São Tomé and Príncipe Dobra",
            "SYP" => "Syrian Pound",
            "SZL" => "Swazi Lilangeni",
            "TJS" => "Tajikistani Somoni",
            "TMT" => "Turkmenistani Manat",
            "TOP" => "Tongan Paʻanga",
            "TTD" => "Trinidad and Tobago Dollar",
            "TVD" => "Tuvaluan Dollar",
            "TWD" => "New Taiwan Dollar",
            "TZS" => "Tanzanian Shilling",
            "UAH" => "Ukrainian Hryvnia",
            "UGX" => "Ugandan Shilling",
            "UYU" => "Uruguayan Peso",
            "UZS" => "Uzbekistani Som", 
            "VES" => "Venezuelan Bolívar",
            "VND" => "Vietnamese Đồng",
            "VUV" => "Vanuatu Vatu",
            "WST" => "Samoan Tala",
            "XAF" => "Central African CFA Franc",
            "XCD" => "East Caribbean Dollar",
            "XCG" => "Gold (troy ounce)",
            "XDR" => "Special Drawing Rights",
            "XOF" => "West African CFA Franc",
            "XPF" => "CFP Franc",
            "YER" => "Yemeni Rial",
            "ZMW" => "Zambian Kwacha",
            "ZWL" => "Zimbabwean Dollar"
        ];

        return $currencyNames[$code] ?? "$code Currency";
    }

    private function getDefaultCurrenciesInfo()
    {
        return [
            "USD" => ["name" => "US Dollar", "symbol" => "$"],
            "EUR" => ["name" => "Euro", "symbol" => "€"],
            "GBP" => ["name" => "British Pound", "symbol" => "£"],
            "MAD" => ["name" => "Moroccan Dirham", "symbol" => "د.م."],
            "JPY" => ["name" => "Japanese Yen", "symbol" => "¥"],
            "CAD" => ["name" => "Canadian Dollar", "symbol" => "C$"],
            "AUD" => ["name" => "Australian Dollar", "symbol" => "A$"],
            "CHF" => ["name" => "Swiss Franc", "symbol" => "Fr"],
            "CNY" => ["name" => "Chinese Yuan", "symbol" => "¥"],
            "INR" => ["name" => "Indian Rupee", "symbol" => "₹"],
            "BRL" => ["name" => "Brazilian Real", "symbol" => "R$"],
            "RUB" => ["name" => "Russian Ruble", "symbol" => "₽"],
            "KRW" => ["name" => "South Korean Won", "symbol" => "₩"],
            "SGD" => ["name" => "Singapore Dollar", "symbol" => "S$"],
            "NZD" => ["name" => "New Zealand Dollar", "symbol" => "NZ$"],
            "MXN" => ["name" => "Mexican Peso", "symbol" => "$"],
            "HKD" => ["name" => "Hong Kong Dollar", "symbol" => "HK$"],
            "TRY" => ["name" => "Turkish Lira", "symbol" => "₺"],
            "ZAR" => ["name" => "South African Rand", "symbol" => "R"],
            "DZD" => ["name" => "Algerian Dinar", "symbol" => "د.ج"],
            "TND" => ["name" => "Tunisian Dinar", "symbol" => "د.ت"],
            "EGP" => ["name" => "Egyptian Pound", "symbol" => "£"],
            "SAR" => ["name" => "Saudi Riyal", "symbol" => "﷼"],
            "QAR" => ["name" => "Qatari Riyal", "symbol" => "﷼"],
            "AED" => ["name" => "UAE Dirham", "symbol" => "د.إ"],
            "KWD" => ["name" => "Kuwaiti Dinar", "symbol" => "د.ك"],
            "AFN" => ["name" => "Afghan Afghani", "symbol" => "؋"],
            "ALL" => ["name" => "Albanian Lek", "symbol" => "L"],
            "AMD" => ["name" => "Armenian Dram", "symbol" => "֏"],
            "AOA" => ["name" => "Angolan Kwanza", "symbol" => "Kz"],
            "ARS" => ["name" => "Argentine Peso", "symbol" => "$"],
            "AZN" => ["name" => "Azerbaijani Manat", "symbol" => "₼"],
            "IDR" => ["name" => "Indonesian Rupiah", "symbol" => "Rp"],
            "PHP" => ["name" => "Philippine Peso", "symbol" => "₱"],
            "PLN" => ["name" => "Polish Złoty", "symbol" => "zł"],
            "SEK" => ["name" => "Swedish Krona", "symbol" => "kr"],
            "THB" => ["name" => "Thai Baht", "symbol" => "฿"],
            "ISK" => ["name" => "Icelandic Króna", "symbol" => "kr"],
            "CZK" => ["name" => "Czech Koruna", "symbol" => "Kč"],
            "DKK" => ["name" => "Danish Krone", "symbol" => "kr"],
            "HUF" => ["name" => "Hungarian Forint", "symbol" => "Ft"],
            "NOK" => ["name" => "Norwegian Krone", "symbol" => "kr"],
            "RON" => ["name" => "Romanian Leu", "symbol" => "lei"],
            "BGN" => ["name" => "Bulgarian Lev", "symbol" => "лв"],
            "ILS" => ["name" => "Israeli New Shekel", "symbol" => "₪"],
            "MYR" => ["name" => "Malaysian Ringgit", "symbol" => "RM"],
        ];
    }
}