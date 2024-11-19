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

export async function getGeneratedQr(token) {
  await servicesWait();
  return axios
    .get(`${services.controller.url}/qr/generator`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    .then(function (response) {
      return response.data.qr;
    })
    .catch(function (error) {
      throw error;
    });
}