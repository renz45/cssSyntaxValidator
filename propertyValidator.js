var propertyValidator = function() {
  var cssPropertyValidatorMapping = {
    "background": "backgroundShortHand",
    "background-attachment": false,
    "backgroundAttachment": false,
    "background-color": "color",
    "backgroundColor": "color",
    "background-image": "url",
    "backgroundImage": "url",
    "background-position": false,
    "backgroundPosition": false,
    "background-repeat": false,
    "backgroundRepeat": false,
    "border": "borderShortHand",
    "border-bottom": "borderShortHand",
    "borderBottom": "borderShortHand",
    "border-bottom-color": "color",
    "borderBottomColor": "color",
    "border-bottom-style": false,
    "borderBottomStyle": false,
    "border-bottom-width": "size",
    "borderBottomWidth": "size",
    "border-color": "color",
    "borderColor": "color",
    "border-left": "borderShortHand",
    "borderLeft": "borderShortHand",
    "border-left-color": "color",
    "borderLeftColor": "color",
    "border-left-style": false,
    "borderLeftStyle": false,
    "border-left-width": "size",
    "borderLeftWidth": "size",
    "border-right": "borderShortHand",
    "borderRight": "borderShortHand",
    "border-right-color": "color",
    "borderRightColor": "color",
    "border-right-style": false,
    "borderRightStyle": false,
    "border-right-width": "size",
    "borderRightWidth": "size",
    "border-style": false,
    "borderStyle": false,
    "border-top": "borderShortHand",
    "borderTop": "borderShortHand",
    "border-top-color": "color",
    "borderTopColor": "color",
    "border-top-style": false,
    "borderTopStyle": false,
    "border-top-width": "size",
    "borderTopWidth": "size",
    "border-width": "size",
    "borderWidth": "size",
    "clear": false,
    "clip": false,
    "color": "color",
    "cursor": false,
    "display": false,
    "filter": false,
    "font": false,
    "font-family": "fontFamily",
    "fontFamily": "fontFamily",
    "font-size": "size",
    "fontSize": false,
    "font-variant": false,
    "fontVariant": false,
    "font-weight": false,
    "fontWeight": false,
    "height": "size",
    "left": "size",
    "letter-spacing": false,
    "letterSpacing": false,
    "line-height": "size",
    "lineHeight": "size",
    "list-style": false,
    "listStyle": false,
    "list-style-image": "url",
    "listStyleImage": "url",
    "list-style-position": false,
    "listStylePosition": false,
    "list-style-type": false,
    "listStyleType": false,
    "margin": "marginShortHand",
    "margin-bottom": "size",
    "marginBottom": "size",
    "margin-left": "size",
    "marginLeft": "size",
    "margin-right": "size",
    "marginRight": "size",
    "margin-top": "size",
    "marginTop": "size",
    "overflow": false,
    "padding": "paddingShortHand",
    "padding-bottom": "size",
    "paddingBottom": "size",
    "padding-left": "size",
    "paddingLeft": "size",
    "padding-right": "size",
    "paddingRight": "size",
    "padding-top": "size",
    "paddingTop": "size",
    "page-break-after": false,
    "pageBreakAfter": false,
    "page-break-before": false,
    "pageBreakBefore": false,
    "position": false,
    "float": false,
    "cssFloat": false,
    "text-align": false,
    "textAlign": false,
    "text-decoration": false,
    "textDecoration": false,
    "text-decoration": false,
    "textDecorationBlink": false,
    "textDecorationLineThrough": false,
    "textDecorationNone": false,
    "textDecorationOverline": false,
    "textDecorationUnderline": false,
    "text-indent": false,
    "textIndent": false,
    "text-transform": false,
    "textTransform": false,
    "top": "size",
    "vertical-align": false,
    "verticalAlign": false,
    "visibility": false,
    "width": "size",
    "z-index": false,
    "zIndex": false
  }
  
  var cssProperties = Object.keys(cssPropertyValidatorMapping),
      // hexColorPattern = /^\s*#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})\s*$/, // Matches #fff and #ffffff
      // rgbColorPattern = /rgb\(\s*(([2][0-5][0-5]|[01]\d\d|\d\d?)\s*,\s*){2}([2][0-5][0-5]|[01]\d\d|\d\d?)\s*\)/,
      // rgbaColorPattern = /rgba\(\s*(([2][0-5][0-5]|[01]\d\d|\d\d?)\s*,\s*){3}[01]\.\d*\s*\)/,
      maxRgbValue = 255,
      maxHexValue = "ff",
      urlPattern = /url\([^()]*\)/,
      possibleBorderTypes = ["none","hidden","dotted","dashed","solid","double","groove","ridge","inset","outset"],
      cssLengthUnitTypes = ["em","ex","ch","rem","vh","vw","vmin","vmax","px","mm","cm","in","pt","pc", "%"];
  
  
  //============= Validators =============//
  var validators = {
    color: function(value) {
      if(/^rgba/.test(value)) {
        
      }else if(/^rgb/.test(value)) {
        
      } else {
        
      }
    },

    size: function(value) {
      
    },

    url: function(value) {
      
    },

    marginShortHand: function(value) {
      
    },

    paddingShortHand: function(value) {
      marginShortHand(value);
    },

    fontFamily: function(value) {
      
    },

    borderShortHand: function(value) {
      
    },

    backgroundShortHand: function(value) {
      
    },
    noop: function(value) {/*Nothing!*/ return true;}
  }

  //============= Helpers =============//
  var getValidatorForPropertyName = function(propertyName) {
    // If the property starts with a `-`(vendor prefix)
    if(/^\s*-/.test(propertyName)) {
      return validators.noop;
    }
    
    // If the property exists in the property list
    if(cssProperties[propertyName]) {
      return validators[propertyName] || validators.noop;
    } else {
      throw new Error("Property: " + propertyName + " is not a valid css property.")
    }
  }
  
  
  var validateProperty = function(propertyName, propertyValue) {
    getValidatorForPropertyName(propertyName)
  }
  
  validateProperty.validators = validators;
  return validateProperty;
}

var moduleExists;

try {
  moduleExists = module && module.exports;
} catch(e){}

if(moduleExists) {
  module.exports = propertyValidator();
} else {
  window.propertyValidator = propertyValidator();
}
