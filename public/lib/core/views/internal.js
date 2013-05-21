// Generated by CoffeeScript 1.6.2
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["jquery", "bindable", "./collection", "../utils/idGenerator", "dref", "../models/locator", "pilot-block", "./states"], function($, bindable, ViewCollection, generateId, dref, modelLocator, pilot, ViewStates) {
    var InternalView;

    return InternalView = (function(_super) {
      __extends(InternalView, _super);

      /*
      */


      InternalView.prototype.__isView = true;

      /*
      */


      function InternalView(data) {
        if (data == null) {
          data = {};
        }
        this._onRemoved = __bind(this._onRemoved, this);
        this._onRemove = __bind(this._onRemove, this);
        this._onDisplayed = __bind(this._onDisplayed, this);
        this._onDisplay = __bind(this._onDisplay, this);
        this._onRendered = __bind(this._onRendered, this);
        this._onRender = __bind(this._onRender, this);
        this._onLoaded = __bind(this._onLoaded, this);
        this._onLoad = __bind(this._onLoad, this);
        this.dispose = __bind(this.dispose, this);
        this._id = dref.get(data, "_id") || dref.get(data.item || {}, "_id") || generateId();
        data.view = this;
        data.modelLocator = modelLocator;
        InternalView.__super__.constructor.call(this, data);
        this.init();
      }

      /*
      */


      InternalView.prototype.init = function() {
        this.decorators = this.loadables = new ViewCollection();
        this.decorators.view = this;
        this.section = pilot.createSection();
        this._initListeners();
        this._initDecor();
        return this._initBindings();
      };

      /*
      */


      InternalView.prototype.load = function(next) {
        return this.decorators.load(next);
      };

      InternalView.prototype.render = function(next) {
        return this.decorators.render(next);
      };

      InternalView.prototype.display = function(next) {
        return this.decorators.display(next);
      };

      InternalView.prototype.remove = function(next) {
        return this.decorators.remove(next);
      };

      /*
       If the key doesn't exist, then inherit it from the parent
      */


      InternalView.prototype.get = function(key) {
        var _ref, _ref1;

        return (_ref = InternalView.__super__.get.call(this, key)) != null ? _ref : (_ref1 = this._parent) != null ? _ref1.get(key) : void 0;
      };

      /*
      */


      InternalView.prototype.bubble = function() {
        var _ref;

        this.emit.apply(this, arguments);
        return (_ref = this._parent) != null ? _ref.bubble.apply(_ref, arguments) : void 0;
      };

      /*
       returns a search for a particular element
      */


      InternalView.prototype.$ = function(search) {
        var el;

        el = $(this.section.elements);
        if (arguments.length) {
          return el.find(search);
        }
        if (arguments.length) {
          el.find(search);
        } else {

        }
        return el;
      };

      /*
       attaches to an element to the DOM
      */


      InternalView.prototype.attach = function(element, callback) {
        var _this = this;

        this._domElement = element[0] || element;
        this.decorators.once("display", function() {
          return _this.section.replaceChildren(_this._domElement);
        });
        return this.display(callback);
      };

      /*
      */


      InternalView.prototype.linkChild = function() {
        var child, _i, _len;

        for (_i = 0, _len = arguments.length; _i < _len; _i++) {
          child = arguments[_i];
          child._parent = this;
        }
        return this;
      };

      /*
      */


      InternalView.prototype.dispose = function() {
        var el;

        el = this.$();
        el.unbind("*");
        this.section.dispose();
        return InternalView.__super__.dispose.call(this);
      };

      /*
      */


      InternalView.prototype._initListeners = function() {
        return this.decorators.on({
          load: this._onLoad,
          loaded: this._onLoaded,
          render: this._onRender,
          rendered: this._onRendered,
          display: this._onDisplay,
          displayed: this._onDisplayed,
          remove: this._onRemove,
          removed: this._onRemoved
        });
      };

      /*
      */


      InternalView.prototype._initDecor = function() {};

      /*
      */


      InternalView.prototype._initBindings = function() {
        return this.decorators.bind("currentState").to(this, "currentState");
      };

      /*
      */


      InternalView.prototype._onLoad = function() {};

      InternalView.prototype._onLoaded = function() {
        var _ref;

        if (((_ref = this._parent) != null ? _ref.get("currentState") : void 0) === ViewStates.LOADING) {
          return;
        }
        return this.section.updateChildren();
      };

      /*
      */


      InternalView.prototype._onRender = function() {};

      InternalView.prototype._onRendered = function() {};

      /*
      */


      InternalView.prototype._onDisplay = function() {};

      InternalView.prototype._onDisplayed = function() {};

      /*
      */


      InternalView.prototype._onRemove = function() {};

      InternalView.prototype._onRemoved = function() {
        var _ref;

        if (((_ref = this._parent) != null ? _ref.get("currentState") : void 0) === ViewStates.REMOVING) {
          return;
        }
        return this.dispose();
      };

      return InternalView;

    })(bindable.Object);
  });

}).call(this);
