(function(document) {
  'use strict';

  document.addEventListener('polymer-ready', function() {
    // Perform some behaviour
    console.log('Polymer is ready to rock!');
  });

// wrap document so it plays nice with other libraries
// http://www.polymer-project.org/platform/shadow-dom.html#wrappers
})(wrap(document));

TwitchThing = function() {
  this.warehouse = new ThingModel.Warehouse();
  this.client = new ThingModel.WebSockets.Client("TwitchTeam", "ws://" + window.location.hostname + ":8083/", this.warehouse);
};

var twitchThing = new TwitchThing();
