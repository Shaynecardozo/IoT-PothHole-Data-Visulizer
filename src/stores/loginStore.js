import { defineStore } from 'pinia';

export const useLoginStore = defineStore('login', {
  state: () => ({
    isloggedin:false,
    users:[
      {
        username:'admin',
        password:'admin'
      },
      {
        username:'user1',
        password:'user1'
      }
    ]
  }),
  getters:{updateLogin:(state)=>state.isloggedin=!state.isloggedin},
  actions: {
    checklogin()
    {
      return this.isloggedin;
    },
    checkUser(username,password)
    {
      for(const user of this.users)
      {
        if(user.username===username && user.password===password)
        {
          return true;
        }
      }
      return false;
    },
  },
});
