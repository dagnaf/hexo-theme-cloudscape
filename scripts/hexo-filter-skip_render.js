hexo.extend.filter.register("after_init", function() {
  delete this.extend.renderer.storeSync.js;
  delete this.extend.renderer.store.js;
});
