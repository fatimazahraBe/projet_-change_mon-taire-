<?php

namespace App\Http\Controllers;
use App\Models\PrixApi;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use App\Models\Devise;

class ApiPrixController extends Controller
{
    public function index()
    {
        try {
            // Désactiver temporairement les relations pour améliorer les performances
            $prix = PrixApi::select('id', 'devise_achat', 'devise_vente', 'taux', 'taux_inverse')
                          ->paginate(1000); // Augmenter la taille de la page mais pas trop pour éviter le timeout

            // Récupérer les IDs des devises uniques
            $deviseIds = collect($prix->items())
                ->pluck('devise_achat')
                ->merge(collect($prix->items())->pluck('devise_vente'))
                ->unique()
                ->values()
                ->toArray();

            // Charger toutes les devises nécessaires en une seule requête
            $devises = Devise::whereIn('id', $deviseIds)->get()->keyBy('id');

            // Transformer les données pour inclure les informations des devises
            $transformedData = collect($prix->items())->map(function($item) use ($devises) {
                return [
                    'id' => $item->id,
                    'devise_achat' => $devises->get($item->devise_achat),
                    'devise_vente' => $devises->get($item->devise_vente),
                    'taux' => $item->taux,
                    'taux_inverse' => $item->taux_inverse
                ];
            })->values();

            return response()->json([
                'status' => 'success',
                'data' => $transformedData,
                'pagination' => [
                    'total' => $prix->total(),
                    'per_page' => $prix->perPage(),
                    'current_page' => $prix->currentPage(),
                    'last_page' => $prix->lastPage(),
                    'from' => $prix->firstItem(),
                    'to' => $prix->lastItem()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'devise_achat' => ['required', 'exists:devises,id'],
            'devise_vente' => ['required', 'exists:devises,id', 
                Rule::notIn([$request->devise_achat])], // Empêche d'avoir la même devise pour achat et vente
            'taux' => 'required|numeric|gt:0',
            'taux_inverse'=>'nullable'

        ]);

        $prix = PrixApi::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Prix créé avec succès',
            'data' => $prix
        ], 201);
    }

    
    public function show($id)
    {
        $prix = PrixApi::with(['devise_achat', 'devise_vente'])->findOrFail($id);
        
        return response()->json([
            'status' => 'success',
            'data' => $prix
        ]);
    }

    
    public function update(Request $request, $id)
    {
        $prix = PrixApi::findOrFail($id);
        
        $validated = $request->validate([
            'devise_achat' => ['sometimes', 'required', 'exists:devises,id'],
            'devise_vente' => ['sometimes', 'required', 'exists:devises,id',
                Rule::when($request->has('devise_achat'), 
                    Rule::notIn([$request->devise_achat]),
                    Rule::notIn([$prix->devise_achat]))
            ],
            'taux' => 'sometimes|required|numeric|gt:0',
            'taux_inverse'=>'nullable'
        ]);

        $prix->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Prix mis à jour avec succès',
            'data' => $prix
        ]);
    }

    
    public function destroy($id)
    {
        $prix = PrixApi::findOrFail($id);
        $prix->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Prix supprimé avec succès'
        ]);
    }

    
    public function searchByDevise(Request $request)
    {
        $request->validate([
            'devise_achat' => 'nullable|exists:devises,id',
            'devise_vente' => 'nullable|exists:devises,id',
        ]);

        $query = PrixApi::query();

        if ($request->has('devise_achat')) {
            $query->where('devise_achat', $request->devise_achat);
        }

        if ($request->has('devise_vente')) {
            $query->where('devise_vente', $request->devise_vente);
        }

        $prix = $query->with(['devise_achat', 'devise_vente'])->get();

        return response()->json([
            'status' => 'success',
            'data' => $prix
        ]);
    }
}
