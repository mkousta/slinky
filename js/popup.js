var token;
var defaultChannel;
var $info_el;
var channelNames = [];
var groupNames = [];

var getChannelsList = function(){
  return $.ajax({
    url: 'https://slack.com/api/channels.list',
    data: { token: token, exclude_archived: 1 }
  });
}

var getGroupsList = function(){
  return $.ajax({
    url: 'https://slack.com/api/groups.list',
    data: { token: token, exclude_archived: 1 }
  });
}

var getAutocompleteValues = function(){
  $.when(getChannelsList(), getGroupsList()).done(function(channelData, groupData){
    if(channelData[0].ok){
      for(var i=0; i<channelData[0].channels.length; i++){
        channelNames.push('#' + channelData[0].channels[i].name);
      }
    }
    else {
      console.log('could not get channels');
    }
    if(groupData[0].ok){
      for(var i=0; i<groupData[0].groups.length; i++){
        groupNames.push(groupData[0].groups[i].name);
      }
    } else {
      console.log('could not get groups');
    }
    $(document).trigger('gotAutompleteValues')
  })

}

var sendToChannel = function(message, recipient){
  chrome.tabs.query({active: true, currentWindow: true, highlighted: true}, function(tab) {
    var url = tab[0].url;

    var data = {
      token: token,
      channel: recipient,
      text: message ? message + " " + url : url,
      as_user: true
    }

    $.ajax({
      type: 'POST',
      url: 'https://slack.com/api/chat.postMessage',
      data: data,
      success: function(resp, status) {
        if(resp.ok){
         $info_el.html("sent");
        } else {
         $info_el.html(resp.error);
        }
      },
      error: function(resp) {
        $info_el.html("network error");
      }
    });
  });
}

var registerHandlers = function(){

  $('#share-with-team').click(function(e){
    e.preventDefault();
    if(defaultChannel){
      sendToChannel($("#message").val(), defaultChannel);
    } else {
      $info_el.html('no default channel');
    }
  });

  $('#share').click(function(e){
    e.preventDefault();
    var recipient = $("#recipient").val();
    if(recipient.length > 0){
      sendToChannel($("#message").val(), recipient)
    }
    else {
      $info_el.html("no recipient provided");
    }
  });

  $(document).on('gotAutompleteValues', function(){
    $('#recipient').autocomplete({
      lookup: channelNames.concat(groupNames),
      minChars: 2,
      appendTo: '.suggestions',
      lookupLimit: 12
    });
  });
}

$(document).ready(function() {
  $info_el = $("#info-message");

  chrome.storage.local.get(['token','channel'], function(data){
    token = data.token;
    defaultChannel = data.channel;
    registerHandlers();
    getAutocompleteValues();
  });

});
