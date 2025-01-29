declare module '#auth-utils' {
  interface User {
    id: number
    login: string
  }

  interface SecureSessionData {
    tokens: {
      access_token: string
      token_type: string
      scope: string
    }
  }
}

export {}
