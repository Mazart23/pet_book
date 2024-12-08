import React, { createContext, useContext, useState, useEffect } from "react";
import { setServices, getConfig } from "/client/src/utils/loadServices";

const ConfigContext = createContext(null);

const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConfig()
      .then((response) => {
        const responseConfig = {};

        response.services.forEach((service) => {
          responseConfig[service.name] = {
            http: service.http,
            ip_host: service.ip_host,
            ip: service.ip,
            port: service.port,
            url: `${service.http}://${service.ip_host}:${service.port}`,
          };
        });

        setConfig(responseConfig);
        setServices(responseConfig);
        setLoading(false);
      })
      .catch((error) => {
        console.error(`Failed to get config: ${error.message}`);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading configuration...</div>;
  }

  const contextValue = { config };

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};

export default useConfig;
