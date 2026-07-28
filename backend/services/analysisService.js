const OpenAI = require('openai');

const CATEGORY_MAP = {
  1: 'Theft',
  2: 'Lost Passport',
  3: 'Scam / Online Fraud',
  4: 'Rental Dispute',
  5: 'Medical Emergency',
  6: 'Other Issues'
};

const ALLOWED_URGENCY_LEVELS = ['Low', 'Medium', 'High'];

function detectIncident(description) {
  const text = (description || '').toLowerCase();

  if (text.includes('passport') || text.includes('travel document')) {
    return {
      category_id: 2,
      detected_case: 'Lost Passport',
      urgency_level: 'High',
      probability: 90.0
    };
  }

  if (
    text.includes('scam') ||
    text.includes('fraud') ||
    text.includes('phishing') ||
    text.includes('fake') ||
    text.includes('transfer money')
  ) {
    return {
      category_id: 3,
      detected_case: 'Scam / Online Fraud',
      urgency_level: 'High',
      probability: 88.0
    };
  }

  if (
    text.includes('landlord') ||
    text.includes('deposit') ||
    text.includes('rental') ||
    text.includes('rent') ||
    text.includes('contract')
  ) {
    return {
      category_id: 4,
      detected_case: 'Rental Dispute',
      urgency_level: 'Medium',
      probability: 85.0
    };
  }

  if (
    text.includes('injured') ||
    text.includes('injury') ||
    text.includes('sick') ||
    text.includes('hospital') ||
    text.includes('ambulance') ||
    text.includes('pain')
  ) {
    return {
      category_id: 5,
      detected_case: 'Medical Emergency',
      urgency_level: 'High',
      probability: 90.0
    };
  }

  if (
    text.includes('stolen') ||
    text.includes('theft') ||
    text.includes('robbed') ||
    text.includes('bag') ||
    text.includes('wallet') ||
    text.includes('phone')
  ) {
    return {
      category_id: 1,
      detected_case: 'Theft',
      urgency_level: 'High',
      probability: 92.5
    };
  }

  return {
    category_id: 6,
    detected_case: 'Other Issues',
    urgency_level: 'Medium',
    probability: 60.0
  };
}

function normalizeAnalysis(analysis, fallback) {
  const candidateCategoryId = Number(analysis?.category_id);
  const resolvedCategoryId = Number.isInteger(candidateCategoryId) && CATEGORY_MAP[candidateCategoryId]
    ? candidateCategoryId
    : fallback.category_id;

  const resolvedDetectedCase = (() => {
    const detectedCase = analysis?.detected_case;
    if (typeof detectedCase === 'string') {
      const trimmed = detectedCase.trim();
      if (Object.values(CATEGORY_MAP).includes(trimmed)) {
        return trimmed;
      }
    }

    return CATEGORY_MAP[resolvedCategoryId] || fallback.detected_case;
  })();

  const resolvedUrgencyLevel = (() => {
    const urgencyLevel = analysis?.urgency_level;
    if (typeof urgencyLevel === 'string') {
      const trimmed = urgencyLevel.trim();
      if (ALLOWED_URGENCY_LEVELS.includes(trimmed)) {
        return trimmed;
      }
    }

    return fallback.urgency_level;
  })();

  const resolvedProbability = (() => {
    const probability = Number(analysis?.probability);
    return Number.isFinite(probability) ? probability : fallback.probability;
  })();

  return {
    category_id: resolvedCategoryId,
    detected_case: resolvedDetectedCase,
    urgency_level: resolvedUrgencyLevel,
    probability: resolvedProbability
  };
}

async function classifyWithOpenAI(description) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    return null;
  }

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'Classify the incident description and return valid JSON with only the keys category_id, detected_case, urgency_level, probability, draft_message. Use the allowed values: category_id must be 1, 2, 3, 4, 5, or 6; detected_case must be Theft, Lost Passport, Scam / Online Fraud, Rental Dispute, Medical Emergency, or Other Issues; urgency_level must be Low, Medium, or High. Do not include any other fields.'
        },
        {
          role: 'user',
          content: description
        }
      ]
    });

    const content = response?.choices?.[0]?.message?.content;
    if (!content) {
      return null;
    }

    const parsed = JSON.parse(content);
    const fallback = detectIncident(description);

    return normalizeAnalysis(parsed, fallback);
  } catch (error) {
    console.warn('OpenAI classification failed, falling back to rule-based analysis:', error.message);
    return null;
  }
}

async function analyzeIncident(description) {
  const aiMode = (process.env.AI_MODE || 'rule').toLowerCase();

  if (aiMode === 'openai') {
    const openAiAnalysis = await classifyWithOpenAI(description);
    if (openAiAnalysis) {
      return openAiAnalysis;
    }
  }

  return detectIncident(description);
}

function generateDraftMessage(analysisOrCase, description, location) {
  const detectedCase = analysisOrCase.detected_case || analysisOrCase.detectedCase || 'Unknown incident';
  const urgencyLevel = analysisOrCase.urgency_level || analysisOrCase.urgencyLevel || 'Medium';
  const desc = description || analysisOrCase.description || 'No description provided';
  const loc = location || analysisOrCase.location || 'Not provided';

  const fallbackDetectedCase = detectedCase === 'Unknown incident' && analysisOrCase.category_id === 1
    ? 'Theft'
    : detectedCase;

  return `I would like to report a ${fallbackDetectedCase} incident.

Description:
${desc}

Location:
${loc}

Urgency level:
${urgencyLevel}

Please advise me on the next steps and any documents or evidence I should prepare.`;
}

module.exports = {
  detectIncident,
  analyzeIncident,
  generateDraftMessage
};
