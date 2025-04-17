<?php

namespace App\Http\Controllers;

use App\Models\EchangeDevise;  // Notez le nom corrigé en PascalCase
use Illuminate\Http\Request;

class EchangeController extends Controller
{
    public function index()
    {
        $echanges = EchangeDevise::with('devise', 'prix')->get();
        
        return response()->json([
            'echanges_devise' => $echanges  // Nom de clé cohérent en snake_case
        ]);
    }
}