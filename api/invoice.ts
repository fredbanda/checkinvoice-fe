import api from "./index";

const endpoints = {
    getInvoices: async () => {
        return await api("invoices");
    },
    createInvoice: async (data: object) => {
        return await api("invoices", {
            method: "post",
            data,
        });
    },
    updateInvoice: async (id: string, data: object) => {
        return await api(`invoices/${id}`, {
            method: "put",
            data,
        });
    },
    deleteInvoice: async (id: string) => {
        return await api(`invoices/${id}`, {
            method: "delete",
        });
    },
}

export default endpoints;