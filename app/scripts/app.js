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
  'use strict';
  
  this.warehouse = new ThingModel.Warehouse();

  this.warehouse.RegisterObserver({
    New: function(thing) {
      var broadcasterElement = document.createElement("twitchteam-broadcaster");
      broadcasterElement.setAttribute("broadcaster", thing.ID);
      broadcasterElement.setAttribute("id", thing.ID + "Status");
      broadcasterElement.updateStatus(thing);

      var scaffold = document.getElementsByTagName("twitchteam-scaffold")[0];
      scaffold.appendChild(broadcasterElement);
    },
    Deleted: function(){},
    Updated: function(thing) {
      var broadcasterElement = document.getElementById(thing.ID + "Status");

      if(broadcasterElement != null) {
        broadcasterElement.updateStatus(thing);
      }
    },
    Define: function(){}
  });

  this.client = new ThingModel.WebSockets.Client("TwitchTeam", "ws://" + window.location.hostname + ":8083/", this.warehouse);
};

var twitchThing = new TwitchThing();
