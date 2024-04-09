import axios from "axios";

export async function get(url: string) {
    try {
        return await axios.get(url);
    } catch (error) {
        console.error(error);
    }
}

export async function post(url: string, jsonString: string) {
    if (jsonString !== "") {
        console.log(jsonString);
        const json: JSON = JSON.parse(jsonString);
        try {
            console.log(url, json);
            const response = await axios.post(url, json);
            console.log(response);
            return response;
        } catch (error) {
            console.error(error);
        }
    } else {
        try {
            console.log(url);
            const response = await axios.post(url);
            console.log(response);
            return response;
        } catch (error) {
            console.error(error);
        }
    }
}