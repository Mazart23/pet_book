import apiClient from "@/utils/apiClient";
import { services, servicesWait } from "@/utils/loadServices";

/*
API async functions below
*/

export async function postLogin(username, password) {
  await servicesWait();
  return apiClient
    .post(`${services.controller.url}/user/login`, {
      username: username,
      password: password
    })
    .then((response) => {
      return response.data.access_token;
    })
    .catch((error) => {
      throw error;
    });
}

export async function fetchProfilePicture(userId) {
  await servicesWait();
  return apiClient
    .get(`${services.controller.url}/user/user-picture`, {
      params: { user_id: userId }, 
    })
    .then((response) => response.data.profile_picture_url)
    .catch((error) => {
      throw error;
    });
}

export async function fetchUserSelfData(token) {
  await servicesWait();
  return apiClient
    .get(`${services.controller.url}/user/self`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    .then((response) => response.data)
    .catch((error) => {
      throw error;
    });
}

export async function uploadProfilePicture(token, selectedFile) {
  await servicesWait();

  const formData = new FormData();
  formData.append("picture", selectedFile);

  return apiClient
    .put(`${services.controller.url}/user/user-picture`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => response.data.profile_picture_url)
    .catch((error) => {
      throw error;
    });
}

export async function deleteProfilePicture(token) {
  await servicesWait();
  return apiClient
    .delete(`${services.controller.url}/user/user-picture`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(() => {})
    .catch((error) => {
      throw error;
    });
}

export async function getNotifications(token, lastTimestamp=null) {
  await servicesWait();
  return apiClient
    .get(`${services.controller.url}/notification/`, {
      params: {
        quantity: 3,
        last_timestamp: lastTimestamp
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log(response);
      if (response.status === 200) {
        return response.data;
      } else return null;
    })
    .catch((error) => {
      console.log(error);
      throw error;
    });
}

export async function deleteNotification(token, notification_type, notification_id) {
  await servicesWait();
  return apiClient
    .delete(`${services.controller.url}/notification/`, {
      data: {
        notification_id: notification_id,
        notification_type: notification_type
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch((error) => {
      console.log(error);
      throw error;
    });
}

export async function fetchReactions(token, post_id, lastTimestamp=null) {
  await servicesWait();
  return apiClient
    .get(`${services.controller.url}/reaction/many`, {
      params: {
        post_id: post_id,
        quantity: 20,
        last_timestamp: lastTimestamp
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log(response);
      if (response.status === 200) {
        return response.data;
      } else return null;
    })
    .catch((error) => {
      console.log(error);
      throw error;
    });
}

export async function fetchReaction(token, post_id) {
  await servicesWait();
  return apiClient
    .get(`${services.controller.url}/reaction/`, {
      params: {
        post_id: post_id
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log(response);
      if (response.status === 200) {
        return response.data;
      } else return null;
    })
    .catch((error) => {
      console.log(error);
      throw error;
    });
}

export async function deleteReaction(token, post_id) {
  await servicesWait();
  return apiClient
    .delete(`${services.controller.url}/reaction/`, {
      data: {
        post_id: post_id
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch((error) => {
      console.log(error);
      throw error;
    });
}

export async function putReaction(token, reaction_type, post_id) {
  await servicesWait();
  const data = {
    post_id: post_id,
    reaction_type: reaction_type
  }

  return apiClient
    .put(`${services.controller.url}/reaction/`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    .catch((error) => {
      console.log(error);
      throw error;
    });
}

export async function fetchPosts(user_id = null, page = 1, limit = 10) {
  await servicesWait();

  const params = {
    page,
    limit,
    ...(user_id && { user_id: user_id }),
  };

  return apiClient
    .get(`${services.controller.url}/post`, { params })
    .then((response) => response.data.posts)
    .catch((error) => {
      throw error;
    });
}


export async function fetchUserByUsername(username) {
  await servicesWait();
  return apiClient
    .get(`${services.controller.url}/user`, {
      params: { username }, 
    })
    .then((response) => response.data)
    .catch((error) => {
      throw error;
    });
}