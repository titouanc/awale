const Tooltip = ReactBootstrap.Tooltip,
      OverlayTrigger = ReactBootstrap.OverlayTrigger,
      ProgressBar = ReactBootstrap.ProgressBar,
      Badge = ReactBootstrap.Badge,
      Label = ReactBootstrap.Label,
      C = require('./common'),
      Cell = require('./cell');

const SurrenderButton = React.createClass({
    otherActive: function(){
        return this.props.game.state.players[this.props.game.adversary()].surrender;
    },
    isActive: function(){
        return this.props.game.state.players[this.props.game.me()].surrender;
    },
    onClick: function(){
        if (this.isActive()){return;}
        var session = this.props.game.props.session,
            key = this.props.game.state.key,
            username = this.props.game.props.username;
        session.call(key + '.surrender', [username]);
    },
    render: function(){
        var klass = "btn ";
        if (this.otherActive()){klass += "btn-primary";}
                          else {klass += "btn-default";}
        if (this.isActive()){klass += " disabled";}
        return <div className={klass} onClick={this.onClick}>
            This is an endless game, I want to surrender
        </div>;
    }
});

const Awale = React.createClass({
    getInitialState: function(){
        return {
            hand: 0,
            grid: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            players: [
                {username: null, captures: 0, ready: false},
                {username: null, captures: 0, ready: false}
            ]
        };
    },
    me: function(){
        for (var i=0; i<2; i++)
            if (this.state.players[i].username == this.props.username)
                return i;
        throw new Exception("You do not appear in this game !");
    },
    adversary: function(){
        return 1 - this.me();
    },
    playerRow: function(player){
        var lower = 6*player,
            upper = 6*(player+1),
            row = this.state.grid.slice(lower, upper),
            content = '', sess = this.props.session;

        if (player == this.me()){
            content = row.map(function(cell, i){
                var key = this.state.key + '.' + (6*this.me()+i);
                return <Cell value={cell} session={sess} gKey={key} mine={true}/>;
            }.bind(this));
        } else {
            content = row.map(function(cell, i){
                var key = this.state.key + '.' + (6*this.adversary()+i);
                return <Cell value={cell} session={sess} gKey={key} mine={false}/>;
            }.bind(this)).reverse();
        }
        return <div className="row awale-row">{content}</div>
    },
    complete: function(){
        return this.state.players[0].username && this.state.players[1].username;
    },
    ready: function(){
        return this.state.players[0].ready && this.state.players[1].ready;
    },
    render: function(){
        if (! this.complete()){
            return <div className="container"> 
                <ProgressBar active now={33}
                             label="Waiting for another player"/>
            </div>;
        }
        if (! this.ready()){
            return <div className="container">
                <ProgressBar active bsStyle="info" now={66} 
                             label="You are not both ready"/>
            </div>;
        }
        if (this.state.finished){
            var style = "danger",
                text = "You lost !"
                me = this.state.players[this.me()].captures,
                other = this.state.players[this.adversary()].captures;
            if (me > other){
                style = "success";
                text = "You won !";
            } else if (me == other){
                style = "warning";
                text = "Drawn match !";
            }
            return <div className="container">
                <ProgressBar bsStyle={style} now={100}
                             label={text + " (" + me + '/' + other + ")"}/>
            </div>;
        }
        var myTurn = "";
        if (this.me() == this.state.hand){
            myTurn = <Label bsStyle="success">This is your turn !</Label>;
        }
        return <div className="container awale-board">
            <div className="row">
                <h3>
                    {this.state.players[this.adversary()].username}&nbsp;
                    <small>Adversary</small>&nbsp;
                    <Label>
                        score: {this.state.players[this.adversary()].captures}
                    </Label>
                </h3>
            </div>
            {this.playerRow(this.adversary())}
            {this.playerRow(this.me())}
            <div className="row">
                <div className="col-xs-6">
                    <h3>
                        {this.state.players[this.me()].username}&nbsp;
                        <small>You</small>&nbsp;
                        <Label>
                            score: {this.state.players[this.me()].captures}
                        </Label>&nbsp;
                        {myTurn}
                    </h3>
                </div>
                <div className="col-xs-6">
                    <SurrenderButton game={this}/>
                </div>
            </div>
        </div>;
    },
    onUpdate: function(newState){
        this.setState(newState);
    },
    onKey: function(newKey){
        this.setState({key: 'game.' + newKey});
        console.log("My ID is " + this.state.key);
        this.props.session.subscribe(this.state.key, function(res){
            this.onUpdate(res[0]);
        }.bind(this));
        this.props.session.call(this.state.key+'.state').then(function(newState){
            this.onUpdate(newState);
            this.props.session.call(this.state.key+'.ready', [this.props.username])
                              .then(function(){console.log("I am now ready");},
                                    C.onError);
        }.bind(this), C.onError);
    },
    componentDidMount: function(){
        var args = [this.props.username];
        this.props.session.call('join_game', args).then(this.onKey, C.onError);
    }
});

module.exports = Awale;
