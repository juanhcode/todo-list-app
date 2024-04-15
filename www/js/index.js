document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
}

document.addEventListener('init', function(event) {

    var page = event.target;
  
    if (page.id === 'page1') {
      page.querySelector('#push-button').onclick = function() {
        document.querySelector('#myNavigator').pushPage('page2.html', 
        {data: {title: 'Page 2', myData: JSON.stringify({"first":"primer dato"})}});
      };
    }
    else if (page.id === 'page2') {
      console.log(page.data);
      page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
    }
    else if (page.id === 'page3') {
      page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
    }
});
