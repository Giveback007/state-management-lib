"My application is too small to use redux && I'm ok on mutating state"

A simple state management library using ES6 proxies.
Its as easy as assigning a value to the object, even deeply nested properties.

Creates an object that fires off the subscriptions on any changes made to the object.

obj.state.addAProp = {}; // This will trigger

...

obj.state.addAProp.nestMe = { a: 6 };  // This will trigger

...

obj.state.addAProp.nestMe.a = 7  // This will trigger
