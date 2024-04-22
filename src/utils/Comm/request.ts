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
        const json: JSON = JSON.parse(jsonString);
        try {
            return await axios.post(url, json);
        } catch (error) {
            console.error(error);
        }
    } else {
        try {
            return await axios.post(url);
        } catch (error) {
            console.error(error);
        }
    }
}