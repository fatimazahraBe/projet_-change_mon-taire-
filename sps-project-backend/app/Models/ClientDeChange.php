<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientDeChange extends Model
{
    use HasFactory;

    protected $table = 'clients_de_changes';
    protected $fillable = ['nom', 'prenom', 'CIN', 'nationnalite'];

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'client_id');
    }
}


