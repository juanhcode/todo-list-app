document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
  console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
  document.getElementById('deviceready').classList.add('ready');
}

document.addEventListener('init', function (event) {
  let page = event.target;

  let onSuccess = function (position) {
    alert('Latitude: ' + position.coords.latitude + '\n' +
      'Longitude: ' + position.coords.longitude);
  };

  // onError Callback receives a PositionError object
  //
  function onError(error) {
    alert('code: ' + error.code + '\n' +
      'message: ' + error.message + '\n');
  }
  // Uso de Geolocation
  navigator.geolocation.getCurrentPosition(onSuccess, onError);

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
      if (user_name === "" || password === "" || email_address === "") {
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
        if (response.status === 201) {
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
    let colorPcik = page.querySelector('.pickColor');
    colorPcik.addEventListener('click', () => {
      console.log("Holaaa");
    });
    page.querySelector('#submitSignIn').onclick = async () => {
      let email_address = page.querySelector('#fieldEmail').value;
      let password = page.querySelector('#fieldPassword').value;
      if (email_address === "" || password === "") {
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
          localStorage.setItem('token', data.token);
          document.querySelector('#myNavigator').pushPage('page4.html');
        } else {
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
    navigator.geolocation.getCurrentPosition(function (position) {
      let latitude = position.coords.latitude;
      let longitude = position.coords.longitude;
      initMap(latitude, longitude, "Tulua");
    }, function (error) {
      alert("Error al obtener la ubicación actual: " + error.message);
    });
    
    async function initMap(lat, lng, title) {
      let map;
      let marker; // Reference to the current marker
      const { Map } = await google.maps.importLibrary("maps");
      // The map, centered at the position
      map = new Map(document.getElementById("map"), {
        zoom: 50,
        center: { lat, lng },
        mapId: "DEMO_MAP_ID",
      });

      // Add click event listener
      map.addListener("click", function (e) {
        placeMarkerAndPanTo(e.latLng, map);
      });

      async function placeMarkerAndPanTo(latLng, map) {
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
        // If a marker already exists, remove it
        if (marker) {
          marker.setMap(null);
        }
        // Create a new marker
        marker = new AdvancedMarkerElement({
          position: latLng,
          map: map
        });
        // Pan the map to the new marker
        map.panTo(latLng);
        console.log("Latitude: " + latLng.lat() + ", Longitude: " + latLng.lng());
      }
    }

    page.querySelector('.pushMyNotes').onclick = async () => {
      document.querySelector('#myNavigator').pushPage('page5.html');
      try {
        const response = await fetch('https://api-todo-list-ta8f.onrender.com/v1/task/all/1', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (response.status === 200) {
          const listToday = document.querySelector('.list-today');
          const fecha = new Date();
          const year = fecha.getFullYear();
          const month = fecha.getMonth() + 1;
          const day = fecha.getDate();
          const date = `${year}-0${month}-${day}`;
          for (let i = 0; i < data.length; i++) {
            const note = data[i];
            const formatDate = note.reminder.split("T")[0];
            //HOY
            if (date == formatDate) {
              listToday.innerHTML += `<ons-list-item tappable>${note.notes}</ons-list-item>`;
            }
            //HACE 7 DIAS
            if ((diferenciaDias(date, formatDate) <= 7) && (date != formatDate) && (diferenciaDias(date, formatDate) >= 1)) {
              const listWeek = document.querySelector('.list-preview7');
              listWeek.innerHTML += `<ons-list-item tappable>${note.notes}</ons-list-item>`;
            }
            //HACE 30 DIAS
            if ((diferenciaDias(date, formatDate) > 7) && (date != formatDate) && (diferenciaDias(date, formatDate) <= 30)) {
              const listWeek = document.querySelector('.list-preview30');
              listWeek.innerHTML += `<ons-list-item tappable>${note.notes}</ons-list-item>`;
            } else if ((diferenciaDias(date, formatDate) > 30) && (date != formatDate)) {
              const listWeek = document.querySelector('.list-month');
              listWeek.innerHTML += `<ons-list-item tappable>${note.notes}</ons-list-item>`;
            }
          };
        }
      } catch (error) {
        ons.notification.alert("Ups! Algo salió mal");
      }
    }
  } else if (page.id === 'page5') {
    page.querySelector('.buttonAdd').onclick = async () => {
      document.querySelector('#myNavigator').pushPage('page4.html');
    }
  }
});


const diferenciaDias = (fecha1, fecha2) => {
  let fechaInicio = new Date(fecha1).getTime();
  let fechaFin = new Date(fecha2).getTime();
  let diff = fechaFin - fechaInicio;
  return diff / (1000 * 60 * 60 * 24) * -1;
}
