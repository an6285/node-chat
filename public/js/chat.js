var socket=io();

function scrollToBottom() {

  var messages = jQuery('#messages');
  var newMessage=messages.children('li:last-child');
  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight=newMessage.innerHeight();
  var lastMessageHeight=newMessage.prev().innerHeight();

  if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >=scrollHeight){
    console.log(scroll);
    messages.scrollTop(scrollHeight);
  }
};

socket.on('connect',function(){
  var params = jQuery.deparam(window.location.search);

  socket.emit('join', params , function(err){
    if (err) {
      alert(err);
      window.location.href = '/';
    }
    else {
      console.log('No error');
    }
  });
});

socket.on('disconnect',function(){
  console.log('Disconnected from server');
});

socket.on('updateUserList',function (users) {
  var ol=jQuery('<ol></ol>');
  users.forEach( function( user) {
    ol.append(jQuery('<li></li>').text(user));
  });
  jQuery('#users').html(ol);
});

socket.on('newMessage',function(message){
  jQuery('#feedback').html('');
  jQuery('#feedback').hide();
  var formattedTime=moment(message.createdAt).format('h:mm a');
  var template=jQuery('#message-template').html();
  var html=Mustache.render(template,{
    text:message.text,
    from:message.from,
    createdAt:formattedTime
  });

  jQuery('#messages').append(html);
  scrollToBottom();

});

socket.on('newLocationMessage',function(message){

  jQuery('#feedback').html('');
  jQuery('#feedback').hide();
  var formattedTime=moment(message.createdAt).format('h:mm a');
  var template=jQuery('#location-message-template').html();
  var html=Mustache.render(template,{
    from:message.from,
    url:message.url,
    createdAt:formattedTime
  });

  jQuery('#messages').append(html);
  scrollToBottom();
});

socket.on('newTypingMessage',function(message){
  jQuery('#feedback').show();
  var template=jQuery('#typing-message-template').html();
  var html=Mustache.render(template,{
    text:message.text
  });
  jQuery('#feedback').html(html);
  scrollToBottom();
});


jQuery('#message-form').on('submit',function(e){
  e.preventDefault();

  var messageTextbox=jQuery('[name=message]');
  socket.emit('createMessage',{
    //from:'User',
    text:messageTextbox.val()
  },function(){
    messageTextbox.val('');
  });
});

jQuery('[name=message]').on('keypress',function(){
  socket.emit('typing');
});

var locationButton = jQuery('#send-location');

locationButton.on('click',function(){
  if(!navigator.geolocation) {
    return alert('Geolocation not supported By Browser');
  }
  else {
    locationButton.attr('disabled','disabled').text('Sending location...');
    navigator.geolocation.getCurrentPosition(function (position) {
      locationButton.removeAttr('disabled').text('Send Location');
      socket.emit('createLocationMessage',{
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    } ,function(){
      locationButton.removeAttr('disabled').text('Send Location');
      alert('Unable to fetch Location');
    });
  }
});
