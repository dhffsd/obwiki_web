import { createStore } from 'vuex';
import { SessionStorage } from '@/utils/storage';

const USER_KEY = 'USER';

export default createStore({
  state: {
    user: SessionStorage.get(USER_KEY) || {}
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
      SessionStorage.set(USER_KEY, user);
    }
  },
  getters: {
    isAdmin(state) {
      
      return state.user && state.user.loginName === 'admin';
    }
  },
  actions: {},
  modules: {}
});
