<!-- <template>
  <router-view />
</template>

<script setup>
defineOptions({
  name: 'App'
});
</script>
 -->

 <template>
  <div id="app">
    <ChartsDisplay />
  </div>
</template>

<script>
import ChartsDisplay from './components/ChartsDisplay.vue';

export default {
  components: {
    ChartsDisplay,
  },
};
</script>