const Tooltip = ReactBootstrap.Tooltip,
      OverlayTrigger = ReactBootstrap.OverlayTrigger,
      C = require('./common');

/*
 * One of the cell where the seeds are put.
 * <Cell mine={true|false} gKey={'game.UUID.CELL_ID'}/>
 */
const Cell = React.createClass({
    hilight_timeout: 1500,

    /* Return first argument if cell is for our player or the second if adversary */
    side: function(if_mine, if_adversary){
        if (this.props.mine){
            return if_mine;
        }
        return if_adversary;
    },
    tooltip: function(){
        var text = this.side(
            "Click to play this cell",
            "This is an adversary cell, you cannot do anything");
        return <Tooltip>{text}</Tooltip>;
    },
    klass: function(){
        var cls = "col-xs-2 awale-cell " + this.side('mine', 'adversary');
        if (this.state.played){
            cls += " played";
        }
        if (this.state.taken){
            cls += " taken";
        }
        return cls;
    },
    getInitialState: function(){
        return {played: false, taken: false, value: this.props.value};
    },
    render: function(){
        return <OverlayTrigger placement={this.side('bottom', 'top')}
                               overlay={this.tooltip()}>
            <div className={this.klass()} onClick={this.onClick}>
                {this.state.value}
            </div>
        </OverlayTrigger>;
    },
    onClick: function(){
        if (this.props.mine){
            this.props.session.call(this.props.gKey + '.play')
                              .then(C.nothing, C.onError);
        }
    },
    onPlay: function(res){
        this.setState({played: true, value: res});
        C.setStateLater(this, {played: false}, this.hilight_timeout);
    },
    onTake: function(res){
        this.setState({taken: true, value: res});
        C.setStateLater(this, {taken: false}, this.hilight_timeout);
    },
    onUpdate: function(val){this.setState({value: val});},
    componentDidMount: function(){
        this.props.session.subscribe(this.props.gKey + '.play', this.onPlay);
        this.props.session.subscribe(this.props.gKey + '.take', this.onTake);
        this.props.session.subscribe(this.props.gKey, this.onUpdate);
    }
});

module.exports = Cell;
