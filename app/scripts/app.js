var Streams = {alwaysOnTop: [], live: [], offline: []};

var TwitchTeam = function() {
  'use strict';

  this.version = '0.3.0';

  this.warehouse = new ThingModel.Warehouse();

  this.warehouse.RegisterObserver({
    New: function(thing) {
      if(thing.Type.Name === 'Stream') {
        if (config.broadcasters.indexOf(thing.ID) < 0) return;

        var broadcasterElement = document.createElement('twitchteam-broadcaster');
        broadcasterElement.setAttribute('broadcaster', thing.ID);
        broadcasterElement.setAttribute('id', thing.ID + 'Status');
        broadcasterElement.updateStatus(thing);

        if (config.alwaysOnTop.indexOf(thing.ID) > -1) {
          Streams.alwaysOnTop.push(thing.ID);
          Streams.alwaysOnTop.sort();
        } else if (thing.Boolean('live')) {
          Streams.live.push(thing.ID);
          Streams.live.sort();
        } else {
          Streams.offline.push(thing.ID);
          Streams.offline.sort();
        }

        var elements = Streams.alwaysOnTop.concat(Streams.live.concat(Streams.offline));
        var index = elements.indexOf(thing.ID);

        if (index === (elements.length - 1)) {
          document.getElementsByTagName('twitchteam-scaffold')[0].appendChild(broadcasterElement);
        } else {
          var nextElement = document.getElementById(elements[index + 1] + 'Status');
          nextElement.parentElement.insertBefore(broadcasterElement, nextElement);
        }
      }
    },
    Deleted: function() {},
    Updated: function(thing) {
      if(thing.Type.Name === 'Stream') {
        if (config.alwaysOnTop.indexOf(thing.ID) < 0) {
          var broadcasterElement = document.getElementById(thing.ID + 'Status');

          if (broadcasterElement !== null) {
            broadcasterElement.updateStatus(thing);

            var goingLive = thing.Boolean('live') && (Streams.offline.indexOf(thing.ID) > -1);
            var goingOffline = !thing.Boolean('live') && (Streams.live.indexOf(thing.ID) > -1);

            if (goingLive) {
              Streams.offline.splice(Streams.offline.indexOf(thing.ID), 1);
              Streams.live.push(thing.ID);
              Streams.live.sort();
            } else if (goingOffline) {
              Streams.live.splice(Streams.live.indexOf(thing.ID), 1);
              Streams.offline.push(thing.ID);
              Streams.offline.sort();
            }

            if (goingLive || goingOffline) {
              var elements = Streams.alwaysOnTop.concat(Streams.live.concat(Streams.offline));
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
        }
      }
    },
    Define: function(){}
  });

  this.client = new ThingModel.WebSockets.Client('TwitchTeam', config.webSocket, this.warehouse);

  this.broadcasterType = ThingModel.BuildANewThingType.Named('Broadcaster').WhichIs('A Twitch.TV Broadcaster').ContainingA.String('name', 'Name').WhichIs('The name of the broadcaster').Build();

  config.broadcasters.forEach(function(val, index, arr) {
    if(!this.warehouse.GetThing('_' + val))
      this.warehouse.RegisterThing(ThingModel.BuildANewThing.As(this.broadcasterType).IdentifiedBy('_' + val).ContainingA.String('broadcaster', val).Build());
  }, this);

  this.client.Send();
};

(function(document) {
  'use strict';

  document.addEventListener('polymer-ready', function() {
    var twitchThing = new TwitchTeam();

    Twitch.init({clientId: config.twitchClientId}, function(error, status) {
      if (error) {
        console.log(error);
      }
    });

    console.log('Polymer is ready to rock!');
  });

// wrap document so it plays nice with other libraries
// http://www.polymer-project.org/platform/shadow-dom.html#wrappers
})(wrap(document));

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window, document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', config.analyticsId, 'auto');
ga('require', 'displayfeatures');
ga('send', 'pageview');
