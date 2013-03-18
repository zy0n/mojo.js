// Generated by CoffeeScript 1.4.0
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["disposable", "./base"], function(disposable, BaseDecorator) {
    var EventsDecorator;
    EventsDecorator = (function(_super) {

      __extends(EventsDecorator, _super);

      function EventsDecorator() {
        return EventsDecorator.__super__.constructor.apply(this, arguments);
      }

      /*
      */


      EventsDecorator.prototype.setup = function(callback) {
        var e, selector;
        e = this._events();
        this._disposeBindings();
        this._disposable = disposable.create();
        for (selector in e) {
          this._addBinding(selector, e[selector]);
        }
        return callback();
      };

      /*
      */


      EventsDecorator.prototype.teardown = function(callback) {
        this._disposeBindings();
        return callback();
      };

      /*
      */


      EventsDecorator.prototype._addBinding = function(selector, viewMethod) {
        var action, cb, elements, selectorParts, selectors,
          _this = this;
        selectorParts = selector.split(" ");
        action = selectorParts.shift();
        selectors = selectorParts.join(",");
        elements = this.view.element.find(selectors);
        console.log(action);
        elements.bind(action.toLowerCase(), cb = function() {
          var ref;
          if (typeof viewMethod === "function") {
            ref = viewMethod;
          } else {
            ref = _this.view[viewMethod];
          }
          return ref.apply(_this.view, arguments);
        });
        return this._disposable.add(function() {
          return elements.unbind(action, cb);
        });
      };

      /*
      */


      EventsDecorator.prototype._disposeBindings = function() {
        if (!this._disposable) {
          return;
        }
        this._disposable.dispose();
        return this._disposable = void 0;
      };

      /*
      */


      EventsDecorator.prototype._events = function() {
        return this.view.get("events");
      };

      return EventsDecorator;

    })(BaseDecorator);
    EventsDecorator.test = function(view) {
      return view.has("events");
    };
    return EventsDecorator;
  });

}).call(this);
