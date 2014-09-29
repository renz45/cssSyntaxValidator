var cssSyntaxValidator = function() {
  var blockStartChar = "{",
      blockEndChar = "}",
      declarationEndChar = ";",
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
      ]
      
  
  var parserFunc, previousParserFunc, currentComment, currentSelector, selectorLine, cssData,
      inLineComment, inBlockComment, inComment, lines, currentLine, currentDeclaration,
      currentDeclarationValue, declarationFound, declarationLine, newDeclaration;

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
    var selector = stripWhiteSpaceFromSelectors(currentSelector).join("\n") || currentStyleBlock().selector
  	return {selector: selector, line: lIndex || lineIndex + 1, char: cIndex|| characterIndex};
  }
  
  var throwStartBlockTagMissingError = function(lIndex, cIndex) {
    var syntaxObj = syntaxObject(lIndex, cIndex);
    var newError = new Error("Starting bracket expected for: '" + syntaxObj.selector + "' at line: " + syntaxObj.line + " char: " + syntaxObj.char);
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
  
  var startingBracketFinder = function(character) {
    
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

  var declarationFinder = function(character) {
    if(character === ":") {
      declarationFound = true;
    } else if(character === blockEndChar) {
      setParserFunc(selectorFinder);
    }else {
      if(character === declarationEndChar) {
        newDeclaration = {};
        // .replace(/^\s*|\s*$/g, '')
        newDeclaration[currentDeclaration] = currentDeclarationValue;
        currentStyleBlock().declarations.push(newDeclaration);
        currentDeclarationValue = "";
        currentDeclaration = "";
        declarationFound = false
      // new line was found before an end of declaration character
      } else if(declarationLine < lineIndex && currentDeclaration.length > 0) {
        throwSemicolonMissingError(lineIndex - 1, lines[lineIndex - 1].length);
      } else {
        if(declarationFound) {
          if(currentDeclarationValue.length < 1 && /\s/.test(character)) {return;}
          currentDeclarationValue += character;
        } else {
          if(currentDeclaration.length < 1 && /\s/.test(character)) {return;}
          currentDeclaration += character;
        }
      }
    }
    declarationLine = lineIndex;
  }
  
  var currentStyleBlock = function() {
    return cssData[cssData.length - 1];
  }
  
  var addDeclarationToCurrent = function(name, value) {
    currentDeclaration = "";
    currentDeclarationValue = "";
    declarationFound = false;
    currentStyleBlock().declarations.push({name: name, value: value});
  }
  
  var newStyleBlock = function() {
    cssData.push({selector: stripWhiteSpaceFromSelectors(currentSelector).join(" "), declarations: []});
    currentSelector = [];
  }
   
  var selectorFinder = function(character) {
    // return early if we're in the middle of a comment
    if(!commentResolved(character)) { return; }

    switch(character){
      case blockStartChar:
        console.log("TODO: Validate selector here")
        newStyleBlock()
        setParserFunc(declarationFinder)
        break;
      case blockEndChar:
        throwStartBlockTagMissingError(lineIndex - 1, currentSelector[currentSelector.length - 1].length);
        break;
      default:
        if(currentSelector[currentSelector.length - 1] && selectorLine < lineIndex && !(/,\s*$/.test(currentSelector[currentSelector.length - 1]))) {
          throwStartBlockTagMissingError(lineIndex - 1, currentSelector[currentSelector.length - 1].length);
        } else {
          if(selectorLine < lineIndex || currentSelector[currentSelector.length - 1] === undefined) { currentSelector.push(""); }
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
    currentDeclarationValue = ""
    currentDeclaration = ""
  	
  	for(lineIndex=0, l = lines.length; lineIndex < l; lineIndex++) {
      currentLine = lines[lineIndex]
  		for(characterIndex=0, ll=lines[lineIndex].length; characterIndex < ll; characterIndex++) {
  			if(!parserFunc) {break;}
  			parserFunc(currentLine[characterIndex], lineIndex, characterIndex)
  		}
  	}
  	console.log(currentStyleBlock())
    // if(currentComment) {
    //   // throwEndingCommentError(currentComment);
    // } else if(startingTags.length > 0) { 
  	// 	var lastStartTag = startingTags[startingTags.length - 1];
  	// 	// throwEndingTagError(lastStartTag);
  	// }
  }

  return checkSyntax;
}

var moduleExists;

try {
  moduleExists = module && module.exports;
} catch(e){}

if(moduleExists) {
  module.exports = cssSyntaxValidator()
} else {
  window.cssSyntaxValidator = cssSyntaxValidator();
}
