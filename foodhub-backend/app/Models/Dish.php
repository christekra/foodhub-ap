<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dish extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'category_id',
        'name',
        'description',
        'price',
        'discount_price',
        'image',
        'images',
        'is_available',
        'is_popular',
        'is_featured',
        'rating',
        'review_count',
        'order_count',
        'ingredients',
        'allergens',
        'preparation_time',
        'calories',
        'cuisine_type',
        'is_vegetarian',
        'is_vegan',
        'is_gluten_free',
        'is_spicy',
        'spice_level',
    ];

    protected $attributes = [
        'preparation_time' => 15,
        'is_available' => true,
        'is_popular' => false,
        'is_featured' => false,
        'rating' => 0,
        'review_count' => 0,
        'order_count' => 0,
        'is_vegetarian' => false,
        'is_vegan' => false,
        'is_gluten_free' => false,
        'is_spicy' => false,
        'spice_level' => 0,
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'discount_price' => 'decimal:2',
        'images' => 'array',
        'is_available' => 'boolean',
        'is_popular' => 'boolean',
        'is_featured' => 'boolean',
        'rating' => 'decimal:2',
        'ingredients' => 'array',
        'allergens' => 'array',
        'is_vegetarian' => 'boolean',
        'is_vegan' => 'boolean',
        'is_gluten_free' => 'boolean',
        'is_spicy' => 'boolean',
    ];

    /**
     * Get the vendor that owns the dish.
     */
    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    /**
     * Get the category that owns the dish.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the reviews for the dish.
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get the order items for the dish.
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Scope a query to only include available dishes.
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    /**
     * Scope a query to only include popular dishes.
     */
    public function scopePopular($query)
    {
        return $query->where('is_popular', true);
    }

    /**
     * Scope a query to only include featured dishes.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope a query to only include vegetarian dishes.
     */
    public function scopeVegetarian($query)
    {
        return $query->where('is_vegetarian', true);
    }

    /**
     * Scope a query to only include vegan dishes.
     */
    public function scopeVegan($query)
    {
        return $query->where('is_vegan', true);
    }

    /**
     * Scope a query to only include gluten-free dishes.
     */
    public function scopeGlutenFree($query)
    {
        return $query->where('is_gluten_free', true);
    }

    /**
     * Get the discounted price or original price.
     */
    public function getFinalPriceAttribute()
    {
        return $this->discount_price ?? $this->price;
    }

    /**
     * Check if the dish has a discount.
     */
    public function hasDiscount()
    {
        return !is_null($this->discount_price);
    }
}
