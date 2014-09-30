var cssSyntaxValidator = function() {
  var blockStartChar = "{",
      blockEndChar = "}",
      propertyEndChar = ";",
      selectorDividerChar = ",",
      classSelectorBeginChar = ".",
      idSelectorBeginChar = "#",
      blockCommentBeginChar = "/",
      blockCommentBeginPattern = /\/\*/,
      blockCommentEndChar = "*",
      blockCommentEndPattern = /\*\//,
      lineCommentBeginChar = "/",
      lineCommentPattern = /\/\//,
      pseudoSelectorStartChar = ":",
      classSelectorPattern = /\.[a-zA-Z0-9_-]/,
      idSelectorPattern = /#[a-zA-Z0-9_-]/,
      tagSelectorPattern = /[a-zA-Z0-9_-]/,
      hexColorPattern = /^\s*#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})\s*$/, // Matches #fff and #ffffff
      rgbColorPattern = /rgb\(\s*(([2][0-5][0-5]|[01]\d\d|\d\d?)\s*,\s*){2}([2][0-5][0-5]|[01]\d\d|\d\d?)\s*\)/,
      rgbaColorPattern = /rgba\(\s*(([2][0-5][0-5]|[01]\d\d|\d\d?)\s*,\s*){3}[01]\.\d*\s*\)/,
      maxRgbValue = 255,
      maxHexValue = "ff",
      urlPattern = /url\([^()]*\)/,
      possibleBorderTypes = ["none","hidden","dotted","dashed","solid","double","groove","ridge","inset","outset"],
      cssLengthUnitTypes = ["em","ex","ch","rem","vh","vw","vmin","vmax","px","mm","cm","in","pt","pc", "%"],
      possibleHtmlTags = [
        "a","abbr","acronym","address","applet","area","article","aside","audio",
        "b","base","basefont","bdi","bdo","bgsound","big","blink","blockquote",
        "body","br","button","canvas","caption","center","cite","code","col",
        "colgroup","content","data","datalist","dd","decorator","del","details",
        "dfn","dialog","dir","div","dl","dt","element","em","embed","fieldset",
        "figcaption","figure","font","footer","form","frame","frameset","h1","h2",
        "h3","h4","h5","h6","head","header","hgroup","hr","html","i","iframe",
        "img","input","ins","isindex","kbd","keygen","label","legend","li","link",
        "listing","main","map","mark","marquee","menu","menuitem","meta","meter",
        "nav","nobr","noframes","noscript","object","ol","optgroup","option","output",
        "p","param","picture","plaintext","pre","progress","q","rp","rt","ruby","s",
        "samp","script","section","select","shadow","small","source","spacer","span",
        "strike","strong","style","sub","summary","sup","table","tbody","td","template",
        "textarea","tfoot","th","thead","time","title","tr","track","tt","u","ul","var",
        "video","wbr","xmp"
      ],
      pseudoSelectors = [
        "active", "checked", "default", "dir", "disabled", "empty", "enabled", "first",
        "first-child", "first-of-type", "fullscreen", "focus", "hover", "indeterminate",
        "in-range", "invalid", "lang", "last-child", "last-of-type", "left", "link",
        "not", "nth-child", "nth-last-child", "nth-last-of-type", "nth-of-type",
        "only-child", "only-of-type", "optional", "out-of-range", "read-only", "read-write",
        "required", "right", "root", "scope", "target", "valid", "visited"
      ],
      cssProperties = [
        "background","background-attachment","backgroundAttachment","background-color",
        "backgroundColor","background-image","backgroundImage","background-position",
        "backgroundPosition","background-repeat","backgroundRepeat","border","border-bottom",
        "borderBottom","border-bottom-color","borderBottomColor","border-bottom-style",
        "borderBottomStyle","border-bottom-width","borderBottomWidth","border-color",
        "borderColor","border-left","borderLeft","border-left-color","borderLeftColor",
        "border-left-style","borderLeftStyle","border-left-width","borderLeftWidth",
        "border-right","borderRight","border-right-color","borderRightColor",
        "border-right-style","borderRightStyle","border-right-width","borderRightWidth",
        "border-style","borderStyle","border-top","borderTop","border-top-color","borderTopColor",
        "border-top-style","borderTopStyle","border-top-width","borderTopWidth","border-width",
        "borderWidth","clear","clip","clip","color","cursor","display","filter","font",
        "font-family","fontFamily","font-size","fontSize","font-variant","fontVariant",
        "font-weight","fontWeight","height","left","letter-spacing","letterSpacing",
        "line-height","lineHeight","list-style","listStyle","list-style-image","listStyleImage",
        "list-style-position","listStylePosition","list-style-type","listStyleType","margin",
        "margin-bottom","marginBottom","margin-left","marginLeft","margin-right","marginRight",
        "margin-top","marginTop","overflow","padding","padding-bottom","paddingBottom","padding-left",
        "paddingLeft","padding-right","paddingRight","padding-top","paddingTop","page-break-after",
        "pageBreakAfter","page-break-before","pageBreakBefore","position","float","cssFloat",
        "text-align","textAlign","text-decoration","textDecoration","text-decoration",
        "textDecorationBlink","textDecorationLineThrough","textDecorationNone","textDecorationOverline",
        "textDecorationUnderline","text-indent","textIndent","text-transform","textTransform",
        "top","vertical-align","verticalAlign","visibility","width","z-index","zIndex"
      ]
      
  
  var parserFunc, previousParserFunc, currentComment, currentSelector, selectorLine, cssData,
      inLineComment, inBlockComment, inComment, lines, currentLine, currentProperty,
      currentPropertyValue, propertyFound, propertyLine, newProperty, inProperty;

  var stripWhiteSpaceFromSelectors = function(selectors) {
    var newSelectors = [];

    if(selectors.constructor === String) {
      selectors = [selectors];
    }
    
    for(var i=0, l=selectors.length; i < l; i++) {
      if(selectors[i]) {
        newSelectors.push(selectors[i].replace(/^\s*|\s*$/g, ''));
      }
    }
    return newSelectors;
  }

  var syntaxObject = function(lIndex, cIndex) {
    var selector = stripWhiteSpaceFromSelectors(currentSelector).join("\n") || currentStyleBlock().selector;
  	return {selector: selector, line: lIndex || lineIndex + 1, char: cIndex|| characterIndex};
  }
  
  var throwStartBlockTagMissingError = function(lIndex, cIndex) {
    var syntaxObj = syntaxObject(lIndex, cIndex);
    var newError = new Error("Starting bracket expected for selector: '" + syntaxObj.selector + "' at line: " + syntaxObj.line + " char: " + syntaxObj.char);
    newError.lineData = syntaxObj;
    throw newError;
  }
  
  var throwEndBlockTagMissingError = function(lIndex, cIndex) {
    var syntaxObj = syntaxObject(lIndex, cIndex);
    var newError = new Error("End bracket expected for selector: '" + syntaxObj.selector + "' at line: " + syntaxObj.line + " char: " + syntaxObj.char);
    newError.lineData = syntaxObj;
    throw newError;
  }
  
  var throwSemicolonMissingError = function(lIndex, cIndex) {
    var syntaxObj = syntaxObject(lIndex, cIndex);
    var newError = new Error("Missing Semicolon for: '" + syntaxObj.selector + "' at line: " + syntaxObj.line + " char: " + syntaxObj.char);
    newError.lineData = syntaxObj;
    throw newError;
  }
  
  var throwEndingCommentError = function(commentObj) {
    var newError = new Error("Comment ending not found for: `comment` at line: " + commentObj.line + " char: " + commentObj.char);
    newError.lineData = commentObj;
    throw newError;
  }
  
  var setParserFunc = function(func) {
    previousParserFunc = parserFunc;
    parserFunc = func;
  }
  
  var goBackNumChars = function(num) {
    characterIndex -= num;
  }
  
  var goForwardNumChars = function(num) {
    characterIndex += num;
  }
  
  var goBackNumLines = function(num) {
    lineIndex -= num;
  }
  
  var lookAheadNumChars = function(num) {
    var val = "";
    var charLength = lines[lineIndex].length;
    for(var i=characterIndex; i <= num + characterIndex; i++) {
      val += lines[lineIndex][i] || "";
    }
    
    return val;
  }
  
  var findSelector = function(character) {
    currentSelector = [];
    setParserFunc(selectorFinder);
  }
  
  var commentResolved = function(character) {
    if(character === lineCommentBeginChar || character === blockCommentBeginChar){
      var nextTwoChars = lookAheadNumChars(1);
      if(blockCommentBeginPattern.test(nextTwoChars)) {
        inBlockComment = true;
      } else if(lineCommentPattern.test(nextTwoChars)){
        inLineComment = true;
      }
    }
    
    if(inBlockComment) {
      if(character === blockCommentEndChar && blockCommentEndPattern.test(lookAheadNumChars(1))) {
        inBlockComment = false;
        goForwardNumChars(1); // Skips over the last comment character
      }
    } else if(inLineComment) {
      // end the line comment when no other characters are found
      if(lookAheadNumChars(1) === character) {
        inLineComment = false;
      }
    }
    
    return !inBlockComment && !inLineComment
  }

  var propertyFinder = function(character) {
    if(character === ":") {
      propertyFound = true;
    } else if(character === blockEndChar) {
      setParserFunc(selectorFinder);
      // reset the other variables used in the declaration finder
      currentPropertyValue = "";
      currentProperty = "";
      propertyFound = false;
      inProperty = false;
    }else {
      // If the character is a propertyEndChar (usually `;`)
      // the save the declaration.
      if(character === propertyEndChar) {
        addPropertyToCurrent()
      } else if(character === blockStartChar) {
        throwEndBlockTagMissingError(lineIndex - 2, 1);
      // new line was found before an end of declaration character
      } else if(propertyLine < lineIndex && currentProperty.length > 0) {
        // If the declaration is blank or the declaration value is a pseudo selector
        // Assume the end block is missing.
        if(currentPropertyValue.length === 0 || pseudoSelectors.indexOf(currentPropertyValue) > -1) {
          throwEndBlockTagMissingError(lineIndex - 2, 1);
        }

        throwSemicolonMissingError(lineIndex - 1, lines[lineIndex - 1].length);
      } else {
        if(propertyFound) {
          // return early if the declaration value is empty and the current character is whitespace
          if(currentPropertyValue.length < 1 && /\s/.test(character)) {return;}
          currentPropertyValue += character;
        } else {
          // return early if the declaration name is empty and the current character is whitespace
          if(currentProperty.length < 1 && /\s/.test(character)) {return;}
          currentProperty += character;
        }
      }
    }
    propertyLine = lineIndex;
  }
  
  var currentStyleBlock = function() {
    return cssData[cssData.length - 1];
  }
  
  var addPropertyToCurrent = function() {
    newProperty = {};
    newProperty[currentProperty] = {value: currentPropertyValue, line: lineIndex + 1, char: characterIndex + 1};
    currentStyleBlock().properties.push(newProperty);
    
    // reset the other variables used in the declaration finder
    currentPropertyValue = "";
    currentProperty = "";
    propertyFound = false;
  }
  
  var newStyleBlock = function() {
    cssData.push({selector: stripWhiteSpaceFromSelectors(currentSelector).join(" "), properties: [], line: lineIndex + 1, char: characterIndex + 1});
    currentSelector = [];
  }
   
  var selectorFinder = function(character) {
    // return early if we're in the middle of a comment
    if(!commentResolved(character)) { return; }

    switch(character){
      case blockStartChar:
        console.log("TODO: Validate selector here");
        newStyleBlock();
        setParserFunc(propertyFinder);
        inProperty = true;
        break;
      case blockEndChar:
        throwStartBlockTagMissingError(lineIndex - 1, currentSelector[currentSelector.length - 1].length);
        break;
      default:
        // Throw an error if a new line is detected and the previous line doesn't have a `,`
        // Can you do leading commas in css? TODO Handle leading commas if that's a thing
        if(currentSelector[currentSelector.length - 1] && selectorLine < lineIndex && !(/,\s*$/.test(currentSelector[currentSelector.length - 1]))) {
          throwStartBlockTagMissingError(lineIndex - 1, currentSelector[currentSelector.length - 1].length);
        } else {
          // if there is a new line or the array is empty, populate it with an empty string
          if(selectorLine < lineIndex || currentSelector[currentSelector.length - 1] === undefined) { currentSelector.push(""); }
          
          // if the character is just white space and the current selector is blank, don't append the chracter
          // If the current selector is not blank, append the character regardless of what it is
          if(!currentSelector[currentSelector.length - 1] && !/\s/.test(character) || currentSelector[currentSelector.length - 1]) {
            currentSelector[currentSelector.length - 1] += character;
          }
        }
        selectorLine = lineIndex;
    }
  }

  var checkSyntax = function(string) {
    lines = string.split("\n");
    cssData = [];
    currentComment = "";
    findSelector();
    currentPropertyValue = ""
    currentProperty = ""
  	
  	for(lineIndex=0, l = lines.length; lineIndex < l; lineIndex++) {
      currentLine = lines[lineIndex];
  		for(characterIndex=0, ll=lines[lineIndex].length; characterIndex < ll; characterIndex++) {
  			if(!parserFunc) {break;}
  			parserFunc(currentLine[characterIndex], lineIndex, characterIndex);
  		}
  	}
    
    // If we're still inside the declaration, assume no ending tag was found
    if(inProperty) {
      throwEndBlockTagMissingError()
    }
    
    return cssData;
  }

  return checkSyntax;
}

var moduleExists;

try {
  moduleExists = module && module.exports;
} catch(e){}

if(moduleExists) {
  module.exports = cssSyntaxValidator();
} else {
  window.cssSyntaxValidator = cssSyntaxValidator();
}
