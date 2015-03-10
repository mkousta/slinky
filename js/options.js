var $info_el;

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

  $("#save").click(function(e){
    e.preventDefault();
    saveOptions($("#token").val(), $("#channel").val());
  });

  $("#check").click(function(e){
    e.preventDefault();
    checkToken($("#token").val());
  });
});
