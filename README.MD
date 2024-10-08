# Retail Stock Control 
You can see screenshots of the application in the last section.

## Presentation
Web application to manage stock, orders and supplies for a retail business.

## Features
### Stock management
> Add, edit and delete products from the stock.  
> Add a barcode to a product and find it with a scanner  
> Add and delete categories.  
> Add supplies to stock and name suppliers. 
> Ability to record emergency stock levels.  
> Search for supplies by criteria or grouped criteria.  

### Orders
> Create orders for customers.  
> Adding gifts to orders.  
> Register customer name.  
> Add a comment during order registration.  
> Possibility of modifying an order.  
> Search for orders by criteria or grouped criteria.  
> Print order receipt.

### Administration
> Add, edit and delete managers.  
> Several privilege levels.  
> Separation of orders by site (if several stores).  
> Possibility of recording customers paying later.  
> Possibility of recording that suppliers will be paid at a later date.      
> Recording of each manager's actions with a severity level.  
> Send these actions on telegram to a specific conversation.  

### Management
> Statistics (sales, revenue, number of products sold, total number of products sold, sales of a particular product) for each or all sites.    
> Graphs by criteria (by day, by month, by year, by payment method) and several graph types available.  
> Inventory verification record.  

### Security
> Password hashing (sha256).  
> 3 connection attempts allowed every hour.  

### Others
> Shortcuts (CTRL + M to add a new product in order, CTRL + M to confirm the quantity in the stock...).  
> Application supports all platforms (responsive).  
> Multi-language support.  
> Multi-currency support.  
> Multi-store support.  
> Possibility of adding a telephone number to invoices.  
> Eco-mode (fewer heavy requests to servers, such as requests for files, images, etc.).  
> Customized messages after various actions.  
> Flexible, modular package code.  
> A default image for products.  


## Features that can be added
### Personalization
> A page for customizing the various elements of the site that can be added, such as the possibility of changing the 
> logo and name of the mobile app, or changing the colors by overloading CSS variables.  

### Notifications
> A reminder of actions not yet seen by the main manager can be added

### Database and /admin/
> Buttons on the main page can be added for creating and deleting different table 
> instances to dissociate from the /admin/ page.

### Factoring
> Files such as index_script.js can be factorized.

### Actions Translations
> The actions sent to the manager can be translated into the current language.

### Tests
> Add tests to the application.

## Settings
- __*bot_token*__: telegram bot token
- __*chat_id*__: id of the conversation to which to send manager actions
- __*currency*__: Text to be displayed in front of prices (e.g. $, €, XOF)
- __*phone_number*__: Number to appear on customer invoice
- __*eco_mode*__: !=0 for economy mode and 0 to deactivate
- __*default_image*__: Default image for products who don't have an image
- __*total_tolerance*__: Tolerance for the total of an order (search)

## Add a language
> - add the language in settings.py in LANGUAGES  
> - run ```python manage.py makemessages -l [lang_code]```  
> - translate the .po file in the locale folder  
> - run ```python manage.py compilemessages```  

## Installation
### Test the application
- Clone the repository
- Install the requirements with ```pip install -r requirements.txt```
- Run the server with ```python manage.py runserver```

### Deploy the application
- Clone the repository
- Add the following line to the settings.py file ```DEBUG = False```
- Collect the static files with ```python manage.py collectstatic```
#### Use whitenoise for static files
- Install whitenoise with ```pip install whitenoise```
- Add whitenoise to the middleware in settings.py ```'whitenoise.middleware.WhiteNoiseMiddleware'```
- Add the following line to the settings.py file ```STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'```
- delete STATIC_DIRS in settings.py
#### Use gunicorn
- Install gunicorn with ```pip install gunicorn```
- Run the server with ```gunicorn [project_name].wsgi```
- Add the following line to the settings.py file ```ALLOWED_HOSTS = ['*']```
- start command: ```python manage.py makemigrations && python manage.py migrate && gunicorn stockManager.wsgi --log-file -```
#### Use a database
- Install a database (e.g. PostgreSQL)
- Add the database settings to the settings.py file
- Export the database with ```python manage.py dumpdata > db.json```
- start command (delete ```python manage.py loaddata db.json``` if you don't have data to import): ```python manage.py makemigrations && python manage.py migrate && python manage.py flush --no-input && python manage.py loaddata db.json && gunicorn stockManager.wsgi --log-file -```
#### E.g. Use a PostgreSQL database
- Install PostgreSQL with ```pip install psycopg2```
- in settings.py, add the following lines:
```python
import dj_database_url
import os

DATABASE_URL = os.environ.get('DATABASE_URL')

DATABASES = {
    'default': dj_database_url.config(default=DATABASE_URL, conn_max_age=1800),
}
```

## Credits
__*Author*__: Abdallahi El Housseine  
This project is under MIT license and logo.png is under flaticon license
(https://www.flaticon.com/free-icon/packages_2979677?term=stock&page=1&position=7)


## Screenshots
![login.png](screenshots/login.png)
<u>Login page</u>

![menu.png](screenshots/menu.png)
<u>Menu (all elements forced to the hover state)</u>

![home.png](screenshots/home.png)
<u>Home page when logged in as admin</u>

![home nonadmin.png](screenshots/homenonadmin.png)
<u>Home page when logged in as non-admin</u>

![new order.png](screenshots/neworderdetail.png)
<u>Order section</u>

![stock.png](screenshots/stock.png)
<u>Stock page</u>

![check stock.png](screenshots/checks.png)
<u>Check stock page</u>

![orders.png](screenshots/orders.png)
<u>Orders page</u>

![stats.png](screenshots/stats.png)
<u>Statistics page</u>

![revenue.png](screenshots/revenue.png)
<u>Example of sections in statistics (revenue) </u>

![revenue value.png](screenshots/revenuevalue.png)
<u>Example of sections in statistics (revenue value) </u>