import api from "./axios.config";

export const login = async (payload) => {
  const response = await api.post("/signUser", payload);
  return response;
};

export const register = async (payload) => {
  const response = await api.post("/createUser", payload);
  return response.data;
};

export const getTour = async () => {
  try {
    const response = await api.get("/tour/admin/getTournaments");
    console.log( response.data.tours.reverse())
    return response.data.tours.reverse(); // Return only the tours array if that is the relevant data
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return []; // Return empty array or handle the error gracefully
  }
};

export const createMatchTicket = async (payload) => {
  try {
    const response = await api.post("/match/matchCallack", payload);
    return response.data;
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return [];
  }
};

export const checkMatch = async (payload) => {
  const response = await api.post("/match/matchCheck", payload);
  return response.data;
};

export const verify = async (payload) => {
  const response = await api.post("/verify", payload);
  return response.data;
};

export const getMatches = async () => {
  try {
    const response = await api.get("/match/getUserMatches");
    return response.data;
  } catch (error) {
    console.error("Error fetching Matches:", error);
    return [];
  }
};

export const getNotify = async () => {
  try {
    const response = await api.get("/notifications");
    const notifications = response.data.notifications;
    
    // Ensure notifications exist and are in an array format
    if (Array.isArray(notifications)) {
      return notifications.slice().reverse();  // Clone and reverse
    } else {
      console.warn("No notifications found or data format incorrect.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching notify:", error);
    return [];
  }
};

export const getTourPayLink = async (tornamentId) => {
  try {
    const response = await api.get(`/tour/register/${tornamentId}`);
    console.log(response.data);
    return response.data.flwResponse.data.link
  } catch (error) {
    console.error("Error fetching payment link:", error);
  }
};


export const validateMatch = async(id, matchQuery)=>{
  try{
    const response = await api.get(`/match/${id}/matchCallback${matchQuery}`);
    console.log(response.data);
    return response.data
  }catch (error) {
    console.error("Error fetching validating tour payment:", error);
    throw new Error(error.response.data.message);
  }
}


export const getPlans = async(type)=>{
  try{
    const response = await api.get(`/plan/getPlans/${type}`);
    console.log(response.data.plans);
    return response.data.plans
  }catch (error) {
    console.error("Error fetching plans", error);
    throw new Error(error.response.data.message);
  }
}


export const getCoaches = async()=>{
  try{
    const response = await api.get(`/coach/getCoaches/all`);
    console.log(response.data.coaches);
    return response.data.coaches
  }catch (error) {
    console.error("Error fetching plans", error);
    throw new Error(error.response.data.message);
  }
}



export const getMembershPayLink = async(query)=>{
  try{
    const response = await api.get(`/plan/user/pay${query}`);
    console.log(response.data.flwResponse.data.link);
    return response.data.flwResponse.data.link
  }catch (error) {
    console.error("Error fetching pay link", error);
  }
} 


export const validateBilling = async(billingQuery)=>{
  try{
    const response = await api.get(`/plan/user${billingQuery}`);
    console.log(response.data);
    return response.data
  }catch (error) {
    console.error("Error fetching validating billing payment:", error);
    throw new Error(error.response.data.message);
  }
}