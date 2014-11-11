var Broadcasters = {live: [], offline: []};

var TwitchThing = function() {
  'use strict';

  this.warehouse = new ThingModel.Warehouse();

  this.warehouse.RegisterObserver({
    New: function(thing) {
      var broadcasterElement = document.createElement('twitchteam-broadcaster');
      broadcasterElement.setAttribute('broadcaster', thing.ID);
      broadcasterElement.setAttribute('id', thing.ID + 'Status');
      broadcasterElement.updateStatus(thing);

      if(thing.Boolean('live')) {
        Broadcasters.live.push(thing.ID);
        Broadcasters.live.sort();
      } else {
        Broadcasters.offline.push(thing.ID);
        Broadcasters.offline.sort();
      }

      var elements = Broadcasters.live.concat(Broadcasters.offline);
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

        var goingLive = thing.Boolean('live') && (Broadcasters.offline.indexOf(thing.ID) > -1);
        var goingOffline = !thing.Boolean('live') && (Broadcasters.live.indexOf(thing.ID) > -1);

        if(goingLive) {
          Broadcasters.offline.splice(Broadcasters.offline.indexOf(thing.ID), 1);
          Broadcasters.live.push(thing.ID);
          Broadcasters.live.sort();
        } else if(goingOffline) {
          Broadcasters.live.splice(Broadcasters.live.indexOf(thing.ID), 1);
          Broadcasters.offline.push(thing.ID);
          Broadcasters.offline.sort();
        }

        if(goingLive || goingOffline) {
          var elements = Broadcasters.live.concat(Broadcasters.offline);
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

(function(document) {
  'use strict';

  document.addEventListener('polymer-ready', function() {
    var twitchThing = new TwitchThing();
    console.log('Polymer is ready to rock!');
  });

// wrap document so it plays nice with other libraries
// http://www.polymer-project.org/platform/shadow-dom.html#wrappers
})(wrap(document));
