Vue.component('report-input', {
    props: ['id', 'label', 'value', 'title', 'cotaClass'],
    template:
     '<div class="row">' +
      '<div class="container">' +
        '<div class="caption">' +
          '<div class="input-label row">{{ label }}</div>' +
          '<div class="row">' +
          '<input :title="title" :id="id" type="text" ' +
            'class="form-control" :value="value" style="width: 10vw;"/>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>'
});

Vue.component('timing-table', {
  props: ['rows', 'columns'],
  template:
  '<div class="mt-3 container timing-table-content">' +
    '<div class="caption">' +
      '<div class="input-label row"> Tiempos</div>' +
      '<div class="row">' +
        '<div class="table setr-table">' +
          '<!-- Table start -->' +
          '<div class="t-head">' +
            '<!-- Table head start -->' +
            '<div class="t-row cell-container">' +
              '<div class="t-cell t-head-cell" v-for="col in columns"> {{col}}</div>' +
            '</div>' +
            '<!-- Table head end -->' +
          '</div>' +
          '<div class="t-body">' +
            '<!-- Table body start -->' +
            '<div class="t-row cell-container" v-for="row in rows">' +
              '<!-- Table row start -->' +
              '<div class="t-cell" v-for="col in columns">{{row[columns.indexOf(col)]}}</div>' +
            '</div>' +
            '<!-- Table boyd end -->' +
          '</div>' +
          '<!-- Table end -->' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>'
});

(function () {
  if (!!app.views.rm) return;

  const _pattern = /\d,\d,\d*/g;

  let _timingTable = null;

  let _ctx = {};
  let _actions = {};
  let _eventsHandlers = {};

  let _components = [];

  $.extend(true, _eventsHandlers, {
    evaluateButton: function (e){
      let text = $("#rm-view-content #system-input-text").val();
      let activities = app.utils.parseSystem(text);
      _actions.fillResults(new RTSystem(activities));
    }
  });

  $.extend(true, _actions, {
    linkEvents: function (){
      $("#rm-view-content #system-input-button").on("click", _eventsHandlers.evaluateButton);
    },
    setComponent: function (ix, data){
      if (_components.length < (ix + 1)){
        /* Build components for each calculation */
        _components.push(new Vue({
          el: data.containerID,
          data: {
            item: {
              id: data.componentID,
              label: data.label,
              value: data.value,
              title: data.cotaClass,
              cotaClass: data.cotaClass
           }
         }
       }));
     }
     else
     {
       /* Values will update as soon as we change them */
       _components[ix].item.label= !!(data.label) ? data.label : '',
       _components[ix].item.value= !!(data.value) ? data.value : 0,
       _components[ix].item.title= !!(data.cotaClass) ? data.title : '',
       _components[ix].item.cotaClass= !!(data.cotaClass) ? data.cotaClass : ''
     }
    },
    showTiming: (system) => {
      let _taskTimings = [];
      let systemTimings = system.getTaskTiming();
      for (var i = 0; i < systemTimings.length; i++) {
        _taskTimings.push([i + 1, systemTimings[i]]);
      }

      if (_timingTable == null) {
        _timingTable = new Vue({
          el: '#timing-table',
          data: {
            rows: _taskTimings,
            columns: ['Tarea', 'Tiempo']
          }
        });
      }
      else {
        _timingTable.rows = _taskTimings;
      }
    },
    fillResults: function (system) {
      _ctx.currentSystem = system;

      _actions.setComponent(0, {
        containerID: '#hyperperiod-box',
        label: "Hiperperíodo",
        componentID: 'hyperperiod-input',
        value: math.round(system.getHyperperiod(), 4),
        title: '',
        cotaClass: ''
      });
      _actions.setComponent(1, {
        containerID: '#fu-box',
        label:"FU",
        componentID: 'fu-input',
        value: math.round(system.getFU(), 4),
        title: "",
        cotaClass: ''
      });
      _actions.setComponent(2, {
        containerID: '#n-box',
        componentID: 'n-input',
        label:"N",
        value: math.round(system.getN(), 4) ,
        title: "",
        cotaClass: ''
        });
      _actions.setComponent(3, {
        containerID: '#cota-liu-box',
        componentID: 'cota-liu-input',
        label:"Cota de Liu",
        value: math.round(system.getLiu(), 5),
        cotaClass: system.isValidForBini() ? "verifies-cota" : "fails-cota",
        title: system.isValidForLiu() ? "Verifica Liu" : "No verifica Liu",
        });
      _actions.setComponent(4, {
        containerID: '#cota-bini-box',
        componentID: 'cota-bini-input',
        label:"Cota de Bini",
        value: math.round(system.getBini(), 6),
        title: system.isValidForBini() ? "Verifica Bini" : "No verifica Bini",
        cotaClass: system.isValidForBini() ? "verifies-cota" : "fails-cota",
      });

      _actions.showTiming(system);
    }
  });

  let _init = function () {
    _actions.linkEvents();
  };

  app.views.rm = {
    init: _init
  };

})();
