const OverlayTrigger = ReactBootstrap.OverlayTrigger,
      Tooltip = ReactBootstrap.Tooltip;

const SurrenderButton = React.createClass({
    otherActive: function(){
        return this.props.game.players[this.props.game.adversary()].surrender;
    },
    isActive: function(){
        return this.props.game.mySelf().surrender;
    },
    onClick: function(){
        if (this.isActive()){return;}
        var session = this.props.session,
            key = this.props.gameKey,
            username = this.props.game.mySelf().username;
        session.call(key + '.surrender', [username]);
    },
    tooltip: function(){
        return <Tooltip>This is an endless game, I want to surrender</Tooltip>;
    },
    render: function(){
        var klass = "btn ";
        if (this.otherActive()){klass += "btn-primary";}
                          else {klass += "btn-default";}
        if (this.isActive()){klass += " disabled";}
        return <OverlayTrigger overlay={this.tooltip()}>
            <div className={klass} onClick={this.onClick}>
                Abort game
            </div>
        </OverlayTrigger>;
    }
});

module.exports = SurrenderButton;
