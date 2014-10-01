// To run: mocha -w closingTagSpec.js

var expect = require('chai').expect,
    validate = require('./cssSyntaxValidator.js'),
    fs = require('fs');
    
var validateCSS = function(path) {
  var css = fs.readFileSync(__dirname + path, 'utf8');
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
  describe("returned cssData", function() {
    it("is an array of declaration objects", function(){
      var cssData = validateCSS('/testCss/basic.css');
      expect(cssData.constructor).to.eq(Array);
    });
    
    describe("declaration Object", function() {
      it("Contains the selector and location data", function(){
        var cssData = validateCSS('/testCss/basic.css');
        
        expect(cssData.length).to.eq(3);
        
        expect(cssData[0]).to.have.property('line', 1);
        expect(cssData[0]).to.have.property('char', 1);
        expect(cssData[0]).to.have.property('selector', 'h1');
        expect(cssData[0]).to.have.property('properties');
        
        expect(cssData[1]).to.have.property('line', 5);
        expect(cssData[1]).to.have.property('char', 1);
        expect(cssData[1]).to.have.property('selector', 'h2');
        expect(cssData[1]).to.have.property('properties');
        
        expect(cssData[2]).to.have.property('line', 10);
        expect(cssData[2]).to.have.property('char', 1);
        expect(cssData[2]).to.have.property('selector', 'div#wrapper');
        expect(cssData[2]).to.have.property('properties');
      });
      
      it("contains properties for the given selector", function(){
        var cssData = validateCSS('/testCss/basic.css');
        
        expect(cssData[0]).to.have.property('properties');
        expect(cssData[0]['properties'].length).to.eq(1);
        expect(cssData[0]['properties'][0]).to.have.property('name', 'color');
        expect(cssData[0]['properties'][0]).to.have.property('value', 'red');
        expect(cssData[0]['properties'][0]).to.have.property('line', 2);
        expect(cssData[0]['properties'][0]).to.have.property('char', 3);
  
        expect(cssData[1]).to.have.property('properties');
        expect(cssData[1]['properties'].length).to.eq(2);
        expect(cssData[1]['properties'][0]).to.have.property('name', 'margin');
        expect(cssData[1]['properties'][0]).to.have.property('value', '0 auto');
        expect(cssData[1]['properties'][0]).to.have.property('line', 6);
        expect(cssData[1]['properties'][0]).to.have.property('char', 3);
        expect(cssData[1]['properties'][1]).to.have.property('name', 'width');
        expect(cssData[1]['properties'][1]).to.have.property('value', '5px');
        expect(cssData[1]['properties'][1]).to.have.property('line', 7);
        expect(cssData[1]['properties'][1]).to.have.property('char', 3);
        
        expect(cssData[2]).to.have.property('properties');
        expect(cssData[2]['properties'].length).to.eq(2);
        expect(cssData[2]['properties'][0]).to.have.property('name', 'width');
        expect(cssData[2]['properties'][0]).to.have.property('value', '800px');
        expect(cssData[2]['properties'][0]).to.have.property('line', 11);
        expect(cssData[2]['properties'][0]).to.have.property('char', 3);
        expect(cssData[2]['properties'][1]).to.have.property('name', 'margin');
        expect(cssData[2]['properties'][1]).to.have.property('value', '0 auto');
        expect(cssData[2]['properties'][1]).to.have.property('line', 12);
        expect(cssData[2]['properties'][1]).to.have.property('char', 3);
      });
    });
  });
   
  describe('missing block bracket', function(){
    it('raises an error', function() {
      expect(function(){ validateCSS('/testCss/missingBlockBracket1.css')}).to.throw(Error);
      expect(function(){ validateCSS('/testCss/missingBlockBracket2.css')}).to.throw(Error)
      expect(function(){ validateCSS('/testCss/missingBlockBracket3.css')}).to.throw(Error)
    });
  
    describe("error data", function() {
      it("contains line data", function() {
         var errorData1 = validateCSSReturnData('/testCss/missingBlockBracket1.css');
         var errorData2 = validateCSSReturnData('/testCss/missingBlockBracket2.css');
         var errorData3 = validateCSSReturnData('/testCss/missingBlockBracket3.css');
  
         expect(errorData1).to.have.property('line', 3);
         expect(errorData1).to.have.property('char', 1);
         expect(errorData1).to.have.property('selector', "h1");
      
         expect(errorData2).to.have.property('line', 1);
         expect(errorData2).to.have.property('char', 1);
         expect(errorData2).to.have.property('selector', ".test h1");
      
         expect(errorData3).to.have.property('line', 5);
         expect(errorData3).to.have.property('char', 1);
         expect(errorData3).to.have.property('selector', ".test h2");
      });
    }); 
  });
  
  describe('missing semicolons', function(){
    it('raises an error', function() {
      expect(function(){ validateCSS('/testCss/missingSemicolons1.css')}).to.throw(Error)
      expect(function(){ validateCSS('/testCss/missingSemicolons2.css')}).to.throw(Error)
      expect(function(){ validateCSS('/testCss/missingSemicolons3.css')}).to.throw(Error)
    }); 
  
    describe("error data", function() {
      it("contains line data", function() {
        var errorData1 = validateCSSReturnData('/testCss/missingSemicolons1.css');
        var errorData2 = validateCSSReturnData('/testCss/missingSemicolons2.css');
        var errorData3 = validateCSSReturnData('/testCss/missingSemicolons3.css');
  
        expect(errorData1).to.have.property('line', 2);
        expect(errorData1).to.have.property('char', 12);
        expect(errorData1).to.have.property('selector', "h1");
  
        expect(errorData2).to.have.property('line', 3);
        expect(errorData2).to.have.property('char', 17);
        expect(errorData2).to.have.property('selector', "h2");
  
        expect(errorData3).to.have.property('line', 6);
        expect(errorData3).to.have.property('char', 18);
        expect(errorData3).to.have.property('selector', ".test h3");
      });
    }); 
  });
  
  describe("multiple line selectors", function(){
    it("does not throw an error", function(){
      expect(function(){ validateCSS('/testCss/multipleLineSelectors.css') }).to.not.throw(Error)
    });
  });

  describe("containing comments", function(){
    it("does not throw an error", function(){
      expect(function(){ validateCSS('/testCss/basicCommented.css') }).to.not.throw(Error)
    });
    
    describe("unclosed comment", function(){
      it("throws an error", function(){
        expect(function(){ validateCSS('/testCss/basicCommentedUnclosed.css') }).to.throw(Error)
      });
      
      describe("error data", function() {
        it("contains line data", function() {
          var errorData1 = validateCSSReturnData('/testCss/basicCommentedUnclosed.css');

          expect(errorData1).to.have.property('line', 23);
          expect(errorData1).to.have.property('char', 2);
          expect(errorData1).to.have.property('selector', "div#wrapper");
        });
      }); 
    });
  });
});
