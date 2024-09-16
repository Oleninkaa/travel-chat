const moment = require('moment');


function formatMessage(username, text, type){
    
    return{
        username,
        text,
        time: moment().format('h:mm a'),
        type: type
    }
    
}

module.exports = formatMessage;