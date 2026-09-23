const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const repoRoot = path.resolve(__dirname, '..');
const sourcesPath = path.join(repoRoot, 'data', 'sources.json');
const statePath = path.join(repoRoot, 'data', 'source-state.json');

async function fetchSourceHtml(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ExamPathUpdater/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

function readJson(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

(async () => {
  const sources = readJson(sourcesPath, []);
  const previousState = readJson(statePath, { sources: {} });
  const now = new Date().toISOString();
  const nextState = {
    updatedAt: now,
    sources: {}
  };

  const report = [];

  for (const source of sources) {
    try {
      const html = await fetchSourceHtml(source.url);
      const hash = crypto.createHash('sha256').update(html).digest('hex');
      const previous = previousState.sources?.[source.id] || {};
      const changed = previous.hash !== hash;

      const record = {
        id: source.id,
        name: source.name,
        url: source.url,
        status: changed ? 'changed' : 'unchanged',
        lastChecked: now,
        hash,
        changed,
        previousHash: previous.hash || null
      };

      nextState.sources[source.id] = record;
      report.push(record);
    } catch (error) {
      const record = {
        id: source.id,
        name: source.name,
        url: source.url,
        status: 'error',
        lastChecked: now,
        error: error.message,
        changed: false,
        previousHash: previousState.sources?.[source.id]?.hash || null
      };

      nextState.sources[source.id] = record;
      report.push(record);
    }
  }

  fs.writeFileSync(statePath, JSON.stringify(nextState, null, 2));

  console.log('Admission source check summary');
  console.log(JSON.stringify(report, null, 2));
})();
