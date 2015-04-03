
var getOptions = function(){
  chrome.storage.local.get(function(data){
    if(data.token){
      $('#token').val(data.token)
    }
    if(data.channel){
      $('#channel').val(data.channel)
    }
  });
}

var clearOptions = function(){
  chrome.storage.local.clear(function(data){
    $('#token').val('')
    $('#channel').val('')
  });
}

var saveOptions = function(token, channel, $success_el){
  chrome.storage.local.set({
    'token': token,
    'channel': channel
  }, function(data){
    $success_el.fadeIn();
  });
}

var checkToken = function(token) {
  return $.ajax({
    type: 'GET',
    url: 'https://slack.com/api/auth.test',
    data: { token: token }
  });
}

$(document).ready(function(){
  var $info_el = $("#info-message");

  getOptions();

  $("#save").click(function(e){
    e.preventDefault();
    saveOptions($("#token").val(), $("#channel").val(), $(this).find('.icon'));
  });

  $("#clear").click(function(e){
    e.preventDefault();
    clearOptions();
  });

  $("#check").click(function(e){
    e.preventDefault();
    $success_el = $(this).find('.icon');

    checkToken($("#token").val()).then(function(resp){
      if(resp.ok){
        $success_el.fadeIn()
      }
      else{
        $info_el.find('.icon').show()
        $info_el.find('span').text(resp.error.replace(/_/g, ' '));
      }
    }).fail(function(){
      $info_el.find('span').text('network error');
    });
  });

  $('input').on('keyup', function(){
    $('.icon').hide();
    $('span').text('');
  })

});
