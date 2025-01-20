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

export async function postSignup(username: string, email: string, password: string, phone?: string) {
  await servicesWait();
  return apiClient
    .post(`${services.controller.url}/user/signup`, {
      username,
      email,
      password,
      phone
    })
    .then((response) => {
      return response.data.message;
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

export async function fetchPosts(user_id = null, last_timestamp = null, limit = 10) {
  await servicesWait();

  const params = {
    limit,
    ...(user_id && { user_id }),
    ...(last_timestamp && { last_timestamp }),
  };

  try {
    const response = await apiClient.get(`${services.controller.url}/post`, { params });
    return response.data.posts;
  } catch (error) {
    console.error("Error fetching posts:", error.response?.data || error.message);
    throw error;
  }
}

export async function getPost(token, postId) {
  await servicesWait();

  return apiClient
    .get(`${services.controller.url}/post/single`, { 
      params: { 
        id: postId 
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      throw error;
    });
}

export async function getComments(token, post_id = null, last_timestamp = null, limit = 5) {
  await servicesWait();
  return apiClient
    .get(`${services.controller.url}/comment/`, { 
      params: {
        post_id: post_id,
        limit: limit,
        last_timestamp: last_timestamp,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      }, 
    })
    .then((response) => {
      return response.data.comments;
    })
    .catch((error) => {
      console.error("Error fetching comments:", error.response?.data || error.message);
      throw error;
    });
}


export async function deleteComment(token, id) {
  await servicesWait();
  return apiClient
    .delete(`${services.controller.url}/comment/`, {
      data: {
        comment_id: id
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

export async function putComment(token, content, post_id) {
  await servicesWait();
  const data = {
    post_id: post_id,
    content: content
  }

  return apiClient
    .put(`${services.controller.url}/comment/`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    .then((response) => response.data)
    .catch((error) => {
      console.log(error);
      throw error;
    });
}

export async function updateUserInfo(token, updatedData) {
  await servicesWait();
  return apiClient
      .put(`${services.controller.url}/user/self`, updatedData, {
          headers: {
              Authorization: `Bearer ${token}`, 
          },
      })
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

export async function createPost(token, formData: FormData) {
  await servicesWait();

  return apiClient
    .put(`${services.controller.url}/post/`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error creating post:", error.response?.data || error.message);
      throw error;
    });
}

export async function getGeneratedQr(token?: string) {
  await servicesWait();
  return apiClient
    .get(`${services.controller.url}/qr/generator`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    .then((response) => response.data.qr)
    .catch((error) => {
      console.error("Error fetching QR code:", error.response?.data || error.message);
      throw error;
    });
}


/**
 * Wysyła dane zeskanowanego QR code do backendu
 */
export async function scanQr(token: string, scanData: Record<string, any>) {
  await servicesWait();
  return apiClient
    .post(`${services.controller.url}/qr/scan`, scanData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error scanning QR code:", error.response?.data || error.message);
      throw error;
    });
}

