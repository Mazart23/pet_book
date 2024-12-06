import axios from "axios";
import { services, servicesWait } from "./utils/loadServices";

/*
API async functions below
*/

export async function postLogin(username, password) {
  await servicesWait();
  return axios
    .post(`${services.controller.url}/user/login`, {
      username: username,
      password: password
    })
    .then(function (response) {
      return response.data.access_token;
    })
    .catch(function (error) {
      throw error;
    });
}

export async function fetchProfilePicture(userId) {
  await servicesWait();
  
  return axios
    .get(`${services.controller.url}/user/user-picture`, {
      params: { user_id: userId }, 
    })
    .then((response) => response.data.profile_picture_url)
    .catch((error) => {
      throw error;
    });
}

export async function uploadProfilePicture(token, selectedFile) {
  await servicesWait();

  const formData = new FormData();
  formData.append("picture", selectedFile);

  return axios
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

  return axios
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
export async function fetchPosts({ userId = null, page = 1, limit = 10 } = {}) {
  await servicesWait();

  const params = {
    page,
    limit,
    ...(userId && { user_id: userId }), 
  };

  return axios
    .get(`${services.controller.url}/post/posts`, { params })
    .then((response) => response.data.posts)
    .catch((error) => {
      throw error;
    });
}


export async function addPost(token, description, images, location = "") {
  const formData = new FormData();
  formData.append("description", description);
  if (location) formData.append("location", location);

  images.forEach((image, index) => {
    formData.append("images", image); 
  });

  return axios
    .post(`${services.controller.url}/post/posts`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => response.data.post)
    .catch((error) => {
      throw error;
    });
}

export const deletePost = async (token, postId) => {
  if (!postId) {
    console.error("No postId provided to deletePost");
    throw new Error("Post ID is required");
  }
  try {
    const response = await fetch(`${services.controller.url}/post/posts`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ _id: postId }), 
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete post.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in deletePost:", error);
    throw error;
  }
};

