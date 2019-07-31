# Project 3: Pizza

This project utilizes python, Django, JavaScript, AJAX and uses python libraries like DJANGO. The objective behind this project is to get use to to DJANGO.

# Requirements
https://cs50.harvard.edu/web/2019/summer/projects/3/#requirements

## Getting Started
This project is a mimic of a famous Pizza shop in cambridge. 

### Prerequisites

Get your environment setup. Make sure you install latest copy of python v 3.6 or higher. Run following command in your terminal to install all necessary packages.

```
pip3 install -r requirements.txt
python3 manage.py createsuper
python3 manage.py runserver
```
Set the environment variables as below. I have also included these settings in envSettings.txt.
```
export SECRET_KEY=my_secret
```

## Milestones

* Complete the Menu, Adding Items, and Registration/Login/Logout steps.
* Complete the Shopping Cart and Placing an Order steps.
* Completed the Viewing Orders and Personal Touch steps by giving admin ability to complete, cancel order.


## Tools and frameworks used to build

* [IntelliJ IDEA Ultimate](https://www.jetbrains.com/idea/) - The IDE used for development and code styling/formatting.
* [iTerm2](https://www.iterm2.com/) - Terminal.
* [Bootstrap v4.3.1](https://getbootstrap.com/) - Used this primarily for styling.
* [font-awesome v4.7](https://fontawesome.com/v4.7.0/) - Used to show icons.
* Python v3.7.3
* Django


### Project Files
1. views.py - controls what happens when a user visits a URL route (acts like app.py, or application.py, in a FLASK application)
2. settings.py -- the only thing which has been added to it are some settings involving the static/ folder.
3. models.py -  create the structure of tables to be used with the sqlite3 database - to create the SQL commands to reflect the changes to any tables within models.py, you create a "migration" file, which is stored in ~/orders/migrations/, by running:
3. static/imgs/favicon.ico- required favicon.ico for the website.
4. admin.py -- add models from ~/orders/models.py to admin.py in order to track them using the built-in Django admin GUI  
