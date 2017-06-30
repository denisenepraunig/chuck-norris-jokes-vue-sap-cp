var jokesURL = "./destination/chucknorrisjokes/jokes/random?limitTo=[nerdy]";

// local development with CORS proxy
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    jokesURL = "http://localhost:1337/api.icndb.com/jokes/random?limitTo=[nerdy]";
}

// configure the service worker for offline experience
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js', {
        scope: '.'
    });
}

var app;

// sometimes there was no content visible in the app div
// on the first load, may this fixes the problem with DOMContentLoaded
// altough my script is loaded at the end of the body...
// https://www.sitepoint.com/jquery-document-ready-plain-javascript/
function domReady() {

    console.log("DOM ready");

    // configure the app
    app = new Vue({
        el: '#app',
        data: {
            message: '',
            id: '',
            source: ''
        },
        methods: {
            onJokeButtonClick: function() {
                getJoke();
            }
        }
    });
}

if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
    domReady();
} else {
    document.addEventListener("DOMContentLoaded", domReady);
}

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
            } else {
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

            var joke = responseJSON.value.joke || '-- no joke --';
            var id = responseJSON.value.id || '';

            // save joke locally
            localStorage.setItem(id, joke);

            // probably use unescape in the future
            // https://www.npmjs.com/package/unescape
            var jokeEscaped = joke.replace(/&quot;/g, '"');

            app.message = jokeEscaped;
            app.id = id;
            app.source = "- joke from network -";
        }
    }, function(error) {

        // one hard coded joke - if everything fails
        var joke = "Hard coded joke: Chuck Norris can delete the Recycling Bin.";
        var id = 467;
        var source = "- hard coded joke -";

        console.log('-- Failed loading jokes! --');

        var localJokes = [];

        // try to load jokes from localStorage
        var localJokesKeys = Object.keys(localStorage);

        if (localJokesKeys.length > 0) {
            
            localJokesKeys.forEach(function(key) {
                
                // 0 is the id, 1 is the joke
                localJokes.push([key, localStorage.getItem(key)]);
            })

            // chose a random local joke
            var randomJokeAndID = localJokes[Math.floor(Math.random() * localJokes.length)];

            // 0 is the id, 1 is the joke
            id = randomJokeAndID[0];
            
            // probably use unescape in the future
            // https://www.npmjs.com/package/unescape
            var jokeEscaped = randomJokeAndID[1].replace(/&quot;/g, '"');
            
            joke = jokeEscaped;
            source = "- cached local joke -";
        }

        app.message = joke;
        app.id = id;
        app.source = source;
        console.log('Failed loading jokes from network!', error);
    });
}

// when starting the app load a joke
getJoke();