const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { generateDraftMessage } = require('../services/analysisService');
const { getGuidanceSteps, getChecklistTemplates, getAuthorityContacts } = require('../services/templateService');
const { createChecklistItemsForCase } = require('../services/checklistService');

const router = express.Router();

function createIncidentSummary(caseData) {
  const type = caseData.detected_case || caseData.case_title || 'Incident';
  const location = caseData.location || 'Unknown location';
  const status = caseData.case_status || 'In Progress';
  return `This report summarizes a ${type} incident reported at ${location}. The case is currently marked as ${status}.`;
}

// Get all cases for a user
router.get('/', verifyToken, async (req, res) => {
  try {
    const { user_id } = req.user;
    const pool = req.pool;
    const connection = await pool.getConnection();

    const [cases] = await connection.query(
      `SELECT 
        sc.case_id, sc.case_title, sc.description, sc.location,
        sc.case_status, sc.urgency_level, sc.detected_case,
        sc.probability, sc.created_at, sc.category_id, cc.category_name
       FROM student_cases sc
       LEFT JOIN case_categories cc ON sc.category_id = cc.category_id
       WHERE sc.user_id = ?
       ORDER BY sc.created_at DESC`,
      [user_id]
    );

    connection.release();

    res.json({
      success: true,
      cases
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update checklist completion status
router.put('/:case_id/checklist', verifyToken, async (req, res) => {
  try {
    const { case_id } = req.params;
    const { user_id } = req.user;
    const items = req.body.items;
    const pool = req.pool;
    const connection = await pool.getConnection();

    if (!Array.isArray(items)) {
      connection.release();
      return res.status(400).json({ success: false, message: 'items must be an array' });
    }

    const [cases] = await connection.query(
      'SELECT * FROM student_cases WHERE case_id = ? AND user_id = ?',
      [case_id, user_id]
    );

    if (cases.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    let updatedCount = 0;

    for (const item of items) {
      if (item.checklist_id === undefined || item.is_completed === undefined) {
        connection.release();
        return res.status(400).json({ success: false, message: 'Each item must include checklist_id and is_completed' });
      }

      const isCompleted = item.is_completed === true || item.is_completed === 1 ? 1 : 0;
      const [result] = await connection.query(
        'UPDATE checklist_items SET is_completed = ? WHERE checklist_id = ? AND case_id = ?',
        [isCompleted, item.checklist_id, case_id]
      );

      if (result.affectedRows > 0) {
        updatedCount += 1;
      }
    }

    connection.release();

    if (updatedCount === 0) {
      return res.status(400).json({ success: false, message: 'No valid checklist items were updated for this case' });
    }

    res.json({
      success: true,
      message: 'Checklist updated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get formal report payload for a case
router.get('/:case_id/report', verifyToken, async (req, res) => {
  let connection;
  try {
    const { case_id } = req.params;
    const { user_id } = req.user;
    const pool = req.pool;
    connection = await pool.getConnection();

    const [ownedCases] = await connection.query(
      `SELECT sc.*, cc.category_name
       FROM student_cases sc
       LEFT JOIN case_categories cc ON sc.category_id = cc.category_id
       WHERE sc.case_id = ? AND sc.user_id = ?`,
      [case_id, user_id]
    );

    if (ownedCases.length === 0) {
      const [existingCase] = await connection.query(
        'SELECT case_id FROM student_cases WHERE case_id = ?',
        [case_id]
      );

      connection.release();
      if (existingCase.length > 0) {
        return res.status(403).json({ success: false, message: 'You do not have access to this case' });
      }
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const caseData = ownedCases[0];

    const [evidence, checklist, recommendedActions, recommendedContacts] = await Promise.all([
      connection.query('SELECT * FROM evidence_files WHERE case_id = ? ORDER BY uploaded_at DESC', [case_id]).then(([rows]) => rows),
      connection.query(
        `SELECT ci.*, ct.is_required
         FROM checklist_items ci
         LEFT JOIN checklist_templates ct
           ON ct.category_id = ? AND ct.item_name = ci.item_name
         WHERE ci.case_id = ?
         ORDER BY ci.checklist_id`,
        [caseData.category_id, case_id]
      ).then(([rows]) => rows),
      getGuidanceSteps(connection, caseData.category_id),
      getAuthorityContacts(connection, caseData.category_id)
    ]);

    const [checklistTemplates] = await connection.query(
      'SELECT template_id, item_name, is_required FROM checklist_templates WHERE category_id = ? ORDER BY template_id',
      [caseData.category_id]
    );

    connection.release();

    const report = {
      case: caseData,
      incident_summary: createIncidentSummary(caseData),
      recommended_actions: Array.isArray(recommendedActions) ? recommendedActions : [],
      checklist: Array.isArray(checklist) ? checklist : [],
      checklist_templates: Array.isArray(checklistTemplates) ? checklistTemplates : [],
      evidence: Array.isArray(evidence) ? evidence : [],
      recommended_contacts: Array.isArray(recommendedContacts) ? recommendedContacts : [],
      formal_message: generateDraftMessage(caseData, caseData.description, caseData.location),
      generated_at: new Date().toISOString()
    };

    return res.json({
      success: true,
      report
    });
  } catch (error) {
    if (connection) connection.release();
    console.error(error);
    return res.status(500).json({ success: false, message: 'Could not generate report' });
  }
});

// Get single case
router.get('/:case_id', verifyToken, async (req, res) => {
  try {
    const { case_id } = req.params;
    const { user_id } = req.user;
    const pool = req.pool;
    const connection = await pool.getConnection();

    const [cases] = await connection.query(
      `SELECT sc.*, cc.category_name
       FROM student_cases sc
       LEFT JOIN case_categories cc ON sc.category_id = cc.category_id
       WHERE sc.case_id = ? AND sc.user_id = ?`,
      [case_id, user_id]
    );

    if (cases.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const caseData = cases[0];

    const [evidence] = await connection.query(
      'SELECT * FROM evidence_files WHERE case_id = ?',
      [case_id]
    );

    const [checklist] = await connection.query(
      'SELECT * FROM checklist_items WHERE case_id = ? ORDER BY checklist_id',
      [case_id]
    );

    const guidanceSteps = await getGuidanceSteps(connection, caseData.category_id);
    const checklistTemplates = await getChecklistTemplates(connection, caseData.category_id);
    const recommendedContacts = await getAuthorityContacts(connection, caseData.category_id);

    const analysisData = {
      recommended_actions: guidanceSteps,
      evidence_checklist: checklistTemplates,
      recommended_contacts: recommendedContacts,
      draft_message: generateDraftMessage(caseData, caseData.description, caseData.location)
    };

    connection.release();

    res.json({
      success: true,
      case: caseData,
      evidence,
      checklist,
      analysis_data: analysisData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Create case
router.post('/', verifyToken, [
  body('category_id').isInt(),
  body('case_title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('location').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { user_id } = req.user;
    const { category_id, case_title, description, location, urgency_level, detected_case, probability } = req.body;
    const pool = req.pool;
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      `INSERT INTO student_cases 
       (user_id, category_id, case_title, description, location, urgency_level, detected_case, probability)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, category_id, case_title, description, location, urgency_level, detected_case, probability]
    );

    const newCaseId = result.insertId;
    await createChecklistItemsForCase(connection, newCaseId, category_id);

    connection.release();

    res.status(201).json({
      success: true,
      message: 'Case created successfully',
      case_id: newCaseId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update case
router.put('/:case_id', verifyToken, async (req, res) => {
  try {
    const { case_id } = req.params;
    const { user_id } = req.user;
    const { case_status, urgency_level, detected_case, probability } = req.body;
    const pool = req.pool;
    const connection = await pool.getConnection();

    const [cases] = await connection.query(
      'SELECT * FROM student_cases WHERE case_id = ? AND user_id = ?',
      [case_id, user_id]
    );

    if (cases.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const updateFields = [];
    const updateValues = [];

    if (case_status !== undefined) {
      updateFields.push('case_status = ?');
      updateValues.push(case_status);
    }
    if (urgency_level !== undefined) {
      updateFields.push('urgency_level = ?');
      updateValues.push(urgency_level);
    }
    if (detected_case !== undefined) {
      updateFields.push('detected_case = ?');
      updateValues.push(detected_case);
    }
    if (probability !== undefined) {
      updateFields.push('probability = ?');
      updateValues.push(probability);
    }

    if (updateFields.length === 0) {
      connection.release();
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    updateValues.push(case_id);

    await connection.query(
      `UPDATE student_cases SET ${updateFields.join(', ')} WHERE case_id = ?`,
      updateValues
    );

    connection.release();

    res.json({
      success: true,
      message: 'Case updated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Delete case
router.delete('/:case_id', verifyToken, async (req, res) => {
  try {
    const { case_id } = req.params;
    const { user_id } = req.user;
    const pool = req.pool;
    const connection = await pool.getConnection();

    const [cases] = await connection.query(
      'SELECT * FROM student_cases WHERE case_id = ? AND user_id = ?',
      [case_id, user_id]
    );

    if (cases.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    await connection.query('DELETE FROM evidence_files WHERE case_id = ?', [case_id]);
    await connection.query('DELETE FROM checklist_items WHERE case_id = ?', [case_id]);
    await connection.query('DELETE FROM student_cases WHERE case_id = ?', [case_id]);

    connection.release();

    res.json({
      success: true,
      message: 'Case deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
