const C = require('./common'),
      Cell = require('./cell'),
      SurrenderButton = require('./surrenderbutton'),
      StatusBar = require('./statusbar'),
      Game = require('./game'),
      Board = require('./board');

const Grid = ReactBootstrap.Grid,
      Row = ReactBootstrap.Row,
      Col = ReactBootstrap.Col;

const Awale = React.createClass({
    getInitialState: function(){
        return {key: undefined, game: Game.initial(this.props.username)};
    },
    render: function(){
        return <Grid>
            <Row>
                <StatusBar game={this.state.game}/>
            </Row>
            <Row>
                <Board game={this.state.game} gameKey={this.state.key} {...this.props}/>
            </Row>
        </Grid>
    },
    onUpdate: function(newState){
        this.setState({game: Game.fromState(this.props.username, newState)});
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
