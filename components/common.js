const nothing = function(){};

const onError = function(err){
    console.log(err);
    alert(err.args[0]);
};

const setStateLater = function(component, newState, delay_ms){
    setTimeout(function(){component.setState(newState);}, delay_ms);
};

module.exports = {
    'nothing': nothing,
    'onError': onError,
    'setStateLater': setStateLater
};
