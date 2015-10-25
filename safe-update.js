var CollectionOriginal = typeof Mongo !== "undefined" ? Mongo.Collection : Meteor.Collection,
    updateOriginal = CollectionOriginal.prototype.update;

CollectionOriginal.prototype.update = function (selector, modifier, options, callback) {
    var okToUpdate = !modifier || options && options.replace;

    if (!okToUpdate) {
        okToUpdate = _.some(modifier, function (value, operator) {
           return /^\$/.test(operator);
        });
    }

    if (okToUpdate) {
        return updateOriginal.apply(this, arguments);
    } else {
        throw new Meteor.Error(500, 'modifier doesn’t contain any $-operators, if you want to completely replace whatever was previously in the database pass {replace:true} to the update options');
    }
};