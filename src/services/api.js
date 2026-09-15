const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://wealth-backend-update.vercel.app/api/v1";

export const DEMO_CREDENTIALS = {
  "rm-1": { email: "rahul@firm.com", password: "password" },
  "rm-2": { email: "priya@firm.com", password: "password" },
  "rm-3": { email: "manager@k2wealth.com", password: "password" },
  "ops-1": { email: "ops@k2wealth.com", password: "password" },
  "admin-1": { email: "admin@k2wealth.com", password: "password" },
};

function authRequest(path, sessionOrToken, options = {}) {
  if (sessionOrToken && typeof sessionOrToken === "object") {
    return requestWithAuth(path, {
      token: sessionOrToken.accessToken,
      refreshToken: sessionOrToken.refreshToken,
      onTokenRefresh: sessionOrToken.onTokenRefresh,
      onSessionExpired: sessionOrToken.onSessionExpired,
      ...options,
    });
  }
  return request(path, { token: sessionOrToken, ...options });
}

async function request(path, { token, retryOnUnauthorized, ...options } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      // Only send content-type when there's actually a body — this backend
      // 400s on "Body cannot be empty when content-type is set to 'application/json'"
      // for bodyless POSTs like /synthesize and /confirm.
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error(body?.error || `API request failed: ${response.status}`);
    error.statusCode = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

export async function requestWithAuth(path, { token, refreshToken, onTokenRefresh, onSessionExpired, ...options } = {}) {
  try {
    return await request(path, { token, ...options });
  } catch (error) {
    if (error.statusCode !== 401 || !refreshToken) throw error;
    try {
      const refreshed = await refreshAccessToken(refreshToken);
      onTokenRefresh?.(refreshed.accessToken);
      return await request(path, { token: refreshed.accessToken, ...options });
    } catch (refreshError) {
      onSessionExpired?.();
      throw refreshError;
    }
  }
}

export async function loginDemoRole(roleId) {
  const credentials = DEMO_CREDENTIALS[roleId] || DEMO_CREDENTIALS["rm-1"];
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function fetchBootstrap(sessionOrToken) {
  return authRequest("/bootstrap", sessionOrToken);
}

export async function refreshAccessToken(refreshToken) {
  return request("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export async function fetchClientDossier(sessionOrToken, clientId) {
  return authRequest(`/clients/${clientId}`, sessionOrToken);
}

export async function fetchClientPortfolio(sessionOrToken, clientId) {
  return authRequest(`/clients/${clientId}/portfolio`, sessionOrToken);
}

export async function fetchCopilotAlerts(sessionOrToken, clientId) {
  return authRequest(`/clients/${clientId}/copilot-alerts`, sessionOrToken);
}

export async function updateTaskStatus(sessionOrToken, taskId, status) {
  return authRequest(`/tasks/${taskId}/status`, sessionOrToken, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function assignTask(sessionOrToken, taskId, assignedToUserId) {
  return authRequest(`/tasks/${taskId}/assign`, sessionOrToken, {
    method: "PATCH",
    body: JSON.stringify({ assignedToUserId }),
  });
}

export async function createCallNote(sessionOrToken, clientId, rawText) {
  return authRequest("/call-notes", sessionOrToken, {
    method: "POST",
    body: JSON.stringify({ clientId, rawText, source: "typed_notes" }),
  });
}

export async function synthesizeCallNote(sessionOrToken, callNoteId) {
  return authRequest(`/call-notes/${callNoteId}/synthesize`, sessionOrToken, {
    method: "POST",
  });
}

export async function updateCrmDraft(sessionOrToken, draftId, patch) {
  return authRequest(`/crm-drafts/${draftId}`, sessionOrToken, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function confirmCrmDraft(sessionOrToken, draftId) {
  return authRequest(`/crm-drafts/${draftId}/confirm`, sessionOrToken, {
    method: "POST",
  });
}

export async function syncCrmDraft(sessionOrToken, draftId) {
  return authRequest(`/crm-drafts/${draftId}/sync`, sessionOrToken, {
    method: "POST",
    body: JSON.stringify({ crmProvider: "k2-demo-crm" }),
  });
}

export async function dispatchCrmTasks(sessionOrToken, draftId, idempotencyKey) {
  return authRequest(`/crm-drafts/${draftId}/dispatch-tasks`, sessionOrToken, {
    method: "POST",
    body: JSON.stringify({ idempotencyKey }),
  });
}
