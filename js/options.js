var $info_el;

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

var saveOptions = function(token, channel){
  chrome.storage.local.set({
    'token': token,
    'channel': channel
  }, function(data){
    $info_el.html('ok');
  });
}

var checkToken = function(token) {
  $.ajax({
    type: 'GET',
    url: 'https://slack.com/api/auth.test',
    data: { token: token },
    success: function(resp, status) {
      if(resp.ok){
       $info_el.html("token ok");
      } else {
       $info_el.html(resp.error);
      }
    },
    error: function(resp) {
      $info_el.html("network error");
    }
  });
}

$(document).ready(function(){
  $info_el = $("#info-message");

  getOptions();

  $("#save").click(function(e){
    e.preventDefault();
    saveOptions($("#token").val(), $("#channel").val());
  });

  $("#clear").click(function(e){
    e.preventDefault();
    clearOptions();
  });

  $("#check").click(function(e){
    e.preventDefault();
    checkToken($("#token").val());
  });
});
