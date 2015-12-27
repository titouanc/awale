const gameFromState = function(myUsername, state){
    return {
        players: state.players,
        hand: state.hand,
        grid: state.grid,
        finished: state.finished,
        p: function(attr){
            return [this.players[0][attr], this.players[1][attr]];
        },
        me: function(){
            for (var i=0; i<2; i++){
                if (this.players[i].username == myUsername){
                    return i;
                }
            }
            throw new Exception("Not playing !");
        },
        adversary: function(){return 1 - this.me();},
        mySelf: function(){
            return this.players[this.me()];
        },
        complete: function(){
            var p = this.p('username');
            return p[0] && p[1];
        },
        ready: function(){
            var p = this.p('ready');
            return p[0] && p[1];
        }
    };
};

const initialGame = function(myUsername){
    return gameFromState(myUsername, {
        finished: false,
        hand: 0,
        grid: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        players: [
            {username: null, captures: 0, ready: false, surrender: false},
            {username: null, captures: 0, ready: false, surrender: false}
        ]
    });
};

module.exports = {
    'initial': initialGame,
    'fromState': gameFromState
};
