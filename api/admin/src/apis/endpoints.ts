/* eslint-disable no-useless-catch */
import api from "@/lib/axios";

// Fetch all users
export const getUsers = async () => {
	try {
		const response = await api.get('/admin/getUsers');
		return response.data.users.reverse();
	} catch (error) {
		//console.error("Error fetching users:", error);
		throw error; // Handle or rethrow error
	}
};

// Fetch all tournaments
export const getTours = async () => {
	try {
		const response = await api.get('/tour/admin/getTournaments');
		return response.data.tours.reverse();
	} catch (error) {
		//console.error("Error fetching tournaments:", error);
		throw error;
	}
};

// Fetch all matches (ensure the endpoint is correct)
export async function getMatches() {
	try {
		const response = await api.get('/match/admin/getMatches');
		//console.log(response.data.matches)// Ensure this endpoint is correct
		return response.data.matches.reverse();
	} catch (error) {
		//console.error("Error fetching matches:", error);
		throw error;
	}
}


export async function verifyToken(payload: {
	token: string
}) {
	try {
		const response = await api.get(`/match/admin/tourCheck/${payload.token}`);
		//console.log(response.data)// Ensure this endpoint is correct
		return response.data;
	} catch (error) {
		//console.error("Error fetching matches:", error);
		throw error;
	}
}


export async function getCoaches() {
	try {
		const response = await api.get(`/coach/getCoaches/all`);
		console.log(response.data)
		return response.data.coaches.reverse();
	} catch (error) {
		//console.error("Error getting coach:", error);
		throw error;
	}
}


export async function getPlans() {
	try {
		const response = await api.get(`/plan/getPlans`);
		//console.log(response.data.plans)
		return response.data.plans;
	} catch (error) {
		//console.error("Error getting coach:", error);
		throw error;
	}
}


export async function getLeaders() {
	try {
		const response = await api.get(`/leader/getLeaders`);
		//console.log(response.data.leaders)
		return response.data.leaders.reverse();
	} catch (error) {
		//console.error("Error getting leaders:", error);
		throw error;
	}
}


export async function createLeaders(payload) {
	//console.log(payload)
	try {
		const response = await api.post(`/leader/createLeaders`, payload);
		//console.log(response.data)
		return response.data.leaders;
	} catch (error) {
		//console.error("Error creating leaders:", error);
		throw error;
	}
}


export async function delTour(id) {
	try {
		const response = await api.post(`/tour/admin/delTournament/${id}`);
		//console.log(response.data)
		return response.data.leaders;
	} catch (error) {
		//console.error("Error deleting Tout:", error);
		throw error;
	}
}

export const deleteCoach = async (id) => {
  try {
	
	const response = await api.get(`/coach/removeCoach/${id}`);
	alert("Coach Deleted Successfully") 
	window.location.reload()
	return response.data.coach;
  } catch (error) {
	// console.error("Error deleting coach", error);
	throw new Error(error.response.data.message);
  }
}



export async function getPaidUsers() {
	try {
		const response = await api.get(`/billing/pay/all/users/ontraning`);
		console.log(response.data)
		return response.data;
	} catch (error) {
		//console.error("Error getting coach:", error);
		throw error;
	}
}

export async function getLinkedPlayers() {
	try {
		const response = await api.get(`/assigncoach/listAssignments`);
		console.log(response.data)
		return response.data;
	} catch (error) {
		//console.error("Error getting coach:", error);
		throw error;
	}
}

export async function getSubedPlayers() {
	try {
		const response = await api.get(`/billing/pay/all`);
		console.log(response.data)
		return response.data;
	} catch (error) {
		//console.error("Error getting coach:", error);
		throw error;
	}
}


export async function getMatchCustom() {
	try {
		const response = await api.get(`/matchCustom/all`);
		console.log(response.data)
		return response.data;
	} catch (error) {
		//console.error("Error getting coach:", error);
		throw error;
	}
}

export async function createMatchCustom(payload) {
	console.log(payload)
	try {
		const response = await api.post(`/matchCustom/create`, payload);
		console.log(response.data)
		return response.data;
	} catch (error) {
		console.error("Error creating match custom:", error);
		throw error;
	}
}

export async function getNewsAdmin() {
	const response = await api.get('/news/admin');
	return response.data.articles;
}

export async function createNewsArticle(payload) {
	const response = await api.post('/news/admin', payload);
	return response.data;
}

export async function updateNewsArticle(id, payload) {
	const response = await api.put(`/news/admin/${id}`, payload);
	return response.data;
}

export async function deleteNewsArticle(id) {
	const response = await api.delete(`/news/admin/${id}`);
	return response.data;
}

export async function getSiteContentAdmin() {
	const response = await api.get('/site-content');
	return response.data.content;
}

export async function updateSiteContent(payload) {
	const response = await api.put('/site-content/admin', payload);
	return response.data.content;
}

export async function createSiteReview(payload) {
	const response = await api.post('/site-content/admin/reviews', payload);
	return response.data.content;
}

export async function deleteSiteReview(id) {
	const response = await api.delete(`/site-content/admin/reviews/${id}`);
	return response.data.content;
}

export const getStoreOverview = async () => (await api.get('/store/admin/overview')).data;
export const createStoreProduct = async (payload:any) => (await api.post('/store/admin/products', payload)).data;
export const updateStoreProduct = async ({id,payload}:{id:string,payload:any}) => (await api.put(`/store/admin/products/${id}`, payload)).data;
export const archiveStoreProduct = async (id:string) => (await api.delete(`/store/admin/products/${id}`)).data;
export const updateStoreOrderStatus = async ({id,status}:{id:string,status:string}) => (await api.put(`/store/admin/orders/${id}/status`, {status})).data;

export const getEngagementAdmin = async () => (await api.get('/engagement/admin')).data.items;
export const createEngagement = async (payload:any) => (await api.post('/engagement/admin', payload)).data;
export const updateEngagement = async ({id,payload}:{id:string,payload:any}) => (await api.put(`/engagement/admin/${id}`, payload)).data;
export const deleteEngagement = async (id:string) => (await api.delete(`/engagement/admin/${id}`)).data;
export const getCommunityTopicsAdmin = async () => (await api.get('/community/admin/topics')).data.topics;
export const createCommunityTopic = async (payload:any) => (await api.post('/community/admin/topics', payload)).data;
export const updateCommunityTopic = async ({id,payload}:{id:string,payload:any}) => (await api.put(`/community/admin/topics/${id}`, payload)).data;
export const deleteCommunityTopic = async (id:string) => (await api.delete(`/community/admin/topics/${id}`)).data;
export const getCommunityCommentsAdmin = async () => (await api.get('/community/admin/comments')).data.comments;
export const moderateCommunityComment = async ({id,status}:{id:string,status:string}) => (await api.put(`/community/admin/comments/${id}/status`, {status})).data;
