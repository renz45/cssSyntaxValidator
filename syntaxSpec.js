// To run: mocha -w closingTagSpec.js
// TODO handle leading commas in css selectors


var expect = require('chai').expect,
    validate = require('./cssSyntaxValidator.js'),
    fs = require('fs');
    
var validateCSS = function(path) {
  var css = fs.readFileSync(__dirname + path, 'utf8');
  debugger
  return validate(css);
}

var validateCSSReturnData = function(path) {
  try {
    validateCSS(path)
  } catch(e) {
    return e.lineData;
  }
}

describe('cssSyntaxValidator', function() {  
  describe('missing block bracket', function(){
    it('raises an error', function() {
      expect(function(){ validateCSS('/testCss/missingBlockBracket1.css')}).to.throw(Error);
      expect(function(){ validateCSS('/testCss/missingBlockBracket2.css')}).to.throw(Error)
      expect(function(){ validateCSS('/testCss/missingBlockBracket3.css')}).to.throw(Error)
    });

    // describe("error data", function() {
    //   it("contains line data", function() {
    //     //  var errorData = validateCSSReturnData('/testCss/missingBlockBracket1.css');
    //      var errorData2 = validateCSSReturnData('/testCss/missingBlockBracket3.css');
    // 
    //     //  expect(errorData).to.have.property('line', 5);
    //     //  expect(errorData).to.have.property('char', 1);
    //      
    //      expect(errorData2).to.have.property('line', 4);
    //      expect(errorData2).to.have.property('char', 1);
    //   });
    // }); 
  });
  
  describe('missing semicolons', function(){
    // it('raises an error', function() {
    //   expect(function(){ validateCSS('/testCss/missingSemicolons1.css')}).to.throw(Error)
    //   expect(function(){ validateCSS('/testCss/missingSemicolons2.css')}).to.throw(Error)
    //   expect(function(){ validateCSS('/testCss/missingSemicolons3.css')}).to.throw(Error)
    // }); 
  
    // describe("error data", function() {
    //   xit("contains line data", function() {
    //     //  var errorData = validateCSSReturnData('/testHtml/mismatchedTags.html');
    //      // 
    //     //  expect(errorData).to.have.property('line', 2);
    //     //  expect(errorData).to.have.property('char', 5);
    //     //  expect(errorData).to.have.property('name', "h1");
    //   });
    // }); 
  });
  // 
  // describe('missing block bracket', function(){
  //   it('raises an error', function() {
  //     expect(function(){ validateCSS('/testCss/missingBlockBracket1.css')}).to.throw(Error)
  //     expect(function(){ validateCSS('/testCss/missingBlockBracket2.css')}).to.throw(Error)
  //     expect(function(){ validateCSS('/testCss/missingBlockBracket3.css')}).to.throw(Error)
  //   });
  // 
  //   describe("error data", function() {
  //     xit("contains line data", function() {
  //       //  var errorData = validateCSSReturnData('/testHtml/mismatchedTags.html');
  //        // 
  //       //  expect(errorData).to.have.property('line', 2);
  //       //  expect(errorData).to.have.property('char', 5);
  //       //  expect(errorData).to.have.property('name', "h1");
  //     });
  //   }); 
  // });
});
