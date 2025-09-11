// src/utils/auth.ts
export function saveToken(token: string, email: string, remember: boolean) {
  if (remember) {
    localStorage.setItem("token", token)
    localStorage.setItem("email", email)
  } else {
    sessionStorage.setItem("token", token)
    sessionStorage.setItem("email", email)
  }
}

export function clearToken() {
  localStorage.removeItem("token")
  localStorage.removeItem("email")
  sessionStorage.removeItem("token")
  sessionStorage.removeItem("email")
}

export function getToken(): { token: string | null; email: string | null } {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  const email = localStorage.getItem("email") || sessionStorage.getItem("email")
  return { token, email }
}
