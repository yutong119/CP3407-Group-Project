const express = require('express');
const { analyzeIncident, generateDraftMessage } = require('../services/analysisService');
const { getGuidanceSteps, getChecklistTemplates, getAuthorityContacts } = require('../services/templateService');

const router = express.Router();

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

    const analysis = await analyzeIncident(description);

    const guidanceSteps = await getGuidanceSteps(connection, analysis.category_id);
    const checklist = await getChecklistTemplates(connection, analysis.category_id);
    const contacts = await getAuthorityContacts(connection, analysis.category_id);

    connection.release();

    const toArray = (value) => Array.isArray(value) ? value : (value ? [value] : []);

    return res.json({
      success: true,
      analysis: {
        ...analysis,
        location: location || null,
        recommended_actions: toArray(guidanceSteps),
        evidence_checklist: toArray(checklist),
        recommended_contacts: toArray(contacts),
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