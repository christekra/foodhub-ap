<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'dish_id',
        'order_id',
        'rating',
        'comment',
        'images',
        'status',
        'admin_notes',
        'reviewed_at',
        'reviewed_by',
    ];

    protected $casts = [
        'rating' => 'integer',
        'images' => 'array',
        'reviewed_at' => 'datetime',
    ];

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function dish()
    {
        return $this->belongsTo(Dish::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    // Méthodes
    public function approve($adminId, $notes = null)
    {
        $this->update([
            'status' => 'approved',
            'admin_notes' => $notes,
            'reviewed_at' => now(),
            'reviewed_by' => $adminId,
        ]);

        // Créer l'avis si approuvé
        if ($this->status === 'approved') {
            $this->createReview();
        }
    }

    public function reject($adminId, $notes = null)
    {
        $this->update([
            'status' => 'rejected',
            'admin_notes' => $notes,
            'reviewed_at' => now(),
            'reviewed_by' => $adminId,
        ]);
    }

    private function createReview()
    {
        Review::create([
            'user_id' => $this->user_id,
            'dish_id' => $this->dish_id,
            'order_id' => $this->order_id,
            'rating' => $this->rating,
            'comment' => $this->comment,
            'images' => $this->images,
            'is_verified' => true,
            'is_helpful' => false,
            'helpful_count' => 0,
        ]);
    }
}
