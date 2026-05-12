import axios from "axios"
// axios is used connect to the backend server and make API calls to the authentication endpoints. The baseURL is set to http://localhost:3000, which is where the backend server is running. The withCredentials option is set to true to allow sending cookies with the requests, which is necessary for maintaining user sessions.

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
})
// withCredentials: true is used to allow sending cookies with the requests, which is necessary for maintaining user sessions.

export async function register({ username, email, password }) {

    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })

        return response.data

    } catch (err) {

        console.log(err)
    }

}

export async function login({ email, password }) {

    try {

        const response = await api.post("/api/auth/login", {
            email, password
        })

        return response.data

    } catch (err) {
        console.log(err)
    }

}

export async function logout() {
    try {

        const response = await api.get("/api/auth/logout")

        return response.data

    } catch (err) {
        console.log(err)
    }
}

export async function getMe() {

    try {

        const response = await api.get("/api/auth/get-me")

        return response.data

    } catch (err) {
        console.log(err)
    }

}

