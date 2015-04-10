;(function(window, document, chrome){

  'use strict';

  var sendToTeam = function(message){
    chrome.storage.local.get(function(options){
      var data = {
        token: options.token,
        channel: options.channel,
        text: message,
        as_user: true
      };

      var strData = '';
      for (var key in data) {
        if (strData !== '') {
          strData += '&';
        }
        strData += key + '=' + encodeURIComponent(data[key]);
      }

      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://slack.com/api/chat.postMessage', true);
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          console.log(xhr.responseText);
        }
      };
      xhr.send(strData);
    });
  };

  var onClickHandler = function(info){
    if(info.menuItemId === 'slwt'){
      sendToTeam(info.linkUrl);
    } else if(info.menuItemId === 'spwt'){
      sendToTeam(info.pageUrl);
    } else if(info.menuItemId === 'stwt'){
      sendToTeam(info.selectionText);
    }
  };

  chrome.runtime.onInstalled.addListener(function(){
    chrome.contextMenus.create({
      title: 'Share link with team',
      id:'slwt',
      contexts: ['link']
    });

    chrome.contextMenus.create({
      title: 'Share page with team',
      id:'spwt',
      contexts: ['page', 'link']
    });

    chrome.contextMenus.create({
      title: 'Share text with team',
      id:'stwt',
      contexts: ['selection']
    });
  });

  chrome.contextMenus.onClicked.addListener(onClickHandler);

})(window, document, chrome);
