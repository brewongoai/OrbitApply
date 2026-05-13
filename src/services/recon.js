const path = require('path');
const axios = require('axios');
const { runAgent, parseJSONFromContent } = require('./agentBase');
const { writeJSON, readJSON } = require('../utils/fileStore');
const { logger } = require('../utils/logger');

const WORKSPACE = path.join(__dirname, '..', '..', 'workspace-recon');

async function searchWithTavily(query) {
  try {
    const response = await axios.post(
      'https://api.tavily.com/search',
      {
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: 'basic',
        max_results: 5,
        include_answer: true,
      },
      { timeout: 15000 }
    );
    return response.data?.results || [];
  } catch (err) {
    logger.error(`[RECON] Tavily search failed for "${query}": ${err.message}`);
    return [];
  }
}

function sanitiseText(str, maxLen = 100) {
  return (str || '').replace(/[^\w\s&.,'\-]/g, '').trim().slice(0, maxLen);
}

async function runRecon(company, jobTitle, sessionId = null) {
  const safeCompany = sanitiseText(company, 100);
  const safeTitle = sanitiseText(jobTitle, 100);

  if (!safeCompany) {
    logger.warn('[RECON] Skipped — empty company name after sanitisation');
    return { company, notes: 'Company name could not be sanitised.' };
  }

  const queries = [
    `${safeCompany} company culture employee reviews`,
    `${safeCompany} ${safeTitle} salary compensation`,
    `${safeCompany} recent news funding 2024 2025`,
    `${safeCompany} tech stack engineering team`,
  ];

  const allResults = [];
  for (const q of queries) {
    const results = await searchWithTavily(q);
    for (const r of results) {
      allResults.push(`SOURCE: ${r.url}\n${r.title}\n${(r.content || '').slice(0, 300)}`);
    }
  }

  const prompt = `
Company: ${safeCompany}
Role: ${safeTitle}

RESEARCH DATA:
${allResults.join('\n\n---\n\n').slice(0, 4000)}

Build a company intelligence profile. Return JSON:
{
  "company": "${safeCompany}",
  "domain": "company.com",
  "industry": "",
  "size": "startup|smb|mid-market|enterprise",
  "fundingStage": "",
  "techStack": [],
  "culture": {
    "summary": "2-3 sentences",
    "values": [],
    "glassdoorRating": null,
    "remoteFriendly": false
  },
  "salaryBenchmark": {
    "low": 0,
    "mid": 0,
    "high": 0,
    "source": "estimated|glassdoor|levels.fyi"
  },
  "hiringManager": {
    "name": "",
    "title": "",
    "linkedinUrl": "",
    "email": ""
  },
  "recentNews": ["news item 1", "news item 2"],
  "redFlags": [],
  "opportunityScore": 0,
  "riskScore": 0,
  "notes": ""
}

opportunityScore (0-100): based on company growth, funding, culture, role seniority.
riskScore (0-100): based on layoffs, bad reviews, funding issues, churn signals.
Mark any invented data as "estimated". Never fabricate hiring manager emails.
`;

  const result = await runAgent('recon', prompt, sessionId);
  const intel = parseJSONFromContent(result.content) || { company: safeCompany, notes: result.content };

  const slug = safeCompany.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const outPath = path.join(WORKSPACE, `${slug}-intel.json`);
  writeJSON(outPath, intel);
  logger.info(`[RECON] Saved intel for ${company} to ${outPath}`);

  return { ...intel, _path: outPath };
}

function getIntel(company) {
  const safe = sanitiseText(company, 100);
  const slug = safe.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return readJSON(path.join(WORKSPACE, `${slug}-intel.json`), null);
}

module.exports = { runRecon, getIntel };
