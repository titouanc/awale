const ProgressBar = ReactBootstrap.ProgressBar;

const StatusBar = React.createClass({
    waitOtherPlayerBar: function(){
        return <ProgressBar active now={33}
                            label="Waiting for another player"/>;
    },
    waitOtherReadyBar: function(){
        return <ProgressBar active bsStyle="info" now={66}
                            label="You are not both ready"/>;
    },
    playingBar: function(){
        return <ProgressBar active bsStyle="warning" now={100}
                            label="Now playing !"/>;
    },
    finishedBar: function(){
        var style = "danger",
            text = "You lost !"
            me = this.props.game.players[this.props.game.me()].captures,
            other = this.props.game.players[this.props.game.adversary()].captures;
        if (me > other){
            style = "success";
            text = "You won !";
        } else if (me == other){
            style = "warning";
            text = "Drawn match !";
        }
        var caption = <strong>{text + " (" + me + '/' + other + ")"}</strong>;
        return <ProgressBar bsStyle={style} now={100} label={caption}/>;
    },
    bar: function(){
        if (this.props.game.finished) return this.finishedBar();
        else if (! this.props.game.complete()) return this.waitOtherPlayerBar();
        else if (! this.props.game.ready()) return this.waitOtherReadyBar();
        else return this.playingBar();
    },
    render: function(){
        return <div className="container status-bar">{this.bar()}</div>
    }
});

module.exports = StatusBar;
