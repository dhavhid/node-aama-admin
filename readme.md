# Installation.
 
```
bower install
npm install
grunt build
```

-------------------------

# Command line parameters.

### Production build (production servers URLs)
```
grunt build --config=prod
```

### Show debug window
```
grunt build --debug=1
```

-------------------------

# Translating.

## Set multilanguage strings.

https://angular-gettext.rocketeer.be/dev-guide/annotate/
In .js files for set multilang strings use
````
lang(str)
````
It is necessary to add multilang strings from .js files to langs.html file for parse this strings by gettext module.
````
<i translate>Sample text</i>
````

## Translate.
Create pot template file for translation
````
grunt po
````
After creating .pot template use Poedit tool (or another one) for create translations (.po files).

## Create translations.js file.
Parse po files and make js translations
````
grunt lang
````