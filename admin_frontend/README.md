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
