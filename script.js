var jokesURL = "./destination/chucknorrisjokes/jokes/random?limitTo=[nerdy]";

// configure the service worker for offline experience
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js', {
    scope: '/'
  });
}

// configure the app
var app = new Vue({
    el: '#app',
    data: {
        message: '',
        id: ''
    },
    methods: {
        onJokeButtonClick: function() {
            getJoke();
        }
    }
});

function get(url) {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    // because the JavaScript fetch API did not work... 503?
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200) {
        // Resolve the promise with the response text
        resolve(req.response);
      }
      else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function() {
      reject(Error('Network Error'));
    };

    // Make the request
    req.send();
  });
}

function getJoke() {
    get(jokesURL).then(function(response) {
	  
	  var responseJSON = "";
	    try {
            responseJSON = JSON.parse(response);
        } catch (e) {
            console.log('Error parsing the JSON response: ', e);
            app.message = '-- Error parsing jokes response. --';
            return;
        }
        // the joke is stored inside the value object with the joke property
        if (responseJSON && responseJSON.value) {
            
            app.message = responseJSON.value.joke || '-- no joke --';
            app.id = responseJSON.value.id || '';
        }
	}, function(error) {
		app.message = '-- Failed loading jokes! --';
		app.id = '-';
	  console.error('Failed loading jokes!', error);
	});
}

// when starting the app load a joke
getJoke();