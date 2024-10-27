import axios from 'axios';


export function getServerStatus() {
  return axios
    .get(`http://localhost:5001/get`)
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      throw error;
    });
}