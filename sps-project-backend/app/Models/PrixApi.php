<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PrixApi extends Model
{
    use HasFactory;
    
    protected $table = 'prixapi';
    
    // S'assurer que tous les champs nécessaires sont fillable
    protected $fillable = [
        'devise_achat',
        'devise_vente',
        'taux',
        'taux_inverse'
    ];

    // Désactiver les timestamps si la table n'a pas les colonnes created_at et updated_at
    public $timestamps = false;
    
    // Définir explicitement la clé primaire si elle n'est pas 'id'
    // protected $primaryKey = 'id'; // Décommentez et modifiez si nécessaire
    
    // Relations avec les devises correctement définies
    public function deviseAchat()
    {
        return $this->belongsTo(Devise::class, 'devise_achat');
    }

    public function deviseVente()
    {
        return $this->belongsTo(Devise::class, 'devise_vente');
    }

    protected $casts = [
        'taux' => 'float',
    ];
    
}