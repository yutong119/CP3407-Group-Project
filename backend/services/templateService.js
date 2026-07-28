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
    `SELECT
       template_id AS id,
       category_id,
       item_name AS label,
       description,
       is_required AS required
     FROM checklist_templates
     WHERE category_id = ?
     ORDER BY template_id`,
    [categoryId]
  );

  return rows.map(item => ({
    ...item,
    required: Boolean(item.required)
  }));
}

async function getAuthorityContacts(connection, categoryId) {
  const [rows] = await connection.query(
    `SELECT
       contact_id AS id,
       category_id,
       contact_name AS name,
       contact_type AS type,
       phone_number AS number,
       email,
       website,
       description
     FROM authority_contacts
     WHERE category_id = ? OR category_id IS NULL
     ORDER BY category_id DESC, contact_id`,
    [categoryId]
  );

  return rows.map(contact => ({
    ...contact,
    icon: getContactIcon(contact.type),
    color: getContactColor(contact.type)
  }));
}

function getContactIcon(type) {
  const normalizedType = String(type || '').toLowerCase();

  if (normalizedType.includes('police')) return '🚔';
  if (normalizedType.includes('hospital')) return '🏥';
  if (
    normalizedType.includes('university') ||
    normalizedType.includes('campus')
  ) {
    return '🏫';
  }

  if (
    normalizedType.includes('embassy') ||
    normalizedType.includes('consular')
  ) {
    return '🏛️';
  }

  if (
    normalizedType.includes('legal') ||
    normalizedType.includes('law')
  ) {
    return '⚖️';
  }

  return '☎️';
}

function getContactColor(type) {
  const normalizedType = String(type || '').toLowerCase();

  if (normalizedType.includes('police')) return '#1A56DB';
  if (normalizedType.includes('hospital')) return '#E02424';

  if (
    normalizedType.includes('university') ||
    normalizedType.includes('campus')
  ) {
    return '#057A55';
  }

  if (
    normalizedType.includes('embassy') ||
    normalizedType.includes('consular')
  ) {
    return '#C27803';
  }

  if (
    normalizedType.includes('legal') ||
    normalizedType.includes('law')
  ) {
    return '#7C3AED';
  }

  return '#4B5563';
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
