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
  generateDraftMessage
};
