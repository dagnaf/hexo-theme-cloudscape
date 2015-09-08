(function($){
  $(document).ready(function () {
    $('a.hidden-js-link').each(function (i) {
      $('body').append('<script src="'+$(this).attr('href')+'">');
    });
  });
  // Wrapper
  function wrapContainer() {
    if ($(this).parent().hasClass('article-entry')) {
      var nodeName = $(this)[0].nodeName.toLowerCase();
      $(this).wrap('<div class="elem-container '+ nodeName +'-container">');
    }
  }
  $('iframe').each(wrapContainer);
  $('table').each(wrapContainer);

  // Caption
  $('.article-entry').each(function(i){
    $(this).find('img').each(function(){
      if ($(this).parent().hasClass('fancybox')) return;
      $(this).parent().addClass('image-container');
      var alt = this.alt;

      if (alt) $(this).after('<span class="caption">' + alt + '</span>');

      $(this).wrap('<a href="' + this.src + '" title="' + alt + '" class="fancybox"></a>');
    });

    $(this).find('.fancybox').each(function(){
      $(this).attr('rel', 'article' + i);
    });
  });

  if ($.fancybox){
    $('.fancybox').fancybox({
      helpers : {
        title: null
      }
    });
  }
})(jQuery);
