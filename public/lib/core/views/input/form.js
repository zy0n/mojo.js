// Generated by CoffeeScript 1.4.0
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["../base", "../../templates/factory", "mannequin"], function(BaseView, templates, mannequin) {
    /*
    */

    var FormView;
    return FormView = (function(_super) {

      __extends(FormView, _super);

      function FormView() {
        this._onLoaded = __bind(this._onLoaded, this);

        this._showErrorMessage = __bind(this._showErrorMessage, this);

        this._onSubmit = __bind(this._onSubmit, this);

        this._onAttached = __bind(this._onAttached, this);

        this.submit = __bind(this.submit, this);
        return FormView.__super__.constructor.apply(this, arguments);
      }

      /*
      */


      FormView.prototype.modelClass = mannequin.Model;

      /*
      */


      FormView.prototype.template = templates.fromSource("<form></form>");

      /*
      */


      FormView.prototype.submit = function(callback) {
        var model,
          _this = this;
        if (callback == null) {
          callback = (function() {});
        }
        event.stopImmediatePropagation();
        model = this._model();
        model.set(this.get("data"));
        return model.validate(function(err, result) {
          if (err) {
            return _this._showErrorMessage(err);
          }
          return _this.emit("complete");
        });
      };

      /*
      */


      FormView.prototype._onAttached = function() {
        var _this = this;
        FormView.__super__._onAttached.call(this);
        this.$(this.get("submitElement")).bind("click", this._onSubmit);
        return this.element.bind("data", function(e, d) {
          e.stopPropagation();
          return _this.set("data." + d.name, d.value);
        });
      };

      /*
      */


      FormView.prototype._onSubmit = function(event) {
        return this.submit();
      };

      /*
      */


      FormView.prototype._showErrorMessage = function() {};

      /*
      */


      FormView.prototype._onLoaded = function() {
        return FormView.__super__._onLoaded.call(this);
      };

      /*
      */


      FormView.prototype._model = function() {
        var clazz, model;
        model = this.get("model");
        if (model) {
          return model;
        }
        clazz = this.get("modelClass");
        model = new clazz;
        this.set("model", model);
        return model;
      };

      return FormView;

    })(BaseView);
  });

}).call(this);
