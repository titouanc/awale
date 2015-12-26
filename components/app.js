var Awale = require('./awale');

const USERNAME_COOKIE = 'username';

const getUsername = function(){
    var res = Cookies.get(USERNAME_COOKIE);
    if (! res){
        while (! res){
            res = prompt("Choose a username");
        }
        Cookies.set(USERNAME_COOKIE, res);
    }
    return res;
};

const reload = function(){
    if (confirm("WARNING: You will leave the current game ! Continue ?")){
        window.location.reload();
    }
}

$(document).ready(function(){
    var my_username = getUsername();

    $('.reset-username').click(function(ev){
        Cookies.remove(USERNAME_COOKIE);
        reload();
    });
    $('.new-game').click(function(ev){
        reload();
    });

    var url;
    try {
        url = WAMP_ENDPOINT;
    } catch (err) {
        url = 'ws://127.0.0.1:8080/ws';
    }
    var connection = new autobahn.Connection({
        url: url,
        realm: 'awale'
    });

    connection.onopen = function(session){
        console.log("Connected to " + url + " !");
        ReactDOM.render(
            <Awale username={my_username} session={session}/>,
            document.getElementById('app'));
    };

    connection.open();
});
