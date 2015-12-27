const Row = ReactBootstrap.Row,
      Col = ReactBootstrap.Col,
      Grid = ReactBootstrap.Grid,
      Label = ReactBootstrap.Label,
      Cell = require('./cell'),
      SurrenderButton = require('./surrenderbutton');

/* Like React.createClass, but for player specific components */
const sidedCreateClass = function(obj){
    obj.playerNo = function(){
        if (this.props.mine){return this.props.game.me();}
                       else {return this.props.game.adversary();}
    };
    obj.player = function(){
        return this.props.game.players[this.playerNo()];
    };
    obj.who = function(){
        if (this.props.mine){return "Me";} 
                       else {return "Adversary";}
    };

    return React.createClass(obj);
};

const ScoreZone = sidedCreateClass({
    turnLabel: function(){
        if (this.props.mine && this.props.game.hand == this.playerNo()){
            return <Label bsStyle="success">This is your turn</Label>;
        } else {
            return "";
        }
    },
    render: function(){
        return <h3>
            {this.player().username}&nbsp;
            <small>
                {this.who()}
            </small>&nbsp;
            <Label bsStyle="info">
                Score: {this.player().captures}
            </Label>&nbsp;
            {this.turnLabel()}
        </h3>;
    }
});

const PlayerRow = sidedCreateClass({
    playerRow: function(){
        var player = this.playerNo();
        return this.props.game.grid.slice(6*player, 6*(player+1));
    },
    render: function(){
        var row = this.playerRow().map(function(cell, i){
            var key = this.props.gameKey + '.' + (6*this.playerNo() + i);
            return <Cell {...this.props} value={cell} cellKey={key}/>;
        }.bind(this));
        if (! this.props.mine){
            row = row.reverse();
        }
        return <Row className="awale-row">{row}</Row>;
    }
});

const Board = React.createClass({
    render: function(){
        if (this.props.game.finished){
            return <Grid>
                <center><img alt="Finished..." src="/img/end.jpg"/></center>
            </Grid>;
        }
        if (! this.props.game.ready()){
            return <Grid>
                <center><img alt="Waiting..." src="/img/loading.gif"/></center>
            </Grid>;
        }
        console.log('Rendering board !');
        return <Grid className="awale-board">
            <ScoreZone game={this.props.game}/>
            <PlayerRow {...this.props}/>
            <PlayerRow {...this.props} mine/>
            <ScoreZone game={this.props.game} mine/>
            <Row>
                <Col xs={6} pushXs={6}>
                    <SurrenderButton {...this.props}/>
                </Col>
            </Row>
        </Grid>;
    },
});

module.exports = Board;
