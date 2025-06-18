<template>
  <GameComponent />
</template>

<script>
import GameComponent from './components/Game.vue';

export default {
  name: 'App',
  components: {
    GameComponent,
  }
};
</script>

<style>
/* Minimal global styles here, more specific ones are in Game.vue or body */
/* body styling is now primarily in Game.vue's <style> (non-scoped part) */
/* #app styling also moved to Game.vue's <style> for better co-location with game structure */
</style>
