import { useEffect, useState } from 'react';

interface RuntimeConfig {
  baseUrl: string;
}

const DEFAULT_CONFIG: RuntimeConfig = {
  baseUrl: '/',
};

let globalConfig: RuntimeConfig | null = null;

export function useRuntimeConfig() {
  const [config, setConfig] = useState<RuntimeConfig>(globalConfig || DEFAULT_CONFIG);
  const [loading, setLoading] = useState(!globalConfig);

  useEffect(() => {
    if (globalConfig) {
      setLoading(false);
      return;
    }

    fetch('./config.json')
      .then((res) => {
        if (!res.ok) throw new Error('Config not found');
        return res.json();
      })
      .then((data: RuntimeConfig) => {
        globalConfig = data;
        setConfig(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('No se pudo cargar config.json, usando valores por defecto', err);
        setConfig(DEFAULT_CONFIG);
        setLoading(false);
      });
  }, []);

  return { config, loading };
}

export function getRuntimeConfig(): RuntimeConfig {
  return globalConfig || DEFAULT_CONFIG;
}
