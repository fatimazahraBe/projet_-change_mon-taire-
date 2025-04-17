<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $table = 'transactions';
    protected $fillable = [
        'client_id',
        'client_type',
        'from_currency_id',
        'to_currency_id',
        'montant',
        'taux',
        'taux_id',
        'montant_convirtir',
        'status',
        'dateTransa'
    ];

    public function fromCurrency()
    {
        return $this->belongsTo(Devise::class, 'from_currency_id');
    }

    public function toCurrency()
    {
        return $this->belongsTo(Devise::class, 'to_currency_id');
    }

    public function tauxEchange()
    {
        return $this->belongsTo(definie_prix::class, 'taux_id');
    }
    

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }
}
