<<<<<<< HEAD
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
=======
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
>>>>>>> 705830440d4df675cf602c678e3d184c68ab2c17
