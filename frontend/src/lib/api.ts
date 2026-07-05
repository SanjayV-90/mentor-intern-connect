import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        const res = await axios.post('/api/v1/auth/refresh-token', { refreshToken });
        if (res.data?.data?.accessToken) {
          localStorage.setItem('accessToken', res.data.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export async function openSecureFile(url: string, filename = 'document.pdf', download = false) {
  try {
    const targetUrl = url.startsWith('/api/v1') ? url.substring('/api/v1'.length) : url;
    const res = await api.get(targetUrl, {
      responseType: 'blob',
    });
    const contentType = (res.headers['content-type'] as string) || 'application/pdf';
    const blob = new Blob([res.data], { type: contentType });
    const objectUrl = window.URL.createObjectURL(blob);
    if (download) {
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(objectUrl, '_blank');
    }
    setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60000);
  } catch (err) {
    console.error('Failed to open secure file:', err);
    alert('Failed to retrieve file. You may not have permission or the session has expired.');
  }
}

export default api;
