// Mock fixtures matching the Dashboard Server API Contract v1 response shapes exactly.
// Kept at the API client boundary so components never know data is mocked.

const now = () => new Date().toISOString()

const isoMinutesAgo = (mins) => new Date(Date.now() - mins * 60_000).toISOString()

export const overview = {
  deployment: {
    server_version: '1.1.0',
    db_backend: 'sqlite',
    uptime_seconds: 38211,
  },
  stats: {
    corpora: 2,
    experiments: 3,
    total_runs: 147,
    avg_cost: 0.035,
    success_rate: 0.98,
    avg_latency_ms: 325,
  },
  activity: [
    { date: '2026-06-07', runs: 12 },
    { date: '2026-06-08', runs: 42 },
    { date: '2026-06-09', runs: 28 },
    { date: '2026-06-10', runs: 35 },
    { date: '2026-06-11', runs: 19 },
    { date: '2026-06-12', runs: 8 },
    { date: '2026-06-13', runs: 3 },
  ],
}

const corporaList = [
  {
    corpus_id: 'corpus_invest_v1',
    corpus_name: 'investment-guidelines-v1',
    status: 'ready',
    documents: 42,
    chunks: 1204,
    tokens: 456789,
    embedder_model: 'text-embedding-3-large',
    created_at: '2026-06-12T14:22:15Z',
    stale: false,
  },
  {
    corpus_id: 'corpus_policies_v1',
    corpus_name: 'internal-policies-v1',
    status: 'ready',
    documents: 17,
    chunks: 388,
    tokens: 102344,
    embedder_model: 'text-embedding-3-large',
    created_at: '2026-06-10T09:12:00Z',
    stale: true,
  },
]

const corpusDocuments = {
  corpus_invest_v1: [
    { document_id: 'doc_001', filename: 'sec-filing-2026.pdf', chunks: 84, tokens: 31022, status: 'indexed', ingested_at: '2026-06-12T14:20:00Z' },
    { document_id: 'doc_002', filename: 'risk-disclosure.pdf', chunks: 41, tokens: 15890, status: 'indexed', ingested_at: '2026-06-12T14:21:00Z' },
    { document_id: 'doc_003', filename: 'q2-earnings-call.txt', chunks: 22, tokens: 8410, status: 'indexed', ingested_at: '2026-06-12T14:21:30Z' },
  ],
  corpus_policies_v1: [
    { document_id: 'doc_101', filename: 'compliance-handbook.pdf', chunks: 120, tokens: 41200, status: 'indexed', ingested_at: '2026-06-10T09:10:00Z' },
    { document_id: 'doc_102', filename: 'data-retention-policy.md', chunks: 18, tokens: 4310, status: 'indexed', ingested_at: '2026-06-10T09:11:00Z' },
  ],
}

export function getCorporaList() {
  return { corpora: corporaList }
}

export function getCorpusDetail(corpusId) {
  const corpus = corporaList.find(c => c.corpus_id === corpusId)
  if (!corpus) {
    const err = new Error(`Corpus '${corpusId}' was not found.`)
    err.type = 'NotFoundError'
    err.degraded = false
    err.status = 404
    throw err
  }
  return { ...corpus, documents_detail: corpusDocuments[corpusId] || [] }
}

// In-memory ingest job progression — each poll advances progress.
const ingestJobs = new Map()
let ingestCounter = 0

export function createIngestJob(corpusName) {
  ingestCounter += 1
  const jobId = `ingest_${String(ingestCounter).padStart(3, '0')}`
  const corpusId = `corpus_${corpusName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${ingestCounter}`
  const files = ['report-q1.pdf', 'report-q2.pdf', 'appendix.docx']
  ingestJobs.set(jobId, {
    job_id: jobId,
    corpus_id: corpusId,
    corpus_name: corpusName,
    status: 'processing',
    progress: 0,
    files,
    fileIndex: 0,
  })
  return {
    job_id: jobId,
    corpus_id: corpusId,
    status: 'processing',
    progress: 0,
    estimated_completion: new Date(Date.now() + 30_000).toISOString(),
  }
}

export function getIngestJobStatus(jobId) {
  const job = ingestJobs.get(jobId)
  if (!job) {
    const err = new Error(`Ingest job '${jobId}' was not found.`)
    err.type = 'NotFoundError'
    err.degraded = false
    err.status = 404
    throw err
  }

  if (job.status === 'processing') {
    job.progress = Math.min(100, job.progress + 35)
    job.fileIndex = Math.min(job.files.length - 1, Math.floor((job.progress / 100) * job.files.length))
    if (job.progress >= 100) {
      job.status = 'completed'
      job.current_file = null
      corporaList.push({
        corpus_id: job.corpus_id,
        corpus_name: job.corpus_name,
        status: 'ready',
        documents: 3,
        chunks: 96,
        tokens: 38120,
        embedder_model: 'text-embedding-3-large',
        created_at: now(),
        stale: false,
      })
    } else {
      job.current_file = job.files[job.fileIndex]
    }
  }

  return {
    job_id: job.job_id,
    corpus_id: job.corpus_id,
    status: job.status,
    progress: job.progress,
    current_file: job.status === 'completed' ? null : job.current_file,
    documents_ingested: job.status === 'completed' ? 3 : Math.round((job.progress / 100) * 3),
    chunks_created: job.status === 'completed' ? 96 : Math.round((job.progress / 100) * 96),
    tokens_indexed: job.status === 'completed' ? 38120 : Math.round((job.progress / 100) * 38120),
    cost: { embedding_cost: 0.038, total_cost: 0.046 },
    completed_at: job.status === 'completed' ? now() : null,
    error: null,
  }
}

let experimentsList = [
  {
    exp_id: 'exp_openai_v1',
    name: 'OpenAI v1',
    description: 'A/B OpenAI embedding',
    frozen_config: {
      corpus_id: 'corpus_invest_v1',
      retrieval: { k: 10, dense_weight: 0.7, sparse_weight: 0.3, reranker: 'cohere' },
      synthesis: { context_budget_tokens: 2048, temperature: 0.7, llm: 'openai:gpt-4' },
    },
    run_count: 15,
    avg_cost: 0.035,
    avg_latency_ms: 325,
    success_rate: 1.0,
    created_at: '2026-06-10T09:00:00Z',
  },
  {
    exp_id: 'exp_cohere_v1',
    name: 'Cohere Rerank v1',
    description: 'Cohere reranker, lower temperature',
    frozen_config: {
      corpus_id: 'corpus_invest_v1',
      retrieval: { k: 8, dense_weight: 0.6, sparse_weight: 0.4, reranker: 'cohere' },
      synthesis: { context_budget_tokens: 1536, temperature: 0.3, llm: 'openai:gpt-4' },
    },
    run_count: 9,
    avg_cost: 0.028,
    avg_latency_ms: 410,
    success_rate: 0.89,
    created_at: '2026-06-11T11:30:00Z',
  },
  {
    exp_id: 'exp_policies_v1',
    name: 'Policies Baseline',
    description: 'Baseline config for internal policy corpus',
    frozen_config: {
      corpus_id: 'corpus_policies_v1',
      retrieval: { k: 12, dense_weight: 0.8, sparse_weight: 0.2, reranker: 'none' },
      synthesis: { context_budget_tokens: 3072, temperature: 0.5, llm: 'openai:gpt-4o-mini' },
    },
    run_count: 6,
    avg_cost: 0.014,
    avg_latency_ms: 280,
    success_rate: 1.0,
    created_at: '2026-06-12T16:45:00Z',
  },
]

export function getExperimentsList() {
  return { experiments: experimentsList }
}

let expCounter = experimentsList.length

export function createExperiment({ name, description, frozen_config }) {
  expCounter += 1
  const exp = {
    exp_id: `exp_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${expCounter}`,
    name,
    description: description || '',
    frozen_config,
    run_count: 0,
    avg_cost: 0,
    avg_latency_ms: 0,
    success_rate: 1.0,
    created_at: now(),
  }
  experimentsList = [exp, ...experimentsList]
  return exp
}

export function getExperimentDetail(expId) {
  const exp = experimentsList.find(e => e.exp_id === expId)
  if (!exp) {
    const err = new Error(`Experiment '${expId}' was not found.`)
    err.type = 'NotFoundError'
    err.degraded = false
    err.status = 404
    throw err
  }
  return {
    ...exp,
    p95_latency_ms: Math.round(exp.avg_latency_ms * 1.6),
  }
}

export function compareExperiments(ids) {
  const metrics = ['runs', 'success_rate', 'avg_latency', 'p95_latency', 'avg_cost', 'retrieval_quality', 'confidence', 'truncation_rate']
  const experiments = ids
    .map(id => experimentsList.find(e => e.exp_id === id))
    .filter(Boolean)
    .map(exp => ({
      exp_id: exp.exp_id,
      name: exp.name,
      runs: exp.run_count,
      success_rate: exp.success_rate,
      avg_latency: exp.avg_latency_ms,
      p95_latency: Math.round(exp.avg_latency_ms * 1.6),
      avg_cost: exp.avg_cost,
      retrieval_quality: 0.84,
      confidence: 0.87,
      truncation_rate: 0.02,
    }))
  return { experiments, metrics }
}

let runCounter = 0

const runStore = new Map()

function buildRunResult({ exp_id, query }) {
  runCounter += 1
  const exp = experimentsList.find(e => e.exp_id === exp_id)
  const run_id = `run_${String(100000 + runCounter)}`
  const result = {
    run_id,
    exp_id,
    query,
    answer: `Based on the retrieved context, here is a synthesized answer to: "${query}". Key findings are drawn from the top-ranked chunks below, with citations indicating source confidence.`,
    citations: [
      { chunk_id: 'chunk_001', source: 'sec-filing-2026.pdf', confidence: 0.94, text: 'Market risk arises from fluctuations in interest rates, equity prices, and foreign exchange rates affecting portfolio valuation.' },
      { chunk_id: 'chunk_014', source: 'risk-disclosure.pdf', confidence: 0.88, text: 'Concentration risk is mitigated through diversification limits across sectors and issuers.' },
      { chunk_id: 'chunk_027', source: 'q2-earnings-call.txt', confidence: 0.71, text: 'Liquidity risk is monitored via stress testing under adverse redemption scenarios.' },
    ],
    confidence: 0.87,
    retrieval_quality: 0.84,
    cost: {
      embedding_cost: 0.001,
      retrieval_cost: 0.0,
      reranking_cost: 0.002,
      generation_cost: 0.032,
      total_cost: 0.035,
    },
    audit_trail: {
      retrieval: {
        dense_chunks: 10,
        dense_scores: [0.91, 0.88, 0.85, 0.83, 0.81, 0.79, 0.77, 0.74, 0.71, 0.68],
        sparse_chunks: 5,
        sparse_scores: [0.62, 0.58, 0.55, 0.51, 0.47],
        reranked_top_k: 8,
        reranked_scores: [0.94, 0.88, 0.82, 0.79, 0.75, 0.71, 0.68, 0.64],
        score_collapsed: false,
      },
      synthesis: {
        context_assembled: 8,
        context_truncated: 0,
        tokens_dropped: 0,
        truncation_reason: null,
        tokens_used: 1847,
      },
    },
    reproducibility: {
      corpus_version: 'investment-guidelines-v1',
      embedder_model: exp?.frozen_config?.synthesis?.llm ? 'text-embedding-3-large' : 'text-embedding-3-large',
      llm_model: exp?.frozen_config?.synthesis?.llm || 'openai:gpt-4',
      retrieval_config: exp?.frozen_config?.retrieval || {},
      synthesis_config: exp?.frozen_config?.synthesis || {},
      run_timestamp: now(),
    },
    status: 'success',
  }

  if (exp) {
    exp.run_count += 1
    exp.avg_latency_ms = Math.round((exp.avg_latency_ms * (exp.run_count - 1) + 325) / exp.run_count)
    exp.avg_cost = Number(((exp.avg_cost * (exp.run_count - 1) + result.cost.total_cost) / exp.run_count).toFixed(5))
  }

  runStore.set(run_id, {
    run_id,
    exp_id,
    query_snippet: query.length > 60 ? `${query.slice(0, 60)}…` : query,
    status: result.status,
    latency_ms: 325,
    cost: result.cost.total_cost,
    timestamp: now(),
    _full: result,
  })

  return result
}

export function runQuery({ exp_id, query }) {
  return buildRunResult({ exp_id, query })
}

export function getRunsList({ exp_id, status, limit = 20, offset = 0 } = {}) {
  let runs = Array.from(runStore.values())

  if (runs.length === 0) {
    // seed a few historical runs so the page is not empty before any playground use
    const seedExp = experimentsList[0]?.exp_id || 'exp_openai_v1'
    const seeded = [
      { run_id: 'run_100001', exp_id: seedExp, query_snippet: 'What are the key investment risks?', status: 'success', latency_ms: 325, cost: 0.035, timestamp: isoMinutesAgo(120) },
      { run_id: 'run_100002', exp_id: seedExp, query_snippet: 'Summarize the diversification policy', status: 'success', latency_ms: 290, cost: 0.029, timestamp: isoMinutesAgo(95) },
      { run_id: 'run_100003', exp_id: 'exp_cohere_v1', query_snippet: 'How is liquidity risk monitored?', status: 'degraded', latency_ms: 480, cost: 0.041, timestamp: isoMinutesAgo(60) },
      { run_id: 'run_100004', exp_id: 'exp_policies_v1', query_snippet: 'What is the data retention period for client records?', status: 'success', latency_ms: 270, cost: 0.013, timestamp: isoMinutesAgo(30) },
      { run_id: 'run_100005', exp_id: seedExp, query_snippet: 'Explain the reranking strategy used', status: 'failed', latency_ms: 150, cost: 0.004, timestamp: isoMinutesAgo(10) },
    ]
    for (const s of seeded) {
      runStore.set(s.run_id, { ...s, _full: { ...buildSeedFull(s) } })
    }
    runs = Array.from(runStore.values())
  }

  if (exp_id) runs = runs.filter(r => r.exp_id === exp_id)
  if (status) runs = runs.filter(r => r.status === status)

  runs = [...runs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  const total = runs.length
  const page = runs.slice(offset, offset + limit).map(({ _full, ...summary }) => summary)
  return { runs: page, total }
}

function buildSeedFull(summary) {
  if (summary.status === 'failed') return null

  const exp = experimentsList.find(e => e.exp_id === summary.exp_id)
  return {
    run_id: summary.run_id,
    exp_id: summary.exp_id,
    query: summary.query_snippet,
    answer: `Synthesized answer for "${summary.query_snippet}".`,
    citations: [
      { chunk_id: 'chunk_001', source: 'sec-filing-2026.pdf', confidence: 0.9, text: 'Relevant excerpt supporting the answer.' },
    ],
    confidence: 0.85,
    retrieval_quality: 0.8,
    cost: {
      embedding_cost: 0.001,
      retrieval_cost: 0.0,
      reranking_cost: 0.001,
      generation_cost: summary.cost - 0.002,
      total_cost: summary.cost,
    },
    audit_trail: {
      retrieval: {
        dense_chunks: 10,
        dense_scores: [0.9, 0.85, 0.8, 0.76, 0.72, 0.68, 0.64, 0.6, 0.56, 0.52],
        sparse_chunks: 5,
        sparse_scores: [0.6, 0.56, 0.52, 0.48, 0.44],
        reranked_top_k: 8,
        reranked_scores: [0.9, 0.85, 0.8, 0.76, 0.72, 0.68, 0.64, 0.6],
        score_collapsed: summary.status === 'degraded',
      },
      synthesis: {
        context_assembled: 8,
        context_truncated: summary.status === 'degraded' ? 2 : 0,
        tokens_dropped: summary.status === 'degraded' ? 412 : 0,
        truncation_reason: summary.status === 'degraded' ? 'context_budget_exceeded' : null,
        tokens_used: 1620,
      },
    },
    reproducibility: {
      corpus_version: 'investment-guidelines-v1',
      embedder_model: 'text-embedding-3-large',
      llm_model: exp?.frozen_config?.synthesis?.llm || 'openai:gpt-4',
      retrieval_config: exp?.frozen_config?.retrieval || {},
      synthesis_config: exp?.frozen_config?.synthesis || {},
      run_timestamp: summary.timestamp,
    },
    status: summary.status,
  }
}

export function getRunDetail(runId) {
  getRunsList() // ensure seeded
  const entry = runStore.get(runId)
  if (!entry) {
    const err = new Error(`Run '${runId}' was not found.`)
    err.type = 'NotFoundError'
    err.degraded = false
    err.status = 404
    throw err
  }

  // A failed run produced no RunResult — it is reported as a fatal
  // RagAxisError envelope, not a degraded result with zeroed scores.
  if (entry.status === 'failed') {
    const err = new Error(`Run '${runId}' failed during generation: the LLM provider returned a schema error and no answer was produced.`)
    err.type = 'ProviderSchemaError'
    err.degraded = false
    err.status = 502
    err.context = { run_id: runId, exp_id: entry.exp_id, stage: 'generation' }
    throw err
  }

  return entry._full
}

export const health = {
  status: 'healthy',
  server_version: '1.1.0',
  uptime_seconds: 38211,
  request_rate_last_hour: 212,
  db: { backend: 'sqlite', connected: true, location: '/var/lib/ragaxis/local.db' },
  adapters: {
    embedder: { name: 'openai:text-embedding-3-large', status: 'healthy', last_tested: isoMinutesAgo(5) },
    vector_store: { name: 'pinecone', status: 'healthy', last_tested: isoMinutesAgo(5) },
    llm: { name: 'openai:gpt-4', status: 'healthy', last_tested: isoMinutesAgo(5) },
  },
}

export function testAdapter(name) {
  const adapter = health.adapters[name]
  if (!adapter) {
    const err = new Error(`Unknown adapter '${name}'.`)
    err.type = 'ProviderSchemaError'
    err.degraded = false
    err.status = 400
    throw err
  }
  adapter.last_tested = now()
  return { name, status: adapter.status, latency_ms: Math.round(40 + Math.random() * 80) }
}

export const config = {
  embedder: { provider: 'openai', model: 'text-embedding-3-large', dimensions: 3072 },
  vector_store: { provider: 'pinecone', index: 'rag-axis-prod', region: 'us-east-1' },
  llm: { provider: 'openai', model: 'gpt-4', temperature: 0.7 },
  storage: { backend: 'sqlite', location: '/var/lib/ragaxis/local.db' },
  telemetry: { otel_enabled: true },
}
