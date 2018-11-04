Creates an object that fires of the subscriptions on any changes made to the object.

obj.state.addAProp = {}; // This will trigger

...

obj.state.addAProp.nestMe = { a: 6 };  // This will trigger

...

obj.state.addAProp.nestMe.a = 7  // This will trigger
