import axios from "axios";


export function postLogin(username, password) {
  return axios
    .post(`http://localhost:5001/user/login`, {
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