const baseUrls = {
    development: "https://market-link-spew.onrender.com/api/v1/",
    staging: "",
    production: "https://market-link-spew.onrender.com/api/v1/",
    test: "",
};

const baseUrl = baseUrls[process.env.NODE_ENV || "development"];

export default baseUrl;

  const storageBaseUrls = {
    development: "https://market-link-spew.onrender.com/api/v1/",
    staging: "",
    production: "https://market-link-spew.onrender.com/api/v1/",
    test: "",
  };
  
  export const storageBaseUrl = storageBaseUrls[process.env.NODE_ENV || "development"];