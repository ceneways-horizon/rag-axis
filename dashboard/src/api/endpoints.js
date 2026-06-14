const BASE = '/api/v1'

export const API = {
  OVERVIEW: `${BASE}/overview`,
  CORPORA: {
    LIST: `${BASE}/corpora`,
    INGEST: `${BASE}/corpora/ingest`,
    INGEST_JOB: (jobId) => `${BASE}/corpora/ingest/${jobId}`,
    GET: (corpusId) => `${BASE}/corpora/${corpusId}`,
    REINDEX: (corpusId) => `${BASE}/corpora/${corpusId}/reindex`,
  },
  EXPERIMENTS: {
    LIST: `${BASE}/experiments`,
    CREATE: `${BASE}/experiments`,
    GET: (expId) => `${BASE}/experiments/${expId}`,
    COMPARE: `${BASE}/experiments/compare`,
  },
  QUERY: `${BASE}/query`,
  RUNS: {
    LIST: `${BASE}/runs`,
    GET: (runId) => `${BASE}/runs/${runId}`,
  },
  HEALTH: `${BASE}/health`,
  ADAPTER_TEST: (name) => `${BASE}/health/adapters/${name}/test`,
  CONFIG: `${BASE}/config`,
}

export default API
