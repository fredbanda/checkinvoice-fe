const baseUrls = {
    development: "http://localhost:3000/api/v1/",
    staging: "",
    production: "",
    test: "",
};

const baseUrl = baseUrls[process.env.NODE_ENV || "development"];

export default baseUrl;

  const storageBaseUrls = {
    development: "http://localhost:3000",
    staging: "",
    production: "",
    test: "",
  };
  
  export const storageBaseUrl = storageBaseUrls[process.env.NODE_ENV || "development"];