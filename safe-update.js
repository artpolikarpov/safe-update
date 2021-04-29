var CollectionOriginal = typeof Mongo !== 'undefined' ? Mongo.Collection : Meteor.Collection,
    updateOriginal = CollectionOriginal.prototype.update,
    emptyConfig = {},
    getConfig = function () {
        if (typeof SAFE_UPDATE_CONFIG !== 'undefined') {
            return SAFE_UPDATE_CONFIG;
        } else {
            return emptyConfig;
        }
    };

CollectionOriginal.prototype.update = function (selector, modifier, options, callback) {
    var allowEmptySelector = options && options.allowEmptySelector;
    if (!allowEmptySelector && _.isEmpty(selector)) {
        throw new Meteor.Error(500, 'selector is empty, if you want to use empty selector pass {allowEmptySelector:true} to the update options');
    }

    var config = getConfig();
    var collectionName = this._name;
    var okToUpdate = !modifier
        || options && options.replace
        || (config.except && _.include(config.except, collectionName))
        || config.only && !_.include(config.only, collectionName);

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
