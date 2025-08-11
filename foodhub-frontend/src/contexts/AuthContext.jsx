import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Vérifier si l'utilisateur est connecté au chargement
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await apiService.getUser();
                setUser(response.data.user);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            apiService.removeToken();
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await apiService.login(credentials);
            // Stocker le token dans le localStorage
            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            setUser(response.data.user);
            setIsAuthenticated(true);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await apiService.register(userData);
            // Stocker le token dans le localStorage
            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            setUser(response.data.user);
            setIsAuthenticated(true);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await apiService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            apiService.removeToken();
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await apiService.updateProfile(profileData);
            setUser(response.data.user);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 