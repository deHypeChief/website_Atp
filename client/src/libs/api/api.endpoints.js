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

    // The API already returns these newest-first.
    if (Array.isArray(notifications)) {
      return { notifications, unreadCount: response.data.unreadCount || 0 };
    } else {
      console.warn("No notifications found or data format incorrect.");
      return { notifications: [], unreadCount: 0 };
    }
  } catch (error) {
    console.error("Error fetching notify:", error);
    return { notifications: [], unreadCount: 0 };
  }
};

export const markNotifyRead = async (id) => (await api.post(`/notifications/${id}/read`)).data;

export const markAllNotifyRead = async () => (await api.post("/notifications/read-all")).data;

export const getTourPayLink = async (tornamentId) => {
  try {
    const response = await api.get(`/tour/register/${tornamentId}`);
    console.log(response.data);
    return response.data.paystackResponse.data.authorization_url;
  } catch (error) {
    console.error("Error fetching payment link:", error);
    throw new Error(error.response?.data?.message || "Unable to start tournament payment. Please try again.");
  }
};

export const validateMatch = async (id, matchQuery) => {
  try {
    const response = await api.get(`/match/${id}/matchCallback${matchQuery}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching validating tour payment:", error);
    throw new Error(error.response.data.message);
  }
};

/**
 * Every membership plan an admin manages under Training Packages.
 *
 * The whole list is returned: the membership page groups it by `audience` and keeps the
 * special plans visible from every page, so filtering here would hide them. Each package
 * becomes one plan card, with its durations as the billing options.
 */
export const getPlans = async () => {
  try {
    const response = await api.get("/billing/packages");
    const packages = Array.isArray(response.data?.packages) ? response.data.packages : [];
    return packages.map((item) => {
      const tiers = Array.isArray(item.plans) ? item.plans : [];
      const isSpecial = item.category === "special";
      return {
        _id: item.slug,
        slug: item.slug,
        audience: item.audience,
        isSpecial,
        planName: item.name,
        planImage: item.image,
        priceInfo: item.priceInfo,
        // Short enough for the card's eyebrow; `priceInfo` is a paragraph, not a label.
        planLabel: isSpecial ? "Special plan" : "Training plan",
        description: item.info,
        // Shortest duration is the headline price; longer ones are the commitment options.
        planPrice: tiers[0]?.price || 0,
        filterPrams: item.coachLevels || [],
        billingPlans: tiers.map((tier) => ({
          _id: `${item.slug}-${tier.months}`,
          interval: tier.months,
          // A package's discount is what a member saves by committing beyond one month.
          discountPercentage: tier.months > 1 ? item.discount || 0 : 0,
          billingPrice: tier.price,
          dollarPrice: tier.dollarPrice,
        })),
      };
    });
  } catch (error) {
    console.error("Error fetching plans", error);
    return [];
  }
};

export const getCoaches = async () => {
  try {
    const response = await api.get(`/coach/getCoaches/all`);
    console.log(response.data.coaches);
    return response.data.coaches;
  } catch (error) {
    console.error("Error fetching plans", error);
    throw new Error(error.response.data.message);
  }
};

export const getCoach = async (id) => {
  try {
    const response = await api.get(`/coach/getCoach/${id}`);
    console.log(response.data.coach);
    return response.data.coach;
  } catch (error) {
    console.error("Error fetching coach data", error);
    throw new Error(error.response.data.message);
  }
};

export const getMembershPayLink = async (query) => {
  try {
    const response = await api.get(`/plan/user/pay${query}`);
    console.log(response.data.flwResponse.data.link);
    return response.data.flwResponse.data.link;
  } catch (error) {
    console.error("Error fetching pay link", error);
  }
};

export const validateBilling = async (billingQuery) => {
  try {
    const response = await api.get(`/billing/pay/callback${billingQuery}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching validating billing payment:", error);
    throw new Error(error.response.data.message);
  }
};

export const getMe = async () => {
  try {
    const response = await api.get(`/me`);
    // console.log(response.data.userData);
    return response.data.userData;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error(error.response.data.message);
  }
};

export const postComment = async (data) => {
  try {
    const response = await api.post(`/coach/user/comment`, data);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error posting comment:", error);
    throw new Error(error.response.data.message);
  }
};

export const uploadProfile = async (data) => {
  try {
    const response = await api.post(`/uploadProfile`, {
      profileImage: data
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw new Error(error.response.data.message);
  }
};

export const getPayMe = async () => {
  try {
    const response = await api.get(`/billing/pay/me`);
    return response.data;
  } catch (error) {
    console.error("Error fetching billing info:", error);
    throw new Error(error.response.data.message);
  }
}

export const getBillingPage = async () => {
  const response = await api.get('/billing/pay/page');
  return { user: response.data.user, billing: response.data.billing, config: response.data.config };
};

// /pay/registration
export const payRegistration = async () => {
  try {
    const response = await api.post(`/billing/pay/registration`);
    return response.data;
  } catch (error) {
    console.error("Error fetching billing info:", error);
    throw new Error(error.response.data.message);
  }
}

export const setAutoRenew = async (autoRenew) => {
  try {
    const response = await api.post(`/billing/pay/set/autoRenew`, {
      autoRenew
    });
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Error setting auto renew:", error);
    throw new Error(error.response.data.message);
  }
}

export const payDues = async (type, autoRenew) => {
  try {
    const response = await api.post(`/billing/pay/membership/${type}/${autoRenew}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching billing info:", error);
    throw new Error(error.response?.data?.message || "Unable to start membership payment. Please try again.");
  }
}

export const payTraining = async (type, duration) => {
  try {
    const response = await api.post(`/billing/pay/training/${type}/${duration}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching billing info:", error);
    throw new Error(error.response?.data?.message || "Unable to start training payment. Please try again.");
  }
}


export const billingInfo = async () => {
  try {
    const response = await api.get(`/billing/pay/info`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching billing info:", error);
    throw new Error(error.response.data.message);
  }
}


export const getUserCoachData = async () => {
  try {
    const response = await api.get(`/assigncoach/getUserCoach`);
    // console.log(response)
    return { ...response.data, data: response.data };
  } catch (error) {
    console.error("Error fetching user coach info:", error);
    throw new Error(error.response.data.message);
  }
}

export const getUserTrans = async () => {
  try {
    const response = await api.get(`/transaction/all`);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Error fetching user coach info:", error);
    throw new Error(error.response.data.message);
  }
}

export const getUserMatchesC = async () => {
  try {
    const response = await api.get(`/matchCustom/user`);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Error fetching user custom matches info:", error);
    throw new Error(error.response.data.message);
  }
}

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Error sending forgot password request:', error);
    throw new Error(error.response.data.message);
  }
};

export const resetPassword = async (payload) => {
  try {
    const response = await api.post('/reset-password', payload);
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw new Error(error.response.data.message);
  }
};

export const subscribeNewsletter = async (email) => {
    const response = await api.post('/subscribe-newsletter', { email });
    return response.data;
};

export const getNews = async () => {
  const response = await api.get('/news');
  return response.data.articles;
};

export const getNewsArticle = async (slug) => {
  const response = await api.get(`/news/${slug}`);
  return response.data.article;
};

export const getSiteContent = async () => {
  const response = await api.get('/site-content');
  // `copy` is the admin-editable website text, already resolved server-side. It rides along
  // on the content object so existing consumers of `.pages`, `.reviews` etc. keep working.
  return { ...response.data.content, copy: response.data.copy || {} };
};

export const deleteUserAccount = async () => {
  try {
    const response = await api.delete('/delUserData');
    return response.data;
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw new Error(error.response.data.message);
  }
};

export const getStoreProducts = async () => (await api.get('/store/products')).data.products;
export const getStoreProduct = async slug => (await api.get(`/store/products/${slug}`)).data.product;
export const createStoreCheckout = async payload => (await api.post('/store/checkout', payload)).data;
export const getMyStoreOrders = async () => (await api.get('/store/orders/me')).data.orders;
export const verifyStoreOrder = async (id, reference) => (await api.get(`/store/orders/${id}/verify`, { params: { reference } })).data;

export const getEngagementItems = async participantId => (await api.get('/engagement', { params: { participantId: typeof participantId === 'string' ? participantId : undefined } })).data.items || [];
export const createMemberPoll = async payload => (await api.post('/engagement', payload)).data;
export const respondToEngagement = async ({id, optionId, participantId}) => (await api.post(`/engagement/${id}/respond`, {optionId, participantId})).data;
export const getCommunityTopics = async participantId => (await api.get('/community/topics', { params: { participantId: typeof participantId === 'string' ? participantId : undefined } })).data.topics || [];
export const createCommunityPost = async payload => (await api.post('/community/topics', payload)).data;
export const getCommunityTopic = async (id, viewerId) => (await api.get(`/community/topics/${id}`, { params: { viewerId } })).data;
export const likeCommunityTopic = async ({topicId, participantId}) => (await api.post(`/community/topics/${topicId}/like`, {participantId})).data;
export const postCommunityComment = async ({topicId, body, parentId}) => (await api.post(`/community/topics/${topicId}/comments`, {body, parentId})).data;
export const getLiveDraws = async () => (await api.get('/match-centre/live')).data.draws || [];
export const getRankings = async () => (await api.get('/leader/rankings')).data.rankings || [];


export const getFriendlyFixtures = async () => (await api.get('/matchCustom/fixtures')).data.fixtures || [];
