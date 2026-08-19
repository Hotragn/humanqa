export default {
  async fetch(request, environment) {
    return environment.ASSETS.fetch(request);
  }
};
