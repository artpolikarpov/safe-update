var Test = new Mongo.Collection('Test');

var currentCount = function () {
    return (Test.findOne('counter') || {}).count;
};
var updateCounter = function (options) {
    options = options || {};

    var modifier = {},
        setter = {count: options.inc ? 10 : currentCount() + 1},
        updateOptions = _.pick(options, 'replace');

    if (options.set) {
        modifier.$set = setter;
    } else if (options.inc) {
        modifier.$inc = setter;
    } else {
        modifier = setter;
    }

    return Test.update('counter', modifier, updateOptions);
};

if (Meteor.isServer) {
    if (!Test.findOne('counter')) {
        Test.insert({_id: 'counter', count: 0, another: 'field'});
    } else {
        Test.update('counter', {$set: {another: 'field'}});
    }

    Meteor.methods({
        updateCounter: updateCounter
    });
}

var basicTests = function () {
    Tinytest.add('throws if modifier doesn’t contain any $-operators', function (test) {
        test.throws(function () {
            updateCounter();
        });
    });

    Tinytest.add('doesn’t throws with replace:true', function (test) {
        test.equal(updateCounter({replace: true}), 1, 'one doc should be updated');
    });

    Tinytest.add('update works normally if modifier does contain some $-operators', function (test) {
        var count = currentCount();
        test.equal(updateCounter({set: true}), 1, 'one doc should be updated');
        test.equal(count + 1, currentCount(), '+1 to counter');
        test.equal(updateCounter({inc: true}), 1, 'one doc should be updated');
        test.equal((count + 1) + 10, currentCount(), '+10 to counter');
    });
};

if (Meteor.isServer) {
    // server
    basicTests();
}

if (Meteor.isClient) {
    // client
    Tracker.autorun(function (c) {
        if (typeof currentCount() !== 'undefined') {
            // subscription is ready
            basicTests();
            c.stop();
        }
    });


    testAsyncMulti('update via methods calls behave identically', [
        function (test, expect) {
            Meteor.call('updateCounter', expect(function (error, result) {
                test.instanceOf(error, Meteor.Error, 'error should be here');
            }));

            Meteor.call('updateCounter', {set: true}, expect(function (error, result) {
                test.isUndefined(error, 'error should be undifined');
                test.equal(result, 1, 'one doc should be updated');
            }));
        }
    ]);
}
