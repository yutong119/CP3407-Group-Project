async function getGuidanceSteps(connection, categoryId) {
  const [rows] = await connection.query(
    `SELECT step_id, category_id, step_order, step_title, step_description
     FROM guidance_steps
     WHERE category_id = ?
     ORDER BY step_order`,
    [categoryId]
  );
  return rows;
}

async function getChecklistTemplates(connection, categoryId) {
  const [rows] = await connection.query(
    `SELECT template_id, category_id, item_name, description, is_required
     FROM checklist_templates
     WHERE category_id = ?
     ORDER BY template_id`,
    [categoryId]
  );
  return rows;
}

async function getAuthorityContacts(connection, categoryId) {
  const [rows] = await connection.query(
    `SELECT contact_id, category_id, contact_name, contact_type, phone_number, email, website, description
     FROM authority_contacts
     WHERE category_id = ? OR category_id IS NULL
     ORDER BY category_id DESC, contact_id`,
    [categoryId]
  );
  return rows;
}

async function getAnalysisDataForCategory(connection, categoryId) {
  const [guidanceSteps, checklistTemplates, authorityContacts] = await Promise.all([
    getGuidanceSteps(connection, categoryId),
    getChecklistTemplates(connection, categoryId),
    getAuthorityContacts(connection, categoryId)
  ]);

  return {
    guidanceSteps,
    checklistTemplates,
    authorityContacts
  };
}

module.exports = {
  getGuidanceSteps,
  getChecklistTemplates,
  getAuthorityContacts,
  getAnalysisDataForCategory
};
