document.addEventListener('DOMContentLoaded', function () {

  // Reload page if user hits the "Back" button
  if (String(window.performance.getEntriesByType("navigation")[0].type) === "back_forward") {
    window.location.reload()
  }

  // get toppings and extras data, populate in the place holder
  const storage = document.querySelector('#storage');
  const storage_extras = storage.dataset.storage_extras;
  const storage_toppings = storage.dataset.storage_toppings;

  active_selections = []

  // Attach 'click' event listeners to all <input> checkboxes on page load
  let all_inputs = document.querySelectorAll('input')
  for (let i = 0; i < all_inputs.length; i++) {
    all_inputs[i].addEventListener('click', function () {
      //handle selection
      select_item(this);
    });
  }

  // attach event to add-to-cart
  let all_cart_buttons = document.querySelectorAll('.add-to-cart')
  for (let i = 0; i < all_cart_buttons.length; i++) {
    all_cart_buttons[i].addEventListener('click', function (event) {
      event.preventDefault();
      //handle cart
      add_to_cart(this);
    });
  }

  function add_to_cart(obj) {
    const tr_id = obj.dataset.tr_id;
    let checkboxes = obj.parentNode.parentNode.querySelectorAll('[type="checkbox"]');
    //get toppings
    let topping_tr = document.querySelector("tr[class='" + tr_id + "']");
    let topping_checkboxes;
    if (topping_tr) {
      topping_checkboxes = topping_tr.querySelectorAll('[type="checkbox"]');
    }
    let selected_menu_items = [];
    let selected_extras_toppings = [];
    for (let i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].dataset.tr_id && checkboxes[i].checked) {
        selected_menu_items.push(checkboxes[i]);
      }
    }
    if (topping_checkboxes) {
      for (let j = 0; j < topping_checkboxes.length; j++) {
        if (topping_checkboxes[j]['className'] == tr_id && topping_checkboxes[j].checked) {
          selected_extras_toppings.push(topping_checkboxes[j]);
        }
      }
    }

    document.querySelector('.error-selections').innerHTML = ''
    if (selected_menu_items.length === 0) {
      document.querySelector('.error-selections').innerHTML = "No menu items are currently selected."
      return false;
    }

    for (let j = 0; j < selected_menu_items.length; j++) {
      let attributes = {
        "category": selected_menu_items[j].dataset.category,
        "size": selected_menu_items[j].dataset.size,
        "data_toppings": selected_menu_items[j].dataset.toppings,
        "data_limit": selected_menu_items[j].dataset.limit,
        "extras_price": 0,
        "extras": [],
        "name": selected_menu_items[j]['name'],
        "toppings": [],
        "value": selected_menu_items[j]['value']
      };

      // Associate selected extras or toppings with their respective menu item.
      for (let k = 0; k < selected_extras_toppings.length; k++) {
        if (selected_menu_items[j].dataset.tr_id === selected_extras_toppings[k]['className']) {

          // Add any selected pizza toppings item to the selected pizza's list of
          // attributes.
          if (selected_menu_items[j].dataset.toppings === "true") {
            let new_topping = selected_extras_toppings[k]['name'];
            let old_toppings = attributes['toppings'];
            old_toppings.push(new_topping);
            attributes['toppings'] = old_toppings;
          }

          // Add any selected sub extras to the selected sub's list of attributes.
          if (selected_menu_items[j].dataset.category === 'Subs') {
            let new_extra = selected_extras_toppings[k]['name'];
            let old_extras = attributes['extras'];
            old_extras.push(new_extra);
            attributes['extras'] = old_extras;
            attributes['extras_price'] += parseFloat(selected_extras_toppings[k].dataset.price)
          }
        }
      }
      // toppings validation
      if (attributes['data_toppings'] === "true" && attributes['toppings'].length < attributes['data_limit']) {
        document.querySelector('.error-selections').innerHTML = "Required topping selection does not meet for "
            + attributes['name'];
        return false;
      }

      // make an AJAX call to server
      const request = new XMLHttpRequest();
      request.open('POST', '/additem');

      // get csrf token and set it to request header
      const csrf_token = document.querySelector('#csrf_token').childNodes[0]['value'];
      request.setRequestHeader("X-CSRFToken", csrf_token);

      // prepare body
      const item_data = new FormData();
      item_data.append('category', attributes['category']);
      item_data.append('item', attributes['name']);
      item_data.append('size', attributes['size']);
      item_data.append('toppings', (attributes['toppings'].length > 0 ? attributes['toppings'] : ''));
      item_data.append('extras', (attributes['extras'].length > 0 ? attributes['extras'] : ''));
      item_data.append('extras_price', attributes['extras_price']);
      item_data.append('price', attributes['value']);

      // send information to server
      request.send(item_data);
      request.onload = () => {
        const response = request.responseText;
        const success = JSON.parse(response)['success'];
        const error_message = JSON.parse(response)['message'];

        // if success, go to index
        if (success) {
          window.location.href = '/';
        } else {
          document.querySelector('.error-selections').innerHTML = error_message;
        }
      };

    }
  }

  function select_item(obj) {

    // Get data from individual selected item -- tr_id represents the unique row
    // that the selected menu item is on, and td_id represents its unique checkbox
    const data_extras = obj.dataset.extras;
    const data_toppings = obj.dataset.toppings;
    const name = obj.dataset.name;
    const size = obj.dataset.size;
    const td_id = obj.dataset.td_id;
    const tr_id = obj.dataset.tr_id;
    const data_limit = obj.dataset.limit;

    // HANDLE EXTRAS
    if (data_extras === 'true') {

      // Update active selections
      active_selections.push({'td_id': td_id, 'tr_id': tr_id});

      // Determine which overall DOM menu column the extras are in

      // Show extras items
      show_extras(tr_id, size);

      // Scenario 1: Handle a different checkbox being clicked, but on the same
      // row as an active selection
      del_scenario_1 = []
      for (let i = 0; i < active_selections.length; i++) {
        if (active_selections[i]) {
          if (!(active_selections[i]['td_id'] === td_id) && active_selections[i]['tr_id'] === tr_id) {
            del_scenario_1.push(i);
          }
          ;
        }
        ;
      }
      ;
      if (del_scenario_1.length === 1) {
        hide(obj, del_scenario_1, del_scenario_1.length);
      }
      ;

      // Scenario 2: Handle the same checkbox being clicked twice
      del_scenario_2 = [];
      for (let i = 0; i < active_selections.length; i++) {
        if (active_selections[i]) {
          if (active_selections[i]['td_id'] === td_id && active_selections[i]['tr_id'] === tr_id) {
            del_scenario_2.push(i);
          }
          ;
        }
        ;
      }
      ;
      if (del_scenario_2.length === 2) {
        hide(obj, del_scenario_2, del_scenario_2.length);
      }
      ;
    }
    ;

    // HANDLE TOPPINGS
    if (data_toppings === 'true') {

      // Update active selections
      active_selections.push({'td_id': td_id, 'tr_id': tr_id});

      if (data_limit) {
        show_toppings(tr_id, size, data_limit);
      }

      // Scenario 1: Handle a different checkbox being clicked, but on the same
      // row as an active selection
      del_scenario_1 = []
      for (let i = 0; i < active_selections.length; i++) {
        if (active_selections[i]) {
          if (!(active_selections[i]['td_id'] === td_id) && active_selections[i]['tr_id'] === tr_id) {
            del_scenario_1.push(i);
          }
          ;
        }
        ;
      }
      ;
      if (del_scenario_1.length === 1) {
        hide(obj, del_scenario_1, del_scenario_1.length);
      }
      ;

      // Scenario 2: Handle the same checkbox being clicked twice
      del_scenario_2 = [];
      for (let i = 0; i < active_selections.length; i++) {
        if (active_selections[i]) {
          if (active_selections[i]['td_id'] === td_id && active_selections[i]['tr_id'] === tr_id) {
            del_scenario_2.push(i);
          }
          ;
        }
        ;
      }
      ;
      if (del_scenario_2.length === 2) {
        hide(obj, del_scenario_2, del_scenario_2.length);
      }
      ;
    }
    ;

  };

  // --------------------- SHOW EXTRAS -------------------------------------------

  function show_extras(tr_id, size) {

    // Create a new row, <tr>, that includes list of extras.
    const tr_extras = document.createElement('tr');
    const td_extras = document.createElement('td');
    const td_extras_checkbox = document.createElement('td');
    const td_extras_price = document.createElement('td');
    const ul_extras = document.createElement('ul');

    // Checkbox variables
    let limit = 10;
    let price = 0;

    for (let i = 0; i < JSON.parse(storage_extras).length; i++) {

      // Parse storage_extras string and grab the name of the individual extra
      // names and prices
      const extra = JSON.parse(storage_extras)[i]['fields']['item']
      const extra_price_sm = JSON.parse(storage_extras)[i]['fields']['price_sm']
      const extra_price_lg = JSON.parse(storage_extras)[i]['fields']['price_lg']

      // Show all 4 extras items for the Steak + Cheese sub
      if (tr_id === 'Subs + Steak + Cheese') {

        // Create list of sub extras
        ul_extras.append(create_list(JSON.parse(storage_extras)[i]['fields']['item']));

        // Display extras' prices
        const br_price = document.createElement('br');
        if (size === 'Small') {
          td_extras_price.append(extra_price_sm, br_price);
          price = extra_price_sm;
        } else if (size === 'Large') {
          td_extras_price.append(extra_price_lg, br_price);
          price = extra_price_lg;
        }
        ;

        // Create a checkbox
        const br_checkbox = document.createElement('br');
        td_extras_checkbox.append(create_checkbox(tr_id, extra, limit, price, size), br_checkbox);

        // Only show the Extra Cheese option for all other subs
      } else {
        if (JSON.parse(storage_extras)[i]['fields']['item'] === 'Extra Cheese') {

          // Create list item of 'Extra Cheese' for all subs
          ul_extras.append(create_list(JSON.parse(storage_extras)[i]['fields']['item']));

          // Display 'Extra Cheese' price for all subs
          const br_extras_prices = document.createElement('br');
          if (size === 'Small') {
            td_extras_price.append(extra_price_sm, br_extras_prices);
            price = extra_price_sm;
          } else if (size === 'Large') {
            td_extras_price.append(extra_price_lg, br_extras_prices);
            price = extra_price_lg;
          }
          ;

          // Create a checkbox
          td_extras_checkbox.append(create_checkbox(tr_id, extra, limit, price, size));
        }
        ;
      }
      ;
    }
    ;

    // Stitch together the extras row, <tr>, that will be inserted into the DOM
    td_extras.append(ul_extras);
    tr_extras.className = tr_id;
    tr_extras.dataset.category = 'extra';
    tr_extras.append(td_extras, td_extras_price, td_extras_checkbox);

    // Add extras row, <tr>, to DOM. These go in the right overall menu column
    // (the menu is basically divided into two vertical columns) with a <tbody>
    // tag that has id="second_table".
    document.querySelector('#second_table').insertBefore(tr_extras,
        second_table.childNodes[index(tr_id, tr_extras.dataset.category) + 1]);
  };

  // --------------------- SHOW TOPPINGS -----------------------------------------

  function show_toppings(tr_id, size, limit) {

    // Create a new row, <tr>, that includes list of toppings.
    const tr_toppings = document.createElement('tr');
    const td_toppings = document.createElement('td');
    const td_toppings_checkbox = document.createElement('td');
    const ul_toppings = document.createElement('ul');

    // Checkbox variables
    let price = 0;

    for (let i = 0; i < JSON.parse(storage_toppings).length; i++) {

      // Parse storage_toppings string and grab the name of the individual topping
      topping = JSON.parse(storage_toppings)[i]['fields']['name']

      // Create list of pizza toppings
      ul_toppings.append(create_list(topping));

      // Create a checkbox
      const br_extras = document.createElement('br');
      td_toppings_checkbox.append(create_checkbox(tr_id, topping, limit, price, size), br_extras);
    }
    ;

    // Stitch together the toppings row, <tr>, that will be inserted into the DOM
    td_toppings.append(ul_toppings);
    tr_toppings.className = tr_id;
    tr_toppings.append(td_toppings, td_toppings_checkbox);

    // Add toppings row, <tr>, to DOM.
    document.querySelector('#first_table').insertBefore(tr_toppings, first_table.childNodes[index(tr_id) + 1]);
  };

  function create_list(name) {
    const li = document.createElement('li');
    li.name = name
    li.innerHTML = name;
    return li;
  }

  // Hide toppings and extras
  function hide(obj, delete_index, scenario) {

    // Variables passed in from <input> attributes on index.html
    tr_id = obj.getAttribute('data-tr_id');

    // Scenario 1: If a different checkbox is checked but in the same row as
    // active selection, set *.clicked = false and clear that active selection
    // from active_selections[]
    if (delete_index && scenario === 1) {
      var as_td_id = active_selections[delete_index[0]]['td_id']
      var uncheck = document.querySelectorAll('[data-td_id = "' + as_td_id + '"]');
      if (uncheck) {
        for (let i = 0; i < uncheck.length; i++) {
          uncheck[i].checked = false;
        }
        ;
      }
      ;delete active_selections[delete_index[0]];
      const items = document.querySelector('[class = "' + tr_id + '"]');
      if (items) {
        items.parentNode.removeChild(items);
      }
      ;
    }
    ;

    // Scenario 2: If the same checkbox is clicked twice in a row, clear both of
    // its entries in active_selections[] and hide the items
    if (delete_index && scenario === 2) {
      delete active_selections[delete_index[0]];
      delete active_selections[delete_index[1]];
      const items = document.querySelectorAll('[class = "' + tr_id + '"]');
      if (items) {
        for (let i = 0; i < items.length; i++) {
          items[i].parentNode.removeChild(items[i]);
        }
        ;
      }
      ;
    }
    ;
  };

  // --------------------- INDEX -------------------------------------------------

  // Figure out the index of the HTML child objects of <tbody>, namely topping and
  // extra rows, <tr>'s, within the DOM. Pizza toppings go in a separate column
  // from sub extras in the index.html DOM, so an attribute called 'category'
  // was created to correcty determine the index of sub extras which is used to
  // place them correctly on the webpage -- basically, pizzas and their toppings
  // are in the left column, subs and their extras are in the right. If for some
  // reason you want to scale up to 3 or more columns, you'll have to come up with
  // a new system or create new categories.
  function index(tr_id, category) {
    let index = 0;
    if (category === 'extra') {
      for (let i = 0; i < second_table.childNodes.length; i++) {
        if (second_table.childNodes[i].id === tr_id) {
          index = i;
        }
      }
    } else {
      for (let i = 0; i < first_table.childNodes.length; i++) {
        if (first_table.childNodes[i].id === tr_id) {
          index = i;
        }
      }
    }
    return index;
  }

  function create_checkbox(tr_id, name, limit, price, size) {
    const checkbox = document.createElement('input');
    checkbox.className = tr_id;
    checkbox.name = name;
    checkbox.setAttribute("data-price", price);
    checkbox.type = 'checkbox';

    // The onclick function for each checkbox updates the count for the total
    // number of checkboxes selected.
    checkbox.onclick = function () {
      let count = 0;
      let list = document.getElementsByClassName(tr_id);
      for (let i = 0; i < list.length; i++) {
        if (list[i].checked === true) {
          count++;
        }
      }
      // Disable all other checkboxes if a limit exists (3rd parameter)
      if (count == limit) {
        for (let i = 0; i < list.length; i++) {
          if (list[i].checked !== true) {
            list[i].disabled = true;
          }
        }
      } else {
        for (let i = 0; i < list.length; i++) {
          list[i].disabled = false;
        }
      }
    };
    return checkbox;
  };

});
