const baseUrls = {
    development: "http://localhost:3000/api/v1/",
    staging: "",
    production: "https://market-link-spew.onrender.com/api/v1/checks",
    test: "",
};

const baseUrl = baseUrls[process.env.NODE_ENV || "development"];

export default baseUrl;

  const storageBaseUrls = {
    development: "http://localhost:3000/api/v1/",
    staging: "",
    production: "https://market-link-spew.onrender.com/api/v1/checks",
    test: "",
  };
  
  export const storageBaseUrl = storageBaseUrls[process.env.NODE_ENV || "development"];