import client from './client'
import { API } from './endpoints'
import * as mock from './mockData'

// Mock-first: the server endpoints in the API Contract may not all exist yet.
// Set VITE_API_MOCK=false to talk to a live rag-axis server. Components never
// see this boundary — they only call the functions exported below.
const USE_MOCK = import.meta.env.VITE_API_MOCK !== 'false'

const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms))

// --- Overview --------------------------------------------------------------

export async function getOverview() {
  if (USE_MOCK) {
    await delay()
    return mock.overview
  }
  const res = await client.get(API.OVERVIEW)
  return res.data
}

// --- Corpora -----------------------------------------------------------------

export async function getCorpora() {
  if (USE_MOCK) {
    await delay()
    return mock.getCorporaList()
  }
  const res = await client.get(API.CORPORA.LIST)
  return res.data
}

export async function getCorpus(corpusId) {
  if (USE_MOCK) {
    await delay()
    return mock.getCorpusDetail(corpusId)
  }
  const res = await client.get(API.CORPORA.GET(corpusId))
  return res.data
}

export async function ingestCorpus(formData) {
  if (USE_MOCK) {
    await delay(400)
    return mock.createIngestJob(formData.get('corpus_name') || 'new-corpus')
  }
  const res = await client.post(API.CORPORA.INGEST, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function getIngestJob(jobId) {
  if (USE_MOCK) {
    await delay(300)
    return mock.getIngestJobStatus(jobId)
  }
  const res = await client.get(API.CORPORA.INGEST_JOB(jobId))
  return res.data
}

export async function reindexCorpus(corpusId) {
  if (USE_MOCK) {
    await delay(300)
    return mock.createIngestJob(corpusId)
  }
  const res = await client.post(API.CORPORA.REINDEX(corpusId))
  return res.data
}

// --- Experiments -------------------------------------------------------------

export async function getExperiments() {
  if (USE_MOCK) {
    await delay()
    return mock.getExperimentsList()
  }
  const res = await client.get(API.EXPERIMENTS.LIST)
  return res.data
}

export async function createExperiment(payload) {
  if (USE_MOCK) {
    await delay(300)
    return mock.createExperiment(payload)
  }
  const res = await client.post(API.EXPERIMENTS.CREATE, payload)
  return res.data
}

export async function getExperiment(expId) {
  if (USE_MOCK) {
    await delay()
    return mock.getExperimentDetail(expId)
  }
  const res = await client.get(API.EXPERIMENTS.GET(expId))
  return res.data
}

export async function compareExperiments(ids) {
  if (USE_MOCK) {
    await delay()
    return mock.compareExperiments(ids)
  }
  const res = await client.get(API.EXPERIMENTS.COMPARE, { params: { ids: ids.join(',') } })
  return res.data
}

// --- Playground query (sync) --------------------------------------------------

export async function runQuery(payload) {
  if (USE_MOCK) {
    await delay(600)
    return mock.runQuery(payload)
  }
  const res = await client.post(API.QUERY, payload)
  return res.data
}

// --- Runs ----------------------------------------------------------------------

export async function getRuns(filters = {}) {
  if (USE_MOCK) {
    await delay()
    return mock.getRunsList(filters)
  }
  const res = await client.get(API.RUNS.LIST, { params: filters })
  return res.data
}

export async function getRun(runId) {
  if (USE_MOCK) {
    await delay()
    return mock.getRunDetail(runId)
  }
  const res = await client.get(API.RUNS.GET(runId))
  return res.data
}

// --- Server / Health -------------------------------------------------------------

export async function getHealth() {
  if (USE_MOCK) {
    await delay()
    return mock.health
  }
  const res = await client.get(API.HEALTH)
  return res.data
}

export async function testAdapter(name) {
  if (USE_MOCK) {
    await delay(400)
    return mock.testAdapter(name)
  }
  const res = await client.post(API.ADAPTER_TEST(name))
  return res.data
}

export async function getConfig() {
  if (USE_MOCK) {
    await delay()
    return mock.config
  }
  const res = await client.get(API.CONFIG)
  return res.data
}
