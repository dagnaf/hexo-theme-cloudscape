/**
* Asset_js tag
*   to include js file in a post page or content
*
* Syntax:
*   {% asset_js /path/to/js %}
*/
hexo.extend.tag.register('asset_js', function (args) {
  var slug = args.shift();
  if (!slug) return;
  var jsfile = slug.replace(/(\.js)$/,'') + '.js';
  var asset = hexo.database.model('PostAsset').findOne({post: this._id, slug: slug+'.js'});
  if (!asset) return;
  return '<a class="hidden-js-link" href="' + hexo.config.root + asset.path + '"></a>';
});
