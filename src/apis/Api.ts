import { useNavigate } from "react-router-dom";
const axios = require("axios");
// const baseURL = process.env.REACT_APP_API_BASE_URL;
const baseURL = "https://prod.04two.com/v1/admin/";
// const baseURL = "http://127.0.0.1:9000/v1/admin/";
export const Api = () => {
    // @ts-ignore
    let token = JSON.parse(localStorage.getItem("Token"));
    if (token) {
        token = token.split('"').join('');
        token = `${token}`;
    }
    return axios.create({
        baseURL,
        headers: { 'X-Access-Token': token }  // Quote the header name
    });
}
export const apiUrl = baseURL;
