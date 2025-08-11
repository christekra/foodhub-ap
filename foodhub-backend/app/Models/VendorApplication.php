<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'restaurant_name',
        'description',
        'phone',
        'address',
        'city',
        'postal_code',
        'latitude',
        'longitude',
        'cuisine_type',
        'opening_hours',
        'delivery_radius',
        'delivery_fee',
        'delivery_time',
        'logo',
        'cover_image',
        'documents',
        'status',
        'admin_notes',
        'reviewed_at',
        'reviewed_by',
    ];

    protected $casts = [
        'documents' => 'array',
        'delivery_fee' => 'decimal:2',
        'delivery_time' => 'integer',
        'delivery_radius' => 'integer',
        'reviewed_at' => 'datetime',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class);
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

    public function scopeUnderReview($query)
    {
        return $query->where('status', 'under_review');
    }

    // Méthodes
    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isApproved()
    {
        return $this->status === 'approved';
    }

    public function isRejected()
    {
        return $this->status === 'rejected';
    }

    public function isUnderReview()
    {
        return $this->status === 'under_review';
    }

    public function approve($adminId, $notes = null)
    {
        $this->update([
            'status' => 'approved',
            'admin_notes' => $notes,
            'reviewed_at' => now(),
            'reviewed_by' => $adminId,
        ]);

        // Créer le vendeur si approuvé
        if ($this->status === 'approved') {
            $this->createVendor();
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

    public function putUnderReview($adminId, $notes = null)
    {
        $this->update([
            'status' => 'under_review',
            'admin_notes' => $notes,
            'reviewed_at' => now(),
            'reviewed_by' => $adminId,
        ]);
    }

    private function createVendor()
    {
        // Créer le vendeur à partir de la candidature
        Vendor::create([
            'user_id' => $this->user_id,
            'name' => $this->restaurant_name,
            'description' => $this->description,
            'phone' => $this->phone,
            'address' => $this->address,
            'city' => $this->city,
            'postal_code' => $this->postal_code,
            'cuisine_type' => $this->cuisine_type,
            'opening_hours' => $this->opening_hours,
            'delivery_radius' => $this->delivery_radius,
            'delivery_fee' => $this->delivery_fee,
            'delivery_time' => $this->delivery_time,
            'logo' => $this->logo,
            'cover_image' => $this->cover_image,
            'is_verified' => true,
            'is_featured' => false,
            'rating' => 0,
            'review_count' => 0,
        ]);

        // Mettre à jour le type de compte de l'utilisateur
        $this->user->update(['account_type' => 'vendor']);
    }
}
