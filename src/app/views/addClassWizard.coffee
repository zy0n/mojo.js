define ["../../core/views/state", "../core/templates", "./addClass", "./addStudents", "./addBehaviors"], (StateView, templates, AddClassView, AddStudentsView, AddBehaviorsView) ->
  
  class AddClassWizardView extends StateView

    ###
    ###

    template: templates.addClassWizard,

    ###
    ###

    childrenElement: ".modal-body",


    ###
    ###

    transition: {
      ".confirmation-dailog": {
        enter: {
          from: { opacity: 0,  scale: 0.9 },
          to: { opacity: 1,  scale: 1 }
        },
        exit: {
          to: { opacity: 0,  scale: 1.1 }
        }
      },
      ".modal-backdrop": {
        enter: {
          from: { opacity: 0 },
          to: { opacity: 0.25 }
        },
        exit: {
          to: { opacity: 0  }
        }
      }
    },

    ###
    ###

    events: {
      "noMoreStates": "remove",
      "click .close .cancel-btn": "remove"
    },

    ###
    ###

    constructor: () ->
      super {
        states: [
          new AddClassView(),
          new AddStudentsView(),
          new AddBehaviorsView()
        ]
      }

    ###
    ###

    init: () ->
      super()
      @bind "currentView.title", "title"

    ###
    ###

    _endOfStates: () -> @remove()

    ###
    ###

    _onCurrentStateChange: () ->
      @get("currentView").once "complete", @nextState
  


