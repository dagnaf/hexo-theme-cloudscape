var HUB = MathJax.Hub;

HUB.Register.StartupHook("Begin Typeset",function () {
  //
  //  Get the current renderer and set the page's
  //  menu item to reflect that.
  //
  var renderer = HUB.config.menuSettings.renderer;
  document.getElementById("Renderer").value = renderer;
});
//  Listen for radio button messages and
//  if the renderer changes, update the page's menu.
HUB.Register.StartupHook("MathMenu Ready",function () {
  delete MathJax.Menu.Renderer.Messages.MML.Firefox;
  MathJax.Extension.MathMenu.signal.Interest(function (message) {
    if (message[0] === "radio button") {
      var renderer = message[1].value;
      if (String(renderer).match(/^(HTML-CSS|NativeMML|SVG)$/)) {
        document.getElementById("Renderer").value = renderer;
      }
    }
  });
});
window.setMode = function (renderer) {
  var MENU = MathJax.Menu,
      original = MENU.cookie.renderer;           // the original renderer
  //
  //  Wait for the menu to update before posting the dialog for
  //  switching to MathML
  //
  setTimeout(function () {
    MENU.config.settings.renderer = renderer;    // Set the new renderer
    MENU.Renderer.call(this);                    // Change it using the menu action
    if (MENU.cookie.renderer != original) {      // If the cookie changed,
      if (original == null) {delete MENU.cookie.renderer}
        else {MENU.cookie.renderer = original}   // Put back the original renderer
      MENU.saveCookie();                         //  and save the cookie
    }
    HUB.Queue(function () {   // Update the menu in case the user cancelled the change
      document.getElementById("Renderer").value = HUB.outputJax["jax/mml"][0].id;
    });
  },10);
};
