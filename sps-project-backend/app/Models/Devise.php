<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Devise extends Model
{
        use HasFactory;
    
        protected $fillable = ['code', 'name', 'symbol'];
    
        /**
         * Une devise peut être utilisée dans plusieurs transactions.
         */
        public function fromTransactions()
        {
            return $this->hasMany(Transaction::class, 'from_currency_id');
        }
    
        public function toTransactions()
        {
            return $this->hasMany(Transaction::class, 'to_currency_id');
        }

        public function toDefiniyprix()
        {
            return $this->hasMany(definie_prixes::class, 'devseID');
        }
    }

