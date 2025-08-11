<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DishApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'name',
        'description',
        'price',
        'discount_price',
        'category_id',
        'image',
        'ingredients',
        'allergens',
        'nutritional_info',
        'is_vegetarian',
        'is_vegan',
        'is_gluten_free',
        'is_halal',
        'is_kosher',
        'preparation_time',
        'spice_level',
        'status',
        'admin_notes',
        'reviewed_at',
        'reviewed_by',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'discount_price' => 'decimal:2',
        'ingredients' => 'array',
        'allergens' => 'array',
        'nutritional_info' => 'array',
        'is_vegetarian' => 'boolean',
        'is_vegan' => 'boolean',
        'is_gluten_free' => 'boolean',
        'is_halal' => 'boolean',
        'is_kosher' => 'boolean',
        'preparation_time' => 'integer',
        'reviewed_at' => 'datetime',
    ];

    // Relations
    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
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

        // Créer le plat si approuvé
        if ($this->status === 'approved') {
            $this->createDish();
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

    private function createDish()
    {
        Dish::create([
            'vendor_id' => $this->vendor_id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'discount_price' => $this->discount_price,
            'category_id' => $this->category_id,
            'image' => $this->image,
            'ingredients' => $this->ingredients,
            'allergens' => $this->allergens,
            'nutritional_info' => $this->nutritional_info,
            'is_vegetarian' => $this->is_vegetarian,
            'is_vegan' => $this->is_vegan,
            'is_gluten_free' => $this->is_gluten_free,
            'is_halal' => $this->is_halal,
            'is_kosher' => $this->is_kosher,
            'preparation_time' => $this->preparation_time,
            'spice_level' => $this->spice_level,
            'is_available' => true,
            'is_popular' => false,
            'is_featured' => false,
            'rating' => 0,
            'review_count' => 0,
        ]);
    }
}
