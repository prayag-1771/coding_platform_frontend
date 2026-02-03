function getUserId() {
  let id = localStorage.getItem("editor-user-id");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("editor-user-id", id);
  }

  return id;
}

export function saveBestScore(questionId, passed, total) {
  const userId = getUserId();

  const raw = localStorage.getItem("bestScores");
  const all = raw ? JSON.parse(raw) : {};

  const userScores = all[userId] || {};
  const prev = userScores[questionId];

  if (!prev || passed > prev.passed) {
    userScores[questionId] = { passed, total };
  }

  all[userId] = userScores;

  localStorage.setItem("bestScores", JSON.stringify(all));
}

export function getBestScore(questionId) {
  const userId = localStorage.getItem("editor-user-id");
  if (!userId) return null;

  const raw = localStorage.getItem("bestScores");
  if (!raw) return null;

  const all = JSON.parse(raw);
  return all[userId]?.[questionId] || null;
}
