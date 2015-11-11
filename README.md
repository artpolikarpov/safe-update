# Safer collection.update

I’ve recently erased 45 docs in the database because of the stupid behavior `collection.update`.

This is the story of of how the idea of this package came.

## Look out!
The behavior of `collection.update` in Meteor a bit dangerous.

If you forget to add a $set operator to a mongo modifier or any other $-operator (like $set, $unset, $inc, etc.), then it is instead interpreted as a literal document, and completely replaces whatever was previously in the database.
You may accidentally lose a document if you write this:
```
Docs.update('f7uJjPPQJP7Ytf3pE', {important: 1});
```

...instead of this:
```
Docs.update('f7uJjPPQJP7Ytf3pE', {$set: {important: 1}});
```


## Mkay
This package protects you from this and throws if there is no $-operators in the modifier:
```
Docs.update('f7uJjPPQJP7Ytf3pE', {important: 1});
// /!\ Error: modifier doesn’t contain any $-operators...
```

But if you still want to rewrite the entire document, just pass the `replace:true` to the options object:
```
Docs.update('f7uJjPPQJP7Ytf3pE', {deleted: 1}, {replace: true});
// → One doc updated successfully
```


## Installation
```
meteor add artpolikarpov:safe-update
```

## Usage
Just use [collection.update](http://docs.meteor.com/#/full/update) as usual. You will be warned in case of danger of replacing the docs.
But if replacement of the whole document is what you need, force it using `replace:true`.

### Applying to specific collections

You can apply a plugin to specific collections by passing an `except` or `only` option to the `SAFE_UPDATE_CONFIG` global variable. This is useful for tests and collections from third-party packages.
```
SAFE_UPDATE_CONFIG = {
  except: ['TestCollection']
  // or only: ['Foo', 'Bar']
};
```

:ok_hand:

## License
MIT
