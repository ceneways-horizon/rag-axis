export const API = {
  HEALTH: '/health',
  TELEMETRY: '/api/telemetry',
  PROJECTS: {
    LIST: '/api/projects',
    CREATE: '/api/projects',
    GET: (id) => `/api/projects/${id}`,
    DELETE: (id) => `/api/projects/${id}`,
  },
  KNOWLEDGE: {
    CORPUS_LIST: (pid) => `/api/projects/${pid}/knowledge/corpus`,
    CORPUS_CREATE: (pid) => `/api/projects/${pid}/knowledge/corpus`,
    CORPUS_GET: (pid, cid) => `/api/projects/${pid}/knowledge/corpus/${cid}`,
    DOCS_LIST: (pid) => `/api/projects/${pid}/knowledge/documents`,
    DOCS_UPLOAD: (pid) => `/api/projects/${pid}/knowledge/documents`,
    DOC_DELETE: (pid, did) => `/api/projects/${pid}/knowledge/documents/${did}`,
  },
  EXPERIMENTS: {
    LIST: (pid) => `/api/projects/${pid}/experiments`,
    CREATE: (pid) => `/api/projects/${pid}/experiments`,
    GET: (pid, eid) => `/api/projects/${pid}/experiments/${eid}`,
    RUN: (pid, eid) => `/api/projects/${pid}/experiments/${eid}/run`,
    RUNS_LIST: (pid, eid) => `/api/projects/${pid}/experiments/${eid}/runs`,
    RUN_GET: (pid, eid, rid) => `/api/projects/${pid}/experiments/${eid}/runs/${rid}`,
    METRICS: (pid, eid) => `/api/projects/${pid}/experiments/${eid}/metrics`,
  },
  CONFIGS: {
    LIST: (pid) => `/api/projects/${pid}/configs`,
    CREATE: (pid) => `/api/projects/${pid}/configs`,
    GET: (pid, cid) => `/api/projects/${pid}/configs/${cid}`,
    PROMOTE: (pid, cid) => `/api/projects/${pid}/configs/${cid}/promote`,
    DELETE: (pid, cid) => `/api/projects/${pid}/configs/${cid}`,
  },
}
