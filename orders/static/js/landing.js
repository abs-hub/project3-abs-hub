document.addEventListener('DOMContentLoaded', function () {

  // when user clicks login
  document.querySelector('#submit-login').onclick = (e) => {
    e.stopPropagation();
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;
    //check if username and password is filled in
    if (username && password) {
      // get csrf token and set it to request header
      const csrf_token = document.querySelector('#csrf_token').childNodes[0]['value'];
      console.log(csrf_token);
      // make an AJAX call to server
      const request = new XMLHttpRequest();
      request.open('POST', '/landing');

      request.setRequestHeader("X-CSRFToken", csrf_token);

      // prepare body
      const login_data = new FormData();
      login_data.append('username', username);
      login_data.append('password', password);

      // send information to server
      request.send(login_data);
      request.onload = () => {
        const response = request.responseText;
        const success = JSON.parse(response)['success'];
        const error_message = JSON.parse(response)['message'];

        // if success, the user gets authenticated and let us return to index
        if (success) {
          window.location.href = '/';
        } else {
          document.querySelector('.error-login').innerHTML = error_message;
        }
      };

      return false;

    } else {
      document.querySelector('.error-login').innerHTML = 'Both username and password are required.'
    }
  };

  //when user click Register button
  document.querySelector('#submit-register').onclick = (e) => {
    e.stopPropagation();
    // Ensure that all registration information was entered
    const username = document.querySelector('#register-username').value;
    const password = document.querySelector('#register-password').value;
    const first_name = document.querySelector('#register-first-name').value;
    const last_name = document.querySelector('#register-last-name').value;
    const email = document.querySelector('#register-email').value;
    const terms = document.querySelector('#register-terms').checked;
    if (username && password && first_name && last_name && email && terms) {

      // make an AJAX call to server
      const request = new XMLHttpRequest();
      request.open('POST', '/register');
      // get csrf token and set it to request header
      const csrf_token = document.querySelector('#csrf_token').childNodes[0]['value'];
      request.setRequestHeader("X-CSRFToken", csrf_token);

      // prepare body
      const register_data = new FormData();
      register_data.append('username', username);
      register_data.append('password', password);
      register_data.append('first_name', first_name);
      register_data.append('last_name', last_name);
      register_data.append('email', email);

      // send information to server
      request.send(register_data);
      request.onload = () => {
        const response = request.responseText;
        const success = JSON.parse(response)['success'];
        const error_message = JSON.parse(response)['message'];

        // if success, the user gets authenticated and let us return to index
        if (success) {
          window.location.href = '/';
        } else {
          document.querySelector('.error-register').innerHTML = error_message;
        }
      };

      return false;

      // Return an error message if any of the fields were left blank.
    } else {
      document.querySelector('.error-register').innerHTML = 'All fields are required.'
    }
  };

  // get toppings and extras data, populate in the place holder
  const storage = document.querySelector('#storage');
  const storage_extras = storage.dataset.storage_extras;
  const storage_toppings = storage.dataset.storage_toppings;

  //populate toppings and extras which we got above into their respective html elements
  let toppings = JSON.parse(storage_toppings);
  toppings.forEach(i => {
    let topping = i['fields']['name'];
    document.querySelector('.landing-toppings').innerHTML += (toppings.indexOf(i) ? ', ' : '') + topping;
  });

  let extras = JSON.parse(storage_extras);

  extras.forEach(i => {
    let extra = i['fields']['item'];
    document.querySelector('.landing-extras').innerHTML += (toppings.indexOf(i) ? ', ' : '') + extra;
  })
});