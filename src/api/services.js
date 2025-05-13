import client from './client';

// Servicios relacionados con la autenticación
export const authService = {
    login: async (credentials) => {
        const response = await client.post('/auth/login', credentials);
        return response.data;
    },
    register: async (userData) => {
        const response = await client.post('/auth/register', userData);
        return response.data;
    },
    logout: async () => {
        const response = await client.post('/auth/logout');
        return response.data;
    }
};

// Servicios relacionados con el inventario
export const inventoryService = {
    getAll: async () => {
        const response = await client.get('/inventory');
        return response.data;
    },
    getById: async (id) => {
        const response = await client.get(`/inventory/${id}`);
        return response.data;
    },
    create: async (item) => {
        const response = await client.post('/inventory', item);
        return response.data;
    },
    update: async (id, item) => {
        const response = await client.put(`/inventory/${id}`, item);
        return response.data;
    },
    delete: async (id) => {
        const response = await client.delete(`/inventory/${id}`);
        return response.data;
    }
};

// Servicios relacionados con el calendario
export const calendarService = {
    getEvents: async () => {
        const response = await client.get('/calendar/events');
        return response.data;
    },
    createEvent: async (event) => {
        const response = await client.post('/calendar/events', event);
        return response.data;
    },
    updateEvent: async (id, event) => {
        const response = await client.put(`/calendar/events/${id}`, event);
        return response.data;
    },
    deleteEvent: async (id) => {
        const response = await client.delete(`/calendar/events/${id}`);
        return response.data;
    }
};

// Servicios relacionados con técnicos
export const technicianService = {
    getAll: async () => {
        const response = await client.get('/technicians');
        return response.data;
    },
    create: async (technician) => {
        const response = await client.post('/technicians', technician);
        return response.data;
    },
    update: async (id, technician) => {
        const response = await client.put(`/technicians/${id}`, technician);
        return response.data;
    },
    delete: async (id) => {
        const response = await client.delete(`/technicians/${id}`);
        return response.data;
    }
}; 