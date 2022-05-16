export const state = () => ({
    user: []
  })
  
  export const mutations = {
    insert(state, userId, login) {
      state.user.push({
        id: userId,
        login: login,
        loggedIn: true,
      })
    },
    remove(state) {
      state.user.pop();
    },
    update(state, todo) {
      todo.done = !todo.done
    }
  }
  