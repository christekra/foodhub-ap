export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T = any> {
    data: T;
    message?: string;
    status: string;
    success?: boolean;
    errors?: Record<string, string[]>;
}

class ApiService {
    private async request(endpoint: string, options: RequestInit = {}): Promise<ApiResponse> {
        const token = localStorage.getItem('token');
        
        const defaultHeaders: HeadersInit = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers,
                },
                credentials: 'include', // Important pour les cookies de session
            });

            const data = await response.json();

            if (!response.ok) {
                // Gestion spécifique des erreurs de validation
                if (response.status === 422 && data.errors) {
                    const errorMessages = Object.entries(data.errors)
                        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                        .join('; ');
                    throw new Error(`Erreurs de validation: ${errorMessages}`);
                }
                
                // Gestion des erreurs d'authentification
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }
                
                throw new Error(data.message || `Erreur HTTP ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erreur de connexion au serveur');
        }
    }

    // Validation côté client
    private validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private validatePassword(password: string): boolean {
        return password.length >= 8;
    }

    private validatePhone(phone: string): boolean {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
        return phoneRegex.test(phone);
    }

    // Auth methods avec validation
    async login(credentials: { email: string; password: string }): Promise<ApiResponse> {
        // Validation côté client
        if (!this.validateEmail(credentials.email)) {
            throw new Error('Format d\'email invalide');
        }
        if (!this.validatePassword(credentials.password)) {
            throw new Error('Le mot de passe doit contenir au moins 8 caractères');
        }

        return this.request('/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async register(userData: {
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        phone?: string;
        address?: string;
        account_type: 'client' | 'vendor';
        restaurant_name?: string;
        cuisine_type?: string;
        business_hours?: string;
    }): Promise<ApiResponse> {
        // Validation côté client
        if (!userData.name || userData.name.length < 2) {
            throw new Error('Le nom doit contenir au moins 2 caractères');
        }
        if (!this.validateEmail(userData.email)) {
            throw new Error('Format d\'email invalide');
        }
        if (!this.validatePassword(userData.password)) {
            throw new Error('Le mot de passe doit contenir au moins 8 caractères');
        }
        if (userData.password !== userData.password_confirmation) {
            throw new Error('Les mots de passe ne correspondent pas');
        }
        if (userData.phone && !this.validatePhone(userData.phone)) {
            throw new Error('Format de téléphone invalide');
        }

        return this.request('/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async logout(): Promise<ApiResponse> {
        const response = await this.request('/logout', {
            method: 'POST',
        });
        
        // Nettoyer le localStorage après déconnexion
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        return response;
    }

    removeToken(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    async user(): Promise<ApiResponse> {
        return this.request('/user');
    }

    async getUser(): Promise<ApiResponse> {
        return this.request('/user');
    }

    async updateProfile(profileData: any): Promise<ApiResponse> {
        // Validation des données de profil
        if (profileData.email && !this.validateEmail(profileData.email)) {
            throw new Error('Format d\'email invalide');
        }
        if (profileData.phone && !this.validatePhone(profileData.phone)) {
            throw new Error('Format de téléphone invalide');
        }

        return this.request('/user/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }

    // Vendor methods
    async getVendors(): Promise<ApiResponse> {
        return this.request('/vendors');
    }

    async getVendor(id: number): Promise<ApiResponse> {
        if (!id || id <= 0) {
            throw new Error('ID de vendeur invalide');
        }
        return this.request(`/vendors/${id}`);
    }

    async getNearbyVendors(latitude: number, longitude: number, radius?: number): Promise<ApiResponse> {
        // Validation des coordonnées
        if (latitude < -90 || latitude > 90) {
            throw new Error('Latitude invalide');
        }
        if (longitude < -180 || longitude > 180) {
            throw new Error('Longitude invalide');
        }

        const params = new URLSearchParams({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
        });
        if (radius) params.append('radius', radius.toString());
        return this.request(`/vendors/nearby?${params.toString()}`);
    }

    async getNearbyVendorsByAddress(address: string, radius?: number): Promise<ApiResponse> {
        if (!address || address.trim().length < 3) {
            throw new Error('Adresse trop courte');
        }

        const params = new URLSearchParams({ address });
        if (radius) params.append('radius', radius.toString());
        return this.request(`/vendors/nearby/address?${params.toString()}`);
    }

    async getVendorDishes(vendorId?: number): Promise<ApiResponse> {
        if (vendorId) {
            return this.request(`/vendors/${vendorId}/dishes`);
        }
        return this.request('/vendor/dishes');
    }

    async getVendorStats(): Promise<ApiResponse> {
        return this.request('/vendor/stats');
    }

    async getVendorAnalytics(period?: string): Promise<ApiResponse> {
        const params = new URLSearchParams();
        if (period) params.append('period', period);
        return this.request(`/vendor/analytics?${params.toString()}`);
    }

    async getVendorOrders(): Promise<ApiResponse> {
        return this.request('/vendor/orders');
    }

    async updateOrderStatus(orderId: number, data: { status: string; notes?: string }): Promise<ApiResponse> {
        if (!orderId || orderId <= 0) {
            throw new Error('ID de commande invalide');
        }

        const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!validStatuses.includes(data.status)) {
            throw new Error('Statut de commande invalide');
        }

        return this.request(`/vendor/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Restaurant profile methods
    async getVendorProfile(): Promise<ApiResponse> {
        return this.request('/vendor/profile');
    }

    async updateVendorProfile(profileData: {
        name?: string;
        description?: string;
        phone?: string;
        address?: string;
        city?: string;
        postal_code?: string;
        opening_time?: string;
        closing_time?: string;
        is_open?: boolean;
        delivery_fee?: number;
        delivery_time?: number;
        minimum_order?: number;
        logo?: string;
        cover_image?: string;
    }): Promise<ApiResponse> {
        // Validation des données
        if (profileData.phone && !this.validatePhone(profileData.phone)) {
            throw new Error('Format de téléphone invalide');
        }
        if (profileData.delivery_fee !== undefined && profileData.delivery_fee < 0) {
            throw new Error('Les frais de livraison ne peuvent pas être négatifs');
        }
        if (profileData.delivery_time !== undefined && profileData.delivery_time < 1) {
            throw new Error('Le temps de livraison doit être d\'au moins 1 minute');
        }
        if (profileData.minimum_order !== undefined && profileData.minimum_order < 0) {
            throw new Error('Le montant minimum de commande ne peut pas être négatif');
        }

        // Validation des images
        if (profileData.logo && profileData.logo.length > 5000000) { // 5MB max
            throw new Error('L\'image du logo est trop volumineuse (max 5MB)');
        }
        if (profileData.cover_image && profileData.cover_image.length > 10000000) { // 10MB max
            throw new Error('L\'image de couverture est trop volumineuse (max 10MB)');
        }
        
        return this.request('/vendor/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }

    async uploadRestaurantImage(imageFile: File, profileData: any): Promise<ApiResponse> {
        // Validation du fichier
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (imageFile.size > maxSize) {
            throw new Error('Fichier trop volumineux (max 5MB)');
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(imageFile.type)) {
            throw new Error('Type de fichier non supporté. Utilisez JPEG, PNG ou GIF');
        }

        // Convertir l'image en base64
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const base64Image = reader.result as string;
                    const dataWithImage = {
                        ...profileData,
                        logo: base64Image
                    };
                    
                    const response = await this.request('/vendor/profile', {
                        method: 'PUT',
                        body: JSON.stringify(dataWithImage),
                    });
                    resolve(response);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
            reader.readAsDataURL(imageFile);
        });
    }

    async getVendorDishesList(): Promise<ApiResponse> {
        return this.request('/vendor/dishes');
    }

    async addDish(dishData: any): Promise<ApiResponse> {
        // Validation des données de plat
        if (!dishData.name || dishData.name.trim().length < 2) {
            throw new Error('Le nom du plat doit contenir au moins 2 caractères');
        }
        if (!dishData.price || dishData.price <= 0) {
            throw new Error('Le prix doit être supérieur à 0');
        }
        if (!dishData.category_id) {
            throw new Error('La catégorie est requise');
        }

        return this.request('/vendor/dishes', {
            method: 'POST',
            body: JSON.stringify(dishData),
        });
    }

    async createVendorDish(dishData: any): Promise<ApiResponse> {
        return this.addDish(dishData);
    }

    async updateDish(id: number, dishData: any): Promise<ApiResponse> {
        if (!id || id <= 0) {
            throw new Error('ID de plat invalide');
        }

        return this.request(`/vendor/dishes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(dishData),
        });
    }

    async updateVendorDish(id: number, dishData: any): Promise<ApiResponse> {
        return this.updateDish(id, dishData);
    }

    async deleteDish(id: number): Promise<ApiResponse> {
        if (!id || id <= 0) {
            throw new Error('ID de plat invalide');
        }

        return this.request(`/vendor/dishes/${id}`, {
            method: 'DELETE',
        });
    }

    async deleteVendorDish(id: number): Promise<ApiResponse> {
        return this.deleteDish(id);
    }

    async toggleDishAvailability(id: number, available: boolean): Promise<ApiResponse> {
        if (!id || id <= 0) {
            throw new Error('ID de plat invalide');
        }

        return this.request(`/vendor/dishes/${id}/availability`, {
            method: 'PUT',
            body: JSON.stringify({ available }),
        });
    }

    // Dish methods
    async getDishes(): Promise<ApiResponse> {
        return this.request('/dishes');
    }

    async getFeaturedVendors(): Promise<ApiResponse> {
        return this.request('/vendors/featured');
    }

    async getPopularDishes(): Promise<ApiResponse> {
        return this.request('/dishes/popular');
    }

    async getDish(id: number): Promise<ApiResponse> {
        if (!id || id <= 0) {
            throw new Error('ID de plat invalide');
        }
        return this.request(`/dishes/${id}`);
    }

    // Category methods
    async getCategories(): Promise<ApiResponse> {
        return this.request('/categories');
    }

    // Order methods
    async createOrder(orderData: any): Promise<ApiResponse> {
        // Validation des données de commande
        if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
            throw new Error('La commande doit contenir au moins un article');
        }
        if (!orderData.delivery_address) {
            throw new Error('L\'adresse de livraison est requise');
        }

        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    }

    async getUserOrders(filters?: { status?: string; search?: string }): Promise<ApiResponse> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.search) params.append('search', filters.search);
        return this.request(`/user/orders?${params.toString()}`);
    }

    async getOrder(id: number): Promise<ApiResponse> {
        if (!id || id <= 0) {
            throw new Error('ID de commande invalide');
        }
        return this.request(`/orders/${id}`);
    }

    async getOrderTracking(id: number): Promise<ApiResponse> {
        if (!id || id <= 0) {
            throw new Error('ID de commande invalide');
        }
        return this.request(`/orders/${id}/tracking`);
    }

    async updateOrderStatusWithLocation(orderId: number, data: { 
        status: string; 
        notes?: string; 
        latitude?: number; 
        longitude?: number; 
        location_address?: string; 
        estimated_arrival?: string; 
    }): Promise<ApiResponse> {
        if (!orderId || orderId <= 0) {
            throw new Error('ID de commande invalide');
        }

        return this.request(`/vendor/orders/${orderId}/tracking/status`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async updateDeliveryLocation(orderId: number, data: { 
        latitude: number; 
        longitude: number; 
        location_address?: string; 
    }): Promise<ApiResponse> {
        if (!orderId || orderId <= 0) {
            throw new Error('ID de commande invalide');
        }

        // Validation des coordonnées
        if (data.latitude < -90 || data.latitude > 90) {
            throw new Error('Latitude invalide');
        }
        if (data.longitude < -180 || data.longitude > 180) {
            throw new Error('Longitude invalide');
        }

        return this.request(`/vendor/orders/${orderId}/tracking/location`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async getUserLocations(): Promise<ApiResponse> {
        return this.request('/user/locations');
    }

    async saveUserLocation(locationData: {
        name: string;
        latitude: number;
        longitude: number;
        address: string;
        city: string;
        postal_code?: string;
        instructions?: string;
        is_default?: boolean;
    }): Promise<ApiResponse> {
        // Validation des données
        if (!locationData.name || locationData.name.trim().length < 2) {
            throw new Error('Le nom du lieu doit contenir au moins 2 caractères');
        }
        if (locationData.latitude < -90 || locationData.latitude > 90) {
            throw new Error('Latitude invalide');
        }
        if (locationData.longitude < -180 || locationData.longitude > 180) {
            throw new Error('Longitude invalide');
        }
        if (!locationData.address || locationData.address.trim().length < 5) {
            throw new Error('L\'adresse doit contenir au moins 5 caractères');
        }

        return this.request('/user/locations', {
            method: 'POST',
            body: JSON.stringify(locationData),
        });
    }

    // Review methods
    async createReview(reviewData: any): Promise<ApiResponse> {
        // Validation des données de review
        if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
            throw new Error('La note doit être entre 1 et 5');
        }
        if (!reviewData.comment || reviewData.comment.trim().length < 10) {
            throw new Error('Le commentaire doit contenir au moins 10 caractères');
        }

        return this.request('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData),
        });
    }

    async getDishReviews(dishId: number): Promise<ApiResponse> {
        if (!dishId || dishId <= 0) {
            throw new Error('ID de plat invalide');
        }
        return this.request(`/dishes/${dishId}/reviews`);
    }

    // Admin methods
    async getAdminDashboard(): Promise<ApiResponse> {
        return this.request('/admin/dashboard');
    }

    async getAdminStatistics(): Promise<ApiResponse> {
        return this.request('/admin/statistics');
    }

    async getAdminUsers(type?: string, status?: string): Promise<ApiResponse> {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (status) params.append('status', status);
        return this.request(`/admin/users?${params.toString()}`);
    }

    async createUser(userData: {
        name: string;
        email: string;
        password: string;
        account_type: 'client' | 'vendor' | 'admin';
        status: 'active' | 'pending' | 'suspended' | 'banned';
    }): Promise<ApiResponse> {
        // Validation
        if (!this.validateEmail(userData.email)) {
            throw new Error('Format d\'email invalide');
        }
        if (!this.validatePassword(userData.password)) {
            throw new Error('Le mot de passe doit contenir au moins 8 caractères');
        }

        return this.request('/admin/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async updateUser(id: number, userData: {
        name?: string;
        email?: string;
        account_type?: 'client' | 'vendor' | 'admin';
        status?: 'active' | 'pending' | 'suspended' | 'banned';
    }): Promise<ApiResponse> {
        if (!id || id <= 0) {
            throw new Error('ID d\'utilisateur invalide');
        }

        if (userData.email && !this.validateEmail(userData.email)) {
            throw new Error('Format d\'email invalide');
        }

        return this.request(`/admin/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    }

    async deleteUser(id: number): Promise<ApiResponse> {
        if (!id || id <= 0) {
            throw new Error('ID d\'utilisateur invalide');
        }

        return this.request(`/admin/users/${id}`, {
            method: 'DELETE',
        });
    }

    async getAdminClients(): Promise<ApiResponse> {
        return this.request('/admin/clients');
    }

    async updateClientStatus(id: number, status: string): Promise<ApiResponse> {
        if (!id || id <= 0) {
            throw new Error('ID de client invalide');
        }

        const validStatuses = ['active', 'pending', 'suspended', 'banned'];
        if (!validStatuses.includes(status)) {
            throw new Error('Statut invalide');
        }

        return this.request(`/admin/clients/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }

    async getAdminVendorApplications(): Promise<ApiResponse> {
        return this.request('/admin/vendor-applications');
    }

    async approveVendorApplication(id: number, notes?: string | null): Promise<ApiResponse> {
        if (!id || id <= 0) {
            throw new Error('ID de candidature invalide');
        }

        return this.request(`/admin/vendor-applications/${id}/approve`, {
            method: 'PUT',
            body: JSON.stringify({ notes: notes || null }),
        });
    }

    async rejectVendorApplication(id: number, notes?: string | null): Promise<ApiResponse> {
        if (!id || id <= 0) {
            throw new Error('ID de candidature invalide');
        }

        return this.request(`/admin/vendor-applications/${id}/reject`, {
            method: 'PUT',
            body: JSON.stringify({ notes: notes || null }),
        });
    }

    async reviewVendorApplication(id: number, notes?: string | null): Promise<ApiResponse> {
        if (!id || id <= 0) {
            throw new Error('ID de candidature invalide');
        }

        return this.request(`/admin/vendor-applications/${id}/review`, {
            method: 'PUT',
            body: JSON.stringify({ notes: notes || null }),
        });
    }

    async getAdminDishApplications(): Promise<ApiResponse> {
        return this.request('/admin/dish-applications');
    }

    async approveDishApplication(id: number, notes?: string | null): Promise<ApiResponse> {
        if (!id || id <= 0) {
            throw new Error('ID de candidature invalide');
        }

        return this.request(`/admin/dish-applications/${id}/approve`, {
            method: 'PUT',
            body: JSON.stringify({ notes: notes || null }),
        });
    }

    async rejectDishApplication(id: number, notes?: string | null): Promise<ApiResponse> {
        if (!id || id <= 0) {
            throw new Error('ID de candidature invalide');
        }

        return this.request(`/admin/dish-applications/${id}/reject`, {
            method: 'PUT',
            body: JSON.stringify({ notes: notes || null }),
        });
    }

    async getAdminReviewApplications(): Promise<ApiResponse> {
        return this.request('/admin/review-applications');
    }

    async approveReviewApplication(id: number, notes?: string | null): Promise<ApiResponse> {
        if (!id || id <= 0) {
            throw new Error('ID de candidature invalide');
        }

        return this.request(`/admin/review-applications/${id}/approve`, {
            method: 'PUT',
            body: JSON.stringify({ notes: notes || null }),
        });
    }

    async rejectReviewApplication(id: number, notes?: string | null): Promise<ApiResponse> {
        if (!id || id <= 0) {
            throw new Error('ID de candidature invalide');
        }

        return this.request(`/admin/review-applications/${id}/reject`, {
            method: 'PUT',
            body: JSON.stringify({ notes: notes || null }),
        });
    }

    async getAdminOrders(): Promise<ApiResponse> {
        return this.request('/admin/orders');
    }

    async getAdminCategories(): Promise<ApiResponse> {
        return this.request('/admin/categories');
    }

    async createCategory(categoryData: any): Promise<ApiResponse> {
        if (!categoryData.name || categoryData.name.trim().length < 2) {
            throw new Error('Le nom de la catégorie doit contenir au moins 2 caractères');
        }

        return this.request('/admin/categories', {
            method: 'POST',
            body: JSON.stringify(categoryData),
        });
    }

    async updateCategory(id: number, categoryData: any): Promise<ApiResponse> {
        if (!id || id <= 0) {
            throw new Error('ID de catégorie invalide');
        }

        return this.request(`/admin/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(categoryData),
        });
    }

    async deleteCategory(id: number): Promise<ApiResponse> {
        if (!id || id <= 0) {
            throw new Error('ID de catégorie invalide');
        }

        return this.request(`/admin/categories/${id}`, {
            method: 'DELETE',
        });
    }
}

const apiService = new ApiService();
export default apiService;