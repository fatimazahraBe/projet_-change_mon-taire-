<?php

namespace App\Http\Controllers;
use App\Models\Transaction;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request; 
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use App\Models\transactioApi; // This should match your actual model name
use Illuminate\Support\Facades\Validator;

class ControllerTRansationApi extends Controller
{
    public function index()
    {
        $transactions = transactioApi::with([
            'fromCurrency',
            'toCurrency',
            'client'
        ])->get();
        
        return response()->json([
            'transactioApi' => $transactions
        ]);
    }

    public function store(Request $request)
    {
        // Validation des données
        $validated = $request->validate([
            'client_type' => ['required', Rule::in(['societe', 'particulier', 'externe'])], 
            'client_id' => [
                'required',
                function ($attribute, $value, $fail) use ($request) {
                    if (!DB::table('clients')->where('id', $value)->exists()) {
                        $fail("Le client sélectionné n'existe pas dans la base de données.");
                    }
                    
                    // Vérification du type de client
                    $client = DB::table('clients')->where('id', $value)->first();
                    
                    if ($client) {
                        if ($request->client_type === 'societe' && $client->type !== 'S') {
                            $fail("Le client sélectionné n'est pas une société.");
                        }
                        elseif ($request->client_type === 'particulier' && $client->type !== 'P') {
                            $fail("Le client sélectionné n'est pas un particulier.");
                        }
                        elseif ($request->client_type === 'externe' && $client->type !== 'E') {
                            $fail("Le client sélectionné n'est pas un client externe.");
                        }
                    }
                },
            ],
            'from_currency_id' => 'required|exists:devises,id',
            'to_currency_id' => 'required|exists:devises,id',
            'montant' => 'required|numeric|min:0.01',
            'taux_id' => 'required|exists:PrixApi,id',
            'taux' => 'required|numeric',
            'status' => 'required|string',
            'dateTransa' => 'required|date',
        ]);
    
        // Récupérer le taux de change
        $tauxData = DB::table('PrixApi')->where('id', $validated['taux_id'])->first();
        
        if (!$tauxData) {
            return response()->json(['error' => 'Le taux de change spécifié est introuvable.'], 404);
        }
           
        // Calcul du montant converti
        $montant_convertir = $validated['montant'] * $validated['taux'];
    
        // Création de la transaction
        $transaction = new transactioApi([
            'client_id' => $validated['client_id'],
            'client_type' => $validated['client_type'],
            'from_currency_id' => $validated['from_currency_id'],
            'to_currency_id' => $validated['to_currency_id'],
            'montant' => $validated['montant'],
            'taux' => $validated['taux'],
            'taux_id' => $validated['taux_id'],
            'montant_convirtir' => $montant_convertir,
            'status' => $validated['status'],
            'dateTransa' => $validated['dateTransa'],
        ]);
    
        // Sauvegarde dans la base de données
        $transaction->save();
    
        return response()->json($transaction, 201);
    }
    
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'client_id' => 'required|exists:clients,id',
            'client_type' => ['required', Rule::in(['societe', 'particulier', 'externe'])],
            'from_currency_id' => 'required|exists:devises,id',
            'to_currency_id' => 'required|exists:devises,id',
            'montant' => 'required|numeric|min:0.01',
            'taux_id' => 'required|exists:PrixApi,id',
            'taux' => 'required|numeric',
            'status' => 'required|string',
            'dateTransa' => 'required|date',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        // Trouver la transaction
        $transaction = transactioApi::findOrFail($id);
        
        // Récupérer le taux de change
        $tauxData = DB::table('PrixApi')->where('id', $request->taux_id)->first();
        
        if (!$tauxData) {
            return response()->json(['error' => 'Le taux de change spécifié est introuvable.'], 404);
        }
        
        // Calcul du montant converti
        $montant_convertir = $request->montant * $request->taux;
    
        // Mise à jour de la transaction
        $transaction->client_id = $request->client_id;
        $transaction->client_type = $request->client_type;
        $transaction->from_currency_id = $request->from_currency_id;
        $transaction->to_currency_id = $request->to_currency_id;
        $transaction->montant = $request->montant;
        $transaction->taux = $request->taux;
        $transaction->taux_id = $request->taux_id;
        $transaction->montant_convirtir = $montant_convertir;
        $transaction->status = $request->status;
        $transaction->dateTransa = $request->dateTransa;
        
        // Sauvegarder les changements
        $transaction->save();
    
        return response()->json(['message' => 'Transaction mise à jour avec succès', 'transaction' => $transaction], 200);
    }
    public function destroy($id)
{
    // Trouver la transaction
    $transaction = transactioApi::findOrFail($id);
    
    // Supprimer la transaction
    $transaction->delete();
    
    return response()->json(['message' => 'Transaction supprimée avec succès'], 200);
}
}
