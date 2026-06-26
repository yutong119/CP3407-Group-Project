const express = require('express');

const router = express.Router();

function detectIncident(description) {
  const text = description.toLowerCase();

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

function generateDraftMessage(analysis, description, location) {
  return `I would like to report a ${analysis.detected_case} incident.

Description:
${description}

Location:
${location || 'Not provided'}

Urgency level:
${analysis.urgency_level}

Please advise me on the next steps and any documents or evidence I should prepare.`;
}

router.post('/', async (req, res) => {
  let connection;

  try {
    const { description, location } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    const pool = req.pool;
    connection = await pool.getConnection();

    const analysis = detectIncident(description);

    const [checklist] = await connection.query(
      `SELECT template_id, category_id, item_name, description, is_required
       FROM checklist_templates
       WHERE category_id = ?
       ORDER BY template_id`,
      [analysis.category_id]
    );

    const [guidanceSteps] = await connection.query(
      `SELECT step_id, category_id, step_order, step_title, step_description
       FROM guidance_steps
       WHERE category_id = ?
       ORDER BY step_order`,
      [analysis.category_id]
    );

    const [contacts] = await connection.query(
      `SELECT contact_id, category_id, contact_name, contact_type, phone_number, email, website, description
       FROM authority_contacts
       WHERE category_id = ? OR category_id IS NULL
       ORDER BY category_id DESC, contact_id`,
      [analysis.category_id]
    );

    connection.release();

    return res.json({
      success: true,
      analysis: {
        ...analysis,
        location: location || null,
        recommended_actions: guidanceSteps,
        evidence_checklist: checklist,
        recommended_contacts: contacts,
        draft_message: generateDraftMessage(analysis, description, location)
      }
    });
  } catch (error) {
    if (connection) connection.release();

    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;