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
      pseudoSelectorStartChar = ":",
      classSelectorPattern = /\.[a-zA-Z0-9_-]/,
      idSelectorPattern = /#[a-zA-Z0-9_-]/,
      tagSelectorPattern = /[a-zA-Z0-9_-]/,
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
      inBlockComment, commentStartLine, commentStartCharacter, lines, currentLine, currentProperty,currentPropertyValue,
      propertyFound, propertyLine, newProperty, inProperty, lineIndex, characterIndex;
  
  // ************** Error message handling ************** //

  // I want to eventually make these configurable //
  var throwStartBlockMissingError = function(lIndex, cIndex) {
    console.log(1)
    var syntaxObj = syntaxObject(lIndex, cIndex);
    var newError = new Error("Starting bracket expected for selector: '" + syntaxObj.selector + "' at line: " + syntaxObj.line + " char: " + syntaxObj.char);
    newError.lineData = syntaxObj;
    throw newError;
  }
  
  var throwEndBlockTagMissingError = function(lIndex, cIndex) {
    console.log(2)
    var syntaxObj = syntaxObject(lIndex, cIndex);
    var newError = new Error("End bracket expected for selector: '" + syntaxObj.selector + "' at line: " + syntaxObj.line + " char: " + syntaxObj.char);
    newError.lineData = syntaxObj;
    throw newError;
  }
  
  var throwSemicolonMissingError = function(lIndex, cIndex) {
    console.log(3)
    var syntaxObj = syntaxObject(lIndex, cIndex);
    var newError = new Error("Missing Semicolon for: '" + syntaxObj.selector + "' at line: " + syntaxObj.line + " char: " + syntaxObj.char);
    newError.lineData = syntaxObj;
    throw newError;
  }
  
  var throwEndingCommentError = function(lIndex, cIndex) {
    console.log(4)
    var syntaxObj = syntaxObject(lIndex, cIndex);
    var newError = new Error("Comment ending not found for: `comment` at line: " + syntaxObj.line + " char: " + syntaxObj.char);
    newError.lineData = syntaxObj;
    throw newError;
  }
  
  // ************** General helpers ************** //
  
  // Strips leading and trailing whitespace from each line of a selector array
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
  
  // Creates syntax objects used in error messages contain the selector, line number and character number
  var syntaxObject = function(lIndex, cIndex) {
    var selector = stripWhiteSpaceFromSelectors(currentSelector).join("\n") || currentStyleBlock().selector;
    return {selector: selector, line: lIndex || lineIndex + 1, char: cIndex || characterIndex + 1};
  }
  
  // Sets the current function being used to parse characters
  var setParserFunc = function(func) {
    previousParserFunc = parserFunc;
    parserFunc = func;
  }
  
  // Sets the chracter index back to force the loop to rerun characters
  var goBackNumChars = function(num) {
    characterIndex -= num;
  }
  
  // Sets the chracter index forward to force the loop to skip characters
  var goForwardNumChars = function(num) {
    characterIndex += num;
  }
  
  // Looks returns the characters between the current characterIndex and characterIndex + num
  // Used to look ahead to find out if a tag is found or not.
  var lookAheadNumChars = function(num) {
    var val = "";
    var charLength = lines[lineIndex].length;
    for(var i=characterIndex; i <= num + characterIndex; i++) {
      val += lines[lineIndex][i] || "";
    }
    
    return val;
  }
  
  // sets the parserFun to selectorFinder and resets the currentSelector array.
  // This should be used whenever switching back to the selector finder
  var findSelector = function(character) {
    currentSelector = [];
    setParserFunc(selectorFinder);
  }
  
  // Returns the current style block from the parsed cssData
  var currentStyleBlock = function() {
    return cssData[cssData.length - 1];
  }
  
  // Adds a propert to the current style block
  var addPropertyToCurrent = function() {
    currentStyleBlock().properties.push({name: currentProperty, 
                                         value: currentPropertyValue,
                                         line: lineIndex + 1, 
                                         // beginning of the property definition
                                         char: characterIndex - currentPropertyValue.length - currentProperty.length - 1});
    
    // reset the other variables used in the declaration finder
    currentPropertyValue = "";
    currentProperty = "";
    propertyFound = false;
  }
  
  // creates a new style block
  var newStyleBlock = function() {
    cssData.push({selector: stripWhiteSpaceFromSelectors(currentSelector).join(" "), properties: [], line: lineIndex + 1, char: characterIndex - currentSelector[0].length + 1});
  }
  
  // This function will return false of the given character is within a comment
  // In order for this to work, it needs to be called each time, since it's looking
  // for starting and ending comment characters
  var commentResolved = function(character) {
    if(character === blockCommentBeginChar){
      var nextTwoChars = lookAheadNumChars(1);

      if(blockCommentBeginPattern.test(nextTwoChars)) {
        inBlockComment = true;
        goForwardNumChars(1);
        commentStartLine = lineIndex + 1;
        commentStartCharacter = characterIndex - 1;
        return false;
      }
    }
    
    if(inBlockComment) {
      if(character === blockCommentEndChar && blockCommentEndPattern.test(lookAheadNumChars(1))) {
        inBlockComment = false;
        commentStartLine = null;
        commentStartCharacter = null
        goForwardNumChars(1); // Skips over the last comment character
        return false;
      }
    }
    return !inBlockComment
  }
  
  // ************** Finders ************** //
  // Finders are used to find different syntax
  // patterns such has beginning/ending style blocks
  // and css properties

  // The property finder is triggered when within a style block, it checks syntax for
  // things like semi-colons and ending style block brackets. This finder also builds
  // property objects for the currentStyleBlock.
  var propertyFinder = function(character) {
    if(character === ":") {
      propertyFound = true;
    } else {
      // If the character is a propertyEndChar (usually `;`)
      // the save the declaration.
      if(character === propertyEndChar) {
        addPropertyToCurrent()
      
      // If it's a new line and the current property name is blank, there is either a missing semi colon
      // or a missing end block bracket
      } else if(propertyLine < lineIndex && currentProperty.length > 0) {
        // If the declaration is blank or the declaration value is a pseudo selector
        // Assume the end block is missing, else there is a missing semicolon.
        if(currentPropertyValue.length === 0 || pseudoSelectors.indexOf(currentPropertyValue) > -1) {
          throwEndBlockTagMissingError(lineIndex - 2, 1);
        } else {
          throwSemicolonMissingError(lineIndex, lines[lineIndex - 1].length);
        }
      } else if(character === blockStartChar) {
        throwEndBlockTagMissingError(lineIndex - 2, 1);
      // new line was found before an end of declaration character
      } else if(character === blockEndChar) {
        findSelector();
        // reset the other variables used in the declaration finder
        currentPropertyValue = "";
        currentProperty = "";
        propertyFound = false;
        inProperty = false;
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
  
  // The selector finder is used to find selectors before property blocks.
  // It also detects things like missing start block brackets.
  var selectorFinder = function(character) {
    var lastSelector = currentSelector[currentSelector.length - 1];

    switch(character){
      // If the block start character is found, create a new style entry and switch to the propertyFinder
      case blockStartChar:
        newStyleBlock();
        currentSelector = [];
        setParserFunc(propertyFinder);
        inProperty = true;
        break;
      case blockEndChar:
        throwStartBlockMissingError(lineIndex, characterIndex);
        break;
      default:
        // Throw an error if a new line is detected and the previous line doesn't have a `,`
        // and if the current line isn't leading with a `,`
        if(lastSelector && selectorLine < lineIndex && (!(/,\s*$/.test(lastSelector)) && !(/^\s*,/.test(currentLine))) ) {
          throwStartBlockMissingError(lineIndex, characterIndex);
        } else {
          // if there is a new line or the array is empty, populate it with an empty string
          if(selectorLine < lineIndex || lastSelector === undefined) { currentSelector.push(""); }
          
          // if the character is just white space and the current selector is blank, don't append the chracter
          // If the current selector is not blank, append the character regardless of what it is
          if(!lastSelector && !/\s/.test(character) || lastSelector) {
            currentSelector[currentSelector.length - 1] += character;
          }
        }
        selectorLine = lineIndex;
    }
  }
  
  var reset = function() {
    cssData = [];
    currentComment = "";
    currentPropertyValue = "";
    currentProperty = "";
    propertyFound = null;
    propertyLine = null;
    newProperty  = null;
    inProperty = null;
    commentStartLine = null;
    commentStartCharacter = null;
    inBlockComment = null;

    findSelector();
  }

  var checkSyntax = function(string) {    
    lines = string.split("\n");
    reset();
  	var l, ll;

  	for(lineIndex=0, l = lines.length; lineIndex < l; lineIndex++) {
      currentLine = lines[lineIndex];
  		for(characterIndex=0, ll=lines[lineIndex].length; characterIndex < ll; characterIndex++) {
  			if(!parserFunc) {break;}
        // goto the next character if we're in the middle of a comment
        if(!commentResolved(currentLine[characterIndex])) { continue; }
  			parserFunc(currentLine[characterIndex]);
  		}
  	}
    
    // If we're still inside the declaration, assume no ending tag was found
    if(inProperty) {
      var lastStyle = cssData[cssData.length-1];
      throwEndBlockTagMissingError(lastStyle.line, lastStyle.char);
    // If we're still inside a comment assume no ending tag was found
    } else if(inBlockComment) {
      throwEndingCommentError(commentStartLine, commentStartCharacter);
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
