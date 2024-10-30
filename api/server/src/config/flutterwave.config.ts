import axios from 'axios';

// Create an instance of axios for the Flutterwave API
const flw = axios.create({
  baseURL: 'https://api.flutterwave.com/v3', // Base URL for the API
  headers: {
    'Content-Type': 'application/json', // Default content-type header
  },
});

// Add a request interceptor
flw.interceptors.request.use(
  (config) => {
    // Append the Authorization header with the Bearer token
    config.headers.Authorization = `Bearer ${process.env.FLW_SECRET_KEY}`;
    
    return config;
  },
  (error) => {
    // Handle any error during request setup
    return Promise.reject(error);
  }
);

export default flw