document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
  console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
  document.getElementById('deviceready').classList.add('ready');
  console.log("navigator.geolocation works well");
}

function getGeolocalization() {
var onSuccess = function(position) {
  alert('Latitude: '          + position.coords.latitude          + '\n' +
        'Longitude: '         + position.coords.longitude         + '\n' +
        'Altitude: '          + position.coords.altitude          + '\n' +
        'Timestamp: '         + position.timestamp                + '\n');
};

function onError(error) {
  alert('code: '    + error.code    + '\n' +
        'message: ' + error.message + '\n');
}

navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

document.addEventListener('init', function (event) {

  var page = event.target;

  if (page.id === 'page1') {
    page.querySelector('#push-button').onclick = function () {
      document.querySelector('#myNavigator').pushPage('page2.html',
        { data: { title: 'Page 2', myData: JSON.stringify({ "first": "primer dato" }) } });
    };
  }
  else if (page.id === 'page2') {
    page.querySelector('#submit').onclick = async () => {
      let user_name = page.querySelector('#username').value;
      let password = page.querySelector('#password').value;
      let email_address = page.querySelector('#email').value;
      if(user_name === "" || password === "" || email_address === ""){
        ons.notification.alert("Debe llenar todos los campos");
        return;
      }
      const User = {
        user_name,
        password,
        email_address
      }
      try {
        const response = await fetch('https://api-todo-list-ta8f.onrender.com/v1/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(User)
        });
        const data = await response.json();
        if(response.status === 201){
          ons.notification.confirm(data.message);
          page.querySelector('#username').value = '';
          page.querySelector('#password').value = '';
          page.querySelector('#email').value = '';
        }
        
      } catch (error) {
        console.log(error);
      }

    };
    page.querySelector('.signIn').onclick = () => {
      document.querySelector('#myNavigator').pushPage('page3.html');
    }
  }
  else if (page.id === 'page3') {
    page.querySelector('#submitSignIn').onclick = async () => {
      let email_address = page.querySelector('#fieldEmail').value;
      let password = page.querySelector('#fieldPassword').value;
      if(email_address === "" || password === ""){
        ons.notification.alert("Debe llenar todos los campos");
        return;
      }
      const User = {
        email_address,
        password
      }
      try {
        const response = await fetch('https://api-todo-list-ta8f.onrender.com/v1/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(User)
        });
        const data = await response.json();
        if (response.status === 200) {
          console.log(data);
          document.querySelector('#myNavigator').pushPage('page4.html');    
        }else{
          ons.notification.alert(data.msg);
        }
      } catch (error) {
        ons.notification.alert("Ups! Algo salió mal");
      }

    }
    page.querySelector('.signUp').onclick = () => {
      document.querySelector('#myNavigator').pushPage('page2.html');
      console.log("IR");
    }
   }
   else if (page.id === 'page4') {
    page.querySelector('.pushMyNotes').onclick = () => {
      document.querySelector('#myNavigator').pushPage('page5.html');
      console.log("IR");
    }

    page.querySelector('.getLocation').onclick = () => {
      getGeolocalization();
      console.log("OBTENIENDO UBICACIÓN");
    }
   }
});
