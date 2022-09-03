chrome.runtime.onMessage.addListener((msg, sender, response) => {
    chrome.storage.sync.get('options', (data) => {
        var options = data.options;
        if (options != null && options.hasOwnProperty('console-log') && options['console-log'] == true){
            console.log(msg.url);
        }
    });

    if (msg.name == "GETDATA"){ // Standard call
        fetch(msg.url).then(function(res) {
            if (res.status !== 200) {
                response({response: null, url: null, status: res.status})
                return;
            }
            res.text().then(function(data) {
                response({response: data, url: res.url, status: res.status});
            });
        });

    }else if (msg.name == "GETWIKIDATA"){ // Wikidata
        fetch(msg.url).then(function(res) {
            if (res.status !== 200) {
                response({results: null, url: null, status: res.status})
                return;
            }
            res.json().then(function(data) {
                response({results: data.results, status: res.status});
            });
        });

    }else if (msg.name == "GETALDATA"){ // Anilist
        var query = msg.query;
        fetch(msg.url, 
            {
                url: msg.url,
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    accept: 'application/json'
                },
                data: JSON.stringify({
                    query,
                    variables: { id: msg.al_id }
                })
            }
            ).then(function(res) {
            try{
                res.json().then(function(data) {
                    if (data != null){
                        response({response: data, url: res.url, status: res.status, errors: data.errors});
                    }else{
                        response({response: null, url: null, status: res.status})
                    }
                });
            } catch{
                response({response: null, url: null, status: res.status})
            }
        });
    }else if (msg.name == "GETALDATA2"){ // Anilist
        var query = msg.query;
        fetch(msg.url, msg.options).then(function(res) {
            try{
                res.json().then(function(data) {
                    if (data != null){
                        response({response: data, url: res.url, status: res.status, errors: data.errors});
                    }else{
                        response({response: null, url: null, status: res.status})
                    }
                });
            } catch{
                response({response: null, url: null, status: res.status})
            }
        });

    }else if (msg.name == "JSON"){ // Standard JSON - used for CinemaScore
        fetch(msg.url).then(function(res) {
            if (res.status !== 200) {
                response({results: null, url: null, status: res.status})
                return;
            }
            res.json().then(function(data) {
                response({results: data, status: res.status});
            });
        });

    }

    return true;
});