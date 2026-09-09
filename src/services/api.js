const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://wealth-backend-sb2a.vercel.app/api/v1";

const DEMO_CREDENTIALS = {
  "rm-1": { email: "rahul@firm.com", password: "password" },
  "rm-2": { email: "priya@firm.com", password: "password" },
  "rm-3": { email: "manager@k2wealth.com", password: "password" },
  "ops-1": { email: "ops@k2wealth.com", password: "password" },
  "admin-1": { email: "admin@k2wealth.com", password: "password" },
};

async function request(path, { token, ...options } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(body?.error || `API request failed: ${response.status}`);
  }

  return body;
}

export async function loginDemoRole(roleId) {
  const credentials = DEMO_CREDENTIALS[roleId] || DEMO_CREDENTIALS["rm-1"];
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function fetchBootstrap(token) {
  return request("/bootstrap", { token });
}

export async function updateTaskStatus(token, taskId, status) {
  return request(`/tasks/${taskId}/status`, {
    token,
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function assignTask(token, taskId, assignedToUserId) {
  return request(`/tasks/${taskId}/assign`, {
    token,
    method: "PATCH",
    body: JSON.stringify({ assignedToUserId }),
  });
}

export async function createCallNote(token, clientId, rawText) {
  return request("/call-notes", {
    token,
    method: "POST",
    body: JSON.stringify({ clientId, rawText, source: "typed_notes" }),
  });
}

export async function synthesizeCallNote(token, callNoteId) {
  return request(`/call-notes/${callNoteId}/synthesize`, {
    token,
    method: "POST",
  });
}

export async function updateCrmDraft(token, draftId, patch) {
  return request(`/crm-drafts/${draftId}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function confirmCrmDraft(token, draftId) {
  return request(`/crm-drafts/${draftId}/confirm`, {
    token,
    method: "POST",
  });
}

export async function syncCrmDraft(token, draftId) {
  return request(`/crm-drafts/${draftId}/sync`, {
    token,
    method: "POST",
    body: JSON.stringify({ crmProvider: "k2-demo-crm" }),
  });
}

export async function dispatchCrmTasks(token, draftId, idempotencyKey) {
  return request(`/crm-drafts/${draftId}/dispatch-tasks`, {
    token,
    method: "POST",
    body: JSON.stringify({ idempotencyKey }),
  });
}
