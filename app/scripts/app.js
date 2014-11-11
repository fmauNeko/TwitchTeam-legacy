(function(document) {
  'use strict';

  document.addEventListener('polymer-ready', function() {
    // Perform some behaviour
    console.log('Polymer is ready to rock!');
  });

// wrap document so it plays nice with other libraries
// http://www.polymer-project.org/platform/shadow-dom.html#wrappers
})(wrap(document));

var TwitchThing = function() {
  'use strict';

  this.broadcasters = {live: [], offline: []};

  this.warehouse = new ThingModel.Warehouse();

  this.warehouse.RegisterObserver({
    New: function(thing) {
      var broadcasterElement = document.createElement('twitchteam-broadcaster');
      broadcasterElement.setAttribute('broadcaster', thing.ID);
      broadcasterElement.setAttribute('id', thing.ID + 'Status');
      broadcasterElement.updateStatus(thing);

      if(thing.Boolean('live')) {
        twitchThing.broadcasters.live.push(thing.ID);
        twitchThing.broadcasters.live.sort();
      } else {
        twitchThing.broadcasters.offline.push(thing.ID);
        twitchThing.broadcasters.offline.sort();
      }

      var elements = twitchThing.broadcasters.live.concat(twitchThing.broadcasters.offline);
      var index = elements.indexOf(thing.ID);

      if(index === (elements.length - 1)) {
        document.getElementsByTagName('twitchteam-scaffold')[0].appendChild(broadcasterElement);
      } else {
        var nextElement = document.getElementById(elements[index+1] + 'Status');
        nextElement.parentElement.insertBefore(broadcasterElement, nextElement);
      }
    },
    Deleted: function() {},
    Updated: function(thing) {
      var broadcasterElement = document.getElementById(thing.ID + 'Status');

      if(broadcasterElement !== null) {
        broadcasterElement.updateStatus(thing);

        var goingLive = thing.Boolean('live') && (twitchThing.broadcasters.offline.indexOf(thing.ID) > -1);
        var goingOffline = !thing.Boolean('live') && (twitchThing.broadcasters.live.indexOf(thing.ID) > -1);

        if(goingLive) {
          twitchThing.broadcasters.offline.splice(twitchThing.broadcasters.offline.indexOf(thing.ID), 1);
          twitchThing.broadcasters.live.push(thing.ID);
          twitchThing.broadcasters.live.sort();
        } else if(goingOffline) {
          twitchThing.broadcasters.live.splice(twitchThing.broadcasters.live.indexOf(thing.ID), 1);
          twitchThing.broadcasters.offline.push(thing.ID);
          twitchThing.broadcasters.offline.sort();
        }

        if(goingLive || goingOffline) {
          var elements = twitchThing.broadcasters.live.concat(twitchThing.broadcasters.offline);
          var index = elements.indexOf(thing.ID);

          broadcasterElement.parentElement.removeChild(broadcasterElement);
          if (index === (elements.length - 1)) {
            document.getElementsByTagName('twitchteam-scaffold')[0].appendChild(broadcasterElement);
          } else {
            var nextElement = document.getElementById(elements[index + 1] + 'Status');
            nextElement.parentElement.insertBefore(broadcasterElement, nextElement);
          }
        }
      }
    },
    Define: function(){}
  });

  this.client = new ThingModel.WebSockets.Client('TwitchTeam', 'ws://' + window.location.hostname + ':8083/', this.warehouse);
};

var twitchThing = new TwitchThing();
