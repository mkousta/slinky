;(function(window, document, $, chrome){

  'use strict';

  var token;
  var defaultChannel;
  var channelNames = [];
  var groupNames = [];
  var userNames = [];
  var userIds = [];

  var getChannelsList = function(){
    return $.ajax({
      url: 'https://slack.com/api/channels.list',
      data: { token: token, exclude_archived: 1 }
    });
  };

  var getGroupsList = function(){
    return $.ajax({
      url: 'https://slack.com/api/groups.list',
      data: { token: token, exclude_archived: 1 }
    });
  };

  var getUsersList = function(){
    return $.ajax({
      url: 'https://slack.com/api/users.list',
      data: { token: token }
    });
  };

  var getAutocompleteValues = function(){
    $.when(getChannelsList(), getGroupsList(), getUsersList()).done(function(channelData, groupData, userData){
      var i;
      if(channelData[0].ok){
        for(i=0; i<channelData[0].channels.length; i++){
          channelNames.push('#' + channelData[0].channels[i].name);
        }
      }

      if(groupData[0].ok){
        for(i=0; i<groupData[0].groups.length; i++){
          groupNames.push(groupData[0].groups[i].name);
        }
      }

      if(userData[0].ok){
        for(i=0; i<userData[0].members.length; i++){
          userNames.push(userData[0].members[i].name);
          userIds.push(userData[0].members[i].id);
        }
      }
      $(document).trigger('gotAutompleteValues');
    });
  };

  var postMessage = function(message, recipient){
    var dfd = $.Deferred();

    chrome.tabs.query({active: true, currentWindow: true, highlighted: true}, function(tab) {
      var url = tab[0].url;

      var data = {
        token: token,
        channel: recipient,
        text: message ? message + ' ' + url : url,
        as_user: true
      };

      $.ajax({
        type: 'POST',
        url: 'https://slack.com/api/chat.postMessage',
        data: data,
        success: function(resp) {
          dfd.resolve(resp);
        },
        error: function() {
          dfd.reject();
        }
      });
    });
    return dfd;
  };

  var openImAndPost = function(message, recipient){
    var dfd = $.Deferred();
    var indexOfUser = userNames.indexOf(recipient);

    if(indexOfUser > -1) {
      $.ajax({
        type: 'POST',
        url: 'https://slack.com/api/im.open',
        data: { token: token, user: userIds[indexOfUser] },
        success: function(resp) {
          dfd.resolve(resp);
        },
        error: function() {
          dfd.reject();
        }
      });

      dfd.done(function(resp){
        if(resp.ok){
          return postMessage(message, resp.channel.id);
        }
      });
      return dfd;
    }
    else {
      return postMessage(message, recipient);
    }
  };

  var showInfoMessage = function($el, message){
    $el.find('.icon').show();
    $el.find('span').text(message);
  };

  var registerHandlers = function(){

    var $message_input_el = $('#message');
    var $recipient_input_el = $('#recipient');
    var $team_info_el = $('#team-info-message');
    var $info_el = $('#info-message');

    $('#share-with-team').click(function(e){
      e.preventDefault();

      var $success_el = $(this).find('.icon');

      if(defaultChannel){
        postMessage($message_input_el.val(), defaultChannel)
          .done(function(resp){
            if(resp.ok){
              $success_el.fadeIn();
            } else {
              showInfoMessage($team_info_el, resp.error.replace(/_/g, ' '));
            }
          })
          .fail(function(){
            showInfoMessage($team_info_el, 'network error');
          });
      } else {
        showInfoMessage($team_info_el, 'set your team\'s channel');
      }
    });

    $('#share').click(function(e){
      e.preventDefault();

      var $success_el = $(this).find('.icon');
      var recipient = $recipient_input_el.val();

      if(recipient.length > 0){
        openImAndPost($message_input_el.val(), recipient)
          .done(function(resp){
            if(resp.ok){
              $success_el.fadeIn();
            } else {
              showInfoMessage($info_el, resp.error.replace(/_/g, ' '));
            }
          })
          .fail(function(){
            showInfoMessage($info_el, 'network error');
          });
      }
      else {
        $recipient_input_el.focus();
      }
    });

    $recipient_input_el.on('keyup', function(){
      $info_el.find('.icon').hide();
      $info_el.find('span').text('');
      $('#share').find('.icon').hide();
    });

    $message_input_el.on('keyup', function(){
      $info_el.find('.icon').hide();
      $info_el.find('span').text('');
      $team_info_el.find('.icon').hide();
      $team_info_el.find('span').text('');
      $('#share').find('.icon').hide();
      $('#share-with-team').find('.icon').hide();
    });

    $(document).on('gotAutompleteValues', function(){
      $recipient_input_el.autocomplete({
        lookup: channelNames.concat(groupNames).concat(userNames),
        minChars: 2,
        appendTo: '.suggestions',
        lookupLimit: 11
      });
    });
  };

  var updateUrlsOfOptionsLinks = function(){
    $('.js-options').each(function(){
      $(this).attr('href', chrome.extension.getURL('options.html'));
    });
  };

  $(document).ready(function() {

    updateUrlsOfOptionsLinks();

    chrome.storage.local.get(['token','channel'], function(data){
      token = data.token;
      defaultChannel = data.channel;

      if(token!==undefined && token!==''){
        //Normal Flow
        registerHandlers();
        getAutocompleteValues();
      } else {
        //First Time Flow
        $('section').not('#first-time').hide();
        $('#first-time').show();
      }
    });

  });

})(window, document, jQuery, chrome);
