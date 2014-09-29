# CssSyntaxValidator
This library is used to validate CSS syntax and give nice-ish error message describing the line and character.

## Usage
npm install css-syntax-validator

node:
```javascript
var validate = require('cssSyntaxValidator');
validate(<css string goes here>);
```

client:
```html
<script src="cssSyntaxValidator.js"></script>
<script>
  cssSyntaxValidator(<css string goes here>);
</script>
```

## Developing
To run within node-inspector:

* In one terminal window run: `mocha -w --debug-brk syntaxSpec.js`

* In a second terminal window run: `node-inspector --config ./inspector-config.json`
Vist the site given
