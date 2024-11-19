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