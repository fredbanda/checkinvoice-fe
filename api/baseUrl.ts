const baseUrls = {
    development: "https://market-link-0czv.onrender.com/api/v1/",
    staging: "",
    production: "https://market-link-0czv.onrender.com/api/v1/",
    test: "",
};

const baseUrl = baseUrls[process.env.NODE_ENV || "development"];

export default baseUrl;

  const storageBaseUrls = {
    development: "https://market-link-0czv.onrender.com/api/v1/",
    staging: "",
    production: "https://market-link-0czv.onrender.com/api/v1/",
    test: "",
  };
  
  export const storageBaseUrl = storageBaseUrls[process.env.NODE_ENV || "development"];