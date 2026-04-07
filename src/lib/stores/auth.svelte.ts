function createAuth() {
  let loggedIn = $state(false)
  let username = $state('Пользователь')
  let avatar = $state('👤')

  function login(password: string): boolean {
    // Для демо: любой пароль подходит (или пустой)
    loggedIn = true
    return true
  }

  function logout() {
    loggedIn = false
  }

  return {
    get loggedIn() { return loggedIn },
    get username() { return username },
    get avatar() { return avatar },
    login,
    logout
  }
}

export const auth = createAuth()
