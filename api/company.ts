import { create } from "domain";
import api from "./index";

const endpoints = {
    getCompanies: async () => {
        return await api("companies");
    },
    createCompany: async (data: object) => {
        return await api("companies", {
            method: "post",
            data,
        });
    },
    updateCompany: async (id: string, data: object) => {
        return await api(`companies/${id}`, {
            method: "put",
            data,
        });
    },
    deleteCompany: async (id: string) => {
        return await api(`companies/${id}`, {
            method: "delete",
        });
    },
}

export default endpoints;