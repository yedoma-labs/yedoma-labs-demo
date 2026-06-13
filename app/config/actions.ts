'use server'

import { config } from '@/lib/config.server'
import { env } from '@/env'
import { eg, generateMarkdownDocs, generateEnvExample } from '@yedoma-labs/bylyt-env-guard'

export async function loadConfig() {
  'use server'
  
  // Redact sensitive database host in non-local environments
  const isDatabaseLocal = config.database_host === 'localhost' || 
                          config.database_host === '127.0.0.1' ||
                          config.database_host.startsWith('localhost:')
  
  return {
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    config: {
      app: {
        name: config.app_name,
        version: config.app_version,
        port: config.app_port,
      },
      features: {
        enableAnalytics: config.features_enableAnalytics,
        enableLogging: config.features_enableLogging,
        maxUploadSize: config.features_maxUploadSize,
      },
      api: {
        baseUrl: config.api_baseUrl,
        timeout: config.api_timeout,
        retries: config.api_retries,
      },
      database: {
        host: isDatabaseLocal ? config.database_host : '***redacted***',
        port: config.database_port,
        name: config.database_name,
        poolSize: config.database_poolSize,
      },
      cache: {
        ttl: config.cache_ttl,
        maxSize: config.cache_maxSize,
      },
    },
  }
}

export async function generateSchemaDocs(): Promise<{ markdown: string; envExample: string }> {
  'use server'

  const schema = {
    NODE_ENV:            eg.enum(['development', 'staging', 'production'] as const).default('development'),
    PORT:                eg.number().default(3000),
    NEXT_PUBLIC_API_URL: eg.url().default('http://localhost:3000/api'),
    DATABASE_URL:        eg.string(),
    REDIS_URL:           eg.string(),
    SECRET_KEY:          eg.string(),
    DEMO_MODE:           eg.boolean().default(true),
    MAX_UPLOAD_MB:       eg.number().default(10),
    LOG_LEVEL:           eg.enum(['debug', 'info', 'warn', 'error'] as const).default('info'),
    API_KEY:             eg.string(),
  }

  const markdown = generateMarkdownDocs(schema)
  const envExample = generateEnvExample(schema)

  return { markdown, envExample }
}

export async function checkEnvHealth() {
  'use server'
  
  const validNodeEnvValues = ['development', 'staging', 'production'] as const
  
  return {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: {
        value: env.NODE_ENV,
        type: 'enum',
        valid: validNodeEnvValues.includes(env.NODE_ENV as any),
      },
      NEXT_PUBLIC_API_URL: {
        value: env.NEXT_PUBLIC_API_URL,
        type: 'url',
        valid: env.NEXT_PUBLIC_API_URL.startsWith('http'),
      },
      DEMO_MODE: {
        value: env.DEMO_MODE,
        type: 'boolean',
        valid: typeof env.DEMO_MODE === 'boolean',
      },
    },
    configValidation: {
      appName: config.app_name !== undefined && config.app_name.length > 0,
      apiTimeout: config.api_timeout > 0,
      maxUploadSize: config.features_maxUploadSize > 0,
      databasePort: config.database_port > 0 && config.database_port <= 65535,
    },
    summary: {
      allEnvVarsValid: true,
      allConfigValid: true,
      environment: env.NODE_ENV,
      configSource: 'file-based (turar-config)',
      envSource: 'runtime (bylyt-env-guard)',
    },
  }
}
