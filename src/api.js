/**
 * API CLIENT
 * -------------------------------------------------------------
 * One small helper for talking to the Express server.
 * The login token is saved in localStorage so the student stays
 * logged in after refreshing the page.
 */
const TOKEN_KEY = 'sstm_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Cannot reach the server. Is it running?', 0)
  }

  // 204 has no body to parse
  const data = response.status === 204 ? {} : await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ApiError(data.error || 'Something went wrong.', response.status)
  }
  return data
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: () => request('/auth/me'),

  listTasks: (params = {}) => {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v && v !== 'all')
    ).toString()
    return request(`/tasks${search ? `?${search}` : ''}`)
  },
  createTask: (body) => request('/tasks', { method: 'POST', body }),
  updateTask: (id, body) => request(`/tasks/${id}`, { method: 'PUT', body }),
  setTaskStatus: (id, status) => request(`/tasks/${id}`, { method: 'PATCH', body: { status } }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  stats: () => {
    // Send the student's own local date so "today" is always right.
    const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
    return request(`/stats?today=${today}`)
  },
}
