"use strict";

var Document = require("./document").Document;
var Anchor = require("./anchor").Anchor;
var Range = require("./range").Range;
var assert = require("./test/assertions");

module.exports = {

    "test create anchor" : function() {
        var doc = new Document("juhu");
        var anchor = new Anchor(doc, 0, 0);
        
        assert.position(anchor.getPosition(), 0, 0);
        assert.equal(anchor.getDocument(), doc);
    },
    
    "test insert text in same row before cursor should move anchor column": function() {
        var doc = new Document("juhu\nkinners");
        var anchor = new Anchor(doc, 1, 4);
        
        doc.insert({row: 1, column: 1}, "123");
        assert.position(anchor.getPosition(), 1, 7);
    },

    "test insert text at anchor should not move anchor when insertRight is true": function() {
        var doc = new Document("juhu\nkinners");
        var anchor = new Anchor(doc, 1, 4);
        anchor.$insertRight = true;
        
        doc.insert({row: 1, column: 4}, "123");
        assert.position(anchor.getPosition(), 1, 4);
    },    
    
    "test insert lines before cursor should move anchor row": function() {
        var doc = new Document("juhu\nkinners");
        var anchor = new Anchor(doc, 1, 4);
        
        doc.insertFullLines(1, ["123", "456"]);
        assert.position(anchor.getPosition(), 3, 4);    
    },

    "test insert lines at anchor position should move anchor down": function() {
        var doc = new Document("juhu\nkinners");
        var anchor = new Anchor(doc, 1, 0);
        
        doc.insertLines(1, ["line"]);
        assert.position(anchor.getPosition(), 2, 0);
    },
    
    "test insert lines at anchor position should not move anchor down when insertRight is true and column is 0": function() {
        var doc = new Document("juhu\nkinners");
        var anchor = new Anchor(doc, 1, 0);
        anchor.$insertRight = true;
        
        doc.insertLines(1, ["line"]);
        assert.position(anchor.getPosition(), 1, 0);
    }, 

    "test insert lines at anchor row should move anchor down when column > 0": function() {
        var doc = new Document("juhu\nkinners");
        var anchor = new Anchor(doc, 1, 2);
        anchor.$insertRight = true;
        
        doc.insertLines(1, ["line"]);
        assert.position(anchor.getPosition(), 2, 2);            
    },
    
    "test insert new line before cursor should move anchor column": function() {
        var doc = new Document("juhu\nkinners");
        var anchor = new Anchor(doc, 1, 4);
        
        doc.insertMergedLines({row: 0, column: 0}, ['', '']);
        assert.position(anchor.getPosition(), 2, 4);    
    },
    
    "test insert new line in anchor line before anchor should move anchor column and row": function() {
        var doc = new Document("juhu\nkinners");
        var anchor = new Anchor(doc, 1, 4);
        
        doc.insertMergedLines({row: 1, column: 2}, ['', '']);
        assert.position(anchor.getPosition(), 2, 2);
    },
    
    "test delete text in anchor line before anchor should move anchor column": function() {
        var doc = new Document("juhu\nkinners");
        var anchor = new Anchor(doc, 1, 4);
        
        doc.remove(new Range(1, 1, 1, 3));
        assert.position(anchor.getPosition(), 1, 2);
    },
    
    "test remove range which contains the anchor should move the anchor to the start of the range": function() {
        var doc = new Document("juhu\nkinners");
        var anchor = new Anchor(doc, 0, 3);
        
        doc.remove(new Range(0, 1, 1, 3));
        assert.position(anchor.getPosition(), 0, 1);
    },
    
    "test delete character before the anchor should have no effect": function() {
        var doc = new Document("juhu\nkinners");
        var anchor = new Anchor(doc, 1, 4);
        
        doc.remove(new Range(1, 4, 1, 5));
        assert.position(anchor.getPosition(), 1, 4);
    },
    
    "test delete lines in anchor line before anchor should move anchor row": function() {
        var doc = new Document("juhu\n1\n2\nkinners");
        var anchor = new Anchor(doc, 3, 4);
        
        doc.removeFullLines(1, 2);
        assert.position(anchor.getPosition(), 1, 4);
    },
    
    "test remove new line before the cursor": function() {
        var doc = new Document("juhu\nkinners");
        var anchor = new Anchor(doc, 1, 4);
        
        doc.removeNewLine(0);
        assert.position(anchor.getPosition(), 0, 8);
    },
    
    "test delete range which contains the anchor should move anchor to the end of the range": function() {
        var doc = new Document("juhu\nkinners");
        var anchor = new Anchor(doc, 1, 4);
        
        doc.remove(new Range(0, 2, 1, 2));
        assert.position(anchor.getPosition(), 0, 4);
    },
    
    "test delete line which contains the anchor should move anchor to the end of the range": function() {
        var doc = new Document("juhu\nkinners\n123");
        var anchor = new Anchor(doc, 1, 5);
        
        doc.removeFullLines(1, 1);
        assert.position(anchor.getPosition(), 1, 0);
    },
    
    "test remove after the anchor should have no effect": function() {
        var doc = new Document("juhu\nkinners\n123");
        var anchor = new Anchor(doc, 1, 2);
        
        doc.remove(new Range(1, 4, 2, 2));
        assert.position(anchor.getPosition(), 1, 2);
    },
    
    "test anchor changes triggered by document changes should emit change event": function(next) {
        var doc = new Document("juhu\nkinners\n123");
        var anchor = new Anchor(doc, 1, 5);
        
        anchor.on("change", function(e) {
            assert.position(anchor.getPosition(), 0, 0);
            next();
        });
        
        doc.remove(new Range(0, 0, 2, 1));
    },
    
    "test only fire change event if position changes": function() {
        var doc = new Document("juhu\nkinners\n123");
        var anchor = new Anchor(doc, 1, 5);
        
        anchor.on("change", function(e) {
            assert.fail();
        });
        
        doc.remove(new Range(2, 0, 2, 1));
    },
    
    "test insert/remove lines at the end of the document": function() {
        var doc = new Document("juhu\nkinners\n123");
        var anchor = new Anchor(doc, 2, 4);
        
        doc.removeFullLines(0, 3);
        assert.position(anchor.getPosition(), 0, 0);
        doc.insertFullLines(0, ["a", "b", "c"]);        
        assert.position(anchor.getPosition(), 3, 0);
        assert.equal(doc.getValue(), "a\nb\nc\n");
    }
};


if (typeof module !== "undefined" && module === require.main) {
    require("asyncjs").test.testcase(module.exports).exec();
}
