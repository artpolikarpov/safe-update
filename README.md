# Safe updae
The behavior of `collection.update` a bit dangerous.

If a modifier doesn't contain any $-operators, then it is instead interpreted as a literal document, and completely replaces whatever was previously in the database.
You may accidentally lose a document in this case:
```
Docs.update('f7uJjPPQJP7Ytf3pE', {important: 1});
```

This package protects you from this and throws if there is no $-operators in the modifier.

But if you still want to rewrite the entire document, just pass the replace:true to the options object:
```
Docs.update('f7uJjPPQJP7Ytf3pE', {deleted: 1}, {replace: true});
```


## Installation
```
meteor add artpolikarpov:safe-update
```

##License
MIT