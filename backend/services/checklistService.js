async function createChecklistItemsForCase(connection, caseId, categoryId) {
  if (!caseId || !categoryId) {
    return [];
  }

  const [templates] = await connection.query(
    `SELECT item_name
     FROM checklist_templates
     WHERE category_id = ?
     ORDER BY template_id`,
    [categoryId]
  );

  if (!templates.length) {
    return [];
  }

  const values = templates.map((template) => [caseId, template.item_name, false]);

  await connection.query(
    `INSERT INTO checklist_items (case_id, item_name, is_completed) VALUES ?`,
    [values]
  );

  return templates;
}

async function updateChecklistItems(connection, caseId, items) {
  const updates = [];

  for (const item of items) {
    const isCompleted = item.is_completed === true ? 1 : 0;
    updates.push(
      connection.query(
        `UPDATE checklist_items
         SET is_completed = ?
         WHERE checklist_id = ? AND case_id = ?`,
        [isCompleted, item.checklist_id, caseId]
      )
    );
  }

  await Promise.all(updates);
  return updates.length;
}

module.exports = {
  createChecklistItemsForCase,
  updateChecklistItems
};
