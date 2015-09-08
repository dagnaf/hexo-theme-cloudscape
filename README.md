# Cloudscape

A Hexo theme based on default [Landscape](https://github.com/hexojs/hexo-theme-landscape/) theme and [Freemind](http://freemind.pluskid.org) style.

- [Preview](http://dagnaf.github.io/hexo-theme-cloudscape/)

`hexo.config` -> _config.yml in init folder

`hexo.theme.config` -> _config.yml in theme folder

## Configuration

Most parts of `_config.yml`s extends from Hexo's or hexo-theme-landscape's. You can find more details from [Configuration | Hexo](https://hexo.io/docs/configuration.html) or [hexo-theme-landscape](https://github.com/hexojs/hexo-theme-landscape#configuration).

### hexo.config

```
# available site language: en which is default or zh-cn
language: zh-cn

# skip render js files in asset folders
#   note only takes effect on posts not in `_post` folder
skip_render:
- "**/*.js"

# enable the theme with correct name
theme: cloudscape
```

### hexo.theme.config

```
# enable comment system like disqus or duoshuo
#   disqus_shortname should be set in hexo.theme.config
disqus_shortname:
duoshuo_shortname:
```

### front-matter

```
abstract: abstract of posts will be displayed in the archives page.
```

## Plugin

Asset_js tag is used to include js files located in your post_asset_folder. It appends `<script>` tags to `<body>` when the page has been loaded.

```
{% asset_js slug %} =>
```

```
<a class="hidden-js-link" href="relative/path/to/slug.js"></a>
```
