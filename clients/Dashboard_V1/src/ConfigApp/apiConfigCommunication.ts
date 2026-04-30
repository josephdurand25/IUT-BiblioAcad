import axios, { AxiosError } from 'axios';
import { getDataToMemorized, removeDataToMemorized } from '../Utils/LocalDataManager';
import { jwtDecode } from 'jwt-decode';

    const api = axios.create({
        baseURL: 'http://sigif-cm.com',
    });

    api.interceptors.request.use(config => {
        const storedData = getDataToMemorized('authData');
        if (storedData) {
            try {
                const { access_token} = JSON.parse(storedData);
                
                // Toujours ajouter le token, même s'il est expiré, pour permettre le refresh
                if (config.url?.includes('/refreshToken')) {
                    config.headers.Authorization = `Bearer ${access_token}`;
                } else {
                    const decoded: any = jwtDecode(access_token);
                    if (decoded.exp > Date.now() / 1000) {
                    config.headers.Authorization = `Bearer ${access_token}`;
                    }
                }
            } catch (e) {
                console.error("Erreur:  le token n'est pas présent, logging out...", e);
            }
        }
        console.info(`Requête API: ${config.method?.toUpperCase()} ${config.url} ${config.headers.Authorization ? '(avec token)' : '(sans token)'}`);
        return config;
        }, (error) => {
        return Promise.reject(new Error(error));
        });

    api.interceptors.response.use(
        (response) => {
            return response.data;
        },
        (error) => {
            console.log('errror global intercepted: ',error);
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    const status = error.response.status;
                    const data = error.response.data;
                    const message = data?.message ?? 'Erreur serveur';
                    const cause = data?.error ?? 'la cause de l\'erreur n\'est pas précisée';
                    if (status === 422 && data?.errors) {
                        const validationError = new Error(message);
                        (validationError as any).type = 'validation';
                        (validationError as any).status = status;
                        (validationError as any).errors = data.errors; 
                        (validationError as any).data = data;
                        (validationError as any).cause = 'erreur de validation des données envoyés au serveur';
                        console.log('error validationError.errors: ',(validationError as any).message);
                        
                        return Promise.reject(validationError);
                    }
                    
                        const serverError = new Error(message);
                        (serverError as any).type = 'server';
                        (serverError as any).status = status;
                        (serverError as any).data = data;
                        (serverError as any).cause = cause;
                        console.log('error serverError: ',cause);
                        return Promise.reject(serverError);
                    } else if (error.request) {
                        const networkError = new Error('Aucune réponse du serveur');
                        (networkError as any).type = 'network';
                        (networkError as any).error = error;
                        console.log('error networkError: ',networkError);
                        return Promise.reject(networkError);
                } else {
                        const axiosConfigError = new Error(error.message);
                        (axiosConfigError as any).type = 'axios';
                        (axiosConfigError as any).error = error;
                        console.log('error configuration: ',axiosConfigError);
                        return Promise.reject(axiosConfigError);
                    }
            } else {
                const unknownError = new Error(error?.message ?? 'Erreur inconnue');
                (unknownError as any).type = 'unknown';
                (unknownError as any).error = error;
                console.log('unknownError: ',unknownError);
                return Promise.reject(unknownError);
            }
        }
    );


    export default api;