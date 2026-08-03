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

function normalizeProbabilityValue(probability, fallbackProbability) {
  const numericProbability = Number(probability);
  if (!Number.isFinite(numericProbability)) {
    return fallbackProbability;
  }

  const scaledProbability = (numericProbability >= 0 && numericProbability <= 1)
    ? numericProbability * 100
    : numericProbability;

  return Math.max(0, Math.min(100, scaledProbability));
}

function detectIncident(description) {
  const text = (description || '').toLowerCase();

  if (
    text.includes('passport') ||
    text.includes('travel document') ||
    text.includes('护照') ||
    text.includes('パスポート') ||
    text.includes('passeport')
  ) {
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
    text.includes('transfer money') ||
    text.includes('诈骗') ||
    text.includes('欺诈') ||
    text.includes('詐欺') ||
    text.includes('arnaque') ||
    text.includes('fraude')
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
    text.includes('contract') ||
    text.includes('房东') ||
    text.includes('押金') ||
    text.includes('租房') ||
    text.includes('賃貸') ||
    text.includes('敷金') ||
    text.includes('loyer') ||
    text.includes('location')
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
    text.includes('pain') ||
    text.includes('受伤') ||
    text.includes('医院') ||
    text.includes('救护车') ||
    text.includes('けが') ||
    text.includes('病院') ||
    text.includes('救急車') ||
    text.includes('urgence') ||
    text.includes('hôpital')
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
    text.includes('phone') ||
    text.includes('被偷') ||
    text.includes('盗窃') ||
    text.includes('钱包') ||
    text.includes('盗まれ') ||
    text.includes('窃盗') ||
    text.includes('財布') ||
    text.includes('vol') ||
    text.includes('sac')
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
    return normalizeProbabilityValue(analysis?.probability, fallback.probability);
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
          content: 'Classify the incident description (it may be written in any language) and return valid JSON with only the keys category_id, detected_case, urgency_level, probability, draft_message. Use the allowed values: category_id must be 1, 2, 3, 4, 5, or 6; detected_case must be Theft, Lost Passport, Scam / Online Fraud, Rental Dispute, Medical Emergency, or Other Issues; urgency_level must be Low, Medium, or High. Do not include any other fields.'
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

async function generateRecommendedActionsWithOpenAI(description, location, analysis, preferredLanguage) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    return null;
  }

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a student safety incident assistant. Return valid JSON with exactly two keys: recommended_actions (array of 3 to 5 concise strings) and priority_message (one concise sentence). Keep responses practical and non-legal. Use the user language specified by preferredLanguage when possible; otherwise use the same language as the incident description. Do not add any keys.'
        },
        {
          role: 'user',
          content: JSON.stringify({
            preferredLanguage,
            description,
            location,
            detected_case: analysis?.detected_case,
            urgency_level: analysis?.urgency_level
          })
        }
      ]
    });

    const content = response?.choices?.[0]?.message?.content;
    if (!content) {
      return null;
    }

    const parsed = JSON.parse(content);
    const actions = Array.isArray(parsed.recommended_actions)
      ? parsed.recommended_actions
          .map((item) => (typeof item === 'string' ? item.trim() : ''))
          .filter(Boolean)
          .slice(0, 5)
      : [];

    const priorityMessage = typeof parsed.priority_message === 'string'
      ? parsed.priority_message.trim()
      : '';

    if (!actions.length && !priorityMessage) {
      return null;
    }

    return {
      recommended_actions: actions,
      priority_message: priorityMessage || null
    };
  } catch (error) {
    console.warn('OpenAI action generation failed, falling back to template actions:', error.message);
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
  generateDraftMessage,
  generateRecommendedActionsWithOpenAI
};
