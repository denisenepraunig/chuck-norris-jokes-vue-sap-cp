var jokesURL = "./destination/chucknorrisjokes/jokes/random?limitTo=[nerdy]";

// good old xhr, because the JavaScript fetch API did not work... 503?
var xhr = new XMLHttpRequest();

function getJoke() {
    xhr.open('GET', jokesURL);
    xhr.send(null);
}

// configure the app
var app = new Vue({
    el: '#app',
    data: {
        message: ''
    },
    methods: {
        onJokeButtonClick: function() {
            getJoke();
        }
    }
});

xhr.onreadystatechange = function() {

    var DONE = 4; // readyState 4 means the request is done
    var OK = 200; // status 200 is a successful return

    if (xhr.readyState === DONE) {
        if (xhr.status === OK) {

            var response = "";

            if (xhr.responseText) {
				
				// try to parse the JSON response
                try {
                    response = JSON.parse(xhr.responseText);
                } catch (e) {
                    console.log("Error parsing the JSON response: ", e);
                    return;
                }
                
            } else {
                console.log("There is no response.");
                return;
            }

            // the joke is stored inside the value object with the joke property
            if (response && response.value && response.value.joke) {
                app.message = response.value.joke;
            }

        } else {
            // error sending the request
            console.log('Error: ' + xhr.status);
        }
    }
};

// when starting the app load a joke
getJoke();