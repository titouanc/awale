const Tooltip = ReactBootstrap.Tooltip,
      OverlayTrigger = ReactBootstrap.OverlayTrigger,
      ProgressBar = ReactBootstrap.ProgressBar,
      Badge = ReactBootstrap.Badge;


const nothing = function(){};
const onError = function(err){
    console.log(err);
    alert(err.args[0]);
};

const Cell = React.createClass({
    tooltip: <Tooltip>Click to play this cell</Tooltip>,
    onClick: function(){
        if (this.props.mine){
            this.props.session.call(this.props.gKey + '.play')
                              .then(nothing, onError);
        }
    },
    getInitialState: function(){return {played: false, taken: false};},
    render: function(){
        var klass = "col-xs-2 awale-cell " + (this.props.mine ? "mine" : "adversary");
        if (this.state.played){
            klass += " played";
        }
        if (this.state.taken){
            klass += " taken"
        }
        return <OverlayTrigger placement="bottom" overlay={this.tooltip}>
            <div className={klass} onClick={this.onClick}>
                {this.props.value}
            </div>
        </OverlayTrigger>;
    },
    onPlay: function(res){
        this.setState({played: true});
        setTimeout(
            function(){this.setState({played: false});}.bind(this), 
            1000);
    },
    onTake: function(res){
        this.setState({taken: true});
        setTimeout(
            function(){this.setState({taken: false});}.bind(this), 
            1000);
    },
    componentDidMount: function(){
        this.props.session.subscribe(this.props.gKey + '.play', this.onPlay);
        this.props.session.subscribe(this.props.gKey + '.take', this.onTake);
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
                <ProgressBar active now={33} label="Waiting for another player"/>
            </div>;
        }
        if (! this.ready()){
            return <div className="container">
                <h3>Are you ready ?</h3>
                <ProgressBar bsStyle="info" now={66} label="You are not both ready"/>;
            </div>;
        }
        var res = <div className="container awale-board">
            <div className="row">
                <h3>
                    {this.state.players[this.adversary()].username}&nbsp;
                    <small>Adversary</small>&nbsp;
                    <Badge>
                        {this.state.players[this.adversary()].captures}
                    </Badge>
                </h3>
            </div>
            {this.playerRow(this.adversary())}
            {this.playerRow(this.me())}
            <div className="row">
                <h3>
                    {this.state.players[this.me()].username}&nbsp;
                    <small>You</small>&nbsp;
                    <Badge>
                        {this.state.players[this.me()].captures}
                    </Badge>
                </h3>
            </div>
        </div>;
        return res;
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
                                    onError);
        }.bind(this), onError);
    },
    componentDidMount: function(){
        var args = [this.props.username];
        this.props.session.call('join_game', args).then(this.onKey, onError);
    }
});

module.exports = Awale;
