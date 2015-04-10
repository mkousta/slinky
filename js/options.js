;(function(window, document, $, chrome){

  'use strict';

  var getSavedOptions = function(){
    var dfd = $.Deferred();
    chrome.storage.local.get(function(data){
      dfd.resolve(data);
    });
    return dfd;
  };

  var clearOptions = function(){
    var dfd = $.Deferred();
    chrome.storage.local.clear(function(){
      dfd.resolve();
    });
    return dfd;
  };

  var saveOptions = function(token, channel){
    var dfd = $.Deferred();
    chrome.storage.local.set({
      'token': token,
      'channel': channel
    }, function(){
      dfd.resolve();
    });
    return dfd;
  };

  var checkToken = function(token) {
    return $.ajax({
      type: 'GET',
      url: 'https://slack.com/api/auth.test',
      data: { token: token }
    });
  };

  var humanize = function(str){
    return str.replace(/_/g, ' ');
  };

  $(document).ready(function(){

    //Cache Elements
    var $info_el = $('#info-message');
    var $info_icon = $info_el.find('.icon');
    var $info_text = $info_el.find('span');
    var $token_el = $('#token');
    var $channel_el = $('#channel');

    //Get saved option and show their values in input elements
    getSavedOptions().then(function(data){
      if(data.token){
        $token_el.val(data.token);
      }
      if(data.channel){
        $channel_el.val(data.channel);
      }
    });

    //Register Handlers
    $('#save').click(function(e){
      e.preventDefault();
      var $success_el = $(this).find('.icon');

      saveOptions($token_el.val(), $channel_el.val()).done(function(){
        $success_el.fadeIn();
      });
    });

    $('#clear').click(function(e){
      e.preventDefault();
      clearOptions().then(function(){
        $token_el.val('');
        $channel_el.val('');
      });
    });

    $('#check').click(function(e){
      e.preventDefault();
      var $success_el = $(this).find('.icon');

      checkToken($token_el.val()).done(function(resp){
        if(resp.ok){
          $success_el.fadeIn();
        }
        else{
          $info_icon.show();
          $info_text.text(humanize(resp.error));
        }
      }).fail(function(){
        $info_text.text('network error');
      });
    });

    $('input').on('keyup', function(){
      $('.icon-exclamation-circle, .icon-check').hide();
      $info_text.text('');
    });

    $('#help').click(function(e){
      e.preventDefault();
      $('#help-contents').toggle();
    });

  });

})(window, document, jQuery, chrome);
