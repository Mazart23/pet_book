import axios from "axios";
import { services, servicesWait } from "../utils/loadServices";

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
    .then((response) => {
      return response.data.access_token;
    })
    .catch((error) => {
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

export async function getNotifications(token, lastTimestamp=null) {
  await servicesWait();
  return axios
    .get(`${services.controller.url}/notification/`, {
      params: {
        quantity: 10,
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