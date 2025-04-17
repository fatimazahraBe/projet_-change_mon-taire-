<?php

namespace App\Http\Controllers;

use App\Models\definie_prix;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DifinitPrixController extends Controller
{
    public function index()
    {
        $devises = definie_prix::with('deviseID')->get();
        return response()->json([
            'definie_prix' => $devises
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'devseID' => 'required|exists:devises,id',
            'prix_achat' => 'required|decimal:0,6',
            'prix_vente' => 'required|decimal:0,6',
            'date_d' => 'required|date',
            'date_f' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $prix = definie_prix::create($request->all());
        return response()->json([
            'message' => 'Ajouté avec succès',
            'prix' => $prix
        ], 201);
    }

    public function update(Request $request, $id)
{
    $validator = Validator::make($request->all(), [
        'devseID' => 'required|exists:devises,id',
        'prix_achat' => 'required|decimal:0,6',
        'prix_vente' => 'required|decimal:0,6',
        'date_d' => 'required|date',
        'date_f' => 'required|date',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    // Check if record exists first
    $prix = definie_prix::find($id);
    
    if (!$prix) {
        return response()->json([
            'message' => 'Record not found'
        ], 404);
    }

    // Update the record
    $prix->update($request->all());

    return response()->json([
        'message' => 'Modification réussie avec succès',
        'prix' => $prix
    ], 200);
}
public function destroy($id)
{
    $prix = definie_prix::find($id);
    
    if (!$prix) {
        return response()->json(['message' => 'Record not found'], 404);
    }

    $prix->delete();
    
    return response()->json([
        'message' => 'Prix supprimé avec succès'
    ]);
}
}