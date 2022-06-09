For local dev find line
 ``` 
 add_action('admin_enqueue_scripts', function ($hook) {
$dev = false; 
```
in itinerary.php and replace dev to be true;

run 
```
yarn
```
it will start react on port 3000. it needs to be on port 3000
after development is done change it back to false. and run 
```
yarn build
```


Limitation on excel import export:
Table list types CANNOT have list or select fields inside. 


To run standalone: 
 ```
  document.getElementById('general-info-react')
            |
           \|/
  document.getElementById('root')
```
add this to api.ts. 
New values can be obtained from any wp cms with this plugin. 
Inspect browser and print out wpApiSettings variable. 
You need to open a page with this plugin not any wp page.

```
var wpApiSettings ={root: 'https://wp-alpine-cms.bwtsoftpauer.com/wp-json/', nonce: '80a9376a86', moodle_base_url: 'https://teamdemo.softpauer.com/\t', moodle_ws_token: '46157558776cbb8ecdf0330316009ead'};

```
navigate using url:
localhost:3001/?Transfers
localhost:3001/?Car Hire 
....

