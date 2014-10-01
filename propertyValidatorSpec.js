// To run: mocha -w closingTagSpec.js

var expect = require('chai').expect,
    validate = require('./propertyValidator.js');

describe('propertyValidator', function() { 
  describe('validators', function(){
    describe('color', function(){
      describe('with correct hex color', function(){
        it("does not throw an error", function(){
          expect(function(){ validate.validators.color("#ffffff") }).to.not.throw(Error)
          expect(function(){ validate.validators.color("#fff") }).to.not.throw(Error)
        });
      });
      
      describe('with incorrect hex color', function(){
        describe('missing the leading `#`', function(){
          it("does not throw an error", function(){
            expect(function(){ validate.validators.color("ffffff") }).to.throw(Error, "A `#` is required when using a hex value to set a color.")
            expect(function(){ validate.validators.color("fff") }).to.throw(Error, "A `#` is required when using a hex value to set a color.")
          });
        });
      
        describe('having the wrong number of characters', function(){
          it("does not throw an error", function(){
            expect(function(){ validate.validators.color("#fffff") }).to.throw(Error, "Hex colors can be either 3 or 6 characters long, but got: 5 instead")
            expect(function(){ validate.validators.color("#ff") }).to.throw(Error, "Hex colors can be either 3 or 6 characters long, but got: 2 instead")
          });
        });
        
        describe('having characters above `F`', function(){
          it("does not throw an error", function(){
            expect(function(){ validate.validators.color("#gggggg") }).to.throw(Error, "Hex colors have a max value of `F` but found a value of: g")
            expect(function(){ validate.validators.color("#jjj") }).to.throw(Error, "Hex colors have a max value of `F` but found a value of: j")
          });
        });
      });
      
      describe('with correct RGB color', function(){
        it("does not throw an error", function(){
          expect(function(){ validate.validators.color("rgb(255, 23, 0)") }).to.not.throw(Error)
          expect(function(){ validate.validators.color("rgb(124, 127, 123)") }).to.not.throw(Error)
          expect(function(){ validate.validators.color("rgb(4, 1, 1)") }).to.not.throw(Error)
        });
      });
      
      describe('with incorrect RGB color', function(){
        describe('with a value being greater then 255', function(){
          it("throws an error", function(){
            expect(function(){ validate.validators.color("rgb(295, 23, 0)") }).to.throw(Error, "RGB color values must be 255 or less")
            expect(function(){ validate.validators.color("rgb(255, 300, 0)") }).to.throw(Error, "RGB color values must be 255 or less")
            expect(function(){ validate.validators.color("rgb(255, 23, 400)") }).to.throw(Error, "RGB color values must be 255 or less")
          });
        });
        
        describe('with a value being less then 0', function(){
          it("throws an error", function(){
            expect(function(){ validate.validators.color("rgb(-255, 23, 0)") }).to.throw(Error, "RGB color values must be 0 or greater")
            expect(function(){ validate.validators.color("rgb(255, -2, 0)") }).to.throw(Error, "RGB color values must be 0 or greater")
            expect(function(){ validate.validators.color("rgb(255, 23, -22)") }).to.throw(Error, "RGB color values must be 0 or greater")
          });
        });
        
        describe('with more then 3 color values', function(){
          it("throws an error", function(){
            expect(function(){ validate.validators.color("rgb(255, 23, 0, 123)") }).to.throw(Error, "There should only be 3 color values for rgb colors but found: 4")
            expect(function(){ validate.validators.color("rgb(255, 2, 0, 123)") }).to.throw(Error, "There should only be 3 color values for rgb colors but found: 4")
            expect(function(){ validate.validators.color("rgb(255, 23, 22, 123)") }).to.throw(Error, "There should only be 3 color values for rgb colors but found: 4")
          });
        });
        
        describe('with less then 3 color values', function(){
          it("throws an error", function(){
            expect(function(){ validate.validators.color("rgb(25, 23)") }).to.throw(Error, "Expected there to be 3 color values but got: 2")
            expect(function(){ validate.validators.color("rgb(25, 2)") }).to.throw(Error, "Expected there to be 3 color values but got: 2")
            expect(function(){ validate.validators.color("rgb(25)") }).to.throw(Error, "Expected there to be 3 color values but got: 1")
          });
        });
        
        describe('with a value missing commas', function(){
          it("throws an error", function(){
            expect(function(){ validate.validators.color("rgb(255 23 0)") }).to.throw(Error, "RGB color values must be separated by commas")
            expect(function(){ validate.validators.color("rgb(255 2 0)") }).to.throw(Error, "RGB color values must be separated by commas")
            expect(function(){ validate.validators.color("rgb(255 23 22)") }).to.throw(Error, "RGB color values must be separated by commas")
          });
        });
      });
    });
    
    describe('with correct RGBA color', function(){
      it("does not throw an error", function(){
        expect(function(){ validate.validators.color("rgba(255, 23, 34, 0.5)") }).to.not.throw(Error)
        expect(function(){ validate.validators.color("rgb(124, 127, 123, 0.1)") }).to.not.throw(Error)
        expect(function(){ validate.validators.color("rgb(4, 1, 1, 0.2)") }).to.not.throw(Error)
      });
    });
    
    describe('with incorrect RGBA color', function(){
      describe('with a value being greater then 255', function(){
        it("throws an error", function(){
          expect(function(){ validate.validators.color("rgba(295, 23, 0, 0.3 )") }).to.throw(Error)
          expect(function(){ validate.validators.color("rgba(255, 300, 0, 0.3)") }).to.throw(Error)
          expect(function(){ validate.validators.color("rgba(255, 23, 400, 0.3)") }).to.throw(Error)
        });
      });
      
      describe('with a value being less then 0', function(){
        it("throws an error", function(){
          expect(function(){ validate.validators.color("rgba(-255, 23, 0, 0.5)") }).to.throw(Error)
          expect(function(){ validate.validators.color("rgba(255, -2, 0, 0.4)") }).to.throw(Error)
          expect(function(){ validate.validators.color("rgba(255, 23, -22, 0.4)") }).to.throw(Error)
        });
      });
      
      describe('with a value missing commas', function(){
        it("throws an error", function(){
          expect(function(){ validate.validators.color("rgba(255 23 0 0.4)") }).to.throw(Error, "RGB color values must be separated by commas")
          expect(function(){ validate.validators.color("rgba(255 2 0 0.4)") }).to.throw(Error, "RGB color values must be separated by commas")
          expect(function(){ validate.validators.color("rgba(255, 23, 22 0.4)") }).to.throw(Error, "RGB color values must be separated by commas")
        });
      });
      
      describe('with more then 3 color values', function(){
        it("throws an error", function(){
          expect(function(){ validate.validators.color("rgba(255, 23, 0, 123, 0.4)") }).to.throw(Error, "There should only be 3 color values for rgb colors but found: 4")
          expect(function(){ validate.validators.color("rgba(255, 2, 0, 123, 0.4)") }).to.throw(Error, "There should only be 3 color values for rgb colors but found: 4")
          expect(function(){ validate.validators.color("rgba(255, 23, 22, 123, 0.4)") }).to.throw(Error, "There should only be 3 color values for rgb colors but found: 4")
        });
      });
      
      describe('with less then 3 color values', function(){
        it("throws an error", function(){
          expect(function(){ validate.validators.color("rgba(25, 23)") }).to.throw(Error, "Expected there to be 3 color values but got: 2")
          expect(function(){ validate.validators.color("rgba(25, 2)") }).to.throw(Error, "Expected there to be 3 color values but got: 2")
          expect(function(){ validate.validators.color("rgba(25)") }).to.throw(Error, "Expected there to be 3 color values but got: 1")
        });
      });
      
      describe('with a value missing opacity', function(){
        it("throws an error", function(){
          expect(function(){ validate.validators.color("rgba(255, 23, 0)") }).to.throw(Error, "Expected the last value of rgba to be an opacity value between 0 and 1")
          expect(function(){ validate.validators.color("rgba(255, 2, 0)") }).to.throw(Error, "Expected the last value of rgba to be an opacity value between 0 and 1")
          expect(function(){ validate.validators.color("rgba(255, 23, 22)") }).to.throw(Error, "Expected the last value of rgba to be an opacity value between 0 and 1")
        });
      });
    });
    
    describe('size', function() {
      
    });
  });
});
