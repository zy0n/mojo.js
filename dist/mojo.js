(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Application = require("mojo-application");

function MojoApplication () {
  Application.apply(this, arguments);
}

Application.extend(MojoApplication, {
  plugins: [

    // bootstraps the entire application
    require("mojo-bootstrap"),

    // HTTP router
    require("mojo-router"),

    // contains all the data for your application
    require("mojo-models"),

    // controls what is displayed to the user, and 
    // any user interactions
    require("mojo-views"),

    // template engine - what is rendered, and displayed
    // to the user
    require("mojo-paperclip"),

    // additional functionality
    require("./plugins")
  ]
});

module.exports = MojoApplication;

},{"./plugins":4,"mojo-application":13,"mojo-bootstrap":37,"mojo-models":77,"mojo-paperclip":95,"mojo-router":97,"mojo-views":158}],2:[function(require,module,exports){
require("zepto"); 
},{"zepto":339}],3:[function(require,module,exports){
(function (process,global){
var MojoApplication = require("./application"),
BaseApplication     = require("mojo-application");

if (process.browser) {
  require("./includes");
}

// default template engine
require("paperclip");

// paperclip template parser - registered as a global
require("paperclip/lib/parser");
global.application = BaseApplication.main = new MojoApplication();

// expose ns
module.exports = global.mojo = {
  application : global.application,
  Application : MojoApplication,
  Object      : require("bindable-object"),
  Collection  : require("bindable-collection"),
  views       : require("mojo-views"),
  models      : require("mojo-models")
};

}).call(this,require("OpdoqP"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./application":1,"./includes":2,"OpdoqP":65,"bindable-collection":6,"bindable-object":7,"mojo-application":13,"mojo-models":77,"mojo-views":158,"paperclip":257,"paperclip/lib/parser":279}],4:[function(require,module,exports){
module.exports = function (app) {
  app.use(require("./waitForDOM"));
}
},{"./waitForDOM":5}],5:[function(require,module,exports){
module.exports = function (app) {
  app.mediator.on("pre bootstrap", function (message, next) {
    $(document).ready(function () {
      next();
    });
  });
}
},{}],6:[function(require,module,exports){
"use strict";

var BindableObject = require("bindable-object");

/** 
 * @module mojo
 * @submodule mojo-core
 */

/**
 * @class BindableCollection
 * @extends BindableObject
 */

/**
 * Emitted when an item is inserted
 * @event insert
 * @param {Object} item inserted
 */


/**
 * Emitted when an item is removed
 * @event remove
 * @param {Object} item removed
 */

/**
 * Emitted when items are replaced
 * @event replace
 * @param {Array} newItems
 * @param {Array} oldItems
 */



function BindableCollection (source) {
  BindableObject.call(this, this);
  this.source = source || [];
  this._updateInfo();
  var self = this;
  this.bind("source", function (source) {
    self._onSourceChange(source);
  });
}

/**
 */

BindableObject.extend(BindableCollection, {

  /**
   */

  __isBindableCollection: true,

  /**
   */

  _onSourceChange: function (source) {
    if (!source) this.source = [];
    this._updateInfo();
    // this.emit("update", { insert: source, remove: this._currentSource })
    this.emit("reset", this._currentSource = source);
  },
  
  /**
   * Resets the collection. Same as `source(value)`.
   */

  reset: function (source) {
    return this.set("source", source);
  },

  /**
   * Returns the index of a value
   * @method indexOf
   * @param {Object} object to get index of
   * @returns {Number} index or -1 (not found)
   */

  indexOf: function (item) {
    return this.source.indexOf(item);
  },

  /**
   * filters the collection
   * @method filter
   * @returns {Array} array of filtered items
   */

  filter: function (fn) {
    return this.source.filter(fn);
  },

  /**
   * Returns an object at the given index
   * @method at
   * @returns {Object} Object at specific index
   */

  at: function (index) {
    return this.source[index];
  },

  /**
   * forEach item
   * @method each
   * @param {Function} fn function to call for each item
   */

  each: BindableObject.computed(["length"], function (fn) {
    this.source.forEach(fn);
  }),

  /**
   */

  map: function (fn) {
    return this.source.map(fn);
  },

  /**
   */

  join: function (sep) {
    return this.source.join(sep);
  },

  /**
   */

  slice: function () {
    return this.source.slice.apply(this.source, arguments);
  },

  /**
   * Pushes an item onto the collection
   * @method push
   * @param {Object} item
   */

  push: function () {
    var items = Array.prototype.slice.call(arguments);
    this.source.push.apply(this.source, items);
    this._updateInfo();

    // DEPRECATED
    this.emit("insert", items[0], this.length - 1);
    this.emit("update", { insert: items, index: this.length - 1});
  },

  /**
   * Unshifts an item onto the collection
   * @method unshift
   * @param {Object} item
   */

  unshift: function () {

    var items = Array.prototype.slice.call(arguments);
    this.source.unshift.apply(this.source, items);
    this._updateInfo();

    // DEPRECATED
    this.emit("insert", items[0], 0);
    this.emit("update", { insert: items });
  },

  /**
   * Removes N Number of items
   * @method splice
   * @param {Number} index start index
   * @param {Number} count number of items to remove
   */

  splice: function (index, count) {
    var newItems = Array.prototype.slice.call(arguments, 2),
    oldItems     = this.source.splice.apply(this.source, arguments);

    this._updateInfo();

    // DEPRECATED
    this.emit("replace", newItems, oldItems, index);
    this.emit("update", { insert: newItems, remove: oldItems });
  },

  /**
   * Removes an item from the collection
   * @method remove
   * @param {Object} item item to remove
   */

  remove: function (item) {
    var i = this.indexOf(item);
    if (!~i) return false;
    this.source.splice(i, 1);
    this._updateInfo();

    this.emit("remove", item, i);
    this.emit("update", { remove: [item] });
    return item;
  },

  /**
   * Removes an item from the end
   * @method pop
   * @returns {Object} removed item
   */

  pop: function () {
    if (!this.source.length) return;
    return this.remove(this.source[this.source.length - 1]);
  },

  /**
   * Removes an item from the beginning
   * @method shift
   * @returns {Object} removed item
   */

  shift: function () {
    if (!this.source.length) return;
    return this.remove(this.source[0]);
  },

  /*
   */

  toJSON: function () {
    return this.source.map(function (item) {
      return item && item.toJSON ? item.toJSON() : item;
    });
  },

  /*
   */

  _updateInfo: function () {
    this.setProperties({
      first  : this.source.length ? this.source[0] : void 0,
      length : this.source.length,
      empty  : !this.source.length,
      last   : this.source.length ? this.source[this.source.length - 1] : void 0
    });
  }
});

module.exports = BindableCollection;

},{"bindable-object":7}],7:[function(require,module,exports){
"use strict";

var EventEmitter    = require("fast-event-emitter"),
protoclass          = require("protoclass"),
watchProperty       = require("./watchProperty"),
toarray             = require("toarray");

/**
 */

function BindableObject (properties) {

  if (properties)
  for (var key in properties) {
    this[key] = properties[key];
  }

  EventEmitter.call(this);
}

watchProperty.BindableObject = BindableObject;

protoclass(EventEmitter, BindableObject, {

  /**
   */

  __isBindable: true,

  /**
   */

  get: function (property) {

    var isString;

    // optimal
    if ((isString = (typeof property === "string")) && !~property.indexOf(".")) {
      return this[property];
    }

    // avoid split if possible
    var chain    = isString ? property.split(".") : property,
    currentValue = this,
    currentProperty;

    // go through all the properties
    for (var i = 0, n = chain.length - 1; i < n; i++) {

      currentValue    = currentValue[chain[i]];

      if (!currentValue) return;
    }

    // might be a bindable object
    if(currentValue) return currentValue[chain[i]];
  },

  /**
   */

  setProperties: function (properties) {
    this.emit("willSetProperties");
    for (var property in properties) {
      this.set(property, properties[property]);
    }
    this.emit("didSetProperties");
    return this;
  },

  /**
   */

  set: function (property, value) {

    var isString, hasChanged, oldValue, chain;

    // optimal
    if ((isString = (typeof property === "string")) && !~property.indexOf(".")) {
      hasChanged = (oldValue = this[property]) !== value;
      if (hasChanged) this[property] = value;
    } else {

      // avoid split if possible
      chain     = isString ? property.split(".") : property;

      var currentValue  = this,
      previousValue,
      currentProperty,
      newChain;

      for (var i = 0, n = chain.length - 1; i < n; i++) {

        currentProperty = chain[i];
        previousValue   = currentValue;
        currentValue    = currentValue[currentProperty];


        // need to take into account functions - easier not to check
        // if value exists
        if (!currentValue /* || (typeof currentValue !== "object")*/) {
          currentValue = previousValue[currentProperty] = {};
        }

        // is the previous value bindable? pass it on
        if (currentValue.__isBindable) {

          newChain = chain.slice(i + 1);
          // check if the value has changed
          hasChanged = (oldValue = currentValue.get(newChain)) !== value;
          currentValue.set(newChain, value);
          currentValue = oldValue;
          break;
        }
      }


      if (!newChain && (hasChanged = (currentValue !== value))) {
        currentProperty = chain[i];
        oldValue = currentValue[currentProperty];
        currentValue[currentProperty] = value;
      }
    }

    if (!hasChanged) return value;

    var prop = chain ? chain.join(".") : property;

    this.emit("change:" + prop, value, oldValue);
    this.emit("change", prop, value, oldValue);
    return value;
  },

  /**
   */

  bind: function (property, fn, now) {
    return watchProperty(this, property, fn, now);
  },

  /**
   */

  dispose: function () {
    this.emit("dispose");
  },

  /**
   */

  toJSON: function () {
    var obj = {}, value;

    var keys = Object.keys(this);

    for (var i = 0, n = keys.length; i < n; i++) {
      var key = keys[i];
      if (key.substr(0, 2) === "__") continue;
      value = this[key];

      if(value && value.__isBindable) {
        value = value.toJSON();
      }

      obj[key] = value;
    }

    return obj;
  }
});


BindableObject.computed = function (properties, fn) {
  properties = toarray(properties);
  fn.compute = properties;
  return fn;
};

module.exports = BindableObject;

},{"./watchProperty":9,"fast-event-emitter":10,"protoclass":11,"toarray":12}],8:[function(require,module,exports){
"use strict";

var toarray = require("toarray");

/** 
 * @module mojo
 * @submodule mojo-core
 */

/**
 * created when the second parameter on `bind(property, listener)` is an object.
 *
 * @class BindingTransformer
 * @protected
 */


function getToPropertyFn (target, property) {
  return function (value) {
    target.set(property, value);
  };
}


function hasChanged (oldValues, newValues) {

  if (oldValues.length !== newValues.length) return true;

  for (var i = newValues.length; i--;) {
    if (newValues[i] !== oldValues[i]) return true;
  }
  return false;
}

function wrapFn (fn, previousValues, max) {

  var numCalls = 0;

  return function () {

    var values = Array.prototype.slice.call(arguments, 0),
    newValues  = (values.length % 2) === 0 ? values.slice(0, values.length / 2) : values;


    if (!hasChanged(newValues, previousValues)) return;


    if (~max && ++numCalls >= max) {
      this.dispose();
    }

    previousValues = newValues;


    fn.apply(this, values);
  };
}

function transform (bindable, fromProperty, options) {

  var when        = options.when         || function() { return true; },
  map             = options.map          || function () { return Array.prototype.slice.call(arguments, 0); },
  target          = options.target       || bindable,
  max             = options.max          || (options.once ? 1 : void 0) || -1,
  tos             = toarray(options.to).concat(),
  previousValues  = toarray(options.defaultValue),
  toProperties    = [],
  bothWays        = options.bothWays,
  i;

  
  if (!when.test && typeof when === "function") {
    when = { test: when };
  }

  if (!previousValues.length) {
    previousValues.push(void 0);
  }

  if (!tos.length) {
    throw new Error("missing 'to' option");
  }

  for (i = tos.length; i--;) {

    var to = tos[i],
    tot    = typeof to;

    /*
     need to convert { property: { map: fn}} to another transformed value, which is
     { map: fn, to: property }
     */

    if (tot === "object") {

      // "to" might have multiple properties we're binding to, so 
      // add them to the END of the array of "to" items
      for (var property in to) {

        // assign the property to the 'to' parameter
        to[property].to = property;
        tos.push(transform(target, fromProperty, to[property]));
      }

      // remove the item, since we just added new items to the end
      tos.splice(i, 1);

    // might be a property we're binding to
    } else if(tot === "string") {
      toProperties.push(to);
      tos[i] = wrapFn(getToPropertyFn(target, to), previousValues, max);
    } else if (tot === "function") {
      tos[i] = wrapFn(to, previousValues, max);
    } else {
      throw new Error("'to' must be a function");
    }
  }

  // two-way data-binding
  if (bothWays) {
    for (i = toProperties.length; i--;) {
      target.bind(toProperties[i], { to: fromProperty });
    }
  }

  // newValue, newValue2, oldValue, oldValue2
  return function () {

    var values = toarray(map.apply(this, arguments));

    // first make sure that we don't trigger the old value
    if (!when.test.apply(when, values)) return;

    for (var i = tos.length; i--;) {
      tos[i].apply(this, values);
    }
  };
}

module.exports = transform;
},{"toarray":12}],9:[function(require,module,exports){
"use strict";

var transform   = require("./transform");

function extend (to, from) {
  for (var key in from) {
    to[key] = from[key];
  }
  return to;
}


function watchSimple (bindable, property, fn) {

  bindable.emit("watching", [property]);

  var listener = bindable.on("change:" + property, function () {
    fn.apply(self, arguments);
  }), self;

  self = {

    /** 
     * the target bindable object
     * @property target
     * @type {BindableObject}
     */

    target: bindable,

    /**
     * triggers the binding listener
     * @method now
     */

    now: function () {
      fn.call(self, bindable.get(property));
      return self;
    },

    /**
     * disposes the binding
     * @method dispose
     */

    dispose: function () {
      listener.dispose();
    },

    /**
     */

    pause: function () {
      self.dispose();
      self.now = function () { return this; };
    },

    /**
     */

    resume: function () {
      self.pause();
      extend(self, watchSimple(bindable, property, fn));
      return self;
    }
  };

  return self;
}

/*
 * bindable.bind("a.b.c.d.e", fn);
 */


function watchChain (bindable, hasComputed, chain, fn) {

  var listeners = [], values = hasComputed ? [] : undefined, self;


  var onChange = function () {
    dispose();
    listeners = [];
    values = hasComputed ? [] : void 0;
    bind(bindable, chain);
    self.now();
  };

  /*
  if (hasComputed && process.browser) {
    onChange = debounce(bindable, onChange);
  }*/

  function runComputed (eachChain, pushValues) {
    return function (item) {
      if (!item) return;

        // wrap around bindable object as a helper
        if (!item.__isBindable) {
          item = new module.exports.BindableObject(item);
        }

        bind(item, eachChain, pushValues);
    };
  }

  function bind (target, chain, pushValues) {

    var currentChain = [], subValue, currentProperty, i, j, n, computed, hadComputed, pv, cv = target;

    // need to run through all variations of the property chain incase it changes
    // in the bindable.object. For instance:
    // target.bind("a.b.c", fn); 
    // triggers on
    // target.set("a", obj);
    // target.set("a.b", obj);
    // target.set("a.b.c", obj);

    // does it have @each in there? could be something like
    // target.bind("friends.@each.name", function (names) { })
    if (hasComputed) {

      i = 0;
      n = chain.length;

      for (; i < n; i++) {

        currentChain.push(chain[i]);
        currentProperty = chain[i];

        target.emit("watching", currentChain);

        // check for @ at the beginning
        computed = (currentProperty.charCodeAt(0) === 64);

        if (computed) {
          hadComputed = true;
          // remove @ - can't be used to fetch the propertyy
          currentChain[i] = currentProperty = currentChain[i].substr(1);
        }
        
        pv = cv;
        if (cv) cv = cv[currentProperty];

        if (computed && cv) {


          // used in cases where the collection might change that would affect 
          // this binding. length for instance on the collection...
          if (cv.compute) {
            for (j = cv.compute.length; j--;) {
              bind(target, [cv.compute[j]], false);
            }
          }

          // the sub chain for each of the items from the loop
          var eachChain = chain.slice(i + 1);

          // call the function, looping through items
          cv.call(pv, runComputed(eachChain, pushValues));
          break;
        } else if (cv && cv.__isBindable && i !== n - 1) {
          bind(cv, chain.slice(i + 1), false);
          cv = cv.__context;
        }

        listeners.push(target.on("change:" +  currentChain.join("."), onChange));

      } 

      if (!hadComputed && pushValues !== false) {
        values.push(cv);
      }

    } else {
      i = 0;
      n = chain.length;

      for (; i < n; i++) {
        currentProperty = chain[i];
        currentChain.push(currentProperty);

        target.emit("watching", currentChain);

        if (cv) cv = cv[currentProperty];

        // pass the watch onto the bindable object, but also listen 
        // on the current target for any
        if (cv && cv.__isBindable && i !== n - 1) {
          bind(cv, chain.slice(i + 1), false);
        }

        listeners.push(target.on("change:" + currentChain.join("."), onChange));
      }

      if (pushValues !== false) values = cv;
    }
  }

  function dispose () {
    if (!listeners) return;
    for (var i = listeners.length; i--;) {
      listeners[i].dispose();
    }
    listeners = [];
  }

  self = {
    target: bindable,
    now: function () {
      fn.call(self, values);
      return self;
    },
    dispose: dispose,
    pause: function () {
      self.dispose();
      self.now = function () { return this; };
    },
    resume: function () {
      self.pause();
      extend(self, watchChain(bindable, hasComputed, chain, fn));
      return self;
    }
  };

  bind(bindable, chain);

  return self;
}

/**
 */

function watchMultiple (bindable, chains, fn) { 

  var values  = new Array(chains.length),
  oldValues   = new Array(chains.length),
  bindings    = new Array(chains.length),
  fn2         = fn,
  _pause      = false,
  _hasChanged = false,
  self;

  bindings.push(bindable.on("willSetProperties", function () {
    _pause      = true;
    _hasChanged = false;
  }));

  bindings.push(bindable.on("didSetProperties", function () {
    _pause = false;
    if (_hasChanged) onChange();
  }));

  function onChange () {
    _hasChanged = true;
    if (_pause) return;
    fn2.apply(this, values.concat(oldValues));
  }

  function setValues () {
    oldValues = values.concat();
    values    = chains.map(function (property) { 
      return bindable.get(property); 
    });
  }


  chains.forEach(function (chain, i) {
    bindings[i] = bindable.bind(chain, function (value, oldValue) {
      values[i]    = value;
      oldValues[i] = oldValue;
      onChange();
    });
  });

  self = {
    target: bindable,
    now: function () {
      setValues();
      onChange();
      return self;
    },
    dispose: function () {
      for (var i = bindings.length; i--;) {
        bindings[i].dispose();
      }
      bindings = [];
    },
    pause: function () {
      self.dispose();
      self.now = function () { return self; };
    },
    resume: function () {
      self.pause();
      extend(self, watchMultiple(bindable, chains, fn));
      return self;
    }
  };
  return self;
}

/**
 */

function watchProperty (bindable, property, fn) {

  if (typeof fn === "object") {
    fn = transform(bindable, property, fn);
  }

  // TODO - check if is an array
  var chain;

  if (typeof property === "string") {
    if (~property.indexOf(",")) {
      return watchMultiple(bindable, property.split(/[,\s]+/), fn);
    } else if (~property.indexOf(".")) {
      chain = property.split(".");
    } else {
      chain = [property];
    }
  } else {
    chain = property;
  }

  // collection.bind("length")
  if (chain.length === 1) {
    return watchSimple(bindable, property, fn);

  // person.bind("city.zip")
  } else {
    return watchChain(bindable, ~property.indexOf("@"), chain, fn);
  }
}

module.exports = watchProperty;
},{"./transform":8}],10:[function(require,module,exports){
"use strict";
var protoclass = require("protoclass");

/**
 * @module mojo
 * @submodule mojo-core
 */

/**
 * @class EventEmitter
 */

function EventEmitter () {
  this.__events = {};
}

/**
 * adds a listener on the event emitter
 *
 * @method on
 * @param {String} event event to listen on
 * @param {Function} listener to callback when `event` is emitted.
 * @returns {Disposable}
 */


EventEmitter.prototype.on = function (event, listener) {

  if (typeof listener !== "function") {
    throw new Error("listener must be a function for event '"+event+"'");
  }

  var listeners;
  if (!(listeners = this.__events[event])) {
    this.__events[event] = listener;
  } else if (typeof listeners === "function") {
    this.__events[event] = [listeners, listener];
  } else {
    listeners.push(listener);
  }

  var self = this;

  return {
    dispose: function() {
      self.off(event, listener);
    }
  };
};

/**
 * removes an event emitter
 * @method off
 * @param {String} event to remove
 * @param {Function} listener to remove
 */

EventEmitter.prototype.off = function (event, listener) {

  var listeners;

  if(!(listeners = this.__events[event])) {
    return;
  }

  if (typeof listeners === "function") {
    this.__events[event] = undefined;
  } else {
    var i = listeners.indexOf(listener);
    if (~i) listeners.splice(i, 1);
    if (!listeners.length) {
      this.__events[event] = undefined;
    }
  }
};

/**
 * adds a listener on the event emitter
 * @method once
 * @param {String} event event to listen on
 * @param {Function} listener to callback when `event` is emitted.
 * @returns {Disposable}
 */


EventEmitter.prototype.once = function (event, listener) {

  if (typeof listener !== "function") {
    throw new Error("listener must be a function for event '"+event+"'");
  }

  function listener2 () {
    disp.dispose();
    listener.apply(this, arguments);
  }

  var disp = this.on(event, listener2);
  disp.target = this;
  return disp;
};

/**
 * emits an event
 * @method emit
 * @param {String} event
 * @param {String}, `data...` data to emit
 */


EventEmitter.prototype.emit = function (event) {

  if (this.__events[event] === undefined) return;

  var listeners = this.__events[event],
  n = arguments.length,
  args,
  i,
  j;

  if (typeof listeners === "function") {
    if (n === 1) {
      listeners();
    } else {
      switch(n) {
        case 2:
          listeners(arguments[1]);
          break;
        case 3:
          listeners(arguments[1], arguments[2]);
          break;
        case 4:
          listeners(arguments[1], arguments[2], arguments[3]);
          break;
        default:
          args = new Array(n - 1);
          for(i = 1; i < n; i++) args[i-1] = arguments[i];
          listeners.apply(this, args);
    }
  }
  } else {
    args = new Array(n - 1);
    for(i = 1; i < n; i++) args[i-1] = arguments[i];
    for(j = listeners.length; j--;) {
      if(listeners[j]) listeners[j].apply(this, args);
    }
  }
};

/**
 * removes all listeners
 * @method removeAllListeners
 * @param {String} event (optional) removes all listeners of `event`. Omitting will remove everything.
 */

EventEmitter.prototype.removeAllListeners = function (event) {
  if (arguments.length === 1) {
    this.__events[event] = undefined;
  } else {
    this.__events = {};
  }
};

module.exports = EventEmitter;

},{"protoclass":11}],11:[function(require,module,exports){
function _copy (to, from) {

  for (var i = 0, n = from.length; i < n; i++) {

    var target = from[i];

    for (var property in target) {
      to[property] = target[property];
    }
  }

  return to;
}

function protoclass (parent, child) {

  var mixins = Array.prototype.slice.call(arguments, 2);

  if (typeof child !== "function") {
    if(child) mixins.unshift(child); // constructor is a mixin
    child   = parent;
    parent  = function() { };
  }

  _copy(child, parent); 

  function ctor () {
    this.constructor = child;
  }

  ctor.prototype  = parent.prototype;
  child.prototype = new ctor();
  child.__super__ = parent.prototype;
  child.parent    = child.superclass = parent;

  _copy(child.prototype, mixins);

  protoclass.setup(child);

  return child;
}

protoclass.setup = function (child) {


  if (!child.extend) {
    child.extend = function(constructor) {

      var args = Array.prototype.slice.call(arguments, 0);

      if (typeof constructor !== "function") {
        args.unshift(constructor = function () {
          constructor.parent.apply(this, arguments);
        });
      }

      return protoclass.apply(this, [this].concat(args));
    }

    child.mixin = function(proto) {
      _copy(this.prototype, arguments);
    }

    child.create = function () {
      var obj = Object.create(child.prototype);
      child.apply(obj, arguments);
      return obj;
    }
  }

  return child;
}


module.exports = protoclass;
},{}],12:[function(require,module,exports){
module.exports = function(item) {
  if(item === undefined)  return [];
  return Object.prototype.toString.call(item) === "[object Array]" ? item : [item];
}
},{}],13:[function(require,module,exports){
var BindableObject = require("bindable-object"),
nofactor           = require("nofactor");

function Application (options) {
  if (!options) options = {};
  Application.parent.call(this, this);
  this.setProperties(options);
  this.nodeFactory = options.nodeFactory || nofactor["default"];
  this.models      = new BindableObject();
  this._registerPlugins();

  var self = this;
}

module.exports = BindableObject.extend(Application, {

  /**
   */

  plugins: [],

  /**
   */

  _registerPlugins: function () {

    var cp = this, parentPlugins = [];

    // inherit all plugins from the parent
    while (cp) {
      parentPlugins.push(cp.plugins || []);
      cp = cp.constructor.__super__;
    }


    for (var i = parentPlugins.length; i--;) {
      this.use.apply(this, parentPlugins[i]);
    }

    this.registerPlugins();
  },

  /**
   */

  registerPlugins: function () {

  },

  /**
   */

  willInitialize: function () {
    // OVERRIDE ME
  },

  /**
   */

  didInitialize: function () {
    // OVERRIDE ME
  },

  /**
   * Plugins to use for the mojo application.
   *
   * @method use
   * @param {Function} plugins... must be defined as `function (app) { }`
   */

  use: function () {

    // simple impl - go through each arg and pass self ref
    for(var i = 0, n = arguments.length; i < n; i++) {
      arguments[i](this);
    }

    return this;
  },

  /**
   */

  initialize: function () {
    
    if (this._initialized) throw new Error("cannot initialize application more than once");
    this._initialized = true;

    var args = Array.prototype.slice.call(arguments, 0);
    this.willInitialize.apply(this, args);
    this.emit.apply(this, ["initialize"].concat(args));
    this.didInitialize.apply(this, args);
  }
});


module.exports.main = new Application();
},{"bindable-object":7,"nofactor":17}],14:[function(require,module,exports){
var protoclass = require("protoclass");


/**
 * @module mojo
 * @module mojo-core
 */


/**


  
@class BaseNodeFactory
*/

function BaseFactory () {

}

protoclass(BaseFactory, {

  /**
   * creates a new element
   * @method createElement
   * @param {String} name name of the element
   * @returns {ElementNode}
   */

  createElement: function (element) {},

  /**
   * creates a new fragment
   * @method createFragment
   * @returns {FragmentNode}
   */

  createFragment: function () { },

  /**
   * creates a new comment
   * @method createComment
   * @returns {CommentNode}
   */

  createComment: function (value) { },

  /**
   * creates a new text node
   * @method createTextNode
   * @returns {TextNode}
   */

  createTextNode: function (value) { },

  /*
   */

  parseHtml: function (content) { }
});



module.exports = BaseFactory;

},{"protoclass":36}],15:[function(require,module,exports){
var BaseFactory = require("./base"),
factories       = require("factories");

/**
 * @module
 * @submodule mojo-core
 */

/**

### Example

```javascript
var nofactor = require("nofactor");

// use string factory
customNodeFactory = nofactor.custom(nofactor.string);

// register BR void element
customNodeFactory.registerElement("br", nofactor.string.Element.extend({
	toString: function () {
		return "<" + this.name + ">";
	}
}));
// <br>
console.log(customNodeFactory.createElement("br").toString());
```

 @class CustomNodeFactory
 @extends BaseNodeFactory
 @constructor
 @param {BaseNodeFactory} nodeFactory the main node factory to call
*/


function CustomFactory (mainFactory, elements) {
	BaseFactory.call(this);
	this._mainFactory = mainFactory;

	if (!mainFactory) {
		throw new Error("main factory must be provided. User string, or dom");
	}

	this._factories = {
		element: {}
	}

	if (elements) {
		for (var name in elements) {
			this.registerElement(name, elements[name]);
		}
	}
}


BaseFactory.extend(CustomFactory, {

	/**
	 * Registers a new element class
	 * @method registerElement
	 * @param {String} name name of the element
	 * @param {Class} The element class
	 */

	registerElement: function (name, factory) {
		this._factories.element[name] = factories.factory.create(factory);
		return this;
	},

	/*
	 */

	createElement: function (name) {
		var factory = this._factories.element[name];
		if (factory) return factory.create(name);
		return this._mainFactory.createElement(name);
	},


	/*
	 */

	createComment: function (text) {
		return this._mainFactory.createComment(text);
	},

	/*
	 */

	createTextNode: function (text) {
		return this._mainFactory.createTextNode(text);
	},

	/*
	 */

	createFragment: function () {
		return this._mainFactory.createFragment.apply(this._mainFactory, arguments);
	},

	/**
	 */

	parseHtml: function (source) {
		return this._mainFactory.parseHtml(source);
	}
});

module.exports = function (mainFactory, elements) {
	return new CustomFactory(mainFactory, elements);
};

},{"./base":14,"factories":33}],16:[function(require,module,exports){
var Base = require("./base");

/**
 * @module mojo
 * @module mojo-core
 */

/**
 * @class DomFactory
 * @extends BaseNodeFactory
 */


function DomFactory () {

}


Base.extend(DomFactory, {

  /*
   */

  name: "dom",

  /*
   */

  createElement: function (name) {
    return document.createElement(name);
  },

  /*
   */

  createComment: function (value) {
    return document.createComment(value);
  },

  /*
   */

  createTextNode: function (value) {
    return document.createTextNode(value);
  },

  /*
   */

  createFragment: function (children) {

    if (!children) children = [];

    var frag = document.createDocumentFragment()

    var childrenToArray = [];

    for (var i = 0, n = children.length; i < n; i++) {
      childrenToArray.push(children[i]);
    }

    for(var j = 0, n2 = childrenToArray.length; j < n2; j++) {
      frag.appendChild(childrenToArray[j]);
    }

    return frag;
  }
});

module.exports = new DomFactory();
},{"./base":14}],17:[function(require,module,exports){
module.exports = {
  string  : require("./string"),
  dom     : require("./dom"),
  custom  : require("./custom")
};

module.exports["default"] = typeof window !== "undefined" ? module.exports.dom : module.exports.custom(module.exports.string, module.exports.string.voidElements);

if (typeof window !== "undefined") {
  window.nofactor = module.exports;
}
},{"./custom":15,"./dom":16,"./string":22}],18:[function(require,module,exports){
var Text = require("./text");

function Comment () {
  Comment.superclass.apply(this, arguments);
}

Text.extend(Comment, {

  /**
   */

  nodeType: 8,

  /**
   */

  getInnerHTML: function () {
    return "<!--" + Comment.__super__.getInnerHTML.call(this) + "-->";
  },

  /**
   */

  cloneNode: function () {
    var clone = new Comment(this.nodeValue);
    clone._buffer = this._buffer;
    return clone;
  }
});

module.exports = Comment;
},{"./text":25}],19:[function(require,module,exports){
var Node = require("./node");

function Container () {
  this.childNodes = [];
}

Node.extend(Container, {

  /**
   */

  appendChild: function (node) {

    if (node.nodeType === 11 && node.childNodes.length) {
      while (node.childNodes.length) {
        this.appendChild(node.childNodes[0]);
      }
      return;
    }

    if (node === this) return;

    this._unlink(node);
    this.childNodes.push(node);
    this._link(node);
    this._triggerChange();
  },

  /**
   */

  prependChild: function (node) {
    if (!this.childNodes.length) {
      this.appendChild(node);
    } else {
      this.insertBefore(node, this.childNodes[0]);
    }
  },

  /**
   */

  removeChild: function (child) {
    var i = this.childNodes.indexOf(child);

    if (!~i) return;

    this.childNodes.splice(i, 1);

    if (child.previousSibling) child.previousSibling.nextSibling = child.nextSibling;
    if (child.nextSibling)     child.nextSibling.previousSibling = child.previousSibling;

    child.parentNode      = void 0;
    child.nextSibling     = void 0;
    child.previousSibling = void 0;
    this._triggerChange();
  },

  /**
   */

  insertBefore: function (newElement, before) {

    if (newElement.nodeType === 11) {
      var before, node;
      for (var i = newElement.childNodes.length; i--;) {
        this.insertBefore(node = newElement.childNodes[i], before);
        before = node;
      }
    }

    if (newElement == before || newElement === this) {
      return;
    }

    if (newElement) this._unlink(newElement);

    var index = this.childNodes.indexOf(before)

    if (typeof index === "undefined") return;
    if (!~index) return;
    
    this.childNodes.splice(index, 0, newElement);

    if (newElement) this._link(newElement);
    this._triggerChange();

  },

  /**
   */

  _unlink: function (node) {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  },

  /**
   */

  _link: function (node) {

    if (!node.__isNode) {
      throw new Error("cannot append non-node");
    }

    node.parentNode = this;
    var i = this.childNodes.indexOf(node);

    // FFox compatible
    if (i !== 0)                         node.previousSibling = this.childNodes[i - 1];
    if (i != this.childNodes.length - 1) node.nextSibling     = this.childNodes[i + 1];

    if (node.previousSibling) node.previousSibling.nextSibling = node;
    if (node.nextSibling)     node.nextSibling.previousSibling = node;
  }
});

module.exports = Container;
},{"./node":23}],20:[function(require,module,exports){
var Container = require("./container"),
Style         = require("./style");

function Element (nodeName) {
  Element.superclass.call(this);

  this.nodeName    = nodeName.toUpperCase();
  this._name       = nodeName.toLowerCase();
  this.attributes  = [];
  this._attrsByKey = {};
  this.style       = new Style(this);
}

Container.extend(Element, {

  /**
   */

  nodeType: 3,

  /**
   */

  setAttribute: function (name, value) {

    name = name.toLowerCase();

    // if the name is a
    if (name === "style") {
      return this.style.reset(value);
    }

    if (value == undefined) {
      return this.removeAttribute(name);
    }

    var abk,
    hasChanged;

    if (!(abk = this._attrsByKey[name])) {
      this.attributes.push(abk = this._attrsByKey[name] = {})
    }


    hasChanged = abk.value != value;

    abk.name  = name;
    abk.value = value;

    if (hasChanged) this._triggerChange();
  },

  /**
   */

  removeAttribute: function (name) {

    var hasChanged;

    for (var i = this.attributes.length; i--;) {
      var attr = this.attributes[i];
      if (attr.name == name) {
        hasChanged = true;
        this.attributes.splice(i, 1);
        delete this._attrsByKey[name];
        break;
      }
    }

    if (hasChanged) this._triggerChange();
  },

  /**
   */

  getAttribute: function (name) {
    var abk;
    if(abk = this._attrsByKey[name]) return abk.value;
  },

  /**
   */

  getInnerHTML: function () {

    var buffer = "<" + this._name,
    attribs    =  "",
    attrbuff;

    for (var name in this._attrsByKey) {

      var v    = this._attrsByKey[name].value;
      attrbuff = name;

      if (name != undefined) {
        attrbuff += "=\"" + v + "\"";
      }

      attribs += " " + attrbuff;
    }

    if (this.style.hasStyles()) {
      attribs += " style=" + "\"" + this.style.toString() + "\"";
    }

    if (attribs.length) {
      buffer += attribs;
    }


    return buffer + ">" + this.childNodes.join("") + "</" + this._name + ">"
  },

  /**
   */

  cloneNode: function () {
    var clone = new Element(this.nodeName);

    for (var key in this._attrsByKey) {
      clone.setAttribute(key, this._attrsByKey[key].value);
    }

    clone.setAttribute("style", this.style.toString());

    for (var i = 0, n = this.childNodes.length; i < n; i++) {
      clone.appendChild(this.childNodes[i].cloneNode());
    }

    clone._buffer = this._buffer;

    return clone;
  }
});

module.exports = Element;

},{"./container":19,"./style":24}],21:[function(require,module,exports){
var Container = require("./container");

function Fragment () {
  Fragment.superclass.call(this);
}

Container.extend(Fragment, {

  /**
   */

  nodeType: 11,

  /**
   */

  getInnerHTML: function () {
    return this.childNodes.join("");
  },

  /**
   */

  cloneNode: function () {
    var clone = new Fragment();

    for (var i = 0, n = this.childNodes.length; i < n; i++) {
      clone.appendChild(this.childNodes[i].cloneNode());
    }

    clone._buffer = this._buffer;

    return clone;
  }
});

module.exports = Fragment;
},{"./container":19}],22:[function(require,module,exports){
var Base     = require("../base"),
Element      = require("./element"),
Fragment     = require("./fragment"),
Text         = require("./text"),
Comment      = require("./comment"),
Container    = require("./container"),
voidElements = require("./voidElements");


/**
 * @module mojo
 * @submodule mojo-core
 */

/**

@class StringNodeFactory
@extends BaseNodeFactory
*/

function StringNodeFactory (context) {
  this.context = context;
}

Base.extend(StringNodeFactory, {

  /**
   */

  name: "string",

  /**
   */

  createElement: function (name) {
    return new Element(name);
  },

  /**
   */

  createTextNode: function (value, encode) {
    return new Text(value, encode);
  },

  /**
   */

  createComment: function (value) {
    return new Comment(value);
  },

  /**
   */

  createFragment: function (children) {

    if (!children) children = [];
    var frag = new Fragment(),
    childrenToArray = Array.prototype.slice.call(children, 0);

    for (var i = 0, n = childrenToArray.length; i < n; i++) {
      frag.appendChild(childrenToArray[i]);
    }

    return frag;
  },

  /**
   */

  parseHtml: function (buffer) {

    //this should really parse HTML, but too much overhead
    return this.createTextNode(buffer);
  }
});

module.exports           = new StringNodeFactory();

module.exports.Element      = Element;
module.exports.Fragment     = Fragment;
module.exports.Text         = Text;
module.exports.Container    = Container;
module.exports.voidElements = voidElements;
},{"../base":14,"./comment":18,"./container":19,"./element":20,"./fragment":21,"./text":25,"./voidElements":26}],23:[function(require,module,exports){
var protoclass  = require("protoclass");


function Node () {

}

protoclass(Node, {

  /**
   */

  __isNode: true,

  /**
   */

  toString: function () {
    if (this._innerHTML) return this._innerHTML;
    return this._innerHTML = this.getInnerHTML();
  },

  /**
   */

  _triggerChange: function () {
    if (!this._innerHTML) return;
    this._innerHTML = void 0;
    if (this.parentNode) this.parentNode._triggerChange();
  }
});

module.exports = Node;
},{"protoclass":36}],24:[function(require,module,exports){
var protoclass = require("protoclass");

function Style (element) {
  this._element = element;
}

protoclass(Style, {

  /**
   */

  _hasStyle: false,


  /**
   */


  setProperty: function(key, value) {

    var newValue = value === "" || value == void 0 ? void 0 : value;

    if (this[key] === newValue) return;

    this[key] = value;

    this._element._triggerChange();
  },

  /**
   */


  setProperties: function(properties) {
    for (var key in properties) {
      this.setProperty(key, properties[key]);
    }
  },

  /**
   */

  reset: function (styles) {

    var styleParts = styles.split(/;\s*/),
    hasChanged     = false;

    for (var i = 0, n = styleParts.length; i < n; i++) {
      var sp = styleParts[i].split(/:\s*/),
      key    = sp[0],
      value  = sp[1];

      if (value == void 0 || value == "") {
        continue;
      }

      hasChanged = hasChanged || this[key] === value;

      this[key] = value;
    }

    if (hasChanged) this._element._triggerChange();
  },

  /**
   */

  toString: function () {
    var buffer = "", styles = this.getStyles();

    for (var key in styles) {
      buffer += key + ":" + styles[key] + ";"
    }

    return buffer;
  },

  /**
   */

  hasStyles: function () {
    if(this._hasStyle) return true;

    for (var key in this) {
      if (key.substr(0, 1) !== "_" && this[key] != undefined && this.constructor.prototype[key] == undefined) {
        return this._hasStyle = true;
      }
    }

    return false;
  },

  /**
   */

  getStyles: function () {
    var styles = {};
    for (var key in this) {
      var k = this[key];
      if (key.substr(0, 1) !== "_" && k !== "" && this[key] != void 0 && this.constructor.prototype[key] == undefined) {
        styles[key] = this[key];
      }
    }
    return styles;
  }
});

module.exports = Style;

},{"protoclass":36}],25:[function(require,module,exports){
var Node = require("./node"),
he      = require("he");



function Text (value, encode) {
  this.replaceText(value, encode);
}

Node.extend(Text, {

  /**
   */

  nodeType: 3,

  /**
   */

  getInnerHTML: function () {
    return this.nodeValue;
  },

  /**
   */

  cloneNode: function () {
     var clone = new Text(this.nodeValue);
    clone._buffer = this._buffer;
    return clone;
  },

  /**
   */

  replaceText: function (value, encode) {
    this.nodeValue = encode ? he.encode(String(value)) : value;
    this._triggerChange();
  }
});

module.exports = Text;
},{"./node":23,"he":35}],26:[function(require,module,exports){
var Element = require("./element");

function VoidElement () {
	Element.apply(this, arguments);
}

Element.extend(VoidElement, {
	getInnerHTML: function () {
		return Element.prototype.getInnerHTML.call(this).replace("></" + this._name + ">", ">");
	},
	cloneNode: function () {
		var clone = new VoidElement(this._name);

    for (var key in this._attrsByKey) {
      clone.setAttribute(key, this._attrsByKey[key].value);
    }

    clone.setAttribute("style", this.style.toString());

    clone._buffer = this._buffer;

    return clone;
	}
});

/*
area, base, br, col, command, embed, hr, img, input,
keygen, link, meta, param, source, track, wbr
*/

["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track"].forEach(function (name) {
	exports[name] = VoidElement;
});
},{"./element":20}],27:[function(require,module,exports){
// Generated by CoffeeScript 1.6.2
(function() {
  var AnyFactory, factoryFactory,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  factoryFactory = require("./factory");

  AnyFactory = (function(_super) {
    __extends(AnyFactory, _super);

    /*
    */


    function AnyFactory(factories) {
      if (factories == null) {
        factories = [];
      }
      this.factories = factories.map(factoryFactory.create);
    }

    /*
    */


    AnyFactory.prototype.test = function(data) {
      return !!this._getFactory(data);
    };

    /*
    */


    AnyFactory.prototype.push = function(factory) {
      return this.factories.push(factoryFactory.create(factory));
    };

    /*
    */


    AnyFactory.prototype.create = function(data) {
      var _ref;

      return (_ref = this._getFactory(data)) != null ? _ref.create(data) : void 0;
    };

    /*
    */


    AnyFactory.prototype._getFactory = function(data) {
      var factory, _i, _len, _ref;

      _ref = this.factories;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        factory = _ref[_i];
        if (factory.test(data)) {
          return factory;
        }
      }
    };

    return AnyFactory;

  })(require("./base"));

  module.exports = function(factories) {
    return new AnyFactory(factories);
  };

}).call(this);

},{"./base":28,"./factory":30}],28:[function(require,module,exports){
// Generated by CoffeeScript 1.6.2
(function() {
  var BaseFactory;

  BaseFactory = (function() {
    function BaseFactory() {}

    BaseFactory.prototype.create = function(data) {};

    BaseFactory.prototype.test = function(data) {};

    return BaseFactory;

  })();

  module.exports = BaseFactory;

}).call(this);

},{}],29:[function(require,module,exports){
// Generated by CoffeeScript 1.6.2
(function() {
  var ClassFactory,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ClassFactory = (function(_super) {
    __extends(ClassFactory, _super);

    /*
    */


    function ClassFactory(clazz) {
      this.clazz = clazz;
    }

    /*
    */


    ClassFactory.prototype.create = function(data) {
      return new this.clazz(data);
    };

    /*
    */


    ClassFactory.prototype.test = function(data) {
      return this.clazz.test(data);
    };

    return ClassFactory;

  })(require("./base"));

  module.exports = function(clazz) {
    return new ClassFactory(clazz);
  };

}).call(this);

},{"./base":28}],30:[function(require,module,exports){
// Generated by CoffeeScript 1.6.2
(function() {
  var ClassFactory, FactoryFactory, FnFactory, factory, type,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ClassFactory = require("./class");

  type = require("type-component");

  FnFactory = require("./fn");

  FactoryFactory = (function(_super) {
    __extends(FactoryFactory, _super);

    /*
    */


    function FactoryFactory() {}

    /*
    */


    FactoryFactory.prototype.create = function(data) {
      var t;

      if (data.create && data.test) {
        return data;
      } else if ((t = type(data)) === "function") {
        if (data.prototype.constructor) {
          return new ClassFactory(data);
        } else {
          return new FnFactory(data);
        }
      }
      return data;
    };

    return FactoryFactory;

  })(require("./base"));

  factory = new FactoryFactory();

  module.exports = factory;

}).call(this);

},{"./base":28,"./class":29,"./fn":31,"type-component":34}],31:[function(require,module,exports){
// Generated by CoffeeScript 1.6.2
(function() {
  var FnFactory;

  FnFactory = (function() {
    /*
    */
    function FnFactory(fn) {
      this.fn = fn;
    }

    /*
    */


    FnFactory.prototype.test = function(data) {
      return this.fn.test(data);
    };

    /*
    */


    FnFactory.prototype.create = function(data) {
      return this.fn(data);
    };

    return FnFactory;

  })();

  module.exports = function(fn) {
    return new FnFactory(fn);
  };

}).call(this);

},{}],32:[function(require,module,exports){
// Generated by CoffeeScript 1.6.2
(function() {
  var GroupFactory, factoryFactory,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  factoryFactory = require("./factory");

  GroupFactory = (function(_super) {
    __extends(GroupFactory, _super);

    /*
    */


    function GroupFactory(mandatory, optional, groupClass) {
      if (mandatory == null) {
        mandatory = [];
      }
      if (optional == null) {
        optional = [];
      }
      this.groupClass = groupClass;
      this.mandatory = mandatory.map(factoryFactory.create);
      this.optional = optional.map(factoryFactory.create);
    }

    /*
    */


    GroupFactory.prototype.test = function(data) {
      return !!this._getFactories(data, this.mandatory).length;
    };

    /*
    */


    GroupFactory.prototype.create = function(data) {
      var factory, items, _i, _j, _len, _len1, _ref, _ref1;

      items = [];
      _ref = this._getFactories(data, this.mandatory);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        factory = _ref[_i];
        items.push(factory.create(data));
      }
      _ref1 = this._getFactories(data, this.optional);
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        factory = _ref1[_j];
        items.push(factory.create(data));
      }
      if (items.length === 1) {
        return items[0];
      }
      return new this.groupClass(data, items);
    };

    /*
    */


    GroupFactory.prototype._getFactories = function(data, collection) {
      var factories, factory, _i, _len;

      factories = [];
      for (_i = 0, _len = collection.length; _i < _len; _i++) {
        factory = collection[_i];
        if (factory.test(data)) {
          factories.push(factory);
        }
      }
      return factories;
    };

    return GroupFactory;

  })(require("./base"));

  module.exports = function(mandatory, optional, groupClass) {
    return new GroupFactory(mandatory, optional, groupClass);
  };

}).call(this);

},{"./base":28,"./factory":30}],33:[function(require,module,exports){
// Generated by CoffeeScript 1.6.2
(function() {
  module.exports = {
    any: require("./any"),
    "class": require("./class"),
    factory: require("./factory"),
    fn: require("./fn"),
    group: require("./group")
  };

}).call(this);

},{"./any":27,"./class":29,"./factory":30,"./fn":31,"./group":32}],34:[function(require,module,exports){

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val === Object(val)) return 'object';

  return typeof val;
};

},{}],35:[function(require,module,exports){
(function (global){
/*! http://mths.be/he v0.4.1 by @mathias | MIT license */
;(function(root) {

	// Detect free variables `exports`.
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`.
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`.
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	// All astral symbols.
	var regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
	// All ASCII symbols (not just printable ASCII) except those listed in the
	// first column of the overrides table.
	// http://whatwg.org/html/tokenization.html#table-charref-overrides
	var regexAsciiWhitelist = /[\x01-\x7F]/g;
	// All BMP symbols that are not ASCII newlines, printable ASCII symbols, or
	// code points listed in the first column of the overrides table on
	// http://whatwg.org/html/tokenization.html#table-charref-overrides.
	var regexBmpWhitelist = /[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;

	var regexEncodeNonAscii = /<\u20D2|=\u20E5|>\u20D2|\u205F\u200A|\u219D\u0338|\u2202\u0338|\u2220\u20D2|\u2229\uFE00|\u222A\uFE00|\u223C\u20D2|\u223D\u0331|\u223E\u0333|\u2242\u0338|\u224B\u0338|\u224D\u20D2|\u224E\u0338|\u224F\u0338|\u2250\u0338|\u2261\u20E5|\u2264\u20D2|\u2265\u20D2|\u2266\u0338|\u2267\u0338|\u2268\uFE00|\u2269\uFE00|\u226A\u0338|\u226A\u20D2|\u226B\u0338|\u226B\u20D2|\u227F\u0338|\u2282\u20D2|\u2283\u20D2|\u228A\uFE00|\u228B\uFE00|\u228F\u0338|\u2290\u0338|\u2293\uFE00|\u2294\uFE00|\u22B4\u20D2|\u22B5\u20D2|\u22D8\u0338|\u22D9\u0338|\u22DA\uFE00|\u22DB\uFE00|\u22F5\u0338|\u22F9\u0338|\u2933\u0338|\u29CF\u0338|\u29D0\u0338|\u2A6D\u0338|\u2A70\u0338|\u2A7D\u0338|\u2A7E\u0338|\u2AA1\u0338|\u2AA2\u0338|\u2AAC\uFE00|\u2AAD\uFE00|\u2AAF\u0338|\u2AB0\u0338|\u2AC5\u0338|\u2AC6\u0338|\u2ACB\uFE00|\u2ACC\uFE00|\u2AFD\u20E5|[\xA0-\u0113\u0116-\u0122\u0124-\u012B\u012E-\u014D\u0150-\u017E\u0192\u01B5\u01F5\u0237\u02C6\u02C7\u02D8-\u02DD\u0311\u0391-\u03A1\u03A3-\u03A9\u03B1-\u03C9\u03D1\u03D2\u03D5\u03D6\u03DC\u03DD\u03F0\u03F1\u03F5\u03F6\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E\u045F\u2002-\u2005\u2007-\u2010\u2013-\u2016\u2018-\u201A\u201C-\u201E\u2020-\u2022\u2025\u2026\u2030-\u2035\u2039\u203A\u203E\u2041\u2043\u2044\u204F\u2057\u205F-\u2063\u20AC\u20DB\u20DC\u2102\u2105\u210A-\u2113\u2115-\u211E\u2122\u2124\u2127-\u2129\u212C\u212D\u212F-\u2131\u2133-\u2138\u2145-\u2148\u2153-\u215E\u2190-\u219B\u219D-\u21A7\u21A9-\u21AE\u21B0-\u21B3\u21B5-\u21B7\u21BA-\u21DB\u21DD\u21E4\u21E5\u21F5\u21FD-\u2205\u2207-\u2209\u220B\u220C\u220F-\u2214\u2216-\u2218\u221A\u221D-\u2238\u223A-\u2257\u2259\u225A\u225C\u225F-\u2262\u2264-\u228B\u228D-\u229B\u229D-\u22A5\u22A7-\u22B0\u22B2-\u22BB\u22BD-\u22DB\u22DE-\u22E3\u22E6-\u22F7\u22F9-\u22FE\u2305\u2306\u2308-\u2310\u2312\u2313\u2315\u2316\u231C-\u231F\u2322\u2323\u232D\u232E\u2336\u233D\u233F\u237C\u23B0\u23B1\u23B4-\u23B6\u23DC-\u23DF\u23E2\u23E7\u2423\u24C8\u2500\u2502\u250C\u2510\u2514\u2518\u251C\u2524\u252C\u2534\u253C\u2550-\u256C\u2580\u2584\u2588\u2591-\u2593\u25A1\u25AA\u25AB\u25AD\u25AE\u25B1\u25B3-\u25B5\u25B8\u25B9\u25BD-\u25BF\u25C2\u25C3\u25CA\u25CB\u25EC\u25EF\u25F8-\u25FC\u2605\u2606\u260E\u2640\u2642\u2660\u2663\u2665\u2666\u266A\u266D-\u266F\u2713\u2717\u2720\u2736\u2758\u2772\u2773\u27C8\u27C9\u27E6-\u27ED\u27F5-\u27FA\u27FC\u27FF\u2902-\u2905\u290C-\u2913\u2916\u2919-\u2920\u2923-\u292A\u2933\u2935-\u2939\u293C\u293D\u2945\u2948-\u294B\u294E-\u2976\u2978\u2979\u297B-\u297F\u2985\u2986\u298B-\u2996\u299A\u299C\u299D\u29A4-\u29B7\u29B9\u29BB\u29BC\u29BE-\u29C5\u29C9\u29CD-\u29D0\u29DC-\u29DE\u29E3-\u29E5\u29EB\u29F4\u29F6\u2A00-\u2A02\u2A04\u2A06\u2A0C\u2A0D\u2A10-\u2A17\u2A22-\u2A27\u2A29\u2A2A\u2A2D-\u2A31\u2A33-\u2A3C\u2A3F\u2A40\u2A42-\u2A4D\u2A50\u2A53-\u2A58\u2A5A-\u2A5D\u2A5F\u2A66\u2A6A\u2A6D-\u2A75\u2A77-\u2A9A\u2A9D-\u2AA2\u2AA4-\u2AB0\u2AB3-\u2AC8\u2ACB\u2ACC\u2ACF-\u2ADB\u2AE4\u2AE6-\u2AE9\u2AEB-\u2AF3\u2AFD\uFB00-\uFB04]|\uD835[\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDD6B]/g;
	var encodeMap = {'\xC1':'Aacute','\xE1':'aacute','\u0102':'Abreve','\u0103':'abreve','\u223E':'ac','\u223F':'acd','\u223E\u0333':'acE','\xC2':'Acirc','\xE2':'acirc','\xB4':'acute','\u0410':'Acy','\u0430':'acy','\xC6':'AElig','\xE6':'aelig','\u2061':'af','\uD835\uDD04':'Afr','\uD835\uDD1E':'afr','\xC0':'Agrave','\xE0':'agrave','\u2135':'aleph','\u0391':'Alpha','\u03B1':'alpha','\u0100':'Amacr','\u0101':'amacr','\u2A3F':'amalg','&':'amp','\u2A55':'andand','\u2A53':'And','\u2227':'and','\u2A5C':'andd','\u2A58':'andslope','\u2A5A':'andv','\u2220':'ang','\u29A4':'ange','\u29A8':'angmsdaa','\u29A9':'angmsdab','\u29AA':'angmsdac','\u29AB':'angmsdad','\u29AC':'angmsdae','\u29AD':'angmsdaf','\u29AE':'angmsdag','\u29AF':'angmsdah','\u2221':'angmsd','\u221F':'angrt','\u22BE':'angrtvb','\u299D':'angrtvbd','\u2222':'angsph','\xC5':'angst','\u237C':'angzarr','\u0104':'Aogon','\u0105':'aogon','\uD835\uDD38':'Aopf','\uD835\uDD52':'aopf','\u2A6F':'apacir','\u2248':'ap','\u2A70':'apE','\u224A':'ape','\u224B':'apid','\'':'apos','\xE5':'aring','\uD835\uDC9C':'Ascr','\uD835\uDCB6':'ascr','\u2254':'colone','*':'ast','\u224D':'CupCap','\xC3':'Atilde','\xE3':'atilde','\xC4':'Auml','\xE4':'auml','\u2233':'awconint','\u2A11':'awint','\u224C':'bcong','\u03F6':'bepsi','\u2035':'bprime','\u223D':'bsim','\u22CD':'bsime','\u2216':'setmn','\u2AE7':'Barv','\u22BD':'barvee','\u2305':'barwed','\u2306':'Barwed','\u23B5':'bbrk','\u23B6':'bbrktbrk','\u0411':'Bcy','\u0431':'bcy','\u201E':'bdquo','\u2235':'becaus','\u29B0':'bemptyv','\u212C':'Bscr','\u0392':'Beta','\u03B2':'beta','\u2136':'beth','\u226C':'twixt','\uD835\uDD05':'Bfr','\uD835\uDD1F':'bfr','\u22C2':'xcap','\u25EF':'xcirc','\u22C3':'xcup','\u2A00':'xodot','\u2A01':'xoplus','\u2A02':'xotime','\u2A06':'xsqcup','\u2605':'starf','\u25BD':'xdtri','\u25B3':'xutri','\u2A04':'xuplus','\u22C1':'Vee','\u22C0':'Wedge','\u290D':'rbarr','\u29EB':'lozf','\u25AA':'squf','\u25B4':'utrif','\u25BE':'dtrif','\u25C2':'ltrif','\u25B8':'rtrif','\u2423':'blank','\u2592':'blk12','\u2591':'blk14','\u2593':'blk34','\u2588':'block','=\u20E5':'bne','\u2261\u20E5':'bnequiv','\u2AED':'bNot','\u2310':'bnot','\uD835\uDD39':'Bopf','\uD835\uDD53':'bopf','\u22A5':'bot','\u22C8':'bowtie','\u29C9':'boxbox','\u2510':'boxdl','\u2555':'boxdL','\u2556':'boxDl','\u2557':'boxDL','\u250C':'boxdr','\u2552':'boxdR','\u2553':'boxDr','\u2554':'boxDR','\u2500':'boxh','\u2550':'boxH','\u252C':'boxhd','\u2564':'boxHd','\u2565':'boxhD','\u2566':'boxHD','\u2534':'boxhu','\u2567':'boxHu','\u2568':'boxhU','\u2569':'boxHU','\u229F':'minusb','\u229E':'plusb','\u22A0':'timesb','\u2518':'boxul','\u255B':'boxuL','\u255C':'boxUl','\u255D':'boxUL','\u2514':'boxur','\u2558':'boxuR','\u2559':'boxUr','\u255A':'boxUR','\u2502':'boxv','\u2551':'boxV','\u253C':'boxvh','\u256A':'boxvH','\u256B':'boxVh','\u256C':'boxVH','\u2524':'boxvl','\u2561':'boxvL','\u2562':'boxVl','\u2563':'boxVL','\u251C':'boxvr','\u255E':'boxvR','\u255F':'boxVr','\u2560':'boxVR','\u02D8':'breve','\xA6':'brvbar','\uD835\uDCB7':'bscr','\u204F':'bsemi','\u29C5':'bsolb','\\':'bsol','\u27C8':'bsolhsub','\u2022':'bull','\u224E':'bump','\u2AAE':'bumpE','\u224F':'bumpe','\u0106':'Cacute','\u0107':'cacute','\u2A44':'capand','\u2A49':'capbrcup','\u2A4B':'capcap','\u2229':'cap','\u22D2':'Cap','\u2A47':'capcup','\u2A40':'capdot','\u2145':'DD','\u2229\uFE00':'caps','\u2041':'caret','\u02C7':'caron','\u212D':'Cfr','\u2A4D':'ccaps','\u010C':'Ccaron','\u010D':'ccaron','\xC7':'Ccedil','\xE7':'ccedil','\u0108':'Ccirc','\u0109':'ccirc','\u2230':'Cconint','\u2A4C':'ccups','\u2A50':'ccupssm','\u010A':'Cdot','\u010B':'cdot','\xB8':'cedil','\u29B2':'cemptyv','\xA2':'cent','\xB7':'middot','\uD835\uDD20':'cfr','\u0427':'CHcy','\u0447':'chcy','\u2713':'check','\u03A7':'Chi','\u03C7':'chi','\u02C6':'circ','\u2257':'cire','\u21BA':'olarr','\u21BB':'orarr','\u229B':'oast','\u229A':'ocir','\u229D':'odash','\u2299':'odot','\xAE':'reg','\u24C8':'oS','\u2296':'ominus','\u2295':'oplus','\u2297':'otimes','\u25CB':'cir','\u29C3':'cirE','\u2A10':'cirfnint','\u2AEF':'cirmid','\u29C2':'cirscir','\u2232':'cwconint','\u201D':'rdquo','\u2019':'rsquo','\u2663':'clubs',':':'colon','\u2237':'Colon','\u2A74':'Colone',',':'comma','@':'commat','\u2201':'comp','\u2218':'compfn','\u2102':'Copf','\u2245':'cong','\u2A6D':'congdot','\u2261':'equiv','\u222E':'oint','\u222F':'Conint','\uD835\uDD54':'copf','\u2210':'coprod','\xA9':'copy','\u2117':'copysr','\u21B5':'crarr','\u2717':'cross','\u2A2F':'Cross','\uD835\uDC9E':'Cscr','\uD835\uDCB8':'cscr','\u2ACF':'csub','\u2AD1':'csube','\u2AD0':'csup','\u2AD2':'csupe','\u22EF':'ctdot','\u2938':'cudarrl','\u2935':'cudarrr','\u22DE':'cuepr','\u22DF':'cuesc','\u21B6':'cularr','\u293D':'cularrp','\u2A48':'cupbrcap','\u2A46':'cupcap','\u222A':'cup','\u22D3':'Cup','\u2A4A':'cupcup','\u228D':'cupdot','\u2A45':'cupor','\u222A\uFE00':'cups','\u21B7':'curarr','\u293C':'curarrm','\u22CE':'cuvee','\u22CF':'cuwed','\xA4':'curren','\u2231':'cwint','\u232D':'cylcty','\u2020':'dagger','\u2021':'Dagger','\u2138':'daleth','\u2193':'darr','\u21A1':'Darr','\u21D3':'dArr','\u2010':'dash','\u2AE4':'Dashv','\u22A3':'dashv','\u290F':'rBarr','\u02DD':'dblac','\u010E':'Dcaron','\u010F':'dcaron','\u0414':'Dcy','\u0434':'dcy','\u21CA':'ddarr','\u2146':'dd','\u2911':'DDotrahd','\u2A77':'eDDot','\xB0':'deg','\u2207':'Del','\u0394':'Delta','\u03B4':'delta','\u29B1':'demptyv','\u297F':'dfisht','\uD835\uDD07':'Dfr','\uD835\uDD21':'dfr','\u2965':'dHar','\u21C3':'dharl','\u21C2':'dharr','\u02D9':'dot','`':'grave','\u02DC':'tilde','\u22C4':'diam','\u2666':'diams','\xA8':'die','\u03DD':'gammad','\u22F2':'disin','\xF7':'div','\u22C7':'divonx','\u0402':'DJcy','\u0452':'djcy','\u231E':'dlcorn','\u230D':'dlcrop','$':'dollar','\uD835\uDD3B':'Dopf','\uD835\uDD55':'dopf','\u20DC':'DotDot','\u2250':'doteq','\u2251':'eDot','\u2238':'minusd','\u2214':'plusdo','\u22A1':'sdotb','\u21D0':'lArr','\u21D4':'iff','\u27F8':'xlArr','\u27FA':'xhArr','\u27F9':'xrArr','\u21D2':'rArr','\u22A8':'vDash','\u21D1':'uArr','\u21D5':'vArr','\u2225':'par','\u2913':'DownArrowBar','\u21F5':'duarr','\u0311':'DownBreve','\u2950':'DownLeftRightVector','\u295E':'DownLeftTeeVector','\u2956':'DownLeftVectorBar','\u21BD':'lhard','\u295F':'DownRightTeeVector','\u2957':'DownRightVectorBar','\u21C1':'rhard','\u21A7':'mapstodown','\u22A4':'top','\u2910':'RBarr','\u231F':'drcorn','\u230C':'drcrop','\uD835\uDC9F':'Dscr','\uD835\uDCB9':'dscr','\u0405':'DScy','\u0455':'dscy','\u29F6':'dsol','\u0110':'Dstrok','\u0111':'dstrok','\u22F1':'dtdot','\u25BF':'dtri','\u296F':'duhar','\u29A6':'dwangle','\u040F':'DZcy','\u045F':'dzcy','\u27FF':'dzigrarr','\xC9':'Eacute','\xE9':'eacute','\u2A6E':'easter','\u011A':'Ecaron','\u011B':'ecaron','\xCA':'Ecirc','\xEA':'ecirc','\u2256':'ecir','\u2255':'ecolon','\u042D':'Ecy','\u044D':'ecy','\u0116':'Edot','\u0117':'edot','\u2147':'ee','\u2252':'efDot','\uD835\uDD08':'Efr','\uD835\uDD22':'efr','\u2A9A':'eg','\xC8':'Egrave','\xE8':'egrave','\u2A96':'egs','\u2A98':'egsdot','\u2A99':'el','\u2208':'in','\u23E7':'elinters','\u2113':'ell','\u2A95':'els','\u2A97':'elsdot','\u0112':'Emacr','\u0113':'emacr','\u2205':'empty','\u25FB':'EmptySmallSquare','\u25AB':'EmptyVerySmallSquare','\u2004':'emsp13','\u2005':'emsp14','\u2003':'emsp','\u014A':'ENG','\u014B':'eng','\u2002':'ensp','\u0118':'Eogon','\u0119':'eogon','\uD835\uDD3C':'Eopf','\uD835\uDD56':'eopf','\u22D5':'epar','\u29E3':'eparsl','\u2A71':'eplus','\u03B5':'epsi','\u0395':'Epsilon','\u03F5':'epsiv','\u2242':'esim','\u2A75':'Equal','=':'equals','\u225F':'equest','\u21CC':'rlhar','\u2A78':'equivDD','\u29E5':'eqvparsl','\u2971':'erarr','\u2253':'erDot','\u212F':'escr','\u2130':'Escr','\u2A73':'Esim','\u0397':'Eta','\u03B7':'eta','\xD0':'ETH','\xF0':'eth','\xCB':'Euml','\xEB':'euml','\u20AC':'euro','!':'excl','\u2203':'exist','\u0424':'Fcy','\u0444':'fcy','\u2640':'female','\uFB03':'ffilig','\uFB00':'fflig','\uFB04':'ffllig','\uD835\uDD09':'Ffr','\uD835\uDD23':'ffr','\uFB01':'filig','\u25FC':'FilledSmallSquare','fj':'fjlig','\u266D':'flat','\uFB02':'fllig','\u25B1':'fltns','\u0192':'fnof','\uD835\uDD3D':'Fopf','\uD835\uDD57':'fopf','\u2200':'forall','\u22D4':'fork','\u2AD9':'forkv','\u2131':'Fscr','\u2A0D':'fpartint','\xBD':'half','\u2153':'frac13','\xBC':'frac14','\u2155':'frac15','\u2159':'frac16','\u215B':'frac18','\u2154':'frac23','\u2156':'frac25','\xBE':'frac34','\u2157':'frac35','\u215C':'frac38','\u2158':'frac45','\u215A':'frac56','\u215D':'frac58','\u215E':'frac78','\u2044':'frasl','\u2322':'frown','\uD835\uDCBB':'fscr','\u01F5':'gacute','\u0393':'Gamma','\u03B3':'gamma','\u03DC':'Gammad','\u2A86':'gap','\u011E':'Gbreve','\u011F':'gbreve','\u0122':'Gcedil','\u011C':'Gcirc','\u011D':'gcirc','\u0413':'Gcy','\u0433':'gcy','\u0120':'Gdot','\u0121':'gdot','\u2265':'ge','\u2267':'gE','\u2A8C':'gEl','\u22DB':'gel','\u2A7E':'ges','\u2AA9':'gescc','\u2A80':'gesdot','\u2A82':'gesdoto','\u2A84':'gesdotol','\u22DB\uFE00':'gesl','\u2A94':'gesles','\uD835\uDD0A':'Gfr','\uD835\uDD24':'gfr','\u226B':'gg','\u22D9':'Gg','\u2137':'gimel','\u0403':'GJcy','\u0453':'gjcy','\u2AA5':'gla','\u2277':'gl','\u2A92':'glE','\u2AA4':'glj','\u2A8A':'gnap','\u2A88':'gne','\u2269':'gnE','\u22E7':'gnsim','\uD835\uDD3E':'Gopf','\uD835\uDD58':'gopf','\u2AA2':'GreaterGreater','\u2273':'gsim','\uD835\uDCA2':'Gscr','\u210A':'gscr','\u2A8E':'gsime','\u2A90':'gsiml','\u2AA7':'gtcc','\u2A7A':'gtcir','>':'gt','\u22D7':'gtdot','\u2995':'gtlPar','\u2A7C':'gtquest','\u2978':'gtrarr','\u2269\uFE00':'gvnE','\u200A':'hairsp','\u210B':'Hscr','\u042A':'HARDcy','\u044A':'hardcy','\u2948':'harrcir','\u2194':'harr','\u21AD':'harrw','^':'Hat','\u210F':'hbar','\u0124':'Hcirc','\u0125':'hcirc','\u2665':'hearts','\u2026':'mldr','\u22B9':'hercon','\uD835\uDD25':'hfr','\u210C':'Hfr','\u2925':'searhk','\u2926':'swarhk','\u21FF':'hoarr','\u223B':'homtht','\u21A9':'larrhk','\u21AA':'rarrhk','\uD835\uDD59':'hopf','\u210D':'Hopf','\u2015':'horbar','\uD835\uDCBD':'hscr','\u0126':'Hstrok','\u0127':'hstrok','\u2043':'hybull','\xCD':'Iacute','\xED':'iacute','\u2063':'ic','\xCE':'Icirc','\xEE':'icirc','\u0418':'Icy','\u0438':'icy','\u0130':'Idot','\u0415':'IEcy','\u0435':'iecy','\xA1':'iexcl','\uD835\uDD26':'ifr','\u2111':'Im','\xCC':'Igrave','\xEC':'igrave','\u2148':'ii','\u2A0C':'qint','\u222D':'tint','\u29DC':'iinfin','\u2129':'iiota','\u0132':'IJlig','\u0133':'ijlig','\u012A':'Imacr','\u012B':'imacr','\u2110':'Iscr','\u0131':'imath','\u22B7':'imof','\u01B5':'imped','\u2105':'incare','\u221E':'infin','\u29DD':'infintie','\u22BA':'intcal','\u222B':'int','\u222C':'Int','\u2124':'Zopf','\u2A17':'intlarhk','\u2A3C':'iprod','\u2062':'it','\u0401':'IOcy','\u0451':'iocy','\u012E':'Iogon','\u012F':'iogon','\uD835\uDD40':'Iopf','\uD835\uDD5A':'iopf','\u0399':'Iota','\u03B9':'iota','\xBF':'iquest','\uD835\uDCBE':'iscr','\u22F5':'isindot','\u22F9':'isinE','\u22F4':'isins','\u22F3':'isinsv','\u0128':'Itilde','\u0129':'itilde','\u0406':'Iukcy','\u0456':'iukcy','\xCF':'Iuml','\xEF':'iuml','\u0134':'Jcirc','\u0135':'jcirc','\u0419':'Jcy','\u0439':'jcy','\uD835\uDD0D':'Jfr','\uD835\uDD27':'jfr','\u0237':'jmath','\uD835\uDD41':'Jopf','\uD835\uDD5B':'jopf','\uD835\uDCA5':'Jscr','\uD835\uDCBF':'jscr','\u0408':'Jsercy','\u0458':'jsercy','\u0404':'Jukcy','\u0454':'jukcy','\u039A':'Kappa','\u03BA':'kappa','\u03F0':'kappav','\u0136':'Kcedil','\u0137':'kcedil','\u041A':'Kcy','\u043A':'kcy','\uD835\uDD0E':'Kfr','\uD835\uDD28':'kfr','\u0138':'kgreen','\u0425':'KHcy','\u0445':'khcy','\u040C':'KJcy','\u045C':'kjcy','\uD835\uDD42':'Kopf','\uD835\uDD5C':'kopf','\uD835\uDCA6':'Kscr','\uD835\uDCC0':'kscr','\u21DA':'lAarr','\u0139':'Lacute','\u013A':'lacute','\u29B4':'laemptyv','\u2112':'Lscr','\u039B':'Lambda','\u03BB':'lambda','\u27E8':'lang','\u27EA':'Lang','\u2991':'langd','\u2A85':'lap','\xAB':'laquo','\u21E4':'larrb','\u291F':'larrbfs','\u2190':'larr','\u219E':'Larr','\u291D':'larrfs','\u21AB':'larrlp','\u2939':'larrpl','\u2973':'larrsim','\u21A2':'larrtl','\u2919':'latail','\u291B':'lAtail','\u2AAB':'lat','\u2AAD':'late','\u2AAD\uFE00':'lates','\u290C':'lbarr','\u290E':'lBarr','\u2772':'lbbrk','{':'lcub','[':'lsqb','\u298B':'lbrke','\u298F':'lbrksld','\u298D':'lbrkslu','\u013D':'Lcaron','\u013E':'lcaron','\u013B':'Lcedil','\u013C':'lcedil','\u2308':'lceil','\u041B':'Lcy','\u043B':'lcy','\u2936':'ldca','\u201C':'ldquo','\u2967':'ldrdhar','\u294B':'ldrushar','\u21B2':'ldsh','\u2264':'le','\u2266':'lE','\u21C6':'lrarr','\u27E6':'lobrk','\u2961':'LeftDownTeeVector','\u2959':'LeftDownVectorBar','\u230A':'lfloor','\u21BC':'lharu','\u21C7':'llarr','\u21CB':'lrhar','\u294E':'LeftRightVector','\u21A4':'mapstoleft','\u295A':'LeftTeeVector','\u22CB':'lthree','\u29CF':'LeftTriangleBar','\u22B2':'vltri','\u22B4':'ltrie','\u2951':'LeftUpDownVector','\u2960':'LeftUpTeeVector','\u2958':'LeftUpVectorBar','\u21BF':'uharl','\u2952':'LeftVectorBar','\u2A8B':'lEg','\u22DA':'leg','\u2A7D':'les','\u2AA8':'lescc','\u2A7F':'lesdot','\u2A81':'lesdoto','\u2A83':'lesdotor','\u22DA\uFE00':'lesg','\u2A93':'lesges','\u22D6':'ltdot','\u2276':'lg','\u2AA1':'LessLess','\u2272':'lsim','\u297C':'lfisht','\uD835\uDD0F':'Lfr','\uD835\uDD29':'lfr','\u2A91':'lgE','\u2962':'lHar','\u296A':'lharul','\u2584':'lhblk','\u0409':'LJcy','\u0459':'ljcy','\u226A':'ll','\u22D8':'Ll','\u296B':'llhard','\u25FA':'lltri','\u013F':'Lmidot','\u0140':'lmidot','\u23B0':'lmoust','\u2A89':'lnap','\u2A87':'lne','\u2268':'lnE','\u22E6':'lnsim','\u27EC':'loang','\u21FD':'loarr','\u27F5':'xlarr','\u27F7':'xharr','\u27FC':'xmap','\u27F6':'xrarr','\u21AC':'rarrlp','\u2985':'lopar','\uD835\uDD43':'Lopf','\uD835\uDD5D':'lopf','\u2A2D':'loplus','\u2A34':'lotimes','\u2217':'lowast','_':'lowbar','\u2199':'swarr','\u2198':'searr','\u25CA':'loz','(':'lpar','\u2993':'lparlt','\u296D':'lrhard','\u200E':'lrm','\u22BF':'lrtri','\u2039':'lsaquo','\uD835\uDCC1':'lscr','\u21B0':'lsh','\u2A8D':'lsime','\u2A8F':'lsimg','\u2018':'lsquo','\u201A':'sbquo','\u0141':'Lstrok','\u0142':'lstrok','\u2AA6':'ltcc','\u2A79':'ltcir','<':'lt','\u22C9':'ltimes','\u2976':'ltlarr','\u2A7B':'ltquest','\u25C3':'ltri','\u2996':'ltrPar','\u294A':'lurdshar','\u2966':'luruhar','\u2268\uFE00':'lvnE','\xAF':'macr','\u2642':'male','\u2720':'malt','\u2905':'Map','\u21A6':'map','\u21A5':'mapstoup','\u25AE':'marker','\u2A29':'mcomma','\u041C':'Mcy','\u043C':'mcy','\u2014':'mdash','\u223A':'mDDot','\u205F':'MediumSpace','\u2133':'Mscr','\uD835\uDD10':'Mfr','\uD835\uDD2A':'mfr','\u2127':'mho','\xB5':'micro','\u2AF0':'midcir','\u2223':'mid','\u2212':'minus','\u2A2A':'minusdu','\u2213':'mp','\u2ADB':'mlcp','\u22A7':'models','\uD835\uDD44':'Mopf','\uD835\uDD5E':'mopf','\uD835\uDCC2':'mscr','\u039C':'Mu','\u03BC':'mu','\u22B8':'mumap','\u0143':'Nacute','\u0144':'nacute','\u2220\u20D2':'nang','\u2249':'nap','\u2A70\u0338':'napE','\u224B\u0338':'napid','\u0149':'napos','\u266E':'natur','\u2115':'Nopf','\xA0':'nbsp','\u224E\u0338':'nbump','\u224F\u0338':'nbumpe','\u2A43':'ncap','\u0147':'Ncaron','\u0148':'ncaron','\u0145':'Ncedil','\u0146':'ncedil','\u2247':'ncong','\u2A6D\u0338':'ncongdot','\u2A42':'ncup','\u041D':'Ncy','\u043D':'ncy','\u2013':'ndash','\u2924':'nearhk','\u2197':'nearr','\u21D7':'neArr','\u2260':'ne','\u2250\u0338':'nedot','\u200B':'ZeroWidthSpace','\u2262':'nequiv','\u2928':'toea','\u2242\u0338':'nesim','\n':'NewLine','\u2204':'nexist','\uD835\uDD11':'Nfr','\uD835\uDD2B':'nfr','\u2267\u0338':'ngE','\u2271':'nge','\u2A7E\u0338':'nges','\u22D9\u0338':'nGg','\u2275':'ngsim','\u226B\u20D2':'nGt','\u226F':'ngt','\u226B\u0338':'nGtv','\u21AE':'nharr','\u21CE':'nhArr','\u2AF2':'nhpar','\u220B':'ni','\u22FC':'nis','\u22FA':'nisd','\u040A':'NJcy','\u045A':'njcy','\u219A':'nlarr','\u21CD':'nlArr','\u2025':'nldr','\u2266\u0338':'nlE','\u2270':'nle','\u2A7D\u0338':'nles','\u226E':'nlt','\u22D8\u0338':'nLl','\u2274':'nlsim','\u226A\u20D2':'nLt','\u22EA':'nltri','\u22EC':'nltrie','\u226A\u0338':'nLtv','\u2224':'nmid','\u2060':'NoBreak','\uD835\uDD5F':'nopf','\u2AEC':'Not','\xAC':'not','\u226D':'NotCupCap','\u2226':'npar','\u2209':'notin','\u2279':'ntgl','\u22F5\u0338':'notindot','\u22F9\u0338':'notinE','\u22F7':'notinvb','\u22F6':'notinvc','\u29CF\u0338':'NotLeftTriangleBar','\u2278':'ntlg','\u2AA2\u0338':'NotNestedGreaterGreater','\u2AA1\u0338':'NotNestedLessLess','\u220C':'notni','\u22FE':'notnivb','\u22FD':'notnivc','\u2280':'npr','\u2AAF\u0338':'npre','\u22E0':'nprcue','\u29D0\u0338':'NotRightTriangleBar','\u22EB':'nrtri','\u22ED':'nrtrie','\u228F\u0338':'NotSquareSubset','\u22E2':'nsqsube','\u2290\u0338':'NotSquareSuperset','\u22E3':'nsqsupe','\u2282\u20D2':'vnsub','\u2288':'nsube','\u2281':'nsc','\u2AB0\u0338':'nsce','\u22E1':'nsccue','\u227F\u0338':'NotSucceedsTilde','\u2283\u20D2':'vnsup','\u2289':'nsupe','\u2241':'nsim','\u2244':'nsime','\u2AFD\u20E5':'nparsl','\u2202\u0338':'npart','\u2A14':'npolint','\u2933\u0338':'nrarrc','\u219B':'nrarr','\u21CF':'nrArr','\u219D\u0338':'nrarrw','\uD835\uDCA9':'Nscr','\uD835\uDCC3':'nscr','\u2284':'nsub','\u2AC5\u0338':'nsubE','\u2285':'nsup','\u2AC6\u0338':'nsupE','\xD1':'Ntilde','\xF1':'ntilde','\u039D':'Nu','\u03BD':'nu','#':'num','\u2116':'numero','\u2007':'numsp','\u224D\u20D2':'nvap','\u22AC':'nvdash','\u22AD':'nvDash','\u22AE':'nVdash','\u22AF':'nVDash','\u2265\u20D2':'nvge','>\u20D2':'nvgt','\u2904':'nvHarr','\u29DE':'nvinfin','\u2902':'nvlArr','\u2264\u20D2':'nvle','<\u20D2':'nvlt','\u22B4\u20D2':'nvltrie','\u2903':'nvrArr','\u22B5\u20D2':'nvrtrie','\u223C\u20D2':'nvsim','\u2923':'nwarhk','\u2196':'nwarr','\u21D6':'nwArr','\u2927':'nwnear','\xD3':'Oacute','\xF3':'oacute','\xD4':'Ocirc','\xF4':'ocirc','\u041E':'Ocy','\u043E':'ocy','\u0150':'Odblac','\u0151':'odblac','\u2A38':'odiv','\u29BC':'odsold','\u0152':'OElig','\u0153':'oelig','\u29BF':'ofcir','\uD835\uDD12':'Ofr','\uD835\uDD2C':'ofr','\u02DB':'ogon','\xD2':'Ograve','\xF2':'ograve','\u29C1':'ogt','\u29B5':'ohbar','\u03A9':'ohm','\u29BE':'olcir','\u29BB':'olcross','\u203E':'oline','\u29C0':'olt','\u014C':'Omacr','\u014D':'omacr','\u03C9':'omega','\u039F':'Omicron','\u03BF':'omicron','\u29B6':'omid','\uD835\uDD46':'Oopf','\uD835\uDD60':'oopf','\u29B7':'opar','\u29B9':'operp','\u2A54':'Or','\u2228':'or','\u2A5D':'ord','\u2134':'oscr','\xAA':'ordf','\xBA':'ordm','\u22B6':'origof','\u2A56':'oror','\u2A57':'orslope','\u2A5B':'orv','\uD835\uDCAA':'Oscr','\xD8':'Oslash','\xF8':'oslash','\u2298':'osol','\xD5':'Otilde','\xF5':'otilde','\u2A36':'otimesas','\u2A37':'Otimes','\xD6':'Ouml','\xF6':'ouml','\u233D':'ovbar','\u23DE':'OverBrace','\u23B4':'tbrk','\u23DC':'OverParenthesis','\xB6':'para','\u2AF3':'parsim','\u2AFD':'parsl','\u2202':'part','\u041F':'Pcy','\u043F':'pcy','%':'percnt','.':'period','\u2030':'permil','\u2031':'pertenk','\uD835\uDD13':'Pfr','\uD835\uDD2D':'pfr','\u03A6':'Phi','\u03C6':'phi','\u03D5':'phiv','\u260E':'phone','\u03A0':'Pi','\u03C0':'pi','\u03D6':'piv','\u210E':'planckh','\u2A23':'plusacir','\u2A22':'pluscir','+':'plus','\u2A25':'plusdu','\u2A72':'pluse','\xB1':'pm','\u2A26':'plussim','\u2A27':'plustwo','\u2A15':'pointint','\uD835\uDD61':'popf','\u2119':'Popf','\xA3':'pound','\u2AB7':'prap','\u2ABB':'Pr','\u227A':'pr','\u227C':'prcue','\u2AAF':'pre','\u227E':'prsim','\u2AB9':'prnap','\u2AB5':'prnE','\u22E8':'prnsim','\u2AB3':'prE','\u2032':'prime','\u2033':'Prime','\u220F':'prod','\u232E':'profalar','\u2312':'profline','\u2313':'profsurf','\u221D':'prop','\u22B0':'prurel','\uD835\uDCAB':'Pscr','\uD835\uDCC5':'pscr','\u03A8':'Psi','\u03C8':'psi','\u2008':'puncsp','\uD835\uDD14':'Qfr','\uD835\uDD2E':'qfr','\uD835\uDD62':'qopf','\u211A':'Qopf','\u2057':'qprime','\uD835\uDCAC':'Qscr','\uD835\uDCC6':'qscr','\u2A16':'quatint','?':'quest','"':'quot','\u21DB':'rAarr','\u223D\u0331':'race','\u0154':'Racute','\u0155':'racute','\u221A':'Sqrt','\u29B3':'raemptyv','\u27E9':'rang','\u27EB':'Rang','\u2992':'rangd','\u29A5':'range','\xBB':'raquo','\u2975':'rarrap','\u21E5':'rarrb','\u2920':'rarrbfs','\u2933':'rarrc','\u2192':'rarr','\u21A0':'Rarr','\u291E':'rarrfs','\u2945':'rarrpl','\u2974':'rarrsim','\u2916':'Rarrtl','\u21A3':'rarrtl','\u219D':'rarrw','\u291A':'ratail','\u291C':'rAtail','\u2236':'ratio','\u2773':'rbbrk','}':'rcub',']':'rsqb','\u298C':'rbrke','\u298E':'rbrksld','\u2990':'rbrkslu','\u0158':'Rcaron','\u0159':'rcaron','\u0156':'Rcedil','\u0157':'rcedil','\u2309':'rceil','\u0420':'Rcy','\u0440':'rcy','\u2937':'rdca','\u2969':'rdldhar','\u21B3':'rdsh','\u211C':'Re','\u211B':'Rscr','\u211D':'Ropf','\u25AD':'rect','\u297D':'rfisht','\u230B':'rfloor','\uD835\uDD2F':'rfr','\u2964':'rHar','\u21C0':'rharu','\u296C':'rharul','\u03A1':'Rho','\u03C1':'rho','\u03F1':'rhov','\u21C4':'rlarr','\u27E7':'robrk','\u295D':'RightDownTeeVector','\u2955':'RightDownVectorBar','\u21C9':'rrarr','\u22A2':'vdash','\u295B':'RightTeeVector','\u22CC':'rthree','\u29D0':'RightTriangleBar','\u22B3':'vrtri','\u22B5':'rtrie','\u294F':'RightUpDownVector','\u295C':'RightUpTeeVector','\u2954':'RightUpVectorBar','\u21BE':'uharr','\u2953':'RightVectorBar','\u02DA':'ring','\u200F':'rlm','\u23B1':'rmoust','\u2AEE':'rnmid','\u27ED':'roang','\u21FE':'roarr','\u2986':'ropar','\uD835\uDD63':'ropf','\u2A2E':'roplus','\u2A35':'rotimes','\u2970':'RoundImplies',')':'rpar','\u2994':'rpargt','\u2A12':'rppolint','\u203A':'rsaquo','\uD835\uDCC7':'rscr','\u21B1':'rsh','\u22CA':'rtimes','\u25B9':'rtri','\u29CE':'rtriltri','\u29F4':'RuleDelayed','\u2968':'ruluhar','\u211E':'rx','\u015A':'Sacute','\u015B':'sacute','\u2AB8':'scap','\u0160':'Scaron','\u0161':'scaron','\u2ABC':'Sc','\u227B':'sc','\u227D':'sccue','\u2AB0':'sce','\u2AB4':'scE','\u015E':'Scedil','\u015F':'scedil','\u015C':'Scirc','\u015D':'scirc','\u2ABA':'scnap','\u2AB6':'scnE','\u22E9':'scnsim','\u2A13':'scpolint','\u227F':'scsim','\u0421':'Scy','\u0441':'scy','\u22C5':'sdot','\u2A66':'sdote','\u21D8':'seArr','\xA7':'sect',';':'semi','\u2929':'tosa','\u2736':'sext','\uD835\uDD16':'Sfr','\uD835\uDD30':'sfr','\u266F':'sharp','\u0429':'SHCHcy','\u0449':'shchcy','\u0428':'SHcy','\u0448':'shcy','\u2191':'uarr','\xAD':'shy','\u03A3':'Sigma','\u03C3':'sigma','\u03C2':'sigmaf','\u223C':'sim','\u2A6A':'simdot','\u2243':'sime','\u2A9E':'simg','\u2AA0':'simgE','\u2A9D':'siml','\u2A9F':'simlE','\u2246':'simne','\u2A24':'simplus','\u2972':'simrarr','\u2A33':'smashp','\u29E4':'smeparsl','\u2323':'smile','\u2AAA':'smt','\u2AAC':'smte','\u2AAC\uFE00':'smtes','\u042C':'SOFTcy','\u044C':'softcy','\u233F':'solbar','\u29C4':'solb','/':'sol','\uD835\uDD4A':'Sopf','\uD835\uDD64':'sopf','\u2660':'spades','\u2293':'sqcap','\u2293\uFE00':'sqcaps','\u2294':'sqcup','\u2294\uFE00':'sqcups','\u228F':'sqsub','\u2291':'sqsube','\u2290':'sqsup','\u2292':'sqsupe','\u25A1':'squ','\uD835\uDCAE':'Sscr','\uD835\uDCC8':'sscr','\u22C6':'Star','\u2606':'star','\u2282':'sub','\u22D0':'Sub','\u2ABD':'subdot','\u2AC5':'subE','\u2286':'sube','\u2AC3':'subedot','\u2AC1':'submult','\u2ACB':'subnE','\u228A':'subne','\u2ABF':'subplus','\u2979':'subrarr','\u2AC7':'subsim','\u2AD5':'subsub','\u2AD3':'subsup','\u2211':'sum','\u266A':'sung','\xB9':'sup1','\xB2':'sup2','\xB3':'sup3','\u2283':'sup','\u22D1':'Sup','\u2ABE':'supdot','\u2AD8':'supdsub','\u2AC6':'supE','\u2287':'supe','\u2AC4':'supedot','\u27C9':'suphsol','\u2AD7':'suphsub','\u297B':'suplarr','\u2AC2':'supmult','\u2ACC':'supnE','\u228B':'supne','\u2AC0':'supplus','\u2AC8':'supsim','\u2AD4':'supsub','\u2AD6':'supsup','\u21D9':'swArr','\u292A':'swnwar','\xDF':'szlig','\t':'Tab','\u2316':'target','\u03A4':'Tau','\u03C4':'tau','\u0164':'Tcaron','\u0165':'tcaron','\u0162':'Tcedil','\u0163':'tcedil','\u0422':'Tcy','\u0442':'tcy','\u20DB':'tdot','\u2315':'telrec','\uD835\uDD17':'Tfr','\uD835\uDD31':'tfr','\u2234':'there4','\u0398':'Theta','\u03B8':'theta','\u03D1':'thetav','\u205F\u200A':'ThickSpace','\u2009':'thinsp','\xDE':'THORN','\xFE':'thorn','\u2A31':'timesbar','\xD7':'times','\u2A30':'timesd','\u2336':'topbot','\u2AF1':'topcir','\uD835\uDD4B':'Topf','\uD835\uDD65':'topf','\u2ADA':'topfork','\u2034':'tprime','\u2122':'trade','\u25B5':'utri','\u225C':'trie','\u25EC':'tridot','\u2A3A':'triminus','\u2A39':'triplus','\u29CD':'trisb','\u2A3B':'tritime','\u23E2':'trpezium','\uD835\uDCAF':'Tscr','\uD835\uDCC9':'tscr','\u0426':'TScy','\u0446':'tscy','\u040B':'TSHcy','\u045B':'tshcy','\u0166':'Tstrok','\u0167':'tstrok','\xDA':'Uacute','\xFA':'uacute','\u219F':'Uarr','\u2949':'Uarrocir','\u040E':'Ubrcy','\u045E':'ubrcy','\u016C':'Ubreve','\u016D':'ubreve','\xDB':'Ucirc','\xFB':'ucirc','\u0423':'Ucy','\u0443':'ucy','\u21C5':'udarr','\u0170':'Udblac','\u0171':'udblac','\u296E':'udhar','\u297E':'ufisht','\uD835\uDD18':'Ufr','\uD835\uDD32':'ufr','\xD9':'Ugrave','\xF9':'ugrave','\u2963':'uHar','\u2580':'uhblk','\u231C':'ulcorn','\u230F':'ulcrop','\u25F8':'ultri','\u016A':'Umacr','\u016B':'umacr','\u23DF':'UnderBrace','\u23DD':'UnderParenthesis','\u228E':'uplus','\u0172':'Uogon','\u0173':'uogon','\uD835\uDD4C':'Uopf','\uD835\uDD66':'uopf','\u2912':'UpArrowBar','\u2195':'varr','\u03C5':'upsi','\u03D2':'Upsi','\u03A5':'Upsilon','\u21C8':'uuarr','\u231D':'urcorn','\u230E':'urcrop','\u016E':'Uring','\u016F':'uring','\u25F9':'urtri','\uD835\uDCB0':'Uscr','\uD835\uDCCA':'uscr','\u22F0':'utdot','\u0168':'Utilde','\u0169':'utilde','\xDC':'Uuml','\xFC':'uuml','\u29A7':'uwangle','\u299C':'vangrt','\u228A\uFE00':'vsubne','\u2ACB\uFE00':'vsubnE','\u228B\uFE00':'vsupne','\u2ACC\uFE00':'vsupnE','\u2AE8':'vBar','\u2AEB':'Vbar','\u2AE9':'vBarv','\u0412':'Vcy','\u0432':'vcy','\u22A9':'Vdash','\u22AB':'VDash','\u2AE6':'Vdashl','\u22BB':'veebar','\u225A':'veeeq','\u22EE':'vellip','|':'vert','\u2016':'Vert','\u2758':'VerticalSeparator','\u2240':'wr','\uD835\uDD19':'Vfr','\uD835\uDD33':'vfr','\uD835\uDD4D':'Vopf','\uD835\uDD67':'vopf','\uD835\uDCB1':'Vscr','\uD835\uDCCB':'vscr','\u22AA':'Vvdash','\u299A':'vzigzag','\u0174':'Wcirc','\u0175':'wcirc','\u2A5F':'wedbar','\u2259':'wedgeq','\u2118':'wp','\uD835\uDD1A':'Wfr','\uD835\uDD34':'wfr','\uD835\uDD4E':'Wopf','\uD835\uDD68':'wopf','\uD835\uDCB2':'Wscr','\uD835\uDCCC':'wscr','\uD835\uDD1B':'Xfr','\uD835\uDD35':'xfr','\u039E':'Xi','\u03BE':'xi','\u22FB':'xnis','\uD835\uDD4F':'Xopf','\uD835\uDD69':'xopf','\uD835\uDCB3':'Xscr','\uD835\uDCCD':'xscr','\xDD':'Yacute','\xFD':'yacute','\u042F':'YAcy','\u044F':'yacy','\u0176':'Ycirc','\u0177':'ycirc','\u042B':'Ycy','\u044B':'ycy','\xA5':'yen','\uD835\uDD1C':'Yfr','\uD835\uDD36':'yfr','\u0407':'YIcy','\u0457':'yicy','\uD835\uDD50':'Yopf','\uD835\uDD6A':'yopf','\uD835\uDCB4':'Yscr','\uD835\uDCCE':'yscr','\u042E':'YUcy','\u044E':'yucy','\xFF':'yuml','\u0178':'Yuml','\u0179':'Zacute','\u017A':'zacute','\u017D':'Zcaron','\u017E':'zcaron','\u0417':'Zcy','\u0437':'zcy','\u017B':'Zdot','\u017C':'zdot','\u2128':'Zfr','\u0396':'Zeta','\u03B6':'zeta','\uD835\uDD37':'zfr','\u0416':'ZHcy','\u0436':'zhcy','\u21DD':'zigrarr','\uD835\uDD6B':'zopf','\uD835\uDCB5':'Zscr','\uD835\uDCCF':'zscr','\u200D':'zwj','\u200C':'zwnj'};

	var regexEscape = /["&'<>`]/g;
	var escapeMap = {
		'"': '&quot;',
		'&': '&amp;',
		'\'': '&#x27;',
		'<': '&lt;',
		// See http://mathiasbynens.be/notes/ambiguous-ampersands: in HTML, the
		// following is not strictly necessary unless it’s part of a tag or an
		// unquoted attribute value. We’re only escaping it to support those
		// situations, and for XML support.
		'>': '&gt;',
		// In Internet Explorer ≤ 8, the backtick character can be used
		// to break out of (un)quoted attribute values or HTML comments.
		// See http://html5sec.org/#102, http://html5sec.org/#108, and
		// http://html5sec.org/#133.
		'`': '&#x60;'
	};

	var regexInvalidEntity = /&#(?:[xX][^a-fA-F0-9]|[^0-9xX])/;
	var regexInvalidRawCodePoint = /[\0-\x08\x0B\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F\uDBBF\uDBFF][\uDFFE\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
	var regexDecode = /&#([0-9]+)(;?)|&#[xX]([a-fA-F0-9]+)(;?)|&([0-9a-zA-Z]+);|&(Aacute|iacute|Uacute|plusmn|otilde|Otilde|Agrave|agrave|yacute|Yacute|oslash|Oslash|Atilde|atilde|brvbar|Ccedil|ccedil|ograve|curren|divide|Eacute|eacute|Ograve|oacute|Egrave|egrave|ugrave|frac12|frac14|frac34|Ugrave|Oacute|Iacute|ntilde|Ntilde|uacute|middot|Igrave|igrave|iquest|aacute|laquo|THORN|micro|iexcl|icirc|Icirc|Acirc|ucirc|ecirc|Ocirc|ocirc|Ecirc|Ucirc|aring|Aring|aelig|AElig|acute|pound|raquo|acirc|times|thorn|szlig|cedil|COPY|Auml|ordf|ordm|uuml|macr|Uuml|auml|Ouml|ouml|para|nbsp|Euml|quot|QUOT|euml|yuml|cent|sect|copy|sup1|sup2|sup3|Iuml|iuml|shy|eth|reg|not|yen|amp|AMP|REG|uml|ETH|deg|gt|GT|LT|lt)([=a-zA-Z0-9])?/g;
	var decodeMap = {'Aacute':'\xC1','aacute':'\xE1','Abreve':'\u0102','abreve':'\u0103','ac':'\u223E','acd':'\u223F','acE':'\u223E\u0333','Acirc':'\xC2','acirc':'\xE2','acute':'\xB4','Acy':'\u0410','acy':'\u0430','AElig':'\xC6','aelig':'\xE6','af':'\u2061','Afr':'\uD835\uDD04','afr':'\uD835\uDD1E','Agrave':'\xC0','agrave':'\xE0','alefsym':'\u2135','aleph':'\u2135','Alpha':'\u0391','alpha':'\u03B1','Amacr':'\u0100','amacr':'\u0101','amalg':'\u2A3F','amp':'&','AMP':'&','andand':'\u2A55','And':'\u2A53','and':'\u2227','andd':'\u2A5C','andslope':'\u2A58','andv':'\u2A5A','ang':'\u2220','ange':'\u29A4','angle':'\u2220','angmsdaa':'\u29A8','angmsdab':'\u29A9','angmsdac':'\u29AA','angmsdad':'\u29AB','angmsdae':'\u29AC','angmsdaf':'\u29AD','angmsdag':'\u29AE','angmsdah':'\u29AF','angmsd':'\u2221','angrt':'\u221F','angrtvb':'\u22BE','angrtvbd':'\u299D','angsph':'\u2222','angst':'\xC5','angzarr':'\u237C','Aogon':'\u0104','aogon':'\u0105','Aopf':'\uD835\uDD38','aopf':'\uD835\uDD52','apacir':'\u2A6F','ap':'\u2248','apE':'\u2A70','ape':'\u224A','apid':'\u224B','apos':'\'','ApplyFunction':'\u2061','approx':'\u2248','approxeq':'\u224A','Aring':'\xC5','aring':'\xE5','Ascr':'\uD835\uDC9C','ascr':'\uD835\uDCB6','Assign':'\u2254','ast':'*','asymp':'\u2248','asympeq':'\u224D','Atilde':'\xC3','atilde':'\xE3','Auml':'\xC4','auml':'\xE4','awconint':'\u2233','awint':'\u2A11','backcong':'\u224C','backepsilon':'\u03F6','backprime':'\u2035','backsim':'\u223D','backsimeq':'\u22CD','Backslash':'\u2216','Barv':'\u2AE7','barvee':'\u22BD','barwed':'\u2305','Barwed':'\u2306','barwedge':'\u2305','bbrk':'\u23B5','bbrktbrk':'\u23B6','bcong':'\u224C','Bcy':'\u0411','bcy':'\u0431','bdquo':'\u201E','becaus':'\u2235','because':'\u2235','Because':'\u2235','bemptyv':'\u29B0','bepsi':'\u03F6','bernou':'\u212C','Bernoullis':'\u212C','Beta':'\u0392','beta':'\u03B2','beth':'\u2136','between':'\u226C','Bfr':'\uD835\uDD05','bfr':'\uD835\uDD1F','bigcap':'\u22C2','bigcirc':'\u25EF','bigcup':'\u22C3','bigodot':'\u2A00','bigoplus':'\u2A01','bigotimes':'\u2A02','bigsqcup':'\u2A06','bigstar':'\u2605','bigtriangledown':'\u25BD','bigtriangleup':'\u25B3','biguplus':'\u2A04','bigvee':'\u22C1','bigwedge':'\u22C0','bkarow':'\u290D','blacklozenge':'\u29EB','blacksquare':'\u25AA','blacktriangle':'\u25B4','blacktriangledown':'\u25BE','blacktriangleleft':'\u25C2','blacktriangleright':'\u25B8','blank':'\u2423','blk12':'\u2592','blk14':'\u2591','blk34':'\u2593','block':'\u2588','bne':'=\u20E5','bnequiv':'\u2261\u20E5','bNot':'\u2AED','bnot':'\u2310','Bopf':'\uD835\uDD39','bopf':'\uD835\uDD53','bot':'\u22A5','bottom':'\u22A5','bowtie':'\u22C8','boxbox':'\u29C9','boxdl':'\u2510','boxdL':'\u2555','boxDl':'\u2556','boxDL':'\u2557','boxdr':'\u250C','boxdR':'\u2552','boxDr':'\u2553','boxDR':'\u2554','boxh':'\u2500','boxH':'\u2550','boxhd':'\u252C','boxHd':'\u2564','boxhD':'\u2565','boxHD':'\u2566','boxhu':'\u2534','boxHu':'\u2567','boxhU':'\u2568','boxHU':'\u2569','boxminus':'\u229F','boxplus':'\u229E','boxtimes':'\u22A0','boxul':'\u2518','boxuL':'\u255B','boxUl':'\u255C','boxUL':'\u255D','boxur':'\u2514','boxuR':'\u2558','boxUr':'\u2559','boxUR':'\u255A','boxv':'\u2502','boxV':'\u2551','boxvh':'\u253C','boxvH':'\u256A','boxVh':'\u256B','boxVH':'\u256C','boxvl':'\u2524','boxvL':'\u2561','boxVl':'\u2562','boxVL':'\u2563','boxvr':'\u251C','boxvR':'\u255E','boxVr':'\u255F','boxVR':'\u2560','bprime':'\u2035','breve':'\u02D8','Breve':'\u02D8','brvbar':'\xA6','bscr':'\uD835\uDCB7','Bscr':'\u212C','bsemi':'\u204F','bsim':'\u223D','bsime':'\u22CD','bsolb':'\u29C5','bsol':'\\','bsolhsub':'\u27C8','bull':'\u2022','bullet':'\u2022','bump':'\u224E','bumpE':'\u2AAE','bumpe':'\u224F','Bumpeq':'\u224E','bumpeq':'\u224F','Cacute':'\u0106','cacute':'\u0107','capand':'\u2A44','capbrcup':'\u2A49','capcap':'\u2A4B','cap':'\u2229','Cap':'\u22D2','capcup':'\u2A47','capdot':'\u2A40','CapitalDifferentialD':'\u2145','caps':'\u2229\uFE00','caret':'\u2041','caron':'\u02C7','Cayleys':'\u212D','ccaps':'\u2A4D','Ccaron':'\u010C','ccaron':'\u010D','Ccedil':'\xC7','ccedil':'\xE7','Ccirc':'\u0108','ccirc':'\u0109','Cconint':'\u2230','ccups':'\u2A4C','ccupssm':'\u2A50','Cdot':'\u010A','cdot':'\u010B','cedil':'\xB8','Cedilla':'\xB8','cemptyv':'\u29B2','cent':'\xA2','centerdot':'\xB7','CenterDot':'\xB7','cfr':'\uD835\uDD20','Cfr':'\u212D','CHcy':'\u0427','chcy':'\u0447','check':'\u2713','checkmark':'\u2713','Chi':'\u03A7','chi':'\u03C7','circ':'\u02C6','circeq':'\u2257','circlearrowleft':'\u21BA','circlearrowright':'\u21BB','circledast':'\u229B','circledcirc':'\u229A','circleddash':'\u229D','CircleDot':'\u2299','circledR':'\xAE','circledS':'\u24C8','CircleMinus':'\u2296','CirclePlus':'\u2295','CircleTimes':'\u2297','cir':'\u25CB','cirE':'\u29C3','cire':'\u2257','cirfnint':'\u2A10','cirmid':'\u2AEF','cirscir':'\u29C2','ClockwiseContourIntegral':'\u2232','CloseCurlyDoubleQuote':'\u201D','CloseCurlyQuote':'\u2019','clubs':'\u2663','clubsuit':'\u2663','colon':':','Colon':'\u2237','Colone':'\u2A74','colone':'\u2254','coloneq':'\u2254','comma':',','commat':'@','comp':'\u2201','compfn':'\u2218','complement':'\u2201','complexes':'\u2102','cong':'\u2245','congdot':'\u2A6D','Congruent':'\u2261','conint':'\u222E','Conint':'\u222F','ContourIntegral':'\u222E','copf':'\uD835\uDD54','Copf':'\u2102','coprod':'\u2210','Coproduct':'\u2210','copy':'\xA9','COPY':'\xA9','copysr':'\u2117','CounterClockwiseContourIntegral':'\u2233','crarr':'\u21B5','cross':'\u2717','Cross':'\u2A2F','Cscr':'\uD835\uDC9E','cscr':'\uD835\uDCB8','csub':'\u2ACF','csube':'\u2AD1','csup':'\u2AD0','csupe':'\u2AD2','ctdot':'\u22EF','cudarrl':'\u2938','cudarrr':'\u2935','cuepr':'\u22DE','cuesc':'\u22DF','cularr':'\u21B6','cularrp':'\u293D','cupbrcap':'\u2A48','cupcap':'\u2A46','CupCap':'\u224D','cup':'\u222A','Cup':'\u22D3','cupcup':'\u2A4A','cupdot':'\u228D','cupor':'\u2A45','cups':'\u222A\uFE00','curarr':'\u21B7','curarrm':'\u293C','curlyeqprec':'\u22DE','curlyeqsucc':'\u22DF','curlyvee':'\u22CE','curlywedge':'\u22CF','curren':'\xA4','curvearrowleft':'\u21B6','curvearrowright':'\u21B7','cuvee':'\u22CE','cuwed':'\u22CF','cwconint':'\u2232','cwint':'\u2231','cylcty':'\u232D','dagger':'\u2020','Dagger':'\u2021','daleth':'\u2138','darr':'\u2193','Darr':'\u21A1','dArr':'\u21D3','dash':'\u2010','Dashv':'\u2AE4','dashv':'\u22A3','dbkarow':'\u290F','dblac':'\u02DD','Dcaron':'\u010E','dcaron':'\u010F','Dcy':'\u0414','dcy':'\u0434','ddagger':'\u2021','ddarr':'\u21CA','DD':'\u2145','dd':'\u2146','DDotrahd':'\u2911','ddotseq':'\u2A77','deg':'\xB0','Del':'\u2207','Delta':'\u0394','delta':'\u03B4','demptyv':'\u29B1','dfisht':'\u297F','Dfr':'\uD835\uDD07','dfr':'\uD835\uDD21','dHar':'\u2965','dharl':'\u21C3','dharr':'\u21C2','DiacriticalAcute':'\xB4','DiacriticalDot':'\u02D9','DiacriticalDoubleAcute':'\u02DD','DiacriticalGrave':'`','DiacriticalTilde':'\u02DC','diam':'\u22C4','diamond':'\u22C4','Diamond':'\u22C4','diamondsuit':'\u2666','diams':'\u2666','die':'\xA8','DifferentialD':'\u2146','digamma':'\u03DD','disin':'\u22F2','div':'\xF7','divide':'\xF7','divideontimes':'\u22C7','divonx':'\u22C7','DJcy':'\u0402','djcy':'\u0452','dlcorn':'\u231E','dlcrop':'\u230D','dollar':'$','Dopf':'\uD835\uDD3B','dopf':'\uD835\uDD55','Dot':'\xA8','dot':'\u02D9','DotDot':'\u20DC','doteq':'\u2250','doteqdot':'\u2251','DotEqual':'\u2250','dotminus':'\u2238','dotplus':'\u2214','dotsquare':'\u22A1','doublebarwedge':'\u2306','DoubleContourIntegral':'\u222F','DoubleDot':'\xA8','DoubleDownArrow':'\u21D3','DoubleLeftArrow':'\u21D0','DoubleLeftRightArrow':'\u21D4','DoubleLeftTee':'\u2AE4','DoubleLongLeftArrow':'\u27F8','DoubleLongLeftRightArrow':'\u27FA','DoubleLongRightArrow':'\u27F9','DoubleRightArrow':'\u21D2','DoubleRightTee':'\u22A8','DoubleUpArrow':'\u21D1','DoubleUpDownArrow':'\u21D5','DoubleVerticalBar':'\u2225','DownArrowBar':'\u2913','downarrow':'\u2193','DownArrow':'\u2193','Downarrow':'\u21D3','DownArrowUpArrow':'\u21F5','DownBreve':'\u0311','downdownarrows':'\u21CA','downharpoonleft':'\u21C3','downharpoonright':'\u21C2','DownLeftRightVector':'\u2950','DownLeftTeeVector':'\u295E','DownLeftVectorBar':'\u2956','DownLeftVector':'\u21BD','DownRightTeeVector':'\u295F','DownRightVectorBar':'\u2957','DownRightVector':'\u21C1','DownTeeArrow':'\u21A7','DownTee':'\u22A4','drbkarow':'\u2910','drcorn':'\u231F','drcrop':'\u230C','Dscr':'\uD835\uDC9F','dscr':'\uD835\uDCB9','DScy':'\u0405','dscy':'\u0455','dsol':'\u29F6','Dstrok':'\u0110','dstrok':'\u0111','dtdot':'\u22F1','dtri':'\u25BF','dtrif':'\u25BE','duarr':'\u21F5','duhar':'\u296F','dwangle':'\u29A6','DZcy':'\u040F','dzcy':'\u045F','dzigrarr':'\u27FF','Eacute':'\xC9','eacute':'\xE9','easter':'\u2A6E','Ecaron':'\u011A','ecaron':'\u011B','Ecirc':'\xCA','ecirc':'\xEA','ecir':'\u2256','ecolon':'\u2255','Ecy':'\u042D','ecy':'\u044D','eDDot':'\u2A77','Edot':'\u0116','edot':'\u0117','eDot':'\u2251','ee':'\u2147','efDot':'\u2252','Efr':'\uD835\uDD08','efr':'\uD835\uDD22','eg':'\u2A9A','Egrave':'\xC8','egrave':'\xE8','egs':'\u2A96','egsdot':'\u2A98','el':'\u2A99','Element':'\u2208','elinters':'\u23E7','ell':'\u2113','els':'\u2A95','elsdot':'\u2A97','Emacr':'\u0112','emacr':'\u0113','empty':'\u2205','emptyset':'\u2205','EmptySmallSquare':'\u25FB','emptyv':'\u2205','EmptyVerySmallSquare':'\u25AB','emsp13':'\u2004','emsp14':'\u2005','emsp':'\u2003','ENG':'\u014A','eng':'\u014B','ensp':'\u2002','Eogon':'\u0118','eogon':'\u0119','Eopf':'\uD835\uDD3C','eopf':'\uD835\uDD56','epar':'\u22D5','eparsl':'\u29E3','eplus':'\u2A71','epsi':'\u03B5','Epsilon':'\u0395','epsilon':'\u03B5','epsiv':'\u03F5','eqcirc':'\u2256','eqcolon':'\u2255','eqsim':'\u2242','eqslantgtr':'\u2A96','eqslantless':'\u2A95','Equal':'\u2A75','equals':'=','EqualTilde':'\u2242','equest':'\u225F','Equilibrium':'\u21CC','equiv':'\u2261','equivDD':'\u2A78','eqvparsl':'\u29E5','erarr':'\u2971','erDot':'\u2253','escr':'\u212F','Escr':'\u2130','esdot':'\u2250','Esim':'\u2A73','esim':'\u2242','Eta':'\u0397','eta':'\u03B7','ETH':'\xD0','eth':'\xF0','Euml':'\xCB','euml':'\xEB','euro':'\u20AC','excl':'!','exist':'\u2203','Exists':'\u2203','expectation':'\u2130','exponentiale':'\u2147','ExponentialE':'\u2147','fallingdotseq':'\u2252','Fcy':'\u0424','fcy':'\u0444','female':'\u2640','ffilig':'\uFB03','fflig':'\uFB00','ffllig':'\uFB04','Ffr':'\uD835\uDD09','ffr':'\uD835\uDD23','filig':'\uFB01','FilledSmallSquare':'\u25FC','FilledVerySmallSquare':'\u25AA','fjlig':'fj','flat':'\u266D','fllig':'\uFB02','fltns':'\u25B1','fnof':'\u0192','Fopf':'\uD835\uDD3D','fopf':'\uD835\uDD57','forall':'\u2200','ForAll':'\u2200','fork':'\u22D4','forkv':'\u2AD9','Fouriertrf':'\u2131','fpartint':'\u2A0D','frac12':'\xBD','frac13':'\u2153','frac14':'\xBC','frac15':'\u2155','frac16':'\u2159','frac18':'\u215B','frac23':'\u2154','frac25':'\u2156','frac34':'\xBE','frac35':'\u2157','frac38':'\u215C','frac45':'\u2158','frac56':'\u215A','frac58':'\u215D','frac78':'\u215E','frasl':'\u2044','frown':'\u2322','fscr':'\uD835\uDCBB','Fscr':'\u2131','gacute':'\u01F5','Gamma':'\u0393','gamma':'\u03B3','Gammad':'\u03DC','gammad':'\u03DD','gap':'\u2A86','Gbreve':'\u011E','gbreve':'\u011F','Gcedil':'\u0122','Gcirc':'\u011C','gcirc':'\u011D','Gcy':'\u0413','gcy':'\u0433','Gdot':'\u0120','gdot':'\u0121','ge':'\u2265','gE':'\u2267','gEl':'\u2A8C','gel':'\u22DB','geq':'\u2265','geqq':'\u2267','geqslant':'\u2A7E','gescc':'\u2AA9','ges':'\u2A7E','gesdot':'\u2A80','gesdoto':'\u2A82','gesdotol':'\u2A84','gesl':'\u22DB\uFE00','gesles':'\u2A94','Gfr':'\uD835\uDD0A','gfr':'\uD835\uDD24','gg':'\u226B','Gg':'\u22D9','ggg':'\u22D9','gimel':'\u2137','GJcy':'\u0403','gjcy':'\u0453','gla':'\u2AA5','gl':'\u2277','glE':'\u2A92','glj':'\u2AA4','gnap':'\u2A8A','gnapprox':'\u2A8A','gne':'\u2A88','gnE':'\u2269','gneq':'\u2A88','gneqq':'\u2269','gnsim':'\u22E7','Gopf':'\uD835\uDD3E','gopf':'\uD835\uDD58','grave':'`','GreaterEqual':'\u2265','GreaterEqualLess':'\u22DB','GreaterFullEqual':'\u2267','GreaterGreater':'\u2AA2','GreaterLess':'\u2277','GreaterSlantEqual':'\u2A7E','GreaterTilde':'\u2273','Gscr':'\uD835\uDCA2','gscr':'\u210A','gsim':'\u2273','gsime':'\u2A8E','gsiml':'\u2A90','gtcc':'\u2AA7','gtcir':'\u2A7A','gt':'>','GT':'>','Gt':'\u226B','gtdot':'\u22D7','gtlPar':'\u2995','gtquest':'\u2A7C','gtrapprox':'\u2A86','gtrarr':'\u2978','gtrdot':'\u22D7','gtreqless':'\u22DB','gtreqqless':'\u2A8C','gtrless':'\u2277','gtrsim':'\u2273','gvertneqq':'\u2269\uFE00','gvnE':'\u2269\uFE00','Hacek':'\u02C7','hairsp':'\u200A','half':'\xBD','hamilt':'\u210B','HARDcy':'\u042A','hardcy':'\u044A','harrcir':'\u2948','harr':'\u2194','hArr':'\u21D4','harrw':'\u21AD','Hat':'^','hbar':'\u210F','Hcirc':'\u0124','hcirc':'\u0125','hearts':'\u2665','heartsuit':'\u2665','hellip':'\u2026','hercon':'\u22B9','hfr':'\uD835\uDD25','Hfr':'\u210C','HilbertSpace':'\u210B','hksearow':'\u2925','hkswarow':'\u2926','hoarr':'\u21FF','homtht':'\u223B','hookleftarrow':'\u21A9','hookrightarrow':'\u21AA','hopf':'\uD835\uDD59','Hopf':'\u210D','horbar':'\u2015','HorizontalLine':'\u2500','hscr':'\uD835\uDCBD','Hscr':'\u210B','hslash':'\u210F','Hstrok':'\u0126','hstrok':'\u0127','HumpDownHump':'\u224E','HumpEqual':'\u224F','hybull':'\u2043','hyphen':'\u2010','Iacute':'\xCD','iacute':'\xED','ic':'\u2063','Icirc':'\xCE','icirc':'\xEE','Icy':'\u0418','icy':'\u0438','Idot':'\u0130','IEcy':'\u0415','iecy':'\u0435','iexcl':'\xA1','iff':'\u21D4','ifr':'\uD835\uDD26','Ifr':'\u2111','Igrave':'\xCC','igrave':'\xEC','ii':'\u2148','iiiint':'\u2A0C','iiint':'\u222D','iinfin':'\u29DC','iiota':'\u2129','IJlig':'\u0132','ijlig':'\u0133','Imacr':'\u012A','imacr':'\u012B','image':'\u2111','ImaginaryI':'\u2148','imagline':'\u2110','imagpart':'\u2111','imath':'\u0131','Im':'\u2111','imof':'\u22B7','imped':'\u01B5','Implies':'\u21D2','incare':'\u2105','in':'\u2208','infin':'\u221E','infintie':'\u29DD','inodot':'\u0131','intcal':'\u22BA','int':'\u222B','Int':'\u222C','integers':'\u2124','Integral':'\u222B','intercal':'\u22BA','Intersection':'\u22C2','intlarhk':'\u2A17','intprod':'\u2A3C','InvisibleComma':'\u2063','InvisibleTimes':'\u2062','IOcy':'\u0401','iocy':'\u0451','Iogon':'\u012E','iogon':'\u012F','Iopf':'\uD835\uDD40','iopf':'\uD835\uDD5A','Iota':'\u0399','iota':'\u03B9','iprod':'\u2A3C','iquest':'\xBF','iscr':'\uD835\uDCBE','Iscr':'\u2110','isin':'\u2208','isindot':'\u22F5','isinE':'\u22F9','isins':'\u22F4','isinsv':'\u22F3','isinv':'\u2208','it':'\u2062','Itilde':'\u0128','itilde':'\u0129','Iukcy':'\u0406','iukcy':'\u0456','Iuml':'\xCF','iuml':'\xEF','Jcirc':'\u0134','jcirc':'\u0135','Jcy':'\u0419','jcy':'\u0439','Jfr':'\uD835\uDD0D','jfr':'\uD835\uDD27','jmath':'\u0237','Jopf':'\uD835\uDD41','jopf':'\uD835\uDD5B','Jscr':'\uD835\uDCA5','jscr':'\uD835\uDCBF','Jsercy':'\u0408','jsercy':'\u0458','Jukcy':'\u0404','jukcy':'\u0454','Kappa':'\u039A','kappa':'\u03BA','kappav':'\u03F0','Kcedil':'\u0136','kcedil':'\u0137','Kcy':'\u041A','kcy':'\u043A','Kfr':'\uD835\uDD0E','kfr':'\uD835\uDD28','kgreen':'\u0138','KHcy':'\u0425','khcy':'\u0445','KJcy':'\u040C','kjcy':'\u045C','Kopf':'\uD835\uDD42','kopf':'\uD835\uDD5C','Kscr':'\uD835\uDCA6','kscr':'\uD835\uDCC0','lAarr':'\u21DA','Lacute':'\u0139','lacute':'\u013A','laemptyv':'\u29B4','lagran':'\u2112','Lambda':'\u039B','lambda':'\u03BB','lang':'\u27E8','Lang':'\u27EA','langd':'\u2991','langle':'\u27E8','lap':'\u2A85','Laplacetrf':'\u2112','laquo':'\xAB','larrb':'\u21E4','larrbfs':'\u291F','larr':'\u2190','Larr':'\u219E','lArr':'\u21D0','larrfs':'\u291D','larrhk':'\u21A9','larrlp':'\u21AB','larrpl':'\u2939','larrsim':'\u2973','larrtl':'\u21A2','latail':'\u2919','lAtail':'\u291B','lat':'\u2AAB','late':'\u2AAD','lates':'\u2AAD\uFE00','lbarr':'\u290C','lBarr':'\u290E','lbbrk':'\u2772','lbrace':'{','lbrack':'[','lbrke':'\u298B','lbrksld':'\u298F','lbrkslu':'\u298D','Lcaron':'\u013D','lcaron':'\u013E','Lcedil':'\u013B','lcedil':'\u013C','lceil':'\u2308','lcub':'{','Lcy':'\u041B','lcy':'\u043B','ldca':'\u2936','ldquo':'\u201C','ldquor':'\u201E','ldrdhar':'\u2967','ldrushar':'\u294B','ldsh':'\u21B2','le':'\u2264','lE':'\u2266','LeftAngleBracket':'\u27E8','LeftArrowBar':'\u21E4','leftarrow':'\u2190','LeftArrow':'\u2190','Leftarrow':'\u21D0','LeftArrowRightArrow':'\u21C6','leftarrowtail':'\u21A2','LeftCeiling':'\u2308','LeftDoubleBracket':'\u27E6','LeftDownTeeVector':'\u2961','LeftDownVectorBar':'\u2959','LeftDownVector':'\u21C3','LeftFloor':'\u230A','leftharpoondown':'\u21BD','leftharpoonup':'\u21BC','leftleftarrows':'\u21C7','leftrightarrow':'\u2194','LeftRightArrow':'\u2194','Leftrightarrow':'\u21D4','leftrightarrows':'\u21C6','leftrightharpoons':'\u21CB','leftrightsquigarrow':'\u21AD','LeftRightVector':'\u294E','LeftTeeArrow':'\u21A4','LeftTee':'\u22A3','LeftTeeVector':'\u295A','leftthreetimes':'\u22CB','LeftTriangleBar':'\u29CF','LeftTriangle':'\u22B2','LeftTriangleEqual':'\u22B4','LeftUpDownVector':'\u2951','LeftUpTeeVector':'\u2960','LeftUpVectorBar':'\u2958','LeftUpVector':'\u21BF','LeftVectorBar':'\u2952','LeftVector':'\u21BC','lEg':'\u2A8B','leg':'\u22DA','leq':'\u2264','leqq':'\u2266','leqslant':'\u2A7D','lescc':'\u2AA8','les':'\u2A7D','lesdot':'\u2A7F','lesdoto':'\u2A81','lesdotor':'\u2A83','lesg':'\u22DA\uFE00','lesges':'\u2A93','lessapprox':'\u2A85','lessdot':'\u22D6','lesseqgtr':'\u22DA','lesseqqgtr':'\u2A8B','LessEqualGreater':'\u22DA','LessFullEqual':'\u2266','LessGreater':'\u2276','lessgtr':'\u2276','LessLess':'\u2AA1','lesssim':'\u2272','LessSlantEqual':'\u2A7D','LessTilde':'\u2272','lfisht':'\u297C','lfloor':'\u230A','Lfr':'\uD835\uDD0F','lfr':'\uD835\uDD29','lg':'\u2276','lgE':'\u2A91','lHar':'\u2962','lhard':'\u21BD','lharu':'\u21BC','lharul':'\u296A','lhblk':'\u2584','LJcy':'\u0409','ljcy':'\u0459','llarr':'\u21C7','ll':'\u226A','Ll':'\u22D8','llcorner':'\u231E','Lleftarrow':'\u21DA','llhard':'\u296B','lltri':'\u25FA','Lmidot':'\u013F','lmidot':'\u0140','lmoustache':'\u23B0','lmoust':'\u23B0','lnap':'\u2A89','lnapprox':'\u2A89','lne':'\u2A87','lnE':'\u2268','lneq':'\u2A87','lneqq':'\u2268','lnsim':'\u22E6','loang':'\u27EC','loarr':'\u21FD','lobrk':'\u27E6','longleftarrow':'\u27F5','LongLeftArrow':'\u27F5','Longleftarrow':'\u27F8','longleftrightarrow':'\u27F7','LongLeftRightArrow':'\u27F7','Longleftrightarrow':'\u27FA','longmapsto':'\u27FC','longrightarrow':'\u27F6','LongRightArrow':'\u27F6','Longrightarrow':'\u27F9','looparrowleft':'\u21AB','looparrowright':'\u21AC','lopar':'\u2985','Lopf':'\uD835\uDD43','lopf':'\uD835\uDD5D','loplus':'\u2A2D','lotimes':'\u2A34','lowast':'\u2217','lowbar':'_','LowerLeftArrow':'\u2199','LowerRightArrow':'\u2198','loz':'\u25CA','lozenge':'\u25CA','lozf':'\u29EB','lpar':'(','lparlt':'\u2993','lrarr':'\u21C6','lrcorner':'\u231F','lrhar':'\u21CB','lrhard':'\u296D','lrm':'\u200E','lrtri':'\u22BF','lsaquo':'\u2039','lscr':'\uD835\uDCC1','Lscr':'\u2112','lsh':'\u21B0','Lsh':'\u21B0','lsim':'\u2272','lsime':'\u2A8D','lsimg':'\u2A8F','lsqb':'[','lsquo':'\u2018','lsquor':'\u201A','Lstrok':'\u0141','lstrok':'\u0142','ltcc':'\u2AA6','ltcir':'\u2A79','lt':'<','LT':'<','Lt':'\u226A','ltdot':'\u22D6','lthree':'\u22CB','ltimes':'\u22C9','ltlarr':'\u2976','ltquest':'\u2A7B','ltri':'\u25C3','ltrie':'\u22B4','ltrif':'\u25C2','ltrPar':'\u2996','lurdshar':'\u294A','luruhar':'\u2966','lvertneqq':'\u2268\uFE00','lvnE':'\u2268\uFE00','macr':'\xAF','male':'\u2642','malt':'\u2720','maltese':'\u2720','Map':'\u2905','map':'\u21A6','mapsto':'\u21A6','mapstodown':'\u21A7','mapstoleft':'\u21A4','mapstoup':'\u21A5','marker':'\u25AE','mcomma':'\u2A29','Mcy':'\u041C','mcy':'\u043C','mdash':'\u2014','mDDot':'\u223A','measuredangle':'\u2221','MediumSpace':'\u205F','Mellintrf':'\u2133','Mfr':'\uD835\uDD10','mfr':'\uD835\uDD2A','mho':'\u2127','micro':'\xB5','midast':'*','midcir':'\u2AF0','mid':'\u2223','middot':'\xB7','minusb':'\u229F','minus':'\u2212','minusd':'\u2238','minusdu':'\u2A2A','MinusPlus':'\u2213','mlcp':'\u2ADB','mldr':'\u2026','mnplus':'\u2213','models':'\u22A7','Mopf':'\uD835\uDD44','mopf':'\uD835\uDD5E','mp':'\u2213','mscr':'\uD835\uDCC2','Mscr':'\u2133','mstpos':'\u223E','Mu':'\u039C','mu':'\u03BC','multimap':'\u22B8','mumap':'\u22B8','nabla':'\u2207','Nacute':'\u0143','nacute':'\u0144','nang':'\u2220\u20D2','nap':'\u2249','napE':'\u2A70\u0338','napid':'\u224B\u0338','napos':'\u0149','napprox':'\u2249','natural':'\u266E','naturals':'\u2115','natur':'\u266E','nbsp':'\xA0','nbump':'\u224E\u0338','nbumpe':'\u224F\u0338','ncap':'\u2A43','Ncaron':'\u0147','ncaron':'\u0148','Ncedil':'\u0145','ncedil':'\u0146','ncong':'\u2247','ncongdot':'\u2A6D\u0338','ncup':'\u2A42','Ncy':'\u041D','ncy':'\u043D','ndash':'\u2013','nearhk':'\u2924','nearr':'\u2197','neArr':'\u21D7','nearrow':'\u2197','ne':'\u2260','nedot':'\u2250\u0338','NegativeMediumSpace':'\u200B','NegativeThickSpace':'\u200B','NegativeThinSpace':'\u200B','NegativeVeryThinSpace':'\u200B','nequiv':'\u2262','nesear':'\u2928','nesim':'\u2242\u0338','NestedGreaterGreater':'\u226B','NestedLessLess':'\u226A','NewLine':'\n','nexist':'\u2204','nexists':'\u2204','Nfr':'\uD835\uDD11','nfr':'\uD835\uDD2B','ngE':'\u2267\u0338','nge':'\u2271','ngeq':'\u2271','ngeqq':'\u2267\u0338','ngeqslant':'\u2A7E\u0338','nges':'\u2A7E\u0338','nGg':'\u22D9\u0338','ngsim':'\u2275','nGt':'\u226B\u20D2','ngt':'\u226F','ngtr':'\u226F','nGtv':'\u226B\u0338','nharr':'\u21AE','nhArr':'\u21CE','nhpar':'\u2AF2','ni':'\u220B','nis':'\u22FC','nisd':'\u22FA','niv':'\u220B','NJcy':'\u040A','njcy':'\u045A','nlarr':'\u219A','nlArr':'\u21CD','nldr':'\u2025','nlE':'\u2266\u0338','nle':'\u2270','nleftarrow':'\u219A','nLeftarrow':'\u21CD','nleftrightarrow':'\u21AE','nLeftrightarrow':'\u21CE','nleq':'\u2270','nleqq':'\u2266\u0338','nleqslant':'\u2A7D\u0338','nles':'\u2A7D\u0338','nless':'\u226E','nLl':'\u22D8\u0338','nlsim':'\u2274','nLt':'\u226A\u20D2','nlt':'\u226E','nltri':'\u22EA','nltrie':'\u22EC','nLtv':'\u226A\u0338','nmid':'\u2224','NoBreak':'\u2060','NonBreakingSpace':'\xA0','nopf':'\uD835\uDD5F','Nopf':'\u2115','Not':'\u2AEC','not':'\xAC','NotCongruent':'\u2262','NotCupCap':'\u226D','NotDoubleVerticalBar':'\u2226','NotElement':'\u2209','NotEqual':'\u2260','NotEqualTilde':'\u2242\u0338','NotExists':'\u2204','NotGreater':'\u226F','NotGreaterEqual':'\u2271','NotGreaterFullEqual':'\u2267\u0338','NotGreaterGreater':'\u226B\u0338','NotGreaterLess':'\u2279','NotGreaterSlantEqual':'\u2A7E\u0338','NotGreaterTilde':'\u2275','NotHumpDownHump':'\u224E\u0338','NotHumpEqual':'\u224F\u0338','notin':'\u2209','notindot':'\u22F5\u0338','notinE':'\u22F9\u0338','notinva':'\u2209','notinvb':'\u22F7','notinvc':'\u22F6','NotLeftTriangleBar':'\u29CF\u0338','NotLeftTriangle':'\u22EA','NotLeftTriangleEqual':'\u22EC','NotLess':'\u226E','NotLessEqual':'\u2270','NotLessGreater':'\u2278','NotLessLess':'\u226A\u0338','NotLessSlantEqual':'\u2A7D\u0338','NotLessTilde':'\u2274','NotNestedGreaterGreater':'\u2AA2\u0338','NotNestedLessLess':'\u2AA1\u0338','notni':'\u220C','notniva':'\u220C','notnivb':'\u22FE','notnivc':'\u22FD','NotPrecedes':'\u2280','NotPrecedesEqual':'\u2AAF\u0338','NotPrecedesSlantEqual':'\u22E0','NotReverseElement':'\u220C','NotRightTriangleBar':'\u29D0\u0338','NotRightTriangle':'\u22EB','NotRightTriangleEqual':'\u22ED','NotSquareSubset':'\u228F\u0338','NotSquareSubsetEqual':'\u22E2','NotSquareSuperset':'\u2290\u0338','NotSquareSupersetEqual':'\u22E3','NotSubset':'\u2282\u20D2','NotSubsetEqual':'\u2288','NotSucceeds':'\u2281','NotSucceedsEqual':'\u2AB0\u0338','NotSucceedsSlantEqual':'\u22E1','NotSucceedsTilde':'\u227F\u0338','NotSuperset':'\u2283\u20D2','NotSupersetEqual':'\u2289','NotTilde':'\u2241','NotTildeEqual':'\u2244','NotTildeFullEqual':'\u2247','NotTildeTilde':'\u2249','NotVerticalBar':'\u2224','nparallel':'\u2226','npar':'\u2226','nparsl':'\u2AFD\u20E5','npart':'\u2202\u0338','npolint':'\u2A14','npr':'\u2280','nprcue':'\u22E0','nprec':'\u2280','npreceq':'\u2AAF\u0338','npre':'\u2AAF\u0338','nrarrc':'\u2933\u0338','nrarr':'\u219B','nrArr':'\u21CF','nrarrw':'\u219D\u0338','nrightarrow':'\u219B','nRightarrow':'\u21CF','nrtri':'\u22EB','nrtrie':'\u22ED','nsc':'\u2281','nsccue':'\u22E1','nsce':'\u2AB0\u0338','Nscr':'\uD835\uDCA9','nscr':'\uD835\uDCC3','nshortmid':'\u2224','nshortparallel':'\u2226','nsim':'\u2241','nsime':'\u2244','nsimeq':'\u2244','nsmid':'\u2224','nspar':'\u2226','nsqsube':'\u22E2','nsqsupe':'\u22E3','nsub':'\u2284','nsubE':'\u2AC5\u0338','nsube':'\u2288','nsubset':'\u2282\u20D2','nsubseteq':'\u2288','nsubseteqq':'\u2AC5\u0338','nsucc':'\u2281','nsucceq':'\u2AB0\u0338','nsup':'\u2285','nsupE':'\u2AC6\u0338','nsupe':'\u2289','nsupset':'\u2283\u20D2','nsupseteq':'\u2289','nsupseteqq':'\u2AC6\u0338','ntgl':'\u2279','Ntilde':'\xD1','ntilde':'\xF1','ntlg':'\u2278','ntriangleleft':'\u22EA','ntrianglelefteq':'\u22EC','ntriangleright':'\u22EB','ntrianglerighteq':'\u22ED','Nu':'\u039D','nu':'\u03BD','num':'#','numero':'\u2116','numsp':'\u2007','nvap':'\u224D\u20D2','nvdash':'\u22AC','nvDash':'\u22AD','nVdash':'\u22AE','nVDash':'\u22AF','nvge':'\u2265\u20D2','nvgt':'>\u20D2','nvHarr':'\u2904','nvinfin':'\u29DE','nvlArr':'\u2902','nvle':'\u2264\u20D2','nvlt':'<\u20D2','nvltrie':'\u22B4\u20D2','nvrArr':'\u2903','nvrtrie':'\u22B5\u20D2','nvsim':'\u223C\u20D2','nwarhk':'\u2923','nwarr':'\u2196','nwArr':'\u21D6','nwarrow':'\u2196','nwnear':'\u2927','Oacute':'\xD3','oacute':'\xF3','oast':'\u229B','Ocirc':'\xD4','ocirc':'\xF4','ocir':'\u229A','Ocy':'\u041E','ocy':'\u043E','odash':'\u229D','Odblac':'\u0150','odblac':'\u0151','odiv':'\u2A38','odot':'\u2299','odsold':'\u29BC','OElig':'\u0152','oelig':'\u0153','ofcir':'\u29BF','Ofr':'\uD835\uDD12','ofr':'\uD835\uDD2C','ogon':'\u02DB','Ograve':'\xD2','ograve':'\xF2','ogt':'\u29C1','ohbar':'\u29B5','ohm':'\u03A9','oint':'\u222E','olarr':'\u21BA','olcir':'\u29BE','olcross':'\u29BB','oline':'\u203E','olt':'\u29C0','Omacr':'\u014C','omacr':'\u014D','Omega':'\u03A9','omega':'\u03C9','Omicron':'\u039F','omicron':'\u03BF','omid':'\u29B6','ominus':'\u2296','Oopf':'\uD835\uDD46','oopf':'\uD835\uDD60','opar':'\u29B7','OpenCurlyDoubleQuote':'\u201C','OpenCurlyQuote':'\u2018','operp':'\u29B9','oplus':'\u2295','orarr':'\u21BB','Or':'\u2A54','or':'\u2228','ord':'\u2A5D','order':'\u2134','orderof':'\u2134','ordf':'\xAA','ordm':'\xBA','origof':'\u22B6','oror':'\u2A56','orslope':'\u2A57','orv':'\u2A5B','oS':'\u24C8','Oscr':'\uD835\uDCAA','oscr':'\u2134','Oslash':'\xD8','oslash':'\xF8','osol':'\u2298','Otilde':'\xD5','otilde':'\xF5','otimesas':'\u2A36','Otimes':'\u2A37','otimes':'\u2297','Ouml':'\xD6','ouml':'\xF6','ovbar':'\u233D','OverBar':'\u203E','OverBrace':'\u23DE','OverBracket':'\u23B4','OverParenthesis':'\u23DC','para':'\xB6','parallel':'\u2225','par':'\u2225','parsim':'\u2AF3','parsl':'\u2AFD','part':'\u2202','PartialD':'\u2202','Pcy':'\u041F','pcy':'\u043F','percnt':'%','period':'.','permil':'\u2030','perp':'\u22A5','pertenk':'\u2031','Pfr':'\uD835\uDD13','pfr':'\uD835\uDD2D','Phi':'\u03A6','phi':'\u03C6','phiv':'\u03D5','phmmat':'\u2133','phone':'\u260E','Pi':'\u03A0','pi':'\u03C0','pitchfork':'\u22D4','piv':'\u03D6','planck':'\u210F','planckh':'\u210E','plankv':'\u210F','plusacir':'\u2A23','plusb':'\u229E','pluscir':'\u2A22','plus':'+','plusdo':'\u2214','plusdu':'\u2A25','pluse':'\u2A72','PlusMinus':'\xB1','plusmn':'\xB1','plussim':'\u2A26','plustwo':'\u2A27','pm':'\xB1','Poincareplane':'\u210C','pointint':'\u2A15','popf':'\uD835\uDD61','Popf':'\u2119','pound':'\xA3','prap':'\u2AB7','Pr':'\u2ABB','pr':'\u227A','prcue':'\u227C','precapprox':'\u2AB7','prec':'\u227A','preccurlyeq':'\u227C','Precedes':'\u227A','PrecedesEqual':'\u2AAF','PrecedesSlantEqual':'\u227C','PrecedesTilde':'\u227E','preceq':'\u2AAF','precnapprox':'\u2AB9','precneqq':'\u2AB5','precnsim':'\u22E8','pre':'\u2AAF','prE':'\u2AB3','precsim':'\u227E','prime':'\u2032','Prime':'\u2033','primes':'\u2119','prnap':'\u2AB9','prnE':'\u2AB5','prnsim':'\u22E8','prod':'\u220F','Product':'\u220F','profalar':'\u232E','profline':'\u2312','profsurf':'\u2313','prop':'\u221D','Proportional':'\u221D','Proportion':'\u2237','propto':'\u221D','prsim':'\u227E','prurel':'\u22B0','Pscr':'\uD835\uDCAB','pscr':'\uD835\uDCC5','Psi':'\u03A8','psi':'\u03C8','puncsp':'\u2008','Qfr':'\uD835\uDD14','qfr':'\uD835\uDD2E','qint':'\u2A0C','qopf':'\uD835\uDD62','Qopf':'\u211A','qprime':'\u2057','Qscr':'\uD835\uDCAC','qscr':'\uD835\uDCC6','quaternions':'\u210D','quatint':'\u2A16','quest':'?','questeq':'\u225F','quot':'"','QUOT':'"','rAarr':'\u21DB','race':'\u223D\u0331','Racute':'\u0154','racute':'\u0155','radic':'\u221A','raemptyv':'\u29B3','rang':'\u27E9','Rang':'\u27EB','rangd':'\u2992','range':'\u29A5','rangle':'\u27E9','raquo':'\xBB','rarrap':'\u2975','rarrb':'\u21E5','rarrbfs':'\u2920','rarrc':'\u2933','rarr':'\u2192','Rarr':'\u21A0','rArr':'\u21D2','rarrfs':'\u291E','rarrhk':'\u21AA','rarrlp':'\u21AC','rarrpl':'\u2945','rarrsim':'\u2974','Rarrtl':'\u2916','rarrtl':'\u21A3','rarrw':'\u219D','ratail':'\u291A','rAtail':'\u291C','ratio':'\u2236','rationals':'\u211A','rbarr':'\u290D','rBarr':'\u290F','RBarr':'\u2910','rbbrk':'\u2773','rbrace':'}','rbrack':']','rbrke':'\u298C','rbrksld':'\u298E','rbrkslu':'\u2990','Rcaron':'\u0158','rcaron':'\u0159','Rcedil':'\u0156','rcedil':'\u0157','rceil':'\u2309','rcub':'}','Rcy':'\u0420','rcy':'\u0440','rdca':'\u2937','rdldhar':'\u2969','rdquo':'\u201D','rdquor':'\u201D','rdsh':'\u21B3','real':'\u211C','realine':'\u211B','realpart':'\u211C','reals':'\u211D','Re':'\u211C','rect':'\u25AD','reg':'\xAE','REG':'\xAE','ReverseElement':'\u220B','ReverseEquilibrium':'\u21CB','ReverseUpEquilibrium':'\u296F','rfisht':'\u297D','rfloor':'\u230B','rfr':'\uD835\uDD2F','Rfr':'\u211C','rHar':'\u2964','rhard':'\u21C1','rharu':'\u21C0','rharul':'\u296C','Rho':'\u03A1','rho':'\u03C1','rhov':'\u03F1','RightAngleBracket':'\u27E9','RightArrowBar':'\u21E5','rightarrow':'\u2192','RightArrow':'\u2192','Rightarrow':'\u21D2','RightArrowLeftArrow':'\u21C4','rightarrowtail':'\u21A3','RightCeiling':'\u2309','RightDoubleBracket':'\u27E7','RightDownTeeVector':'\u295D','RightDownVectorBar':'\u2955','RightDownVector':'\u21C2','RightFloor':'\u230B','rightharpoondown':'\u21C1','rightharpoonup':'\u21C0','rightleftarrows':'\u21C4','rightleftharpoons':'\u21CC','rightrightarrows':'\u21C9','rightsquigarrow':'\u219D','RightTeeArrow':'\u21A6','RightTee':'\u22A2','RightTeeVector':'\u295B','rightthreetimes':'\u22CC','RightTriangleBar':'\u29D0','RightTriangle':'\u22B3','RightTriangleEqual':'\u22B5','RightUpDownVector':'\u294F','RightUpTeeVector':'\u295C','RightUpVectorBar':'\u2954','RightUpVector':'\u21BE','RightVectorBar':'\u2953','RightVector':'\u21C0','ring':'\u02DA','risingdotseq':'\u2253','rlarr':'\u21C4','rlhar':'\u21CC','rlm':'\u200F','rmoustache':'\u23B1','rmoust':'\u23B1','rnmid':'\u2AEE','roang':'\u27ED','roarr':'\u21FE','robrk':'\u27E7','ropar':'\u2986','ropf':'\uD835\uDD63','Ropf':'\u211D','roplus':'\u2A2E','rotimes':'\u2A35','RoundImplies':'\u2970','rpar':')','rpargt':'\u2994','rppolint':'\u2A12','rrarr':'\u21C9','Rrightarrow':'\u21DB','rsaquo':'\u203A','rscr':'\uD835\uDCC7','Rscr':'\u211B','rsh':'\u21B1','Rsh':'\u21B1','rsqb':']','rsquo':'\u2019','rsquor':'\u2019','rthree':'\u22CC','rtimes':'\u22CA','rtri':'\u25B9','rtrie':'\u22B5','rtrif':'\u25B8','rtriltri':'\u29CE','RuleDelayed':'\u29F4','ruluhar':'\u2968','rx':'\u211E','Sacute':'\u015A','sacute':'\u015B','sbquo':'\u201A','scap':'\u2AB8','Scaron':'\u0160','scaron':'\u0161','Sc':'\u2ABC','sc':'\u227B','sccue':'\u227D','sce':'\u2AB0','scE':'\u2AB4','Scedil':'\u015E','scedil':'\u015F','Scirc':'\u015C','scirc':'\u015D','scnap':'\u2ABA','scnE':'\u2AB6','scnsim':'\u22E9','scpolint':'\u2A13','scsim':'\u227F','Scy':'\u0421','scy':'\u0441','sdotb':'\u22A1','sdot':'\u22C5','sdote':'\u2A66','searhk':'\u2925','searr':'\u2198','seArr':'\u21D8','searrow':'\u2198','sect':'\xA7','semi':';','seswar':'\u2929','setminus':'\u2216','setmn':'\u2216','sext':'\u2736','Sfr':'\uD835\uDD16','sfr':'\uD835\uDD30','sfrown':'\u2322','sharp':'\u266F','SHCHcy':'\u0429','shchcy':'\u0449','SHcy':'\u0428','shcy':'\u0448','ShortDownArrow':'\u2193','ShortLeftArrow':'\u2190','shortmid':'\u2223','shortparallel':'\u2225','ShortRightArrow':'\u2192','ShortUpArrow':'\u2191','shy':'\xAD','Sigma':'\u03A3','sigma':'\u03C3','sigmaf':'\u03C2','sigmav':'\u03C2','sim':'\u223C','simdot':'\u2A6A','sime':'\u2243','simeq':'\u2243','simg':'\u2A9E','simgE':'\u2AA0','siml':'\u2A9D','simlE':'\u2A9F','simne':'\u2246','simplus':'\u2A24','simrarr':'\u2972','slarr':'\u2190','SmallCircle':'\u2218','smallsetminus':'\u2216','smashp':'\u2A33','smeparsl':'\u29E4','smid':'\u2223','smile':'\u2323','smt':'\u2AAA','smte':'\u2AAC','smtes':'\u2AAC\uFE00','SOFTcy':'\u042C','softcy':'\u044C','solbar':'\u233F','solb':'\u29C4','sol':'/','Sopf':'\uD835\uDD4A','sopf':'\uD835\uDD64','spades':'\u2660','spadesuit':'\u2660','spar':'\u2225','sqcap':'\u2293','sqcaps':'\u2293\uFE00','sqcup':'\u2294','sqcups':'\u2294\uFE00','Sqrt':'\u221A','sqsub':'\u228F','sqsube':'\u2291','sqsubset':'\u228F','sqsubseteq':'\u2291','sqsup':'\u2290','sqsupe':'\u2292','sqsupset':'\u2290','sqsupseteq':'\u2292','square':'\u25A1','Square':'\u25A1','SquareIntersection':'\u2293','SquareSubset':'\u228F','SquareSubsetEqual':'\u2291','SquareSuperset':'\u2290','SquareSupersetEqual':'\u2292','SquareUnion':'\u2294','squarf':'\u25AA','squ':'\u25A1','squf':'\u25AA','srarr':'\u2192','Sscr':'\uD835\uDCAE','sscr':'\uD835\uDCC8','ssetmn':'\u2216','ssmile':'\u2323','sstarf':'\u22C6','Star':'\u22C6','star':'\u2606','starf':'\u2605','straightepsilon':'\u03F5','straightphi':'\u03D5','strns':'\xAF','sub':'\u2282','Sub':'\u22D0','subdot':'\u2ABD','subE':'\u2AC5','sube':'\u2286','subedot':'\u2AC3','submult':'\u2AC1','subnE':'\u2ACB','subne':'\u228A','subplus':'\u2ABF','subrarr':'\u2979','subset':'\u2282','Subset':'\u22D0','subseteq':'\u2286','subseteqq':'\u2AC5','SubsetEqual':'\u2286','subsetneq':'\u228A','subsetneqq':'\u2ACB','subsim':'\u2AC7','subsub':'\u2AD5','subsup':'\u2AD3','succapprox':'\u2AB8','succ':'\u227B','succcurlyeq':'\u227D','Succeeds':'\u227B','SucceedsEqual':'\u2AB0','SucceedsSlantEqual':'\u227D','SucceedsTilde':'\u227F','succeq':'\u2AB0','succnapprox':'\u2ABA','succneqq':'\u2AB6','succnsim':'\u22E9','succsim':'\u227F','SuchThat':'\u220B','sum':'\u2211','Sum':'\u2211','sung':'\u266A','sup1':'\xB9','sup2':'\xB2','sup3':'\xB3','sup':'\u2283','Sup':'\u22D1','supdot':'\u2ABE','supdsub':'\u2AD8','supE':'\u2AC6','supe':'\u2287','supedot':'\u2AC4','Superset':'\u2283','SupersetEqual':'\u2287','suphsol':'\u27C9','suphsub':'\u2AD7','suplarr':'\u297B','supmult':'\u2AC2','supnE':'\u2ACC','supne':'\u228B','supplus':'\u2AC0','supset':'\u2283','Supset':'\u22D1','supseteq':'\u2287','supseteqq':'\u2AC6','supsetneq':'\u228B','supsetneqq':'\u2ACC','supsim':'\u2AC8','supsub':'\u2AD4','supsup':'\u2AD6','swarhk':'\u2926','swarr':'\u2199','swArr':'\u21D9','swarrow':'\u2199','swnwar':'\u292A','szlig':'\xDF','Tab':'\t','target':'\u2316','Tau':'\u03A4','tau':'\u03C4','tbrk':'\u23B4','Tcaron':'\u0164','tcaron':'\u0165','Tcedil':'\u0162','tcedil':'\u0163','Tcy':'\u0422','tcy':'\u0442','tdot':'\u20DB','telrec':'\u2315','Tfr':'\uD835\uDD17','tfr':'\uD835\uDD31','there4':'\u2234','therefore':'\u2234','Therefore':'\u2234','Theta':'\u0398','theta':'\u03B8','thetasym':'\u03D1','thetav':'\u03D1','thickapprox':'\u2248','thicksim':'\u223C','ThickSpace':'\u205F\u200A','ThinSpace':'\u2009','thinsp':'\u2009','thkap':'\u2248','thksim':'\u223C','THORN':'\xDE','thorn':'\xFE','tilde':'\u02DC','Tilde':'\u223C','TildeEqual':'\u2243','TildeFullEqual':'\u2245','TildeTilde':'\u2248','timesbar':'\u2A31','timesb':'\u22A0','times':'\xD7','timesd':'\u2A30','tint':'\u222D','toea':'\u2928','topbot':'\u2336','topcir':'\u2AF1','top':'\u22A4','Topf':'\uD835\uDD4B','topf':'\uD835\uDD65','topfork':'\u2ADA','tosa':'\u2929','tprime':'\u2034','trade':'\u2122','TRADE':'\u2122','triangle':'\u25B5','triangledown':'\u25BF','triangleleft':'\u25C3','trianglelefteq':'\u22B4','triangleq':'\u225C','triangleright':'\u25B9','trianglerighteq':'\u22B5','tridot':'\u25EC','trie':'\u225C','triminus':'\u2A3A','TripleDot':'\u20DB','triplus':'\u2A39','trisb':'\u29CD','tritime':'\u2A3B','trpezium':'\u23E2','Tscr':'\uD835\uDCAF','tscr':'\uD835\uDCC9','TScy':'\u0426','tscy':'\u0446','TSHcy':'\u040B','tshcy':'\u045B','Tstrok':'\u0166','tstrok':'\u0167','twixt':'\u226C','twoheadleftarrow':'\u219E','twoheadrightarrow':'\u21A0','Uacute':'\xDA','uacute':'\xFA','uarr':'\u2191','Uarr':'\u219F','uArr':'\u21D1','Uarrocir':'\u2949','Ubrcy':'\u040E','ubrcy':'\u045E','Ubreve':'\u016C','ubreve':'\u016D','Ucirc':'\xDB','ucirc':'\xFB','Ucy':'\u0423','ucy':'\u0443','udarr':'\u21C5','Udblac':'\u0170','udblac':'\u0171','udhar':'\u296E','ufisht':'\u297E','Ufr':'\uD835\uDD18','ufr':'\uD835\uDD32','Ugrave':'\xD9','ugrave':'\xF9','uHar':'\u2963','uharl':'\u21BF','uharr':'\u21BE','uhblk':'\u2580','ulcorn':'\u231C','ulcorner':'\u231C','ulcrop':'\u230F','ultri':'\u25F8','Umacr':'\u016A','umacr':'\u016B','uml':'\xA8','UnderBar':'_','UnderBrace':'\u23DF','UnderBracket':'\u23B5','UnderParenthesis':'\u23DD','Union':'\u22C3','UnionPlus':'\u228E','Uogon':'\u0172','uogon':'\u0173','Uopf':'\uD835\uDD4C','uopf':'\uD835\uDD66','UpArrowBar':'\u2912','uparrow':'\u2191','UpArrow':'\u2191','Uparrow':'\u21D1','UpArrowDownArrow':'\u21C5','updownarrow':'\u2195','UpDownArrow':'\u2195','Updownarrow':'\u21D5','UpEquilibrium':'\u296E','upharpoonleft':'\u21BF','upharpoonright':'\u21BE','uplus':'\u228E','UpperLeftArrow':'\u2196','UpperRightArrow':'\u2197','upsi':'\u03C5','Upsi':'\u03D2','upsih':'\u03D2','Upsilon':'\u03A5','upsilon':'\u03C5','UpTeeArrow':'\u21A5','UpTee':'\u22A5','upuparrows':'\u21C8','urcorn':'\u231D','urcorner':'\u231D','urcrop':'\u230E','Uring':'\u016E','uring':'\u016F','urtri':'\u25F9','Uscr':'\uD835\uDCB0','uscr':'\uD835\uDCCA','utdot':'\u22F0','Utilde':'\u0168','utilde':'\u0169','utri':'\u25B5','utrif':'\u25B4','uuarr':'\u21C8','Uuml':'\xDC','uuml':'\xFC','uwangle':'\u29A7','vangrt':'\u299C','varepsilon':'\u03F5','varkappa':'\u03F0','varnothing':'\u2205','varphi':'\u03D5','varpi':'\u03D6','varpropto':'\u221D','varr':'\u2195','vArr':'\u21D5','varrho':'\u03F1','varsigma':'\u03C2','varsubsetneq':'\u228A\uFE00','varsubsetneqq':'\u2ACB\uFE00','varsupsetneq':'\u228B\uFE00','varsupsetneqq':'\u2ACC\uFE00','vartheta':'\u03D1','vartriangleleft':'\u22B2','vartriangleright':'\u22B3','vBar':'\u2AE8','Vbar':'\u2AEB','vBarv':'\u2AE9','Vcy':'\u0412','vcy':'\u0432','vdash':'\u22A2','vDash':'\u22A8','Vdash':'\u22A9','VDash':'\u22AB','Vdashl':'\u2AE6','veebar':'\u22BB','vee':'\u2228','Vee':'\u22C1','veeeq':'\u225A','vellip':'\u22EE','verbar':'|','Verbar':'\u2016','vert':'|','Vert':'\u2016','VerticalBar':'\u2223','VerticalLine':'|','VerticalSeparator':'\u2758','VerticalTilde':'\u2240','VeryThinSpace':'\u200A','Vfr':'\uD835\uDD19','vfr':'\uD835\uDD33','vltri':'\u22B2','vnsub':'\u2282\u20D2','vnsup':'\u2283\u20D2','Vopf':'\uD835\uDD4D','vopf':'\uD835\uDD67','vprop':'\u221D','vrtri':'\u22B3','Vscr':'\uD835\uDCB1','vscr':'\uD835\uDCCB','vsubnE':'\u2ACB\uFE00','vsubne':'\u228A\uFE00','vsupnE':'\u2ACC\uFE00','vsupne':'\u228B\uFE00','Vvdash':'\u22AA','vzigzag':'\u299A','Wcirc':'\u0174','wcirc':'\u0175','wedbar':'\u2A5F','wedge':'\u2227','Wedge':'\u22C0','wedgeq':'\u2259','weierp':'\u2118','Wfr':'\uD835\uDD1A','wfr':'\uD835\uDD34','Wopf':'\uD835\uDD4E','wopf':'\uD835\uDD68','wp':'\u2118','wr':'\u2240','wreath':'\u2240','Wscr':'\uD835\uDCB2','wscr':'\uD835\uDCCC','xcap':'\u22C2','xcirc':'\u25EF','xcup':'\u22C3','xdtri':'\u25BD','Xfr':'\uD835\uDD1B','xfr':'\uD835\uDD35','xharr':'\u27F7','xhArr':'\u27FA','Xi':'\u039E','xi':'\u03BE','xlarr':'\u27F5','xlArr':'\u27F8','xmap':'\u27FC','xnis':'\u22FB','xodot':'\u2A00','Xopf':'\uD835\uDD4F','xopf':'\uD835\uDD69','xoplus':'\u2A01','xotime':'\u2A02','xrarr':'\u27F6','xrArr':'\u27F9','Xscr':'\uD835\uDCB3','xscr':'\uD835\uDCCD','xsqcup':'\u2A06','xuplus':'\u2A04','xutri':'\u25B3','xvee':'\u22C1','xwedge':'\u22C0','Yacute':'\xDD','yacute':'\xFD','YAcy':'\u042F','yacy':'\u044F','Ycirc':'\u0176','ycirc':'\u0177','Ycy':'\u042B','ycy':'\u044B','yen':'\xA5','Yfr':'\uD835\uDD1C','yfr':'\uD835\uDD36','YIcy':'\u0407','yicy':'\u0457','Yopf':'\uD835\uDD50','yopf':'\uD835\uDD6A','Yscr':'\uD835\uDCB4','yscr':'\uD835\uDCCE','YUcy':'\u042E','yucy':'\u044E','yuml':'\xFF','Yuml':'\u0178','Zacute':'\u0179','zacute':'\u017A','Zcaron':'\u017D','zcaron':'\u017E','Zcy':'\u0417','zcy':'\u0437','Zdot':'\u017B','zdot':'\u017C','zeetrf':'\u2128','ZeroWidthSpace':'\u200B','Zeta':'\u0396','zeta':'\u03B6','zfr':'\uD835\uDD37','Zfr':'\u2128','ZHcy':'\u0416','zhcy':'\u0436','zigrarr':'\u21DD','zopf':'\uD835\uDD6B','Zopf':'\u2124','Zscr':'\uD835\uDCB5','zscr':'\uD835\uDCCF','zwj':'\u200D','zwnj':'\u200C'};
	var decodeMapLegacy = {'Aacute':'\xC1','aacute':'\xE1','Acirc':'\xC2','acirc':'\xE2','acute':'\xB4','AElig':'\xC6','aelig':'\xE6','Agrave':'\xC0','agrave':'\xE0','amp':'&','AMP':'&','Aring':'\xC5','aring':'\xE5','Atilde':'\xC3','atilde':'\xE3','Auml':'\xC4','auml':'\xE4','brvbar':'\xA6','Ccedil':'\xC7','ccedil':'\xE7','cedil':'\xB8','cent':'\xA2','copy':'\xA9','COPY':'\xA9','curren':'\xA4','deg':'\xB0','divide':'\xF7','Eacute':'\xC9','eacute':'\xE9','Ecirc':'\xCA','ecirc':'\xEA','Egrave':'\xC8','egrave':'\xE8','ETH':'\xD0','eth':'\xF0','Euml':'\xCB','euml':'\xEB','frac12':'\xBD','frac14':'\xBC','frac34':'\xBE','gt':'>','GT':'>','Iacute':'\xCD','iacute':'\xED','Icirc':'\xCE','icirc':'\xEE','iexcl':'\xA1','Igrave':'\xCC','igrave':'\xEC','iquest':'\xBF','Iuml':'\xCF','iuml':'\xEF','laquo':'\xAB','lt':'<','LT':'<','macr':'\xAF','micro':'\xB5','middot':'\xB7','nbsp':'\xA0','not':'\xAC','Ntilde':'\xD1','ntilde':'\xF1','Oacute':'\xD3','oacute':'\xF3','Ocirc':'\xD4','ocirc':'\xF4','Ograve':'\xD2','ograve':'\xF2','ordf':'\xAA','ordm':'\xBA','Oslash':'\xD8','oslash':'\xF8','Otilde':'\xD5','otilde':'\xF5','Ouml':'\xD6','ouml':'\xF6','para':'\xB6','plusmn':'\xB1','pound':'\xA3','quot':'"','QUOT':'"','raquo':'\xBB','reg':'\xAE','REG':'\xAE','sect':'\xA7','shy':'\xAD','sup1':'\xB9','sup2':'\xB2','sup3':'\xB3','szlig':'\xDF','THORN':'\xDE','thorn':'\xFE','times':'\xD7','Uacute':'\xDA','uacute':'\xFA','Ucirc':'\xDB','ucirc':'\xFB','Ugrave':'\xD9','ugrave':'\xF9','uml':'\xA8','Uuml':'\xDC','uuml':'\xFC','Yacute':'\xDD','yacute':'\xFD','yen':'\xA5','yuml':'\xFF'};
	var decodeMapNumeric = {'0':'\uFFFD','128':'\u20AC','130':'\u201A','131':'\u0192','132':'\u201E','133':'\u2026','134':'\u2020','135':'\u2021','136':'\u02C6','137':'\u2030','138':'\u0160','139':'\u2039','140':'\u0152','142':'\u017D','145':'\u2018','146':'\u2019','147':'\u201C','148':'\u201D','149':'\u2022','150':'\u2013','151':'\u2014','152':'\u02DC','153':'\u2122','154':'\u0161','155':'\u203A','156':'\u0153','158':'\u017E','159':'\u0178'};
	var invalidReferenceCodePoints = [1,2,3,4,5,6,7,8,11,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,64976,64977,64978,64979,64980,64981,64982,64983,64984,64985,64986,64987,64988,64989,64990,64991,64992,64993,64994,64995,64996,64997,64998,64999,65000,65001,65002,65003,65004,65005,65006,65007,65534,65535,131070,131071,196606,196607,262142,262143,327678,327679,393214,393215,458750,458751,524286,524287,589822,589823,655358,655359,720894,720895,786430,786431,851966,851967,917502,917503,983038,983039,1048574,1048575,1114110,1114111];

	/*--------------------------------------------------------------------------*/

	var stringFromCharCode = String.fromCharCode;

	var object = {};
	var hasOwnProperty = object.hasOwnProperty;
	var has = function(object, propertyName) {
		return hasOwnProperty.call(object, propertyName);
	};

	var contains = function(array, value) {
		var index = -1;
		var length = array.length;
		while (++index < length) {
			if (array[index] == value) {
				return true;
			}
		}
		return false;
	};

	var merge = function(options, defaults) {
		if (!options) {
			return defaults;
		}
		var result = {};
		var key;
		for (key in defaults) {
			// A `hasOwnProperty` check is not needed here, since only recognized
			// option names are used anyway. Any others are ignored.
			result[key] = has(options, key) ? options[key] : defaults[key];
		}
		return result;
	};

	// Modified version of `ucs2encode`; see http://mths.be/punycode.
	var codePointToSymbol = function(codePoint, strict) {
		var output = '';
		if ((codePoint >= 0xD800 && codePoint <= 0xDFFF) || codePoint > 0x10FFFF) {
			// See issue #4:
			// “Otherwise, if the number is in the range 0xD800 to 0xDFFF or is
			// greater than 0x10FFFF, then this is a parse error. Return a U+FFFD
			// REPLACEMENT CHARACTER.”
			if (strict) {
				parseError('character reference outside the permissible Unicode range');
			}
			return '\uFFFD';
		}
		if (has(decodeMapNumeric, codePoint)) {
			if (strict) {
				parseError('disallowed character reference');
			}
			return decodeMapNumeric[codePoint];
		}
		if (strict && contains(invalidReferenceCodePoints, codePoint)) {
			parseError('disallowed character reference');
		}
		if (codePoint > 0xFFFF) {
			codePoint -= 0x10000;
			output += stringFromCharCode(codePoint >>> 10 & 0x3FF | 0xD800);
			codePoint = 0xDC00 | codePoint & 0x3FF;
		}
		output += stringFromCharCode(codePoint);
		return output;
	};

	var hexEscape = function(symbol) {
		return '&#x' + symbol.charCodeAt(0).toString(16).toUpperCase() + ';';
	};

	var parseError = function(message) {
		throw Error('Parse error: ' + message);
	};

	/*--------------------------------------------------------------------------*/

	var encode = function(string, options) {
		options = merge(options, encode.options);
		var strict = options.strict;
		if (strict && regexInvalidRawCodePoint.test(string)) {
			parseError('forbidden code point');
		}
		var encodeEverything = options.encodeEverything;
		var useNamedReferences = options.useNamedReferences;
		if (encodeEverything) {
			// Encode ASCII symbols.
			string = string.replace(regexAsciiWhitelist, function(symbol) {
				// Use named references if requested & possible.
				if (useNamedReferences && has(encodeMap, symbol)) {
					return '&' + encodeMap[symbol] + ';';
				}
				return hexEscape(symbol);
			});
			// Shorten a few escapes that represent two symbols, of which at least one
			// is within the ASCII range.
			if (useNamedReferences) {
				string = string
					.replace(/&gt;\u20D2/g, '&nvgt;')
					.replace(/&lt;\u20D2/g, '&nvlt;')
					.replace(/&#x66;&#x6A;/g, '&fjlig;');
			}
			// Encode non-ASCII symbols.
			if (useNamedReferences) {
				// Encode non-ASCII symbols that can be replaced with a named reference.
				string = string.replace(regexEncodeNonAscii, function(string) {
					// Note: there is no need to check `has(encodeMap, string)` here.
					return '&' + encodeMap[string] + ';';
				});
			}
			// Note: any remaining non-ASCII symbols are handled outside of the `if`.
		} else if (useNamedReferences) {
			// Apply named character references.
			// Encode `<>"'&` using named character references.
			string = string.replace(regexEscape, function(string) {
				return '&' + encodeMap[string] + ';'; // no need to check `has()` here
			});
			// Shorten escapes that represent two symbols, of which at least one is
			// `<>"'&`.
			string = string
				.replace(/&gt;\u20D2/g, '&nvgt;')
				.replace(/&lt;\u20D2/g, '&nvlt;');
			// Encode non-ASCII symbols that can be replaced with a named reference.
			string = string.replace(regexEncodeNonAscii, function(string) {
				// Note: there is no need to check `has(encodeMap, string)` here.
				return '&' + encodeMap[string] + ';';
			});
		} else {
			// Encode `<>"'&` using hexadecimal escapes, now that they’re not handled
			// using named character references.
			string = string.replace(regexEscape, hexEscape);
		}
		return string
			// Encode astral symbols.
			.replace(regexAstralSymbols, function($0) {
				// http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
				var high = $0.charCodeAt(0);
				var low = $0.charCodeAt(1);
				var codePoint = (high - 0xD800) * 0x400 + low - 0xDC00 + 0x10000;
				return '&#x' + codePoint.toString(16).toUpperCase() + ';';
			})
			// Encode any remaining BMP symbols that are not printable ASCII symbols
			// using a hexadecimal escape.
			.replace(regexBmpWhitelist, hexEscape);
	};
	// Expose default options (so they can be overridden globally).
	encode.options = {
		'encodeEverything': false,
		'strict': false,
		'useNamedReferences': false
	};

	var decode = function(html, options) {
		options = merge(options, decode.options);
		var strict = options.strict;
		if (strict && regexInvalidEntity.test(html)) {
			parseError('malformed character reference');
		}
		return html.replace(regexDecode, function($0, $1, $2, $3, $4, $5, $6, $7) {
			var codePoint;
			var semicolon;
			var hexDigits;
			var reference;
			var next;
			if ($1) {
				// Decode decimal escapes, e.g. `&#119558;`.
				codePoint = $1;
				semicolon = $2;
				if (strict && !semicolon) {
					parseError('character reference was not terminated by a semicolon');
				}
				return codePointToSymbol(codePoint, strict);
			}
			if ($3) {
				// Decode hexadecimal escapes, e.g. `&#x1D306;`.
				hexDigits = $3;
				semicolon = $4;
				if (strict && !semicolon) {
					parseError('character reference was not terminated by a semicolon');
				}
				codePoint = parseInt(hexDigits, 16);
				return codePointToSymbol(codePoint, strict);
			}
			if ($5) {
				// Decode named character references with trailing `;`, e.g. `&copy;`.
				reference = $5;
				if (has(decodeMap, reference)) {
					return decodeMap[reference];
				} else {
					// Ambiguous ampersand; see http://mths.be/notes/ambiguous-ampersands.
					if (strict) {
						parseError(
							'named character reference was not terminated by a semicolon'
						);
					}
					return $0;
				}
			}
			// If we’re still here, it’s a legacy reference for sure. No need for an
			// extra `if` check.
			// Decode named character references without trailing `;`, e.g. `&amp`
			// This is only a parse error if it gets converted to `&`, or if it is
			// followed by `=` in an attribute context.
			reference = $6;
			next = $7;
			if (next && options.isAttributeValue) {
				if (strict && next == '=') {
					parseError('`&` did not start a character reference');
				}
				return $0;
			} else {
				if (strict) {
					parseError(
						'named character reference was not terminated by a semicolon'
					);
				}
				// Note: there is no need to check `has(decodeMapLegacy, reference)`.
				return decodeMapLegacy[reference] + (next || '');
			}
		});
	};
	// Expose default options (so they can be overridden globally).
	decode.options = {
		'isAttributeValue': false,
		'strict': false
	};

	var escape = function(string) {
		return string.replace(regexEscape, function($0) {
			// Note: there is no need to check `has(escapeMap, $0)` here.
			return escapeMap[$0];
		});
	};

	/*--------------------------------------------------------------------------*/

	var he = {
		'version': '0.4.1',
		'encode': encode,
		'decode': decode,
		'escape': escape,
		'unescape': decode
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return he;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = he;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (var key in he) {
				has(he, key) && (freeExports[key] = he[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.he = he;
	}

}(this));

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],36:[function(require,module,exports){
module.exports=require(11)
},{}],37:[function(require,module,exports){
var EventEmitter = require("fast-event-emitter");

module.exports = function (app) {

  app.use(require("mojo-mediator"));

  var readyEmitter = new EventEmitter(),
  ready = false;

  readyEmitter.once("ready", function () {
    ready = true;
  });

  app.setProperties({
    bootstrap: function (options, complete) {

      if (typeof options === "function") {
        complete = options;
        options = {};
      }

      if (!complete) complete = function () {};
      
      app.ready(complete);
      app.initialize(options);
    },
    ready: function (callback) {
      if (ready) return callback();
      readyEmitter.once("ready", callback);
    }
  });

  app.once("initialize", function (options) {
    app.mediator.execute("bootstrap", options, function () {
      if (app.didBootstrap) {
        app.didBootstrap(options);
      }
      readyEmitter.emit("ready");
    });
  });

}
},{"fast-event-emitter":49,"mojo-mediator":51}],38:[function(require,module,exports){
"use strict";

var BindableObject = require("../object"),
computed           = require("../utils/computed"),
_                  = require("underscore");

/** 
 * @module mojo
 * @submodule mojo-core
 */

/**
 * @class BindableCollection
 * @extends BindableObject
 */

/**
 * Emitted when an item is inserted
 * @event insert
 * @param {Object} item inserted
 */


/**
 * Emitted when an item is removed
 * @event remove
 * @param {Object} item removed
 */

/**
 * Emitted when items are replaced
 * @event replace
 * @param {Array} newItems
 * @param {Array} oldItems
 */



function BindableCollection (source) {
  BindableObject.call(this, this);
  this.source = source || [];
  this._updateInfo();
  this.bind("source", _.bind(this._onSourceChange, this));
}

/**
 */

BindableObject.extend(BindableCollection, {

  /**
   */

  __isBindableCollection: true,

  /**
   */

  _onSourceChange: function (source) {
    if (!source) this.source = [];
    this._updateInfo();
    // this.emit("update", { insert: source, remove: this._currentSource })
    this.emit("reset", this._currentSource = source);
  },
  
  /**
   * Resets the collection. Same as `source(value)`.
   */

  reset: function (source) {
    return this.set("source", source);
  },

  /**
   * Returns the index of a value
   * @method indexOf
   * @param {Object} object to get index of
   * @returns {Number} index or -1 (not found)
   */

  indexOf: function (item) {
    return this.source.indexOf(item);
  },

  /**
   * filters the collection
   * @method filter
   * @returns {Array} array of filtered items
   */

  filter: function (fn) {
    return this.source.filter(fn);
  },

  /**
   * Returns an object at the given index
   * @method at
   * @returns {Object} Object at specific index
   */

  at: function (index) {
    return this.source[index];
  },

  /**
   * forEach item
   * @method each
   * @param {Function} fn function to call for each item
   */

  each: computed(["length"], function (fn) {
    this.source.forEach(fn);
  }),

  /**
   */

  map: function (fn) {
    return this.source.map(fn);
  },

  /**
   */

  join: function (sep) {
    return this.source.join(sep);
  },

  /**
   */

  slice: function () {
    return this.source.slice.apply(this.source, arguments);
  },

  /**
   * Pushes an item onto the collection
   * @method push
   * @param {Object} item
   */

  push: function () {
    var items = Array.prototype.slice.call(arguments);
    this.source.push.apply(this.source, items);
    this._updateInfo();

    // DEPRECATED
    this.emit("insert", items[0], this.length - 1);
    this.emit("update", { insert: items, index: this.length - 1});
  },

  /**
   * Unshifts an item onto the collection
   * @method unshift
   * @param {Object} item
   */

  unshift: function () {

    var items = Array.prototype.slice.call(arguments);
    this.source.unshift.apply(this.source, items);
    this._updateInfo();

    // DEPRECATED
    this.emit("insert", items[0], 0);
    this.emit("update", { insert: items });
  },

  /**
   * Removes N Number of items
   * @method splice
   * @param {Number} index start index
   * @param {Number} count number of items to remove
   */

  splice: function (index, count) {
    var newItems = Array.prototype.slice.call(arguments, 2),
    oldItems     = this.source.splice.apply(this.source, arguments);

    this._updateInfo();

    // DEPRECATED
    this.emit("replace", newItems, oldItems, index);
    this.emit("update", { insert: newItems, remove: oldItems });
  },

  /**
   * Removes an item from the collection
   * @method remove
   * @param {Object} item item to remove
   */

  remove: function (item) {
    var i = this.indexOf(item);
    if (!~i) return false;
    this.source.splice(i, 1);
    this._updateInfo();

    this.emit("remove", item, i);
    this.emit("update", { remove: [item] });
    return item;
  },

  /**
   * Removes an item from the end
   * @method pop
   * @returns {Object} removed item
   */

  pop: function () {
    if (!this.source.length) return;
    return this.remove(this.source[this.source.length - 1]);
  },

  /**
   * Removes an item from the beginning
   * @method shift
   * @returns {Object} removed item
   */

  shift: function () {
    if (!this.source.length) return;
    return this.remove(this.source[0]);
  },

  /*
   */

  toJSON: function () {
    return this.source.map(function (item) {
      return item && item.toJSON ? item.toJSON() : item;
    });
  },

  /*
   */

  _updateInfo: function () {
    this.setProperties({
      first  : this.source.length ? this.source[0] : void 0,
      length : this.source.length,
      empty  : !this.source.length,
      last   : this.source.length ? this.source[this.source.length - 1] : void 0
    });
  }
});

module.exports = BindableCollection;

},{"../object":41,"../utils/computed":44,"underscore":48}],39:[function(require,module,exports){
"use strict";
var protoclass = require("protoclass");

/**
 * @module mojo
 * @submodule mojo-core
 */

/**
 * @class EventEmitter
 */

function EventEmitter () {
  this.__events = {};
}

EventEmitter.prototype.setMaxListeners = function () {

};

/**
 * adds a listener on the event emitter
 *
 * @method on
 * @param {String} event event to listen on
 * @param {Function} listener to callback when `event` is emitted.
 * @returns {Disposable}
 */


EventEmitter.prototype.on = function (event, listener) {

  if (typeof listener !== "function") {
    throw new Error("listener must be a function for event '"+event+"'");
  }

  var listeners;
  if (!(listeners = this.__events[event])) {
    this.__events[event] = listener;
  } else if (typeof listeners === "function") {
    this.__events[event] = [listeners, listener];
  } else {
    listeners.push(listener);
  }

  var self = this;

  return {
    dispose: function() {
      self.off(event, listener);
    }
  };
};

/**
 * removes an event emitter
 * @method off
 * @param {String} event to remove
 * @param {Function} listener to remove
 */

EventEmitter.prototype.off = function (event, listener) {

  var listeners;

  if(!(listeners = this.__events[event])) {
    return;
  }

  if (typeof listeners === "function") {
    this.__events[event] = undefined;
  } else {
    var i = listeners.indexOf(listener);
    if (~i) listeners.splice(i, 1);
    if (!listeners.length) {
      this.__events[event] = undefined;
    }
  }
};

/**
 * adds a listener on the event emitter
 * @method once
 * @param {String} event event to listen on
 * @param {Function} listener to callback when `event` is emitted.
 * @returns {Disposable}
 */


EventEmitter.prototype.once = function (event, listener) {

  if (typeof listener !== "function") {
    throw new Error("listener must be a function for event '"+event+"'");
  }

  function listener2 () {
    disp.dispose();
    listener.apply(this, arguments);
  }

  var disp = this.on(event, listener2);
  disp.target = this;
  return disp;
};

/**
 * emits an event
 * @method emit
 * @param {String} event
 * @param {String}, `data...` data to emit
 */


EventEmitter.prototype.emit = function (event) {

  if (this.__events[event] === undefined) return;

  var listeners = this.__events[event],
  n,
  args,
  i,
  j;


  if (typeof listeners === "function") {
    if (arguments.length === 1) {
      listeners();
    } else {
    switch(arguments.length) {
      case 2:
        listeners(arguments[1]);
        break;
      case 3:
        listeners(arguments[1], arguments[2]);
        break;
      case 4:
        listeners(arguments[1], arguments[2], arguments[3]);
        break;
      default:
        n = arguments.length;
        args = new Array(n - 1);
        for(i = 1; i < n; i++) args[i-1] = arguments[i];
        listeners.apply(this, args);
    }
  }
  } else {
    n = arguments.length;
    args = new Array(n - 1);
    for(i = 1; i < n; i++) args[i-1] = arguments[i];
    for(j = listeners.length; j--;) {
      if(listeners[j]) listeners[j].apply(this, args);
    }
  }
};

/**
 * removes all listeners
 * @method removeAllListeners
 * @param {String} event (optional) removes all listeners of `event`. Omitting will remove everything.
 */

EventEmitter.prototype.removeAllListeners = function (event) {
  if (arguments.length === 1) {
    this.__events[event] = undefined;
  } else {
    this.__events = {};
  }
};

module.exports = EventEmitter;

},{"protoclass":46}],40:[function(require,module,exports){
"use strict";

module.exports = {
  Object       : require("./object"),
  Collection   : require("./collection"),
  EventEmitter : require("./core/eventEmitter"),
  computed     : require("./utils/computed"),
  options      : require("./utils/options")
};

if (typeof window !== "undefined") {
  window.bindable = module.exports;
}
},{"./collection":38,"./core/eventEmitter":39,"./object":41,"./utils/computed":44,"./utils/options":45}],41:[function(require,module,exports){
"use strict";

var EventEmitter    = require("../core/eventEmitter"),
protoclass          = require("protoclass"),
watchProperty       = require("./watchProperty");

/**
 * @module mojo
 * @submodule mojo-core
 */

/**

BindableObjects make it easy to link properties of two separate objects - when one changes,
the other will automatically update with that change. It enables much easier interactions between data models and UIs,
among other uses outside of MVC.

<br>
<br>

BindableObjects provide a way to maintain the state between server <-> client for a realtime front-end
application (similar to Firebase), or perhaps a way to communicate between server <-> server for a realtime distributed Node.js
application.


### Example

```javascript
var bindable = require("bindable");

var person = new bindable.Object({
  name: "craig",
  last: "condon",
  location: {
    city: "San Francisco"
  }
});

person.bind("location.zip", function(value) {
  // 94102
}).now();

//triggers the binding
person.set("location.zip", "94102");

//bind location.zip to another property in the model, and do it only once
person.bind("location.zip", { to: "zip", max: 1 }).now();

//bind location.zip to another object, and make it bi-directional.
person.bind("location.zip", { target: anotherModel, to: "location.zip", bothWays: true }).now();

//chain to multiple items, and limit it!
person.bind("location.zip", { to: ["property", "anotherProperty"], max: 1 }).now();


//you can also transform data as it's being bound
person.bind("name", {
  to: "name2",
  map: function (name) {
    return name.toUpperCase();
  }
}).now();
```

@class BindableObject
@extends EventEmitter
*/

/**
 * Emitted when the bindable object is disposed. This happens
 * when the object is no-longer needed.
 * @event dispose
 */


/**
 * Emitted everytime a property changes
 * @event change
 * @param {String} property
 * @param {Object} value
 * @param {Object} oldValue
 */

/**
 * Emitted when a specific property changes
 * @event change:*
 * @param {Object} value
 * @param {Object} oldValue
 */



/**
 * @constructor
 * @param {Object} context context of the bindable object
 */


/**
 * emitted when a property is being watched
 * @event watching
 */


function Bindable (properties) {

  if (properties)
  for (var key in properties) {
    this[key] = properties[key];
  }

  Bindable.parent.call(this);
}

watchProperty.BindableObject = Bindable;

protoclass(EventEmitter, Bindable, {

  /**
   */

  __isBindable: true,

  /**
   * Returns TRUE if a property exists in the context
   * @method has
   * @param {String} path
   * @returns {Boolean}
   */

  has: function (key) {
    return this.get(key) != null;
  },

  /**
   * Returns a property stored in the bindable object context
   * @method get
   * @param {String} path path to the value. Can be something like `person.city.name`.
   */

  get: function (property) {

    var isString;

    // optimal
    if ((isString = (typeof property === "string")) && !~property.indexOf(".")) {
      return this[property];
    }

    // avoid split if possible
    var chain    = isString ? property.split(".") : property,
    currentValue = this,
    currentProperty;

    // go through all the properties
    for (var i = 0, n = chain.length - 1; i < n; i++) {

      currentValue    = currentValue[chain[i]];

      if (!currentValue) return;
    }

    // might be a bindable object
    if(currentValue) return currentValue[chain[i]];
  },

  /**
   * Properties to set on the bindable object
   * @method setProperties
   * @param {Object} properties properties to set
   * @returns {BindableObject} this
   */

  setProperties: function (properties) {
    for (var property in properties) {
      this.set(property, properties[property]);
    }
    return this;
  },

  /**
   * Sets a property on the bindable object's context
   * @method set
   * @param {String} path path to the value. Can be something like `person.city.name`.
   */

  set: function (property, value) {

    var isString, hasChanged, oldValue, chain;

    // optimal
    if ((isString = (typeof property === "string")) && !~property.indexOf(".")) {
      hasChanged = (oldValue = this[property]) !== value;
      if (hasChanged) this[property] = value;
    } else {

      // avoid split if possible
      chain     = isString ? property.split(".") : property;

      var currentValue  = this,
      previousValue,
      currentProperty,
      newChain;


      for (var i = 0, n = chain.length - 1; i < n; i++) {

        currentProperty = chain[i];
        previousValue   = currentValue;
        currentValue    = currentValue[currentProperty];


        // need to take into account functions - easier not to check
        // if value exists
        if (!currentValue /* || (typeof currentValue !== "object")*/) {
          currentValue = previousValue[currentProperty] = {};
        }

        // is the previous value bindable? pass it on
        if (currentValue.__isBindable) {

          newChain = chain.slice(i + 1);
          // check if the value has changed
          hasChanged = (oldValue = currentValue.get(newChain)) !== value;
          currentValue.set(newChain, value);
          currentValue = oldValue;
          break;
        }
      }


      if (!newChain && (hasChanged = (currentValue !== value))) {
        currentProperty = chain[i];
        oldValue = currentValue[currentProperty];
        currentValue[currentProperty] = value;
      }
    }

    if (!hasChanged) return value;

    var prop = chain ? chain.join(".") : property;

    this.emit("change:" + prop, value, oldValue);
    this.emit("change", prop, value, oldValue);
    return value;
  },

  /**
   * Binds a property to a function
   * @method bind
   * @param {String} property path to bind to.
   * @param {Object} listener `function` or `transformer` to bind to
   * @param {Boolean} now (optional) call binding now. Otherwise wait till property changes.
   * @returns {Binding}
   */

  bind: function (property, fn, now) {
    return watchProperty(this, property, fn, now);
  },

  /**
   * Disposes the bindable object. Emits `dispose`.
   * @method dispose
   */

  dispose: function () {
    this.emit("dispose");
  },

  /**
   * Converts the context to a JSON object
   * @method toJSON
   */

  toJSON: function () {
    var obj = {}, value;

    var keys = Object.keys(this);

    for (var i = 0, n = keys.length; i < n; i++) {
      var key = keys[i];
      if (key.substr(0, 2) === "__") continue;
      value = this[key];

      if(value && value.__isBindable) {
        value = value.toJSON();
      }

      obj[key] = value;
    }

    return obj;
  }
});

module.exports = Bindable;

},{"../core/eventEmitter":39,"./watchProperty":43,"protoclass":46}],42:[function(require,module,exports){
"use strict";

var toarray = require("toarray"),
_           = require("underscore");

/** 
 * @module mojo
 * @submodule mojo-core
 */

/**
 * created when the second parameter on `bind(property, listener)` is an object.
 *
 * @class BindingTransformer
 * @protected
 */


function getToPropertyFn (target, property) {
  return function (value) {
    target.set(property, value);
  };
}


function hasChanged (oldValues, newValues) {

  if (oldValues.length !== newValues.length) return true;

  for (var i = newValues.length; i--;) {
    if (newValues[i] !== oldValues[i]) return true;
  }
  return false;
}

function wrapFn (fn, previousValues, max) {

  var numCalls = 0;

  return function () {

    var values = Array.prototype.slice.call(arguments, 0),
    newValues  = (values.length % 2) === 0 ? values.slice(0, values.length / 2) : values;


    if (!hasChanged(newValues, previousValues)) return;


    if (~max && ++numCalls >= max) {
      this.dispose();
    }

    previousValues = newValues;


    fn.apply(this, values);
  };
}

function transform (bindable, fromProperty, options) {

  var when        = options.when         || function() { return true; },
  map             = options.map          || function () { return Array.prototype.slice.call(arguments, 0); },
  target          = options.target       || bindable,
  max             = options.max          || (options.once ? 1 : void 0) || -1,
  tos             = toarray(options.to).concat(),
  previousValues  = toarray(options.defaultValue),
  toProperties    = [],
  bothWays        = options.bothWays,
  i;

  
  if (!when.test && typeof when === "function") {
    when = { test: when };
  }

  if (!previousValues.length) {
    previousValues.push(void 0);
  }

  if (!tos.length) {
    throw new Error("missing 'to' option");
  }

  for (i = tos.length; i--;) {

    var to = tos[i],
    tot    = typeof to;

    /*
     need to convert { property: { map: fn}} to another transformed value, which is
     { map: fn, to: property }
     */

    if (tot === "object") {

      // "to" might have multiple properties we're binding to, so 
      // add them to the END of the array of "to" items
      for (var property in to) {

        // assign the property to the 'to' parameter
        to[property].to = property;
        tos.push(transform(target, fromProperty, to[property]));
      }

      // remove the item, since we just added new items to the end
      tos.splice(i, 1);

    // might be a property we're binding to
    } else if(tot === "string") {
      toProperties.push(to);
      tos[i] = wrapFn(getToPropertyFn(target, to), previousValues, max);
    } else if (tot === "function") {
      tos[i] = wrapFn(to, previousValues, max);
    } else {
      throw new Error("'to' must be a function");
    }
  }

  // two-way data-binding
  if (bothWays) {
    for (i = toProperties.length; i--;) {
      target.bind(toProperties[i], { to: fromProperty });
    }
  }

  // newValue, newValue2, oldValue, oldValue2
  return function () {

    var values = toarray(map.apply(this, arguments));

    // first make sure that we don't trigger the old value
    if (!when.test.apply(when, values)) return;

    for (var i = tos.length; i--;) {
      tos[i].apply(this, values);
    }
  };
}

module.exports = transform;
},{"toarray":47,"underscore":48}],43:[function(require,module,exports){
(function (process){
"use strict";

var _     = require("underscore"),
transform = require("./transform"),
options   = require("../utils/options");

/** 
 * @module mojo
 * @submodule mojo-core
 */

/**
 * @class Binding
 */

/*
 * bindable.bind("a", fn);
 */

function watchSimple (bindable, property, fn) {

  bindable.emit("watching", [property]);

  var listener = bindable.on("change:" + property, function () {
    fn.apply(self, arguments);
  }), self;

  self = {

    /** 
     * the target bindable object
     * @property target
     * @type {BindableObject}
     */

    target: bindable,

    /**
     * triggers the binding listener
     * @method now
     */

    now: function () {
      fn.call(self, bindable.get(property));
      return self;
    },

    /**
     * disposes the binding
     * @method dispose
     */

    dispose: function () {
      listener.dispose();
    },

    /**
     */

    pause: function () {
      self.dispose();
      self.now = function () { return this; };
    },

    /**
     */

    resume: function () {
      self.pause();
      _.extend(self, watchSimple(bindable, property, fn));
      return self;
    }
  };

  return self;
}

/*
 * bindable.bind("a.b.c.d.e", fn);
 */


function watchChain (bindable, hasComputed, chain, fn) {

  var listeners = [], values = hasComputed ? [] : undefined, self;

  var onChange = function () {
    dispose();
    listeners = [];
    values = hasComputed ? [] : void 0;
    bind(bindable, chain);
    self.now();
  };


  if (hasComputed && process.browser) {
    onChange = _.debounce(onChange, 1);
  }

  function runComputed (eachChain, pushValues) {
    return function (item) {
      if (!item) return;

        // wrap around bindable object as a helper
        if (!item.__isBindable) {
          item = new module.exports.BindableObject(item);
        }

        bind(item, eachChain, pushValues);
    };
  }

  function bind (target, chain, pushValues) {

    var currentChain = [], subValue, currentProperty, i, j, n, computed, hadComputed, pv, cv = target;

    // need to run through all variations of the property chain incase it changes
    // in the bindable.object. For instance:
    // target.bind("a.b.c", fn); 
    // triggers on
    // target.set("a", obj);
    // target.set("a.b", obj);
    // target.set("a.b.c", obj);

    // does it have @each in there? could be something like
    // target.bind("friends.@each.name", function (names) { })
    if (hasComputed) {

      i = 0;
      n = chain.length;

      for (; i < n; i++) {

        currentChain.push(chain[i]);
        currentProperty = chain[i];

        target.emit("watching", currentChain);

        // check for @ at the beginning
        computed = (currentProperty.charCodeAt(0) === 64);

        if (computed) {
          hadComputed = true;
          // remove @ - can't be used to fetch the propertyy
          currentChain[i] = currentProperty = currentChain[i].substr(1);
        }
        
        pv = cv;
        if (cv) cv = cv[currentProperty];

        if (computed && cv) {


          // used in cases where the collection might change that would affect 
          // this binding. length for instance on the collection...
          if (cv.compute) {
            for (j = cv.compute.length; j--;) {
              bind(target, [cv.compute[j]], false);
            }
          }

          // the sub chain for each of the items from the loop
          var eachChain = chain.slice(i + 1);

          // call the function, looping through items
          cv.call(pv, runComputed(eachChain, pushValues));
          break;
        } else if (cv && cv.__isBindable && i !== n - 1) {
          bind(cv, chain.slice(i + 1), false);
          cv = cv.__context;
        }

        listeners.push(target.on("change:" +  currentChain.join("."), onChange));

      } 

      if (!hadComputed && pushValues !== false) {
        values.push(cv);
      }

    } else {
      i = 0;
      n = chain.length;

      for (; i < n; i++) {
        currentProperty = chain[i];
        currentChain.push(currentProperty);

        target.emit("watching", currentChain);

        if (cv) cv = cv[currentProperty];

        // pass the watch onto the bindable object, but also listen 
        // on the current target for any
        if (cv && cv.__isBindable && i !== n - 1) {
          bind(cv, chain.slice(i + 1), false);
        }

        listeners.push(target.on("change:" + currentChain.join("."), onChange));
      }

      if (pushValues !== false) values = cv;
    }
  }

  function dispose () {
    if (!listeners) return;
    for (var i = listeners.length; i--;) {
      listeners[i].dispose();
    }
    listeners = [];
  }

  self = {
    target: bindable,
    now: function () {
      fn.call(self, values);
      return self;
    },
    dispose: dispose,
    pause: function () {
      self.dispose();
      self.now = function () { return this; };
    },
    resume: function () {
      self.pause();
      _.extend(self, watchChain(bindable, hasComputed, chain, fn));
      return self;
    }
  };

  bind(bindable, chain);

  return self;
}

/**
 */

function watchMultiple (bindable, chains, fn) { 

  var values = new Array(chains.length),
  oldValues  = new Array(chains.length),
  bindings   = new Array(chains.length),
  fn2        = options.computedDelay === -1 ? fn : _.debounce(fn, options.computedDelay),
  self;


  chains.forEach(function (chain, i) {

    function onChange (value, oldValue) {
      values[i]    = value;
      oldValues[i] = oldValue;
      fn2.apply(this, values.concat(oldValues));
    }

    bindings[i] = bindable.bind(chain, onChange);
  });

  self = {
    target: bindable,
    now: function () {
      for (var i = bindings.length; i--;) {
        bindings[i].now();
      }
      return self;
    },
    dispose: function () {
      for (var i = bindings.length; i--;) {
        bindings[i].dispose();
      }
      bindings = [];
    },
    pause: function () {
      self.dispose();
      self.now = function () { return self; };
    },
    resume: function () {
      self.pause();
      _.extend(self, watchMultiple(bindable, chains, fn));
      return self;
    }
  };
  return self;
}

/**
 */

function watchProperty (bindable, property, fn) {

  if (typeof fn === "object") {
    fn = transform(bindable, property, fn);
  }

  // TODO - check if is an array
  var chain;

  if (typeof property === "string") {
    if (~property.indexOf(",")) {
      return watchMultiple(bindable, property.split(/[,\s]+/), fn);
    } else if (~property.indexOf(".")) {
      chain = property.split(".");
    } else {
      chain = [property];
    }
  } else {
    chain = property;
  }

  // collection.bind("length")
  if (chain.length === 1) {
    return watchSimple(bindable, property, fn);

  // person.bind("city.zip")
  } else {
    return watchChain(bindable, ~property.indexOf("@"), chain, fn);
  }
}

module.exports = watchProperty;
}).call(this,require("OpdoqP"))
},{"../utils/options":45,"./transform":42,"OpdoqP":65,"underscore":48}],44:[function(require,module,exports){
"use strict";

var toarray = require("toarray");

module.exports = function (properties, fn) {
  properties = toarray(properties);
  fn.compute = properties;
  return fn;
};
},{"toarray":47}],45:[function(require,module,exports){
"use strict";

module.exports = {
  computedDelay : 0
};

},{}],46:[function(require,module,exports){
function _copy (to, from) {

  for (var i = 0, n = from.length; i < n; i++) {

    var target = from[i];

    for (var property in target) {
      to[property] = target[property];
    }
  }

  return to;
}

function protoclass (parent, child) {

  var mixins = Array.prototype.slice.call(arguments, 2);

  if (typeof child !== "function") {
    if(child) mixins.unshift(child); // constructor is a mixin
    child   = parent;
    parent  = function() { };
  }

  _copy(child, parent); 

  function ctor () {
    this.constructor = child;
  }

  ctor.prototype  = parent.prototype;
  child.prototype = new ctor();
  child.__super__ = parent.prototype;
  child.parent = child.superclass = parent;

  _copy(child.prototype, mixins);

  protoclass.setup(child);

  return child;
}

protoclass.setup = function (child) {


  if (!child.extend) {
    child.extend = function(constructor) {

      var args = Array.prototype.slice.call(arguments, 0);

      if (typeof constructor !== "function") {
        args.unshift(constructor = function () {
          constructor.parent.apply(this, arguments);
        });
      }

      return protoclass.apply(this, [this].concat(args));
    }
    child.mixin = function(proto) {
      _copy(this.prototype, arguments);
    }
  }

  return child;
}


module.exports = protoclass;
},{}],47:[function(require,module,exports){
module.exports=require(12)
},{}],48:[function(require,module,exports){
//     Underscore.js 1.4.4
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      concat           = ArrayProto.concat,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.4.4';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? null : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value || _.identity);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(concat.apply(ArrayProto, arguments));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    var args = slice.call(arguments, 2);
    return function() {
      return func.apply(context, args.concat(slice.call(arguments)));
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, result;
    var previous = 0;
    var later = function() {
      previous = new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] == null) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                               _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
        return false;
      }
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(n);
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

},{}],49:[function(require,module,exports){
module.exports=require(10)
},{"protoclass":50}],50:[function(require,module,exports){
module.exports=require(11)
},{}],51:[function(require,module,exports){
var mediocre = require("mediocre");

module.exports = function (app) {
  if (app.mediator) return;
  var mediator = app.mediator = mediocre()
  mediator.application = app
}
},{"mediocre":57}],52:[function(require,module,exports){
var type = require("type-component"),
async    = require("async");

module.exports = {

  /**
   */

  test: function (options) {
    return type(options.listener) === "array";
  },

  /**
   */

  create: function (options) {

    if (options.listener.length === 1) {
      return options.listener[0];
    }

    return function (message, next) {
      async.eachSeries(options.listener, function (listener, next) {
        listener.call(this, message, next);
      }, next);
    }
  }
};
},{"async":59,"type-component":62}],53:[function(require,module,exports){
var type = require("type-component");

module.exports = {

  /**
   */

  test: function (options) {
    return type(options.listener) === "function";
  },

  /**
   */

  create: function (options) {
    var fn = options.listener;

    return function (message, next) {
      fn(message, function(err) {
        if(err) return next(err);
        var args = Array.prototype.slice.call(arguments, 1);
        if(args.length) {
          message.root.args = args;
        }
        next()
      });
    }
  }
};
},{"type-component":62}],54:[function(require,module,exports){
var collection,
factories = [
  require("./obj"),
  require("./fn"),
  require("./ref"),
  collection = require("./collection")
];

module.exports = {

  /**
   */

  push: function (factory) {
    factories.push(factory);
  },

  /**
   */

  create: function (mediator, listeners) {
    var tlisteners = [], listener, options, tester;

    for(var i = 0; i < listeners.length; i++) {
      listener = listeners[i];

      options = { mediator: mediator, listener: listener };

      for(var j = 0; j < factories.length; j++) {
        tester = factories[j];
        if (tester.test(options)) {
          tlisteners = tlisteners.concat(tester.create(options));
        }
      }
    }

    return collection.create({ mediator: mediator, listener: tlisteners });
  }
};
},{"./collection":52,"./fn":53,"./obj":55,"./ref":56}],55:[function(require,module,exports){
var type = require("type-component"),
async    = require("async");

module.exports = {

  /**
   */

  test: function (options) {
    return type(options.listener) === "object";
  },

  /**
   */

  create: function (options) {

    var refs = Object.keys(options.listener),
    mediator = options.mediator;


    return function (message, next) {
      async.eachSeries(refs, function (ref, next) {
        mediator.execute(message.child(ref, options.listener[ref]), next);
      }, next);
    }
  }
}
},{"async":59,"type-component":62}],56:[function(require,module,exports){
var type = require("type-component");

module.exports = {

  /**
   */

  test: function (options) {
    return type(options) === "string";
  },

  /**
   */

  create: function (options) {

    var mediator = options.mediator,
    ref          = options.listener;

    return function (message, next) {
      mediator.execute(message.child(ref), next);
    }
  }
};
},{"type-component":62}],57:[function(require,module,exports){
var Message        = require("./message"),
factory            = require("./factory"),
listenerCollection = require("./factory/collection"),
type               = require("type-component"),
async              = require("async"),
protoclass         = require("protoclass"),
sift               = require("sift");

function Mediator () {
  this._listeners = {};
  this._spies     = [];
}


protoclass(Mediator, {

  /**
   */

  on: function (nameOrPlugin) {

    var listeners, nameParts, collection, listener;

    listeners = Array.prototype.slice.call(arguments, 1);

    if (nameOrPlugin.test) {
      return factory.push(nameOrPlugin);
    }

    nameParts = this._parse(nameOrPlugin);

    if(!(listener = this._listeners[nameParts.name])) {
      listener = this._listeners[nameParts.name] = { pre: [], post: [] };
    }

    listeners = factory.create(this, listeners);

    if(nameParts.type) {
      collection = listener[nameParts.type];
      collection.push(listeners);
    } else {
      listener.callback = listeners;
    }

    return {
      dispose: function () {
        var i;
        if (collection) {
          i = collection.indexOf(listeners);
          if(~i) {
            collection.splice(i, 1);
          }
        } else {
          delete this._listeners[nameParts.name];
        }
      }
    };
  },

  /**
   */

  spy: function (tester, listener) {
    this._spies.push({
      test     : sift(tester).test,
      listener : listener
    })
  },

  /**
   */

  _triggerSpies: function (message) {
    for (var i = this._spies.length; i--;) {
      var spy = this._spies[i];
      if (spy.test(message.data)) {
        spy.listener(message);
      }
    }
  },

  /**
   */

  message: function (name, data, options) {

    if(arguments.length === 2) {
      options = {};
    }

    return new Message(name, data || {}, options || {}, this);
  },

  /**
   */

  once: function (name) {
    var listeners, listener;

    listeners = Array.prototype. slice.call(arguments, 1);
    listeners.unshift(function (message, next) {
      listener.dispose();
      next();
    });

    return listener = this.on.apply(this, [name].concat(listeners));
  },

  /**
   */

  execute: function (nameOrMessage, data, next) {
    var msg, listener, chain;

    if (!nameOrMessage.__isCommand) {
      msg = this.message(nameOrMessage, data);
    } else {
      msg = nameOrMessage;
      next = data;
    }


    if (arguments.length === 2 && type(data) === "function") {
      next = data;
    }

    if (type(next) !== "function") {
        next = function () {};
    }

    listener = this._listeners[msg.name] || {};

    chain = (listener.pre || []).
      concat(listener.callback || []).
      concat(listener.post || []);

    msg.listeners = chain;

    this._triggerSpies(msg);

    msg.set("loading", true);

    function complete (err, result) {
      var args = arguments;
      async.nextTick(function () {
        if (err) {
           msg.set("error", err);
           return next(err);
        }

        msg.set("success", !err);
        msg.set("loading", false);
        msg.set("data", result);
        next.apply(this, args);
      });
    }


    if (!chain.length) {
      complete(new Error("command '"+ nameOrMessage + "' does not exist"));
      return msg;
    }


    var completeArgs = [];

    async.eachSeries(chain, function (l, next) {
      l(msg, function (err) {

        // fix for sinon
        if (!err && l === listener.callback) {
          completeArgs = msg.args.length ? [null].concat(msg.args) : Array.prototype.slice.call(arguments, 0);
        }
        next(err);
      });
    }, function (err) {
      if(err) return complete.apply(this, arguments);
      complete.apply(this, completeArgs);
    });

    return msg;
  },

  /**
   */

  _parse: function (message) {
    var messageParts = message.split(" "),
    name = messageParts.pop(),
    t = messageParts.pop(); // pre? post?

    return { type: t, name: name };
  }
});

module.exports = function () {
  return new Mediator();
}

},{"./factory":54,"./factory/collection":52,"./message":58,"async":59,"protoclass":60,"sift":61,"type-component":62}],58:[function(require,module,exports){
var bindable = require("bindable");

/**
 */

function Message (name, data, options, mediator, parent) {

  bindable.Object.call(this, this);

  this.name     = name;
  this.data     = data;
  this.options  = options || {};
  this.mediator = mediator;
  this.parent   = parent;
  this.args     = [];
  this.root     = parent ? parent.root : this;

  var self = this;

  ["success", "result", "data", "error"].forEach(function (prop) {
    self.bind(prop, function () {
      self.emit.apply(self, [prop].concat(Array.prototype.slice.call(arguments, 0)));
    });
  });
}

/**
 */

bindable.Object.extend(Message, {

  /**
   */

  __isCommand: true,

  /**
   */

  child: function (name, options) {
    return new Message(name, this.data, options, this.mediator, this);
  }
});

/**
 */

module.exports = Message;

},{"bindable":40}],59:[function(require,module,exports){
(function (process){
/*jshint onevar: false, indent:4 */
/*global setImmediate: false, setTimeout: false, console: false */
(function () {

    var async = {};

    // global on the server, window in the browser
    var root, previous_async;

    root = this;
    if (root != null) {
      previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        var called = false;
        return function() {
            if (called) throw new Error("Callback was already called.");
            called = true;
            fn.apply(root, arguments);
        }
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    var _each = function (arr, iterator) {
        if (arr.forEach) {
            return arr.forEach(iterator);
        }
        for (var i = 0; i < arr.length; i += 1) {
            iterator(arr[i], i, arr);
        }
    };

    var _map = function (arr, iterator) {
        if (arr.map) {
            return arr.map(iterator);
        }
        var results = [];
        _each(arr, function (x, i, a) {
            results.push(iterator(x, i, a));
        });
        return results;
    };

    var _reduce = function (arr, iterator, memo) {
        if (arr.reduce) {
            return arr.reduce(iterator, memo);
        }
        _each(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    };

    var _keys = function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////
    if (typeof process === 'undefined' || !(process.nextTick)) {
        if (typeof setImmediate === 'function') {
            async.nextTick = function (fn) {
                // not a direct alias for IE10 compatibility
                setImmediate(fn);
            };
            async.setImmediate = async.nextTick;
        }
        else {
            async.nextTick = function (fn) {
                setTimeout(fn, 0);
            };
            async.setImmediate = async.nextTick;
        }
    }
    else {
        async.nextTick = process.nextTick;
        if (typeof setImmediate !== 'undefined') {
            async.setImmediate = function (fn) {
              // not a direct alias for IE10 compatibility
              setImmediate(fn);
            };
        }
        else {
            async.setImmediate = async.nextTick;
        }
    }

    async.each = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        _each(arr, function (x) {
            iterator(x, only_once(done) );
        });
        function done(err) {
          if (err) {
              callback(err);
              callback = function () {};
          }
          else {
              completed += 1;
              if (completed >= arr.length) {
                  callback();
              }
          }
        }
    };
    async.forEach = async.each;

    async.eachSeries = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function () {
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed >= arr.length) {
                        callback();
                    }
                    else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    };
    async.forEachSeries = async.eachSeries;

    async.eachLimit = function (arr, limit, iterator, callback) {
        var fn = _eachLimit(limit);
        fn.apply(null, [arr, iterator, callback]);
    };
    async.forEachLimit = async.eachLimit;

    var _eachLimit = function (limit) {

        return function (arr, iterator, callback) {
            callback = callback || function () {};
            if (!arr.length || limit <= 0) {
                return callback();
            }
            var completed = 0;
            var started = 0;
            var running = 0;

            (function replenish () {
                if (completed >= arr.length) {
                    return callback();
                }

                while (running < limit && started < arr.length) {
                    started += 1;
                    running += 1;
                    iterator(arr[started - 1], function (err) {
                        if (err) {
                            callback(err);
                            callback = function () {};
                        }
                        else {
                            completed += 1;
                            running -= 1;
                            if (completed >= arr.length) {
                                callback();
                            }
                            else {
                                replenish();
                            }
                        }
                    });
                }
            })();
        };
    };


    var doParallel = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.each].concat(args));
        };
    };
    var doParallelLimit = function(limit, fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [_eachLimit(limit)].concat(args));
        };
    };
    var doSeries = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.eachSeries].concat(args));
        };
    };


    var _asyncMap = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (err, v) {
                results[x.index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    };
    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = function (arr, limit, iterator, callback) {
        return _mapLimit(limit)(arr, iterator, callback);
    };

    var _mapLimit = function(limit) {
        return doParallelLimit(limit, _asyncMap);
    };

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachSeries(arr, function (x, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };
    // inject alias
    async.inject = async.reduce;
    // foldl alias
    async.foldl = async.reduce;

    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, function (x) {
            return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };
    // foldr alias
    async.foldr = async.reduceRight;

    var _filter = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.filter = doParallel(_filter);
    async.filterSeries = doSeries(_filter);
    // select alias
    async.select = async.filter;
    async.selectSeries = async.filterSeries;

    var _reject = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (!v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);

    var _detect = function (eachfn, arr, iterator, main_callback) {
        eachfn(arr, function (x, callback) {
            iterator(x, function (result) {
                if (result) {
                    main_callback(x);
                    main_callback = function () {};
                }
                else {
                    callback();
                }
            });
        }, function (err) {
            main_callback();
        });
    };
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);

    async.some = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (v) {
                    main_callback(true);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(false);
        });
    };
    // any alias
    async.any = async.some;

    async.every = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (!v) {
                    main_callback(false);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(true);
        });
    };
    // all alias
    async.all = async.every;

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                var fn = function (left, right) {
                    var a = left.criteria, b = right.criteria;
                    return a < b ? -1 : a > b ? 1 : 0;
                };
                callback(null, _map(results.sort(fn), function (x) {
                    return x.value;
                }));
            }
        });
    };

    async.auto = function (tasks, callback) {
        callback = callback || function () {};
        var keys = _keys(tasks);
        var remainingTasks = keys.length
        if (!remainingTasks) {
            return callback();
        }

        var results = {};

        var listeners = [];
        var addListener = function (fn) {
            listeners.unshift(fn);
        };
        var removeListener = function (fn) {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        };
        var taskComplete = function () {
            remainingTasks--
            _each(listeners.slice(0), function (fn) {
                fn();
            });
        };

        addListener(function () {
            if (!remainingTasks) {
                var theCallback = callback;
                // prevent final callback from calling itself if it errors
                callback = function () {};

                theCallback(null, results);
            }
        });

        _each(keys, function (k) {
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _each(_keys(results), function(rkey) {
                        safeResults[rkey] = results[rkey];
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                    // stop subsequent errors hitting callback multiple times
                    callback = function () {};
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            };
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            var ready = function () {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            };
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                var listener = function () {
                    if (ready()) {
                        removeListener(listener);
                        task[task.length - 1](taskCallback, results);
                    }
                };
                addListener(listener);
            }
        });
    };

    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var attempts = [];
        // Use defaults if times not passed
        if (typeof times === 'function') {
            callback = task;
            task = times;
            times = DEFAULT_TIMES;
        }
        // Make sure times is a number
        times = parseInt(times, 10) || DEFAULT_TIMES;
        var wrappedTask = function(wrappedCallback, wrappedResults) {
            var retryAttempt = function(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            };
            while (times) {
                attempts.push(retryAttempt(task, !(times-=1)));
            }
            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || callback)(data.err, data.result);
            });
        }
        // If a callback is passed, run this as a controll flow
        return callback ? wrappedTask() : wrappedTask
    };

    async.waterfall = function (tasks, callback) {
        callback = callback || function () {};
        if (!_isArray(tasks)) {
          var err = new Error('First argument to waterfall must be an array of functions');
          return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        var wrapIterator = function (iterator) {
            return function (err) {
                if (err) {
                    callback.apply(null, arguments);
                    callback = function () {};
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    async.setImmediate(function () {
                        iterator.apply(null, args);
                    });
                }
            };
        };
        wrapIterator(async.iterator(tasks))();
    };

    var _parallel = function(eachfn, tasks, callback) {
        callback = callback || function () {};
        if (_isArray(tasks)) {
            eachfn.map(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            eachfn.each(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.parallel = function (tasks, callback) {
        _parallel({ map: async.map, each: async.each }, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
    };

    async.series = function (tasks, callback) {
        callback = callback || function () {};
        if (_isArray(tasks)) {
            async.mapSeries(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.eachSeries(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.iterator = function (tasks) {
        var makeCallback = function (index) {
            var fn = function () {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            };
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        };
        return makeCallback(0);
    };

    async.apply = function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(Array.prototype.slice.call(arguments))
            );
        };
    };

    var _concat = function (eachfn, arr, fn, callback) {
        var r = [];
        eachfn(arr, function (x, cb) {
            fn(x, function (err, y) {
                r = r.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, r);
        });
    };
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        if (test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.whilst(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = Array.prototype.slice.call(arguments, 1);
            if (test.apply(null, args)) {
                async.doWhilst(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.until = function (test, iterator, callback) {
        if (!test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.until(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doUntil = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = Array.prototype.slice.call(arguments, 1);
            if (!test.apply(null, args)) {
                async.doUntil(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.queue = function (worker, concurrency) {
        if (concurrency === undefined) {
            concurrency = 1;
        }
        function _insert(q, data, pos, callback) {
          if (!q.started){
            q.started = true;
          }
          if (!_isArray(data)) {
              data = [data];
          }
          if(data.length == 0) {
             // call drain immediately if there are no tasks
             return async.setImmediate(function() {
                 if (q.drain) {
                     q.drain();
                 }
             });
          }
          _each(data, function(task) {
              var item = {
                  data: task,
                  callback: typeof callback === 'function' ? callback : null
              };

              if (pos) {
                q.tasks.unshift(item);
              } else {
                q.tasks.push(item);
              }

              if (q.saturated && q.tasks.length === q.concurrency) {
                  q.saturated();
              }
              async.setImmediate(q.process);
          });
        }

        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            saturated: null,
            empty: null,
            drain: null,
            started: false,
            paused: false,
            push: function (data, callback) {
              _insert(q, data, false, callback);
            },
            kill: function () {
              q.drain = null;
              q.tasks = [];
            },
            unshift: function (data, callback) {
              _insert(q, data, true, callback);
            },
            process: function () {
                if (!q.paused && workers < q.concurrency && q.tasks.length) {
                    var task = q.tasks.shift();
                    if (q.empty && q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    var next = function () {
                        workers -= 1;
                        if (task.callback) {
                            task.callback.apply(task, arguments);
                        }
                        if (q.drain && q.tasks.length + workers === 0) {
                            q.drain();
                        }
                        q.process();
                    };
                    var cb = only_once(next);
                    worker(task.data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                if (q.paused === true) { return; }
                q.paused = true;
                q.process();
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                q.process();
            }
        };
        return q;
    };

    async.cargo = function (worker, payload) {
        var working     = false,
            tasks       = [];

        var cargo = {
            tasks: tasks,
            payload: payload,
            saturated: null,
            empty: null,
            drain: null,
            drained: true,
            push: function (data, callback) {
                if (!_isArray(data)) {
                    data = [data];
                }
                _each(data, function(task) {
                    tasks.push({
                        data: task,
                        callback: typeof callback === 'function' ? callback : null
                    });
                    cargo.drained = false;
                    if (cargo.saturated && tasks.length === payload) {
                        cargo.saturated();
                    }
                });
                async.setImmediate(cargo.process);
            },
            process: function process() {
                if (working) return;
                if (tasks.length === 0) {
                    if(cargo.drain && !cargo.drained) cargo.drain();
                    cargo.drained = true;
                    return;
                }

                var ts = typeof payload === 'number'
                            ? tasks.splice(0, payload)
                            : tasks.splice(0, tasks.length);

                var ds = _map(ts, function (task) {
                    return task.data;
                });

                if(cargo.empty) cargo.empty();
                working = true;
                worker(ds, function () {
                    working = false;

                    var args = arguments;
                    _each(ts, function (data) {
                        if (data.callback) {
                            data.callback.apply(null, args);
                        }
                    });

                    process();
                });
            },
            length: function () {
                return tasks.length;
            },
            running: function () {
                return working;
            }
        };
        return cargo;
    };

    var _console_fn = function (name) {
        return function (fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            fn.apply(null, args.concat([function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (typeof console !== 'undefined') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _each(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            }]));
        };
    };
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || function (x) {
            return x;
        };
        var memoized = function () {
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                async.nextTick(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (key in queues) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([function () {
                    memo[key] = arguments;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                      q[i].apply(null, arguments);
                    }
                }]));
            }
        };
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
      return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
      };
    };

    async.times = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.map(counter, iterator, callback);
    };

    async.timesSeries = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.mapSeries(counter, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([function () {
                    var err = arguments[0];
                    var nextargs = Array.prototype.slice.call(arguments, 1);
                    cb(err, nextargs);
                }]))
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        };
    };

    async.compose = function (/* functions... */) {
      return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };

    var _applyEach = function (eachfn, fns /*args...*/) {
        var go = function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            return eachfn(fns, function (fn, cb) {
                fn.apply(that, args.concat([cb]));
            },
            callback);
        };
        if (arguments.length > 2) {
            var args = Array.prototype.slice.call(arguments, 2);
            return go.apply(this, args);
        }
        else {
            return go;
        }
    };
    async.applyEach = doParallel(_applyEach);
    async.applyEachSeries = doSeries(_applyEach);

    async.forever = function (fn, callback) {
        function next(err) {
            if (err) {
                if (callback) {
                    return callback(err);
                }
                throw err;
            }
            fn(next);
        }
        next();
    };

    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

}).call(this,require("OpdoqP"))
},{"OpdoqP":65}],60:[function(require,module,exports){
module.exports=require(11)
},{}],61:[function(require,module,exports){
/*
 * Sift
 * 
 * Copryright 2011, Craig Condon
 * Licensed under MIT
 *
 * Inspired by mongodb's query language 
 */


(function() {


  /**
   */

  var _convertDotToSubObject = function(keyParts, value) {

    var subObject = {},
    currentValue = subObject;

    for(var i = 0, n = keyParts.length - 1; i < n; i++) {
      currentValue = currentValue[keyParts[i]] = {};
    }

    currentValue[keyParts[i]] = value;
    
    return subObject;
  }

  /**
   */

  var _queryParser = new (function() {

    /**
     * tests against data
     */

    var priority = this.priority = function(statement, data) {

      var exprs = statement.exprs,
      priority = 0;

      //generally, expressions are ordered from least efficient, to most efficient.
      for(var i = 0, n = exprs.length; i < n; i++) {

        var expr = exprs[i],
        p;

        if(!~(p = expr.e(expr.v, _comparable(data), data))) return -1;

        priority += p;

      }


      return priority;
    }


    /**
     * parses a statement into something evaluable
     */

    var parse = this.parse = function(statement, key) {

      //fixes sift(null, []) issue
      if(!statement) statement = { $eq: statement };

      var testers = [];
        
      //if the statement is an object, then we're looking at something like: { key: match }
      if(Object.prototype.toString.call(statement) === "[object Object]") {

        for(var k in statement) {

          //find the apropriate operator. If one doesn't exist, then it's a property, which means
          //we create a new statement (traversing) 
          var operator = !!_testers[k] ?  k : '$trav',

          //value of given statement (the match)
          value = statement[k],

          //default = match
          exprValue = value;

          //if we're working with a traversable operator, then set the expr value
          if(TRAV_OP[operator]) {


            //using dot notation? convert into a sub-object
            if(~k.indexOf(".")) {
              var keyParts = k.split(".");
              k = keyParts.shift(); //we're using the first key, so remove it

              exprValue = value = _convertDotToSubObject(keyParts, value);
            }
            
            //*if* the value is an array, then we're dealing with something like: $or, $and
            if(value instanceof Array) {
              
              exprValue = [];

              for(var i = value.length; i--;) {
                exprValue.push(parse(value[i]));    
              }

            //otherwise we're dealing with $trav
            } else {  
              exprValue = parse(value, k);
            }
          } 

          testers.push(_getExpr(operator, k, exprValue));

        }
                

      //otherwise we're comparing a particular value, so set to eq
      } else {
        testers.push(_getExpr('$eq', k, statement));
      }

      var stmt =  { 
        exprs: testers,
        k: key,
        test: function(value) {
          return !!~stmt.priority(value);
        },
        priority: function(value) {
          return priority(stmt, value);
        }
      };
      
      return stmt;
    
    }


    //traversable statements
    var TRAV_OP = this.traversable = {
      $and: true,
      $or: true,
      $nor: true,
      $trav: true,
      $not: true
    };


    function _comparable(value) {
      if(value instanceof Date) {
        return value.getTime();
      } else {
        return value;
      }
    }

    function btop(value) {
      return value ? 0 : -1;
    }

    var _testers = this.testers =  {

      /**
       */

      $eq: function(a, b) {
        return btop(a.test(b));
      },

      /**
       */

      $ne: function(a, b) {
        return btop(!a.test(b));
      },

      /**
       */

      $lt: function(a, b) {
        return btop(a > b);
      },

      /**
       */

      $gt: function(a, b) {
        return btop(a < b);
      },

      /**
       */

      $lte: function(a, b) {
        return btop(a >= b);
      },

      /**
       */

      $gte: function(a, b) {
        return btop(a <= b);
      },


      /**
       */

      $exists: function(a, b) {
        return btop(a === (b != null))
      },

      /**
       */

      $in: function(a, b) {

        //intersecting an array
        if(b instanceof Array) {

          for(var i = b.length; i--;) {
            if(~a.indexOf(b[i])) return i;
          } 

        } else {
          return btop(~a.indexOf(b));
        }


        return -1;
      },

      /**
       */

      $not: function(a, b) {
        if(!a.test) throw new Error("$not test should include an expression, not a value. Use $ne instead.");
        return btop(!a.test(b));
      },

      /**
       */

      $type: function(a, b, org) {

        //instanceof doesn't work for strings / boolean. instanceof works with inheritance
        return org ? btop(org instanceof a || org.constructor == a) : -1;
      },

      /**
       */


      $nin: function(a, b) {
        return ~_testers.$in(a, b) ? -1 : 0;
      },

      /**
       */

      $mod: function(a, b) {
        return b % a[0] == a[1] ? 0 : -1;
      },

      /**
       */

      $all: function(a, b) {

        for(var i = a.length; i--;) {
                    var a1 = a[i];
                    var indexInB = ~b.indexOf(a1);
          if(!indexInB) return -1;
        }

        return 0;
      },

      /**
       */

      $size: function(a, b) {
        return b ? btop(a == b.length) : -1;
      },

      /**
       */

      $or: function(a, b) {

        var i = a.length, p, n = i;

        for(; i--;) {
          if(~priority(a[i], b)) {
            return i;
          }
        }

        return btop(n == 0);
      },

      /**
       */

      $nor: function(a, b) {

        var i = a.length, n = i;

        for(; i--;) {
          if(~priority(a[i], b)) {
            return -1;
          }
        }

        return 0;
      },

      /**
       */

      $and: function(a, b) {

        for(var i = a.length; i--;) {
          if(!~priority(a[i], b)) {
            return -1;
          }
        }

        return 0;
      },

      /**
       */

      $trav: function(a, b) {



        if(b instanceof Array) {
          
          for(var i = b.length; i--;) {
            var subb = b[i];
            if(subb[a.k] && ~priority(a, subb[a.k])) return i;
          }

          return -1;
        }

        //continue to traverse even if there isn't a value - this is needed for 
        //something like name:{$exists:false}
        return priority(a, b ? b[a.k] : undefined);
      },

      /**
       */

      $regex: function(a, b) {
        var aRE = new RegExp(a);
        return aRE.test(b) ? 0 : -1;
      }


    }

    var _prepare = {
      
      /**
       */

      $eq: function(a) {
        
        var fn;

        if(a instanceof RegExp) {
          return a;
        } else if (a instanceof Function) {
          fn = a;
        } else {
          
          fn = function(b) {  
            if(b instanceof Array) {    
              return ~b.indexOf(a);
            } else {
              return a == b;
            }
          }
        }

        return {
          test: fn
        }

      },
      
      /**
       */
        
       $ne: function(a) {
        return _prepare.$eq(a);
       }
    };



    var _getExpr = function(type, key, value) {

      var v = _comparable(value);

      return { 

        //k key
        k: key, 

        //v value
        v: _prepare[type] ? _prepare[type](v) : v, 

        //e eval
        e: _testers[type] 
      };

    }

  })();


  var getSelector = function(selector) {

    if(!selector) {

      return function(value) {
        return value;
      };

    } else 
    if(typeof selector == 'function') {
      return selector;
    }

    throw new Error("Unknown sift selector " + selector);
  }

  var sifter = function(query, selector) {

    //build the filter for the sifter
    var filter = _queryParser.parse( query );
      
    //the function used to sift through the given array
    var self = function(target) {
        
      var sifted = [], results = [], testValue, value, priority;

      //I'll typically start from the end, but in this case we need to keep the order
      //of the array the same.
      for(var i = 0, n = target.length; i < n; i++) {

        value = target[i];
        testValue = selector(value);

        //priority = -1? it's not something we can use.
        if(!~(priority = filter.priority( testValue ))) continue;

        //push all the sifted values to be sorted later. This is important particularly for statements
        //such as $or
        sifted.push({
          value: value,
          priority: priority
        });
      }

      //sort the values
      sifted.sort(function(a, b) {
        return a.priority > b.priority ? -1 : 1;
      });

      var values = Array(sifted.length);

      //finally, fetch the values & return them.
      for(var i = sifted.length; i--;) {
        values[i] = sifted[i].value;
      }

      return values;
    }

    //set the test function incase the sifter isn't needed
    self.test   = filter.test;
    self.score  = filter.priority;
    self.query  = query;

    return self;
  }


  /**
   * sifts the given function
   * @param query the mongodb query
   * @param target the target array
   * @param rawSelector the selector for plucking data from the given target
   */

  var sift = function(query, target, rawSelector) {

    //must be an array
    if(typeof target != "object") {
      rawSelector = target;
      target = undefined;
    }


    var sft  = sifter(query, getSelector(rawSelector));

    //target given? sift through it and return the filtered result
    if(target) return sft(target);

    //otherwise return the sifter func
    return sft;

  }


  sift.use = function(options) {
    if(options.operators) sift.useOperators(options.operators);
  }

  sift.useOperators = function(operators) {
    for(var key in operators) {
      sift.useOperator(key, operators[key]);
    }
  }

  sift.useOperator = function(operator, optionsOrFn) {

    var options = {};

    if(typeof optionsOrFn == "object") {
      options = optionsOrFn;
    } else {
      options = { test: optionsOrFn };
    }


    var key = "$" + operator;
    _queryParser.testers[key] = options.test;

    if(options.traversable || options.traverse) {
      _queryParser.traversable[key] = true;
    }
  }


  //node.js?
  if((typeof module != 'undefined') && (typeof module.exports != 'undefined')) {
    
    module.exports = sift;

  } else 

  //browser?
  if(typeof window != 'undefined') {
    
    window.sift = sift;

  }

})();


},{}],62:[function(require,module,exports){
module.exports=require(34)
},{}],63:[function(require,module,exports){

},{}],64:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],65:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],66:[function(require,module,exports){
(function (global){
/*! http://mths.be/punycode v1.2.4 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports;
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		while (length--) {
			array[length] = fn(array[length]);
		}
		return array;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings.
	 * @private
	 * @param {String} domain The domain name.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		return map(string.split(regexSeparators), fn).join('.');
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols to a Punycode string of ASCII-only
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name to Unicode. Only the
	 * Punycoded parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it on a string that has already been converted to
	 * Unicode.
	 * @memberOf punycode
	 * @param {String} domain The Punycode domain name to convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(domain) {
		return mapDomain(domain, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name to Punycode. Only the
	 * non-ASCII parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it with a domain that's already in ASCII.
	 * @memberOf punycode
	 * @param {String} domain The domain name to convert, as a Unicode string.
	 * @returns {String} The Punycode representation of the given domain name.
	 */
	function toASCII(domain) {
		return mapDomain(domain, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.2.4',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <http://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],67:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],68:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],69:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":67,"./encode":68}],70:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var punycode = require('punycode');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a puny coded representation of "domain".
      // It only converts the part of the domain name that
      // has non ASCII characters. I.e. it dosent matter if
      // you call it with a domain that already is in ASCII.
      var domainArray = this.hostname.split('.');
      var newOut = [];
      for (var i = 0; i < domainArray.length; ++i) {
        var s = domainArray[i];
        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
            'xn--' + punycode.encode(s) : s);
      }
      this.hostname = newOut.join('.');
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  Object.keys(this).forEach(function(k) {
    result[k] = this[k];
  }, this);

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    Object.keys(relative).forEach(function(k) {
      if (k !== 'protocol')
        result[k] = relative[k];
    });

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      Object.keys(relative).forEach(function(k) {
        result[k] = relative[k];
      });
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!isNull(result.pathname) || !isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especialy happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!isNull(result.pathname) || !isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

function isString(arg) {
  return typeof arg === "string";
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isNull(arg) {
  return arg === null;
}
function isNullOrUndefined(arg) {
  return  arg == null;
}

},{"punycode":66,"querystring":69}],71:[function(require,module,exports){
var BindableCollection = require("bindable-collection"),
_            = require("lodash"),
BaseModel    = require("./model"),
janitor      = require("janitorjs"),
Application  = require("mojo-application");

function BaseCollection (options, application) {
  if (!options) options = {};
  BindableCollection.call(this, options.source);
  this.application = application || Application.main;
  this._modelsJanitor = janitor();
  this.setProperties(options);
  this.bind("data", _.bind(this._onData, this));
  if (this.data) this._onData(this.data);
  this.application.models.decorate(this);
  this._rewatchModels();
}

// deserialize should check for UID

module.exports =BindableCollection.extend(BaseCollection, {

  /**
   */

  idProperty: "_id",

  /**
   */

  deserialize: function (data) {
    return {
      value: data
    };
  },

  /**
   */

  createModel: function (options) {
    options.collection = this;
    var ModelClass = BaseModel;

    if (this.modelType) {
      if (typeof this.modelType === "function") {
        ModelClass = this.modelType;
      } else {
        return this.application.models.create(this.modelType, options);
      }
    }
    return new ModelClass(options, this.application);
  },

  /**
   */

  create: function (options) {
    
    if (!options) options = {};

    var model = this._watchModel(this.createModel(options), true),
    self = this;

    model.isNew = true;
    model.owner = this.owner;


    if (options.waitUntilSave !== true) {
      this.push(model);
    }

    model.once("didSave", function () {
      if (options.waitUntilSave === true) self.push(model);
      model.set("isNew", false);
    });

    return model;
  },

  /**
   */

  _onData: function (data) {
    var self = this;
    
    this.emit("willUpdate");

    var ndata = this.deserialize(data || []),
    source    = ndata.value || ndata.source;

    if (!source) {
      ndata = {
        source: source = ndata
      };
    }

    delete ndata["source"];

    this.setProperties(ndata);


    var nsrc = source || [],
    emodels  = this.source.concat(),
    nmodels  = [],
    nmodel;

    this._modelsJanitor.dispose();


    // update existing
    for (var i = emodels.length; i--;) {
      var emodel = emodels[i];
      for (var j = nsrc.length; j--;) {
        var newValue = nsrc[j];
        if (this._compareIds(emodel, newValue)) {

          // update with emodel
          emodel.set("data", newValue);

          // remove so it doesn't get processed
          emodels.splice(i, 1);
          nsrc.splice(j, 1);
        }
      }
    }

    // remove all models that couldn't be updated
    for (var i = emodels.length; i--;) {
      var emodel = emodels[i];
      this.splice(this.indexOf(emodel), 1);
      emodel.dispose();
    }

    // insert the new models
    for (var i = 0, n = nsrc.length; i < n; i++) {
      nmodel = this.createModel({ data: nsrc[i] });
      this.push(nmodel);
      nmodels.push(nmodel);
    }

    this._rewatchModels();


    // make sure that data has already been set - if so, compare old / new length
    // and emit an update. This is important incase an exernal source adds, or removes an item
    if (this._addedDataOnce) {

      var ops = {};

      if (nmodels.length) {
        ops.insert = nmodels;
      } 

      if (emodels.length) {
        ops.remove = emodels;
      }


      if (ops.insert || ops.remove) {
        this.emit("didUpdate", ops);
      }
    }

    this._addedDataOnce = true;
  },

  /**
   */

  _watchModel: function (model, isNew) {
    var self = this;

    var listeners = janitor();

    listeners.add(model.on("didSave", function () {
      if (isNew) {
        self.emit("didUpdate", { insert: [model] });
      } else {
        self.emit("didUpdate", { save: model });
      }
    }));
    
    this._modelsJanitor.add(model.once("dispose", function () {
      var i = self.indexOf(model);

      if (model.remove != null) {
        model.once("didRemove", function () {
          self.emit("didUpdate", { remove: [model] });
        });
      }

      listeners.dispose();
      if (!~i) return;
      self.splice(i, 1);
    }));

    this._modelsJanitor.add(listeners);
    
    return model;
  },

  /**
   */

  _rewatchModels: function () {
    this._modelsJanitor.dispose();
    for (var i = this.length; i--;) {
      this._watchModel(this.at(i));
    }
  },

  /**
   */

  _compareIds: function (model, value) {
    if (typeof value === "object") {
      return String(model.data[this.idProperty]) === String(value[this.idProperty]);
    } else {
      return model.value === value;
    }
  },

  /**
   */
  
  toJSON: function () {
    return this.source.map(function (model) {
      return model.toJSON();
    })
  }
});
},{"./model":72,"bindable-collection":6,"janitorjs":88,"lodash":91,"mojo-application":13}],72:[function(require,module,exports){
var BindableObject = require("bindable-object"),
_            = require("lodash"),
Application           = require("mojo-application");

function BaseModel (properties, application) {

  // set the context of the model to itself
  BindableObject.call(this);

  this.application = application || Application.main;

  // set the data from the constructor
  this.setProperties(this._deserializedData = properties || {});

  // watch when data changes
  this.bind("data", _.bind(this._onData, this));
  if (this.data) this._onData(this.data);

  // decorate this model
  this.application.models.decorate(this);
}

module.exports = BindableObject.extend(BaseModel, {

  /**
   */

  deserialize: function (data) {
    return data;
  },

  /**
   */

  serialize: function () {

    var serialized = {}, data = this._deserializedData;

    for (var key in data) {
      var v = this[key];
      serialized[key] = v;
    }

    return serialized;
  },

  /**
   */

  toJSON: function () {
    return this.serialize();
  },

  /**
   */

  _onData: function (data) {
    
    if (!data) return;

    // deserialize data, and set to this model

    var data = this.deserialize(data);


    if (typeof data === "object") {
      this._deserializedData = data;
      this.setProperties(data);
    } else {
      this.set("value", data);
    }
  }
});
},{"bindable-object":7,"lodash":91,"mojo-application":13}],73:[function(require,module,exports){
var memoize = require("./utils/memoize"),
_           = require("lodash"),
hurryup     = require("hurryup"),
async       = require("async");


module.exports = {
  priority: "init",
  getOptions: function (target) {
    return target.persist;
  },
  decorate: function(model) {

    var persist = model.persist;

    if (typeof persist === "function") {
      persist = persist(model);
    }

    model.persist = persist;

    var q = async.queue(function (task, next) {
      task(next);
    });


    function _queue (fn) {
      fn = hurryup(fn, { timeout: 1000 * 10, retry: false });
      q.push(fn);
    }

    model.save = function (complete2) {

      if (typeof complete2 !== "function") complete2 = function() { };

      var self = this;

      model.set("loading", true);

      _queue(function (next) {

        model.emit("willSave");

        function complete (err, data) {

          next();

          if (err) return complete2(err);
          if (typeof data === "object") {
            model.set("data", data);
          }
          model.set("loading", false);
          model.emit("didSave");
          if (model.didSave) model.didSave();
          model.emit("saved");
          complete2(null, model);
        }

        if(persist.save) {
          persist.save.call(self, complete);
        } else {
          complete(new Error("cannot save model"));
        }
      });

      return this;
    };

    model.remove = function (complete) {
      if (typeof complete !== "function") complete = function() { };
      if (!persist.remove) {
        complete(new Error("cannot remove model"));
        return this;
      }

      var self = this;
      model.set("loading", true);

      // dispose immediately - don't wait
      model.dispose();

      _queue(function (next) {
        model.emit("willRemove");
        persist.remove.call(self, function(err) {
          next();
          if (err) return complete(err);
          model.set("loading", false);
          model.emit("didRemove");
          if (model.didRemove) model.didRemove();
          model.emit("removed");
          complete(null, model);
        });
      });
      
      return this;
    };

    model.reload = function (complete) {
      if (typeof complete !== "function") complete = function() { };
      if (!persist.load) {
        complete(new Error("cannot load model"));
        return this;
      } 

      var self = this;

      model.set("loading", true);

      _queue(function (next) {
        persist.load.call(self, function (err, data) {
          next();
          model.set("loading", false);
          if (err) {
            complete(err);
            return model._load.clear();
          }
          if (data != undefined) {
            model.set("data", data);
          }
          complete(null, model);
        });
      });

      return this
    };

    model._load = memoize(_.bind(model.reload, model));
    model.load = function (complete) {
      if (typeof complete !== "function") complete = function() { };
      model._load(complete);
      return this;
    }
  }
}

},{"./utils/memoize":75,"async":78,"hurryup":86,"lodash":91}],74:[function(require,module,exports){
var frills   = require("frills"),
virtuals     = require("./virtuals"),
crud         = require("./crud"),
bindings     = require("bindable-decor-bindings");

module.exports = function (app) {
  var decor = frills();

  decor.
  priority("init", 1).
  priority("load", 2).
  use(virtuals, crud, bindings());

  app.models.decorator = function (decorator) {
    decor.use(decorator);
  };

  app.models.decorate = function (target, proto) {
    decor.decorate(target, proto);
  };
};
},{"./crud":73,"./virtuals":76,"bindable-decor-bindings":79,"frills":84}],75:[function(require,module,exports){
var EventEmitter = require("fast-event-emitter");

module.exports = function (fn, ops) {
  if (!ops) ops = {};

  var em  = new EventEmitter(),
  ma      = null,
  calling = false;

  var memo = function () {
    var args = Array.prototype.slice.call(arguments, 0);
    var cb = args.pop() || function(){};

    if (ma) {
      return cb.apply(this, ma);
    }

    em.once("done", cb);

    if (calling) return;
    calling = true;

    args.push(function () {

      var args = Array.prototype.slice.call(arguments, 0);

      calling = false;

      if (ops.store !== false) {
        ma = args;
      }

      em.emit.apply(em, ["done"].concat(args));

      if (ops.maxAge) {
        setTimeout(memo.clear, ops.maxAge);
      }
    });

    fn.apply(this, args);
  };

  memo.clear = function () {
    ma = void 0;
  }

  return memo;
}
},{"fast-event-emitter":81}],76:[function(require,module,exports){
module.exports = {
  getOptions: function (target) {
    return target.virtuals;
  },
  decorate: function(model, virtuals) {

    var loading = {}, loadingModel = false;

    model.on("watching", function (propertyPath) {

      var property = propertyPath[0];

      if (model.get(property) != null) return;
      var self = this;

      
      if (virtuals[property]) {
        if (loading[property]) return;
        loading[property] = true;
        virtuals[property].call(model, function (err, value) {
          loading[property] = false;
          if (err) return;
          model.set(property, value);
        });
      } else {

        var selfVirtual = virtuals["*"];
        if (!selfVirtual || loadingModel) return;
        loadingModel = true;

        selfVirtual.call(model, property, function () {

        });
      }
    });
  }
}
},{}],77:[function(require,module,exports){
var RegisteredClasses = require("mojo-registered-classes"),
modelDecor            = require("./decor"),
BaseModel             = require("./base/model"),
BaseCollection        = require("./base/collection"),
Application           = require("mojo-application");

module.exports = function (app) {
  app.set("models", new RegisteredClasses(app));
  app.use(modelDecor);
}

module.exports.Base       = BaseModel;
module.exports.Collection = BaseCollection;


Application.main.use(module.exports);
},{"./base/collection":71,"./base/model":72,"./decor":74,"mojo-application":13,"mojo-registered-classes":92}],78:[function(require,module,exports){
module.exports=require(59)
},{"OpdoqP":65}],79:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
(function() {
  var BindingsDecorator, disposable,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  disposable = require("disposable");

  BindingsDecorator = (function() {

    /*
     */
    function BindingsDecorator(target, options) {
      this.target = target;
      this.dispose = __bind(this.dispose, this);
      this._onVisibilityChange = __bind(this._onVisibilityChange, this);
      this.bind = __bind(this.bind, this);
      this.bindings = typeof options === "object" ? options : void 0;
      this._bindings = [];
      this.target.once("dispose", this.dispose);
      this.target.on("change:visible", this._onVisibilityChange);
    }


    /*
     */

    BindingsDecorator.prototype.bind = function() {
      this.dispose();
      if (this.bindings) {
        return this._setupExplicitBindings();
      }
    };


    /*
     */

    BindingsDecorator.prototype._onVisibilityChange = function(value) {
      if (value) {
        return this.resume();
      } else {
        return this.pause();
      }
    };


    /*
     */

    BindingsDecorator.prototype.dispose = function() {
      var binding, _i, _len, _ref;
      _ref = this._bindings;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        binding.dispose();
      }
      return this._bindings = [];
    };


    /*
     */

    BindingsDecorator.prototype.pause = function() {
      var binding, _i, _len, _ref, _results;
      _ref = this._bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.pause());
      }
      return _results;
    };


    /*
     */

    BindingsDecorator.prototype.resume = function() {
      var binding, _i, _len, _ref, _results;
      _ref = this._bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.resume().now());
      }
      return _results;
    };


    /*
     explicit bindings are properties from & to properties of the view controller
     */

    BindingsDecorator.prototype._setupExplicitBindings = function() {
      var bindings, key, _results;
      bindings = this.bindings;
      this._bindings = [];
      _results = [];
      for (key in bindings) {
        _results.push(this._setupBinding(key, bindings[key]));
      }
      return _results;
    };


    /*
     */

    BindingsDecorator.prototype._setupBinding = function(property, to) {
      var oldTo, options;
      options = {};
      if (typeof to === "function") {
        oldTo = to;
        to = (function(_this) {
          return function() {
            return oldTo.apply(_this.target, arguments);
          };
        })(this);
      }
      if (to.to) {
        options = to;
      } else {
        options = {
          to: to
        };
      }
      return this._bindings.push(this.target.bind(property, options).now());
    };

    return BindingsDecorator;

  })();

  module.exports = function(event) {
    return {
      priority: "load",
      multi: true,
      getOptions: function(target) {
        return target.bindings;
      },
      decorate: function(target, options) {
        var decor;
        decor = new BindingsDecorator(target, options);
        if (event) {
          return target.once(event, decor.bind);
        } else {
          return decor.bind();
        }
      }
    };
  };

}).call(this);

},{"disposable":80}],80:[function(require,module,exports){


(function() {

	var _disposable = {};
		


	_disposable.create = function() {
		
		var self = {},
		disposables = [];


		self.add = function(disposable) {

			if(arguments.length > 1) {
				var collection = _disposable.create();
				for(var i = arguments.length; i--;) {
					collection.add(arguments[i]);
				}
				return self.add(collection);
			}

			if(typeof disposable == 'function') {
				
				var disposableFunc = disposable, args = Array.prototype.slice.call(arguments, 0);

				//remove the func
				args.shift();


				disposable = {
					dispose: function() {
						disposableFunc.apply(null, args);
					}
				};
			} else 
			if(!disposable || !disposable.dispose) {
				return false;
			}


			disposables.push(disposable);

			return {
				dispose: function() {
					var i = disposables.indexOf(disposable);
					if(i > -1) disposables.splice(i, 1);
				}
			};
		};

		self.addTimeout = function(timerId) {
			return self.add(function() {
				clearTimeout(timerId);
			});
		};

		self.addInterval = function(timerId) {
			return self.add(function() {
				clearInterval(timerId);
			});
		};

		self.addBinding = function(target) {
			self.add(function() {
				target.unbind();
			});
		};



		self.dispose = function() {
			
			for(var i = disposables.length; i--;) {
				disposables[i].dispose();
			}

			disposables = [];
		};

		return self;
	}



	if(typeof module != 'undefined') {
		module.exports = _disposable;
	}
	else
	if(typeof window != 'undefined') {
		window.disposable = _disposable;
	}


})();


},{}],81:[function(require,module,exports){
module.exports=require(10)
},{"protoclass":82}],82:[function(require,module,exports){
module.exports=require(11)
},{}],83:[function(require,module,exports){
var protoclass = require("protoclass");


function DecorFactory () {
  this._priorities   = {};
  this._decorators   = [];
}

module.exports = protoclass(DecorFactory, {

  /**
   */

  priority: function (name, value) {
    this._priorities[name] = value;
    return this;
  },

  /**
   */

  use: function () {
    var p = this._priorities;
    this._decorators = this._decorators.concat(Array.prototype.slice.call(arguments, 0)).sort(function (a, b) {
      return p[a.priority] > p[b.priority] ? -1 : 1;
    });
  },

  /**
   */

  decorate: function (target, proto) {

    if (!proto) {
      proto = target.constructor.prototype;
      if (proto === Object.prototype) {
        proto = target;
      }
    }

    var c = proto, d, dec, ops, used = {};

    while(c) {

      for (var i = this._decorators.length; i--;) {
        d = this._decorators[i];

        if (used[i] && d.multi !== true) continue;

        if ((ops = d.getOptions(c)) != null) {
          d.decorate(target, ops);
          used[i] = true;
        } else if (d.inherit === false) {
          used[i] = true;
        }
      }

      c = c.constructor.__super__;
    }
  }
});

},{"protoclass":85}],84:[function(require,module,exports){
var Decorator = require("./decorator");

module.exports = function () {
  return new Decorator();
}

},{"./decorator":83}],85:[function(require,module,exports){
module.exports=require(11)
},{}],86:[function(require,module,exports){
(function (global){
var comerr = require("comerr");

module.exports = function(timedCallback, timeoutOrOps) {

  var options = {};

  if(timeoutOrOps) {
    if(typeof timeoutOrOps == "object") {
      options = timeoutOrOps;
    } else {
      options = {
        timeout: timeoutOrOps
      };
    }
  }

  var timeout = options.timeout || 1000 * 20;

  //retry if an error.
  //can be a boolean, or a function that returns a boolean.
  var retry = options.retry || false;
  var retryIsFunction = !!(retry.constructor && retry.call && retry.apply) // from underscore.js

  //time gap between retries
  var retryTimeout = options.retryTimeout || 3000;



  return function() {

    var args = Array.prototype.slice.call(arguments, 0),
    killed   = false,
    oldNext,
    ret,
    self = this == global ? {} : this;


    if(typeof args[args.length - 1] == "function") {
      oldNext = args.pop();
    } else {
      oldNext = function(err) {
        if(err) throw err;
      }
    }

    var retryTimeout,
    ret,
    callbackErr,
    killDate = Date.now() + timeout,
    //start the race between the timed callback, and the kill timeout
    killTimeout = setTimeout(function() {

      ret.dispose();

      //uh oh - timed callback took too long! time to throw an error
      oldNext.call(self, callbackErr || new comerr.Timeout());

    }, timeout);


    function runCallback() {

      this._timeLeft = killDate - Date.now();


      //call the timed callback
      timedCallback.apply(this, args.concat(function(err) {

        //do not run the callback
        if(killed) return;

        if(err && retry && (!retryIsFunction || retry(err))) {
          callbackErr = err;
          return retryTimeout = setTimeout(runCallback, retryTimeout);
        }

        //awesome - made it before the killTimeout could
        clearTimeout(killTimeout);

        //pass on the args
        oldNext.apply(this, arguments);
      }));
    }


    runCallback.call(self);

    return ret = {
      dispose: function () {
        killed = true;
        clearTimeout(retryTimeout);
        clearTimeout(killTimeout);
      }
    };
  }
}


}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"comerr":87}],87:[function(require,module,exports){


var DEFAULT_CODES = {

	//http
	400: "Bad Request",
	401: "Unauthorized",
	402: "Payment Required",
	404: "Not Found",
	403: "Forbidden",
	408: "Timeout",
	423: "Locked", //locking user accounts
	429: "Too Many Requests",
	500: "Unknown",
	501: "Not Implemented", //use this for features not implemented yet

	//custom
	601: "Incorrect Input", //e.g: incorrect credentails
	602: "Invalid", //e.g: email is wrong
	604: "Already Exists", //e.g: name already taken
	605: "Expired",
	606: "Unable To Connect",
	607: "Already Called", //error for when a method can only be called once, and has already been called
	608: "Not Enough Info", //error happens when a form isn't filled out properly
	609: "Incorrect Type" //incorrect data type
};

exports.codes = {};
exports.byCode = {};

exports.register = function(codes) {
	Object.keys(codes).forEach(function(code) {


		var name  = codes[code],
		message   = name,
		className = name.replace(/\s+/g, ""),
		ccName    = className.substr(0, 1).toLowerCase() + className.substr(1)

		if(exports[className]) {
			throw new Error("Error code '" + code + "' already exists.");
		}

		function addInfo(err, tags) {
			err.code = code;
			err[ccName] = true;
			if(tags) err.tags = tags;
			return err;
		}

		var Err = exports[className] = function(message, tags) {

			Error.call(this, message);

			this.message = (message || name);
			this.stack = new Error(this.message).stack;
			addInfo(this);
		}

		Err.prototype = new Error();
		Err.prototype.constructor = Err;
		Err.prototype.name = name;

		exports.byCode[code]     = Err;
		exports.codes[className] = code;

		//newer - better support against browsers
		exports[ccName] = Err.fn = function(message, tags) {
			return addInfo(new Error(message || name), tags);
		}
	});
}


exports.fromCode = function(code, message) {
	var clazz = exports.byCode[Number(code)] || exports.Unknown;
	return clazz.fn(message);
}


exports.register(DEFAULT_CODES);


},{}],88:[function(require,module,exports){
var protoclass = require("protoclass"),
type           = require("type-component");

/**
 */

function Janitor () {
  this._garbage = [];
}

/**
 */
 
protoclass(Janitor, {

  /**
   */

  add: function (disposable) {

    if (disposable.dispose) {
      this._garbage.push(disposable);
    } else if (type(disposable) === "function") {
      this._garbage.push({
        dispose: disposable
      });
    }

    return this;
  },

  /**
   */

  remove: function (disposable) {
    var i = this._garbage.indexOf(disposable);
    if(!~i) return;
    this._garbage.splice(i, 1);
  },

  /**
   */

  addTimeout: function (timer) {
    return this.add({
      dispose: function () {
        clearTimeout(timer);
      }
    });
  },

  /**
   */

  addInterval: function (timer) {
    return this.add({
      dispose: function () {
        clearInterval(timer);
      }
    });
  },

  /** 
   * disposes all items in the collection
   */

  dispose: function () {
    for(var i = this._garbage.length; i--;) {
      this._garbage[i].dispose();
    }
    this._garbage = [];
    return this;
  }
});

module.exports = function () {
  return new Janitor();
}
},{"protoclass":89,"type-component":90}],89:[function(require,module,exports){
module.exports=require(11)
},{}],90:[function(require,module,exports){
module.exports=require(34)
},{}],91:[function(require,module,exports){
(function (global){
/**
 * @license
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modern -o ./dist/lodash.js`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
;(function() {

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /** Used to pool arrays and objects used internally */
  var arrayPool = [],
      objectPool = [];

  /** Used to generate unique IDs */
  var idCounter = 0;

  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
  var keyPrefix = +new Date + '';

  /** Used as the size when optimizations are enabled for large arrays */
  var largeArraySize = 75;

  /** Used as the max size of the `arrayPool` and `objectPool` */
  var maxPoolSize = 40;

  /** Used to detect and test whitespace */
  var whitespace = (
    // whitespace
    ' \t\x0B\f\xA0\ufeff' +

    // line terminators
    '\n\r\u2028\u2029' +

    // unicode category "Zs" space separators
    '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'
  );

  /** Used to match empty string literals in compiled template source */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /**
   * Used to match ES6 template delimiters
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-literals-string-literals
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match regexp flags from their coerced string values */
  var reFlags = /\w*$/;

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to match "interpolate" template delimiters */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to match leading whitespace and zeros to be removed */
  var reLeadingSpacesAndZeros = RegExp('^[' + whitespace + ']*0+(?=.$)');

  /** Used to ensure capturing order of template delimiters */
  var reNoMatch = /($^)/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Used to match unescaped characters in compiled string literals */
  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

  /** Used to assign default `context` object properties */
  var contextProps = [
    'Array', 'Boolean', 'Date', 'Function', 'Math', 'Number', 'Object',
    'RegExp', 'String', '_', 'attachEvent', 'clearTimeout', 'isFinite', 'isNaN',
    'parseInt', 'setTimeout'
  ];

  /** Used to make template sourceURLs easier to identify */
  var templateCounter = 0;

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      funcClass = '[object Function]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used to identify object classifications that `_.clone` supports */
  var cloneableClasses = {};
  cloneableClasses[funcClass] = false;
  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
  cloneableClasses[boolClass] = cloneableClasses[dateClass] =
  cloneableClasses[numberClass] = cloneableClasses[objectClass] =
  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;

  /** Used as an internal `_.debounce` options object */
  var debounceOptions = {
    'leading': false,
    'maxWait': 0,
    'trailing': false
  };

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    'configurable': false,
    'enumerable': false,
    'value': null,
    'writable': false
  };

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  /** Used to escape characters for inclusion in compiled string literals */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /** Used as a reference to the global object */
  var root = (objectTypes[typeof window] && window) || this;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports` */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = objectTypes[typeof global] && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The base implementation of `_.indexOf` without support for binary searches
   * or `fromIndex` constraints.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the matched value or `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * An implementation of `_.contains` for cache objects that mimics the return
   * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.
   *
   * @private
   * @param {Object} cache The cache object to inspect.
   * @param {*} value The value to search for.
   * @returns {number} Returns `0` if `value` is found, else `-1`.
   */
  function cacheIndexOf(cache, value) {
    var type = typeof value;
    cache = cache.cache;

    if (type == 'boolean' || value == null) {
      return cache[value] ? 0 : -1;
    }
    if (type != 'number' && type != 'string') {
      type = 'object';
    }
    var key = type == 'number' ? value : keyPrefix + value;
    cache = (cache = cache[type]) && cache[key];

    return type == 'object'
      ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)
      : (cache ? 0 : -1);
  }

  /**
   * Adds a given value to the corresponding cache object.
   *
   * @private
   * @param {*} value The value to add to the cache.
   */
  function cachePush(value) {
    var cache = this.cache,
        type = typeof value;

    if (type == 'boolean' || value == null) {
      cache[value] = true;
    } else {
      if (type != 'number' && type != 'string') {
        type = 'object';
      }
      var key = type == 'number' ? value : keyPrefix + value,
          typeCache = cache[type] || (cache[type] = {});

      if (type == 'object') {
        (typeCache[key] || (typeCache[key] = [])).push(value);
      } else {
        typeCache[key] = true;
      }
    }
  }

  /**
   * Used by `_.max` and `_.min` as the default callback when a given
   * collection is a string value.
   *
   * @private
   * @param {string} value The character to inspect.
   * @returns {number} Returns the code unit of given character.
   */
  function charAtCallback(value) {
    return value.charCodeAt(0);
  }

  /**
   * Used by `sortBy` to compare transformed `collection` elements, stable sorting
   * them in ascending order.
   *
   * @private
   * @param {Object} a The object to compare to `b`.
   * @param {Object} b The object to compare to `a`.
   * @returns {number} Returns the sort order indicator of `1` or `-1`.
   */
  function compareAscending(a, b) {
    var ac = a.criteria,
        bc = b.criteria,
        index = -1,
        length = ac.length;

    while (++index < length) {
      var value = ac[index],
          other = bc[index];

      if (value !== other) {
        if (value > other || typeof value == 'undefined') {
          return 1;
        }
        if (value < other || typeof other == 'undefined') {
          return -1;
        }
      }
    }
    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
    // that causes it, under certain circumstances, to return the same value for
    // `a` and `b`. See https://github.com/jashkenas/underscore/pull/1247
    //
    // This also ensures a stable sort in V8 and other engines.
    // See http://code.google.com/p/v8/issues/detail?id=90
    return a.index - b.index;
  }

  /**
   * Creates a cache object to optimize linear searches of large arrays.
   *
   * @private
   * @param {Array} [array=[]] The array to search.
   * @returns {null|Object} Returns the cache object or `null` if caching should not be used.
   */
  function createCache(array) {
    var index = -1,
        length = array.length,
        first = array[0],
        mid = array[(length / 2) | 0],
        last = array[length - 1];

    if (first && typeof first == 'object' &&
        mid && typeof mid == 'object' && last && typeof last == 'object') {
      return false;
    }
    var cache = getObject();
    cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

    var result = getObject();
    result.array = array;
    result.cache = cache;
    result.push = cachePush;

    while (++index < length) {
      result.push(array[index]);
    }
    return result;
  }

  /**
   * Used by `template` to escape characters for inclusion in compiled
   * string literals.
   *
   * @private
   * @param {string} match The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeStringChar(match) {
    return '\\' + stringEscapes[match];
  }

  /**
   * Gets an array from the array pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Array} The array from the pool.
   */
  function getArray() {
    return arrayPool.pop() || [];
  }

  /**
   * Gets an object from the object pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Object} The object from the pool.
   */
  function getObject() {
    return objectPool.pop() || {
      'array': null,
      'cache': null,
      'criteria': null,
      'false': false,
      'index': 0,
      'null': false,
      'number': null,
      'object': null,
      'push': null,
      'string': null,
      'true': false,
      'undefined': false,
      'value': null
    };
  }

  /**
   * Releases the given array back to the array pool.
   *
   * @private
   * @param {Array} [array] The array to release.
   */
  function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
      arrayPool.push(array);
    }
  }

  /**
   * Releases the given object back to the object pool.
   *
   * @private
   * @param {Object} [object] The object to release.
   */
  function releaseObject(object) {
    var cache = object.cache;
    if (cache) {
      releaseObject(cache);
    }
    object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
    if (objectPool.length < maxPoolSize) {
      objectPool.push(object);
    }
  }

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used instead of `Array#slice` to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|string} collection The collection to slice.
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Create a new `lodash` function using the given context object.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Object} [context=root] The context object.
   * @returns {Function} Returns the `lodash` function.
   */
  function runInContext(context) {
    // Avoid issues with some ES3 environments that attempt to use values, named
    // after built-in constructors like `Object`, for the creation of literals.
    // ES5 clears this up by stating that literals must use built-in constructors.
    // See http://es5.github.io/#x11.1.5.
    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;

    /** Native constructor references */
    var Array = context.Array,
        Boolean = context.Boolean,
        Date = context.Date,
        Function = context.Function,
        Math = context.Math,
        Number = context.Number,
        Object = context.Object,
        RegExp = context.RegExp,
        String = context.String,
        TypeError = context.TypeError;

    /**
     * Used for `Array` method references.
     *
     * Normally `Array.prototype` would suffice, however, using an array literal
     * avoids issues in Narwhal.
     */
    var arrayRef = [];

    /** Used for native method references */
    var objectProto = Object.prototype;

    /** Used to restore the original `_` reference in `noConflict` */
    var oldDash = context._;

    /** Used to resolve the internal [[Class]] of values */
    var toString = objectProto.toString;

    /** Used to detect if a method is native */
    var reNative = RegExp('^' +
      String(toString)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/toString| for [^\]]+/g, '.*?') + '$'
    );

    /** Native method shortcuts */
    var ceil = Math.ceil,
        clearTimeout = context.clearTimeout,
        floor = Math.floor,
        fnToString = Function.prototype.toString,
        getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
        hasOwnProperty = objectProto.hasOwnProperty,
        push = arrayRef.push,
        setTimeout = context.setTimeout,
        splice = arrayRef.splice,
        unshift = arrayRef.unshift;

    /** Used to set meta data on functions */
    var defineProperty = (function() {
      // IE 8 only accepts DOM elements
      try {
        var o = {},
            func = isNative(func = Object.defineProperty) && func,
            result = func(o, o, o) && func;
      } catch(e) { }
      return result;
    }());

    /* Native method shortcuts for methods with the same name as other `lodash` methods */
    var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,
        nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
        nativeIsFinite = context.isFinite,
        nativeIsNaN = context.isNaN,
        nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,
        nativeMax = Math.max,
        nativeMin = Math.min,
        nativeParseInt = context.parseInt,
        nativeRandom = Math.random;

    /** Used to lookup a built-in constructor by [[Class]] */
    var ctorByClass = {};
    ctorByClass[arrayClass] = Array;
    ctorByClass[boolClass] = Boolean;
    ctorByClass[dateClass] = Date;
    ctorByClass[funcClass] = Function;
    ctorByClass[objectClass] = Object;
    ctorByClass[numberClass] = Number;
    ctorByClass[regexpClass] = RegExp;
    ctorByClass[stringClass] = String;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object which wraps the given value to enable intuitive
     * method chaining.
     *
     * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
     * and `unshift`
     *
     * Chaining is supported in custom builds as long as the `value` method is
     * implicitly or explicitly included in the build.
     *
     * The chainable wrapper functions are:
     * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
     * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,
     * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,
     * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
     * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
     * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
     * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,
     * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,
     * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,
     * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,
     * and `zip`
     *
     * The non-chainable wrapper functions are:
     * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,
     * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,
     * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
     * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,
     * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,
     * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,
     * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,
     * `template`, `unescape`, `uniqueId`, and `value`
     *
     * The wrapper functions `first` and `last` return wrapped values when `n` is
     * provided, otherwise they return unwrapped values.
     *
     * Explicit chaining can be enabled by using the `_.chain` method.
     *
     * @name _
     * @constructor
     * @category Chaining
     * @param {*} value The value to wrap in a `lodash` instance.
     * @returns {Object} Returns a `lodash` instance.
     * @example
     *
     * var wrapped = _([1, 2, 3]);
     *
     * // returns an unwrapped value
     * wrapped.reduce(function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * // returns a wrapped value
     * var squares = wrapped.map(function(num) {
     *   return num * num;
     * });
     *
     * _.isArray(squares);
     * // => false
     *
     * _.isArray(squares.value());
     * // => true
     */
    function lodash(value) {
      // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor
      return (value && typeof value == 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__'))
       ? value
       : new lodashWrapper(value);
    }

    /**
     * A fast path for creating `lodash` wrapper objects.
     *
     * @private
     * @param {*} value The value to wrap in a `lodash` instance.
     * @param {boolean} chainAll A flag to enable chaining for all methods
     * @returns {Object} Returns a `lodash` instance.
     */
    function lodashWrapper(value, chainAll) {
      this.__chain__ = !!chainAll;
      this.__wrapped__ = value;
    }
    // ensure `new lodashWrapper` is an instance of `lodash`
    lodashWrapper.prototype = lodash.prototype;

    /**
     * An object used to flag environments features.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    var support = lodash.support = {};

    /**
     * Detect if functions can be decompiled by `Function#toString`
     * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext);

    /**
     * Detect if `Function#name` is supported (all but IE).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcNames = typeof Function.name == 'string';

    /**
     * By default, the template delimiters used by Lo-Dash are similar to those in
     * embedded Ruby (ERB). Change the following template settings to use alternative
     * delimiters.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    lodash.templateSettings = {

      /**
       * Used to detect `data` property values to be HTML-escaped.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'escape': /<%-([\s\S]+?)%>/g,

      /**
       * Used to detect code to be evaluated.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'evaluate': /<%([\s\S]+?)%>/g,

      /**
       * Used to detect `data` property values to inject.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'interpolate': reInterpolate,

      /**
       * Used to reference the data object in the template text.
       *
       * @memberOf _.templateSettings
       * @type string
       */
      'variable': '',

      /**
       * Used to import variables into the compiled template.
       *
       * @memberOf _.templateSettings
       * @type Object
       */
      'imports': {

        /**
         * A reference to the `lodash` function.
         *
         * @memberOf _.templateSettings.imports
         * @type Function
         */
        '_': lodash
      }
    };

    /*--------------------------------------------------------------------------*/

    /**
     * The base implementation of `_.bind` that creates the bound function and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new bound function.
     */
    function baseBind(bindData) {
      var func = bindData[0],
          partialArgs = bindData[2],
          thisArg = bindData[4];

      function bound() {
        // `Function#bind` spec
        // http://es5.github.io/#x15.3.4.5
        if (partialArgs) {
          // avoid `arguments` object deoptimizations by using `slice` instead
          // of `Array.prototype.slice.call` and not assigning `arguments` to a
          // variable as a ternary expression
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        // mimic the constructor's `return` behavior
        // http://es5.github.io/#x13.2.2
        if (this instanceof bound) {
          // ensure `new bound` is an instance of `func`
          var thisBinding = baseCreate(func.prototype),
              result = func.apply(thisBinding, args || arguments);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisArg, args || arguments);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.clone` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates clones with source counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, isDeep, callback, stackA, stackB) {
      if (callback) {
        var result = callback(value);
        if (typeof result != 'undefined') {
          return result;
        }
      }
      // inspect [[Class]]
      var isObj = isObject(value);
      if (isObj) {
        var className = toString.call(value);
        if (!cloneableClasses[className]) {
          return value;
        }
        var ctor = ctorByClass[className];
        switch (className) {
          case boolClass:
          case dateClass:
            return new ctor(+value);

          case numberClass:
          case stringClass:
            return new ctor(value);

          case regexpClass:
            result = ctor(value.source, reFlags.exec(value));
            result.lastIndex = value.lastIndex;
            return result;
        }
      } else {
        return value;
      }
      var isArr = isArray(value);
      if (isDeep) {
        // check for circular references and return corresponding clone
        var initedStack = !stackA;
        stackA || (stackA = getArray());
        stackB || (stackB = getArray());

        var length = stackA.length;
        while (length--) {
          if (stackA[length] == value) {
            return stackB[length];
          }
        }
        result = isArr ? ctor(value.length) : {};
      }
      else {
        result = isArr ? slice(value) : assign({}, value);
      }
      // add array properties assigned by `RegExp#exec`
      if (isArr) {
        if (hasOwnProperty.call(value, 'index')) {
          result.index = value.index;
        }
        if (hasOwnProperty.call(value, 'input')) {
          result.input = value.input;
        }
      }
      // exit for shallow clone
      if (!isDeep) {
        return result;
      }
      // add the source value to the stack of traversed objects
      // and associate it with its clone
      stackA.push(value);
      stackB.push(result);

      // recursively populate clone (susceptible to call stack limits)
      (isArr ? forEach : forOwn)(value, function(objValue, key) {
        result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);
      });

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} prototype The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    function baseCreate(prototype, properties) {
      return isObject(prototype) ? nativeCreate(prototype) : {};
    }
    // fallback for browsers without `Object.create`
    if (!nativeCreate) {
      baseCreate = (function() {
        function Object() {}
        return function(prototype) {
          if (isObject(prototype)) {
            Object.prototype = prototype;
            var result = new Object;
            Object.prototype = null;
          }
          return result || context.Object();
        };
      }());
    }

    /**
     * The base implementation of `_.createCallback` without support for creating
     * "_.pluck" or "_.where" style callbacks.
     *
     * @private
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     */
    function baseCreateCallback(func, thisArg, argCount) {
      if (typeof func != 'function') {
        return identity;
      }
      // exit early for no `thisArg` or already bound by `Function#bind`
      if (typeof thisArg == 'undefined' || !('prototype' in func)) {
        return func;
      }
      var bindData = func.__bindData__;
      if (typeof bindData == 'undefined') {
        if (support.funcNames) {
          bindData = !func.name;
        }
        bindData = bindData || !support.funcDecomp;
        if (!bindData) {
          var source = fnToString.call(func);
          if (!support.funcNames) {
            bindData = !reFuncName.test(source);
          }
          if (!bindData) {
            // checks if `func` references the `this` keyword and stores the result
            bindData = reThis.test(source);
            setBindData(func, bindData);
          }
        }
      }
      // exit early if there are no `this` references or `func` is bound
      if (bindData === false || (bindData !== true && bindData[1] & 1)) {
        return func;
      }
      switch (argCount) {
        case 1: return function(value) {
          return func.call(thisArg, value);
        };
        case 2: return function(a, b) {
          return func.call(thisArg, a, b);
        };
        case 3: return function(value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
        case 4: return function(accumulator, value, index, collection) {
          return func.call(thisArg, accumulator, value, index, collection);
        };
      }
      return bind(func, thisArg);
    }

    /**
     * The base implementation of `createWrapper` that creates the wrapper and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new function.
     */
    function baseCreateWrapper(bindData) {
      var func = bindData[0],
          bitmask = bindData[1],
          partialArgs = bindData[2],
          partialRightArgs = bindData[3],
          thisArg = bindData[4],
          arity = bindData[5];

      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          key = func;

      function bound() {
        var thisBinding = isBind ? thisArg : this;
        if (partialArgs) {
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        if (partialRightArgs || isCurry) {
          args || (args = slice(arguments));
          if (partialRightArgs) {
            push.apply(args, partialRightArgs);
          }
          if (isCurry && args.length < arity) {
            bitmask |= 16 & ~32;
            return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
          }
        }
        args || (args = arguments);
        if (isBindKey) {
          func = thisBinding[key];
        }
        if (this instanceof bound) {
          thisBinding = baseCreate(func.prototype);
          var result = func.apply(thisBinding, args);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisBinding, args);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.difference` that accepts a single array
     * of values to exclude.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {Array} [values] The array of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     */
    function baseDifference(array, values) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          isLarge = length >= largeArraySize && indexOf === baseIndexOf,
          result = [];

      if (isLarge) {
        var cache = createCache(values);
        if (cache) {
          indexOf = cacheIndexOf;
          values = cache;
        } else {
          isLarge = false;
        }
      }
      while (++index < length) {
        var value = array[index];
        if (indexOf(values, value) < 0) {
          result.push(value);
        }
      }
      if (isLarge) {
        releaseObject(values);
      }
      return result;
    }

    /**
     * The base implementation of `_.flatten` without support for callback
     * shorthands or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
     * @param {number} [fromIndex=0] The index to start from.
     * @returns {Array} Returns a new flattened array.
     */
    function baseFlatten(array, isShallow, isStrict, fromIndex) {
      var index = (fromIndex || 0) - 1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];

        if (value && typeof value == 'object' && typeof value.length == 'number'
            && (isArray(value) || isArguments(value))) {
          // recursively flatten arrays (susceptible to call stack limits)
          if (!isShallow) {
            value = baseFlatten(value, isShallow, isStrict);
          }
          var valIndex = -1,
              valLength = value.length,
              resIndex = result.length;

          result.length += valLength;
          while (++valIndex < valLength) {
            result[resIndex++] = value[valIndex];
          }
        } else if (!isStrict) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.isEqual`, without support for `thisArg` binding,
     * that allows partial "_.where" style comparisons.
     *
     * @private
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
     * @param {Array} [stackA=[]] Tracks traversed `a` objects.
     * @param {Array} [stackB=[]] Tracks traversed `b` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
      // used to indicate that when comparing objects, `a` has at least the properties of `b`
      if (callback) {
        var result = callback(a, b);
        if (typeof result != 'undefined') {
          return !!result;
        }
      }
      // exit early for identical values
      if (a === b) {
        // treat `+0` vs. `-0` as not equal
        return a !== 0 || (1 / a == 1 / b);
      }
      var type = typeof a,
          otherType = typeof b;

      // exit early for unlike primitive values
      if (a === a &&
          !(a && objectTypes[type]) &&
          !(b && objectTypes[otherType])) {
        return false;
      }
      // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
      // http://es5.github.io/#x15.3.4.4
      if (a == null || b == null) {
        return a === b;
      }
      // compare [[Class]] names
      var className = toString.call(a),
          otherClass = toString.call(b);

      if (className == argsClass) {
        className = objectClass;
      }
      if (otherClass == argsClass) {
        otherClass = objectClass;
      }
      if (className != otherClass) {
        return false;
      }
      switch (className) {
        case boolClass:
        case dateClass:
          // coerce dates and booleans to numbers, dates to milliseconds and booleans
          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
          return +a == +b;

        case numberClass:
          // treat `NaN` vs. `NaN` as equal
          return (a != +a)
            ? b != +b
            // but treat `+0` vs. `-0` as not equal
            : (a == 0 ? (1 / a == 1 / b) : a == +b);

        case regexpClass:
        case stringClass:
          // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
          // treat string primitives and their corresponding object instances as equal
          return a == String(b);
      }
      var isArr = className == arrayClass;
      if (!isArr) {
        // unwrap any `lodash` wrapped values
        var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
            bWrapped = hasOwnProperty.call(b, '__wrapped__');

        if (aWrapped || bWrapped) {
          return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
        }
        // exit for functions and DOM nodes
        if (className != objectClass) {
          return false;
        }
        // in older versions of Opera, `arguments` objects have `Array` constructors
        var ctorA = a.constructor,
            ctorB = b.constructor;

        // non `Object` object instances with different constructors are not equal
        if (ctorA != ctorB &&
              !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
              ('constructor' in a && 'constructor' in b)
            ) {
          return false;
        }
      }
      // assume cyclic structures are equal
      // the algorithm for detecting cyclic structures is adapted from ES 5.1
      // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
      var initedStack = !stackA;
      stackA || (stackA = getArray());
      stackB || (stackB = getArray());

      var length = stackA.length;
      while (length--) {
        if (stackA[length] == a) {
          return stackB[length] == b;
        }
      }
      var size = 0;
      result = true;

      // add `a` and `b` to the stack of traversed objects
      stackA.push(a);
      stackB.push(b);

      // recursively compare objects and arrays (susceptible to call stack limits)
      if (isArr) {
        // compare lengths to determine if a deep comparison is necessary
        length = a.length;
        size = b.length;
        result = size == length;

        if (result || isWhere) {
          // deep compare the contents, ignoring non-numeric properties
          while (size--) {
            var index = length,
                value = b[size];

            if (isWhere) {
              while (index--) {
                if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
                  break;
                }
              }
            } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
              break;
            }
          }
        }
      }
      else {
        // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
        // which, in this case, is more costly
        forIn(b, function(value, key, b) {
          if (hasOwnProperty.call(b, key)) {
            // count the number of properties.
            size++;
            // deep compare each property value.
            return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
          }
        });

        if (result && !isWhere) {
          // ensure both objects have the same number of properties
          forIn(a, function(value, key, a) {
            if (hasOwnProperty.call(a, key)) {
              // `size` will be `-1` if `a` has more properties than `b`
              return (result = --size > -1);
            }
          });
        }
      }
      stackA.pop();
      stackB.pop();

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.merge` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates values with source counterparts.
     */
    function baseMerge(object, source, callback, stackA, stackB) {
      (isArray(source) ? forEach : forOwn)(source, function(source, key) {
        var found,
            isArr,
            result = source,
            value = object[key];

        if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
          // avoid merging previously merged cyclic sources
          var stackLength = stackA.length;
          while (stackLength--) {
            if ((found = stackA[stackLength] == source)) {
              value = stackB[stackLength];
              break;
            }
          }
          if (!found) {
            var isShallow;
            if (callback) {
              result = callback(value, source);
              if ((isShallow = typeof result != 'undefined')) {
                value = result;
              }
            }
            if (!isShallow) {
              value = isArr
                ? (isArray(value) ? value : [])
                : (isPlainObject(value) ? value : {});
            }
            // add `source` and associated `value` to the stack of traversed objects
            stackA.push(source);
            stackB.push(value);

            // recursively merge objects and arrays (susceptible to call stack limits)
            if (!isShallow) {
              baseMerge(value, source, callback, stackA, stackB);
            }
          }
        }
        else {
          if (callback) {
            result = callback(value, source);
            if (typeof result == 'undefined') {
              result = source;
            }
          }
          if (typeof result != 'undefined') {
            value = result;
          }
        }
        object[key] = value;
      });
    }

    /**
     * The base implementation of `_.random` without argument juggling or support
     * for returning floating-point numbers.
     *
     * @private
     * @param {number} min The minimum possible value.
     * @param {number} max The maximum possible value.
     * @returns {number} Returns a random number.
     */
    function baseRandom(min, max) {
      return min + floor(nativeRandom() * (max - min + 1));
    }

    /**
     * The base implementation of `_.uniq` without support for callback shorthands
     * or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function} [callback] The function called per iteration.
     * @returns {Array} Returns a duplicate-value-free array.
     */
    function baseUniq(array, isSorted, callback) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          result = [];

      var isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf,
          seen = (callback || isLarge) ? getArray() : result;

      if (isLarge) {
        var cache = createCache(seen);
        indexOf = cacheIndexOf;
        seen = cache;
      }
      while (++index < length) {
        var value = array[index],
            computed = callback ? callback(value, index, array) : value;

        if (isSorted
              ? !index || seen[seen.length - 1] !== computed
              : indexOf(seen, computed) < 0
            ) {
          if (callback || isLarge) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      if (isLarge) {
        releaseArray(seen.array);
        releaseObject(seen);
      } else if (callback) {
        releaseArray(seen);
      }
      return result;
    }

    /**
     * Creates a function that aggregates a collection, creating an object composed
     * of keys generated from the results of running each element of the collection
     * through a callback. The given `setter` function sets the keys and values
     * of the composed object.
     *
     * @private
     * @param {Function} setter The setter function.
     * @returns {Function} Returns the new aggregator function.
     */
    function createAggregator(setter) {
      return function(collection, callback, thisArg) {
        var result = {};
        callback = lodash.createCallback(callback, thisArg, 3);

        var index = -1,
            length = collection ? collection.length : 0;

        if (typeof length == 'number') {
          while (++index < length) {
            var value = collection[index];
            setter(result, value, callback(value, index, collection), collection);
          }
        } else {
          forOwn(collection, function(value, key, collection) {
            setter(result, value, callback(value, key, collection), collection);
          });
        }
        return result;
      };
    }

    /**
     * Creates a function that, when called, either curries or invokes `func`
     * with an optional `this` binding and partially applied arguments.
     *
     * @private
     * @param {Function|string} func The function or method name to reference.
     * @param {number} bitmask The bitmask of method flags to compose.
     *  The bitmask may be composed of the following flags:
     *  1 - `_.bind`
     *  2 - `_.bindKey`
     *  4 - `_.curry`
     *  8 - `_.curry` (bound)
     *  16 - `_.partial`
     *  32 - `_.partialRight`
     * @param {Array} [partialArgs] An array of arguments to prepend to those
     *  provided to the new function.
     * @param {Array} [partialRightArgs] An array of arguments to append to those
     *  provided to the new function.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new function.
     */
    function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          isPartial = bitmask & 16,
          isPartialRight = bitmask & 32;

      if (!isBindKey && !isFunction(func)) {
        throw new TypeError;
      }
      if (isPartial && !partialArgs.length) {
        bitmask &= ~16;
        isPartial = partialArgs = false;
      }
      if (isPartialRight && !partialRightArgs.length) {
        bitmask &= ~32;
        isPartialRight = partialRightArgs = false;
      }
      var bindData = func && func.__bindData__;
      if (bindData && bindData !== true) {
        // clone `bindData`
        bindData = slice(bindData);
        if (bindData[2]) {
          bindData[2] = slice(bindData[2]);
        }
        if (bindData[3]) {
          bindData[3] = slice(bindData[3]);
        }
        // set `thisBinding` is not previously bound
        if (isBind && !(bindData[1] & 1)) {
          bindData[4] = thisArg;
        }
        // set if previously bound but not currently (subsequent curried functions)
        if (!isBind && bindData[1] & 1) {
          bitmask |= 8;
        }
        // set curried arity if not yet set
        if (isCurry && !(bindData[1] & 4)) {
          bindData[5] = arity;
        }
        // append partial left arguments
        if (isPartial) {
          push.apply(bindData[2] || (bindData[2] = []), partialArgs);
        }
        // append partial right arguments
        if (isPartialRight) {
          unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
        }
        // merge flags
        bindData[1] |= bitmask;
        return createWrapper.apply(null, bindData);
      }
      // fast path for `_.bind`
      var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
      return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
    }

    /**
     * Used by `escape` to convert characters to HTML entities.
     *
     * @private
     * @param {string} match The matched character to escape.
     * @returns {string} Returns the escaped character.
     */
    function escapeHtmlChar(match) {
      return htmlEscapes[match];
    }

    /**
     * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
     * customized, this method returns the custom method, otherwise it returns
     * the `baseIndexOf` function.
     *
     * @private
     * @returns {Function} Returns the "indexOf" function.
     */
    function getIndexOf() {
      var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;
      return result;
    }

    /**
     * Checks if `value` is a native function.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
     */
    function isNative(value) {
      return typeof value == 'function' && reNative.test(value);
    }

    /**
     * Sets `this` binding data on a given function.
     *
     * @private
     * @param {Function} func The function to set data on.
     * @param {Array} value The data array to set.
     */
    var setBindData = !defineProperty ? noop : function(func, value) {
      descriptor.value = value;
      defineProperty(func, '__bindData__', descriptor);
    };

    /**
     * A fallback implementation of `isPlainObject` which checks if a given value
     * is an object created by the `Object` constructor, assuming objects created
     * by the `Object` constructor have no inherited enumerable properties and that
     * there are no `Object.prototype` extensions.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     */
    function shimIsPlainObject(value) {
      var ctor,
          result;

      // avoid non Object objects, `arguments` objects, and DOM elements
      if (!(value && toString.call(value) == objectClass) ||
          (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor))) {
        return false;
      }
      // In most environments an object's own properties are iterated before
      // its inherited properties. If the last iterated property is an object's
      // own property then there are no inherited enumerable properties.
      forIn(value, function(value, key) {
        result = key;
      });
      return typeof result == 'undefined' || hasOwnProperty.call(value, result);
    }

    /**
     * Used by `unescape` to convert HTML entities to characters.
     *
     * @private
     * @param {string} match The matched character to unescape.
     * @returns {string} Returns the unescaped character.
     */
    function unescapeHtmlChar(match) {
      return htmlUnescapes[match];
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Checks if `value` is an `arguments` object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
     * @example
     *
     * (function() { return _.isArguments(arguments); })(1, 2, 3);
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == argsClass || false;
    }

    /**
     * Checks if `value` is an array.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
     * @example
     *
     * (function() { return _.isArray(arguments); })();
     * // => false
     *
     * _.isArray([1, 2, 3]);
     * // => true
     */
    var isArray = nativeIsArray || function(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == arrayClass || false;
    };

    /**
     * A fallback implementation of `Object.keys` which produces an array of the
     * given object's own enumerable property names.
     *
     * @private
     * @type Function
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     */
    var shimKeys = function(object) {
      var index, iterable = object, result = [];
      if (!iterable) return result;
      if (!(objectTypes[typeof object])) return result;
        for (index in iterable) {
          if (hasOwnProperty.call(iterable, index)) {
            result.push(index);
          }
        }
      return result
    };

    /**
     * Creates an array composed of the own enumerable property names of an object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     * @example
     *
     * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
     * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
     */
    var keys = !nativeKeys ? shimKeys : function(object) {
      if (!isObject(object)) {
        return [];
      }
      return nativeKeys(object);
    };

    /**
     * Used to convert characters to HTML entities:
     *
     * Though the `>` character is escaped for symmetry, characters like `>` and `/`
     * don't require escaping in HTML and have no special meaning unless they're part
     * of a tag or an unquoted attribute value.
     * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
     */
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    /** Used to convert HTML entities to characters */
    var htmlUnescapes = invert(htmlEscapes);

    /** Used to match HTML entities and HTML characters */
    var reEscapedHtml = RegExp('(' + keys(htmlUnescapes).join('|') + ')', 'g'),
        reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');

    /*--------------------------------------------------------------------------*/

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object. Subsequent sources will overwrite property assignments of previous
     * sources. If a callback is provided it will be executed to produce the
     * assigned values. The callback is bound to `thisArg` and invoked with two
     * arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @type Function
     * @alias extend
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize assigning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
     * // => { 'name': 'fred', 'employer': 'slate' }
     *
     * var defaults = _.partialRight(_.assign, function(a, b) {
     *   return typeof a == 'undefined' ? b : a;
     * });
     *
     * var object = { 'name': 'barney' };
     * defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var assign = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {
        var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);
      } else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {
        callback = args[--argsLength];
      }
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
        }
        }
      }
      return result
    };

    /**
     * Creates a clone of `value`. If `isDeep` is `true` nested objects will also
     * be cloned, otherwise they will be assigned by reference. If a callback
     * is provided it will be executed to produce the cloned values. If the
     * callback returns `undefined` cloning will be handled by the method instead.
     * The callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var shallow = _.clone(characters);
     * shallow[0] === characters[0];
     * // => true
     *
     * var deep = _.clone(characters, true);
     * deep[0] === characters[0];
     * // => false
     *
     * _.mixin({
     *   'clone': _.partialRight(_.clone, function(value) {
     *     return _.isElement(value) ? value.cloneNode(false) : undefined;
     *   })
     * });
     *
     * var clone = _.clone(document.body);
     * clone.childNodes.length;
     * // => 0
     */
    function clone(value, isDeep, callback, thisArg) {
      // allows working with "Collections" methods without using their `index`
      // and `collection` arguments for `isDeep` and `callback`
      if (typeof isDeep != 'boolean' && isDeep != null) {
        thisArg = callback;
        callback = isDeep;
        isDeep = false;
      }
      return baseClone(value, isDeep, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates a deep clone of `value`. If a callback is provided it will be
     * executed to produce the cloned values. If the callback returns `undefined`
     * cloning will be handled by the method instead. The callback is bound to
     * `thisArg` and invoked with one argument; (value).
     *
     * Note: This method is loosely based on the structured clone algorithm. Functions
     * and DOM nodes are **not** cloned. The enumerable properties of `arguments` objects and
     * objects created by constructors other than `Object` are cloned to plain `Object` objects.
     * See http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the deep cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var deep = _.cloneDeep(characters);
     * deep[0] === characters[0];
     * // => false
     *
     * var view = {
     *   'label': 'docs',
     *   'node': element
     * };
     *
     * var clone = _.cloneDeep(view, function(value) {
     *   return _.isElement(value) ? value.cloneNode(true) : undefined;
     * });
     *
     * clone.node == view.node;
     * // => false
     */
    function cloneDeep(value, callback, thisArg) {
      return baseClone(value, true, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates an object that inherits from the given `prototype` object. If a
     * `properties` object is provided its own enumerable properties are assigned
     * to the created object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} prototype The object to inherit from.
     * @param {Object} [properties] The properties to assign to the object.
     * @returns {Object} Returns the new object.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * function Circle() {
     *   Shape.call(this);
     * }
     *
     * Circle.prototype = _.create(Shape.prototype, { 'constructor': Circle });
     *
     * var circle = new Circle;
     * circle instanceof Circle;
     * // => true
     *
     * circle instanceof Shape;
     * // => true
     */
    function create(prototype, properties) {
      var result = baseCreate(prototype);
      return properties ? assign(result, properties) : result;
    }

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object for all destination properties that resolve to `undefined`. Once a
     * property is set, additional defaults of the same property will be ignored.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param- {Object} [guard] Allows working with `_.reduce` without using its
     *  `key` and `object` arguments as sources.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var object = { 'name': 'barney' };
     * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var defaults = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (typeof result[index] == 'undefined') result[index] = iterable[index];
        }
        }
      }
      return result
    };

    /**
     * This method is like `_.findIndex` except that it returns the key of the
     * first element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': false },
     *   'fred': {    'age': 40, 'blocked': true },
     *   'pebbles': { 'age': 1,  'blocked': false }
     * };
     *
     * _.findKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => 'barney' (property order is not guaranteed across environments)
     *
     * // using "_.where" callback shorthand
     * _.findKey(characters, { 'age': 1 });
     * // => 'pebbles'
     *
     * // using "_.pluck" callback shorthand
     * _.findKey(characters, 'blocked');
     * // => 'fred'
     */
    function findKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwn(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * This method is like `_.findKey` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': true },
     *   'fred': {    'age': 40, 'blocked': false },
     *   'pebbles': { 'age': 1,  'blocked': true }
     * };
     *
     * _.findLastKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => returns `pebbles`, assuming `_.findKey` returns `barney`
     *
     * // using "_.where" callback shorthand
     * _.findLastKey(characters, { 'age': 40 });
     * // => 'fred'
     *
     * // using "_.pluck" callback shorthand
     * _.findLastKey(characters, 'blocked');
     * // => 'pebbles'
     */
    function findLastKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwnRight(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over own and inherited enumerable properties of an object,
     * executing the callback for each property. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, key, object). Callbacks may exit
     * iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forIn(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
     */
    var forIn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        for (index in iterable) {
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forIn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forInRight(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'move', 'y', and 'x' assuming `_.forIn ` logs 'x', 'y', and 'move'
     */
    function forInRight(object, callback, thisArg) {
      var pairs = [];

      forIn(object, function(value, key) {
        pairs.push(key, value);
      });

      var length = pairs.length;
      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(pairs[length--], pairs[length], object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Iterates over own enumerable properties of an object, executing the callback
     * for each property. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, key, object). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
     */
    var forOwn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forOwn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwnRight({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs 'length', '1', and '0' assuming `_.forOwn` logs '0', '1', and 'length'
     */
    function forOwnRight(object, callback, thisArg) {
      var props = keys(object),
          length = props.length;

      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        var key = props[length];
        if (callback(object[key], key, object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Creates a sorted array of property names of all enumerable properties,
     * own and inherited, of `object` that have function values.
     *
     * @static
     * @memberOf _
     * @alias methods
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names that have function values.
     * @example
     *
     * _.functions(_);
     * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
     */
    function functions(object) {
      var result = [];
      forIn(object, function(value, key) {
        if (isFunction(value)) {
          result.push(key);
        }
      });
      return result.sort();
    }

    /**
     * Checks if the specified property name exists as a direct property of `object`,
     * instead of an inherited property.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to check.
     * @returns {boolean} Returns `true` if key is a direct property, else `false`.
     * @example
     *
     * _.has({ 'a': 1, 'b': 2, 'c': 3 }, 'b');
     * // => true
     */
    function has(object, key) {
      return object ? hasOwnProperty.call(object, key) : false;
    }

    /**
     * Creates an object composed of the inverted keys and values of the given object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to invert.
     * @returns {Object} Returns the created inverted object.
     * @example
     *
     * _.invert({ 'first': 'fred', 'second': 'barney' });
     * // => { 'fred': 'first', 'barney': 'second' }
     */
    function invert(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = {};

      while (++index < length) {
        var key = props[index];
        result[object[key]] = key;
      }
      return result;
    }

    /**
     * Checks if `value` is a boolean value.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a boolean value, else `false`.
     * @example
     *
     * _.isBoolean(null);
     * // => false
     */
    function isBoolean(value) {
      return value === true || value === false ||
        value && typeof value == 'object' && toString.call(value) == boolClass || false;
    }

    /**
     * Checks if `value` is a date.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a date, else `false`.
     * @example
     *
     * _.isDate(new Date);
     * // => true
     */
    function isDate(value) {
      return value && typeof value == 'object' && toString.call(value) == dateClass || false;
    }

    /**
     * Checks if `value` is a DOM element.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a DOM element, else `false`.
     * @example
     *
     * _.isElement(document.body);
     * // => true
     */
    function isElement(value) {
      return value && value.nodeType === 1 || false;
    }

    /**
     * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
     * length of `0` and objects with no own enumerable properties are considered
     * "empty".
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object|string} value The value to inspect.
     * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
     * @example
     *
     * _.isEmpty([1, 2, 3]);
     * // => false
     *
     * _.isEmpty({});
     * // => true
     *
     * _.isEmpty('');
     * // => true
     */
    function isEmpty(value) {
      var result = true;
      if (!value) {
        return result;
      }
      var className = toString.call(value),
          length = value.length;

      if ((className == arrayClass || className == stringClass || className == argsClass ) ||
          (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
        return !length;
      }
      forOwn(value, function() {
        return (result = false);
      });
      return result;
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent to each other. If a callback is provided it will be executed
     * to compare values. If the callback returns `undefined` comparisons will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (a, b).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var copy = { 'name': 'fred' };
     *
     * object == copy;
     * // => false
     *
     * _.isEqual(object, copy);
     * // => true
     *
     * var words = ['hello', 'goodbye'];
     * var otherWords = ['hi', 'goodbye'];
     *
     * _.isEqual(words, otherWords, function(a, b) {
     *   var reGreet = /^(?:hello|hi)$/i,
     *       aGreet = _.isString(a) && reGreet.test(a),
     *       bGreet = _.isString(b) && reGreet.test(b);
     *
     *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;
     * });
     * // => true
     */
    function isEqual(a, b, callback, thisArg) {
      return baseIsEqual(a, b, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 2));
    }

    /**
     * Checks if `value` is, or can be coerced to, a finite number.
     *
     * Note: This is not the same as native `isFinite` which will return true for
     * booleans and empty strings. See http://es5.github.io/#x15.1.2.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is finite, else `false`.
     * @example
     *
     * _.isFinite(-101);
     * // => true
     *
     * _.isFinite('10');
     * // => true
     *
     * _.isFinite(true);
     * // => false
     *
     * _.isFinite('');
     * // => false
     *
     * _.isFinite(Infinity);
     * // => false
     */
    function isFinite(value) {
      return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
    }

    /**
     * Checks if `value` is a function.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     */
    function isFunction(value) {
      return typeof value == 'function';
    }

    /**
     * Checks if `value` is the language type of Object.
     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(1);
     * // => false
     */
    function isObject(value) {
      // check if the value is the ECMAScript language type of Object
      // http://es5.github.io/#x8
      // and avoid a V8 bug
      // http://code.google.com/p/v8/issues/detail?id=2291
      return !!(value && objectTypes[typeof value]);
    }

    /**
     * Checks if `value` is `NaN`.
     *
     * Note: This is not the same as native `isNaN` which will return `true` for
     * `undefined` and other non-numeric values. See http://es5.github.io/#x15.1.2.4.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `NaN`, else `false`.
     * @example
     *
     * _.isNaN(NaN);
     * // => true
     *
     * _.isNaN(new Number(NaN));
     * // => true
     *
     * isNaN(undefined);
     * // => true
     *
     * _.isNaN(undefined);
     * // => false
     */
    function isNaN(value) {
      // `NaN` as a primitive is the only value that is not equal to itself
      // (perform the [[Class]] check first to avoid errors with some host objects in IE)
      return isNumber(value) && value != +value;
    }

    /**
     * Checks if `value` is `null`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `null`, else `false`.
     * @example
     *
     * _.isNull(null);
     * // => true
     *
     * _.isNull(undefined);
     * // => false
     */
    function isNull(value) {
      return value === null;
    }

    /**
     * Checks if `value` is a number.
     *
     * Note: `NaN` is considered a number. See http://es5.github.io/#x8.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a number, else `false`.
     * @example
     *
     * _.isNumber(8.4 * 5);
     * // => true
     */
    function isNumber(value) {
      return typeof value == 'number' ||
        value && typeof value == 'object' && toString.call(value) == numberClass || false;
    }

    /**
     * Checks if `value` is an object created by the `Object` constructor.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * _.isPlainObject(new Shape);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     */
    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
      if (!(value && toString.call(value) == objectClass)) {
        return false;
      }
      var valueOf = value.valueOf,
          objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

      return objProto
        ? (value == objProto || getPrototypeOf(value) == objProto)
        : shimIsPlainObject(value);
    };

    /**
     * Checks if `value` is a regular expression.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a regular expression, else `false`.
     * @example
     *
     * _.isRegExp(/fred/);
     * // => true
     */
    function isRegExp(value) {
      return value && typeof value == 'object' && toString.call(value) == regexpClass || false;
    }

    /**
     * Checks if `value` is a string.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
     * @example
     *
     * _.isString('fred');
     * // => true
     */
    function isString(value) {
      return typeof value == 'string' ||
        value && typeof value == 'object' && toString.call(value) == stringClass || false;
    }

    /**
     * Checks if `value` is `undefined`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.
     * @example
     *
     * _.isUndefined(void 0);
     * // => true
     */
    function isUndefined(value) {
      return typeof value == 'undefined';
    }

    /**
     * Creates an object with the same keys as `object` and values generated by
     * running each own enumerable property of `object` through the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new object with values of the results of each `callback` execution.
     * @example
     *
     * _.mapValues({ 'a': 1, 'b': 2, 'c': 3} , function(num) { return num * 3; });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     *
     * var characters = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // using "_.pluck" callback shorthand
     * _.mapValues(characters, 'age');
     * // => { 'fred': 40, 'pebbles': 1 }
     */
    function mapValues(object, callback, thisArg) {
      var result = {};
      callback = lodash.createCallback(callback, thisArg, 3);

      forOwn(object, function(value, key, object) {
        result[key] = callback(value, key, object);
      });
      return result;
    }

    /**
     * Recursively merges own enumerable properties of the source object(s), that
     * don't resolve to `undefined` into the destination object. Subsequent sources
     * will overwrite property assignments of previous sources. If a callback is
     * provided it will be executed to produce the merged values of the destination
     * and source properties. If the callback returns `undefined` merging will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var names = {
     *   'characters': [
     *     { 'name': 'barney' },
     *     { 'name': 'fred' }
     *   ]
     * };
     *
     * var ages = {
     *   'characters': [
     *     { 'age': 36 },
     *     { 'age': 40 }
     *   ]
     * };
     *
     * _.merge(names, ages);
     * // => { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
     *
     * var food = {
     *   'fruits': ['apple'],
     *   'vegetables': ['beet']
     * };
     *
     * var otherFood = {
     *   'fruits': ['banana'],
     *   'vegetables': ['carrot']
     * };
     *
     * _.merge(food, otherFood, function(a, b) {
     *   return _.isArray(a) ? a.concat(b) : undefined;
     * });
     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot] }
     */
    function merge(object) {
      var args = arguments,
          length = 2;

      if (!isObject(object)) {
        return object;
      }
      // allows working with `_.reduce` and `_.reduceRight` without using
      // their `index` and `collection` arguments
      if (typeof args[2] != 'number') {
        length = args.length;
      }
      if (length > 3 && typeof args[length - 2] == 'function') {
        var callback = baseCreateCallback(args[--length - 1], args[length--], 2);
      } else if (length > 2 && typeof args[length - 1] == 'function') {
        callback = args[--length];
      }
      var sources = slice(arguments, 1, length),
          index = -1,
          stackA = getArray(),
          stackB = getArray();

      while (++index < length) {
        baseMerge(object, sources[index], callback, stackA, stackB);
      }
      releaseArray(stackA);
      releaseArray(stackB);
      return object;
    }

    /**
     * Creates a shallow clone of `object` excluding the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` omitting the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The properties to omit or the
     *  function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object without the omitted properties.
     * @example
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, 'age');
     * // => { 'name': 'fred' }
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, function(value) {
     *   return typeof value == 'number';
     * });
     * // => { 'name': 'fred' }
     */
    function omit(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var props = [];
        forIn(object, function(value, key) {
          props.push(key);
        });
        props = baseDifference(props, baseFlatten(arguments, true, false, 1));

        var index = -1,
            length = props.length;

        while (++index < length) {
          var key = props[index];
          result[key] = object[key];
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (!callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * Creates a two dimensional array of an object's key-value pairs,
     * i.e. `[[key1, value1], [key2, value2]]`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns new array of key-value pairs.
     * @example
     *
     * _.pairs({ 'barney': 36, 'fred': 40 });
     * // => [['barney', 36], ['fred', 40]] (property order is not guaranteed across environments)
     */
    function pairs(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        var key = props[index];
        result[index] = [key, object[key]];
      }
      return result;
    }

    /**
     * Creates a shallow clone of `object` composed of the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` picking the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The function called per
     *  iteration or property names to pick, specified as individual property
     *  names or arrays of property names.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object composed of the picked properties.
     * @example
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');
     * // => { 'name': 'fred' }
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, function(value, key) {
     *   return key.charAt(0) != '_';
     * });
     * // => { 'name': 'fred' }
     */
    function pick(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var index = -1,
            props = baseFlatten(arguments, true, false, 1),
            length = isObject(object) ? props.length : 0;

        while (++index < length) {
          var key = props[index];
          if (key in object) {
            result[key] = object[key];
          }
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * An alternative to `_.reduce` this method transforms `object` to a new
     * `accumulator` object which is the result of running each of its own
     * enumerable properties through a callback, with each callback execution
     * potentially mutating the `accumulator` object. The callback is bound to
     * `thisArg` and invoked with four arguments; (accumulator, value, key, object).
     * Callbacks may exit iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] The custom accumulator value.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var squares = _.transform([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(result, num) {
     *   num *= num;
     *   if (num % 2) {
     *     return result.push(num) < 3;
     *   }
     * });
     * // => [1, 9, 25]
     *
     * var mapped = _.transform({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     * });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function transform(object, callback, accumulator, thisArg) {
      var isArr = isArray(object);
      if (accumulator == null) {
        if (isArr) {
          accumulator = [];
        } else {
          var ctor = object && object.constructor,
              proto = ctor && ctor.prototype;

          accumulator = baseCreate(proto);
        }
      }
      if (callback) {
        callback = lodash.createCallback(callback, thisArg, 4);
        (isArr ? forEach : forOwn)(object, function(value, index, object) {
          return callback(accumulator, value, index, object);
        });
      }
      return accumulator;
    }

    /**
     * Creates an array composed of the own enumerable property values of `object`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property values.
     * @example
     *
     * _.values({ 'one': 1, 'two': 2, 'three': 3 });
     * // => [1, 2, 3] (property order is not guaranteed across environments)
     */
    function values(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        result[index] = object[props[index]];
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array of elements from the specified indexes, or keys, of the
     * `collection`. Indexes may be specified as individual arguments or as arrays
     * of indexes.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {...(number|number[]|string|string[])} [index] The indexes of `collection`
     *   to retrieve, specified as individual indexes or arrays of indexes.
     * @returns {Array} Returns a new array of elements corresponding to the
     *  provided indexes.
     * @example
     *
     * _.at(['a', 'b', 'c', 'd', 'e'], [0, 2, 4]);
     * // => ['a', 'c', 'e']
     *
     * _.at(['fred', 'barney', 'pebbles'], 0, 2);
     * // => ['fred', 'pebbles']
     */
    function at(collection) {
      var args = arguments,
          index = -1,
          props = baseFlatten(args, true, false, 1),
          length = (args[2] && args[2][args[1]] === collection) ? 1 : props.length,
          result = Array(length);

      while(++index < length) {
        result[index] = collection[props[index]];
      }
      return result;
    }

    /**
     * Checks if a given value is present in a collection using strict equality
     * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the
     * offset from the end of the collection.
     *
     * @static
     * @memberOf _
     * @alias include
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {*} target The value to check for.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {boolean} Returns `true` if the `target` element is found, else `false`.
     * @example
     *
     * _.contains([1, 2, 3], 1);
     * // => true
     *
     * _.contains([1, 2, 3], 1, 2);
     * // => false
     *
     * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');
     * // => true
     *
     * _.contains('pebbles', 'eb');
     * // => true
     */
    function contains(collection, target, fromIndex) {
      var index = -1,
          indexOf = getIndexOf(),
          length = collection ? collection.length : 0,
          result = false;

      fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
      if (isArray(collection)) {
        result = indexOf(collection, target, fromIndex) > -1;
      } else if (typeof length == 'number') {
        result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
      } else {
        forOwn(collection, function(value) {
          if (++index >= fromIndex) {
            return !(result = value === target);
          }
        });
      }
      return result;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` through the callback. The corresponding value
     * of each key is the number of times the key was returned by the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy(['one', 'two', 'three'], 'length');
     * // => { '3': 2, '5': 1 }
     */
    var countBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1);
    });

    /**
     * Checks if the given callback returns truey value for **all** elements of
     * a collection. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias all
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if all elements passed the callback check,
     *  else `false`.
     * @example
     *
     * _.every([true, 1, null, 'yes']);
     * // => false
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.every(characters, 'age');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.every(characters, { 'age': 36 });
     * // => false
     */
    function every(collection, callback, thisArg) {
      var result = true;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if (!(result = !!callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return (result = !!callback(value, index, collection));
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning an array of all elements
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias select
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that passed the callback check.
     * @example
     *
     * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [2, 4, 6]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.filter(characters, 'blocked');
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     *
     * // using "_.where" callback shorthand
     * _.filter(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     */
    function filter(collection, callback, thisArg) {
      var result = [];
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            result.push(value);
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result.push(value);
          }
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning the first element that
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias detect, findWhere
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.find(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => { 'name': 'barney', 'age': 36, 'blocked': false }
     *
     * // using "_.where" callback shorthand
     * _.find(characters, { 'age': 1 });
     * // =>  { 'name': 'pebbles', 'age': 1, 'blocked': false }
     *
     * // using "_.pluck" callback shorthand
     * _.find(characters, 'blocked');
     * // => { 'name': 'fred', 'age': 40, 'blocked': true }
     */
    function find(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            return value;
          }
        }
      } else {
        var result;
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result = value;
            return false;
          }
        });
        return result;
      }
    }

    /**
     * This method is like `_.find` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * _.findLast([1, 2, 3, 4], function(num) {
     *   return num % 2 == 1;
     * });
     * // => 3
     */
    function findLast(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forEachRight(collection, function(value, index, collection) {
        if (callback(value, index, collection)) {
          result = value;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over elements of a collection, executing the callback for each
     * element. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * Note: As with other "Collections" methods, objects with a `length` property
     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
     * may be used for object iteration.
     *
     * @static
     * @memberOf _
     * @alias each
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
     * // => logs each number and returns '1,2,3'
     *
     * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
     * // => logs each number and returns the object (property order is not guaranteed across environments)
     */
    function forEach(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (++index < length) {
          if (callback(collection[index], index, collection) === false) {
            break;
          }
        }
      } else {
        forOwn(collection, callback);
      }
      return collection;
    }

    /**
     * This method is like `_.forEach` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias eachRight
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEachRight(function(num) { console.log(num); }).join(',');
     * // => logs each number from right to left and returns '3,2,1'
     */
    function forEachRight(collection, callback, thisArg) {
      var length = collection ? collection.length : 0;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (length--) {
          if (callback(collection[length], length, collection) === false) {
            break;
          }
        }
      } else {
        var props = keys(collection);
        length = props.length;
        forOwn(collection, function(value, key, collection) {
          key = props ? props[--length] : --length;
          return callback(collection[key], key, collection);
        });
      }
      return collection;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of a collection through the callback. The corresponding value
     * of each key is an array of the elements responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * // using "_.pluck" callback shorthand
     * _.groupBy(['one', 'two', 'three'], 'length');
     * // => { '3': ['one', 'two'], '5': ['three'] }
     */
    var groupBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
    });

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of the collection through the given callback. The corresponding
     * value of each key is the last element responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * var keys = [
     *   { 'dir': 'left', 'code': 97 },
     *   { 'dir': 'right', 'code': 100 }
     * ];
     *
     * _.indexBy(keys, 'dir');
     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(keys, function(key) { return String.fromCharCode(key.code); });
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(characters, function(key) { this.fromCharCode(key.code); }, String);
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     */
    var indexBy = createAggregator(function(result, value, key) {
      result[key] = value;
    });

    /**
     * Invokes the method named by `methodName` on each element in the `collection`
     * returning an array of the results of each invoked method. Additional arguments
     * will be provided to each invoked method. If `methodName` is a function it
     * will be invoked for, and `this` bound to, each element in the `collection`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|string} methodName The name of the method to invoke or
     *  the function invoked per iteration.
     * @param {...*} [arg] Arguments to invoke the method with.
     * @returns {Array} Returns a new array of the results of each invoked method.
     * @example
     *
     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
     * // => [[1, 5, 7], [1, 2, 3]]
     *
     * _.invoke([123, 456], String.prototype.split, '');
     * // => [['1', '2', '3'], ['4', '5', '6']]
     */
    function invoke(collection, methodName) {
      var args = slice(arguments, 2),
          index = -1,
          isFunc = typeof methodName == 'function',
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);
      });
      return result;
    }

    /**
     * Creates an array of values by running each element in the collection
     * through the callback. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias collect
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of the results of each `callback` execution.
     * @example
     *
     * _.map([1, 2, 3], function(num) { return num * 3; });
     * // => [3, 6, 9]
     *
     * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
     * // => [3, 6, 9] (property order is not guaranteed across environments)
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(characters, 'name');
     * // => ['barney', 'fred']
     */
    function map(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        var result = Array(length);
        while (++index < length) {
          result[index] = callback(collection[index], index, collection);
        }
      } else {
        result = [];
        forOwn(collection, function(value, key, collection) {
          result[++index] = callback(value, key, collection);
        });
      }
      return result;
    }

    /**
     * Retrieves the maximum value of a collection. If the collection is empty or
     * falsey `-Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the maximum value.
     * @example
     *
     * _.max([4, 2, 8, 6]);
     * // => 8
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.max(characters, function(chr) { return chr.age; });
     * // => { 'name': 'fred', 'age': 40 };
     *
     * // using "_.pluck" callback shorthand
     * _.max(characters, 'age');
     * // => { 'name': 'fred', 'age': 40 };
     */
    function max(collection, callback, thisArg) {
      var computed = -Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value > result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current > computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the minimum value of a collection. If the collection is empty or
     * falsey `Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the minimum value.
     * @example
     *
     * _.min([4, 2, 8, 6]);
     * // => 2
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.min(characters, function(chr) { return chr.age; });
     * // => { 'name': 'barney', 'age': 36 };
     *
     * // using "_.pluck" callback shorthand
     * _.min(characters, 'age');
     * // => { 'name': 'barney', 'age': 36 };
     */
    function min(collection, callback, thisArg) {
      var computed = Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value < result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current < computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the value of a specified property from all elements in the collection.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {string} property The name of the property to pluck.
     * @returns {Array} Returns a new array of property values.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.pluck(characters, 'name');
     * // => ['barney', 'fred']
     */
    var pluck = map;

    /**
     * Reduces a collection to a value which is the accumulated result of running
     * each element in the collection through the callback, where each successive
     * callback execution consumes the return value of the previous execution. If
     * `accumulator` is not provided the first element of the collection will be
     * used as the initial `accumulator` value. The callback is bound to `thisArg`
     * and invoked with four arguments; (accumulator, value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @alias foldl, inject
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var sum = _.reduce([1, 2, 3], function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     *   return result;
     * }, {});
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function reduce(collection, callback, accumulator, thisArg) {
      if (!collection) return accumulator;
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);

      var index = -1,
          length = collection.length;

      if (typeof length == 'number') {
        if (noaccum) {
          accumulator = collection[++index];
        }
        while (++index < length) {
          accumulator = callback(accumulator, collection[index], index, collection);
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          accumulator = noaccum
            ? (noaccum = false, value)
            : callback(accumulator, value, index, collection)
        });
      }
      return accumulator;
    }

    /**
     * This method is like `_.reduce` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias foldr
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var list = [[0, 1], [2, 3], [4, 5]];
     * var flat = _.reduceRight(list, function(a, b) { return a.concat(b); }, []);
     * // => [4, 5, 2, 3, 0, 1]
     */
    function reduceRight(collection, callback, accumulator, thisArg) {
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);
      forEachRight(collection, function(value, index, collection) {
        accumulator = noaccum
          ? (noaccum = false, value)
          : callback(accumulator, value, index, collection);
      });
      return accumulator;
    }

    /**
     * The opposite of `_.filter` this method returns the elements of a
     * collection that the callback does **not** return truey for.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that failed the callback check.
     * @example
     *
     * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [1, 3, 5]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.reject(characters, 'blocked');
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     *
     * // using "_.where" callback shorthand
     * _.reject(characters, { 'age': 36 });
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     */
    function reject(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);
      return filter(collection, function(value, index, collection) {
        return !callback(value, index, collection);
      });
    }

    /**
     * Retrieves a random element or `n` random elements from a collection.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to sample.
     * @param {number} [n] The number of elements to sample.
     * @param- {Object} [guard] Allows working with functions like `_.map`
     *  without using their `index` arguments as `n`.
     * @returns {Array} Returns the random sample(s) of `collection`.
     * @example
     *
     * _.sample([1, 2, 3, 4]);
     * // => 2
     *
     * _.sample([1, 2, 3, 4], 2);
     * // => [3, 1]
     */
    function sample(collection, n, guard) {
      if (collection && typeof collection.length != 'number') {
        collection = values(collection);
      }
      if (n == null || guard) {
        return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;
      }
      var result = shuffle(collection);
      result.length = nativeMin(nativeMax(0, n), result.length);
      return result;
    }

    /**
     * Creates an array of shuffled values, using a version of the Fisher-Yates
     * shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to shuffle.
     * @returns {Array} Returns a new shuffled collection.
     * @example
     *
     * _.shuffle([1, 2, 3, 4, 5, 6]);
     * // => [4, 1, 6, 3, 5, 2]
     */
    function shuffle(collection) {
      var index = -1,
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        var rand = baseRandom(0, ++index);
        result[index] = result[rand];
        result[rand] = value;
      });
      return result;
    }

    /**
     * Gets the size of the `collection` by returning `collection.length` for arrays
     * and array-like objects or the number of own enumerable properties for objects.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to inspect.
     * @returns {number} Returns `collection.length` or number of own enumerable properties.
     * @example
     *
     * _.size([1, 2]);
     * // => 2
     *
     * _.size({ 'one': 1, 'two': 2, 'three': 3 });
     * // => 3
     *
     * _.size('pebbles');
     * // => 7
     */
    function size(collection) {
      var length = collection ? collection.length : 0;
      return typeof length == 'number' ? length : keys(collection).length;
    }

    /**
     * Checks if the callback returns a truey value for **any** element of a
     * collection. The function returns as soon as it finds a passing value and
     * does not iterate over the entire collection. The callback is bound to
     * `thisArg` and invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias any
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if any element passed the callback check,
     *  else `false`.
     * @example
     *
     * _.some([null, 0, 'yes', false], Boolean);
     * // => true
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.some(characters, 'blocked');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.some(characters, { 'age': 1 });
     * // => false
     */
    function some(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if ((result = callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return !(result = callback(value, index, collection));
        });
      }
      return !!result;
    }

    /**
     * Creates an array of elements, sorted in ascending order by the results of
     * running each element in a collection through the callback. This method
     * performs a stable sort, that is, it will preserve the original sort order
     * of equal elements. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an array of property names is provided for `callback` the collection
     * will be sorted by each property value.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Array|Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of sorted elements.
     * @example
     *
     * _.sortBy([1, 2, 3], function(num) { return Math.sin(num); });
     * // => [3, 1, 2]
     *
     * _.sortBy([1, 2, 3], function(num) { return this.sin(num); }, Math);
     * // => [3, 1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'barney',  'age': 26 },
     *   { 'name': 'fred',    'age': 30 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(_.sortBy(characters, 'age'), _.values);
     * // => [['barney', 26], ['fred', 30], ['barney', 36], ['fred', 40]]
     *
     * // sorting by multiple properties
     * _.map(_.sortBy(characters, ['name', 'age']), _.values);
     * // = > [['barney', 26], ['barney', 36], ['fred', 30], ['fred', 40]]
     */
    function sortBy(collection, callback, thisArg) {
      var index = -1,
          isArr = isArray(callback),
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      if (!isArr) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      forEach(collection, function(value, key, collection) {
        var object = result[++index] = getObject();
        if (isArr) {
          object.criteria = map(callback, function(key) { return value[key]; });
        } else {
          (object.criteria = getArray())[0] = callback(value, key, collection);
        }
        object.index = index;
        object.value = value;
      });

      length = result.length;
      result.sort(compareAscending);
      while (length--) {
        var object = result[length];
        result[length] = object.value;
        if (!isArr) {
          releaseArray(object.criteria);
        }
        releaseObject(object);
      }
      return result;
    }

    /**
     * Converts the `collection` to an array.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to convert.
     * @returns {Array} Returns the new converted array.
     * @example
     *
     * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
     * // => [2, 3, 4]
     */
    function toArray(collection) {
      if (collection && typeof collection.length == 'number') {
        return slice(collection);
      }
      return values(collection);
    }

    /**
     * Performs a deep comparison of each element in a `collection` to the given
     * `properties` object, returning an array of all elements that have equivalent
     * property values.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Object} props The object of property values to filter by.
     * @returns {Array} Returns a new array of elements that have the given properties.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * _.where(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'pets': ['hoppy'] }]
     *
     * _.where(characters, { 'pets': ['dino'] });
     * // => [{ 'name': 'fred', 'age': 40, 'pets': ['baby puss', 'dino'] }]
     */
    var where = filter;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array with all falsey values removed. The values `false`, `null`,
     * `0`, `""`, `undefined`, and `NaN` are all falsey.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to compact.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.compact([0, 1, false, 2, '', 3]);
     * // => [1, 2, 3]
     */
    function compact(array) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * Creates an array excluding all values of the provided arrays using strict
     * equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {...Array} [values] The arrays of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
     * // => [1, 3, 4]
     */
    function difference(array) {
      return baseDifference(array, baseFlatten(arguments, true, true, 1));
    }

    /**
     * This method is like `_.find` except that it returns the index of the first
     * element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.findIndex(characters, function(chr) {
     *   return chr.age < 20;
     * });
     * // => 2
     *
     * // using "_.where" callback shorthand
     * _.findIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findIndex(characters, 'blocked');
     * // => 1
     */
    function findIndex(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        if (callback(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * This method is like `_.findIndex` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': true },
     *   { 'name': 'fred',    'age': 40, 'blocked': false },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': true }
     * ];
     *
     * _.findLastIndex(characters, function(chr) {
     *   return chr.age > 30;
     * });
     * // => 1
     *
     * // using "_.where" callback shorthand
     * _.findLastIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findLastIndex(characters, 'blocked');
     * // => 2
     */
    function findLastIndex(array, callback, thisArg) {
      var length = array ? array.length : 0;
      callback = lodash.createCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(array[length], length, array)) {
          return length;
        }
      }
      return -1;
    }

    /**
     * Gets the first element or first `n` elements of an array. If a callback
     * is provided elements at the beginning of the array are returned as long
     * as the callback returns truey. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias head, take
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the first element(s) of `array`.
     * @example
     *
     * _.first([1, 2, 3]);
     * // => 1
     *
     * _.first([1, 2, 3], 2);
     * // => [1, 2]
     *
     * _.first([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false, 'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.first(characters, 'blocked');
     * // => [{ 'name': 'barney', 'blocked': true, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.first(characters, { 'employer': 'slate' }), 'name');
     * // => ['barney', 'fred']
     */
    function first(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = -1;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[0] : undefined;
        }
      }
      return slice(array, 0, nativeMin(nativeMax(0, n), length));
    }

    /**
     * Flattens a nested array (the nesting can be to any depth). If `isShallow`
     * is truey, the array will only be flattened a single level. If a callback
     * is provided each element of the array is passed through the callback before
     * flattening. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new flattened array.
     * @example
     *
     * _.flatten([1, [2], [3, [[4]]]]);
     * // => [1, 2, 3, 4];
     *
     * _.flatten([1, [2], [3, [[4]]]], true);
     * // => [1, 2, 3, [[4]]];
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.flatten(characters, 'pets');
     * // => ['hoppy', 'baby puss', 'dino']
     */
    function flatten(array, isShallow, callback, thisArg) {
      // juggle arguments
      if (typeof isShallow != 'boolean' && isShallow != null) {
        thisArg = callback;
        callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;
        isShallow = false;
      }
      if (callback != null) {
        array = map(array, callback, thisArg);
      }
      return baseFlatten(array, isShallow);
    }

    /**
     * Gets the index at which the first occurrence of `value` is found using
     * strict equality for comparisons, i.e. `===`. If the array is already sorted
     * providing `true` for `fromIndex` will run a faster binary search.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {boolean|number} [fromIndex=0] The index to search from or `true`
     *  to perform a binary search on a sorted array.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 1
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 4
     *
     * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);
     * // => 2
     */
    function indexOf(array, value, fromIndex) {
      if (typeof fromIndex == 'number') {
        var length = array ? array.length : 0;
        fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0);
      } else if (fromIndex) {
        var index = sortedIndex(array, value);
        return array[index] === value ? index : -1;
      }
      return baseIndexOf(array, value, fromIndex);
    }

    /**
     * Gets all but the last element or last `n` elements of an array. If a
     * callback is provided elements at the end of the array are excluded from
     * the result as long as the callback returns truey. The callback is bound
     * to `thisArg` and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.initial([1, 2, 3]);
     * // => [1, 2]
     *
     * _.initial([1, 2, 3], 2);
     * // => [1]
     *
     * _.initial([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [1]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.initial(characters, 'blocked');
     * // => [{ 'name': 'barney',  'blocked': false, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.initial(characters, { 'employer': 'na' }), 'name');
     * // => ['barney', 'fred']
     */
    function initial(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : callback || n;
      }
      return slice(array, 0, nativeMin(nativeMax(0, length - n), length));
    }

    /**
     * Creates an array of unique values present in all provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of shared values.
     * @example
     *
     * _.intersection([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2]
     */
    function intersection() {
      var args = [],
          argsIndex = -1,
          argsLength = arguments.length,
          caches = getArray(),
          indexOf = getIndexOf(),
          trustIndexOf = indexOf === baseIndexOf,
          seen = getArray();

      while (++argsIndex < argsLength) {
        var value = arguments[argsIndex];
        if (isArray(value) || isArguments(value)) {
          args.push(value);
          caches.push(trustIndexOf && value.length >= largeArraySize &&
            createCache(argsIndex ? args[argsIndex] : seen));
        }
      }
      var array = args[0],
          index = -1,
          length = array ? array.length : 0,
          result = [];

      outer:
      while (++index < length) {
        var cache = caches[0];
        value = array[index];

        if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
          argsIndex = argsLength;
          (cache || seen).push(value);
          while (--argsIndex) {
            cache = caches[argsIndex];
            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
              continue outer;
            }
          }
          result.push(value);
        }
      }
      while (argsLength--) {
        cache = caches[argsLength];
        if (cache) {
          releaseObject(cache);
        }
      }
      releaseArray(caches);
      releaseArray(seen);
      return result;
    }

    /**
     * Gets the last element or last `n` elements of an array. If a callback is
     * provided elements at the end of the array are returned as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the last element(s) of `array`.
     * @example
     *
     * _.last([1, 2, 3]);
     * // => 3
     *
     * _.last([1, 2, 3], 2);
     * // => [2, 3]
     *
     * _.last([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [2, 3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.last(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.last(characters, { 'employer': 'na' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function last(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[length - 1] : undefined;
        }
      }
      return slice(array, nativeMax(0, length - n));
    }

    /**
     * Gets the index at which the last occurrence of `value` is found using strict
     * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
     * as the offset from the end of the collection.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=array.length-1] The index to search from.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 4
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 1
     */
    function lastIndexOf(array, value, fromIndex) {
      var index = array ? array.length : 0;
      if (typeof fromIndex == 'number') {
        index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;
      }
      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * Removes all provided values from the given array using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {...*} [value] The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3, 1, 2, 3];
     * _.pull(array, 2, 3);
     * console.log(array);
     * // => [1, 1]
     */
    function pull(array) {
      var args = arguments,
          argsIndex = 0,
          argsLength = args.length,
          length = array ? array.length : 0;

      while (++argsIndex < argsLength) {
        var index = -1,
            value = args[argsIndex];
        while (++index < length) {
          if (array[index] === value) {
            splice.call(array, index--, 1);
            length--;
          }
        }
      }
      return array;
    }

    /**
     * Creates an array of numbers (positive and/or negative) progressing from
     * `start` up to but not including `end`. If `start` is less than `stop` a
     * zero-length range is created unless a negative `step` is specified.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @param {number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns a new range array.
     * @example
     *
     * _.range(4);
     * // => [0, 1, 2, 3]
     *
     * _.range(1, 5);
     * // => [1, 2, 3, 4]
     *
     * _.range(0, 20, 5);
     * // => [0, 5, 10, 15]
     *
     * _.range(0, -4, -1);
     * // => [0, -1, -2, -3]
     *
     * _.range(1, 4, 0);
     * // => [1, 1, 1]
     *
     * _.range(0);
     * // => []
     */
    function range(start, end, step) {
      start = +start || 0;
      step = typeof step == 'number' ? step : (+step || 1);

      if (end == null) {
        end = start;
        start = 0;
      }
      // use `Array(length)` so engines like Chakra and V8 avoid slower modes
      // http://youtu.be/XAqIpGU8ZZk#t=17m25s
      var index = -1,
          length = nativeMax(0, ceil((end - start) / (step || 1))),
          result = Array(length);

      while (++index < length) {
        result[index] = start;
        start += step;
      }
      return result;
    }

    /**
     * Removes all elements from an array that the callback returns truey for
     * and returns an array of removed elements. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of removed elements.
     * @example
     *
     * var array = [1, 2, 3, 4, 5, 6];
     * var evens = _.remove(array, function(num) { return num % 2 == 0; });
     *
     * console.log(array);
     * // => [1, 3, 5]
     *
     * console.log(evens);
     * // => [2, 4, 6]
     */
    function remove(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        var value = array[index];
        if (callback(value, index, array)) {
          result.push(value);
          splice.call(array, index--, 1);
          length--;
        }
      }
      return result;
    }

    /**
     * The opposite of `_.initial` this method gets all but the first element or
     * first `n` elements of an array. If a callback function is provided elements
     * at the beginning of the array are excluded from the result as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias drop, tail
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.rest([1, 2, 3]);
     * // => [2, 3]
     *
     * _.rest([1, 2, 3], 2);
     * // => [3]
     *
     * _.rest([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true, 'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.rest(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.rest(characters, { 'employer': 'slate' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function rest(array, callback, thisArg) {
      if (typeof callback != 'number' && callback != null) {
        var n = 0,
            index = -1,
            length = array ? array.length : 0;

        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : nativeMax(0, callback);
      }
      return slice(array, n);
    }

    /**
     * Uses a binary search to determine the smallest index at which a value
     * should be inserted into a given sorted array in order to maintain the sort
     * order of the array. If a callback is provided it will be executed for
     * `value` and each element of `array` to compute their sort ranking. The
     * callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedIndex([20, 30, 50], 40);
     * // => 2
     *
     * // using "_.pluck" callback shorthand
     * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
     * // => 2
     *
     * var dict = {
     *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }
     * };
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return dict.wordToNumber[word];
     * });
     * // => 2
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return this.wordToNumber[word];
     * }, dict);
     * // => 2
     */
    function sortedIndex(array, value, callback, thisArg) {
      var low = 0,
          high = array ? array.length : low;

      // explicitly reference `identity` for better inlining in Firefox
      callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
      value = callback(value);

      while (low < high) {
        var mid = (low + high) >>> 1;
        (callback(array[mid]) < value)
          ? low = mid + 1
          : high = mid;
      }
      return low;
    }

    /**
     * Creates an array of unique values, in order, of the provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of combined values.
     * @example
     *
     * _.union([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2, 3, 5, 4]
     */
    function union() {
      return baseUniq(baseFlatten(arguments, true, true));
    }

    /**
     * Creates a duplicate-value-free version of an array using strict equality
     * for comparisons, i.e. `===`. If the array is sorted, providing
     * `true` for `isSorted` will use a faster algorithm. If a callback is provided
     * each element of `array` is passed through the callback before uniqueness
     * is computed. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias unique
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a duplicate-value-free array.
     * @example
     *
     * _.uniq([1, 2, 1, 3, 1]);
     * // => [1, 2, 3]
     *
     * _.uniq([1, 1, 2, 2, 3], true);
     * // => [1, 2, 3]
     *
     * _.uniq(['A', 'b', 'C', 'a', 'B', 'c'], function(letter) { return letter.toLowerCase(); });
     * // => ['A', 'b', 'C']
     *
     * _.uniq([1, 2.5, 3, 1.5, 2, 3.5], function(num) { return this.floor(num); }, Math);
     * // => [1, 2.5, 3]
     *
     * // using "_.pluck" callback shorthand
     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    function uniq(array, isSorted, callback, thisArg) {
      // juggle arguments
      if (typeof isSorted != 'boolean' && isSorted != null) {
        thisArg = callback;
        callback = (typeof isSorted != 'function' && thisArg && thisArg[isSorted] === array) ? null : isSorted;
        isSorted = false;
      }
      if (callback != null) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      return baseUniq(array, isSorted, callback);
    }

    /**
     * Creates an array excluding all provided values using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to filter.
     * @param {...*} [value] The values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
     * // => [2, 3, 4]
     */
    function without(array) {
      return baseDifference(array, slice(arguments, 1));
    }

    /**
     * Creates an array that is the symmetric difference of the provided arrays.
     * See http://en.wikipedia.org/wiki/Symmetric_difference.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of values.
     * @example
     *
     * _.xor([1, 2, 3], [5, 2, 1, 4]);
     * // => [3, 5, 4]
     *
     * _.xor([1, 2, 5], [2, 3, 5], [3, 4, 5]);
     * // => [1, 4, 5]
     */
    function xor() {
      var index = -1,
          length = arguments.length;

      while (++index < length) {
        var array = arguments[index];
        if (isArray(array) || isArguments(array)) {
          var result = result
            ? baseUniq(baseDifference(result, array).concat(baseDifference(array, result)))
            : array;
        }
      }
      return result || [];
    }

    /**
     * Creates an array of grouped elements, the first of which contains the first
     * elements of the given arrays, the second of which contains the second
     * elements of the given arrays, and so on.
     *
     * @static
     * @memberOf _
     * @alias unzip
     * @category Arrays
     * @param {...Array} [array] Arrays to process.
     * @returns {Array} Returns a new array of grouped elements.
     * @example
     *
     * _.zip(['fred', 'barney'], [30, 40], [true, false]);
     * // => [['fred', 30, true], ['barney', 40, false]]
     */
    function zip() {
      var array = arguments.length > 1 ? arguments : arguments[0],
          index = -1,
          length = array ? max(pluck(array, 'length')) : 0,
          result = Array(length < 0 ? 0 : length);

      while (++index < length) {
        result[index] = pluck(array, index);
      }
      return result;
    }

    /**
     * Creates an object composed from arrays of `keys` and `values`. Provide
     * either a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`
     * or two arrays, one of `keys` and one of corresponding `values`.
     *
     * @static
     * @memberOf _
     * @alias object
     * @category Arrays
     * @param {Array} keys The array of keys.
     * @param {Array} [values=[]] The array of values.
     * @returns {Object} Returns an object composed of the given keys and
     *  corresponding values.
     * @example
     *
     * _.zipObject(['fred', 'barney'], [30, 40]);
     * // => { 'fred': 30, 'barney': 40 }
     */
    function zipObject(keys, values) {
      var index = -1,
          length = keys ? keys.length : 0,
          result = {};

      if (!values && length && !isArray(keys[0])) {
        values = [];
      }
      while (++index < length) {
        var key = keys[index];
        if (values) {
          result[key] = values[index];
        } else if (key) {
          result[key[0]] = key[1];
        }
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that executes `func`, with  the `this` binding and
     * arguments of the created function, only after being called `n` times.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {number} n The number of times the function must be called before
     *  `func` is executed.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var saves = ['profile', 'settings'];
     *
     * var done = _.after(saves.length, function() {
     *   console.log('Done saving!');
     * });
     *
     * _.forEach(saves, function(type) {
     *   asyncSave({ 'type': type, 'complete': done });
     * });
     * // => logs 'Done saving!', after all saves have completed
     */
    function after(n, func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (--n < 1) {
          return func.apply(this, arguments);
        }
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with the `this`
     * binding of `thisArg` and prepends any additional `bind` arguments to those
     * provided to the bound function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to bind.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var func = function(greeting) {
     *   return greeting + ' ' + this.name;
     * };
     *
     * func = _.bind(func, { 'name': 'fred' }, 'hi');
     * func();
     * // => 'hi fred'
     */
    function bind(func, thisArg) {
      return arguments.length > 2
        ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
        : createWrapper(func, 1, null, null, thisArg);
    }

    /**
     * Binds methods of an object to the object itself, overwriting the existing
     * method. Method names may be specified as individual arguments or as arrays
     * of method names. If no method names are provided all the function properties
     * of `object` will be bound.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object to bind and assign the bound methods to.
     * @param {...string} [methodName] The object method names to
     *  bind, specified as individual method names or arrays of method names.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var view = {
     *   'label': 'docs',
     *   'onClick': function() { console.log('clicked ' + this.label); }
     * };
     *
     * _.bindAll(view);
     * jQuery('#docs').on('click', view.onClick);
     * // => logs 'clicked docs', when the button is clicked
     */
    function bindAll(object) {
      var funcs = arguments.length > 1 ? baseFlatten(arguments, true, false, 1) : functions(object),
          index = -1,
          length = funcs.length;

      while (++index < length) {
        var key = funcs[index];
        object[key] = createWrapper(object[key], 1, null, null, object);
      }
      return object;
    }

    /**
     * Creates a function that, when called, invokes the method at `object[key]`
     * and prepends any additional `bindKey` arguments to those provided to the bound
     * function. This method differs from `_.bind` by allowing bound functions to
     * reference methods that will be redefined or don't yet exist.
     * See http://michaux.ca/articles/lazy-function-definition-pattern.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object the method belongs to.
     * @param {string} key The key of the method.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var object = {
     *   'name': 'fred',
     *   'greet': function(greeting) {
     *     return greeting + ' ' + this.name;
     *   }
     * };
     *
     * var func = _.bindKey(object, 'greet', 'hi');
     * func();
     * // => 'hi fred'
     *
     * object.greet = function(greeting) {
     *   return greeting + 'ya ' + this.name + '!';
     * };
     *
     * func();
     * // => 'hiya fred!'
     */
    function bindKey(object, key) {
      return arguments.length > 2
        ? createWrapper(key, 19, slice(arguments, 2), null, object)
        : createWrapper(key, 3, null, null, object);
    }

    /**
     * Creates a function that is the composition of the provided functions,
     * where each function consumes the return value of the function that follows.
     * For example, composing the functions `f()`, `g()`, and `h()` produces `f(g(h()))`.
     * Each function is executed with the `this` binding of the composed function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {...Function} [func] Functions to compose.
     * @returns {Function} Returns the new composed function.
     * @example
     *
     * var realNameMap = {
     *   'pebbles': 'penelope'
     * };
     *
     * var format = function(name) {
     *   name = realNameMap[name.toLowerCase()] || name;
     *   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
     * };
     *
     * var greet = function(formatted) {
     *   return 'Hiya ' + formatted + '!';
     * };
     *
     * var welcome = _.compose(greet, format);
     * welcome('pebbles');
     * // => 'Hiya Penelope!'
     */
    function compose() {
      var funcs = arguments,
          length = funcs.length;

      while (length--) {
        if (!isFunction(funcs[length])) {
          throw new TypeError;
        }
      }
      return function() {
        var args = arguments,
            length = funcs.length;

        while (length--) {
          args = [funcs[length].apply(this, args)];
        }
        return args[0];
      };
    }

    /**
     * Creates a function which accepts one or more arguments of `func` that when
     * invoked either executes `func` returning its result, if all `func` arguments
     * have been provided, or returns a function that accepts one or more of the
     * remaining `func` arguments, and so on. The arity of `func` can be specified
     * if `func.length` is not sufficient.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var curried = _.curry(function(a, b, c) {
     *   console.log(a + b + c);
     * });
     *
     * curried(1)(2)(3);
     * // => 6
     *
     * curried(1, 2)(3);
     * // => 6
     *
     * curried(1, 2, 3);
     * // => 6
     */
    function curry(func, arity) {
      arity = typeof arity == 'number' ? arity : (+arity || func.length);
      return createWrapper(func, 4, null, null, null, arity);
    }

    /**
     * Creates a function that will delay the execution of `func` until after
     * `wait` milliseconds have elapsed since the last time it was invoked.
     * Provide an options object to indicate that `func` should be invoked on
     * the leading and/or trailing edge of the `wait` timeout. Subsequent calls
     * to the debounced function will return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the debounced function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to debounce.
     * @param {number} wait The number of milliseconds to delay.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.
     * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // avoid costly calculations while the window size is in flux
     * var lazyLayout = _.debounce(calculateLayout, 150);
     * jQuery(window).on('resize', lazyLayout);
     *
     * // execute `sendMail` when the click event is fired, debouncing subsequent calls
     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * });
     *
     * // ensure `batchLog` is executed once after 1 second of debounced calls
     * var source = new EventSource('/stream');
     * source.addEventListener('message', _.debounce(batchLog, 250, {
     *   'maxWait': 1000
     * }, false);
     */
    function debounce(func, wait, options) {
      var args,
          maxTimeoutId,
          result,
          stamp,
          thisArg,
          timeoutId,
          trailingCall,
          lastCalled = 0,
          maxWait = false,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      wait = nativeMax(0, wait) || 0;
      if (options === true) {
        var leading = true;
        trailing = false;
      } else if (isObject(options)) {
        leading = options.leading;
        maxWait = 'maxWait' in options && (nativeMax(wait, options.maxWait) || 0);
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      var delayed = function() {
        var remaining = wait - (now() - stamp);
        if (remaining <= 0) {
          if (maxTimeoutId) {
            clearTimeout(maxTimeoutId);
          }
          var isCalled = trailingCall;
          maxTimeoutId = timeoutId = trailingCall = undefined;
          if (isCalled) {
            lastCalled = now();
            result = func.apply(thisArg, args);
            if (!timeoutId && !maxTimeoutId) {
              args = thisArg = null;
            }
          }
        } else {
          timeoutId = setTimeout(delayed, remaining);
        }
      };

      var maxDelayed = function() {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        maxTimeoutId = timeoutId = trailingCall = undefined;
        if (trailing || (maxWait !== wait)) {
          lastCalled = now();
          result = func.apply(thisArg, args);
          if (!timeoutId && !maxTimeoutId) {
            args = thisArg = null;
          }
        }
      };

      return function() {
        args = arguments;
        stamp = now();
        thisArg = this;
        trailingCall = trailing && (timeoutId || !leading);

        if (maxWait === false) {
          var leadingCall = leading && !timeoutId;
        } else {
          if (!maxTimeoutId && !leading) {
            lastCalled = stamp;
          }
          var remaining = maxWait - (stamp - lastCalled),
              isCalled = remaining <= 0;

          if (isCalled) {
            if (maxTimeoutId) {
              maxTimeoutId = clearTimeout(maxTimeoutId);
            }
            lastCalled = stamp;
            result = func.apply(thisArg, args);
          }
          else if (!maxTimeoutId) {
            maxTimeoutId = setTimeout(maxDelayed, remaining);
          }
        }
        if (isCalled && timeoutId) {
          timeoutId = clearTimeout(timeoutId);
        }
        else if (!timeoutId && wait !== maxWait) {
          timeoutId = setTimeout(delayed, wait);
        }
        if (leadingCall) {
          isCalled = true;
          result = func.apply(thisArg, args);
        }
        if (isCalled && !timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
        return result;
      };
    }

    /**
     * Defers executing the `func` function until the current call stack has cleared.
     * Additional arguments will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to defer.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.defer(function(text) { console.log(text); }, 'deferred');
     * // logs 'deferred' after one or more milliseconds
     */
    function defer(func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 1);
      return setTimeout(function() { func.apply(undefined, args); }, 1);
    }

    /**
     * Executes the `func` function after `wait` milliseconds. Additional arguments
     * will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay execution.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.delay(function(text) { console.log(text); }, 1000, 'later');
     * // => logs 'later' after one second
     */
    function delay(func, wait) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 2);
      return setTimeout(function() { func.apply(undefined, args); }, wait);
    }

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided it will be used to determine the cache key for storing the result
     * based on the arguments provided to the memoized function. By default, the
     * first argument provided to the memoized function is used as the cache key.
     * The `func` is executed with the `this` binding of the memoized function.
     * The result cache is exposed as the `cache` property on the memoized function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] A function used to resolve the cache key.
     * @returns {Function} Returns the new memoizing function.
     * @example
     *
     * var fibonacci = _.memoize(function(n) {
     *   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
     * });
     *
     * fibonacci(9)
     * // => 34
     *
     * var data = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // modifying the result cache
     * var get = _.memoize(function(name) { return data[name]; }, _.identity);
     * get('pebbles');
     * // => { 'name': 'pebbles', 'age': 1 }
     *
     * get.cache.pebbles.name = 'penelope';
     * get('pebbles');
     * // => { 'name': 'penelope', 'age': 1 }
     */
    function memoize(func, resolver) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var memoized = function() {
        var cache = memoized.cache,
            key = resolver ? resolver.apply(this, arguments) : keyPrefix + arguments[0];

        return hasOwnProperty.call(cache, key)
          ? cache[key]
          : (cache[key] = func.apply(this, arguments));
      }
      memoized.cache = {};
      return memoized;
    }

    /**
     * Creates a function that is restricted to execute `func` once. Repeat calls to
     * the function will return the value of the first call. The `func` is executed
     * with the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var initialize = _.once(createApplication);
     * initialize();
     * initialize();
     * // `initialize` executes `createApplication` once
     */
    function once(func) {
      var ran,
          result;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (ran) {
          return result;
        }
        ran = true;
        result = func.apply(this, arguments);

        // clear the `func` variable so the function may be garbage collected
        func = null;
        return result;
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with any additional
     * `partial` arguments prepended to those provided to the new function. This
     * method is similar to `_.bind` except it does **not** alter the `this` binding.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var greet = function(greeting, name) { return greeting + ' ' + name; };
     * var hi = _.partial(greet, 'hi');
     * hi('fred');
     * // => 'hi fred'
     */
    function partial(func) {
      return createWrapper(func, 16, slice(arguments, 1));
    }

    /**
     * This method is like `_.partial` except that `partial` arguments are
     * appended to those provided to the new function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var defaultsDeep = _.partialRight(_.merge, _.defaults);
     *
     * var options = {
     *   'variable': 'data',
     *   'imports': { 'jq': $ }
     * };
     *
     * defaultsDeep(options, _.templateSettings);
     *
     * options.variable
     * // => 'data'
     *
     * options.imports
     * // => { '_': _, 'jq': $ }
     */
    function partialRight(func) {
      return createWrapper(func, 32, null, slice(arguments, 1));
    }

    /**
     * Creates a function that, when executed, will only call the `func` function
     * at most once per every `wait` milliseconds. Provide an options object to
     * indicate that `func` should be invoked on the leading and/or trailing edge
     * of the `wait` timeout. Subsequent calls to the throttled function will
     * return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the throttled function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to throttle.
     * @param {number} wait The number of milliseconds to throttle executions to.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * // avoid excessively updating the position while scrolling
     * var throttled = _.throttle(updatePosition, 100);
     * jQuery(window).on('scroll', throttled);
     *
     * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes
     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
     *   'trailing': false
     * }));
     */
    function throttle(func, wait, options) {
      var leading = true,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      if (options === false) {
        leading = false;
      } else if (isObject(options)) {
        leading = 'leading' in options ? options.leading : leading;
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      debounceOptions.leading = leading;
      debounceOptions.maxWait = wait;
      debounceOptions.trailing = trailing;

      return debounce(func, wait, debounceOptions);
    }

    /**
     * Creates a function that provides `value` to the wrapper function as its
     * first argument. Additional arguments provided to the function are appended
     * to those provided to the wrapper function. The wrapper is executed with
     * the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {*} value The value to wrap.
     * @param {Function} wrapper The wrapper function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var p = _.wrap(_.escape, function(func, text) {
     *   return '<p>' + func(text) + '</p>';
     * });
     *
     * p('Fred, Wilma, & Pebbles');
     * // => '<p>Fred, Wilma, &amp; Pebbles</p>'
     */
    function wrap(value, wrapper) {
      return createWrapper(wrapper, 16, [value]);
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var getter = _.constant(object);
     * getter() === object;
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    /**
     * Produces a callback bound to an optional `thisArg`. If `func` is a property
     * name the created callback will return the property value for a given element.
     * If `func` is an object the created callback will return `true` for elements
     * that contain the equivalent object properties, otherwise it will return `false`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // wrap to create custom callback shorthands
     * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
     *   return !match ? func(callback, thisArg) : function(object) {
     *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
     *   };
     * });
     *
     * _.filter(characters, 'age__gt38');
     * // => [{ 'name': 'fred', 'age': 40 }]
     */
    function createCallback(func, thisArg, argCount) {
      var type = typeof func;
      if (func == null || type == 'function') {
        return baseCreateCallback(func, thisArg, argCount);
      }
      // handle "_.pluck" style callback shorthands
      if (type != 'object') {
        return property(func);
      }
      var props = keys(func),
          key = props[0],
          a = func[key];

      // handle "_.where" style callback shorthands
      if (props.length == 1 && a === a && !isObject(a)) {
        // fast path the common case of providing an object with a single
        // property containing a primitive value
        return function(object) {
          var b = object[key];
          return a === b && (a !== 0 || (1 / a == 1 / b));
        };
      }
      return function(object) {
        var length = props.length,
            result = false;

        while (length--) {
          if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
            break;
          }
        }
        return result;
      };
    }

    /**
     * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
     * corresponding HTML entities.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escape('Fred, Wilma, & Pebbles');
     * // => 'Fred, Wilma, &amp; Pebbles'
     */
    function escape(string) {
      return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
    }

    /**
     * This method returns the first argument provided to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.identity(object) === object;
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * Adds function properties of a source object to the destination object.
     * If `object` is a function methods will be added to its prototype as well.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Function|Object} [object=lodash] object The destination object.
     * @param {Object} source The object of functions to add.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.chain=true] Specify whether the functions added are chainable.
     * @example
     *
     * function capitalize(string) {
     *   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
     * }
     *
     * _.mixin({ 'capitalize': capitalize });
     * _.capitalize('fred');
     * // => 'Fred'
     *
     * _('fred').capitalize().value();
     * // => 'Fred'
     *
     * _.mixin({ 'capitalize': capitalize }, { 'chain': false });
     * _('fred').capitalize();
     * // => 'Fred'
     */
    function mixin(object, source, options) {
      var chain = true,
          methodNames = source && functions(source);

      if (!source || (!options && !methodNames.length)) {
        if (options == null) {
          options = source;
        }
        ctor = lodashWrapper;
        source = object;
        object = lodash;
        methodNames = functions(source);
      }
      if (options === false) {
        chain = false;
      } else if (isObject(options) && 'chain' in options) {
        chain = options.chain;
      }
      var ctor = object,
          isFunc = isFunction(ctor);

      forEach(methodNames, function(methodName) {
        var func = object[methodName] = source[methodName];
        if (isFunc) {
          ctor.prototype[methodName] = function() {
            var chainAll = this.__chain__,
                value = this.__wrapped__,
                args = [value];

            push.apply(args, arguments);
            var result = func.apply(object, args);
            if (chain || chainAll) {
              if (value === result && isObject(result)) {
                return this;
              }
              result = new ctor(result);
              result.__chain__ = chainAll;
            }
            return result;
          };
        }
      });
    }

    /**
     * Reverts the '_' variable to its previous value and returns a reference to
     * the `lodash` function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @returns {Function} Returns the `lodash` function.
     * @example
     *
     * var lodash = _.noConflict();
     */
    function noConflict() {
      context._ = oldDash;
      return this;
    }

    /**
     * A no-operation function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.noop(object) === undefined;
     * // => true
     */
    function noop() {
      // no operation performed
    }

    /**
     * Gets the number of milliseconds that have elapsed since the Unix epoch
     * (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var stamp = _.now();
     * _.defer(function() { console.log(_.now() - stamp); });
     * // => logs the number of milliseconds it took for the deferred function to be called
     */
    var now = isNative(now = Date.now) && now || function() {
      return new Date().getTime();
    };

    /**
     * Converts the given value into an integer of the specified radix.
     * If `radix` is `undefined` or `0` a `radix` of `10` is used unless the
     * `value` is a hexadecimal, in which case a `radix` of `16` is used.
     *
     * Note: This method avoids differences in native ES3 and ES5 `parseInt`
     * implementations. See http://es5.github.io/#E.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} value The value to parse.
     * @param {number} [radix] The radix used to interpret the value to parse.
     * @returns {number} Returns the new integer value.
     * @example
     *
     * _.parseInt('08');
     * // => 8
     */
    var parseInt = nativeParseInt(whitespace + '08') == 8 ? nativeParseInt : function(value, radix) {
      // Firefox < 21 and Opera < 15 follow the ES3 specified implementation of `parseInt`
      return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, '') : value, radix || 0);
    };

    /**
     * Creates a "_.pluck" style function, which returns the `key` value of a
     * given object.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} key The name of the property to retrieve.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var characters = [
     *   { 'name': 'fred',   'age': 40 },
     *   { 'name': 'barney', 'age': 36 }
     * ];
     *
     * var getName = _.property('name');
     *
     * _.map(characters, getName);
     * // => ['barney', 'fred']
     *
     * _.sortBy(characters, getName);
     * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
     */
    function property(key) {
      return function(object) {
        return object[key];
      };
    }

    /**
     * Produces a random number between `min` and `max` (inclusive). If only one
     * argument is provided a number between `0` and the given number will be
     * returned. If `floating` is truey or either `min` or `max` are floats a
     * floating-point number will be returned instead of an integer.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} [min=0] The minimum possible value.
     * @param {number} [max=1] The maximum possible value.
     * @param {boolean} [floating=false] Specify returning a floating-point number.
     * @returns {number} Returns a random number.
     * @example
     *
     * _.random(0, 5);
     * // => an integer between 0 and 5
     *
     * _.random(5);
     * // => also an integer between 0 and 5
     *
     * _.random(5, true);
     * // => a floating-point number between 0 and 5
     *
     * _.random(1.2, 5.2);
     * // => a floating-point number between 1.2 and 5.2
     */
    function random(min, max, floating) {
      var noMin = min == null,
          noMax = max == null;

      if (floating == null) {
        if (typeof min == 'boolean' && noMax) {
          floating = min;
          min = 1;
        }
        else if (!noMax && typeof max == 'boolean') {
          floating = max;
          noMax = true;
        }
      }
      if (noMin && noMax) {
        max = 1;
      }
      min = +min || 0;
      if (noMax) {
        max = min;
        min = 0;
      } else {
        max = +max || 0;
      }
      if (floating || min % 1 || max % 1) {
        var rand = nativeRandom();
        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand +'').length - 1)))), max);
      }
      return baseRandom(min, max);
    }

    /**
     * Resolves the value of property `key` on `object`. If `key` is a function
     * it will be invoked with the `this` binding of `object` and its result returned,
     * else the property value is returned. If `object` is falsey then `undefined`
     * is returned.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to resolve.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = {
     *   'cheese': 'crumpets',
     *   'stuff': function() {
     *     return 'nonsense';
     *   }
     * };
     *
     * _.result(object, 'cheese');
     * // => 'crumpets'
     *
     * _.result(object, 'stuff');
     * // => 'nonsense'
     */
    function result(object, key) {
      if (object) {
        var value = object[key];
        return isFunction(value) ? object[key]() : value;
      }
    }

    /**
     * A micro-templating method that handles arbitrary delimiters, preserves
     * whitespace, and correctly escapes quotes within interpolated code.
     *
     * Note: In the development build, `_.template` utilizes sourceURLs for easier
     * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
     *
     * For more information on precompiling templates see:
     * http://lodash.com/custom-builds
     *
     * For more information on Chrome extension sandboxes see:
     * http://developer.chrome.com/stable/extensions/sandboxingEval.html
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} text The template text.
     * @param {Object} data The data object used to populate the text.
     * @param {Object} [options] The options object.
     * @param {RegExp} [options.escape] The "escape" delimiter.
     * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
     * @param {Object} [options.imports] An object to import into the template as local variables.
     * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
     * @param {string} [sourceURL] The sourceURL of the template's compiled source.
     * @param {string} [variable] The data object variable name.
     * @returns {Function|string} Returns a compiled function when no `data` object
     *  is given, else it returns the interpolated text.
     * @example
     *
     * // using the "interpolate" delimiter to create a compiled template
     * var compiled = _.template('hello <%= name %>');
     * compiled({ 'name': 'fred' });
     * // => 'hello fred'
     *
     * // using the "escape" delimiter to escape HTML in data property values
     * _.template('<b><%- value %></b>', { 'value': '<script>' });
     * // => '<b>&lt;script&gt;</b>'
     *
     * // using the "evaluate" delimiter to generate HTML
     * var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the ES6 delimiter as an alternative to the default "interpolate" delimiter
     * _.template('hello ${ name }', { 'name': 'pebbles' });
     * // => 'hello pebbles'
     *
     * // using the internal `print` function in "evaluate" delimiters
     * _.template('<% print("hello " + name); %>!', { 'name': 'barney' });
     * // => 'hello barney!'
     *
     * // using a custom template delimiters
     * _.templateSettings = {
     *   'interpolate': /{{([\s\S]+?)}}/g
     * };
     *
     * _.template('hello {{ name }}!', { 'name': 'mustache' });
     * // => 'hello mustache!'
     *
     * // using the `imports` option to import jQuery
     * var list = '<% jq.each(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] }, { 'imports': { 'jq': jQuery } });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the `sourceURL` option to specify a custom sourceURL for the template
     * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });
     * compiled(data);
     * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
     *
     * // using the `variable` option to ensure a with-statement isn't used in the compiled template
     * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });
     * compiled.source;
     * // => function(data) {
     *   var __t, __p = '', __e = _.escape;
     *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';
     *   return __p;
     * }
     *
     * // using the `source` property to inline compiled templates for meaningful
     * // line numbers in error messages and a stack trace
     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
     *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
     * ');
     */
    function template(text, data, options) {
      // based on John Resig's `tmpl` implementation
      // http://ejohn.org/blog/javascript-micro-templating/
      // and Laura Doktorova's doT.js
      // https://github.com/olado/doT
      var settings = lodash.templateSettings;
      text = String(text || '');

      // avoid missing dependencies when `iteratorTemplate` is not defined
      options = defaults({}, options, settings);

      var imports = defaults({}, options.imports, settings.imports),
          importsKeys = keys(imports),
          importsValues = values(imports);

      var isEvaluating,
          index = 0,
          interpolate = options.interpolate || reNoMatch,
          source = "__p += '";

      // compile the regexp to match each delimiter
      var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
      , 'g');

      text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);

        // escape characters that cannot be included in string literals
        source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);

        // replace delimiters with snippets
        if (escapeValue) {
          source += "' +\n__e(" + escapeValue + ") +\n'";
        }
        if (evaluateValue) {
          isEvaluating = true;
          source += "';\n" + evaluateValue + ";\n__p += '";
        }
        if (interpolateValue) {
          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
        }
        index = offset + match.length;

        // the JS engine embedded in Adobe products requires returning the `match`
        // string in order to produce the correct `offset` value
        return match;
      });

      source += "';\n";

      // if `variable` is not specified, wrap a with-statement around the generated
      // code to add the data object to the top of the scope chain
      var variable = options.variable,
          hasVariable = variable;

      if (!hasVariable) {
        variable = 'obj';
        source = 'with (' + variable + ') {\n' + source + '\n}\n';
      }
      // cleanup code by stripping empty strings
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');

      // frame code as the function body
      source = 'function(' + variable + ') {\n' +
        (hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') +
        "var __t, __p = '', __e = _.escape" +
        (isEvaluating
          ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
          : ';\n'
        ) +
        source +
        'return __p\n}';

      // Use a sourceURL for easier debugging.
      // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
      var sourceURL = '\n/*\n//# sourceURL=' + (options.sourceURL || '/lodash/template/source[' + (templateCounter++) + ']') + '\n*/';

      try {
        var result = Function(importsKeys, 'return ' + source + sourceURL).apply(undefined, importsValues);
      } catch(e) {
        e.source = source;
        throw e;
      }
      if (data) {
        return result(data);
      }
      // provide the compiled function's source by its `toString` method, in
      // supported environments, or the `source` property as a convenience for
      // inlining compiled templates during the build process
      result.source = source;
      return result;
    }

    /**
     * Executes the callback `n` times, returning an array of the results
     * of each callback execution. The callback is bound to `thisArg` and invoked
     * with one argument; (index).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} n The number of times to execute the callback.
     * @param {Function} callback The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns an array of the results of each `callback` execution.
     * @example
     *
     * var diceRolls = _.times(3, _.partial(_.random, 1, 6));
     * // => [3, 6, 4]
     *
     * _.times(3, function(n) { mage.castSpell(n); });
     * // => calls `mage.castSpell(n)` three times, passing `n` of `0`, `1`, and `2` respectively
     *
     * _.times(3, function(n) { this.cast(n); }, mage);
     * // => also calls `mage.castSpell(n)` three times
     */
    function times(n, callback, thisArg) {
      n = (n = +n) > -1 ? n : 0;
      var index = -1,
          result = Array(n);

      callback = baseCreateCallback(callback, thisArg, 1);
      while (++index < n) {
        result[index] = callback(index);
      }
      return result;
    }

    /**
     * The inverse of `_.escape` this method converts the HTML entities
     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to their
     * corresponding characters.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to unescape.
     * @returns {string} Returns the unescaped string.
     * @example
     *
     * _.unescape('Fred, Barney &amp; Pebbles');
     * // => 'Fred, Barney & Pebbles'
     */
    function unescape(string) {
      return string == null ? '' : String(string).replace(reEscapedHtml, unescapeHtmlChar);
    }

    /**
     * Generates a unique ID. If `prefix` is provided the ID will be appended to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} [prefix] The value to prefix the ID with.
     * @returns {string} Returns the unique ID.
     * @example
     *
     * _.uniqueId('contact_');
     * // => 'contact_104'
     *
     * _.uniqueId();
     * // => '105'
     */
    function uniqueId(prefix) {
      var id = ++idCounter;
      return String(prefix == null ? '' : prefix) + id;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object that wraps the given value with explicit
     * method chaining enabled.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to wrap.
     * @returns {Object} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'pebbles', 'age': 1 }
     * ];
     *
     * var youngest = _.chain(characters)
     *     .sortBy('age')
     *     .map(function(chr) { return chr.name + ' is ' + chr.age; })
     *     .first()
     *     .value();
     * // => 'pebbles is 1'
     */
    function chain(value) {
      value = new lodashWrapper(value);
      value.__chain__ = true;
      return value;
    }

    /**
     * Invokes `interceptor` with the `value` as the first argument and then
     * returns `value`. The purpose of this method is to "tap into" a method
     * chain in order to perform operations on intermediate results within
     * the chain.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @returns {*} Returns `value`.
     * @example
     *
     * _([1, 2, 3, 4])
     *  .tap(function(array) { array.pop(); })
     *  .reverse()
     *  .value();
     * // => [3, 2, 1]
     */
    function tap(value, interceptor) {
      interceptor(value);
      return value;
    }

    /**
     * Enables explicit method chaining on the wrapper object.
     *
     * @name chain
     * @memberOf _
     * @category Chaining
     * @returns {*} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // without explicit chaining
     * _(characters).first();
     * // => { 'name': 'barney', 'age': 36 }
     *
     * // with explicit chaining
     * _(characters).chain()
     *   .first()
     *   .pick('age')
     *   .value();
     * // => { 'age': 36 }
     */
    function wrapperChain() {
      this.__chain__ = true;
      return this;
    }

    /**
     * Produces the `toString` result of the wrapped value.
     *
     * @name toString
     * @memberOf _
     * @category Chaining
     * @returns {string} Returns the string result.
     * @example
     *
     * _([1, 2, 3]).toString();
     * // => '1,2,3'
     */
    function wrapperToString() {
      return String(this.__wrapped__);
    }

    /**
     * Extracts the wrapped value.
     *
     * @name valueOf
     * @memberOf _
     * @alias value
     * @category Chaining
     * @returns {*} Returns the wrapped value.
     * @example
     *
     * _([1, 2, 3]).valueOf();
     * // => [1, 2, 3]
     */
    function wrapperValueOf() {
      return this.__wrapped__;
    }

    /*--------------------------------------------------------------------------*/

    // add functions that return wrapped values when chaining
    lodash.after = after;
    lodash.assign = assign;
    lodash.at = at;
    lodash.bind = bind;
    lodash.bindAll = bindAll;
    lodash.bindKey = bindKey;
    lodash.chain = chain;
    lodash.compact = compact;
    lodash.compose = compose;
    lodash.constant = constant;
    lodash.countBy = countBy;
    lodash.create = create;
    lodash.createCallback = createCallback;
    lodash.curry = curry;
    lodash.debounce = debounce;
    lodash.defaults = defaults;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.difference = difference;
    lodash.filter = filter;
    lodash.flatten = flatten;
    lodash.forEach = forEach;
    lodash.forEachRight = forEachRight;
    lodash.forIn = forIn;
    lodash.forInRight = forInRight;
    lodash.forOwn = forOwn;
    lodash.forOwnRight = forOwnRight;
    lodash.functions = functions;
    lodash.groupBy = groupBy;
    lodash.indexBy = indexBy;
    lodash.initial = initial;
    lodash.intersection = intersection;
    lodash.invert = invert;
    lodash.invoke = invoke;
    lodash.keys = keys;
    lodash.map = map;
    lodash.mapValues = mapValues;
    lodash.max = max;
    lodash.memoize = memoize;
    lodash.merge = merge;
    lodash.min = min;
    lodash.omit = omit;
    lodash.once = once;
    lodash.pairs = pairs;
    lodash.partial = partial;
    lodash.partialRight = partialRight;
    lodash.pick = pick;
    lodash.pluck = pluck;
    lodash.property = property;
    lodash.pull = pull;
    lodash.range = range;
    lodash.reject = reject;
    lodash.remove = remove;
    lodash.rest = rest;
    lodash.shuffle = shuffle;
    lodash.sortBy = sortBy;
    lodash.tap = tap;
    lodash.throttle = throttle;
    lodash.times = times;
    lodash.toArray = toArray;
    lodash.transform = transform;
    lodash.union = union;
    lodash.uniq = uniq;
    lodash.values = values;
    lodash.where = where;
    lodash.without = without;
    lodash.wrap = wrap;
    lodash.xor = xor;
    lodash.zip = zip;
    lodash.zipObject = zipObject;

    // add aliases
    lodash.collect = map;
    lodash.drop = rest;
    lodash.each = forEach;
    lodash.eachRight = forEachRight;
    lodash.extend = assign;
    lodash.methods = functions;
    lodash.object = zipObject;
    lodash.select = filter;
    lodash.tail = rest;
    lodash.unique = uniq;
    lodash.unzip = zip;

    // add functions to `lodash.prototype`
    mixin(lodash);

    /*--------------------------------------------------------------------------*/

    // add functions that return unwrapped values when chaining
    lodash.clone = clone;
    lodash.cloneDeep = cloneDeep;
    lodash.contains = contains;
    lodash.escape = escape;
    lodash.every = every;
    lodash.find = find;
    lodash.findIndex = findIndex;
    lodash.findKey = findKey;
    lodash.findLast = findLast;
    lodash.findLastIndex = findLastIndex;
    lodash.findLastKey = findLastKey;
    lodash.has = has;
    lodash.identity = identity;
    lodash.indexOf = indexOf;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isBoolean = isBoolean;
    lodash.isDate = isDate;
    lodash.isElement = isElement;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isNaN = isNaN;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isPlainObject = isPlainObject;
    lodash.isRegExp = isRegExp;
    lodash.isString = isString;
    lodash.isUndefined = isUndefined;
    lodash.lastIndexOf = lastIndexOf;
    lodash.mixin = mixin;
    lodash.noConflict = noConflict;
    lodash.noop = noop;
    lodash.now = now;
    lodash.parseInt = parseInt;
    lodash.random = random;
    lodash.reduce = reduce;
    lodash.reduceRight = reduceRight;
    lodash.result = result;
    lodash.runInContext = runInContext;
    lodash.size = size;
    lodash.some = some;
    lodash.sortedIndex = sortedIndex;
    lodash.template = template;
    lodash.unescape = unescape;
    lodash.uniqueId = uniqueId;

    // add aliases
    lodash.all = every;
    lodash.any = some;
    lodash.detect = find;
    lodash.findWhere = find;
    lodash.foldl = reduce;
    lodash.foldr = reduceRight;
    lodash.include = contains;
    lodash.inject = reduce;

    mixin(function() {
      var source = {}
      forOwn(lodash, function(func, methodName) {
        if (!lodash.prototype[methodName]) {
          source[methodName] = func;
        }
      });
      return source;
    }(), false);

    /*--------------------------------------------------------------------------*/

    // add functions capable of returning wrapped and unwrapped values when chaining
    lodash.first = first;
    lodash.last = last;
    lodash.sample = sample;

    // add aliases
    lodash.take = first;
    lodash.head = first;

    forOwn(lodash, function(func, methodName) {
      var callbackable = methodName !== 'sample';
      if (!lodash.prototype[methodName]) {
        lodash.prototype[methodName]= function(n, guard) {
          var chainAll = this.__chain__,
              result = func(this.__wrapped__, n, guard);

          return !chainAll && (n == null || (guard && !(callbackable && typeof n == 'function')))
            ? result
            : new lodashWrapper(result, chainAll);
        };
      }
    });

    /*--------------------------------------------------------------------------*/

    /**
     * The semantic version number.
     *
     * @static
     * @memberOf _
     * @type string
     */
    lodash.VERSION = '2.4.1';

    // add "Chaining" functions to the wrapper
    lodash.prototype.chain = wrapperChain;
    lodash.prototype.toString = wrapperToString;
    lodash.prototype.value = wrapperValueOf;
    lodash.prototype.valueOf = wrapperValueOf;

    // add `Array` functions that return unwrapped values
    forEach(['join', 'pop', 'shift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        var chainAll = this.__chain__,
            result = func.apply(this.__wrapped__, arguments);

        return chainAll
          ? new lodashWrapper(result, chainAll)
          : result;
      };
    });

    // add `Array` functions that return the existing wrapped value
    forEach(['push', 'reverse', 'sort', 'unshift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        func.apply(this.__wrapped__, arguments);
        return this;
      };
    });

    // add `Array` functions that return new wrapped values
    forEach(['concat', 'slice', 'splice'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);
      };
    });

    return lodash;
  }

  /*--------------------------------------------------------------------------*/

  // expose Lo-Dash
  var _ = runInContext();

  // some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Lo-Dash to the global object even when an AMD loader is present in
    // case Lo-Dash is loaded with a RequireJS shim config.
    // See http://requirejs.org/docs/api.html#config-shim
    root._ = _;

    // define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module
    define(function() {
      return _;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Node.js or RingoJS
    if (moduleExports) {
      (freeModule.exports = _)._ = _;
    }
    // in Narwhal or Rhino -require
    else {
      freeExports._ = _;
    }
  }
  else {
    // in a browser or Rhino
    root._ = _;
  }
}.call(this));

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],92:[function(require,module,exports){
var BindableObject = require("bindable-object"),
uuid         = require("uuid");

// UUID for each created item
var cidPrehash = uuid.v4(),
_cid = 1;

function generateCid () {
  return cidPrehash + "-" + (_cid++);
}

function RegisteredClasses (application) {
  BindableObject.call(this);
  this._classes = {};
  this.application = application;
}

module.exports = BindableObject.extend(RegisteredClasses, {
  register: function (nameOrClasses, clazz) {

    if (typeof nameOrClasses === "object") {
      for (var name in nameOrClasses) {
        this.register(name, nameOrClasses[name]);
      }
      return;
    }

    this._classes[nameOrClasses.substr(0, 1).toLowerCase() + nameOrClasses.substr(1)] = clazz;
  },
  create: function (name, options) {
    var clazz = this._classes[name];
    if (!clazz) throw new Error("class '" + name + "' doesn't exist");
    options = options == null ? {} : options;

    options.__name = name;

    // generate the CID - this can be overridden, but is
    // generally used internally, especially for realtime systems
    if (!options._cid) options._cid   = generateCid();

    return new clazz(options, this.application);
  }
});

},{"bindable-object":7,"uuid":94}],93:[function(require,module,exports){
(function (global){

var rng;

if (global.crypto && crypto.getRandomValues) {
  // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
  // Moderately fast, high quality
  var _rnds8 = new Uint8Array(16);
  rng = function whatwgRNG() {
    crypto.getRandomValues(_rnds8);
    return _rnds8;
  };
}

if (!rng) {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var  _rnds = new Array(16);
  rng = function() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return _rnds;
  };
}

module.exports = rng;


}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],94:[function(require,module,exports){
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

// Unique ID creation requires a high quality random # generator.  We feature
// detect to determine the best RNG source, normalizing to a function that
// returns 128-bits of randomness, since that's what's usually required
var _rng = require('./rng');

// Maps for number <-> hex string conversion
var _byteToHex = [];
var _hexToByte = {};
for (var i = 0; i < 256; i++) {
  _byteToHex[i] = (i + 0x100).toString(16).substr(1);
  _hexToByte[_byteToHex[i]] = i;
}

// **`parse()` - Parse a UUID into it's component bytes**
function parse(s, buf, offset) {
  var i = (buf && offset) || 0, ii = 0;

  buf = buf || [];
  s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
    if (ii < 16) { // Don't overflow!
      buf[i + ii++] = _hexToByte[oct];
    }
  });

  // Zero out remaining bytes if string was short
  while (ii < 16) {
    buf[i + ii++] = 0;
  }

  return buf;
}

// **`unparse()` - Convert UUID byte array (ala parse()) into a string**
function unparse(buf, offset) {
  var i = offset || 0, bth = _byteToHex;
  return  bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]];
}

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

// random #'s we need to init node and clockseq
var _seedBytes = _rng();

// Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
var _nodeId = [
  _seedBytes[0] | 0x01,
  _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
];

// Per 4.2.2, randomize (14 bit) clockseq
var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

// Previous uuid creation time
var _lastMSecs = 0, _lastNSecs = 0;

// See https://github.com/broofa/node-uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};

  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  var node = options.node || _nodeId;
  for (var n = 0; n < 6; n++) {
    b[i + n] = node[n];
  }

  return buf ? buf : unparse(b);
}

// **`v4()` - Generate random UUID**

// See https://github.com/broofa/node-uuid for API details
function v4(options, buf, offset) {
  // Deprecated - 'format' argument, as supported in v1.2
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options == 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || _rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ii++) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || unparse(rnds);
}

// Export public API
var uuid = v4;
uuid.v1 = v1;
uuid.v4 = v4;
uuid.parse = parse;
uuid.unparse = unparse;

module.exports = uuid;

},{"./rng":93}],95:[function(require,module,exports){
var protoclass = require("protoclass"),
paperclip      = require("paperclip");

var decorator = {

  /**
   */

  multi: false,

  /**
   */

  priority: "render",

  /**
   */

  getOptions: function (view) {
    return view.__isView;
  },

  /**
   */

  decorate: function (view, options) {

    var listening, rendered, content, template;
    view._define("paper");
    view.on("render", render);
    view.on("remove", remove);
    view.on("change:paper", onPaperChange);
    view.on("change:visible", onVisibiltyChange);
    if (view.paper) onPaperChange(view.paper);

    var paper;

    function render () {


      if (view.paper !== paper) { 
        if (content) content.dispose();
        rendered = false;
        paper    = view.paper;
        template =  paperclip.template(paper, view.application);
      }

      if (rendered || !template) return;

      rendered = true;

      if (content) {
        content.bind(view);
      } else {
        view.section.paper = content = template.view(view, view.section);
      }

    }

    function remove (hard) {
      if (!content) return;
      content.unbind();
      rendered = false;
    }

    function onVisibiltyChange (v) {
      if(v) {
        render();
      } else {
        remove();
      }
    }

    function onPaperChange (paper) {
      if (rendered && view.visible) {
        render();
      }
    }
  }
}


module.exports = function (app) {
  app.bind("views", { to: function (views) {
    if (views.__paperclip) return;
    views.__paperclip = true;
    app.use(paperclip);
    views.decorator(decorator);
  }}).now();
}


},{"paperclip":257,"protoclass":96}],96:[function(require,module,exports){
module.exports=require(46)
},{}],97:[function(require,module,exports){
(function (process){
var crowbar = require("crowbar");

module.exports = function (app) {

  // TODO - require mojo-bootstrap instead
  if (!app.mediator) app.use(require("mojo-mediator"));

  app.bind("paperclip", { to: function (paperclip) {
    app.paperclip.attrBinding("data-href", require("./plugins/datahref"));
  }}).now();

  app.use(require("./plugins/statesRouter"));


  var r = crowbar();
  app.set("router", r);

  r.bind("location"        , { target: app, to: "location"      });
  r.bind("location.query"  , { target: app, to: "models.query"  });
  r.bind("location.params" , { target: app, to: "models.params" });
  r.bind("location.states" , { target: app, to: "models.states" });

  // want to load on pre bootstrap to beat anything such as i18n loading, and
  // initializing views

  // UPDATE - want to make sure that check session is initialized before this (CC)
  app.mediator.on("post bootstrap", function (message, next) {

    if (process.browser && message.data.useHistory !== false) {
      r.use(crowbar.listeners.http);
    }

    r.init();

    next();
  });


  // express plugin
  r.middleware = function (options) {

    if (!options) options = {};
    if (!options.mainViewName) options.mainViewName = "main";

    var cachedViews = {},
    getProps        = options.getProps || function (request) {
      return {};
    }

    return function (req, res, next) {
      var request = r.request(req.url);
      request.request = req;
      request.enter(function (err, ret) {

        if (err) {
          if (err.code == "404") return next();
          return next();
        }

        if (ret.redirect) {
          return res.redirect(ret.redirect);
        }

        var viewName = request.route.options.view || options.mainViewName,
        view;

        if (app.debug || !(view = cachedViews[viewName])) {
          view = cachedViews[viewName] = app.views.create(viewName);
          view.render();
        }

        var props = getProps(request);
        props.states = request.get("states");

        view.setProperties(props);

        var html = view.section.toString();

        res.send(html);

        if (app.debug) view.dispose(); // cleanup - need to remove all bindings here.

      })
    }
  }

  return r;
};

}).call(this,require("OpdoqP"))
},{"./plugins/datahref":98,"./plugins/statesRouter":99,"OpdoqP":65,"crowbar":106,"mojo-mediator":143}],98:[function(require,module,exports){
(function (process){
var pc = require("paperclip"),
noselector = require("noselector"),
janitor    = require("janitorjs"),
BindableObject   = require("bindable-object"),
_          = require("lodash");

module.exports = pc.BaseAttrBinding.extend({
  didChange: function (href) {
    this._href = href;
  },
  bind: function (context) {

    pc.BaseAttrBinding.prototype.bind.apply(this, arguments);

    var $node = this.$node = noselector(this.node),
    href      = this._href,
    self      = this,
    pathname  = "",
    loc       = "";


    $node.bind("click", self._onClick = function (event) {

      if (event.metaKey || event.ctrlKey) {
        return;
      }

      event.preventDefault();

      context.get("application.router").redirect(pathname);
    });


    this._locationBinding = context.bind("application.location", function (location) {

      if (!location) location = new BindableObject();
      if (self._bindings) self._bindings.dispose();

      var pparams = location.get("params"),
      params      = new BindableObject(_.extend({}, pparams ? pparams.toJSON() : {})),
      route       = context.get("application.router").routes.find({ pathname: href, params: params });

      function setHref () {

        loc = (process.browser ? "#!" : "") + (pathname = route.getPathname({params:params}));
        if (self.node.nodeName === "A") {
          $node.attr("href", loc);
        }
      }
      self._bindings = janitor();

      if (!route) return;

      route.params.forEach(function (param, i) {
        params.set(param, self.context.get(param));
        self._bindings.add(self.context.bind(param, { to: function (_id) {
          params.set(param, _id);
        }}).now());
      });


      setHref();
      params.on("change", setHref);
        
    }).now();
  },

  unbind: function () {
    var ret = pc.BaseAttrBinding.prototype.unbind.apply(this, arguments);
    if (this._bindings) this._bindings.dispose();
    if (this.$node) this.$node.unbind("click", this._onClick);
    if (this._locationBinding) this._locationBinding.dispose();
    return ret;
  }
});

}).call(this,require("OpdoqP"))
},{"OpdoqP":65,"bindable-object":7,"janitorjs":139,"lodash":142,"noselector":155,"paperclip":257}],99:[function(require,module,exports){
module.exports = function (app) {

  var d = {
      priority: "load",
      getOptions: function (view) {
        return view.route;
      },
      decorate: function (view, route) {
        var binding = view.bind("models.states." + route, { to: function (v) {
          view.set("currentName", v);
        }}).now();
        view.once("dispose", binding.dispose);
      }
  }

  if (app.views) {
    app.views.decorator(d);
  } else if(app.decorator) {
    app.decorator(d);
  }

}




},{}],100:[function(require,module,exports){
module.exports=require(59)
},{"OpdoqP":65}],101:[function(require,module,exports){
var toarray = require("toarray"),
async       = require("async");

module.exports = {
  test: function (route) {
    return true;
  },
  decorate: function (route) {

    function wrapHandler (handlers) {
      return function (message, next) {
        if (!handlers.length) return next();
        var location = message.data;
        async.eachSeries(handlers, function (handler, next) {

          if (handler.length < 2) {
            handler(message.data);
            return next();
          }

          handler(message.data, next);
        }, next);
      };
    }

    route.mediator.on("enter", wrapHandler(toarray(route.options.enter)));
    route.mediator.on("exit", wrapHandler(toarray(route.options.exit)));
  }
}
},{"async":100,"toarray":138}],102:[function(require,module,exports){
var protoclass = require("protoclass"),
defaultDecorators = [
  require("./parentEnterExit"),
  require("./enterExit"),
  require("./states"),
  require("./redirect")
];

function Decorators () {
  this._decorators = defaultDecorators.concat();
}


protoclass(Decorators, {
  add: function (decorator) {
    this._decorators.push(decorator);
    this._resort();
  },
  decorate: function (route) {

    for (var i = this._decorators.length; i--;) {
      var decorator = this._decorators[i];
      if (decorator.test(route)) {
        decorator.decorate(route);
      }
    }

    return route;
  },
  _resort: function () {
    this._decorators = this._decorators.sort(function (a, b) {
      return a.priority > b.priority ? -1 : 1;
    });
  }
});

module.exports = Decorators;

},{"./enterExit":101,"./parentEnterExit":103,"./redirect":104,"./states":105,"protoclass":137}],103:[function(require,module,exports){
module.exports = {
  priority: 999,
  test: function (route) {
    return !!route.parent;
  },
  decorate: function (route) {
    var p = route.parent;
    route.mediator.on("pre enter", function (message, next) {
      p.enter(message.data, next);
    });
    route.mediator.on("pre exit", function (message, next) {
      p.exit(message.data, next);
    });
  }
}

},{}],104:[function(require,module,exports){
var toarray = require("toarray"),
async       = require("async");

module.exports = {
  test: function (route) {
    return route.options.redirect;
  },
  decorate: function (route) {

    var redirect = route.options.redirect;

    route.mediator.on("post enter", function (message, next) {
      message.data.redirect(redirect, next);
    });
  }
}

},{"async":100,"toarray":138}],105:[function(require,module,exports){
var toarray = require("toarray"),
async       = require("async"),
BindableObject    = require("bindable-object");

module.exports = {
  test: function (route) {
    return route.options.states;
  },
  decorate: function (route) {
    var states = route.options.states,
    router     = route.router;


    route.mediator.on("post enter", function (message, next) {

      if (!message.data.get("states")) {
        message.data.set("states", new BindableObject());
      }

      for (var key in states) {
        message.data.set("states." + key, states[key]);
      }
      next();
    });
  }
}
},{"async":100,"bindable-object":7,"toarray":138}],106:[function(require,module,exports){
var Router = require("./router");

module.exports = function (options) {
  return new Router(options);
}

module.exports.listeners = require("./listeners");
},{"./listeners":108,"./router":112}],107:[function(require,module,exports){
(function (process){
var hasher = process.browser ? require("hasher") : void 0;

module.exports = function (router) {


  function onHashChange (newHash) {

    // make sure any hash stuff isn't included
    router.redirect(String(newHash || window.location.hash).replace(/^#?!?\/?(.*)/,"/$1"), function (err) {

      if (err && err.code === "404") {
        router.redirect("404");
      }

      var url = router.get("location.url");

      if (url) {
        window.location.hash = "!" + url;
      }
    });
  }

  router.bind("location.url", function (url) {
    window.location.hash = "!" + url
  });

  hasher.changed.add(onHashChange);
  hasher.initialized.add(onHashChange);

  router.once("init", function () {
    hasher.init();
  })
}

}).call(this,require("OpdoqP"))
},{"OpdoqP":65,"hasher":115}],108:[function(require,module,exports){
module.exports = {
  http: require("./http")
}
},{"./http":107}],109:[function(require,module,exports){
var BindableObject = require("bindable-object"),
_            = require("lodash"),
qs           = require("querystring"),
outcome      = require("outcome"),
comerr       = require("comerr");

function Location (router, options) {
  BindableObject.call(this, this);

  if (!options) options = {};

  this.pathname = options.pathname;
  this.options = options;
  this.query  = new BindableObject();
  this.query.setProperties(options.query || {});
  this.params = new BindableObject();
  this.params.setProperties(options.params || {});
  this.route  = options.route;
  this.router = router;


  this._rebuildUrl = _.bind(this._rebuildUrl, this);

  this.query.on("change", this._rebuildUrl);
  this.params.on("change", this._rebuildUrl);
  this.on("change", this._rebuildUrl);
  this._rebuildUrl();
}

BindableObject.extend(Location, {

  /**
   */

  equals: function (location) {
    return this.pathname == location.pathname;
  },


  /**
   */

  merge: function (request) {

    this.setProperties({ 
      route    : request.route,
      params   : request.params
    });

    this.mergeQuery(request.query.toJSON());
    return this;
  },

  /**
   */

  enter: function (next) {

    
    if (!this.route) {
      return next(comerr.notFound("path " + this.pathname + "not found"));
    }

    var self = this;

    self.once("complete", next);


    // new path? re-renter
    this.route.enter(this, outcome.e(next).s(function () {
      self.emit("complete", void 0, {});
    }));
  },

  /**
   */

  redirect: function (path, options, next) {

    if (typeof options === "function") {
      next = options;
      options = {};
    }

    if (!next) next = function () {};


    this.emit("complete", void 0, {
      redirect: /^http/.test(path) ? path : this.router.routes.getPathnameWithParams(path, options || {})
    });

    
  },

  /**
   */

  mergeQuery: function (q) {
    for (var property in q) {
      // if (this.query.has(property)) continue;
      this.query.set(property, q[property]);
    }
  },

  /**
   */

  _rebuildUrl: function () {

    var url = this.get("pathname");

    if (Object.keys(this.query.toJSON()).length) {
      url += "?" + qs.stringify(this.query.toJSON());
    }

    this.set("url", url);
  }
});


module.exports = Location;

},{"bindable-object":7,"comerr":114,"lodash":142,"outcome":136,"querystring":69}],110:[function(require,module,exports){
var async = require("async")

module.exports = function (router) {

  var paramHandlers = {};

  router.param = function (name, fn) {
    paramHandlers[name] = fn;
    fn.paramName = name;
  }

  router.routes.decorators.add({
    test: function (route) {
      return !!route.params.length;
    },
    decorate: function (route) {

      var phandlers = route.params.map(function (name) {
        return paramHandlers[name];
      }).filter(function (h) {
        return !!h;
      });

      if (!phandlers.length) return;

      route.mediator.on("pre enter", function (message, next) {
        async.eachSeries(phandlers, function (handler, next) {

          var location = message.data,
          keyName      = "params." + handler.paramName;

          handler(location, function (err, value) {

            if (err) return next(err);
            if (value != null) {
              location.set(keyName, value);
            }

            next();
          });
        }, next);
      });
    }
  });
}

},{"async":100}],111:[function(require,module,exports){
var BindableObject = require("bindable-object"),
async        = require("async"),
toarray      = require("toarray"),
mediocre     = require("mediocre");

function Route (pathname, options, routes, parent) {

  BindableObject.call(this, this);

  this.pathname = pathname;
  this.parent   = parent;
  this.options  = options;
  this.routes   = routes;
  this.router   = routes.router;
  this.mediator = mediocre();
  this._setPathInfo();
}

BindableObject.extend(Route, {

  /**
   */

  enter: function (request, next) {
    this.mediator.execute("enter", request, next);
  },

  /**
   */

  exit: function (request, next) {
    this.mediator.execute("exit", request, next);
  },

  /**
   */

  match: function (query) {
    if (query.pathname && !this._matchPath(query.pathname)) return false;
    return this._matchOption(query);
  },

  /**
   */

  getParams: function (reqPath) {

    var routePath = this.pathname;

    var reqPathParts = reqPath.split("/"),
    routePathParts   = routePath.split("/"),
    params = {};

    for (var i = routePathParts.length; i--;) {

      var part = routePathParts[i];

      if (part.substr(0, 1) === ":") {
        params[part.substr(1)] = reqPathParts[i];
      }
    }

    return params;
  },

  /**
   * DEPRECATED
   */

  getPathnameWithParams: function (params) {
    var pathname = this.pathname;

    for (var key in params) {
      pathname = pathname.replace(":" + key, params[key]);
    }

    pathname = pathname.replace(/\:[^\/]+/g, void 0);

    var redirectRoute = this.routes.find({ pathname: pathname, params: params });

    if (redirectRoute !== this) {
      return redirectRoute.getPathnameWithParams(params);
    }

    return pathname;
  },

  /**
   */

  getPathname: function (options) {

    var params = options.params || {},
    query      = options.query || {};

    if (!params.__isBindable) {
      params = new BindableObject();
      params.setProperties(options.params || {});
    }

    if (!query.__isBindable) {
      query = new BindableObject(query);
      query.setProperties(options.query || {});
    }

    var pathname = this.pathname,
    pcontext      = params;

    var paramParts = pathname.match(/\:[^\/]+/g) || [];

    for (var i = paramParts.length; i--;) {
      pathname = pathname.replace(paramParts[i], params.get(paramParts[i].substr(1)));
    }

    var redirectRoute = this.routes.find({ 
      pathname: pathname, 
      params: params, 
      query: query 
    });

    if (redirectRoute && redirectRoute !== this) {
      return redirectRoute.getPathname({ params: params, query: query });
    }

    return pathname;
  },

  /**
   */

  _matchPath: function (pathname) {
    return this._pathTester.test(pathname) || this.options.name === pathname;
  },

  /**
   */

  _matchOption: function (query) {
    return !this.options.match || this.options.match(query);
  },

  /**
   */

  _setPathInfo: function () {

    this.params = [];

    if (!this.pathname) return;

    this._pathTester = new RegExp("^" + this.pathname.replace(/\/\:[^\/]+/g, "/[^\/]+") + "$");

    var paramNames = this.pathname.match((/\/\:[^\/]+/g)) || [];


    for (var i = paramNames.length; i--;) {
      this.params.unshift(paramNames[i].substr(2));
    }
  }
});


module.exports = Route;

},{"async":100,"bindable-object":7,"mediocre":122,"toarray":138}],112:[function(require,module,exports){
var protoclass = require("protoclass"),
BindableObject       = require("bindable-object"),
Location        = require("./location"),
Routes         = require("./routes"),
async          = require("async"),
_              = require("lodash");

function Router (options) {

  BindableObject.call(this, this);

  this.routes = new Routes(this);

  this.middleware = _.bind(this.middleware, this);
  var self = this;

  this.use(require("./plugins/param"));
}

BindableObject.extend(Router, {

  /**
   */

  use: function () {
    for (var i = arguments.length; i--;) {
      arguments[i](this);
    }
    return this;
  },

  /**
   */

  middleware: function (req, res, next) {
    var r = this.request(req.url);
    r.enter(function (err, location) {
      if (err && err.code != "404") {
        console.log(err.code);
        return next(err);
      }
      req.location = r;
      next();
    });
  },


  /**
   */

  init: function () {
    this.emit("init");
  },

  /**
   */

  redirect: function (path, options, next) {

    if (!options) options = {};

    if (typeof options === "function") {
      next = options;
      options = {};
    }

    if (!next) next = function () {};
    var self = this;

    var request = this.request(path, options);

    if (this.location) {
      if (this.location.equals(request)) {
        this.location.merge(request);
        return next(null, self.location);
      }
      request.mergeQuery(this.location.query.toJSON());
    }


    // new path? re-renter
    request.enter(function (err, response) {
      if (err) {
        self.emit("error", err);
        return next(err);
      }
      if (response.redirect) {
        return self.redirect(response.redirect, next);
      }
      self.set("location", request);
      next(null, request);
    });

    return this;
  },

  /**
   */

  route: function (route) {
    this.routes.add(route);
    return this;
  },

  /**
   * DEPRECATED
   */

  add: function (route) {
    return this.route(route);
  },

  /**
   */

  request: function (path, options) {
    return new Location(this, this.routes.parsePath(path, options));
  }
});


module.exports = Router;

},{"./location":109,"./plugins/param":110,"./routes":113,"async":100,"bindable-object":7,"lodash":142,"protoclass":137}],113:[function(require,module,exports){
var BindableObject = require("bindable-object"),
Route        = require("./route"),
Decorators   = require("./decorators"),
Url            = require("url"),
qs             = require("querystring");

function Routes (router) {
  this._source    = [];
  this.router     = router;
  this.decorators = new Decorators();
}

BindableObject.extend(Routes, {

  /**
   */


  parsePath: function (path, options, location) {

    if (!options) options = { };

    // parse route ~ /path/to/route?query=value
    var pathParts = Url.parse(path, true);

    // find based on the path
    var route   = this.find(pathParts);

    // return if 404
    if (!route) {
      return pathParts;
    }

    // if the route name matches the pathname, then
    // rebuild the REAL path
    if (route.options.name === pathParts.pathname) {

      // rebuild the path, and parse it
      pathParts = Url.parse(route.getPathname(options));

      // pass the query and params
      pathParts.query  = options.query;
      pathParts.params = options.params;
    } else {

      // otherwise, fetch the params from the route path
      pathParts.params = route.getParams(pathParts.pathname);
    }

    pathParts.route  = route;

    return pathParts;
  },

  /**
   */

  getPathnameWithParams: function (path, options) {

    var options = this.parsePath(path, options);

    if (!options.route) return null;

    var url = options.route.getPathnameWithParams(options.params);

    if (options.query) {
      str = qs.stringify(options.query)
      url += str != "" ? "?" + str : "";
    }

    return url;
  },

  /**
   */

  add: function (routes, parent) {

    if (!routes) return;
    if (!parent) this.decorators.decorate(parent = new Route(null, routes, this));

    for (var key in routes) {
      if (key.substr(0, 1) === "/") {

        var routeOptions = routes[key],
        routePath = (parent.pathname || "") + key,
        route;

        this._source.push(this.decorators.decorate(route = new Route(routePath, routeOptions, this, parent)));

        // add route options. might not exist.
        this.add(routeOptions.routes || routeOptions, route);
      }
    }

    this._resort();

    return this;
  },

  /**
   */

  all: function () {
    return this._source;
  },

  /**
   */

  find: function (query) {

    if (query.pathname && query.pathname !== "/") {
      query.pathname = query.pathname.replace(/\/+$/, "")
    }

    for (var i = this._source.length; i--;) {
      var route = this._source[i],
      ret;
      if (ret = route.match(query)) {
        if (ret && ret.redirect) {
          var redirect = ret.redirect;
          return this.find(typeof redirect === "string" ? { pathname: redirect } : redirect);
        }
        return route;
      }
    }
  },

  /**
   */

  _resort: function () {
    this._source = this._source.sort(function (a, b) {

      var ap = a.pathname.split("/"),
      bp     = b.pathname.split("/");

      if (ap.length > bp.length) {
        return -1;
      } else if (ap.length < bp.length) {
        return 1;
      }

      for (var i = 0, n = ap.length; i < n; i++) {

        var apn = ap[i],
        bpn     = bp[i];

        if (apn !== bpn)
        if (apn.substr(0, 1) === ":") {
          return -1;
        } else {
          return 1;
        }
      }

      return 1;
    });
  }
});


module.exports = Routes;

},{"./decorators":102,"./route":111,"bindable-object":7,"querystring":69,"url":70}],114:[function(require,module,exports){
module.exports=require(87)
},{}],115:[function(require,module,exports){
/*!!
 * Hasher <http://github.com/millermedeiros/hasher>
 * @author Miller Medeiros
 * @version 1.2.0 (2013/11/11 03:18 PM)
 * Released under the MIT License
 */

;(function () {
var factory = function(signals){

/*jshint white:false*/
/*global signals:false, window:false*/

/**
 * Hasher
 * @namespace History Manager for rich-media applications.
 * @name hasher
 */
var hasher = (function(window){

    //--------------------------------------------------------------------------------------
    // Private Vars
    //--------------------------------------------------------------------------------------

    var

        // frequency that it will check hash value on IE 6-7 since it doesn't
        // support the hashchange event
        POOL_INTERVAL = 25,

        // local storage for brevity and better compression --------------------------------

        document = window.document,
        history = window.history,
        Signal = signals.Signal,

        // local vars ----------------------------------------------------------------------

        hasher,
        _hash,
        _checkInterval,
        _isActive,
        _frame, //iframe used for legacy IE (6-7)
        _checkHistory,
        _hashValRegexp = /#(.*)$/,
        _baseUrlRegexp = /(\?.*)|(\#.*)/,
        _hashRegexp = /^\#/,

        // sniffing/feature detection -------------------------------------------------------

        //hack based on this: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
        _isIE = (!+"\v1"),
        // hashchange is supported by FF3.6+, IE8+, Chrome 5+, Safari 5+ but
        // feature detection fails on IE compatibility mode, so we need to
        // check documentMode
        _isHashChangeSupported = ('onhashchange' in window) && document.documentMode !== 7,
        //check if is IE6-7 since hash change is only supported on IE8+ and
        //changing hash value on IE6-7 doesn't generate history record.
        _isLegacyIE = _isIE && !_isHashChangeSupported,
        _isLocal = (location.protocol === 'file:');


    //--------------------------------------------------------------------------------------
    // Private Methods
    //--------------------------------------------------------------------------------------

    function _escapeRegExp(str){
        return String(str || '').replace(/\W/g, "\\$&");
    }

    function _trimHash(hash){
        if (!hash) return '';
        var regexp = new RegExp('^' + _escapeRegExp(hasher.prependHash) + '|' + _escapeRegExp(hasher.appendHash) + '$', 'g');
        return hash.replace(regexp, '');
    }

    function _getWindowHash(){
        //parsed full URL instead of getting window.location.hash because Firefox decode hash value (and all the other browsers don't)
        //also because of IE8 bug with hash query in local file [issue #6]
        var result = _hashValRegexp.exec( hasher.getURL() );
        var path = (result && result[1]) || '';
        try {
          return hasher.raw? path : decodeURIComponent(path);
        } catch (e) {
          // in case user did not set `hasher.raw` and decodeURIComponent
          // throws an error (see #57)
          return path;
        }
    }

    function _getFrameHash(){
        return (_frame)? _frame.contentWindow.frameHash : null;
    }

    function _createFrame(){
        _frame = document.createElement('iframe');
        _frame.src = 'about:blank';
        _frame.style.display = 'none';
        document.body.appendChild(_frame);
    }

    function _updateFrame(){
        if(_frame && _hash !== _getFrameHash()){
            var frameDoc = _frame.contentWindow.document;
            frameDoc.open();
            //update iframe content to force new history record.
            //based on Really Simple History, SWFAddress and YUI.history.
            frameDoc.write('<html><head><title>' + document.title + '</title><script type="text/javascript">var frameHash="' + _hash + '";</script></head><body>&nbsp;</body></html>');
            frameDoc.close();
        }
    }

    function _registerChange(newHash, isReplace){
        if(_hash !== newHash){
            var oldHash = _hash;
            _hash = newHash; //should come before event dispatch to make sure user can get proper value inside event handler
            if(_isLegacyIE){
                if(!isReplace){
                    _updateFrame();
                } else {
                    _frame.contentWindow.frameHash = newHash;
                }
            }
            hasher.changed.dispatch(_trimHash(newHash), _trimHash(oldHash));
        }
    }

    if (_isLegacyIE) {
        /**
         * @private
         */
        _checkHistory = function(){
            var windowHash = _getWindowHash(),
                frameHash = _getFrameHash();
            if(frameHash !== _hash && frameHash !== windowHash){
                //detect changes made pressing browser history buttons.
                //Workaround since history.back() and history.forward() doesn't
                //update hash value on IE6/7 but updates content of the iframe.
                //needs to trim hash since value stored already have
                //prependHash + appendHash for fast check.
                hasher.setHash(_trimHash(frameHash));
            } else if (windowHash !== _hash){
                //detect if hash changed (manually or using setHash)
                _registerChange(windowHash);
            }
        };
    } else {
        /**
         * @private
         */
        _checkHistory = function(){
            var windowHash = _getWindowHash();
            if(windowHash !== _hash){
                _registerChange(windowHash);
            }
        };
    }

    function _addListener(elm, eType, fn){
        if(elm.addEventListener){
            elm.addEventListener(eType, fn, false);
        } else if (elm.attachEvent){
            elm.attachEvent('on' + eType, fn);
        }
    }

    function _removeListener(elm, eType, fn){
        if(elm.removeEventListener){
            elm.removeEventListener(eType, fn, false);
        } else if (elm.detachEvent){
            elm.detachEvent('on' + eType, fn);
        }
    }

    function _makePath(paths){
        paths = Array.prototype.slice.call(arguments);

        var path = paths.join(hasher.separator);
        path = path? hasher.prependHash + path.replace(_hashRegexp, '') + hasher.appendHash : path;
        return path;
    }

    function _encodePath(path){
        //used encodeURI instead of encodeURIComponent to preserve '?', '/',
        //'#'. Fixes Safari bug [issue #8]
        path = encodeURI(path);
        if(_isIE && _isLocal){
            //fix IE8 local file bug [issue #6]
            path = path.replace(/\?/, '%3F');
        }
        return path;
    }

    //--------------------------------------------------------------------------------------
    // Public (API)
    //--------------------------------------------------------------------------------------

    hasher = /** @lends hasher */ {

        /**
         * hasher Version Number
         * @type string
         * @constant
         */
        VERSION : '1.2.0',

        /**
         * Boolean deciding if hasher encodes/decodes the hash or not.
         * <ul>
         * <li>default value: false;</li>
         * </ul>
         * @type boolean
         */
        raw : false,

        /**
         * String that should always be added to the end of Hash value.
         * <ul>
         * <li>default value: '';</li>
         * <li>will be automatically removed from `hasher.getHash()`</li>
         * <li>avoid conflicts with elements that contain ID equal to hash value;</li>
         * </ul>
         * @type string
         */
        appendHash : '',

        /**
         * String that should always be added to the beginning of Hash value.
         * <ul>
         * <li>default value: '/';</li>
         * <li>will be automatically removed from `hasher.getHash()`</li>
         * <li>avoid conflicts with elements that contain ID equal to hash value;</li>
         * </ul>
         * @type string
         */
        prependHash : '/',

        /**
         * String used to split hash paths; used by `hasher.getHashAsArray()` to split paths.
         * <ul>
         * <li>default value: '/';</li>
         * </ul>
         * @type string
         */
        separator : '/',

        /**
         * Signal dispatched when hash value changes.
         * - pass current hash as 1st parameter to listeners and previous hash value as 2nd parameter.
         * @type signals.Signal
         */
        changed : new Signal(),

        /**
         * Signal dispatched when hasher is stopped.
         * -  pass current hash as first parameter to listeners
         * @type signals.Signal
         */
        stopped : new Signal(),

        /**
         * Signal dispatched when hasher is initialized.
         * - pass current hash as first parameter to listeners.
         * @type signals.Signal
         */
        initialized : new Signal(),

        /**
         * Start listening/dispatching changes in the hash/history.
         * <ul>
         *   <li>hasher won't dispatch CHANGE events by manually typing a new value or pressing the back/forward buttons before calling this method.</li>
         * </ul>
         */
        init : function(){
            if(_isActive) return;

            _hash = _getWindowHash();

            //thought about branching/overloading hasher.init() to avoid checking multiple times but
            //don't think worth doing it since it probably won't be called multiple times.
            if(_isHashChangeSupported){
                _addListener(window, 'hashchange', _checkHistory);
            }else {
                if(_isLegacyIE){
                    if(! _frame){
                        _createFrame();
                    }
                    _updateFrame();
                }
                _checkInterval = setInterval(_checkHistory, POOL_INTERVAL);
            }

            _isActive = true;
            hasher.initialized.dispatch(_trimHash(_hash));
        },

        /**
         * Stop listening/dispatching changes in the hash/history.
         * <ul>
         *   <li>hasher won't dispatch CHANGE events by manually typing a new value or pressing the back/forward buttons after calling this method, unless you call hasher.init() again.</li>
         *   <li>hasher will still dispatch changes made programatically by calling hasher.setHash();</li>
         * </ul>
         */
        stop : function(){
            if(! _isActive) return;

            if(_isHashChangeSupported){
                _removeListener(window, 'hashchange', _checkHistory);
            }else{
                clearInterval(_checkInterval);
                _checkInterval = null;
            }

            _isActive = false;
            hasher.stopped.dispatch(_trimHash(_hash));
        },

        /**
         * @return {boolean}    If hasher is listening to changes on the browser history and/or hash value.
         */
        isActive : function(){
            return _isActive;
        },

        /**
         * @return {string} Full URL.
         */
        getURL : function(){
            return window.location.href;
        },

        /**
         * @return {string} Retrieve URL without query string and hash.
         */
        getBaseURL : function(){
            return hasher.getURL().replace(_baseUrlRegexp, ''); //removes everything after '?' and/or '#'
        },

        /**
         * Set Hash value, generating a new history record.
         * @param {...string} path    Hash value without '#'. Hasher will join
         * path segments using `hasher.separator` and prepend/append hash value
         * with `hasher.appendHash` and `hasher.prependHash`
         * @example hasher.setHash('lorem', 'ipsum', 'dolor') -> '#/lorem/ipsum/dolor'
         */
        setHash : function(path){
            path = _makePath.apply(null, arguments);
            if(path !== _hash){
                // we should store raw value
                _registerChange(path);
                if (path === _hash) {
                    // we check if path is still === _hash to avoid error in
                    // case of multiple consecutive redirects [issue #39]
                    if (! hasher.raw) {
                        path = _encodePath(path);
                    }
                    window.location.hash = '#' + path;
                }
            }
        },

        /**
         * Set Hash value without keeping previous hash on the history record.
         * Similar to calling `window.location.replace("#/hash")` but will also work on IE6-7.
         * @param {...string} path    Hash value without '#'. Hasher will join
         * path segments using `hasher.separator` and prepend/append hash value
         * with `hasher.appendHash` and `hasher.prependHash`
         * @example hasher.replaceHash('lorem', 'ipsum', 'dolor') -> '#/lorem/ipsum/dolor'
         */
        replaceHash : function(path){
            path = _makePath.apply(null, arguments);
            if(path !== _hash){
                // we should store raw value
                _registerChange(path, true);
                if (path === _hash) {
                    // we check if path is still === _hash to avoid error in
                    // case of multiple consecutive redirects [issue #39]
                    if (! hasher.raw) {
                        path = _encodePath(path);
                    }
                    window.location.replace('#' + path);
                }
            }
        },

        /**
         * @return {string} Hash value without '#', `hasher.appendHash` and `hasher.prependHash`.
         */
        getHash : function(){
            //didn't used actual value of the `window.location.hash` to avoid breaking the application in case `window.location.hash` isn't available and also because value should always be synched.
            return _trimHash(_hash);
        },

        /**
         * @return {Array.<string>} Hash value split into an Array.
         */
        getHashAsArray : function(){
            return hasher.getHash().split(hasher.separator);
        },

        /**
         * Removes all event listeners, stops hasher and destroy hasher object.
         * - IMPORTANT: hasher won't work after calling this method, hasher Object will be deleted.
         */
        dispose : function(){
            hasher.stop();
            hasher.initialized.dispose();
            hasher.stopped.dispose();
            hasher.changed.dispose();
            _frame = hasher = window.hasher = null;
        },

        /**
         * @return {string} A string representation of the object.
         */
        toString : function(){
            return '[hasher version="'+ hasher.VERSION +'" hash="'+ hasher.getHash() +'"]';
        }

    };

    hasher.initialized.memorize = true; //see #33

    return hasher;

}(window));


    return hasher;
};

if (typeof define === 'function' && define.amd) {
    define(['signals'], factory);
} else if (typeof exports === 'object') {
    module.exports = factory(require('signals'));
} else {
    /*jshint sub:true */
    window['hasher'] = factory(window['signals']);
}

}());

},{"signals":116}],116:[function(require,module,exports){
/*jslint onevar:true, undef:true, newcap:true, regexp:true, bitwise:true, maxerr:50, indent:4, white:false, nomen:false, plusplus:false */
/*global define:false, require:false, exports:false, module:false, signals:false */

/** @license
 * JS Signals <http://millermedeiros.github.com/js-signals/>
 * Released under the MIT license
 * Author: Miller Medeiros
 * Version: 1.0.0 - Build: 268 (2012/11/29 05:48 PM)
 */

(function(global){

    // SignalBinding -------------------------------------------------
    //================================================================

    /**
     * Object that represents a binding between a Signal and a listener function.
     * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
     * <br />- inspired by Joa Ebert AS3 SignalBinding and Robert Penner's Slot classes.
     * @author Miller Medeiros
     * @constructor
     * @internal
     * @name SignalBinding
     * @param {Signal} signal Reference to Signal object that listener is currently bound to.
     * @param {Function} listener Handler function bound to the signal.
     * @param {boolean} isOnce If binding should be executed just once.
     * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
     * @param {Number} [priority] The priority level of the event listener. (default = 0).
     */
    function SignalBinding(signal, listener, isOnce, listenerContext, priority) {

        /**
         * Handler function bound to the signal.
         * @type Function
         * @private
         */
        this._listener = listener;

        /**
         * If binding should be executed just once.
         * @type boolean
         * @private
         */
        this._isOnce = isOnce;

        /**
         * Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @memberOf SignalBinding.prototype
         * @name context
         * @type Object|undefined|null
         */
        this.context = listenerContext;

        /**
         * Reference to Signal object that listener is currently bound to.
         * @type Signal
         * @private
         */
        this._signal = signal;

        /**
         * Listener priority
         * @type Number
         * @private
         */
        this._priority = priority || 0;
    }

    SignalBinding.prototype = {

        /**
         * If binding is active and should be executed.
         * @type boolean
         */
        active : true,

        /**
         * Default parameters passed to listener during `Signal.dispatch` and `SignalBinding.execute`. (curried parameters)
         * @type Array|null
         */
        params : null,

        /**
         * Call listener passing arbitrary parameters.
         * <p>If binding was added using `Signal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.</p>
         * @param {Array} [paramsArr] Array of parameters that should be passed to the listener
         * @return {*} Value returned by the listener.
         */
        execute : function (paramsArr) {
            var handlerReturn, params;
            if (this.active && !!this._listener) {
                params = this.params? this.params.concat(paramsArr) : paramsArr;
                handlerReturn = this._listener.apply(this.context, params);
                if (this._isOnce) {
                    this.detach();
                }
            }
            return handlerReturn;
        },

        /**
         * Detach binding from signal.
         * - alias to: mySignal.remove(myBinding.getListener());
         * @return {Function|null} Handler function bound to the signal or `null` if binding was previously detached.
         */
        detach : function () {
            return this.isBound()? this._signal.remove(this._listener, this.context) : null;
        },

        /**
         * @return {Boolean} `true` if binding is still bound to the signal and have a listener.
         */
        isBound : function () {
            return (!!this._signal && !!this._listener);
        },

        /**
         * @return {boolean} If SignalBinding will only be executed once.
         */
        isOnce : function () {
            return this._isOnce;
        },

        /**
         * @return {Function} Handler function bound to the signal.
         */
        getListener : function () {
            return this._listener;
        },

        /**
         * @return {Signal} Signal that listener is currently bound to.
         */
        getSignal : function () {
            return this._signal;
        },

        /**
         * Delete instance properties
         * @private
         */
        _destroy : function () {
            delete this._signal;
            delete this._listener;
            delete this.context;
        },

        /**
         * @return {string} String representation of the object.
         */
        toString : function () {
            return '[SignalBinding isOnce:' + this._isOnce +', isBound:'+ this.isBound() +', active:' + this.active + ']';
        }

    };


/*global SignalBinding:false*/

    // Signal --------------------------------------------------------
    //================================================================

    function validateListener(listener, fnName) {
        if (typeof listener !== 'function') {
            throw new Error( 'listener is a required param of {fn}() and should be a Function.'.replace('{fn}', fnName) );
        }
    }

    /**
     * Custom event broadcaster
     * <br />- inspired by Robert Penner's AS3 Signals.
     * @name Signal
     * @author Miller Medeiros
     * @constructor
     */
    function Signal() {
        /**
         * @type Array.<SignalBinding>
         * @private
         */
        this._bindings = [];
        this._prevParams = null;

        // enforce dispatch to aways work on same context (#47)
        var self = this;
        this.dispatch = function(){
            Signal.prototype.dispatch.apply(self, arguments);
        };
    }

    Signal.prototype = {

        /**
         * Signals Version Number
         * @type String
         * @const
         */
        VERSION : '1.0.0',

        /**
         * If Signal should keep record of previously dispatched parameters and
         * automatically execute listener during `add()`/`addOnce()` if Signal was
         * already dispatched before.
         * @type boolean
         */
        memorize : false,

        /**
         * @type boolean
         * @private
         */
        _shouldPropagate : true,

        /**
         * If Signal is active and should broadcast events.
         * <p><strong>IMPORTANT:</strong> Setting this property during a dispatch will only affect the next dispatch, if you want to stop the propagation of a signal use `halt()` instead.</p>
         * @type boolean
         */
        active : true,

        /**
         * @param {Function} listener
         * @param {boolean} isOnce
         * @param {Object} [listenerContext]
         * @param {Number} [priority]
         * @return {SignalBinding}
         * @private
         */
        _registerListener : function (listener, isOnce, listenerContext, priority) {

            var prevIndex = this._indexOfListener(listener, listenerContext),
                binding;

            if (prevIndex !== -1) {
                binding = this._bindings[prevIndex];
                if (binding.isOnce() !== isOnce) {
                    throw new Error('You cannot add'+ (isOnce? '' : 'Once') +'() then add'+ (!isOnce? '' : 'Once') +'() the same listener without removing the relationship first.');
                }
            } else {
                binding = new SignalBinding(this, listener, isOnce, listenerContext, priority);
                this._addBinding(binding);
            }

            if(this.memorize && this._prevParams){
                binding.execute(this._prevParams);
            }

            return binding;
        },

        /**
         * @param {SignalBinding} binding
         * @private
         */
        _addBinding : function (binding) {
            //simplified insertion sort
            var n = this._bindings.length;
            do { --n; } while (this._bindings[n] && binding._priority <= this._bindings[n]._priority);
            this._bindings.splice(n + 1, 0, binding);
        },

        /**
         * @param {Function} listener
         * @return {number}
         * @private
         */
        _indexOfListener : function (listener, context) {
            var n = this._bindings.length,
                cur;
            while (n--) {
                cur = this._bindings[n];
                if (cur._listener === listener && cur.context === context) {
                    return n;
                }
            }
            return -1;
        },

        /**
         * Check if listener was attached to Signal.
         * @param {Function} listener
         * @param {Object} [context]
         * @return {boolean} if Signal has the specified listener.
         */
        has : function (listener, context) {
            return this._indexOfListener(listener, context) !== -1;
        },

        /**
         * Add a listener to the signal.
         * @param {Function} listener Signal handler function.
         * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
         * @return {SignalBinding} An Object representing the binding between the Signal and listener.
         */
        add : function (listener, listenerContext, priority) {
            validateListener(listener, 'add');
            return this._registerListener(listener, false, listenerContext, priority);
        },

        /**
         * Add listener to the signal that should be removed after first execution (will be executed only once).
         * @param {Function} listener Signal handler function.
         * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
         * @return {SignalBinding} An Object representing the binding between the Signal and listener.
         */
        addOnce : function (listener, listenerContext, priority) {
            validateListener(listener, 'addOnce');
            return this._registerListener(listener, true, listenerContext, priority);
        },

        /**
         * Remove a single listener from the dispatch queue.
         * @param {Function} listener Handler function that should be removed.
         * @param {Object} [context] Execution context (since you can add the same handler multiple times if executing in a different context).
         * @return {Function} Listener handler function.
         */
        remove : function (listener, context) {
            validateListener(listener, 'remove');

            var i = this._indexOfListener(listener, context);
            if (i !== -1) {
                this._bindings[i]._destroy(); //no reason to a SignalBinding exist if it isn't attached to a signal
                this._bindings.splice(i, 1);
            }
            return listener;
        },

        /**
         * Remove all listeners from the Signal.
         */
        removeAll : function () {
            var n = this._bindings.length;
            while (n--) {
                this._bindings[n]._destroy();
            }
            this._bindings.length = 0;
        },

        /**
         * @return {number} Number of listeners attached to the Signal.
         */
        getNumListeners : function () {
            return this._bindings.length;
        },

        /**
         * Stop propagation of the event, blocking the dispatch to next listeners on the queue.
         * <p><strong>IMPORTANT:</strong> should be called only during signal dispatch, calling it before/after dispatch won't affect signal broadcast.</p>
         * @see Signal.prototype.disable
         */
        halt : function () {
            this._shouldPropagate = false;
        },

        /**
         * Dispatch/Broadcast Signal to all listeners added to the queue.
         * @param {...*} [params] Parameters that should be passed to each handler.
         */
        dispatch : function (params) {
            if (! this.active) {
                return;
            }

            var paramsArr = Array.prototype.slice.call(arguments),
                n = this._bindings.length,
                bindings;

            if (this.memorize) {
                this._prevParams = paramsArr;
            }

            if (! n) {
                //should come after memorize
                return;
            }

            bindings = this._bindings.slice(); //clone array in case add/remove items during dispatch
            this._shouldPropagate = true; //in case `halt` was called before dispatch or during the previous dispatch.

            //execute all callbacks until end of the list or until a callback returns `false` or stops propagation
            //reverse loop since listeners with higher priority will be added at the end of the list
            do { n--; } while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false);
        },

        /**
         * Forget memorized arguments.
         * @see Signal.memorize
         */
        forget : function(){
            this._prevParams = null;
        },

        /**
         * Remove all bindings from signal and destroy any reference to external objects (destroy Signal object).
         * <p><strong>IMPORTANT:</strong> calling any method on the signal instance after calling dispose will throw errors.</p>
         */
        dispose : function () {
            this.removeAll();
            delete this._bindings;
            delete this._prevParams;
        },

        /**
         * @return {string} String representation of the object.
         */
        toString : function () {
            return '[Signal active:'+ this.active +' numListeners:'+ this.getNumListeners() +']';
        }

    };


    // Namespace -----------------------------------------------------
    //================================================================

    /**
     * Signals namespace
     * @namespace
     * @name signals
     */
    var signals = Signal;

    /**
     * Custom event broadcaster
     * @see Signal
     */
    // alias for backwards compatibility (see #gh-44)
    signals.Signal = Signal;



    //exports to multiple environments
    if(typeof define === 'function' && define.amd){ //AMD
        define(function () { return signals; });
    } else if (typeof module !== 'undefined' && module.exports){ //node
        module.exports = signals;
    } else { //browser
        //use string because of Google closure compiler ADVANCED_MODE
        /*jslint sub:true */
        global['signals'] = signals;
    }

}(this));

},{}],117:[function(require,module,exports){
module.exports=require(52)
},{"async":100,"type-component":135}],118:[function(require,module,exports){
module.exports=require(53)
},{"type-component":135}],119:[function(require,module,exports){
module.exports=require(54)
},{"./collection":117,"./fn":118,"./obj":120,"./ref":121}],120:[function(require,module,exports){
module.exports=require(55)
},{"async":100,"type-component":135}],121:[function(require,module,exports){
module.exports=require(56)
},{"type-component":135}],122:[function(require,module,exports){
module.exports=require(57)
},{"./factory":119,"./factory/collection":117,"./message":123,"async":100,"protoclass":137,"sift":134,"type-component":135}],123:[function(require,module,exports){
module.exports=require(58)
},{"bindable":126}],124:[function(require,module,exports){
module.exports=require(38)
},{"../object":127,"../utils/computed":130,"underscore":133}],125:[function(require,module,exports){
module.exports=require(39)
},{"protoclass":132}],126:[function(require,module,exports){
module.exports=require(40)
},{"./collection":124,"./core/eventEmitter":125,"./object":127,"./utils/computed":130,"./utils/options":131}],127:[function(require,module,exports){
module.exports=require(41)
},{"../core/eventEmitter":125,"./watchProperty":129,"protoclass":132}],128:[function(require,module,exports){
module.exports=require(42)
},{"toarray":138,"underscore":133}],129:[function(require,module,exports){
module.exports=require(43)
},{"../utils/options":131,"./transform":128,"OpdoqP":65,"underscore":133}],130:[function(require,module,exports){
module.exports=require(44)
},{"toarray":138}],131:[function(require,module,exports){
module.exports=require(45)
},{}],132:[function(require,module,exports){
module.exports=require(46)
},{}],133:[function(require,module,exports){
module.exports=require(48)
},{}],134:[function(require,module,exports){
module.exports=require(61)
},{}],135:[function(require,module,exports){
module.exports=require(34)
},{}],136:[function(require,module,exports){
(function (global){
var EventEmitter = require('events').EventEmitter,

//used for dispatching unhandledError messages
globalEmitter = 
global.outcomeEmitter = 
global.outcomeEmitter ? global.outcomeEmitter : new EventEmitter();

var Chain = function(listeners) {

	if(!listeners) listeners = { };

	var runFn = function(event, callback, args) {
		if(!!listeners[callback].emit) {
			listeners[callback].emit.apply(listeners[callback], [event].concat(args));
		} else {
			listeners[callback].apply(this, args);
		}
	}

	var runErr = function(args) {
		runFn("error", "error", args);

		globalEmitter.emit("handledError", args[0]);
	}


	var fn = function() {

		var args = Array.apply(null, arguments), orgArgs = arguments;



		if(listeners.callback) {
			listeners.callback.apply(this, args);
		}

		if(listeners.handle) {
			listeners.handle.apply(listeners, args);
		} else {

			var e = args.shift();

			//on error
			if(e) {
				runErr.call(this, [e]);
			} else

			if(listeners.success) {
				//try {
					runFn.call(this, "complete", "success", args);
				/*} catch(e) {
					runErr.call(this, [e]);
				}*/
			}

		}	
	};

	var oldToString = fn.toString;

	fn.toString = function() {

		var str = ["outcome()"];

		if(listeners.error) {
			str.push("\n.e(", String(listeners.error), ")")
		}

		if(listeners.success) {
			str.push("\n.s(", String(listeners.success), ")")
		}


		return str.join("")
	}

	fn.listeners = listeners;

	//DEPRECATED
	fn.done = function(fn) {
		return fn.callback(fn);
	}

	fn.handle = function(value) {
		return _copy({ handle: value });
	}

	fn.vine = function() {
		return fn.handle(function(resp) {
			if(resp.errors) {
				this.error(resp.errors);
			} else {
				this.success(resp.result);
			}
		});
	}


	fn.callback = function(value) {
		return _copy({ callback: value });
	}

	fn.success = fn.s = function(value) {
		return _copy({ success: value });
	}

	fn.error = fn.e = function(value) {
		return _copy({ error: value });
	}

	fn.throwError = function(err) {
		if(!globalEmitter.emit('unhandledError', err) && !listeners.callback) throw err;
	}


	//error does not exist? set the default which throws one
	if(!listeners.error) {

		listeners.error = function(err) {

			//no error callback? check of unhandled error is present, or throw
			// if(!globalEmitter.emit('unhandledError', err) && !listeners.callback) throw err;
			fn.throwError(err);
		}

	}


		
	function _copy(childListeners) {

		//copy these listeners to a new chain
		for(var type in listeners) {
			
			if(childListeners[type]) continue;

			childListeners[type] = listeners[type];

		}

		return Chain(childListeners);

	}

	return fn;
}


module.exports = function(listeners) {
	return Chain(listeners);
}


module.exports.on = function() {
	globalEmitter.on.apply(globalEmitter, arguments);
}

module.exports.once = function() {
	globalEmitter.once.apply(globalEmitter, arguments);
}

//bleh this could be better. Need to copy the chain functions to the module.exports var
var chain = Chain();

//copy the obj keys to module.exports
Object.keys(chain).forEach(function(prop) {

	//on call of error, success, callback - make a new chain
	module.exports[prop] = function() {
		
		var child = Chain();

		return child[prop].apply(child, arguments);
	}

});

module.exports.logAllErrors = function(v) {
	if(v) {
		globalEmitter.on("handledError", onGlobalError);
	} else {
		globalEmitter.removeListener("handledError", onGlobalError);
	}
}


function onGlobalError(e) {
	console.error(e.stack);
}


//running online?
if(typeof window != 'undefined') {
	window.outcome = module.exports;
}





}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"events":64}],137:[function(require,module,exports){
module.exports=require(11)
},{}],138:[function(require,module,exports){
module.exports=require(12)
},{}],139:[function(require,module,exports){
module.exports=require(88)
},{"protoclass":140,"type-component":141}],140:[function(require,module,exports){
module.exports=require(11)
},{}],141:[function(require,module,exports){
module.exports=require(34)
},{}],142:[function(require,module,exports){
module.exports=require(91)
},{}],143:[function(require,module,exports){
var mediocre = require("mediocre");

module.exports = function (app) {
  if (app.mediator) return;
  var mediator = mediocre();
  mediator.application = app;
  app.set("mediator", mediator);
}
},{"mediocre":149}],144:[function(require,module,exports){
module.exports=require(52)
},{"async":100,"type-component":153}],145:[function(require,module,exports){
module.exports=require(53)
},{"type-component":153}],146:[function(require,module,exports){
module.exports=require(54)
},{"./collection":144,"./fn":145,"./obj":147,"./ref":148}],147:[function(require,module,exports){
module.exports=require(55)
},{"async":100,"type-component":153}],148:[function(require,module,exports){
module.exports=require(56)
},{"type-component":153}],149:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"./factory":146,"./factory/collection":144,"./message":150,"async":100,"protoclass":151,"sift":152,"type-component":153}],150:[function(require,module,exports){
var BindableObject = require("bindable-object");

/**
 */

function Message (name, data, options, mediator, parent) {

  BindableObject.call(this, this);

  this.name     = name;
  this.data     = data;
  this.options  = options || {};
  this.mediator = mediator;
  this.parent   = parent;
  this.args     = [];
  this.root     = parent ? parent.root : this;

  var self = this;

  ["success", "result", "data", "error"].forEach(function (prop) {
    self.bind(prop, function () {
      self.emit.apply(self, [prop].concat(Array.prototype.slice.call(arguments, 0)));
    });
  });
}

/**
 */

BindableObject.extend(Message, {

  /**
   */

  __isCommand: true,

  /**
   */

  child: function (name, options) {
    return new Message(name, this.data, options, this.mediator, this);
  }
});

/**
 */

module.exports = Message;

},{"bindable-object":7}],151:[function(require,module,exports){
module.exports=require(11)
},{}],152:[function(require,module,exports){
module.exports=require(61)
},{}],153:[function(require,module,exports){
module.exports=require(34)
},{}],154:[function(require,module,exports){
module.exports = function (element) {

  // is bind unbind attr prop
  return $(element);
}
},{}],155:[function(require,module,exports){
var toarray = require("toarray");

var selectors = {
  string: require("./string"),
  dom: require("./dom")
};

module.exports = function (element) {

  var elements = toarray(element);

  var selector = elements[0].__isNode ? selectors.string : selectors.dom;
  return selector(elements);
}

},{"./dom":154,"./string":156,"toarray":157}],156:[function(require,module,exports){
var BindableObject = require("bindable-object"),
_            = require("lodash"),
toarray      = require("toarray");

module.exports = selector;

function selector (els, parent) {

  if (!els) els = [];



  var $elements =  toarray(els).concat();


  _.extend($elements, {

    /**
     */

    parent  : parent,

    /**
     */

    name: function () {
      return this.length ? this[0].nodeName : void 0;
    },

    /**
     */

    each : function (iterator) {
      for (var i = 0, n = this.length; i < n; i++) {
        iterator.call(this[i], i, this[i]);
      }
      return this
    },

    /**
     */

    find: function (query) {
      var tester = elementTester(query),
      found = [];
      this.traverse(function (element) {
        if (tester(element)) {
          found.push(element);
        }
      });

      return selector(found);
    },

    /**
     */

    eq: function (index) {
      return selector(this[index]);
    },

    /**
     */

    filter: function (filter) {
      if (!filter) return this;
      if (typeof filter === "string") filter = elementTester(filter);
      return selector(_.filter(this, filter), this.parent);
    },

    /**
     */

    first: function () {
      return selector(this[0]);
    },

    /**
     */

    andSelf: function () {
      if (!this.parent) return this;
      return selector(_.uniq(this.concat(this.parent)), this);
    },

    /**
     */

    attr: function (name, value) {
      if (!this.length) return;
      if (arguments.length === 1) {
        return (this.length && this[0].getAttribute ? this[0].getAttribute(name) : void 0) || "";
      } else {
        this.each(function (index) {
          this.setAttribute(name, value);
        });
      }
    },

    /**
     */

    css: function (properties) {
        this.each(function () {
          this.style.setProperties(properties);
        });
    },

    /**
     */

    val: function (value) {
      if (!this.length) return this;
      if (!arguments.length) {
        return this[0].nodeValue;
      } else {
        this[0].nodeValue = value;
      }
      return this;
    },

    /**
     */

    html: function () {
      return this.length ? this[0].toString() : void 0;
    },

    /**
     */

    text: function () {
      var buffer = [];
      this.traverse(function () {
        if (this.nodeType === 3 && this.nodeValue && this.nodeValue.length) {
          buffer.push(this.nodeValue);
        }
      });
      return buffer.join(" ");
    },

    /**
     */

    traverse: function (iterator) {
      this.each(function () {
        iterator.call(this, this);
        selector(this.childNodes).traverse(iterator);
      });
    },

    /**
     */

    prop: function (name) {
      return this.attr.apply(this, arguments);
    },

    /**
     */

    bind: function (eventNames, listener) {
      var self = this;
      eventNames.split(" ").forEach(function (eventName) {
        self.each(function () {
          this._emitter.on(eventName, listener);
        })
      });
      return this;
    },

    /**
     */

    unbind: function (eventNames, listener) {
      var self = this;
      eventNames.split(" ").forEach(function (eventName) {
        self.each(function () {
          this._emitter.off(eventName, listener);
        })
      });
      return this;
    },

    /**
     */

    trigger: function (event, options) {
      if (typeof event === "string") {
        event = new Event(event, options);
      }
      this.each(function () {
        this._emitter.emit(event.name, event);
      });
      return this;
    }
  });


  ["click"].forEach(function (eventName) {
    $elements[eventName] = function (nameOrListener) {
      if (typeof nameOrListener === "function") {
        this.bind(eventName, nameOrListener);
      } else {
        this.trigger(eventName);
      }
    }
  });


  $elements.each(function () {
    this._emitter = this._emitter || new BindableObject();
  })

  return $elements;
}

function Event (name, options) {
  this.name = name;
  _.extend(this, options || {});
}

Event.prototype.stopPropagation = function () {

}

Event.prototype.preventDefault = function () {

}


function elementTester (query) {
  if (query.substr(0, 1) === "#") return idTester(query);
  if (query.substr(0, 1) === ".") return classTester(query);
  if (query === "*") return anythingTester(query);
  if (~query.indexOf("[")) return attrTester(query);
  return nameTester(query);
}

function anythingTester(query) {
  return function () {
    return true;
  }
}

function idTester (query) {
  return function (element) {
    return selector(element).attr("id") === query.substr(1);
  }
}

function classTester (query) {
  return function (element) {
    return ~selector(element).attr("class").indexOf(query.substr(1));
  }
}

function nameTester (query) {
  return function (element) {
    return element.nodeName == String(query).toUpperCase();
  }
}

function attrTester (query) {
  var i = query.indexOf("[");
  var nodeName = query.substr(0, i);
  if (!nodeName.length) nodeName = "*";
  var nameTester = elementTester(nodeName);

  var attrInfo = query.match(/\[(.*?)(\=\'(.*?)\')?\]/);

  var attrName = attrInfo[1],
  attrValue    = attrInfo[3];

  return function (element) {
    return nameTester(element) && element.getAttribute(attrName) == attrValue;
  }
}

},{"bindable-object":7,"lodash":142,"toarray":157}],157:[function(require,module,exports){
module.exports=require(12)
},{}],158:[function(require,module,exports){
var views         = require("./views"),
viewDecor         = require("./plugins/decor"),
defaultViews      = require("./plugins/defaultComponents"),
RegisteredClasses = require("mojo-registered-classes");

var mojoViews = module.exports = function (app) {

  app.set("views", new RegisteredClasses(app));

  if (!app.animate) {
    app.use(require("mojo-animator"));
  }

  app.use(defaultViews);
  app.use(viewDecor);
};

/**
 * for debugging
 */

var Application = module.exports.Application = require("mojo-application");

module.exports.Base        = views.Base;
module.exports.List        = views.List;
module.exports.Stack       = views.Stack;

var mainApplication = Application.main;
mainApplication.use(require("mojo-animator"));
mainApplication.use(mojoViews);

module.exports.mainApplication = mainApplication;


views.Base.defaultApplication = mainApplication;

},{"./plugins/decor":161,"./plugins/defaultComponents":162,"./views":164,"mojo-animator":181,"mojo-application":182,"mojo-registered-classes":192}],159:[function(require,module,exports){
var type   = require("type-component"),
protoclass = require("protoclass"),
_          = require("underscore");


function ChildrenDecorator (view, childOptions) {

  this.view           = view;
  this.childOptions   = childOptions;
  view.sections       = view.children = { __decorated: true };
  
  // need to initialize before bindings
  this.init();
}

protoclass(ChildrenDecorator, {

  /**
   */


  init: function () {
    for (var sectionName in this.childOptions) {
      this._addChild(sectionName, this._fixOptions(this.childOptions[sectionName]));
    }
  },

  /**
   */

  _addChild: function (name, options) {
    if (!options) return;
    
    var view = this._createChildView(options);

    view.once("decorate", function () {
      view.decorate(options);
    });

    view.setProperties({
      name: name,
      parent: this.view
    });
  },

  /**
   */

  _fixOptions: function (options) {

    if (!options) {
      throw new Error("'children' is invalid for view '"+this.view.path+"'");
    }

    if (!options.type) {
      options = { type: options };
    }

    return options;
  },

  /**
   */

  _createChildView: function (options) {
    var t;

    if ((t = type(options.type)) === "object") {
      if (options.type.__isView) {
        return options.type;
      } else {
        return this.view.application.views.create("base", options.type);
      }
    } else if (t === "function") {
      return new options.type(options, this.view.application);
    } else if (t === "string") {
      return this.view.application.views.create(options.type, options);
    } else {
      throw new Error("cannot create child for type '" + t + "'");
    }
  }

});

ChildrenDecorator.priority = "init";
ChildrenDecorator.getOptions = function (view) {

  // DEPRECATED - use children prop instead
  if (view.sections && !view.sections.__decorated) {
    return view.sections;
  }
  
  if (view.children && !view.children.__decorated) {
    return view.children;
  }
}

ChildrenDecorator.decorate = function (view, options) {
  return new ChildrenDecorator(view, options);
}

module.exports = ChildrenDecorator;

},{"protoclass":231,"type-component":235,"underscore":236}],160:[function(require,module,exports){
var protoclass = require("protoclass"),
janitor        = require("janitorjs"),
_              = require("underscore");


function EventsDecorator (view, events) {
  this.view    = view;
  this.events = events;

  this.render = _.bind(this.render, this);
  this.remove = _.bind(this.remove, this);

  view.once("render", this.render);
  view.once("dispose", this.remove);
}

protoclass(EventsDecorator, {

  /**
   */

  render: function () {
    e = this._events();
    this._disposeBindings();
    this._janitor = janitor();

    for (var selector in e) {
      this._addBinding(selector, e[selector]);
    }
  },

  /**
   */

  remove: function () {
    this._disposeBindings();
  },

  /**
   */

  _addBinding: function (selector, viewMethod) {

    var selectorParts = selector.split(" "),
    actions           = selectorParts.shift().split(/\//g).join(" "),
    selectors         = selectorParts.join(","),
    self              = this,
    elements;

    // TODO - use JS traverse instead
    function cb () {
      var ref;
      if (typeof viewMethod === "function") {
        ref = viewMethod;
      } else {
        ref = self.view.get(viewMethod);
      }

      ref.apply(self.view, arguments);
    }

    if (!selectors.length) {
      elements = this.view.$();
    } else {
      elements = this.view.$(selectors);
    }

    elements.bind(lowerActions = actions.toLowerCase(), cb);


    actions.split(" ").forEach(function (action) {
      self._janitor.add(self.view.on(action, function() {
        cb.apply(self, [$.Event(action)].concat(Array.prototype.slice.call(arguments)));
      }));
    });

    this._janitor.add(function () {
      elements.unbind(actions, cb);
      elements.unbind(lowerActions, cb);
    });
  },

  /**
   */

  _disposeBindings: function () {
    if (!this._janitor) return;
    this._janitor.dispose();
    this._janitor = undefined;
  },

  /**
   */

  _events: function () { 
    return this.events;
  }
});

EventsDecorator.priority   = "display";
EventsDecorator.getOptions = function (view) {
  return view.events;
}
EventsDecorator.decorate   = function (view, options) {
  return new EventsDecorator(view, options);
}

module.exports = EventsDecorator;
},{"janitorjs":178,"protoclass":231,"underscore":236}],161:[function(require,module,exports){

var EventsDecorator   = require("./events"),
ChildrenDecorator     = require("./children"),
bindableDecorBindings = require("bindable-decor-bindings"),
frills                = require("frills");

module.exports = function (app) {
  
  var decor = frills();

  decor.
    priority("init", 0).
    priority("load", 1).
    priority("render", 2).
    priority("display", 3).
    use(
      bindableDecorBindings("render"),
      EventsDecorator,
      ChildrenDecorator
    );

  app.views.decorate = function (view, options) {
    decor.decorate(view, options);
  };

  app.views.decorator = function (decorator) {
    return decor.use(decorator);
  }
}

},{"./children":159,"./events":160,"bindable-decor-bindings":167,"frills":177}],162:[function(require,module,exports){
var views = require("../views");

module.exports = function (app) {
  app.views.register({
    list   : views.List,
    states : views.States,
    stack  : views.Stack,
    base   : views.Base
  });
};

},{"../views":164}],163:[function(require,module,exports){
(function (process,global){
var protoclass     = require("protoclass"),
loaf               = require("loaf"),
SubindableObject   = require("subindable").Object,
janitor            = require("janitorjs"),
runlater           = require("runlater")(1, 100),
_                  = require("underscore"),
decor              = require("../../plugins/decor"),
noselector         = require("noselector");

/**
 * @module mojo
 * @submodule mojo-views
 */

/**
@class BaseView
@extends SubindableObject
*/

/**
 * Called when the view is rendered
 * @event render
 */

/**
 * Called when the view is remove
 * @event remove
 */


function BaseView (properties, application) {

  // note that if application is not defined, this.application will
  // default to the default, global application.
  this.application = application;

  this._onParent     = _.bind(this._onParent, this);
  SubindableObject.call(this, properties);


  /**
   * The main application that instantiated this view
   * @property application
   * @type {Application}
   */

  this.initialize();
  
  // ref back to this context for templates
  this["this"]     = this;
}

protoclass(SubindableObject, BaseView, {

  /**
   */

  visible: false,

  /**
   */

  _rendered: false,

  /**
   */

  __isView: true,

  /**
   */

  define: ["sections", "children"],

  /**
   * adds a disposable object to cleanup when the view is destroyed.
   * @method disposable
   * @param {Object} disposable Must have `dispose()` defined.
   */

  disposable: function (disposable) {

    if (!this._janitor) {
      this._janitor = janitor();
    }

    this._janitor.add(disposable);
  },

  /**
   * Called when the view is instantiated
   * @method initialize
   * @param {Object} options options passed when creating the view
   */

  initialize: function (data) {
    this.on("change:parent", this._onParent);

    // copy the data to this object. Note this shaves a TON
    // of time off initializing any view, especially list items if we
    // use this method over @setProperties data
    if (false) {
      for(var key in data) {
        this[key] = data[key];
      }
    }

    // necessary to properly dispose this view so it can be recycled
    if (this.parent) this._onParent(this.parent);
  },

  /**
   */

  _createSection: function () {

    if (this.section) return;

    if (!this.application) {
      this.application = global.application || BaseView.defaultApplication;
    }


    /**
     * The section that manages the `document fragment` owned by this view controller.
     * @property section
     * @type {Section}
     */

    this.section = loaf(this.application.nodeFactory);
    this.didCreateSection();
    this.models  = this.application.models;

    this.emit("decorate");

    this.application.views.decorate(this, this.constructor.prototype);
  },

  /**
   * Returns the path to the view
   * @method path
   */

  path: function () {
    var path = [], cp = this;

    while (cp) {
      path.unshift(cp.name || cp.constructor.name);
      cp = cp.parent;
    }

    return path.join(".");
  },

  /**
   * Renders the view
   * @method render
   * @return {Object} document fragment
   */

  render: function () {

    // if rendered, then just return the fragment
    if (this._rendered) {
      return this.section.render();
    }

    this._rendered = true;

    if (this._cleanupJanitor) {
      this._cleanupJanitor.dispose();
    }

    if (!this.section) {
      this._createSection();
    }

    this.willRender();
    this.emit("render");

    var fragment = this.section.render();

    this.didRender();
    this._updateVisibility();

    return fragment;
  },

  /**
   */

  didCreateSection: function () {
    // OVERRIDE ME
  },

  /**
   */

  willRender: function () {
    //OVERRIDE ME
  },

  /**
   */

  didRender: function () {
    //OVERRIDE ME
  },

  /**
   * Removes the view from the parent, or DOM
   * @method remove
   */

  remove: function () {

    if (!this._rendered) return;

    this.willRemove();
    this.emit("remove");
    this.section.remove();
    this.didRemove();

    this._rendered = false;
    this._updateVisibility();
  },

  /**
   */

  willRemove: function () {
    // OVERRIDE ME
  },

  /**
   */

  didRemove: function () {
    // OVERRIDE ME
  },

  /**
   * jquery selector for elements owned by the view
   * @method $
   * @param {String} selector
   */

  $: function (search) {
    if (!this.section) this.render();

    var el = noselector(this.section.getChildNodes());

    if (arguments.length) {
      return el.find(search).andSelf().filter(search);
    }

    return el;
  },

  /**
   * Sort of a mix-in for the view. This is how `sections`, and `events` are added.
   * @method decorate
   * @param options
   * @returns {Object} this
   */

  decorate: function (options) {
    this._createSection();
    this.application.views.decorate(this, options);
    return this;
  },

  /*
   */

  dispose: function () {

    // first detach the view from the parent
    this.remove();

    // detach from the parent
    this.set("parent", void 0);

    // remove all disposable items attached to this view
    if (this._janitor) this._janitor.dispose();


    SubindableObject.prototype.dispose.call(this);
  },

  /**
   * Bubbles an event up to the root view
   * @method bubble
   * @param {String} name of the event
   * @param {Object} params... additional params
   */

  bubble: function () {
    this.emit.apply(this, arguments);
    if(this.parent) this.parent.bubble.apply(this.parent, arguments);
  },

  /**
   */

  _onParent: function (parent) {

    if (this._parentListeners) {
      this._parentListeners.dispose();
    } else {
      this._parentListeners  = janitor();
      this._disposeLater     = _.bind(this._disposeLater, this);
      this._updateVisibility = _.bind(this._updateVisibility, this);
    }

    this.inherit("application");

    if (!parent) return;

    if (this.name) {
      // DEPRECATED - use children
      parent.set("sections." + this.name, this);
      parent.set("children." + this.name, this);
    }

    this._parentListeners.add(parent.bind("visible", this._updateVisibility));
    this._parentListeners.add(parent.on("dispose", this._disposeLater));
  },

  /**
   */

  _updateVisibility: function () {
    this.set("visible", !!(this._rendered && (!this.parent || this.parent.visible)));
  },

  /**
   */

  _disposeLater: function () {
    var self = this;
    if (!process.browser) return this.dispose();
    (this._cleanupJanitor || (this._cleanupJanitor = janitor())).add(runlater(function () {
      self.dispose();
    }));
  }
});

module.exports = BaseView;

}).call(this,require("OpdoqP"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../plugins/decor":161,"OpdoqP":65,"janitorjs":178,"loaf":179,"noselector":219,"protoclass":231,"runlater":232,"subindable":233,"underscore":236}],164:[function(require,module,exports){
module.exports = {
  Base      : require("./base"),
  List      : require("./list"),
  Stack     : require("./stack")
};

},{"./base":163,"./list":165,"./stack":166}],165:[function(require,module,exports){
var BaseView = require("../base"),
BindableCollection     = require("bindable-collection"),
factories    = require("factories"),
_            = require("underscore"),
janitor      = require("janitorjs");

/**
 */

var _i = 0;

function generateCID () {
  return "cid" + (++_i);
}

/**
 */

function getOpListener (listener) {

  var self = this;

  var oldValue, currentValue, propertyBinding;

  var update = wrapInAnimation.call(this, function () {
    listener.call(self, currentValue, oldValue);
  });

  return { 
    to: function trigger (property) {
      var value;

      if (propertyBinding) propertyBinding.dispose();

      if (typeof property === "string") {
        value = self.get(property);
        propertyBinding = self.bind(property, function () {
          trigger(property);
        });
      } else {
        value = property;
      }

      oldValue     = currentValue;
      currentValue = value;

      update();
    }
  }
}

/**
 */

function wrapInAnimation (listener) {
  var self = this;
  return function () {
    var args = Array.prototype.slice.call(arguments);
    if (self.visible) {
      self.application.animate({ 
        update: function () {
          listener.apply(self, args);
        }
      });
    } else {
      listener.apply(self, args);
    }
  }
}

/**
 */

function ListView () {
  BaseView.apply(this, arguments);
  this._modelViewMap = {};
}

/**
 */

BaseView.extend(ListView, {

  /**
   */

  willRender: function () {

    if (this.children) return;

    this._sourceListeners = janitor();
    this._modelListeners  = janitor();
    this._insertModels = [];
    this._removeModels = [];
    this.children = new BindableCollection();
    this.bind("modelViewClass", getOpListener.call(this, this._onModelViewFactoryChange)).now();
    this.bind("modelViewFactory", getOpListener.call(this, this._onModelViewFactoryChange)).now();
    this.bind("filter", getOpListener.call(this, this._onFilterChange)).now();
    this.bind("sort", getOpListener.call(this, this._onSortChange)).now();
    this.bind("source", getOpListener.call(this, this._onSourceChange)).now();
  },
  /**
   */

  _onSourceChange: function (newSource, oldSource) {
    this._removeAllChildren();
    this._sourceListeners.dispose();
    this._modelListeners.dispose();

    if (newSource && !newSource.__isBindableCollection) {
      newSource = new BindableCollection(newSource);
    }
    var self = this;

    this._source = newSource;
    if (newSource) {
      this._sourceListeners.add(newSource.on("willUpdate", function () {
        self._lockUpdate = true;
        newSource.once("didUpdate", function (updates) {
          self._lockUpdate = false;
          self._onSourceUpdate(updates);
        });
      }));
      this._sourceListeners.add(newSource.on("update", _.bind(this._onSourceUpdate, this)));
      this._onSourceUpdate({ insert: newSource.source });
    }
  },

  /**
   */

  _watchModels: function (models) {
    var self = this, updating = false;


    function onModelChange () {
      if (updating) return;
      updating = true;
      self.application.animate({
        update: function () {
          if (!self.visible) return;
          updating = false;
          self._onFilterChange(self._filter, true);
        }
      });
    }



    for (var i = models.length; i--;) {
      var model = models[i];
      if (model.on) {
        this._modelListeners.add(model.on("change", onModelChange));
      }
    }
  },

  /**
   */

  _rewatchModels: function () {
    this._modelListeners.dispose();
    this._watchModels(this._source.source);
  },

  /**
   */

  _onModelViewFactoryChange: function (modelViewFactory) {
    this._modelViewFactory = factories.factory.create(modelViewFactory);
    if (!this._source) return;
    this._onSourceChange(this._source);
  },

  /**
   */

  _onFilterChange: function (filter, forceSort) {
    filter = this._filter = _.bind(filter || ListView.prototype._filter, this);
    if (!this._source) return;

    var toRemove = [], toInsert = [], existingModels = {};

    for (var i = this._source.length; i--;) {

      var model = this._source.at(i),
      child     = this._modelViewMap[model.cid],
      useModel  = filter(model);


      if (child && !useModel) {
        toRemove.push(model);
      } else if (useModel && !child) {
        toInsert.unshift(model);
      }
    }


    if (toInsert.length || forceSort) this._addChildren(toInsert || []);

    for (var i = this._source.length; i--;) {

      var model = this._source.at(i);
      existingModels[model.cid] = model;
    }

    for (var cid in this._modelViewMap) {
      var child = this._modelViewMap[cid], 
      model = child ? child.model : void 0;
      if (model && !existingModels[cid] && !~toRemove.indexOf(model)) {
        toRemove.push(model);
      }
    }

    if (toRemove.length) this._removeChildren(toRemove);
  },

  /**
   */

  _onSortChange: function (sort) {
    this._sort = sort;
    if (!this._source) return;

    var self = this;

    var children = this.children.source.sort(sort ? function (av, bv) {
      return sort.call(self, av.model, bv.model);
    } : function (av, bv) {
      return av.modelIndex > bv.modelIndex ? 1 : -1;
    });

    // update index
    for (var i = children.length; i--;) {
      children[i].set("index", i);
    }

    var prevChild;

    for (var i = 0, n = children.length; i < n; i++) {
      var child = children[i];

      // only want to render the non visible children
      if (child.visible) {

        var afterNode;

        if (child.previousSibling !== prevChild) {

          if (!prevChild) {
            afterNode = this.section.start;
          } else {
            afterNode = prevChild.section.end;
          }

          var childNodes = child.section.getChildNodes();

          for (var j = 0, n2 = childNodes.length; j < n2; j++) {
            var childNode = childNodes[j];
            afterNode.parentNode.insertBefore(childNode, afterNode.nextSibling);
            afterNode = childNode;
          }
        }

      } else {
        if (!prevChild) {
          this.section.prepend(child.render());
        } else {
          prevChild.section.end.parentNode.insertBefore(child.render(), prevChild.section.end.nextSibling);
        }
      }


      child.previousSibling = prevChild;
      if (prevChild) prevChild.nextSibling = child;
      prevChild = child;
    }

    this.emit("resort");
  },

  /**
   */

  _onSourceUpdate: function (sourceChanges) {

    if (this._lockUpdate) return;

    this._insertModels = this._insertModels.concat(sourceChanges.insert || []);
    this._removeModels = this._removeModels.concat(sourceChanges.remove || []);

    if (this._syncingModels) return;
    this._syncingModels = true;
    var self = this;
    this.application.animate({
      update: function () {
        self._syncingModels = false;
        self._syncModels();
      }
    })
  },

  /**
   */

  _syncModels: function () {
    this._rewatchModels()
    this._onFilterChange(this._filter);
  },

  /**
   */

  _removeAllChildren: function () {
    this._modelViewMap = {};
    this.section.removeAll();

    var oldChildren = this.children.source;

    // TODO - use async each series and runlater
    for (var i = this.children.length; i--;) {
      this.children.at(i).dispose();
    }

    this.children.set("source", []);
  },

  /**
   */

  _removeChildren: function (models) {


    for (var i = models.length; i--;) {
      var model = models[i];
      var child = this._modelViewMap[model.cid];
      if (child) {
        this._modelViewMap[model.cid] = void 0;
        child.dispose();
        this.children.splice(this.children.indexOf(child), 1);
      } else {
      }
    }
  },

  /**
   */

  _addChildren: function (models) {

    var newChildren = [], children, self = this;

    for (var i = 0, n = models.length; i < n; i++) {
      var model = models[i];

      if (!model.cid) model.cid = generateCID();

      var child = this._modelViewFactory.create({ 
        parent: self,
        model: model,
        modelIndex: this._source.indexOf(model)
      });

      self._modelViewMap[model.cid] = child;

      newChildren.push(child);
    }

    this.children.push.apply(this.children, newChildren);
    this._onSortChange(this._sort);
  },

  /**
   */

  _filter: function (model) {
    return true;
  }
});

module.exports = ListView;
},{"../base":163,"bindable-collection":6,"factories":175,"janitorjs":178,"underscore":236}],166:[function(require,module,exports){
var BaseView = require("../base");

function StackView () {
  BaseView.apply(this, arguments);
}

module.exports = BaseView.extend(StackView, {

  /**
   */

  define: ["state"],

  /**
   */

  bindings: {
    "state": function (stateName) {

      if (!stateName) return;

      var prevChild = this.currentChild, currentChild;

      this.set("currentChild", currentChild = this.get("children." + stateName));
      
      if (!currentChild) {
        throw new Error("state '" + stateName + "' does not exist");
      }

      if (currentChild === prevChild) return;

      var self = this;

      // prevent layout thrashing
      this.application.animate({
        update: function () {

          if (prevChild) {
            prevChild.remove();
          }

          self.section.append(currentChild.render());
        }
      });
    },
    "name": function (name) {
      if (this._nameBinding) this._nameBinding.dispose();
      this._nameBinding = this.bind("states." + name, { to: "state" }).now();
    }
  }
});

},{"../base":163}],167:[function(require,module,exports){
module.exports=require(79)
},{"disposable":168}],168:[function(require,module,exports){
module.exports=require(80)
},{}],169:[function(require,module,exports){
module.exports=require(27)
},{"./base":170,"./factory":172}],170:[function(require,module,exports){
module.exports=require(28)
},{}],171:[function(require,module,exports){
module.exports=require(29)
},{"./base":170}],172:[function(require,module,exports){
module.exports=require(30)
},{"./base":170,"./class":171,"./fn":173,"type-component":235}],173:[function(require,module,exports){
module.exports=require(31)
},{}],174:[function(require,module,exports){
module.exports=require(32)
},{"./base":170,"./factory":172}],175:[function(require,module,exports){
module.exports=require(33)
},{"./any":169,"./class":171,"./factory":172,"./fn":173,"./group":174}],176:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"protoclass":231}],177:[function(require,module,exports){
arguments[4][84][0].apply(exports,arguments)
},{"./decorator":176}],178:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"protoclass":231,"type-component":235}],179:[function(require,module,exports){
var protoclass = require("protoclass"),
nofactor       = require("nofactor");

// TODO - figure out a way to create a document fragment in the constructor
// instead of calling toFragment() each time. perhaps 
var Section = function (nodeFactory, start, end) {

  this.nodeFactory = nodeFactory = nodeFactory || nofactor["default"];

  // create invisible markers so we know where the sections are

  this.start       = start || nodeFactory.createTextNode("");
  this.end         = end   || nodeFactory.createTextNode("");
  this.visible     = true;

  if (!this.start.parentNode) {
    var parent  = nodeFactory.createFragment();
    parent.appendChild(this.start);
    parent.appendChild(this.end);
  }
};


Section = protoclass(Section, {

  /**
   */

  __isLoafSection: true,

  /**
   */

  render: function () {
    return this.start.parentNode;
  },

  /**
   */

  remove: function () {
    // this removes the child nodes completely
    return this.nodeFactory.createFragment(this.getChildNodes());
  },

  /** 
   * shows the section
   */


  show: function () {
    if(!this._detached) return this;
    this.append.apply(this, this._detached.getInnerChildNodes());
    this._detached = void 0;
    this.visible = true;
    return this;
  },

  /**
   * hides the fragment, but maintains the start / end elements
   * so it can be shown again in the same spot.
   */

  hide: function () {
    this._detached = this.removeAll();
    this.visible = false;
    return this;
  },

  /**
   */

  removeAll: function () {
    return this._section(this._removeAll());
  },

  /**
   */

  _removeAll: function () {

    var start = this.start,
    end       = this.end,
    current   = start.nextSibling,
    children  = [];

    while (current != end) {
      current.parentNode.removeChild(current);
      children.push(current);
      current = this.start.nextSibling;
    }

    return children;
  },

  
  /**
   * DEPRECATED - use appendChild
   */

  append: function () {

    var newNodes = Array.prototype.slice.call(arguments);

    if (!newNodes.length) return;

    if(newNodes.length > 1) {
      newNodes = this.nodeFactory.createFragment(newNodes);
    } else {
      newNodes = newNodes[0];
    }

    this.end.parentNode.insertBefore(newNodes, this.end);
  },

  /**
   */

  appendChild: function () {
    this.append.apply(this, arguments);
  },

  /**
   * DEPRECATED - use prependChild
   */

  prepend: function () {
    var newNodes = Array.prototype.slice.call(arguments);

    if (!newNodes.length) return;

    if(newNodes.length > 1) {
      newNodes = this.nodeFactory.createFragment(newNodes);
    } else {
      newNodes = newNodes[0];
    }

    this.start.parentNode.insertBefore(newNodes, this.start.nextSibling);
  },


  /**
   */

  prependChild: function () {
    this.prepend.apply(this, arguments);
  },


  /**
   */

  replaceChildNodes: function () {

    //remove the children - children should have a parent though
    this.removeAll();
    this.append.apply(this, arguments);
  },

  /**
   */

  toString: function () {
    var buffer = this.getChildNodes().map(function (node) {
      return node.outerHTML || (node.nodeValue != undefined && node.nodeType == 3 ? node.nodeValue : String(node));
    });
    return buffer.join("");
  },

  /**
   */

  dispose: function () {
    if(this._disposed) return;
    this._disposed = true;

    // might have sub sections, so need to remove with a parent node
    this.removeAll();
    this.start.parentNode.removeChild(this.start);
    this.end.parentNode.removeChild(this.end);
  },

  /**
   */

  getChildNodes: function () {
    var cn   = this.start,
    end      = this.end.nextSibling,
    children = [];


    while (cn != end) {
      children.push(cn);
      cn = cn.nextSibling;
    }

    return children;
  },

  /**
   */

  getInnerChildNodes: function () {
    var cn = this.getChildNodes();
    cn.shift();
    cn.pop()
    return cn;
  },


  /**
   */

  _section: function (children) {
    var section = new Section(this.nodeFactory);
    section.append.apply(section, children);
    return section;
  }
});

module.exports = function (nodeFactory, start, end)  {
  return new Section(nodeFactory, start, end);
}
},{"nofactor":207,"protoclass":231}],180:[function(require,module,exports){
(function (process){
var protoclass = require("protoclass");

/**
 * @module mojo
 * @submodule mojo-core
 */

/**
 * Animator that makes changes to the UI state of the application. Prevents layout thrashing.
 *
 * @class Animator
 */

function Animator () {
  this._animationQueue = [];
}

protoclass(Animator, {

  /**
   * Runs animatable object on requestAnimationFrame. This gets
   * called whenever the UI state changes.
   *
   * @method animate
   * @param {Object} animatable object. Must have `update()`
   */

  animate: function (animatable) {

    // if not browser, or fake app
    if (!process.browser) {
      return animatable.update();
    }

    // push on the animatable object
    this._animationQueue.push(animatable);

    var self = this;

    // if animating, don't continue
    if (this._requestingFrame) return;
    this._requestingFrame = true;
    var self = this;

    function runAnimations () {

      var queue = self._animationQueue;
      self._animationQueue = [];

      // queue.length is important here, because animate() can be
      // called again immediately after an update
      for (var i = 0; i < queue.length; i++) {
        queue[i].update();

        // check for anymore animations - need to run
        // them in order
        if (self._animationQueue.length) {
          runAnimations();
        }
      }
    }

    // run the animation frame, and callback all the animatable objects
    requestAnimationFrame(function () {
      runAnimations();
      self._requestingFrame = false;
    });
  }
});

module.exports = Animator;

}).call(this,require("OpdoqP"))
},{"OpdoqP":65,"protoclass":231}],181:[function(require,module,exports){
var Animator = require("./animator");

module.exports = function (app) {
  var animator = new Animator();
  app.animate = function (animatable) {
    animator.animate(animatable);
  };
}

},{"./animator":180}],182:[function(require,module,exports){
var bindable      = require("bindable"),
nofactor          = require("nofactor");

function Application (options) {
  if (!options) options = {};
  Application.parent.call(this, this);
  this.setProperties(options);
  this.nodeFactory = options.nodeFactory || nofactor["default"];
  this.models      = new bindable.Object();
  this._registerPlugins();

  var self = this;
}

module.exports = bindable.Object.extend(Application, {

  /**
   */

  plugins: [],

  /**
   */

  _registerPlugins: function () {

    var cp = this, parentPlugins = [];

    // inherit all plugins from the parent
    while (cp) {
      parentPlugins.push(cp.plugins || []);
      cp = cp.constructor.__super__;
    }


    for (var i = parentPlugins.length; i--;) {
      this.use.apply(this, parentPlugins[i]);
    }

    this.registerPlugins();
  },

  /**
   */

  registerPlugins: function () {

  },

  /**
   */

  willInitialize: function () {
    // OVERRIDE ME
  },

  /**
   */

  didInitialize: function () {
    // OVERRIDE ME
  },

  /**
   * Plugins to use for the mojo application.
   *
   * @method use
   * @param {Function} plugins... must be defined as `function (app) { }`
   */

  use: function () {

    // simple impl - go through each arg and pass self ref
    for(var i = 0, n = arguments.length; i < n; i++) {
      arguments[i](this);
    }

    return this;
  },

  /**
   */

  initialize: function () {
    
    if (this._initialized) throw new Error("cannot initialize application more than once");
    this._initialized = true;

    var args = Array.prototype.slice.call(arguments, 0);
    this.willInitialize.apply(this, args);
    this.emit.apply(this, ["initialize"].concat(args));
    this.didInitialize.apply(this, args);
  }
});


module.exports.main = new Application();
},{"bindable":185,"nofactor":207}],183:[function(require,module,exports){
module.exports=require(38)
},{"../object":186,"../utils/computed":189,"underscore":236}],184:[function(require,module,exports){
module.exports=require(39)
},{"protoclass":231}],185:[function(require,module,exports){
module.exports=require(40)
},{"./collection":183,"./core/eventEmitter":184,"./object":186,"./utils/computed":189,"./utils/options":190}],186:[function(require,module,exports){
module.exports=require(41)
},{"../core/eventEmitter":184,"./watchProperty":188,"protoclass":231}],187:[function(require,module,exports){
module.exports=require(42)
},{"toarray":191,"underscore":236}],188:[function(require,module,exports){
module.exports=require(43)
},{"../utils/options":190,"./transform":187,"OpdoqP":65,"underscore":236}],189:[function(require,module,exports){
module.exports=require(44)
},{"toarray":191}],190:[function(require,module,exports){
module.exports=require(45)
},{}],191:[function(require,module,exports){
module.exports=require(12)
},{}],192:[function(require,module,exports){
var bindable = require("bindable"),
uuid         = require("uuid");

// UUID for each created item
var cidPrehash = uuid.v4(),
_cid = 1;

function generateCid () {
  return cidPrehash + "-" + (_cid++);
}

function RegisteredClasses (application) {
  bindable.Object.call(this);
  this._classes = {};
  this.application = application;
}

module.exports = bindable.Object.extend(RegisteredClasses, {
  register: function (nameOrClasses, clazz) {

    if (typeof nameOrClasses === "object") {
      for (var name in nameOrClasses) {
        this.register(name, nameOrClasses[name]);
      }
      return;
    }

    this._classes[nameOrClasses.substr(0, 1).toLowerCase() + nameOrClasses.substr(1)] = clazz;
  },
  create: function (name, options) {
    var clazz = this._classes[name];
    if (!clazz) throw new Error("class '" + name + "' doesn't exist");
    options = options == null ? {} : options;

    options.__name = name;

    // generate the CID - this can be overridden, but is
    // generally used internally, especially for realtime systems
    if (!options._cid) options._cid   = generateCid();

    return new clazz(options, this.application);
  }
});

},{"bindable":195,"uuid":203}],193:[function(require,module,exports){
module.exports=require(38)
},{"../object":196,"../utils/computed":199,"underscore":236}],194:[function(require,module,exports){
module.exports=require(39)
},{"protoclass":231}],195:[function(require,module,exports){
module.exports=require(40)
},{"./collection":193,"./core/eventEmitter":194,"./object":196,"./utils/computed":199,"./utils/options":200}],196:[function(require,module,exports){
module.exports=require(41)
},{"../core/eventEmitter":194,"./watchProperty":198,"protoclass":231}],197:[function(require,module,exports){
module.exports=require(42)
},{"toarray":201,"underscore":236}],198:[function(require,module,exports){
module.exports=require(43)
},{"../utils/options":200,"./transform":197,"OpdoqP":65,"underscore":236}],199:[function(require,module,exports){
module.exports=require(44)
},{"toarray":201}],200:[function(require,module,exports){
module.exports=require(45)
},{}],201:[function(require,module,exports){
module.exports=require(12)
},{}],202:[function(require,module,exports){
module.exports=require(93)
},{}],203:[function(require,module,exports){
module.exports=require(94)
},{"./rng":202}],204:[function(require,module,exports){
arguments[4][14][0].apply(exports,arguments)
},{"protoclass":231}],205:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"./base":204,"factories":175}],206:[function(require,module,exports){
arguments[4][16][0].apply(exports,arguments)
},{"./base":204}],207:[function(require,module,exports){
module.exports=require(17)
},{"./custom":205,"./dom":206,"./string":212}],208:[function(require,module,exports){
module.exports=require(18)
},{"./text":215}],209:[function(require,module,exports){
arguments[4][19][0].apply(exports,arguments)
},{"./node":213}],210:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"./container":209,"./style":214}],211:[function(require,module,exports){
module.exports=require(21)
},{"./container":209}],212:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"../base":204,"./comment":208,"./container":209,"./element":210,"./fragment":211,"./text":215,"./voidElements":216}],213:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"protoclass":231}],214:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"protoclass":231}],215:[function(require,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"./node":213,"he":217}],216:[function(require,module,exports){
module.exports=require(26)
},{"./element":210}],217:[function(require,module,exports){
module.exports=require(35)
},{}],218:[function(require,module,exports){
module.exports = function (element) {



  // is bind unbind attr prop

  return $(element);
}
},{}],219:[function(require,module,exports){
arguments[4][155][0].apply(exports,arguments)
},{"./dom":218,"./string":220,"toarray":230}],220:[function(require,module,exports){
var bindable = require("bindable"),
_            = require("lodash"),
toarray      = require("toarray");

module.exports = selector;

function selector (els, parent) {

  if (!els) els = [];



  var $elements =  toarray(els).concat();


  _.extend($elements, {

    /**
     */

    parent  : parent,

    /**
     */

    name: function () {
      return this.length ? this[0].nodeName : void 0;
    },

    /**
     */

    each : function (iterator) {
      for (var i = 0, n = this.length; i < n; i++) {
        iterator.call(this[i], i, this[i]);
      }
      return this
    },

    /**
     */

    find: function (query) {
      var tester = elementTester(query),
      found = [];
      this.traverse(function (element) {
        if (tester(element)) {
          found.push(element);
        }
      });

      return selector(found);
    },

    /**
     */

    eq: function (index) {
      return selector(this[index]);
    },

    /**
     */

    filter: function (filter) {
      if (!filter) return this;
      if (typeof filter === "string") filter = elementTester(filter);
      return selector(_.filter(this, filter), this.parent);
    },

    /**
     */

    first: function () {
      return selector(this[0]);
    },

    /**
     */

    andSelf: function () {
      if (!this.parent) return this;
      return selector(_.uniq(this.concat(this.parent)), this);
    },

    /**
     */

    attr: function (name, value) {
      if (!this.length) return;
      if (arguments.length === 1) {
        return (this.length && this[0].getAttribute ? this[0].getAttribute(name) : void 0) || "";
      } else {
        this.each(function (index) {
          this.setAttribute(name, value);
        });
      }
    },

    /**
     */

    css: function (properties) {
        this.each(function () {
          this.style.setProperties(properties);
        });
    },

    /**
     */

    val: function (value) {
      if (!this.length) return this;
      if (!arguments.length) {
        return this[0].nodeValue;
      } else {
        this[0].nodeValue = value;
      }
      return this;
    },

    /**
     */

    html: function () {
      return this.length ? this[0].toString() : void 0;
    },

    /**
     */

    text: function () {
      var buffer = [];
      this.traverse(function () {
        if (this.nodeType === 3 && this.nodeValue && this.nodeValue.length) {
          buffer.push(this.nodeValue);
        }
      });
      return buffer.join(" ");
    },

    /**
     */

    traverse: function (iterator) {
      this.each(function () {
        iterator.call(this, this);
        selector(this.childNodes).traverse(iterator);
      });
    },

    /**
     */

    prop: function (name) {
      return this.attr.apply(this, arguments);
    },

    /**
     */

    bind: function (eventNames, listener) {
      var self = this;
      eventNames.split(" ").forEach(function (eventName) {
        self.each(function () {
          this._emitter.on(eventName, listener);
        })
      });
      return this;
    },

    /**
     */

    unbind: function (eventNames, listener) {
      var self = this;
      eventNames.split(" ").forEach(function (eventName) {
        self.each(function () {
          this._emitter.off(eventName, listener);
        })
      });
      return this;
    },

    /**
     */

    trigger: function (event, options) {
      if (typeof event === "string") {
        event = new Event(event, options);
      }
      this.each(function () {
        this._emitter.emit(event.name, event);
      });
      return this;
    }
  });


  ["click"].forEach(function (eventName) {
    $elements[eventName] = function (nameOrListener) {
      if (typeof nameOrListener === "function") {
        this.bind(eventName, nameOrListener);
      } else {
        this.trigger(eventName);
      }
    }
  });


  $elements.each(function () {
    this._emitter = this._emitter || new bindable.Object();
  })

  return $elements;
}

function Event (name, options) {
  this.name = name;
  _.extend(this, options || {});
}

Event.prototype.stopPropagation = function () {

}

Event.prototype.preventDefault = function () {

}


function elementTester (query) {
  if (query.substr(0, 1) === "#") return idTester(query);
  if (query.substr(0, 1) === ".") return classTester(query);
  if (query === "*") return anythingTester(query);
  if (~query.indexOf("[")) return attrTester(query);
  return nameTester(query);
}

function anythingTester(query) {
  return function () {
    return true;
  }
}

function idTester (query) {
  return function (element) {
    return selector(element).attr("id") === query.substr(1);
  }
}

function classTester (query) {
  return function (element) {
    return ~selector(element).attr("class").indexOf(query.substr(1));
  }
}

function nameTester (query) {
  return function (element) {
    return element.nodeName == String(query).toUpperCase();
  }
}

function attrTester (query) {
  var i = query.indexOf("[");
  var nodeName = query.substr(0, i);
  if (!nodeName.length) nodeName = "*";
  var nameTester = elementTester(nodeName);

  var attrInfo = query.match(/\[(.*?)(\=\'(.*?)\')?\]/);

  var attrName = attrInfo[1],
  attrValue    = attrInfo[3];

  return function (element) {
    return nameTester(element) && element.getAttribute(attrName) == attrValue;
  }
}

},{"bindable":223,"lodash":229,"toarray":230}],221:[function(require,module,exports){
module.exports=require(38)
},{"../object":224,"../utils/computed":227,"underscore":236}],222:[function(require,module,exports){
module.exports=require(39)
},{"protoclass":231}],223:[function(require,module,exports){
module.exports=require(40)
},{"./collection":221,"./core/eventEmitter":222,"./object":224,"./utils/computed":227,"./utils/options":228}],224:[function(require,module,exports){
module.exports=require(41)
},{"../core/eventEmitter":222,"./watchProperty":226,"protoclass":231}],225:[function(require,module,exports){
module.exports=require(42)
},{"toarray":230,"underscore":236}],226:[function(require,module,exports){
module.exports=require(43)
},{"../utils/options":228,"./transform":225,"OpdoqP":65,"underscore":236}],227:[function(require,module,exports){
module.exports=require(44)
},{"toarray":230}],228:[function(require,module,exports){
module.exports=require(45)
},{}],229:[function(require,module,exports){
module.exports=require(91)
},{}],230:[function(require,module,exports){
module.exports=require(12)
},{}],231:[function(require,module,exports){
module.exports=require(46)
},{}],232:[function(require,module,exports){
(function (global){


module.exports = function (batch, ms) {

  if (!batch) batch = 5;
  if (!ms) ms = 1;

  var queue = [], timer;

  var rl = function (fn)  {

    // items to call later
    queue.push(fn);

    var disposable = {
      dispose: function () {
        clearTimeout(timer);
        timer = undefined;
      }
    }

    // timer running? don't run
    if (timer) return disposable;


    // start the timer until there are no more items
    timer = setInterval(function () {

      // pop off the most recent items
      var fns = queue.splice(0, rl.batch);

      // no more items? stop the timer
      if (!fns.length) {
        return disposable.dispose();
      }

      // run all the items in the current batch
      for (var i = 0, n = fns.length; i < n; i++) {
        fns[i]();
      }

    }, rl.ms);

    return disposable;
  }

  rl.ms = ms;
  rl.batch = batch;

  return rl;
}

module.exports.global = global.__runlater || (global.__runlater = module.exports());
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],233:[function(require,module,exports){
var BindableObject = require("bindable-object"),
protoclass         = require("protoclass"),
type               = require("type-component"),
_                  = require("underscore");

/**
 * @module mojo-core
 */


function _combineSuperProps (target, property) {
  var constructor = target.constructor;

  if (!constructor.__combined) {
    constructor.__combined = {};
  }

  if (constructor.__combined[property]) {
    return;
  }

  constructor.__combined[property] = true;

  var p = constructor.prototype,
  defined = [];


  while (p) {
    defined = (p.define || []).concat(defined).concat(Object.keys(p));
    p = p.constructor.__super__;
  }

  constructor.prototype[property] = target[property] = _.uniq(defined);
}


/**
 * Allows you to inherit properties from a parent bindable.
 * @class SubindableObject
 * @extends BindableObject
 */


function SubindableObject (properties, parent) {
  SubindableObject.parent.call(this, properties);

  if (parent) this.set("parent", parent);

  var proto = this.constructor.prototype;


  this._defined = {};

  _combineSuperProps(this, "define");
  this._define.apply(this, this.define);
  var self = this;

  // listen whenever a property 
  this.on("watching", function (propertyChain) {
    var key = propertyChain[0]
    if (self[key] === undefined)
      self.inherit(key);
  });
}

protoclass(BindableObject, SubindableObject, {

  /*
   */

  define: [

    /**
     * The parent subindable object
     * @property {SubindableObject} parent
     */

    "parent"
  ],

  /*
   */

  get: function (key) {

    var ret = SubindableObject.__super__.get.call(this, key);
    if(ret != undefined) return ret;

    var bindingKey, i;

    if (typeof key !== "string") {
      bindingKey = key[0];
    } else if (~(i = key.indexOf("."))) {
      bindingKey = key.slice(0, i);
    } else {
      bindingKey = key;
    }

    // if the binding key exists, then don't inherit
    if (this[bindingKey] != undefined) {
      return;
    }

    // inherit from the parent
    this.inherit(bindingKey);

    // return the inherited value
    return SubindableObject.__super__.get.call(this, key);
  },

  /*
   */

  set: function (key, value) {  

    var i;

    // if we're setting to a chained property, inherit the first part
    // incase it exists - for example:
    // subView.set("user.name", "blah") 
    // would need to be inherited before being set
    if (typeof key === "string" && ~(i = key.indexOf("."))) {
      var bindingKey = key.slice(0, i);
      if (this[bindingKey] == undefined) this.inherit(bindingKey);
    }

    return SubindableObject.__super__.set.call(this, key, value);
  },

  /*
   */

  _define: function () {
    for(var i = arguments.length; i--;) {
      this._defined[arguments[i]] = true;
    }
  },

  /*
   * DEPRECATED
   */

  _inherit: function (key) {
    console.warn("_inherit on subindable is deprecated");
    this.inherit(key);
  },

  /**
   * Inherits a property from the parent subindable object
   * @method inherit
   * @param {String} path path to inherit.
   */

  inherit: function (key) {

    if (this._defined[key]) return;
    this._defined[key] = true;

    var parentPropertyBinding,
    parentBinding,
    valueBinding,
    self = this;

    // if the parent ever changes, we'll need to also change the bound value
    parentBinding = this.bind("parent", function(parent) {

      if (parentPropertyBinding) parentPropertyBinding.dispose();
      if (!parent) return;

      // inherit the property from the parent here
      parentPropertyBinding = parent.bind(key, function (v) {

        // if the value is a function, then make sure the context is 
        // bound to the parent
        if (typeof v === "function" && !v.__bound) {
          var org;
          v = _.bind(org = v, parent);
          v.__bound    = true;
          v.__original = org;
        }

        // set the inherited property
        self.set(key, v);
      }).now();
    }).now();


    // now bind to THIS context incase explicitly set
    valueBinding = this.bind(key, function(value) {

      // if the parent value doesn't match this context's value, then
      // break inheritance
      if (self.parent && self.parent[key] === value) {
        return;
      }

      // but be sure that the bound value is not an inherited function
      if (value && value.__bound && value.__original == self.parent[key]) {
        return
      }

      // at this point, the parent value, and this context's value do NOT match
      // so remove all inheritance bindings.
      valueBinding.dispose();

      if (parentPropertyBinding) parentPropertyBinding.dispose()
      if (parentBinding) parentBinding.dispose();
    });
  }

});


module.exports = {
  Object: SubindableObject
}
},{"bindable-object":7,"protoclass":231,"type-component":235,"underscore":234}],234:[function(require,module,exports){
//     Underscore.js 1.5.2
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.5.2';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? void 0 : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed > result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array, using the modern version of the 
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from an array.
  // If **n** is not specified, returns a single random element from the array.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (arguments.length < 2 || guard) {
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, value, context) {
      var result = {};
      var iterator = value == null ? _.identity : lookupIterator(value);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n == null) || guard ? array[0] : slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) {
      return array[array.length - 1];
    } else {
      return slice.call(array, Math.max(array.length - n, 0));
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, "length").concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error("bindAll must be passed function names");
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    return function() {
      context = this;
      args = arguments;
      timestamp = new Date();
      var later = function() {
        var last = (new Date()) - timestamp;
        if (last < wait) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) result = func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

},{}],235:[function(require,module,exports){
module.exports=require(34)
},{}],236:[function(require,module,exports){
module.exports=require(48)
},{}],237:[function(require,module,exports){
var protoclass = require("protoclass");

function BaseAttrBinding (view, node, scripts, attrName) {
  this.view     = view;
  this.application = view.template.application;
  this.node     = node;
  this.scripts  = scripts;
  this.attrName = attrName
}

protoclass(BaseAttrBinding, {

  /**
   */

  bind: function (context) {
    var self = this, binding = true;
    this.context = context;

    this._scriptBinding = this.scripts.value.bind(context, function (value, oldValue) {
      if (value === oldValue) return;

      // if rendering, do this immediately
      if(binding) return self.didChange(value, oldValue);

      // otherwise defer to rAf
      self.application.animate({
        update: function () {
          self.didChange(value, oldValue);
        }
      });
    });

    this._scriptBinding.now();
  },

  /**
   */

  unbind: function () {
    this._scriptBinding.dispose();
  },

  /**
   */

  didChange: function () {
    // override me
  },

  /**
   */

  test: function (attrValue) {
    return true;
  }
});

module.exports = BaseAttrBinding;
},{"protoclass":337}],238:[function(require,module,exports){
var EventDataBinding = require("./event"),
_bind                = require("../../utils/bind");

function ChangeAttrBinding () {
  EventDataBinding.apply(this, arguments);
}

ChangeAttrBinding.events = "keydown change keyup input mousedown mouseup click";

EventDataBinding.extend(ChangeAttrBinding, {
  preventDefault: false,
  event: ChangeAttrBinding.events,
  _update: function (event) {
    clearTimeout(this._changeTimeout);
    this._changeTimeout = setTimeout(_.bind(this._update2, this), 5);
  },
  _update2: function () {
    this.script.update();
  }
});

module.exports = ChangeAttrBinding;
},{"../../utils/bind":285,"./event":243}],239:[function(require,module,exports){
var EventDataBinding = require("./event");

module.exports = EventDataBinding.extend({
  preventDefault: true,
  event: "keydown",
  _onEvent: function (event) {

    if (!~[8].indexOf(event.keyCode)) {
      return;
    }
    EventDataBinding.prototype._onEvent.apply(this, arguments);
  }
});

},{"./event":243}],240:[function(require,module,exports){
var BaseBinding = require("./base");


function EnableBinding (view, node, script, attrName) {
  BaseBinding.apply(this, arguments);
}

BaseBinding.extend(EnableBinding, {

  /**
   */

  didChange: function (value) {
    if (value) {
      this.node.removeAttribute("disabled");
    } else {
      this.node.setAttribute("disabled", "disabled");
    }
  },

  /**
   */

  test: function (attrValue) {
    return attrValue.length === 1;
  }
});

module.exports = EnableBinding;

},{"./base":237}],241:[function(require,module,exports){
var EventDataBinding = require("./event");

module.exports = EventDataBinding.extend({
  preventDefault: true,
  event: "keydown",
  _onEvent: function (event) {

    if (!~[13].indexOf(event.keyCode)) {
      return;
    }
    EventDataBinding.prototype._onEvent.apply(this, arguments);
  }
});

},{"./event":243}],242:[function(require,module,exports){
var EventDataBinding = require("./event");

module.exports = EventDataBinding.extend({
  preventDefault: true,
  event: "keydown",
  _onEvent: function (event) {

    if (!~[27].indexOf(event.keyCode)) {
      return;
    }
    EventDataBinding.prototype._onEvent.apply(this, arguments);
  }
});

},{"./event":243}],243:[function(require,module,exports){
var protoclass = require("protoclass"),
_bind = require("../../utils/bind");

function EventAttrBinding (view, node, scripts, attrName) {
  this.view     = view;
  this.node     = node;
  this.scripts  = scripts;
  this.attrName = attrName;
  this._onEvent = _bind(this._onEvent, this);
}

protoclass(EventAttrBinding, {

  stopPropagation: true,
  preventDefault: false,

  /**
   */

  bind: function (context) {
    this.context = context;

    var event = (this.event || this.attrName).toLowerCase(),
    name      = this.attrName.toLowerCase();

    if (name.substr(0, 2) === "on") {
      name = name.substr(2);
    }

    if (event.substr(0, 2) === "on") {
      event = event.substr(2);
    }

    // this._updateScript(this.script("propagateEvent"));
    // this._updateScript(this.clip.script("preventDefault"));


    if (~["click", "mouseup", "mousedown", "submit"].indexOf(name)) {
      this.preventDefault  = true;
      this.stopPropagation = false;
    }

    this._pge = "propagateEvent." + name;
    this._pde = "preventDefault." + name;

    // this._setDefaultProperties(this._pge);
    // this._setDefaultProperties(this._pde);


    this.node.addEventListener(this._event = event, this._onEvent);
  },

  /**
   */

  _onEvent: function (event) {

    var pe, pd;

    if (this.scripts.stopPropagation == null) {
      pe = this.stopPropagation;
    } else {
      pe = this.scripts.stopPropagation.evaluate(this.context);
    }

    if (this.scripts.preventDefault == null) {
      pd = this.preventDefault;
    } else {
      pd = this.scripts.preventDefault.evaluate(this.context)
    }

    if (pe) event.stopPropagation();
    if (pd) event.preventDefault();

    if (this.node.disabled) return;
    this.context.set("event", event);
    this._update(event);
  },

  _update: function (event) {
    this.scripts.value.evaluate(this.context);
  },


  /*_setDefaultProperties: function (ev) {
    var prop = ev.split(".").shift();
    if (!this.clip.has(ev) && !this.clip.has(prop) && this[prop] != null) {
      this.clip.set(ev, this[prop]);
    }
  },*/

  /**
   */

  unbind: function () {
    this.node.removeEventListener(this._event, this._onEvent);
  },

  /**
   */

  didChange: function () {
    // override me
  }
});

module.exports = EventAttrBinding;
},{"../../utils/bind":285,"protoclass":337}],244:[function(require,module,exports){
extend = require("../../utils/extend");

"<div data-onClick={{}}></div>"

module.exports = function () {

  var attrBindings = extend({}, {

    "show"   : require("./show"),
    "enable" : require("./enable"),
    "focus"  : require("./focus"),
    "model"  : require("./model"),
    // "bind-style"  : require("./style"),
    // "bind-class"  : require("./class"),



    "onClick"       : require("./event"),
    "onDoubleClick" : require("./event"),
    "onLoad"        : require("./event"),
    "onSubmit"      : require("./event"),
    "onMouseDown"   : require("./event"),
    "onMouseUp"     : require("./event"),
    "onMouseOver"   : require("./event"),
    "onMouseMove"   : require("./event"),
    "onMouseOut"    : require("./event"),
    "onFocusIn"     : require("./event"),
    "onFocusOut"    : require("./event"),
    "onKeyDown"     : require("./event"),
    "onKeyUp"       : require("./event"),

    "onEnter"       : require("./enter"),
    "onEscape"      : require("./escape"),
    "onChange"      : require("./change"),
    "onDelete"      : require("./delete"),
  });

  return {
    register: function (name, attrBinding) {
      attrBindings[name] = attrBinding;
    },
    getClass: function (name, attrValue) {
      var clazz = attrBindings[name];
      if (clazz && (!clazz.prototype.test || clazz.prototype.test(attrValue))) {
        return clazz;
      }
    }
  };
}
},{"../../utils/extend":286,"./change":238,"./delete":239,"./enable":240,"./enter":241,"./escape":242,"./event":243,"./focus":245,"./model":246,"./show":247}],245:[function(require,module,exports){
var BaseBinding = require("./base");

function FocusBinding (view, node, scripts, attrName) {
  BaseBinding.apply(this, arguments);
}

BaseBinding.extend(FocusBinding, {

  /**
   */

  didChange: function (value) {
    if (!value) return;
    if (this.node.focus) {
      var self = this;

      // focus after being on screen. Need to break out
      // of animation, so setTimeout is the best option
      setTimeout(function(){ 
        self.node.focus(); 
      }, 1);
    }
  },

  /**
   */

  test: function (attrValue) {
    return attrValue.length === 1;
  }
});


module.exports = FocusBinding;
},{"./base":237}],246:[function(require,module,exports){
(function (process){
var BaseBinding = require("./base"),
_bind = require("../../utils/bind");

function ModelBinding (view, node, script, attrName) {
  BaseBinding.apply(this, arguments);
  this._onInput = _bind(this._onInput, this);
}

BaseBinding.extend(ModelBinding, {

  _events: ["change","keyup","input"],

  bind: function (context) {
    BaseBinding.prototype.bind.call(this, context);

    var self = this;

    if (/^(text|password|email)$/.test(this.node.getAttribute("type"))) {
      this._autocompleteCheckInterval = setInterval(function () {
        self._onInput();
      }, process.browser ? 500 : 10);
    }

    this._events.forEach(function (event) {
      self.node.addEventListener(event, self._onInput);
    });
  },

  /**
   */

  unbind: function () {
    BaseBinding.prototype.unbind.call(this);
    clearInterval(this._autocompleteCheckInterval);

    var self = this;
    this._events.forEach(function (event) {
      self.node.removeEventListener(event, self._onInput);
    });
  },

  /**
   */

  didChange: function (model) {
    this.model = model;

    if (this._modelBindings) this._modelBindings.dispose();
    if (!model) return;

    var self = this;

    this._modelBindings = this.context.bind(model.path, function (value) {
      self._elementValue(self._parseValue(value));
    }).now();
  },


  _parseValue: function (value) {
    if (value == null || value === "") return void 0;
    return value;
  },


  /**
   */

  test: function (attrValue) {
    return attrValue.length === 1;
  },

  /**
   */

  _onInput: function (event) {
    clearInterval(this._autocompleteCheckInterval);

    // ignore some keys
    if (event && (!event.keyCode || !~[27].indexOf(event.keyCode))) {
      event.stopPropagation();
    }


    var value = this._parseValue(this._elementValue());

    if (!this.model) return;

    this.model.value(value);
  },

  /**
   */

  _elementValue: function (value) {



    var isCheckbox    = /checkbox/.test(this.node.type),
    isRadio           = /radio/.test(this.node.type),
    isRadioOrCheckbox = isCheckbox || isRadio,
    isInput           = Object.prototype.hasOwnProperty.call(this.node, "value") || /input|textarea|checkbox/.test(this.node.nodeName.toLowerCase());


    if (!arguments.length) {
      if (isCheckbox) {
        return Boolean(this.node.checked);
      } else if (isInput) {
        return this.node.value || "";
      } else {
        return this.node.innerHTML || "";
      }
    }

    if (value == null) {
      value = "";
    } else {
      clearInterval(this._autocompleteCheckInterval);
    }

    if (isRadioOrCheckbox) {
      if (isRadio) {
        if (String(value) === String(this.node.value)) {
          this.node.checked = true;
        }
      } else {
        this.node.checked = value;
      }
    } else if(value != this._elementValue()) {

      if (isInput) {
        this.node.value = value;
      } else {
        this.node.innerHTML = value;
      }
    }
  }

});


module.exports = ModelBinding;
}).call(this,require("OpdoqP"))
},{"../../utils/bind":285,"./base":237,"OpdoqP":65}],247:[function(require,module,exports){
var BaseBinding = require("./base");

function ShowBinding (view, node, scripts, attrName) {
  BaseBinding.apply(this, arguments);
  this._displayStyle = this.node.style.display;
}

BaseBinding.extend(ShowBinding, {

  /**
   */

  didChange: function (value) {

    var state = value ? this._displayStyle : "none";

    if (this.node.__isNode) {
      this.node.style.setProperties({ display: state })
    } else {
      this.node.style.display = state;
    }
  },

  /**
   */

  test: function (attrValue) {
    return attrValue.length === 1;
  }
});

module.exports = ShowBinding;
},{"./base":237}],248:[function(require,module,exports){
var protoclass = require("protoclass");

function BaseBlockBinding (view, name, scripts, section, contentTemplate, childTemplate) {
  this.view            = view;
  this.scripts         = scripts;
  this.mainScript      = scripts[name];
  this.application     = view.template.application;
  this.section         = section;
  this.nodeFactory     = this.application.nodeFactory;
  this.contentTemplate = contentTemplate;
  this.childTemplate   = childTemplate;
}

protoclass(BaseBlockBinding, {

  /**
   */

  bind: function (context) {
    var self = this, binding = true;
    this.context = context;
    this._scriptBinding = this.mainScript.bind(context, function (value, oldValue) {
      if (binding) return self.didChange(value, oldValue);
      if (value === oldValue) return;
      // rAf
      self.application.animate({
        update: function () {
          self.didChange(value, oldValue);
        }
      });
    });

    this._scriptBinding.now();
    binding = false;
  },

  /**
   */

  unbind: function () {
    this._scriptBinding.dispose();
  },

  /**
   */

  didChange: function () {
    // override me
  }
});

module.exports = BaseBlockBinding;
},{"protoclass":337}],249:[function(require,module,exports){
var BaseBlockBinding = require("./base");

module.exports = BaseBlockBinding.extend({
  didChange: function (value, oldValue) {

    // cast as a boolean value - might be something like
    // an integer
    value = !!value;


    if (this._oldValue === value) {
      if (this.child && !this.child.bound) {
        this.child.bind(this.context);
      }
      return;
    }

    this._oldValue = value;

    if (this.child) {
      this.child.dispose();
      this.child = undefined;
    }

    var childTemplate;

    if (value) {
      childTemplate = this.contentTemplate;
    } else {
      childTemplate = this.childTemplate;
    }

    if (childTemplate) {
      this.child = childTemplate.bind(this.context);
      this.section.appendChild(this.child.render());
    }
  },
  unbind: function () {
    BaseBlockBinding.prototype.unbind.call(this);
    var child = this.child;
    return child ? child.unbind() : undefined;
  }
});
},{"./base":248}],250:[function(require,module,exports){
var BaseBlockBinding = require("./base"),
BindableObject       = require("bindable-object");

// TODO - need to create own context which inherits properties
// TODO - ability to set property for each value {{#each:{ source: source, as: 'name'}}}

module.exports = BaseBlockBinding.extend({
  bind: function (context) {
    BaseBlockBinding.prototype.bind.call(this, context);

    var allocate = this.scripts.allocate ? this.scripts.allocate.evaluate(this.context) : 0,
    chunk        = this.scripts.chunk    ? this.scripts.chunk.evaluate(this.context)    : allocate,
    delay        = this.scripts.delay    ? this.scrtips.delay.evaluate(this.context)    : 1;

    if (!allocate) return;

    var i = 0, self = this;

    function allocateItems () {
      while (i++ < chunk) {
        self.contentTemplate.bind().dispose();
      }

      if (i < allocate) setTimeout(allocateItems, delay);
    }

    allocateItems();
  },
  unbind: function () {
    BaseBlockBinding.prototype.unbind.call(this);
    if (this._updateListener) this._updateListener.dispose();
  },
  didChange: function (source) {

    if (this._updateListener) this._updateListener.dispose();

    var name = this.scripts.as ? this.scripts.as.evaluate(this.context) : void 0;

    if (!source) source = [];

    if (source.__isBindableCollection) {

      var self = this, collection = source;

      this._updateListener = source.once("update", function () {
        self.didChange(collection);
      });

      source = source.source;
    }

    if (!this._children) this._children = [];
    var self = this;

    for (var i = 0, n = source.length; i < n; i++) {

      if (name) {

        var props = new BindableObject();
        props[name] = source[i];
        props.index = i;

        // dirty - inherit props
        props.get = function (path) {
          if (this[path[0]] != null) return BindableObject.prototype.get.call(this, path);
          var ret = self.context.get(path);

          if (typeof ret === "function") {
            return function () {
              return ret.apply(self.context, arguments);
            }
          }

          return ret;
        }
      } else {
        var props = source[i];
      }

      if (i < this._children.length) {
        this._children[i].bind(props);
      } else {
        var child = this.contentTemplate.bind(props);
        this._children.push(child);
        this.section.appendChild(child.render());
      }
    }

    // TODO - easeOutSync?
    this._children.splice(i).forEach(function (child) {
      child.remove();
    });
  }
});
},{"./base":248,"bindable-object":7}],251:[function(require,module,exports){
var BaseBlockBinding = require("./base");

module.exports = BaseBlockBinding.extend({
  bind: function (context) {
    this.context = context;
    if (this.child) {
      return this.child.bind(context);
    }
    this.child = this.contentTemplate.bind(context);
    this.section.appendChild(this.child.render());
  },
  unbind: function () {
    if (this.child) this.child.unbind();
  }
});
},{"./base":248}],252:[function(require,module,exports){
extend = require("../../utils/extend");


module.exports = function () {

  var blockBindings = extend({}, {
    "if": require("./condition"),
    "else": require("./else"),
    "elseif": require("./condition"),
    "html": require("./html"),
    "each": require("./each")
  });

  return {
    register: function (name, blockBinding) {
      blockBindings[name] = blockBinding;
    },
    getClass: function (name) {
      return blockBindings[name];
    }
  };
}
},{"../../utils/extend":286,"./condition":249,"./each":250,"./else":251,"./html":253}],253:[function(require,module,exports){
var BaseBlockBinding = require("./base");

module.exports = BaseBlockBinding.extend({
  didChange: function (value, oldValue) {

    // has a remove script
    if (oldValue && oldValue.remove) {
      oldValue.remove();
    }


    if (!value) {
      return this.section.removeAll();
    }

    var node;

    if (value.render) {
      value.remove();
      node = value.render();
    } else if (value.nodeType != null) {
      node = value;
    } else {
      if (this.nodeFactory.name !== "dom") {
        node = this.nodeFactory.createTextNode(String(value));
      } else {
        var div = this.nodeFactory.createElement("div");
        div.innerHTML = String(value);
        node = this.nodeFactory.createFragment(div.childNodes);
      }
    }

    return this.section.replaceChildNodes(node);
  }
});
},{"./base":248}],254:[function(require,module,exports){
var protoclass = require("protoclass");

/**
 * bindings specific to the view
 */

function Bindings () {
  this._bindings = [];
}

protoclass(Bindings, {

  /**
   */

  push: function (clip) {
    this._bindings.push(clip);
  },

  /**
   */

  bind: function (context) {
    if (this._bound) this.unbind();
    this._bound = true;
    for (var i = this._bindings.length; i--;) {
      this._bindings[i].bind(context);
    }
  },

  /**
   */

  unbind: function () {
    this._bound = false;
    for (var i = this._bindings.length; i--;) {
      this._bindings[i].unbind();
    }
  }
});

module.exports = Bindings;
},{"protoclass":337}],255:[function(require,module,exports){
var protoclass = require("protoclass");

/**
 * Clips are the {{blocks}} that are defined int the template. These
 * are objects that get defined ONCE, then generate bindings which get "clipped"
 * onto views.
 */

function Clips (template) {
  this.template = template;
  this._clips   = [];
}

protoclass(Clips, {

  /**
   */

  push: function (clip) {
    this._clips.push(clip);
  },

  /**
   * called after the template node is created. Sets the clips
   * up to be re-used
   */

  initialize: function () {
    for (var i = this._clips.length; i--;) {
      this._clips[i].initialize();
    }
  },

  /**
   * hydrates the view with bindings
   */

  prepare: function (view) {
    for (var i = this._clips.length; i--;) {
      this._clips[i].prepare(view);
    }
  }
});

module.exports = Clips;
},{"protoclass":337}],256:[function(require,module,exports){
module.exports = {
  uppercase: function (value) {
    return String(value).toUpperCase();
  },
  lowercase: function (value) {
    return String(value).toLowerCase();
  },
  titlecase: function (value) {
    var str;

    str = String(value);
    return str.substr(0, 1).toUpperCase() + str.substr(1);
  },
  json: function (value, count, delimiter) {
    return JSON.stringify.apply(JSON, arguments);
  },
  isNaN: function (value) {
    return isNaN(value);
  }
};
},{}],257:[function(require,module,exports){
(function (process,global){
var Application          = require("mojo-application"),
template                 = require("./template"),
defaultModifiers         = require("./defaultModifiers"),
BaseBlockBinding         = require("./bindings/block/base"),
createBlockBindingFacory = require("./bindings/block/factory"),
createAttrBindingFactory = require("./bindings/attrs/factory"),
BaseAttrBinding          = require("./bindings/attrs/base"),
extend                   = require("./utils/extend");

if (!process.browser) {
  require("./register");
}

module.exports = function (app) {

  if (!app) app = Application.main;
  if (app.paperlip) return app.paperlip;

  var _modifiers = extend({}, defaultModifiers),
  blockBindingFactory = createBlockBindingFacory(app),
  attrBindingFactory  = createAttrBindingFactory(app);

  if (!app.animate) app.use(require("mojo-animator"));

  var pc = {

    /**
     */

    application: app,

    /**
     */

    modifiers: _modifiers,

    /**
     */

    modifier: function (name, modifier) {
      _modifiers[name] = modifier;
    },

    /**
     */

    template: function (source, rapp) {
      return new template(source, rapp || app);
    },

    /**
     */

    blockBinding: blockBindingFactory.register,

    /**
     */

    blockBindingFactory: blockBindingFactory,

    /**
     */

    attrBinding: attrBindingFactory.register,

    /**
     */

    attrBindingFactory: attrBindingFactory
  };

  app.set("paperclip", pc);

  return pc;
}


var pc = global.paperclip = module.exports();

for (var key in pc) {
  module.exports[key] = pc[key];
}

module.exports.BaseBlockBinding = BaseBlockBinding;
module.exports.BaseAttrBinding  = BaseAttrBinding;
module.exports.parser = require("./parser");

}).call(this,require("OpdoqP"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./bindings/attrs/base":237,"./bindings/attrs/factory":244,"./bindings/block/base":248,"./bindings/block/factory":252,"./defaultModifiers":256,"./parser":279,"./register":281,"./template":284,"./utils/extend":286,"OpdoqP":65,"mojo-animator":303,"mojo-application":305}],258:[function(require,module,exports){
var BaseExpression = require("./base"),
ParametersExpression = require("./parameters");

function ArrayExpression (expressions) {
  this.expressions = expressions || new ParametersExpression();
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(ArrayExpression, {
  type: "array",
  toJavaScript: function () {
    return "[" + this.expressions.toJavaScript() + "]";
  }
});

module.exports = ArrayExpression;
},{"./base":260,"./parameters":272}],259:[function(require,module,exports){
var BaseExpression = require("./base");

function AssignmentExpression (reference, value) {
  BaseExpression.apply(this, arguments);
  this.reference = reference;
  this.value     = value;
}

BaseExpression.extend(AssignmentExpression, {
  type: "assignment",
  toJavaScript: function () {

    var path = this.reference.path.map(function(p) { return "'"+p+"'"; }).join(', ');

    return "this.set([" + path + "], " + this.value.toJavaScript() + ")";
  }
});

module.exports = AssignmentExpression;
},{"./base":260}],260:[function(require,module,exports){
var protoclass = require("protoclass");

function BaseExpression () {
  this._children = [];
  this._addChildren(Array.prototype.slice.call(arguments, 0));
}

protoclass(BaseExpression, {

  /**
   */

  __isExpression: true,

  /**
   */

  _addChildren: function (children) {
    for (var i = children.length; i--;) {
      var child = children[i];
      if (!child) continue;
      if (child.__isExpression) {
        this._children.push(child);
      } else if (typeof child === "object") {
        for (var k in child) {
          this._addChildren([child[k]]);
        }
      }
    }
  },

  /**
   */

  filterAllChildren: function (filter) {
    var filtered = [];

    this.traverseChildren(function (child) {
      if(filter(child)) {
        filtered.push(child);
      }
    });
    
    return filtered;
  },

  /**
   */

  traverseChildren: function (fn) {

    fn(this);

    for (var i = this._children.length; i--;) {
      var child = this._children[i];
      child.traverseChildren(fn);
    }
  }
});

module.exports = BaseExpression;
},{"protoclass":337}],261:[function(require,module,exports){
var BaseExpression = require("./base");

function BlockBindingExpression (scripts, contentTemplate, childBlock) {
  this.scripts    = scripts;
  this.contentTemplate = contentTemplate;
  this.childBlock = childBlock;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(BlockBindingExpression, {
  type: "blockBinding",
  toJavaScript: function () {
    var buffer = "block("+ this.scripts.toJavaScript() +", " + (this.contentTemplate ? this.contentTemplate.toJavaScript() : "void 0");

    if (this.childBlock) {
      buffer += ", " + this.childBlock.toJavaScript();
    }

    return buffer + ")";
  }
});

module.exports = BlockBindingExpression;
},{"./base":260}],262:[function(require,module,exports){
var BaseExpression = require("./base");

function CallExpression (reference, parameters) {
  this.reference  = reference;
  this.parameters = parameters;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(CallExpression, {
  type: "call",
  toJavaScript: function () {

    var path = this.reference.path.concat(),
    fnName   = path.pop();

    var buffer = "this.call(";

    if (path.length) {
      buffer += "this.get([" + path.map(function (name) {
        return "\"" + name + "\"";
      }).join(",") + "])"
    } else {
      buffer += "this.context"
    }

    buffer += ", \"" + fnName + "\"";

    buffer += ", [" + this.parameters.toJavaScript() + "]"

    return buffer + ")"
  }
});

module.exports = CallExpression;
},{"./base":260}],263:[function(require,module,exports){
var BaseExpression = require("./base");

function CommentNodeExpression (value) {
  this.value = value;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(CommentNodeExpression, {
  type: "commentNode",
  toJavaScript: function () {
    return "comment(\"" + this.value.replace(/["]/g, "\\\"") + "\")"
  }
});

module.exports = CommentNodeExpression;
},{"./base":260}],264:[function(require,module,exports){
var BaseExpression = require("./base");

function DoctypeExpression (value) {
  this.value = value;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(DoctypeExpression, {
  type: "doctype",
  toJavaScript: function () {
    return "text('<!DOCTYPE " + this.value + ">')"
  }
});

module.exports = DoctypeExpression;
},{"./base":260}],265:[function(require,module,exports){
var BaseExpression = require("./base"),
ArrayExpression    = require("./array");

function ElementNodeExpression (nodeName, attributes, childNodes) {
  this.name       = nodeName;
  this.attributes = attributes;
  this.childNodes = childNodes || new ArrayExpression();
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(ElementNodeExpression, {
  type: "elementNode",
  toJavaScript: function () {
    return "element(\"" + this.name + "\", " + this.attributes.toJavaScript() + ", " + this.childNodes.toJavaScript() + ")";
  }
});

module.exports = ElementNodeExpression;
},{"./array":258,"./base":260}],266:[function(require,module,exports){
var BaseExpression = require("./base");

function GroupExpression (expression) {
  this.expression = expression;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(GroupExpression, {
  type: "call",
  toJavaScript: function () {
    return "(" + this.expression.toJavaScript() + ")";
  }
});

module.exports = GroupExpression;
},{"./base":260}],267:[function(require,module,exports){
var BaseExpression = require("./base");

function HashExpression (values) {
  this.value = values;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(HashExpression, {
  type: "hash",
  toJavaScript: function () {

    var items = [];

    for (var key in this.value) {
      var v = this.value[key];
      items.push("'"+key+"':"+v.toJavaScript());
    }

    return "{" + items.join(", ") + "}";
  }
});

module.exports = HashExpression;
},{"./base":260}],268:[function(require,module,exports){
var BaseExpression = require("./base");

function LiteralExpression (value) {
  this.value = value;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(LiteralExpression, {
  type: "literal",
  toJavaScript: function () {
    return String(this.value);
  }
});

module.exports = LiteralExpression;
},{"./base":260}],269:[function(require,module,exports){
var BaseExpression = require("./base");

function ModifierExpression (name, parameters) {
  this.name  = name;
  this.parameters = parameters;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(ModifierExpression, {
  type: "modifier",
  toJavaScript: function () {

    var buffer = "modifiers." + this.name + ".call(this" 

    var params = this.parameters.toJavaScript();

    if (params.length) {
      buffer += ", " + params;
    }
    
  
    return buffer + ")";

  }
});

module.exports = ModifierExpression;
},{"./base":260}],270:[function(require,module,exports){
var BaseExpression = require("./base");

function NotExpression (operator, expression) {
  this.operator = operator;
  this.expression = expression;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(NotExpression, {
  type: "!",
  toJavaScript: function () {
    return this.operator + this.expression.toJavaScript();
  }
});

module.exports = NotExpression;
},{"./base":260}],271:[function(require,module,exports){
var BaseExpression = require("./base");

function OperatorExpression (operator, left, right) {
  this.operator = operator;
  this.left     = left;
  this.right    = right;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(OperatorExpression, {
  type: "operator",
  toJavaScript: function () {
    return this.left.toJavaScript() + this.operator + this.right.toJavaScript();
  }
});

module.exports = OperatorExpression;
},{"./base":260}],272:[function(require,module,exports){
var BaseExpression = require("./base");

function ParametersExpression (expressions) {
  this.expressions = expressions || [];
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(ParametersExpression, {
  type: "parameters",
  toJavaScript: function () {
    return this.expressions.map(function (expression) {
      return expression.toJavaScript();
    }).join(", ");
  }
});

module.exports = ParametersExpression;
},{"./base":260}],273:[function(require,module,exports){
var BaseExpression = require("./base");

function ReferenceExpression (path, bindingType) {
  this.path       = path;
  this.bindingType = bindingType;
  this.fast = bindingType === "^";
  this.unbound  = ["~", "~>"].indexOf(bindingType) !== -1;
  this._isBoundTo = ~["<~", "<~>", "~>"].indexOf(this.bindingType);
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(ReferenceExpression, {
  type: "reference",
  toJavaScript: function () {

    if (!this._isBoundTo)
    if (this.fast) {
      return "this.context." + this.path.join(".");
    }


    var path = this.path.map(function(p) { return "'"+p+"'"; }).join(', ');

    if (this._isBoundTo) {
      return "this.bindTo([" + path + "], "+(this.bindingType !== "<~")+")";
    }

    return "this.context.get([" + path + "])";
  }
});

module.exports = ReferenceExpression;
},{"./base":260}],274:[function(require,module,exports){
var BaseExpression = require("./base");

function RootExpression (children) {
  this.childNodes = children;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(RootExpression, {
  type: "rootNode",
  toJavaScript: function () {

    var buffer = "(function (fragment, block, element, text, comment, parser, modifiers) { ";

    var element;

    if (this.childNodes.type === "array") {
      if (this.childNodes.expressions.expressions.length > 1) {
        element = "fragment(" + this.childNodes.toJavaScript() + ")";
      } else if (this.childNodes.expressions.expressions.length) {
        element = this.childNodes.expressions.expressions[0].toJavaScript();
      } else {
        return buffer + "})";
      }
    } else {
      element = this.childNodes.toJavaScript();
    }

    return buffer + "return " + element + "; })"
  }
});

module.exports = RootExpression;
},{"./base":260}],275:[function(require,module,exports){
var BaseExpression = require("./base"),
uniq               = require("../../utils/uniq");

function ScriptExpression (value) {
  this.value = value;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(ScriptExpression, {
  type: "script",
  toJavaScript: function () {

    var refs = this.filterAllChildren(function (child) {
      return child.type === "reference";
    }).filter(function (reference) {
      return !reference.unbound && reference.path;
    }).map(function (reference) {
      return reference.path;
    });




    // remove duplicate references
    refs = uniq(refs.map(function (ref) {
      return ref.join(".")
    })).map(function (ref) {
      return ref.split(".");
    })

    var buffer = "{";

    buffer += "run: function () { return " + this.value.toJavaScript() + "; }";

    buffer += ", refs: " + JSON.stringify(refs)

    return buffer + "}";
  }
});

module.exports = ScriptExpression;
},{"../../utils/uniq":289,"./base":260}],276:[function(require,module,exports){
var BaseExpression = require("./base");

function StringExpression (value) {
  this.value = value;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(StringExpression, {
  type: "string",
  toJavaScript: function () {
    return "\"" + this.value.replace(/"/g, "\\\"") + "\"";
  }
});

module.exports = StringExpression;
},{"./base":260}],277:[function(require,module,exports){
var BaseExpression = require("./base");

function TernaryConditionExpression (condition, tExpression, fExpression) {
  this.condition = condition;
  this.tExpression = tExpression;
  this.fExpression = fExpression;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(TernaryConditionExpression, {
  type: "ternaryCondition",
  toJavaScript: function () {
    return this.condition.toJavaScript() + "?" + this.tExpression.toJavaScript() + ":" + this.fExpression.toJavaScript();
  }
});

module.exports = TernaryConditionExpression;
},{"./base":260}],278:[function(require,module,exports){
var BaseExpression = require("./base"),
he                 = require("he");

function TextNodeExpression (value) {
  this.value = he.decode(value);
  this.decoded = this.value !== value;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(TextNodeExpression, {
  type: "textNode",
  toJavaScript: function () {
    return "text(\"" + this.value.replace(/["]/g, "\\\"") + "\")";
  }
});

module.exports = TextNodeExpression;

},{"./base":260,"he":301}],279:[function(require,module,exports){
var parser = require("./parser");

var scripts = {}, parse;

module.exports = {

  /**
   */

  parse: parse = function (html) {
    return '"use strict";' + "module.exports = " + parser.parse(html).toJavaScript();
  },

  /**
   */

  compile: function (nameOrContent) {
    var content;


    if (scripts[nameOrContent]) {
      return scripts[nameOrContent];
    }

    try {
      if (typeof $ !== "undefined") {
        content = $("script[data-template-name='" + nameOrContent + "']").html();
      }
    } catch (e) {

    }

    if (!content) {
      content = nameOrContent;
    }

    var source = '"use strict";return '+parser.parse(content).toJavaScript();


    return scripts[nameOrContent] = new Function(source)();
  }
}

if (typeof (typeof window !== "undefined" && window !== null ? window.paperclip : void 0) !== "undefined") {
  window.paperclip.compile           = module.exports.compile;
  window.paperclip.script            = module.exports.script;
  window.paperclip.template.compiler = module.exports;
}

},{"./parser":280}],280:[function(require,module,exports){
module.exports = (function() {
  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleFunctions = { Start: peg$parseStart },
        peg$startRuleFunction  = peg$parseStart,

        peg$c0 = function(children) { return new RootNodeExpression(children); },
        peg$c1 = peg$FAILED,
        peg$c2 = "<!DOCTYPE",
        peg$c3 = { type: "literal", value: "<!DOCTYPE", description: "\"<!DOCTYPE\"" },
        peg$c4 = [],
        peg$c5 = /^[^>]/,
        peg$c6 = { type: "class", value: "[^>]", description: "[^>]" },
        peg$c7 = ">",
        peg$c8 = { type: "literal", value: ">", description: "\">\"" },
        peg$c9 = function(info) {
              return new DocTypeExpression(info.join(""));
            },
        peg$c10 = function(children) { return new ArrayExpression(new ParametersExpression(trimTextExpressions(children))) },
        peg$c11 = "<!--",
        peg$c12 = { type: "literal", value: "<!--", description: "\"<!--\"" },
        peg$c13 = void 0,
        peg$c14 = "-->",
        peg$c15 = { type: "literal", value: "-->", description: "\"-->\"" },
        peg$c16 = function(v) { return v; },
        peg$c17 = function(value) {
            return new CommentNodeExpression(trimEnds(value.join("")));
          },
        peg$c18 = function(startTag, children, endTag) {

            if (startTag.name != endTag.name) {
              expected("</" + startTag.name + ">");
            }

            return new ElementNodeExpression(startTag.name, startTag.attributes, children);
          },
        peg$c19 = function(value) {
              return new TextNodeExpression(trimNewLineChars(value.join("")))
            },
        peg$c20 = "<",
        peg$c21 = { type: "literal", value: "<", description: "\"<\"" },
        peg$c22 = "{{",
        peg$c23 = { type: "literal", value: "{{", description: "\"{{\"" },
        peg$c24 = function() {
              return text()
            },
        peg$c25 = function(info) { return info; },
        peg$c26 = "/>",
        peg$c27 = { type: "literal", value: "/>", description: "\"/>\"" },
        peg$c28 = function(info) { return new ElementNodeExpression(info.name, info.attributes); },
        peg$c29 = function(name, attributes) {

              var attrs = {};

              for (var i = 0, n = attributes.length; i < n; i++) {
                var attr = attributes[i];
                attrs[attr.name] = attr.value;
              }

              return {
                name: name,
                attributes: new HashExpression(attrs)
              };
            },
        peg$c30 = "</",
        peg$c31 = { type: "literal", value: "</", description: "\"</\"" },
        peg$c32 = function(name) {
              return {
                name: name
              };
            },
        peg$c33 = /^[a-zA-Z0-9:_\-]/,
        peg$c34 = { type: "class", value: "[a-zA-Z0-9:_\\-]", description: "[a-zA-Z0-9:_\\-]" },
        peg$c35 = function(word) { return word.join(""); },
        peg$c36 = "=",
        peg$c37 = { type: "literal", value: "=", description: "\"=\"" },
        peg$c38 = function(name, values) {
              return {
                name: name,
                value: values
              };
            },
        peg$c39 = function(name) {
              return {
                name: name,
                value: new LiteralExpression(true)
              }
            },
        peg$c40 = "\"",
        peg$c41 = { type: "literal", value: "\"", description: "\"\\\"\"" },
        peg$c42 = /^[^"]/,
        peg$c43 = { type: "class", value: "[^\"]", description: "[^\"]" },
        peg$c44 = function() { return new StringExpression(trimNewLineChars(text())); },
        peg$c45 = function(values) { return attrValues(values); },
        peg$c46 = "'",
        peg$c47 = { type: "literal", value: "'", description: "\"'\"" },
        peg$c48 = /^[^']/,
        peg$c49 = { type: "class", value: "[^']", description: "[^']" },
        peg$c50 = function(binding) { return attrValues([binding]); },
        peg$c51 = "{{#",
        peg$c52 = { type: "literal", value: "{{#", description: "\"{{#\"" },
        peg$c53 = function(blockBinding) { return blockBinding; },
        peg$c54 = function(scripts, fragment, child) {
              return new BlockBindingExpression(scripts, fragment, child);
            },
        peg$c55 = "{{/",
        peg$c56 = { type: "literal", value: "{{/", description: "\"{{/\"" },
        peg$c57 = function(blockBinding) { return new RootNodeExpression(blockBinding); },
        peg$c58 = "{{/}}",
        peg$c59 = { type: "literal", value: "{{/}}", description: "\"{{/}}\"" },
        peg$c60 = function() { return void 0; },
        peg$c61 = "}}",
        peg$c62 = { type: "literal", value: "}}", description: "\"}}\"" },
        peg$c63 = function(scripts) {
              return new BlockBindingExpression(scripts);
            },
        peg$c64 = function(scripts) {
              return scripts;
            },
        peg$c65 = function(scriptName) {
              var hash = {};
              hash[scriptName] = new ScriptExpression(new LiteralExpression(true));
              return new HashExpression(hash)
            },
        peg$c66 = function(scripts) {
              for (var k in scripts) {
                scripts[k] = new ScriptExpression(scripts[k]);
              }
              return new HashExpression(scripts);
            },
        peg$c67 = ",",
        peg$c68 = { type: "literal", value: ",", description: "\",\"" },
        peg$c69 = function(value, ascripts) {

              var scripts = {
                value: new ScriptExpression(value)
              };

              ascripts = ascripts.length ? ascripts[0][1] : [];
              for (var i = 0, n = ascripts.length; i < n; i++) {
                scripts[ascripts[i].key] = new ScriptExpression(ascripts[i].value);
              }

              return new HashExpression(scripts);
            },
        peg$c70 = "?",
        peg$c71 = { type: "literal", value: "?", description: "\"?\"" },
        peg$c72 = ":",
        peg$c73 = { type: "literal", value: ":", description: "\":\"" },
        peg$c74 = function(condition, left, right) {
              return new TernaryConditionExpression(condition, left, right);
            },
        peg$c75 = "(",
        peg$c76 = { type: "literal", value: "(", description: "\"(\"" },
        peg$c77 = ")",
        peg$c78 = { type: "literal", value: ")", description: "\")\"" },
        peg$c79 = function(params) {
              return params;
            },
        peg$c80 = "()",
        peg$c81 = { type: "literal", value: "()", description: "\"()\"" },
        peg$c82 = function() { []; },
        peg$c83 = function(param1, rest) {
              return [param1].concat(rest.map(function (v) {
                return v[1];
              }));
            },
        peg$c84 = function(left, right) {
              return new AssignmentExpression(left, right);
            },
        peg$c85 = "&&",
        peg$c86 = { type: "literal", value: "&&", description: "\"&&\"" },
        peg$c87 = "||",
        peg$c88 = { type: "literal", value: "||", description: "\"||\"" },
        peg$c89 = "===",
        peg$c90 = { type: "literal", value: "===", description: "\"===\"" },
        peg$c91 = "==",
        peg$c92 = { type: "literal", value: "==", description: "\"==\"" },
        peg$c93 = "!==",
        peg$c94 = { type: "literal", value: "!==", description: "\"!==\"" },
        peg$c95 = "!=",
        peg$c96 = { type: "literal", value: "!=", description: "\"!=\"" },
        peg$c97 = ">==",
        peg$c98 = { type: "literal", value: ">==", description: "\">==\"" },
        peg$c99 = ">=",
        peg$c100 = { type: "literal", value: ">=", description: "\">=\"" },
        peg$c101 = "<==",
        peg$c102 = { type: "literal", value: "<==", description: "\"<==\"" },
        peg$c103 = "<=",
        peg$c104 = { type: "literal", value: "<=", description: "\"<=\"" },
        peg$c105 = "+",
        peg$c106 = { type: "literal", value: "+", description: "\"+\"" },
        peg$c107 = "-",
        peg$c108 = { type: "literal", value: "-", description: "\"-\"" },
        peg$c109 = "%",
        peg$c110 = { type: "literal", value: "%", description: "\"%\"" },
        peg$c111 = "*",
        peg$c112 = { type: "literal", value: "*", description: "\"*\"" },
        peg$c113 = "/",
        peg$c114 = { type: "literal", value: "/", description: "\"/\"" },
        peg$c115 = function(left, operator, right) {
              return new OperatorExpression(operator, left, right);
            },
        peg$c116 = function(value) { return value; },
        peg$c117 = function(expression, modifiers) {

              for (var i = 0, n = modifiers.length; i < n; i++) {
                expression = new ModifierExpression(modifiers[i].name, new ParametersExpression([expression].concat(modifiers[i].parameters)));
              }

              return expression;
            },
        peg$c118 = "|",
        peg$c119 = { type: "literal", value: "|", description: "\"|\"" },
        peg$c120 = null,
        peg$c121 = function(name, parameters) {
            return {
              name: name,
              parameters: parameters || []
            }
          },
        peg$c122 = function(context) { return context; },
        peg$c123 = "!",
        peg$c124 = { type: "literal", value: "!", description: "\"!\"" },
        peg$c125 = function(not, value) {
              return new NotExpression(not, value);
            },
        peg$c126 = /^[0-9]/,
        peg$c127 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c128 = function(value) {
              return new LiteralExpression(parseFloat(text()));
            },
        peg$c129 = ".",
        peg$c130 = { type: "literal", value: ".", description: "\".\"" },
        peg$c131 = function(group) { return new GroupExpression(group); },
        peg$c132 = function(expression) {
              return new LiteralExpression(expression.value);
            },
        peg$c133 = "true",
        peg$c134 = { type: "literal", value: "true", description: "\"true\"" },
        peg$c135 = "false",
        peg$c136 = { type: "literal", value: "false", description: "\"false\"" },
        peg$c137 = function(value) {
              return {
                type: "boolean",
                value: value === "true"
              }
            },
        peg$c138 = "undefined",
        peg$c139 = { type: "literal", value: "undefined", description: "\"undefined\"" },
        peg$c140 = function() { return { type: "undefined", value: void 0 }; },
        peg$c141 = "NaN",
        peg$c142 = { type: "literal", value: "NaN", description: "\"NaN\"" },
        peg$c143 = function() { return { type: "nan", value: NaN }; },
        peg$c144 = "Infinity",
        peg$c145 = { type: "literal", value: "Infinity", description: "\"Infinity\"" },
        peg$c146 = function() { return { type: "infinity", value: Infinity }; },
        peg$c147 = "null",
        peg$c148 = { type: "literal", value: "null", description: "\"null\"" },
        peg$c149 = "NULL",
        peg$c150 = { type: "literal", value: "NULL", description: "\"NULL\"" },
        peg$c151 = function() { return { type: "null", value: null }; },
        peg$c152 = function(reference, parameters) {
              return new CallExpression(reference, new ParametersExpression(parameters));
            },
        peg$c153 = "^",
        peg$c154 = { type: "literal", value: "^", description: "\"^\"" },
        peg$c155 = "~>",
        peg$c156 = { type: "literal", value: "~>", description: "\"~>\"" },
        peg$c157 = "<~>",
        peg$c158 = { type: "literal", value: "<~>", description: "\"<~>\"" },
        peg$c159 = "~",
        peg$c160 = { type: "literal", value: "~", description: "\"~\"" },
        peg$c161 = "<~",
        peg$c162 = { type: "literal", value: "<~", description: "\"<~\"" },
        peg$c163 = function(bindingType, reference, path) {
              path = [reference].concat(path.map(function (p) { return p[1] }));
              return new ReferenceExpression(path, bindingType);
            },
        peg$c164 = /^[a-zA-Z_$0-9]/,
        peg$c165 = { type: "class", value: "[a-zA-Z_$0-9]", description: "[a-zA-Z_$0-9]" },
        peg$c166 = function(name) { return text(); },
        peg$c167 = "{",
        peg$c168 = { type: "literal", value: "{", description: "\"{\"" },
        peg$c169 = "}",
        peg$c170 = { type: "literal", value: "}", description: "\"}\"" },
        peg$c171 = function(values) {
              return new HashExpression(values);
            },
        peg$c172 = function(values) {
              var s = {};
              for (i = 0, n = values.length; i < n; i++) {
                s[values[i].key] = values[i].value;
              }
              return s;
            },
        peg$c173 = function(firstValue, additionalValues) {
              return [
                firstValue
              ].concat(additionalValues.length ? additionalValues[0][1] : []);
            },
        peg$c174 = function(key, value) {
              return {
                key: key,
                value: value || new LiteralExpression(void 0)
              }
            },
        peg$c175 = function(key) { return key.value; },
        peg$c176 = function(key) { return key; },
        peg$c177 = { type: "other", description: "string" },
        peg$c178 = function(chars) {
              return new StringExpression(chars.join(""));
            },
        peg$c179 = "\\",
        peg$c180 = { type: "literal", value: "\\", description: "\"\\\\\"" },
        peg$c181 = function() { return text(); },
        peg$c182 = "\\\"",
        peg$c183 = { type: "literal", value: "\\\"", description: "\"\\\\\\\"\"" },
        peg$c184 = "\\'",
        peg$c185 = { type: "literal", value: "\\'", description: "\"\\\\'\"" },
        peg$c186 = { type: "any", description: "any character" },
        peg$c187 = /^[a-zA-Z]/,
        peg$c188 = { type: "class", value: "[a-zA-Z]", description: "[a-zA-Z]" },
        peg$c189 = function(chars) { return chars.join(""); },
        peg$c190 = /^[ \n\r\t]/,
        peg$c191 = { type: "class", value: "[ \\n\\r\\t]", description: "[ \\n\\r\\t]" },

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
    }

    function error(message) {
      throw peg$buildException(message, null, peg$reportedPos);
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
    }

    function peg$parseStart() {
      var s0;

      s0 = peg$parseTemplate();

      return s0;
    }

    function peg$parseTemplate() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseChildNodes();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c0(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseDocType() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 9) === peg$c2) {
        s1 = peg$c2;
        peg$currPos += 9;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c3); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = [];
          if (peg$c5.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c6); }
          }
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              if (peg$c5.test(input.charAt(peg$currPos))) {
                s4 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c6); }
              }
            }
          } else {
            s3 = peg$c1;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 62) {
                s5 = peg$c7;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c8); }
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c9(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseChildNodes() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseElementNode();
      if (s2 === peg$FAILED) {
        s2 = peg$parseTextNode();
        if (s2 === peg$FAILED) {
          s2 = peg$parseBlockBinding();
          if (s2 === peg$FAILED) {
            s2 = peg$parseCommentNode();
          }
        }
      }
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parseElementNode();
        if (s2 === peg$FAILED) {
          s2 = peg$parseTextNode();
          if (s2 === peg$FAILED) {
            s2 = peg$parseBlockBinding();
            if (s2 === peg$FAILED) {
              s2 = peg$parseCommentNode();
            }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c10(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseCommentNode() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 4) === peg$c11) {
          s2 = peg$c11;
          peg$currPos += 4;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c12); }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$currPos;
          s5 = peg$currPos;
          peg$silentFails++;
          if (input.substr(peg$currPos, 3) === peg$c14) {
            s6 = peg$c14;
            peg$currPos += 3;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c15); }
          }
          peg$silentFails--;
          if (s6 === peg$FAILED) {
            s5 = peg$c13;
          } else {
            peg$currPos = s5;
            s5 = peg$c1;
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parseSourceCharacter();
            if (s6 !== peg$FAILED) {
              peg$reportedPos = s4;
              s5 = peg$c16(s6);
              s4 = s5;
            } else {
              peg$currPos = s4;
              s4 = peg$c1;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c1;
          }
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$currPos;
              s5 = peg$currPos;
              peg$silentFails++;
              if (input.substr(peg$currPos, 3) === peg$c14) {
                s6 = peg$c14;
                peg$currPos += 3;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c15); }
              }
              peg$silentFails--;
              if (s6 === peg$FAILED) {
                s5 = peg$c13;
              } else {
                peg$currPos = s5;
                s5 = peg$c1;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parseSourceCharacter();
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s4;
                  s5 = peg$c16(s6);
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$c1;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c1;
              }
            }
          } else {
            s3 = peg$c1;
          }
          if (s3 !== peg$FAILED) {
            if (input.substr(peg$currPos, 3) === peg$c14) {
              s4 = peg$c14;
              peg$currPos += 3;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c15); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c17(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseDocType();
      }

      return s0;
    }

    function peg$parseElementNode() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseStartTag();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseChildNodes();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseEndTag();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c18(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseStartEndTag();
      }

      return s0;
    }

    function peg$parseTextNode() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseTextCharacter();
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseTextCharacter();
        }
      } else {
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c19(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseTextCharacter() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 60) {
        s2 = peg$c20;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c21); }
      }
      if (s2 === peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c22) {
          s2 = peg$c22;
          peg$currPos += 2;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c23); }
        }
      }
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = peg$c13;
      } else {
        peg$currPos = s1;
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseSourceCharacter();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c24();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseStartTag() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 60) {
          s2 = peg$c20;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c21); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseTagInfo();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 62) {
              s4 = peg$c7;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c8); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c25(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseStartEndTag() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 60) {
          s2 = peg$c20;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c21); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseTagInfo();
          if (s3 !== peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c26) {
              s4 = peg$c26;
              peg$currPos += 2;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c27); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c28(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseTagInfo() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parseTagName();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseAttribute();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseAttribute();
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c29(s1, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseEndTag() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c30) {
        s1 = peg$c30;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c31); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseTagName();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 62) {
            s3 = peg$c7;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c8); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c32(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseTagName() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c33.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c34); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c33.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c34); }
            }
          }
        } else {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c35(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseAttribute() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseTagName();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 61) {
            s3 = peg$c36;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c37); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseAttributeValues();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c38(s1, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseTagName();
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c39(s1);
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parseAttributeValues() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 34) {
        s1 = peg$c40;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c41); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseAttrTextBinding();
        if (s3 === peg$FAILED) {
          s3 = peg$currPos;
          s4 = [];
          s5 = peg$currPos;
          s6 = peg$currPos;
          peg$silentFails++;
          if (input.substr(peg$currPos, 2) === peg$c22) {
            s7 = peg$c22;
            peg$currPos += 2;
          } else {
            s7 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c23); }
          }
          peg$silentFails--;
          if (s7 === peg$FAILED) {
            s6 = peg$c13;
          } else {
            peg$currPos = s6;
            s6 = peg$c1;
          }
          if (s6 !== peg$FAILED) {
            if (peg$c42.test(input.charAt(peg$currPos))) {
              s7 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s7 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c43); }
            }
            if (s7 !== peg$FAILED) {
              s6 = [s6, s7];
              s5 = s6;
            } else {
              peg$currPos = s5;
              s5 = peg$c1;
            }
          } else {
            peg$currPos = s5;
            s5 = peg$c1;
          }
          if (s5 !== peg$FAILED) {
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$currPos;
              s6 = peg$currPos;
              peg$silentFails++;
              if (input.substr(peg$currPos, 2) === peg$c22) {
                s7 = peg$c22;
                peg$currPos += 2;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c23); }
              }
              peg$silentFails--;
              if (s7 === peg$FAILED) {
                s6 = peg$c13;
              } else {
                peg$currPos = s6;
                s6 = peg$c1;
              }
              if (s6 !== peg$FAILED) {
                if (peg$c42.test(input.charAt(peg$currPos))) {
                  s7 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c43); }
                }
                if (s7 !== peg$FAILED) {
                  s6 = [s6, s7];
                  s5 = s6;
                } else {
                  peg$currPos = s5;
                  s5 = peg$c1;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$c1;
              }
            }
          } else {
            s4 = peg$c1;
          }
          if (s4 !== peg$FAILED) {
            peg$reportedPos = s3;
            s4 = peg$c44();
          }
          s3 = s4;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseAttrTextBinding();
          if (s3 === peg$FAILED) {
            s3 = peg$currPos;
            s4 = [];
            s5 = peg$currPos;
            s6 = peg$currPos;
            peg$silentFails++;
            if (input.substr(peg$currPos, 2) === peg$c22) {
              s7 = peg$c22;
              peg$currPos += 2;
            } else {
              s7 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c23); }
            }
            peg$silentFails--;
            if (s7 === peg$FAILED) {
              s6 = peg$c13;
            } else {
              peg$currPos = s6;
              s6 = peg$c1;
            }
            if (s6 !== peg$FAILED) {
              if (peg$c42.test(input.charAt(peg$currPos))) {
                s7 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c43); }
              }
              if (s7 !== peg$FAILED) {
                s6 = [s6, s7];
                s5 = s6;
              } else {
                peg$currPos = s5;
                s5 = peg$c1;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$c1;
            }
            if (s5 !== peg$FAILED) {
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$currPos;
                s6 = peg$currPos;
                peg$silentFails++;
                if (input.substr(peg$currPos, 2) === peg$c22) {
                  s7 = peg$c22;
                  peg$currPos += 2;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c23); }
                }
                peg$silentFails--;
                if (s7 === peg$FAILED) {
                  s6 = peg$c13;
                } else {
                  peg$currPos = s6;
                  s6 = peg$c1;
                }
                if (s6 !== peg$FAILED) {
                  if (peg$c42.test(input.charAt(peg$currPos))) {
                    s7 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c43); }
                  }
                  if (s7 !== peg$FAILED) {
                    s6 = [s6, s7];
                    s5 = s6;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$c1;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$c1;
                }
              }
            } else {
              s4 = peg$c1;
            }
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s3;
              s4 = peg$c44();
            }
            s3 = s4;
          }
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 34) {
            s3 = peg$c40;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c41); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c45(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 39) {
          s1 = peg$c46;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c47); }
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseAttrTextBinding();
          if (s3 === peg$FAILED) {
            s3 = peg$currPos;
            s4 = [];
            s5 = peg$currPos;
            s6 = peg$currPos;
            peg$silentFails++;
            if (input.substr(peg$currPos, 2) === peg$c22) {
              s7 = peg$c22;
              peg$currPos += 2;
            } else {
              s7 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c23); }
            }
            peg$silentFails--;
            if (s7 === peg$FAILED) {
              s6 = peg$c13;
            } else {
              peg$currPos = s6;
              s6 = peg$c1;
            }
            if (s6 !== peg$FAILED) {
              if (peg$c48.test(input.charAt(peg$currPos))) {
                s7 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c49); }
              }
              if (s7 !== peg$FAILED) {
                s6 = [s6, s7];
                s5 = s6;
              } else {
                peg$currPos = s5;
                s5 = peg$c1;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$c1;
            }
            if (s5 !== peg$FAILED) {
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$currPos;
                s6 = peg$currPos;
                peg$silentFails++;
                if (input.substr(peg$currPos, 2) === peg$c22) {
                  s7 = peg$c22;
                  peg$currPos += 2;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c23); }
                }
                peg$silentFails--;
                if (s7 === peg$FAILED) {
                  s6 = peg$c13;
                } else {
                  peg$currPos = s6;
                  s6 = peg$c1;
                }
                if (s6 !== peg$FAILED) {
                  if (peg$c48.test(input.charAt(peg$currPos))) {
                    s7 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c49); }
                  }
                  if (s7 !== peg$FAILED) {
                    s6 = [s6, s7];
                    s5 = s6;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$c1;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$c1;
                }
              }
            } else {
              s4 = peg$c1;
            }
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s3;
              s4 = peg$c44();
            }
            s3 = s4;
          }
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseAttrTextBinding();
            if (s3 === peg$FAILED) {
              s3 = peg$currPos;
              s4 = [];
              s5 = peg$currPos;
              s6 = peg$currPos;
              peg$silentFails++;
              if (input.substr(peg$currPos, 2) === peg$c22) {
                s7 = peg$c22;
                peg$currPos += 2;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c23); }
              }
              peg$silentFails--;
              if (s7 === peg$FAILED) {
                s6 = peg$c13;
              } else {
                peg$currPos = s6;
                s6 = peg$c1;
              }
              if (s6 !== peg$FAILED) {
                if (peg$c48.test(input.charAt(peg$currPos))) {
                  s7 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c49); }
                }
                if (s7 !== peg$FAILED) {
                  s6 = [s6, s7];
                  s5 = s6;
                } else {
                  peg$currPos = s5;
                  s5 = peg$c1;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$c1;
              }
              if (s5 !== peg$FAILED) {
                while (s5 !== peg$FAILED) {
                  s4.push(s5);
                  s5 = peg$currPos;
                  s6 = peg$currPos;
                  peg$silentFails++;
                  if (input.substr(peg$currPos, 2) === peg$c22) {
                    s7 = peg$c22;
                    peg$currPos += 2;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c23); }
                  }
                  peg$silentFails--;
                  if (s7 === peg$FAILED) {
                    s6 = peg$c13;
                  } else {
                    peg$currPos = s6;
                    s6 = peg$c1;
                  }
                  if (s6 !== peg$FAILED) {
                    if (peg$c48.test(input.charAt(peg$currPos))) {
                      s7 = input.charAt(peg$currPos);
                      peg$currPos++;
                    } else {
                      s7 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c49); }
                    }
                    if (s7 !== peg$FAILED) {
                      s6 = [s6, s7];
                      s5 = s6;
                    } else {
                      peg$currPos = s5;
                      s5 = peg$c1;
                    }
                  } else {
                    peg$currPos = s5;
                    s5 = peg$c1;
                  }
                }
              } else {
                s4 = peg$c1;
              }
              if (s4 !== peg$FAILED) {
                peg$reportedPos = s3;
                s4 = peg$c44();
              }
              s3 = s4;
            }
          }
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 39) {
              s3 = peg$c46;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c47); }
            }
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c45(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseAttrTextBinding();
          if (s1 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c50(s1);
          }
          s0 = s1;
        }
      }

      return s0;
    }

    function peg$parseBlockBinding() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c51) {
        s1 = peg$c51;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c52); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseStartBlockBinding();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c53(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseTextBinding();
      }

      return s0;
    }

    function peg$parseStartBlockBinding() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseSingleScript();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseTemplate();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseChildBlockBinding();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c54(s1, s3, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseChildBlockBinding() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c55) {
        s1 = peg$c55;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c56); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseStartBlockBinding();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c57(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c58) {
          s1 = peg$c58;
          peg$currPos += 5;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c59); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c60();
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      }

      return s0;
    }

    function peg$parseTextBinding() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c22) {
        s1 = peg$c22;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c23); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseScripts();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c61) {
                s5 = peg$c61;
                peg$currPos += 2;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c62); }
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c63(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseAttrTextBinding() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c22) {
        s1 = peg$c22;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c23); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseScripts();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c61) {
                s5 = peg$c61;
                peg$currPos += 2;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c62); }
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c64(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseSingleScript() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseReferenceName();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c61) {
              s4 = peg$c61;
              peg$currPos += 2;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c62); }
            }
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c65(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseScripts();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c61) {
              s3 = peg$c61;
              peg$currPos += 2;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c62); }
            }
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c64(s1);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      }

      return s0;
    }

    function peg$parseScripts() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parseHashValues();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c66(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parse_();
        if (s1 !== peg$FAILED) {
          s2 = peg$parseTernaryConditional();
          if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            if (s3 !== peg$FAILED) {
              s4 = [];
              s5 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 44) {
                s6 = peg$c67;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c68); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parseHashValuesArray();
                if (s7 !== peg$FAILED) {
                  s6 = [s6, s7];
                  s5 = s6;
                } else {
                  peg$currPos = s5;
                  s5 = peg$c1;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$c1;
              }
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 44) {
                  s6 = peg$c67;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c68); }
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseHashValuesArray();
                  if (s7 !== peg$FAILED) {
                    s6 = [s6, s7];
                    s5 = s6;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$c1;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$c1;
                }
              }
              if (s4 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c69(s2, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      }

      return s0;
    }

    function peg$parseTernaryConditional() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseAssignment();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 63) {
          s2 = peg$c70;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c71); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseTernaryConditional();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 58) {
              s4 = peg$c72;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c73); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseTernaryConditional();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c74(s1, s3, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseAssignment();
      }

      return s0;
    }

    function peg$parseParameters() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c75;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c76); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseInnerParameters();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 41) {
            s3 = peg$c77;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c78); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c79(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c80) {
          s1 = peg$c80;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c81); }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c82();
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parseInnerParameters() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseTernaryConditional();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 44) {
          s4 = peg$c67;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c68); }
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseTernaryConditional();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c1;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c1;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 44) {
            s4 = peg$c67;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c68); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseTernaryConditional();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c1;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c1;
          }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c83(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseAssignment() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseObjectReference();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 61) {
          s2 = peg$c36;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c37); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseAssignment();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c84(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseOperation();
      }

      return s0;
    }

    function peg$parseOperation() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseOperatable();
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c85) {
          s2 = peg$c85;
          peg$currPos += 2;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c86); }
        }
        if (s2 === peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c87) {
            s2 = peg$c87;
            peg$currPos += 2;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c88); }
          }
          if (s2 === peg$FAILED) {
            if (input.substr(peg$currPos, 3) === peg$c89) {
              s2 = peg$c89;
              peg$currPos += 3;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c90); }
            }
            if (s2 === peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c91) {
                s2 = peg$c91;
                peg$currPos += 2;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c92); }
              }
              if (s2 === peg$FAILED) {
                if (input.substr(peg$currPos, 3) === peg$c93) {
                  s2 = peg$c93;
                  peg$currPos += 3;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c94); }
                }
                if (s2 === peg$FAILED) {
                  if (input.substr(peg$currPos, 2) === peg$c95) {
                    s2 = peg$c95;
                    peg$currPos += 2;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c96); }
                  }
                  if (s2 === peg$FAILED) {
                    if (input.substr(peg$currPos, 3) === peg$c97) {
                      s2 = peg$c97;
                      peg$currPos += 3;
                    } else {
                      s2 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c98); }
                    }
                    if (s2 === peg$FAILED) {
                      if (input.substr(peg$currPos, 2) === peg$c99) {
                        s2 = peg$c99;
                        peg$currPos += 2;
                      } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c100); }
                      }
                      if (s2 === peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 62) {
                          s2 = peg$c7;
                          peg$currPos++;
                        } else {
                          s2 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c8); }
                        }
                        if (s2 === peg$FAILED) {
                          if (input.substr(peg$currPos, 3) === peg$c101) {
                            s2 = peg$c101;
                            peg$currPos += 3;
                          } else {
                            s2 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c102); }
                          }
                          if (s2 === peg$FAILED) {
                            if (input.substr(peg$currPos, 2) === peg$c103) {
                              s2 = peg$c103;
                              peg$currPos += 2;
                            } else {
                              s2 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c104); }
                            }
                            if (s2 === peg$FAILED) {
                              if (input.charCodeAt(peg$currPos) === 60) {
                                s2 = peg$c20;
                                peg$currPos++;
                              } else {
                                s2 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$c21); }
                              }
                              if (s2 === peg$FAILED) {
                                if (input.charCodeAt(peg$currPos) === 43) {
                                  s2 = peg$c105;
                                  peg$currPos++;
                                } else {
                                  s2 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$c106); }
                                }
                                if (s2 === peg$FAILED) {
                                  if (input.charCodeAt(peg$currPos) === 45) {
                                    s2 = peg$c107;
                                    peg$currPos++;
                                  } else {
                                    s2 = peg$FAILED;
                                    if (peg$silentFails === 0) { peg$fail(peg$c108); }
                                  }
                                  if (s2 === peg$FAILED) {
                                    if (input.charCodeAt(peg$currPos) === 37) {
                                      s2 = peg$c109;
                                      peg$currPos++;
                                    } else {
                                      s2 = peg$FAILED;
                                      if (peg$silentFails === 0) { peg$fail(peg$c110); }
                                    }
                                    if (s2 === peg$FAILED) {
                                      if (input.charCodeAt(peg$currPos) === 42) {
                                        s2 = peg$c111;
                                        peg$currPos++;
                                      } else {
                                        s2 = peg$FAILED;
                                        if (peg$silentFails === 0) { peg$fail(peg$c112); }
                                      }
                                      if (s2 === peg$FAILED) {
                                        if (input.charCodeAt(peg$currPos) === 47) {
                                          s2 = peg$c113;
                                          peg$currPos++;
                                        } else {
                                          s2 = peg$FAILED;
                                          if (peg$silentFails === 0) { peg$fail(peg$c114); }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseOperation();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c115(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseOperatable();
      }

      return s0;
    }

    function peg$parseOperatable() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseModifiers();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c116(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseModifiers() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseNot();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseModifier();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseModifier();
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c117(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseFunctionCall();
        if (s0 === peg$FAILED) {
          s0 = peg$parseObjectReference();
        }
      }

      return s0;
    }

    function peg$parseModifier() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 124) {
        s1 = peg$c118;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c119); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseReferenceName();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseParameters();
            if (s4 === peg$FAILED) {
              s4 = peg$c120;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c121(s3, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseObjectReference() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseObject();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c122(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseNot() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 33) {
        s1 = peg$c123;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c124); }
      }
      if (s1 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 45) {
          s1 = peg$c107;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c108); }
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseNot();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c125(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseReserved();
        if (s0 === peg$FAILED) {
          s0 = peg$parseFunctionCall();
          if (s0 === peg$FAILED) {
            s0 = peg$parseObjectReference();
          }
        }
      }

      return s0;
    }

    function peg$parseObject() {
      var s0;

      s0 = peg$parseGroup();
      if (s0 === peg$FAILED) {
        s0 = peg$parseHash();
        if (s0 === peg$FAILED) {
          s0 = peg$parseNumber();
          if (s0 === peg$FAILED) {
            s0 = peg$parseStringLiteral();
            if (s0 === peg$FAILED) {
              s0 = peg$parseReference();
            }
          }
        }
      }

      return s0;
    }

    function peg$parseNumber() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 45) {
        s2 = peg$c107;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c108); }
      }
      if (s2 === peg$FAILED) {
        s2 = peg$c120;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$currPos;
        s4 = [];
        if (peg$c126.test(input.charAt(peg$currPos))) {
          s5 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c127); }
        }
        if (s5 !== peg$FAILED) {
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            if (peg$c126.test(input.charAt(peg$currPos))) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c127); }
            }
          }
        } else {
          s4 = peg$c1;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseDecimalNumber();
          if (s5 === peg$FAILED) {
            s5 = peg$c120;
          }
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c1;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c1;
        }
        if (s3 === peg$FAILED) {
          s3 = peg$parseDecimalNumber();
        }
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$c1;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c128(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseDecimalNumber() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s1 = peg$c129;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c130); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c126.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c127); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c126.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c127); }
            }
          }
        } else {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseGroup() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c75;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c76); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseTernaryConditional();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 41) {
            s3 = peg$c77;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c78); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c131(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseReserved() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseBoolean();
      if (s1 === peg$FAILED) {
        s1 = peg$parseUndefined();
        if (s1 === peg$FAILED) {
          s1 = peg$parseNull();
          if (s1 === peg$FAILED) {
            s1 = peg$parseNaN();
            if (s1 === peg$FAILED) {
              s1 = peg$parseInfinity();
            }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c132(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseBoolean() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c133) {
        s1 = peg$c133;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c134); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 5) === peg$c135) {
          s1 = peg$c135;
          peg$currPos += 5;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c136); }
        }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c137(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseUndefined() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 9) === peg$c138) {
        s1 = peg$c138;
        peg$currPos += 9;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c139); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c140();
      }
      s0 = s1;

      return s0;
    }

    function peg$parseNaN() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c141) {
        s1 = peg$c141;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c142); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c143();
      }
      s0 = s1;

      return s0;
    }

    function peg$parseInfinity() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 8) === peg$c144) {
        s1 = peg$c144;
        peg$currPos += 8;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c145); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c146();
      }
      s0 = s1;

      return s0;
    }

    function peg$parseNull() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c147) {
        s1 = peg$c147;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c148); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 4) === peg$c149) {
          s1 = peg$c149;
          peg$currPos += 4;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c150); }
        }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c151();
      }
      s0 = s1;

      return s0;
    }

    function peg$parseFunctionCall() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseObjectReference();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseParameters();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c152(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseReference() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 94) {
        s1 = peg$c153;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c154); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c155) {
          s1 = peg$c155;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c156); }
        }
        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 3) === peg$c157) {
            s1 = peg$c157;
            peg$currPos += 3;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c158); }
          }
          if (s1 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 126) {
              s1 = peg$c159;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c160); }
            }
            if (s1 === peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c161) {
                s1 = peg$c161;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c162); }
              }
            }
          }
        }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$c120;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseReferenceName();
          if (s3 !== peg$FAILED) {
            s4 = [];
            s5 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 46) {
              s6 = peg$c129;
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c130); }
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$parseReferenceName();
              if (s7 !== peg$FAILED) {
                s6 = [s6, s7];
                s5 = s6;
              } else {
                peg$currPos = s5;
                s5 = peg$c1;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$c1;
            }
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 46) {
                s6 = peg$c129;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c130); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parseReferenceName();
                if (s7 !== peg$FAILED) {
                  s6 = [s6, s7];
                  s5 = s6;
                } else {
                  peg$currPos = s5;
                  s5 = peg$c1;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$c1;
              }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c163(s1, s3, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseReferenceName() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c164.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c165); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c164.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c165); }
          }
        }
      } else {
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c166(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseHash() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s1 = peg$c167;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c168); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseHashValues();
          if (s3 === peg$FAILED) {
            s3 = peg$c120;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 125) {
                s5 = peg$c169;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c170); }
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c171(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseHashValues() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseHashValuesArray();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c172(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseHashValuesArray() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseHashValue();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 44) {
          s4 = peg$c67;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c68); }
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseHashValuesArray();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c1;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c1;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 44) {
            s4 = peg$c67;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c68); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseHashValuesArray();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c1;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c1;
          }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c173(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseHashValue() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseHashKey();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 58) {
              s4 = peg$c72;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c73); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseTernaryConditional();
              if (s5 === peg$FAILED) {
                s5 = peg$c120;
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c174(s2, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseHashKey() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseStringLiteral();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c175(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseReferenceName();
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c176(s1);
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parseStringLiteral() {
      var s0, s1, s2, s3;

      peg$silentFails++;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 34) {
        s1 = peg$c40;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c41); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseDoubleStringCharacter();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseDoubleStringCharacter();
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 34) {
            s3 = peg$c40;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c41); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c178(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 39) {
          s1 = peg$c46;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c47); }
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseSingleStringCharacter();
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseSingleStringCharacter();
          }
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 39) {
              s3 = peg$c46;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c47); }
            }
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c178(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c177); }
      }

      return s0;
    }

    function peg$parseDoubleStringCharacter() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 34) {
        s2 = peg$c40;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c41); }
      }
      if (s2 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 92) {
          s2 = peg$c179;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c180); }
        }
      }
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = peg$c13;
      } else {
        peg$currPos = s1;
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseSourceCharacter();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c181();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c182) {
          s0 = peg$c182;
          peg$currPos += 2;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c183); }
        }
      }

      return s0;
    }

    function peg$parseSingleStringCharacter() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 39) {
        s2 = peg$c46;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c47); }
      }
      if (s2 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 92) {
          s2 = peg$c179;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c180); }
        }
      }
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = peg$c13;
      } else {
        peg$currPos = s1;
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseSourceCharacter();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c181();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c184) {
          s0 = peg$c184;
          peg$currPos += 2;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c185); }
        }
      }

      return s0;
    }

    function peg$parseSourceCharacter() {
      var s0;

      if (input.length > peg$currPos) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c186); }
      }

      return s0;
    }

    function peg$parseWord() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c187.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c188); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c187.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c188); }
          }
        }
      } else {
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c189(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parse_() {
      var s0, s1;

      s0 = [];
      if (peg$c190.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c191); }
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        if (peg$c190.test(input.charAt(peg$currPos))) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c191); }
        }
      }

      return s0;
    }


      var DoctypeExpression        = require("./ast/doctype"),
      RootNodeExpression           = require("./ast/rootNode"),
      TextNodeExpression           = require("./ast/textNode"),
      CommentNodeExpression        = require("./ast/commentNode"),
      ElementNodeExpression        = require("./ast/elementNode"),
      BlockBindingExpression       = require("./ast/blockBinding"),
      DocTypeExpression            = require("./ast/doctype"),
      TernaryConditionExpression   = require("./ast/ternaryCondition"),
      AssignmentExpression         = require("./ast/assignment"),
      OperatorExpression           = require("./ast/operator"),
      NotExpression                = require("./ast/not"),
      LiteralExpression            = require("./ast/literal"),
      StringExpression             = require("./ast/string"),
      ReferenceExpression          = require("./ast/reference"),
      HashExpression               = require("./ast/hash"),
      ScriptExpression             = require("./ast/script"),
      CallExpression               = require("./ast/call"),
      ModifierExpression           = require("./ast/modifier"),
      ArrayExpression              = require("./ast/array"),
      ParametersExpression         = require("./ast/parameters"),
      GroupExpression              = require("./ast/group");

      function trimWhitespace (ws) {
        return trimNewLineChars(ws).replace(/(^\s+)|(\s+$)/, "");
      }

      function trimEnds (ws) {
        return ws.replace(/(^\s+)|(\s+$)/, "").replace(/[\r\n]/g,"\\n");
      }

      function trimNewLineChars (ws) {
        return ws.replace(/[ \r\n\t]+/g, " ");
      }

      function trimmedText () {
        return trimWhitespace(text());
      }

      function singleOrArrayExpression (values) {
        return values.length === 1 ? values[0] : new ArrayExpression(new ParametersExpression(values));
      }

      function attrValues (values) {

        values = values.filter(function (v) {
          return!/^[\n\t\r]+$/.test(v.value);
        });

        var v = values.length === 1 && values[0].type === "string" ? values[0] : new ArrayExpression(new ParametersExpression(values));
        return v;
      }

      function trimTextExpressions (expressions) {

        function _trim (exprs) {
          var expr, i;
          for (i = exprs.length; i--;) {
            expr = exprs[i];
            if (expr.type == "textNode" && !/\S/.test(expr.value) && !expr.decoded) {
              exprs.splice(i, 1);
            } else {
              break;
            }
          }
          return exprs;
        }

        return _trim(_trim(expressions.reverse()).reverse());
      }


    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
})();

},{"./ast/array":258,"./ast/assignment":259,"./ast/blockBinding":261,"./ast/call":262,"./ast/commentNode":263,"./ast/doctype":264,"./ast/elementNode":265,"./ast/group":266,"./ast/hash":267,"./ast/literal":268,"./ast/modifier":269,"./ast/not":270,"./ast/operator":271,"./ast/parameters":272,"./ast/reference":273,"./ast/rootNode":274,"./ast/script":275,"./ast/string":276,"./ast/ternaryCondition":277,"./ast/textNode":278}],281:[function(require,module,exports){
var parser = require("./parser"),
fs         = require("fs");

require.extensions[".pc"] = function (module, filename) {

  var paper, watching, compiled;

  function compileOnce () {
    if (compiled) return;
    compiled = true;
    compile();
  }

  function compile () {
    paper = parser.compile(fs.readFileSync(filename, "utf8"));
  }

  function watch () {
    if (watching) return;
    watching = true;
    fs.watchFile(filename, { persistent: true, interval: 500 }, compile)
  }

  module.exports = function () {
    compileOnce();
    watch();
    return paper.apply(this, arguments);
  }
};
},{"./parser":279,"fs":63}],282:[function(require,module,exports){
var BindableReference = require("./ref");

/**
 */


function createRunner (context) {
  return {
    context: context,
    get: function (path) {
      return this.context.get(path);
    },
    set: function (path, value) {
      return this.context.set(path, value);
    },
    bindTo: function (path, settable) {
      return new BindableReference(this, path, settable);
    },
    call: function (ctx, key, params) {

      var fn;

      if (!ctx) return;

      if (ctx.__isBindable) {
        fn = ctx.get(key);
        ctx = ctx;
      } else {
        fn = ctx[key];
      }

      if (fn) return fn.apply(ctx, params);
    }
  }
}


function boundScript (script) {

  var run = script.run, refs = script.refs;

  return {
    refs: refs,
    evaluate: function (context) {
      return run.call(createRunner(context));
    },
    bind: function (context, listener) {

      var runner = createRunner(context),
      currentValue,
      locked = false;

      function now () {
        if (locked) return;
        locked = true;
        var oldValue = currentValue;
        listener(currentValue = run.call(runner), oldValue);
        locked = false;
      }


      var dispose;

      if (!refs.length) return {
        dispose: function () {},
        now: now
      };

      if (refs.length === 1) {
        var dispose = context.bind(refs[0], now).dispose;
      } else {

        var bindings = [];


        for (var i = refs.length; i--;) {
          bindings.push(context.bind(refs[i], now));
        }

        dispose = function () {
          for (var i = bindings.length; i--;) bindings[i].dispose();
        }
      }

      return {
        dispose: dispose,
        now: function () {
          now();
          return this;
        }
      }
    }
  };
};


/**
 * scripts combined with strings. defined within attributes usually
 */

function bufferedScript (values) {

  var scripts = values.filter(function (value) {
    return typeof value !== "string";
  }).map(function (scripts) {
    return scripts.value;
  });

  function evaluate (runner) {
    return values.map(function (script) {

      if (typeof script === "string") {
        return script;
      }

      return script.value.run.call(runner);

    }).join("");
  }

  return {
    evaluate: function (context) { 
      return evaluate(createRunner(context)); 
    },
    bind: function (context, listener) {

      var runner = createRunner(context), bindings = [];

      function now () {
        listener(evaluate(runner));
      }

      for (var i = scripts.length; i--;) {

        var script = scripts[i];
        if (!script.refs) continue;

        for (var j = script.refs.length; j--;) {
          var ref = script.refs[j];

          bindings.push(context.bind(ref, now));
        }
      }

      return {
        now: now,
        dispose: function ()  {
          for (var i = bindings.length; i--;) bindings[i].dispose();
        }
      }
    }
  }
}

function staticScript (value) {
  return {
    bind: function (context, listener) {
      return {
        now: function () {
          listener(value);
        },
        dispose: function () {

        }
      }
    }
  }
}


function boundScripts (scripts) {
  var boundScripts = {};
  for (var name in scripts) {
    boundScripts[name] = boundScript(scripts[name]);
  }
  return boundScripts;
}


module.exports = function (value) {
  if (typeof value !== "object") return { value: staticScript(value) };
  if (value.length) {
    if (value.length === 1) return boundScripts(value[0]);
    return { value: bufferedScript(value) };
  } else {
    return boundScripts(value);
  }
}
},{"./ref":283}],283:[function(require,module,exports){
var protoclass = require("protoclass");


function BindableReference (script, path, settable) {
  this.script   = script;
  this.path     = path;
  this.settable = settable;
}

protoclass(BindableReference, {
  __isBindableReference: true,
  value: function (value) {
    if (!arguments.length) return this.script.get(this.path);
    if (this.settable) this.script.set(this.path, value);
  },
  toString: function () {
    return this.script.get(this.path);
  }
});


module.exports = BindableReference;

},{"protoclass":337}],284:[function(require,module,exports){
var protoclass = require("protoclass"),
parser         = require("./parser"),
View           = require("./view"),
ViewRecycler   = require("./viewRecycler"),
Clips          = require("./clips"),

fragmentWriter = require("./writers/fragment"),
blockWriter    = require("./writers/block"),
textWriter     = require("./writers/text"),
commentWriter  = require("./writers/comment");
elementWriter  = require("./writers/element");

function Template (paper, application, cacheNode) {
  this.paper       = paper;
  this.application = application;
  this.paperclip   = application.paperclip;
  this.cacheNode   = !!cacheNode;
  this.clips       = new Clips();

  this._viewPool = [];
}

protoclass(Template, {

  /**
   */

  _getView: function (section) {
    
    var pv = this._viewPool.shift();

    if (pv) {
      if (section) pv.replaceSection(section);
      return pv;
    }

    return new View(this, this._getNode(), section);
  },

  /**
   */

  _addView: function (view) {
    this._viewPool.push(view);
  },

  /**
   OLD
   */

  bind2: function (context) {
    // return new ViewRecycler(this).bind(context);
    return new View(this, this._getNode()).bind(context);
  },

  /**
   * DEPRECATED
   */

  bind: function (context) {
    return new ViewRecycler(this).bind(context);
  },

  /**
   */

  view: function (context, section) {
    var v = new ViewRecycler(this);
    if (context) v.bind(context, section);
    return v;
  },

  /**
   */

  _getNode: function () {

    // IE doesn't support this, so cloneNode must be optional here
    if (this._cachedNode) return this._cachedNode.cloneNode(true);

    this.clips = new Clips(this);

    var node = this.paper(
      fragmentWriter(this),
      blockWriter(this),
      elementWriter(this),
      textWriter(this),
      commentWriter(this),
      parser,
      this.paperclip.modifiers
    );

    this.clips.initialize();

    return this.cacheNode ? (this._cachedNode = node) && this._getNode() : node;
  },

  /**
   */

  create: function (source) {
    return create(source, this.application);
  }
});

function create (source, application) {

  var paper;

  if (typeof source === "string") {
    paper = parser.compile(source);
  } else {
    paper = source;
  }

  if (paper.template) return paper.template;

  return paper.template = new Template(paper, application, true);
}

module.exports = create;
},{"./clips":255,"./parser":279,"./view":290,"./viewRecycler":291,"./writers/block":294,"./writers/comment":295,"./writers/element":297,"./writers/fragment":298,"./writers/text":299,"protoclass":337}],285:[function(require,module,exports){
module.exports = function (callback, context) {
  return function () {
    return callback.apply(context, arguments);
  }
}

},{}],286:[function(require,module,exports){
module.exports = function (to) {
  if (!to) to = {};
  var froms = Array.prototype.slice.call(arguments, 1);
  for (var i = 0, n = froms.length; i < n; i++) {
    var from = froms[i];
    for (var key in from) {
      to[key] = from[key];
    }
  }
  return to;
}
},{}],287:[function(require,module,exports){
module.exports = {
  getNodePath: function (node) {
    var path = [], p = node.parentNode, c = node;
    while (p) {

      // need to slice since some browsers don't support indexOf for child nodes
      path.unshift(Array.prototype.slice.call(p.childNodes).indexOf(c));
      c = p;
      p = p.parentNode;
    }

    return path;
  },
  getNodeByPath: function (node, path) {
    var c = node;
    for (var i = 0, n = path.length; i < n; i++) {
      c = c.childNodes[path[i]];
    }
    return c;
  }
}
},{}],288:[function(require,module,exports){
module.exports = function (to, from) {
  from.on("change", function (key, value) {
    to[key] = value;
  });
  return from;
}
},{}],289:[function(require,module,exports){
module.exports = function (ary) {
  var occurences = {}, clone = ary.concat();

  for (var i = clone.length; i--;) {
    var item = clone[i];
    if (!occurences[item]) occurences[item] = 0;

    if (++occurences[item] > 1) {
      clone.splice(i, 1);
    }
  }

  return clone;
}
},{}],290:[function(require,module,exports){
var protoclass            = require("protoclass"),
Bindings                  = require("./bindings"),
createSection             = require("document-section"),
BindableObject            = require("bindable-object"),
syncBindableObjectChanges = require("./utils/syncBindableObjectChanges");

function View (template, node, section) {

  // the template that created the viw
  this.template = template;

  // the node we're binding to
  this.node     = node;

  // the clips that are specific to the node - generated ONCE
  // from the template
  this.clips    = this.template.clips;

  // console.log("create");

  // the bindings specific to this view. Clips should add bindings here
  // when hydrate is called
  this.bindings = new Bindings(this);


  // hydrates the view with bindings
  this.clips.prepare(this);


  this.section = section || createSection(template.application.nodeFactory);
  this.section.appendChild(node);
}

protoclass(View, {

  /**
   */

  replaceSection: function (section) {
    var oldSection = this.section;
    this.section = section;
    this.section.appendChild(this.template.application.nodeFactory.createFragment(oldSection.getInnerChildNodes()));
  },


  /**
   */

  bind: function (context) {

    if (!context) context = {};

    // TODO - sync changes back to context
    if (!context.__isBindable) {
      context = syncBindableObjectChanges(context, new BindableObject(context));
    }

    this.context = context;
    this.bindings.bind(context);
    return this;
  },

  /**
   */

  unbind: function () {
    this.bindings.unbind();
  },

  /**
   */

  dispose: function () {
    this.remove();
    this.bindings.unbind();
  },

  /**
   */

  render: function () {
    var frag = this.section.render();
    // this.transitions.enter();
    // this.section.remove();
    return frag;
  },

  /**
   */

  remove: function () {
    // this.transitions.exit();
    this.section.remove();
    return this;
  },

  /**
   */

  toString: function () {

    // TODO - make updates here now
    return this.render().toString();
  }
});

module.exports = View;
},{"./bindings":254,"./utils/syncBindableObjectChanges":288,"bindable-object":7,"document-section":300,"protoclass":337}],291:[function(require,module,exports){
var protoclass            = require("protoclass"),
Bindings                  = require("./bindings"),
createSection             = require("document-section"),
BindableObject            = require("bindable-object"),
syncBindableObjectChanges = require("./utils/syncBindableObjectChanges");

/**
 * Wraps arou
 */

function ViewRecycler (template) {

  // the template that created the viw
  this.template = template;
}

protoclass(ViewRecycler, {

  /**
   */

  _view: function (section) {
    
    if (this.__view) {
      if (section) this.__view.replaceSection(section);
      return this.__view;
    }

    return this.__view = this.template._getView(section);
  },

  /**
   */

  bind: function (context, section) {
    this.bound = true;
    this._view(section).bind(context);
    this.context = this.__view.context;
    this.clips = this.__view.clips;
    this.node = this.__view.node;
    return this;
  },

  /**
   */

  unbind: function () {
    this._view().unbind();
    this.bound = false;
  },

  /**
   */

  dispose: function () {
    if (this.__view) this.__view.dispose();
    this._recycle();
  },

  /**
   */

  _recycle: function () {
    if (this.__view) {
      this.template._addView(this.__view);
      this.__view = void 0;
    }
  },

  /**
   */

  render: function () {
    if (!this.bound) {
      this.bind();
    }
    return this._view().render();
  },

  /**
   */

  remove: function () {
    if (this.__view) this.__view.remove();
    this._recycle();
    return this;
  },

  /**
   */

  toString: function () {
    return this._view().toString();
  }
});

module.exports = ViewRecycler;
},{"./bindings":254,"./utils/syncBindableObjectChanges":288,"bindable-object":7,"document-section":300,"protoclass":337}],292:[function(require,module,exports){
var protoclass = require("protoclass");

function UnboundValueBinding (script, textNode) {
  this.script      = script;
  this.textNode = textNode;
}

protoclass(UnboundValueBinding, {

  /**
   */

  bind: function (context) {
    this.context = context;
    var value = this.script.evaluate(context);

    if (value == null) value = "";

    if (this.textNode.__isNode) {
      this.textNode.replaceText(value, true);
    } else {
      this.textNode.nodeValue = value;
    }
  },

  /**
   */

  unbind: function () {
  }
});

module.exports = UnboundValueBinding;
},{"protoclass":337}],293:[function(require,module,exports){
var protoclass = require("protoclass"),
Base = require("../../../bindings/block/base");

function BoundValueBinding (view, script, textNode) {
  this.view       = view;
  this.mainScript     = script;
  this.application = view.template.application;
  this.textNode   = textNode;
  this.nodeFactory = view.template.application.nodeFactory;
}

Base.extend(BoundValueBinding, {

  /**
   */

  didChange: function (value) {
    
    if (value == null) value = "";
    if (this.nodeFactory.name === "dom") {
      this.textNode.nodeValue = String(value);
    } else {
      this.textNode.replaceText(value, true);
    }
  }
});

module.exports = BoundValueBinding;
},{"../../../bindings/block/base":248,"protoclass":337}],294:[function(require,module,exports){
var createSection = require("document-section"),
utils = require("../../utils"),
ValueBinding = require("./bindings/value"),
UnboundValueBinding = require("./bindings/unboundValue"),
createScripts = require("../../script");


function writeUnboundValue (template, node, script) {

  template.clips.push({
    node: node,
    script: script,
    initialize: function () {
      this.nodePath = utils.getNodePath(this.node);
    },
    prepare: function (view) {
      var node = utils.getNodeByPath(view.node, this.nodePath);
      view.bindings.push(new UnboundValueBinding(script, node))
    }
  });
}

function writeBoundValue (template, node, script) {

  template.clips.push({
    node: node,
    script: script,
    initialize: function () {
      this.nodePath = utils.getNodePath(this.node);
    },
    prepare: function (view) {
      var node = utils.getNodeByPath(view.node, this.nodePath);
      view.bindings.push(new ValueBinding(view, this.script, node));
    }
  });
}

function writeValue (template, nodeFactory, block) {

  var node = nodeFactory.createTextNode(""),
  script   = createScripts(block).value;

  if (block.value.refs.length === 0) {
    writeUnboundValue(template, node, script);
  } else {
    writeBoundValue(template, node, script);
  }

  return node;
}

function writeDynamic (template, nodeFactory, blockBindingFactory, scripts, contentPaper, childPaper) {

  var section = createSection(nodeFactory),
  scriptName  = Object.keys(scripts)[0],
  contentTemplate = contentPaper ? template.create(contentPaper) : void 0,
  childTemplate = childPaper ? template.create(childPaper) : void 0;

  // TODO - allow multiple scripts?
  var scripts = createScripts(scripts),
  mainScript  = scripts[scriptName];

  template.clips.push({
    section: section,
    scripts: scripts,
    mainScript: mainScript,
    scriptName: scriptName,
    contentTemplate: contentTemplate,
    childTemplate: childTemplate,
    nodeFactory: nodeFactory,
    initialize: function () {
      this.startNodePath     = utils.getNodePath(this.section.start);
      this.endNodePath       = utils.getNodePath(this.section.end);
      this.blockBindingClass = blockBindingFactory.getClass(this.scriptName);

      // TODO - throw error if binding class doesn't exist?
    },
    prepare: function (view) {
      var startNode = utils.getNodeByPath(view.node, this.startNodePath),
      endNode       = utils.getNodeByPath(view.node, this.endNodePath);
      var section   = createSection(this.nodeFactory, startNode, endNode);

      // binding class might not exist. Don't continue
      if (this.blockBindingClass) {
        view.bindings.push(new this.blockBindingClass(view, this.scriptName, this.scripts, section, this.contentTemplate, this.childTemplate));
      }
    }
  });

  return section.render();
}

module.exports = function (template) {

  var nodeFactory      = template.application.nodeFactory,
  blockBindingFactory  = template.paperclip.blockBindingFactory;

  return function (script, contentPaper, childPaper) {

    // only {{ value }} block. MUCH faster.
    if (script.value && Object.keys(script).length === 1) {
      return writeValue(template, nodeFactory, script);
    }

    // more complicated stuff that would require a section of elements. might be
    // something like {{ html: block}}, or {{#if:condition}}content{{/}}
    return writeDynamic(template, nodeFactory, blockBindingFactory, script, contentPaper, childPaper);
  };
};
},{"../../script":282,"../../utils":287,"./bindings/unboundValue":292,"./bindings/value":293,"document-section":300}],295:[function(require,module,exports){
module.exports = function (template) {
  var nodeFactory = template.application.nodeFactory;
  return function (comment) {
    return nodeFactory.createComment(comment);
  };
}
},{}],296:[function(require,module,exports){
var Base = require("../../../bindings/attrs/base")

module.exports = Base.extend({

  /**
   */

  didChange: function (value) {
    this.node.setAttribute(this.attrName, value);
  }
});

},{"../../../bindings/attrs/base":237}],297:[function(require,module,exports){
var utils     = require("../../utils"),
ValueBinding  = require("./bindings/value"),
createScripts = require("../../script");

function addBinding (bindingClass, template, element, attrName, attrValue) {
  template.clips.push({
    attrName: attrName,
    scripts: createScripts(attrValue),
    bindingClass: bindingClass,
    element: element,
    initialize: function () {
      this.nodePath = utils.getNodePath(this.element);
    },
    prepare: function (view) {
      var element = utils.getNodeByPath(view.node, this.nodePath);
      view.bindings.push(new this.bindingClass(view, element, this.scripts, this.attrName));
    }
  });
}

function addBufferedBinding (template, element, key, values) {

}

module.exports = function (template) {

  var nodeFactory    = template.application.nodeFactory,
  attrBindingFactory = template.paperclip.attrBindingFactory;

  return function (name, attributes, childNodes) {
    var element = nodeFactory.createElement(name);

    for (var key in attributes) {

      var value = attributes[key], bindingClass = attrBindingFactory.getClass(key, value);

      if (bindingClass || typeof value !== "string") {
        addBinding(bindingClass || ValueBinding, template, element, key, value);
      } else {  
        element.setAttribute(key, value);
      }
    }

    if (childNodes.length) {
      element.appendChild(childNodes.length > 1 ? nodeFactory.createFragment(childNodes) : childNodes[0]);
    }
    
    return element;
  };
}
},{"../../script":282,"../../utils":287,"./bindings/value":296}],298:[function(require,module,exports){
module.exports = function (template) {
  var nodeFactory = template.application.nodeFactory;
  return function (childNodes) {
    return nodeFactory.createFragment(childNodes);
  };
}
},{}],299:[function(require,module,exports){

module.exports = function (template) {
  var nodeFactory = template.application.nodeFactory;
  return function (value) {

    // blank text nodes are NOT allowed. Chrome has an issue rendering
    // blank text nodes - way, WAY slower if this isn't here!
    if (/^\s+$/.test(value)) {
      return nodeFactory.createTextNode("\u00A0");
    };

    return nodeFactory.createTextNode(value, true);
  };
}
},{}],300:[function(require,module,exports){
arguments[4][179][0].apply(exports,arguments)
},{"nofactor":320,"protoclass":337}],301:[function(require,module,exports){
module.exports=require(35)
},{}],302:[function(require,module,exports){
module.exports=require(180)
},{"OpdoqP":65,"protoclass":304}],303:[function(require,module,exports){
module.exports=require(181)
},{"./animator":302}],304:[function(require,module,exports){
module.exports=require(46)
},{}],305:[function(require,module,exports){
module.exports=require(182)
},{"bindable":308,"nofactor":320}],306:[function(require,module,exports){
module.exports=require(38)
},{"../object":309,"../utils/computed":312,"underscore":316}],307:[function(require,module,exports){
module.exports=require(39)
},{"protoclass":314}],308:[function(require,module,exports){
module.exports=require(40)
},{"./collection":306,"./core/eventEmitter":307,"./object":309,"./utils/computed":312,"./utils/options":313}],309:[function(require,module,exports){
module.exports=require(41)
},{"../core/eventEmitter":307,"./watchProperty":311,"protoclass":314}],310:[function(require,module,exports){
module.exports=require(42)
},{"toarray":315,"underscore":316}],311:[function(require,module,exports){
module.exports=require(43)
},{"../utils/options":313,"./transform":310,"OpdoqP":65,"underscore":316}],312:[function(require,module,exports){
module.exports=require(44)
},{"toarray":315}],313:[function(require,module,exports){
module.exports=require(45)
},{}],314:[function(require,module,exports){
module.exports=require(46)
},{}],315:[function(require,module,exports){
module.exports=require(12)
},{}],316:[function(require,module,exports){
module.exports=require(48)
},{}],317:[function(require,module,exports){
module.exports=require(14)
},{"protoclass":337}],318:[function(require,module,exports){
module.exports=require(15)
},{"./base":317,"factories":336}],319:[function(require,module,exports){
module.exports=require(16)
},{"./base":317}],320:[function(require,module,exports){
module.exports=require(17)
},{"./custom":318,"./dom":319,"./string":325}],321:[function(require,module,exports){
module.exports=require(18)
},{"./text":328}],322:[function(require,module,exports){
module.exports=require(19)
},{"./node":326}],323:[function(require,module,exports){
module.exports=require(20)
},{"./container":322,"./style":327}],324:[function(require,module,exports){
module.exports=require(21)
},{"./container":322}],325:[function(require,module,exports){
module.exports=require(22)
},{"../base":317,"./comment":321,"./container":322,"./element":323,"./fragment":324,"./text":328,"./voidElements":329}],326:[function(require,module,exports){
module.exports=require(23)
},{"protoclass":337}],327:[function(require,module,exports){
module.exports=require(24)
},{"protoclass":337}],328:[function(require,module,exports){
module.exports=require(25)
},{"./node":326,"he":301}],329:[function(require,module,exports){
module.exports=require(26)
},{"./element":323}],330:[function(require,module,exports){
module.exports=require(27)
},{"./base":331,"./factory":333}],331:[function(require,module,exports){
module.exports=require(28)
},{}],332:[function(require,module,exports){
module.exports=require(29)
},{"./base":331}],333:[function(require,module,exports){
module.exports=require(30)
},{"./base":331,"./class":332,"./fn":334,"type-component":338}],334:[function(require,module,exports){
module.exports=require(31)
},{}],335:[function(require,module,exports){
module.exports=require(32)
},{"./base":331,"./factory":333}],336:[function(require,module,exports){
module.exports=require(33)
},{"./any":330,"./class":332,"./factory":333,"./fn":334,"./group":335}],337:[function(require,module,exports){
module.exports=require(11)
},{}],338:[function(require,module,exports){
module.exports=require(34)
},{}],339:[function(require,module,exports){
/* Zepto v1.1.4 - zepto event ajax form ie - zeptojs.com/license */
var Zepto=function(){function L(t){return null==t?String(t):j[S.call(t)]||"object"}function Z(t){return"function"==L(t)}function $(t){return null!=t&&t==t.window}function _(t){return null!=t&&t.nodeType==t.DOCUMENT_NODE}function D(t){return"object"==L(t)}function R(t){return D(t)&&!$(t)&&Object.getPrototypeOf(t)==Object.prototype}function M(t){return"number"==typeof t.length}function k(t){return s.call(t,function(t){return null!=t})}function z(t){return t.length>0?n.fn.concat.apply([],t):t}function F(t){return t.replace(/::/g,"/").replace(/([A-Z]+)([A-Z][a-z])/g,"$1_$2").replace(/([a-z\d])([A-Z])/g,"$1_$2").replace(/_/g,"-").toLowerCase()}function q(t){return t in f?f[t]:f[t]=new RegExp("(^|\\s)"+t+"(\\s|$)")}function H(t,e){return"number"!=typeof e||c[F(t)]?e:e+"px"}function I(t){var e,n;return u[t]||(e=a.createElement(t),a.body.appendChild(e),n=getComputedStyle(e,"").getPropertyValue("display"),e.parentNode.removeChild(e),"none"==n&&(n="block"),u[t]=n),u[t]}function V(t){return"children"in t?o.call(t.children):n.map(t.childNodes,function(t){return 1==t.nodeType?t:void 0})}function B(n,i,r){for(e in i)r&&(R(i[e])||A(i[e]))?(R(i[e])&&!R(n[e])&&(n[e]={}),A(i[e])&&!A(n[e])&&(n[e]=[]),B(n[e],i[e],r)):i[e]!==t&&(n[e]=i[e])}function U(t,e){return null==e?n(t):n(t).filter(e)}function J(t,e,n,i){return Z(e)?e.call(t,n,i):e}function X(t,e,n){null==n?t.removeAttribute(e):t.setAttribute(e,n)}function W(e,n){var i=e.className,r=i&&i.baseVal!==t;return n===t?r?i.baseVal:i:void(r?i.baseVal=n:e.className=n)}function Y(t){var e;try{return t?"true"==t||("false"==t?!1:"null"==t?null:/^0/.test(t)||isNaN(e=Number(t))?/^[\[\{]/.test(t)?n.parseJSON(t):t:e):t}catch(i){return t}}function G(t,e){e(t);for(var n=0,i=t.childNodes.length;i>n;n++)G(t.childNodes[n],e)}var t,e,n,i,C,N,r=[],o=r.slice,s=r.filter,a=window.document,u={},f={},c={"column-count":1,columns:1,"font-weight":1,"line-height":1,opacity:1,"z-index":1,zoom:1},l=/^\s*<(\w+|!)[^>]*>/,h=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,p=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,d=/^(?:body|html)$/i,m=/([A-Z])/g,g=["val","css","html","text","data","width","height","offset"],v=["after","prepend","before","append"],y=a.createElement("table"),x=a.createElement("tr"),b={tr:a.createElement("tbody"),tbody:y,thead:y,tfoot:y,td:x,th:x,"*":a.createElement("div")},w=/complete|loaded|interactive/,E=/^[\w-]*$/,j={},S=j.toString,T={},O=a.createElement("div"),P={tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},A=Array.isArray||function(t){return t instanceof Array};return T.matches=function(t,e){if(!e||!t||1!==t.nodeType)return!1;var n=t.webkitMatchesSelector||t.mozMatchesSelector||t.oMatchesSelector||t.matchesSelector;if(n)return n.call(t,e);var i,r=t.parentNode,o=!r;return o&&(r=O).appendChild(t),i=~T.qsa(r,e).indexOf(t),o&&O.removeChild(t),i},C=function(t){return t.replace(/-+(.)?/g,function(t,e){return e?e.toUpperCase():""})},N=function(t){return s.call(t,function(e,n){return t.indexOf(e)==n})},T.fragment=function(e,i,r){var s,u,f;return h.test(e)&&(s=n(a.createElement(RegExp.$1))),s||(e.replace&&(e=e.replace(p,"<$1></$2>")),i===t&&(i=l.test(e)&&RegExp.$1),i in b||(i="*"),f=b[i],f.innerHTML=""+e,s=n.each(o.call(f.childNodes),function(){f.removeChild(this)})),R(r)&&(u=n(s),n.each(r,function(t,e){g.indexOf(t)>-1?u[t](e):u.attr(t,e)})),s},T.Z=function(t,e){return t=t||[],t.__proto__=n.fn,t.selector=e||"",t},T.isZ=function(t){return t instanceof T.Z},T.init=function(e,i){var r;if(!e)return T.Z();if("string"==typeof e)if(e=e.trim(),"<"==e[0]&&l.test(e))r=T.fragment(e,RegExp.$1,i),e=null;else{if(i!==t)return n(i).find(e);r=T.qsa(a,e)}else{if(Z(e))return n(a).ready(e);if(T.isZ(e))return e;if(A(e))r=k(e);else if(D(e))r=[e],e=null;else if(l.test(e))r=T.fragment(e.trim(),RegExp.$1,i),e=null;else{if(i!==t)return n(i).find(e);r=T.qsa(a,e)}}return T.Z(r,e)},n=function(t,e){return T.init(t,e)},n.extend=function(t){var e,n=o.call(arguments,1);return"boolean"==typeof t&&(e=t,t=n.shift()),n.forEach(function(n){B(t,n,e)}),t},T.qsa=function(t,e){var n,i="#"==e[0],r=!i&&"."==e[0],s=i||r?e.slice(1):e,a=E.test(s);return _(t)&&a&&i?(n=t.getElementById(s))?[n]:[]:1!==t.nodeType&&9!==t.nodeType?[]:o.call(a&&!i?r?t.getElementsByClassName(s):t.getElementsByTagName(e):t.querySelectorAll(e))},n.contains=a.documentElement.contains?function(t,e){return t!==e&&t.contains(e)}:function(t,e){for(;e&&(e=e.parentNode);)if(e===t)return!0;return!1},n.type=L,n.isFunction=Z,n.isWindow=$,n.isArray=A,n.isPlainObject=R,n.isEmptyObject=function(t){var e;for(e in t)return!1;return!0},n.inArray=function(t,e,n){return r.indexOf.call(e,t,n)},n.camelCase=C,n.trim=function(t){return null==t?"":String.prototype.trim.call(t)},n.uuid=0,n.support={},n.expr={},n.map=function(t,e){var n,r,o,i=[];if(M(t))for(r=0;r<t.length;r++)n=e(t[r],r),null!=n&&i.push(n);else for(o in t)n=e(t[o],o),null!=n&&i.push(n);return z(i)},n.each=function(t,e){var n,i;if(M(t)){for(n=0;n<t.length;n++)if(e.call(t[n],n,t[n])===!1)return t}else for(i in t)if(e.call(t[i],i,t[i])===!1)return t;return t},n.grep=function(t,e){return s.call(t,e)},window.JSON&&(n.parseJSON=JSON.parse),n.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(t,e){j["[object "+e+"]"]=e.toLowerCase()}),n.fn={forEach:r.forEach,reduce:r.reduce,push:r.push,sort:r.sort,indexOf:r.indexOf,concat:r.concat,map:function(t){return n(n.map(this,function(e,n){return t.call(e,n,e)}))},slice:function(){return n(o.apply(this,arguments))},ready:function(t){return w.test(a.readyState)&&a.body?t(n):a.addEventListener("DOMContentLoaded",function(){t(n)},!1),this},get:function(e){return e===t?o.call(this):this[e>=0?e:e+this.length]},toArray:function(){return this.get()},size:function(){return this.length},remove:function(){return this.each(function(){null!=this.parentNode&&this.parentNode.removeChild(this)})},each:function(t){return r.every.call(this,function(e,n){return t.call(e,n,e)!==!1}),this},filter:function(t){return Z(t)?this.not(this.not(t)):n(s.call(this,function(e){return T.matches(e,t)}))},add:function(t,e){return n(N(this.concat(n(t,e))))},is:function(t){return this.length>0&&T.matches(this[0],t)},not:function(e){var i=[];if(Z(e)&&e.call!==t)this.each(function(t){e.call(this,t)||i.push(this)});else{var r="string"==typeof e?this.filter(e):M(e)&&Z(e.item)?o.call(e):n(e);this.forEach(function(t){r.indexOf(t)<0&&i.push(t)})}return n(i)},has:function(t){return this.filter(function(){return D(t)?n.contains(this,t):n(this).find(t).size()})},eq:function(t){return-1===t?this.slice(t):this.slice(t,+t+1)},first:function(){var t=this[0];return t&&!D(t)?t:n(t)},last:function(){var t=this[this.length-1];return t&&!D(t)?t:n(t)},find:function(t){var e,i=this;return e=t?"object"==typeof t?n(t).filter(function(){var t=this;return r.some.call(i,function(e){return n.contains(e,t)})}):1==this.length?n(T.qsa(this[0],t)):this.map(function(){return T.qsa(this,t)}):[]},closest:function(t,e){var i=this[0],r=!1;for("object"==typeof t&&(r=n(t));i&&!(r?r.indexOf(i)>=0:T.matches(i,t));)i=i!==e&&!_(i)&&i.parentNode;return n(i)},parents:function(t){for(var e=[],i=this;i.length>0;)i=n.map(i,function(t){return(t=t.parentNode)&&!_(t)&&e.indexOf(t)<0?(e.push(t),t):void 0});return U(e,t)},parent:function(t){return U(N(this.pluck("parentNode")),t)},children:function(t){return U(this.map(function(){return V(this)}),t)},contents:function(){return this.map(function(){return o.call(this.childNodes)})},siblings:function(t){return U(this.map(function(t,e){return s.call(V(e.parentNode),function(t){return t!==e})}),t)},empty:function(){return this.each(function(){this.innerHTML=""})},pluck:function(t){return n.map(this,function(e){return e[t]})},show:function(){return this.each(function(){"none"==this.style.display&&(this.style.display=""),"none"==getComputedStyle(this,"").getPropertyValue("display")&&(this.style.display=I(this.nodeName))})},replaceWith:function(t){return this.before(t).remove()},wrap:function(t){var e=Z(t);if(this[0]&&!e)var i=n(t).get(0),r=i.parentNode||this.length>1;return this.each(function(o){n(this).wrapAll(e?t.call(this,o):r?i.cloneNode(!0):i)})},wrapAll:function(t){if(this[0]){n(this[0]).before(t=n(t));for(var e;(e=t.children()).length;)t=e.first();n(t).append(this)}return this},wrapInner:function(t){var e=Z(t);return this.each(function(i){var r=n(this),o=r.contents(),s=e?t.call(this,i):t;o.length?o.wrapAll(s):r.append(s)})},unwrap:function(){return this.parent().each(function(){n(this).replaceWith(n(this).children())}),this},clone:function(){return this.map(function(){return this.cloneNode(!0)})},hide:function(){return this.css("display","none")},toggle:function(e){return this.each(function(){var i=n(this);(e===t?"none"==i.css("display"):e)?i.show():i.hide()})},prev:function(t){return n(this.pluck("previousElementSibling")).filter(t||"*")},next:function(t){return n(this.pluck("nextElementSibling")).filter(t||"*")},html:function(t){return 0 in arguments?this.each(function(e){var i=this.innerHTML;n(this).empty().append(J(this,t,e,i))}):0 in this?this[0].innerHTML:null},text:function(t){return 0 in arguments?this.each(function(e){var n=J(this,t,e,this.textContent);this.textContent=null==n?"":""+n}):0 in this?this[0].textContent:null},attr:function(n,i){var r;return"string"!=typeof n||1 in arguments?this.each(function(t){if(1===this.nodeType)if(D(n))for(e in n)X(this,e,n[e]);else X(this,n,J(this,i,t,this.getAttribute(n)))}):this.length&&1===this[0].nodeType?!(r=this[0].getAttribute(n))&&n in this[0]?this[0][n]:r:t},removeAttr:function(t){return this.each(function(){1===this.nodeType&&X(this,t)})},prop:function(t,e){return t=P[t]||t,1 in arguments?this.each(function(n){this[t]=J(this,e,n,this[t])}):this[0]&&this[0][t]},data:function(e,n){var i="data-"+e.replace(m,"-$1").toLowerCase(),r=1 in arguments?this.attr(i,n):this.attr(i);return null!==r?Y(r):t},val:function(t){return 0 in arguments?this.each(function(e){this.value=J(this,t,e,this.value)}):this[0]&&(this[0].multiple?n(this[0]).find("option").filter(function(){return this.selected}).pluck("value"):this[0].value)},offset:function(t){if(t)return this.each(function(e){var i=n(this),r=J(this,t,e,i.offset()),o=i.offsetParent().offset(),s={top:r.top-o.top,left:r.left-o.left};"static"==i.css("position")&&(s.position="relative"),i.css(s)});if(!this.length)return null;var e=this[0].getBoundingClientRect();return{left:e.left+window.pageXOffset,top:e.top+window.pageYOffset,width:Math.round(e.width),height:Math.round(e.height)}},css:function(t,i){if(arguments.length<2){var r=this[0],o=getComputedStyle(r,"");if(!r)return;if("string"==typeof t)return r.style[C(t)]||o.getPropertyValue(t);if(A(t)){var s={};return n.each(A(t)?t:[t],function(t,e){s[e]=r.style[C(e)]||o.getPropertyValue(e)}),s}}var a="";if("string"==L(t))i||0===i?a=F(t)+":"+H(t,i):this.each(function(){this.style.removeProperty(F(t))});else for(e in t)t[e]||0===t[e]?a+=F(e)+":"+H(e,t[e])+";":this.each(function(){this.style.removeProperty(F(e))});return this.each(function(){this.style.cssText+=";"+a})},index:function(t){return t?this.indexOf(n(t)[0]):this.parent().children().indexOf(this[0])},hasClass:function(t){return t?r.some.call(this,function(t){return this.test(W(t))},q(t)):!1},addClass:function(t){return t?this.each(function(e){i=[];var r=W(this),o=J(this,t,e,r);o.split(/\s+/g).forEach(function(t){n(this).hasClass(t)||i.push(t)},this),i.length&&W(this,r+(r?" ":"")+i.join(" "))}):this},removeClass:function(e){return this.each(function(n){return e===t?W(this,""):(i=W(this),J(this,e,n,i).split(/\s+/g).forEach(function(t){i=i.replace(q(t)," ")}),void W(this,i.trim()))})},toggleClass:function(e,i){return e?this.each(function(r){var o=n(this),s=J(this,e,r,W(this));s.split(/\s+/g).forEach(function(e){(i===t?!o.hasClass(e):i)?o.addClass(e):o.removeClass(e)})}):this},scrollTop:function(e){if(this.length){var n="scrollTop"in this[0];return e===t?n?this[0].scrollTop:this[0].pageYOffset:this.each(n?function(){this.scrollTop=e}:function(){this.scrollTo(this.scrollX,e)})}},scrollLeft:function(e){if(this.length){var n="scrollLeft"in this[0];return e===t?n?this[0].scrollLeft:this[0].pageXOffset:this.each(n?function(){this.scrollLeft=e}:function(){this.scrollTo(e,this.scrollY)})}},position:function(){if(this.length){var t=this[0],e=this.offsetParent(),i=this.offset(),r=d.test(e[0].nodeName)?{top:0,left:0}:e.offset();return i.top-=parseFloat(n(t).css("margin-top"))||0,i.left-=parseFloat(n(t).css("margin-left"))||0,r.top+=parseFloat(n(e[0]).css("border-top-width"))||0,r.left+=parseFloat(n(e[0]).css("border-left-width"))||0,{top:i.top-r.top,left:i.left-r.left}}},offsetParent:function(){return this.map(function(){for(var t=this.offsetParent||a.body;t&&!d.test(t.nodeName)&&"static"==n(t).css("position");)t=t.offsetParent;return t})}},n.fn.detach=n.fn.remove,["width","height"].forEach(function(e){var i=e.replace(/./,function(t){return t[0].toUpperCase()});n.fn[e]=function(r){var o,s=this[0];return r===t?$(s)?s["inner"+i]:_(s)?s.documentElement["scroll"+i]:(o=this.offset())&&o[e]:this.each(function(t){s=n(this),s.css(e,J(this,r,t,s[e]()))})}}),v.forEach(function(t,e){var i=e%2;n.fn[t]=function(){var t,o,r=n.map(arguments,function(e){return t=L(e),"object"==t||"array"==t||null==e?e:T.fragment(e)}),s=this.length>1;return r.length<1?this:this.each(function(t,u){o=i?u:u.parentNode,u=0==e?u.nextSibling:1==e?u.firstChild:2==e?u:null;var f=n.contains(a.documentElement,o);r.forEach(function(t){if(s)t=t.cloneNode(!0);else if(!o)return n(t).remove();o.insertBefore(t,u),f&&G(t,function(t){null==t.nodeName||"SCRIPT"!==t.nodeName.toUpperCase()||t.type&&"text/javascript"!==t.type||t.src||window.eval.call(window,t.innerHTML)})})})},n.fn[i?t+"To":"insert"+(e?"Before":"After")]=function(e){return n(e)[t](this),this}}),T.Z.prototype=n.fn,T.uniq=N,T.deserializeValue=Y,n.zepto=T,n}();window.Zepto=Zepto,void 0===window.$&&(window.$=Zepto),function(t){function l(t){return t._zid||(t._zid=e++)}function h(t,e,n,i){if(e=p(e),e.ns)var r=d(e.ns);return(s[l(t)]||[]).filter(function(t){return!(!t||e.e&&t.e!=e.e||e.ns&&!r.test(t.ns)||n&&l(t.fn)!==l(n)||i&&t.sel!=i)})}function p(t){var e=(""+t).split(".");return{e:e[0],ns:e.slice(1).sort().join(" ")}}function d(t){return new RegExp("(?:^| )"+t.replace(" "," .* ?")+"(?: |$)")}function m(t,e){return t.del&&!u&&t.e in f||!!e}function g(t){return c[t]||u&&f[t]||t}function v(e,i,r,o,a,u,f){var h=l(e),d=s[h]||(s[h]=[]);i.split(/\s/).forEach(function(i){if("ready"==i)return t(document).ready(r);var s=p(i);s.fn=r,s.sel=a,s.e in c&&(r=function(e){var n=e.relatedTarget;return!n||n!==this&&!t.contains(this,n)?s.fn.apply(this,arguments):void 0}),s.del=u;var l=u||r;s.proxy=function(t){if(t=j(t),!t.isImmediatePropagationStopped()){t.data=o;var i=l.apply(e,t._args==n?[t]:[t].concat(t._args));return i===!1&&(t.preventDefault(),t.stopPropagation()),i}},s.i=d.length,d.push(s),"addEventListener"in e&&e.addEventListener(g(s.e),s.proxy,m(s,f))})}function y(t,e,n,i,r){var o=l(t);(e||"").split(/\s/).forEach(function(e){h(t,e,n,i).forEach(function(e){delete s[o][e.i],"removeEventListener"in t&&t.removeEventListener(g(e.e),e.proxy,m(e,r))})})}function j(e,i){return(i||!e.isDefaultPrevented)&&(i||(i=e),t.each(E,function(t,n){var r=i[t];e[t]=function(){return this[n]=x,r&&r.apply(i,arguments)},e[n]=b}),(i.defaultPrevented!==n?i.defaultPrevented:"returnValue"in i?i.returnValue===!1:i.getPreventDefault&&i.getPreventDefault())&&(e.isDefaultPrevented=x)),e}function S(t){var e,i={originalEvent:t};for(e in t)w.test(e)||t[e]===n||(i[e]=t[e]);return j(i,t)}var n,e=1,i=Array.prototype.slice,r=t.isFunction,o=function(t){return"string"==typeof t},s={},a={},u="onfocusin"in window,f={focus:"focusin",blur:"focusout"},c={mouseenter:"mouseover",mouseleave:"mouseout"};a.click=a.mousedown=a.mouseup=a.mousemove="MouseEvents",t.event={add:v,remove:y},t.proxy=function(e,n){var s=2 in arguments&&i.call(arguments,2);if(r(e)){var a=function(){return e.apply(n,s?s.concat(i.call(arguments)):arguments)};return a._zid=l(e),a}if(o(n))return s?(s.unshift(e[n],e),t.proxy.apply(null,s)):t.proxy(e[n],e);throw new TypeError("expected function")},t.fn.bind=function(t,e,n){return this.on(t,e,n)},t.fn.unbind=function(t,e){return this.off(t,e)},t.fn.one=function(t,e,n,i){return this.on(t,e,n,i,1)};var x=function(){return!0},b=function(){return!1},w=/^([A-Z]|returnValue$|layer[XY]$)/,E={preventDefault:"isDefaultPrevented",stopImmediatePropagation:"isImmediatePropagationStopped",stopPropagation:"isPropagationStopped"};t.fn.delegate=function(t,e,n){return this.on(e,t,n)},t.fn.undelegate=function(t,e,n){return this.off(e,t,n)},t.fn.live=function(e,n){return t(document.body).delegate(this.selector,e,n),this},t.fn.die=function(e,n){return t(document.body).undelegate(this.selector,e,n),this},t.fn.on=function(e,s,a,u,f){var c,l,h=this;return e&&!o(e)?(t.each(e,function(t,e){h.on(t,s,a,e,f)}),h):(o(s)||r(u)||u===!1||(u=a,a=s,s=n),(r(a)||a===!1)&&(u=a,a=n),u===!1&&(u=b),h.each(function(n,r){f&&(c=function(t){return y(r,t.type,u),u.apply(this,arguments)}),s&&(l=function(e){var n,o=t(e.target).closest(s,r).get(0);return o&&o!==r?(n=t.extend(S(e),{currentTarget:o,liveFired:r}),(c||u).apply(o,[n].concat(i.call(arguments,1)))):void 0}),v(r,e,u,a,s,l||c)}))},t.fn.off=function(e,i,s){var a=this;return e&&!o(e)?(t.each(e,function(t,e){a.off(t,i,e)}),a):(o(i)||r(s)||s===!1||(s=i,i=n),s===!1&&(s=b),a.each(function(){y(this,e,s,i)}))},t.fn.trigger=function(e,n){return e=o(e)||t.isPlainObject(e)?t.Event(e):j(e),e._args=n,this.each(function(){"dispatchEvent"in this?this.dispatchEvent(e):t(this).triggerHandler(e,n)})},t.fn.triggerHandler=function(e,n){var i,r;return this.each(function(s,a){i=S(o(e)?t.Event(e):e),i._args=n,i.target=a,t.each(h(a,e.type||e),function(t,e){return r=e.proxy(i),i.isImmediatePropagationStopped()?!1:void 0})}),r},"focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select keydown keypress keyup error".split(" ").forEach(function(e){t.fn[e]=function(t){return t?this.bind(e,t):this.trigger(e)}}),["focus","blur"].forEach(function(e){t.fn[e]=function(t){return t?this.bind(e,t):this.each(function(){try{this[e]()}catch(t){}}),this}}),t.Event=function(t,e){o(t)||(e=t,t=e.type);var n=document.createEvent(a[t]||"Events"),i=!0;if(e)for(var r in e)"bubbles"==r?i=!!e[r]:n[r]=e[r];return n.initEvent(t,i,!0),j(n)}}(Zepto),function(t){function l(e,n,i){var r=t.Event(n);return t(e).trigger(r,i),!r.isDefaultPrevented()}function h(t,e,i,r){return t.global?l(e||n,i,r):void 0}function p(e){e.global&&0===t.active++&&h(e,null,"ajaxStart")}function d(e){e.global&&!--t.active&&h(e,null,"ajaxStop")}function m(t,e){var n=e.context;return e.beforeSend.call(n,t,e)===!1||h(e,n,"ajaxBeforeSend",[t,e])===!1?!1:void h(e,n,"ajaxSend",[t,e])}function g(t,e,n,i){var r=n.context,o="success";n.success.call(r,t,o,e),i&&i.resolveWith(r,[t,o,e]),h(n,r,"ajaxSuccess",[e,n,t]),y(o,e,n)}function v(t,e,n,i,r){var o=i.context;i.error.call(o,n,e,t),r&&r.rejectWith(o,[n,e,t]),h(i,o,"ajaxError",[n,i,t||e]),y(e,n,i)}function y(t,e,n){var i=n.context;n.complete.call(i,e,t),h(n,i,"ajaxComplete",[e,n]),d(n)}function x(){}function b(t){return t&&(t=t.split(";",2)[0]),t&&(t==f?"html":t==u?"json":s.test(t)?"script":a.test(t)&&"xml")||"text"}function w(t,e){return""==e?t:(t+"&"+e).replace(/[&?]{1,2}/,"?")}function E(e){e.processData&&e.data&&"string"!=t.type(e.data)&&(e.data=t.param(e.data,e.traditional)),!e.data||e.type&&"GET"!=e.type.toUpperCase()||(e.url=w(e.url,e.data),e.data=void 0)}function j(e,n,i,r){return t.isFunction(n)&&(r=i,i=n,n=void 0),t.isFunction(i)||(r=i,i=void 0),{url:e,data:n,success:i,dataType:r}}function T(e,n,i,r){var o,s=t.isArray(n),a=t.isPlainObject(n);t.each(n,function(n,u){o=t.type(u),r&&(n=i?r:r+"["+(a||"object"==o||"array"==o?n:"")+"]"),!r&&s?e.add(u.name,u.value):"array"==o||!i&&"object"==o?T(e,u,i,n):e.add(n,u)})}var i,r,e=0,n=window.document,o=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,s=/^(?:text|application)\/javascript/i,a=/^(?:text|application)\/xml/i,u="application/json",f="text/html",c=/^\s*$/;t.active=0,t.ajaxJSONP=function(i,r){if(!("type"in i))return t.ajax(i);var f,h,o=i.jsonpCallback,s=(t.isFunction(o)?o():o)||"jsonp"+ ++e,a=n.createElement("script"),u=window[s],c=function(e){t(a).triggerHandler("error",e||"abort")},l={abort:c};return r&&r.promise(l),t(a).on("load error",function(e,n){clearTimeout(h),t(a).off().remove(),"error"!=e.type&&f?g(f[0],l,i,r):v(null,n||"error",l,i,r),window[s]=u,f&&t.isFunction(u)&&u(f[0]),u=f=void 0}),m(l,i)===!1?(c("abort"),l):(window[s]=function(){f=arguments},a.src=i.url.replace(/\?(.+)=\?/,"?$1="+s),n.head.appendChild(a),i.timeout>0&&(h=setTimeout(function(){c("timeout")},i.timeout)),l)},t.ajaxSettings={type:"GET",beforeSend:x,success:x,error:x,complete:x,context:null,global:!0,xhr:function(){return new window.XMLHttpRequest},accepts:{script:"text/javascript, application/javascript, application/x-javascript",json:u,xml:"application/xml, text/xml",html:f,text:"text/plain"},crossDomain:!1,timeout:0,processData:!0,cache:!0},t.ajax=function(e){var n=t.extend({},e||{}),o=t.Deferred&&t.Deferred();for(i in t.ajaxSettings)void 0===n[i]&&(n[i]=t.ajaxSettings[i]);p(n),n.crossDomain||(n.crossDomain=/^([\w-]+:)?\/\/([^\/]+)/.test(n.url)&&RegExp.$2!=window.location.host),n.url||(n.url=window.location.toString()),E(n);var s=n.dataType,a=/\?.+=\?/.test(n.url);if(a&&(s="jsonp"),n.cache!==!1&&(e&&e.cache===!0||"script"!=s&&"jsonp"!=s)||(n.url=w(n.url,"_="+Date.now())),"jsonp"==s)return a||(n.url=w(n.url,n.jsonp?n.jsonp+"=?":n.jsonp===!1?"":"callback=?")),t.ajaxJSONP(n,o);var j,u=n.accepts[s],f={},l=function(t,e){f[t.toLowerCase()]=[t,e]},h=/^([\w-]+:)\/\//.test(n.url)?RegExp.$1:window.location.protocol,d=n.xhr(),y=d.setRequestHeader;if(o&&o.promise(d),n.crossDomain||l("X-Requested-With","XMLHttpRequest"),l("Accept",u||"*/*"),(u=n.mimeType||u)&&(u.indexOf(",")>-1&&(u=u.split(",",2)[0]),d.overrideMimeType&&d.overrideMimeType(u)),(n.contentType||n.contentType!==!1&&n.data&&"GET"!=n.type.toUpperCase())&&l("Content-Type",n.contentType||"application/x-www-form-urlencoded"),n.headers)for(r in n.headers)l(r,n.headers[r]);if(d.setRequestHeader=l,d.onreadystatechange=function(){if(4==d.readyState){d.onreadystatechange=x,clearTimeout(j);var e,i=!1;if(d.status>=200&&d.status<300||304==d.status||0==d.status&&"file:"==h){s=s||b(n.mimeType||d.getResponseHeader("content-type")),e=d.responseText;try{"script"==s?(1,eval)(e):"xml"==s?e=d.responseXML:"json"==s&&(e=c.test(e)?null:t.parseJSON(e))}catch(r){i=r}i?v(i,"parsererror",d,n,o):g(e,d,n,o)}else v(d.statusText||null,d.status?"error":"abort",d,n,o)}},m(d,n)===!1)return d.abort(),v(null,"abort",d,n,o),d;if(n.xhrFields)for(r in n.xhrFields)d[r]=n.xhrFields[r];var S="async"in n?n.async:!0;d.open(n.type,n.url,S,n.username,n.password);for(r in f)y.apply(d,f[r]);return n.timeout>0&&(j=setTimeout(function(){d.onreadystatechange=x,d.abort(),v(null,"timeout",d,n,o)},n.timeout)),d.send(n.data?n.data:null),d},t.get=function(){return t.ajax(j.apply(null,arguments))},t.post=function(){var e=j.apply(null,arguments);return e.type="POST",t.ajax(e)},t.getJSON=function(){var e=j.apply(null,arguments);return e.dataType="json",t.ajax(e)},t.fn.load=function(e,n,i){if(!this.length)return this;var a,r=this,s=e.split(/\s/),u=j(e,n,i),f=u.success;return s.length>1&&(u.url=s[0],a=s[1]),u.success=function(e){r.html(a?t("<div>").html(e.replace(o,"")).find(a):e),f&&f.apply(r,arguments)},t.ajax(u),this};var S=encodeURIComponent;t.param=function(t,e){var n=[];return n.add=function(t,e){this.push(S(t)+"="+S(e))},T(n,t,e),n.join("&").replace(/%20/g,"+")}}(Zepto),function(t){t.fn.serializeArray=function(){var n,e=[];return t([].slice.call(this.get(0).elements)).each(function(){n=t(this);var i=n.attr("type");"fieldset"!=this.nodeName.toLowerCase()&&!this.disabled&&"submit"!=i&&"reset"!=i&&"button"!=i&&("radio"!=i&&"checkbox"!=i||this.checked)&&e.push({name:n.attr("name"),value:n.val()})}),e},t.fn.serialize=function(){var t=[];return this.serializeArray().forEach(function(e){t.push(encodeURIComponent(e.name)+"="+encodeURIComponent(e.value))}),t.join("&")},t.fn.submit=function(e){if(e)this.bind("submit",e);else if(this.length){var n=t.Event("submit");this.eq(0).trigger(n),n.isDefaultPrevented()||this.get(0).submit()}return this}}(Zepto),function(t){"__proto__"in{}||t.extend(t.zepto,{Z:function(e,n){return e=e||[],t.extend(e,t.fn),e.selector=n||"",e.__Z=!0,e},isZ:function(e){return"array"===t.type(e)&&"__Z"in e}});try{getComputedStyle(void 0)}catch(e){var n=getComputedStyle;window.getComputedStyle=function(t){try{return n(t)}catch(e){return null}}}}(Zepto);
},{}]},{},[3])