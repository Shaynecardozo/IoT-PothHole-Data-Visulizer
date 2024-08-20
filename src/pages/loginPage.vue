<template>
  <q-page padding style="width:100%" class="flex justify-center items-center bg-grey-2">
    <q-card class="row fullLogin">
      <q-card-section class="col-12 col-md-6 column items-center q-mt-md">
        <q-icon
          name="troubleshoot"
          size="xl"
          style="border: 6px solid; border-radius: 50%; padding: 8px; color: #1d6e34;"
        />
        <h3 class="text-center text-bold q-ma-md" style="color: #1d6e34;">Login Here</h3>
        <q-form
          @submit.prevent="submitForm"
          class="q-gutter-md q-mb-lg"
          style="max-width: 30rem; width: 100%"
        >
          <q-input
            v-model="username"
            type="text"
            label="Username"
            :rules="[(val) => !!val || 'Username is required']"
            class="q-my-lg"
          />
          <q-input
            v-model="password"
            type="password"
            label="Password"
            :rules="[(val) => !!val || 'Password is required']"
            class="q-my-lg"
          />
          <div class="row justify-center q-mt-xl">
            <q-btn label="Submit" type="submit" style="background-color: #1d6e34; color: white;" />
          </div>
        </q-form>
      </q-card-section>
      <q-card-section class="col-6" v-show="$q.screen.gt.sm">
        <img
          src="/data/greenlogin.jpg"
          alt="Image Not Found"
          class="loginImage"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref } from "vue";
import { useLoginStore } from "src/stores/loginStore";
import { useRouter } from "vue-router";
export default {
  name: "login",
  setup() {
    const username = ref("");
    const password = ref("");
    const store = useLoginStore();
    const router = useRouter();
    const submitForm = () => {
      if (store.checkUser(username.value, password.value)) {
        console.log('details matched')
        alert("LoggedIn Successfully!")
        router.push("/landing");
        store.updateLogin;
        return;
      }
      alert("Invalid Details!")
    };
    return {
      username,
      password,
      store,
      router,
      submitForm,
    };
  },
};
</script>

<style>
.fullLogin {
  width: 80%;
  height: fit-content;
  box-shadow: 2px 2px 10px rgb(128, 128, 128);
}

.loginImage {
  width: 100%;
  max-height: 35rem;
  height: 100%;
  object-fit: contain;
}
</style>
