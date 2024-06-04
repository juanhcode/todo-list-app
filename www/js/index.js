document.addEventListener('deviceready', onDeviceReady, false);
//AIzaSyBNaC5Le8TROOyNcI8m0ywToNIuuktAh7Y
function onDeviceReady() {
  console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
  document.getElementById('deviceready').classList.add('ready');
}

document.addEventListener('init', function (event) {
  let page = event.target;

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
        return error;
      }

    };
    page.querySelector('.signIn').onclick = () => {
      document.querySelector('#myNavigator').pushPage('page3.html');
    }
  }
  else if (page.id === 'page3') {
    let colorPcik = page.querySelector('.pickColor');
    colorPcik.addEventListener('click', () => {

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
    let latitud = 0;
    let longitud = 0;
    async function initMap(lat, lng, title) {
      let map;
      let marker; // Reference to the current marker
      const { Map } = await google.maps.importLibrary("maps");
      // The map, centered at the position
      map = new Map(document.getElementById("map"), {
        zoom: 20,
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
        latitud = latLng.lat();
        longitud = latLng.lng();
      }
    }

    let guardar = page.querySelector('.saveNotes');
    guardar.addEventListener('click', async () => {
      let reminder = page.querySelector('#reminder');
      let option = page.querySelector('#choose-sel');
      let textarea = page.querySelector('.textarea');
      const token = localStorage.getItem('token');
      const parts = token.split('.');
      const payloadBase64 = parts[1];
      const payloadJson = JSON.parse(atob(payloadBase64));
      const { usuario } = payloadJson;
      const note = {
        "reminder": reminder.value,
        "notes": textarea.value,
        "priority": option.value,
        "location": `${latitud}-${longitud}`,
        "user_id": usuario.id,
      };
      try {
        const response = await fetch('https://api-todo-list-ta8f.onrender.com/v1/task', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(note)
        });
        if (response.status === 201) {
          reminder.value = '';
          textarea.value = '';
          ons.notification.confirm("Nota guardada con éxito");
        } else {
          ons.notification.alert("Ups! Algo salió mal");
        }
      } catch (error) {
        ons.notification.alert("Ups! Algo salió mal");
      }

    })

    page.querySelector('.pushMyNotes').onclick = () => {
      document.querySelector('#myNavigator').pushPage('page5.html');
    }
  } else if (page.id === 'page5') {
    const token = localStorage.getItem('token');
    const parts = token.split('.');
    const payloadBase64 = parts[1];
    const payloadJson = JSON.parse(atob(payloadBase64));
    const { usuario } = payloadJson;
    async function getTasks(id) {
      const url = `https://api-todo-list-ta8f.onrender.com/v1/task/all/${id}`;
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        console.log(data);
        const convertirFecha = (fecha) => {
          let date = new Date(fecha);
          let year = date.getUTCFullYear();
          let month = date.getUTCMonth() + 1;
          let day = date.getUTCDate();
          let formattedDate = `${year}-${month}-${day}`;
          return formattedDate;
        }
        if (response.status === 200) {
          let listToday = document.querySelector('.list-today');
          console.log(listToday);
          const fecha = new Date();
          const year = fecha.getFullYear();
          const month = fecha.getMonth() + 1;
          const day = fecha.getDate();
          const date = `${year}-${month}-${day}`;
          for (let i = 0; i < data.length; i++) {
            const note = data[i];
            const formatDate = convertirFecha(note.reminder);
            //HOY
            if (date === formatDate) {
              listToday.innerHTML += `<ons-list-item tappable>${note.task_id} | ${note.notes}</ons-list-item>`;
            }
            //HACE 7 DIAS
            if ((diferenciaDias(date, formatDate) <= 7) && (date != formatDate) && (diferenciaDias(date, formatDate) >= 1)) {
              let listWeek = document.querySelector('.list-preview7');
              console.log(listWeek);
              listWeek.innerHTML += `<ons-list-item tappable>${note.task_id} | ${note.notes}</ons-list-item>`;
            }
            //HACE 30 DIAS
            if ((diferenciaDias(date, formatDate) > 7) && (date != formatDate) && (diferenciaDias(date, formatDate) <= 30)) {
              let listWeek = document.querySelector('.list-preview30');
              listWeek.innerHTML += `<ons-list-item tappable>${note.task_id} | ${note.notes}</ons-list-item>`;
            } else if ((diferenciaDias(date, formatDate) > 30) && (date != formatDate)) {
              let listWeek = document.querySelector('.list-month');
              listWeek.innerHTML += `<ons-list-item tappable>${note.task_id} | ${note.notes}</ons-list-item>`;
            }
          };
        }
      } catch (error) {
        ons.notification.alert("Ups! Algo salió mal");
      }
    }
    getTasks(usuario.id)
      .then(() => {
        const tareas = document.querySelectorAll('.listas .list-item');
        console.log(tareas);
        tareas.forEach(tarea => {
          tarea.addEventListener('click', async (e) => {
            let titulo = e.target.innerText;
            const id = titulo.split("|")[0];
            try {
              const response = await fetch(`https://api-todo-list-ta8f.onrender.com/v1/task/${id}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              const data = await response.json();
              if (response.status === 200) {
                localStorage.setItem('task', JSON.stringify(data));
                document.querySelector('#myNavigator').pushPage('page6.html');
              }
              document.querySelector('#myNavigator').pushPage('page6.html');
            } catch (error) {
              return error;
            }
          });
        });
      })
      .catch(error => {
        // Handle errors (optional)
      });
    page.querySelector('.buttonAdd').onclick = async () => {
      document.querySelector('#myNavigator').pushPage('page4.html');
    }
  }
  else if (page.id === 'page6') {
    const note = localStorage.getItem('task');
    const { task_id, reminder, notes, priority, location } = JSON.parse(note);
    const reminderUpdate = page.querySelector('#reminderUpdate');
    reminderUpdate.value = reminder.split("T")[0];
    const textarea = page.querySelector('.textareaUpdate');
    textarea.value = notes;
    const option = page.querySelector('#choose-selec');
    option.value = priority;
    let btnDelete = page.querySelector('.btnDelete');
    let btnEdit = page.querySelector('.btnEdit');
    btnDelete.addEventListener('click', async () => {
      try {
        const response = await fetch(`https://api-todo-list-ta8f.onrender.com/v1/task/${task_id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (response.status === 200) {
          ons.notification.confirm("Tarea eliminada con éxito");
          localStorage.removeItem('task');
          document.querySelector('#myNavigator').pushPage('page5.html');
        }
      } catch (error) {
        ons.notification.alert("Ups! Algo salió mal");
      }
    });

  }
});


const diferenciaDias = (fecha1, fecha2) => {
  let fechaInicio = new Date(fecha1).getTime();
  let fechaFin = new Date(fecha2).getTime();
  let diff = fechaFin - fechaInicio;
  return diff / (1000 * 60 * 60 * 24) * -1;
}
