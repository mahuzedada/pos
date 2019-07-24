const assert = require('assert');
const pos_1 = require("../dist/pos");

describe('PosController', function () {
    describe('Product Input', function(){
        var pos = new pos_1.PosController();
        pos.start();
        it('should run product if uniq partial ID is provided', function(){
            pos.processInput('017');
            assert.strictEqual(pos.cart.length, 1);
        });

        it('should run total when total is typed', function(){
            pos.processInput('total');
            assert.notStrictEqual(pos.total, 0);
        });

    });

});
