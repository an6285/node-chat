var moment=require('moment');

var generateTypingMessage= (from) => {
  return {
    text:`${from} is typing .....`
  }
}

var generateMessage=(from,text) => {
  return {
    from,
    text,
    createdAt:moment().valueOf()
  };
};

var generateLocationMessage= (from , latitude , longitude )=>{
  return {
    from,
    url:`https://www.google.com/maps?q=${latitude},${longitude}`,
    createdAt:moment().valueOf()
  };
};

module.exports = {generateMessage,generateLocationMessage,generateTypingMessage};
