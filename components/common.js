const nothing = function(){};
const onError = function(err){
    console.log(err);
    alert(err.args[0]);
};

module.exports = {
    'nothing': nothing,
    'onError': onError,
};
