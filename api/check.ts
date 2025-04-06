import api from "./index";

const endpoints = {
    getChecks: async () => {
        return await api("checks");
    },
    createCheck: async (data: object) => {
        return await api("checks", {
            method: "post",
            data,
        });
    },
    updateCheck: async (id: string, data: object) => {
        return await api(`checks/${id}`, {
            method: "put",
            data,
        });
    },
    deleteCheck: async (id: string) => {
        return await api(`checks/${id}`, {
            method: "delete",
        });
    },
}

export default endpoints;