Vue.component('report-input', {
    props: ['item'],
    template:
     '<div class="row">' +
      '<div class="container">' +
        '<div class="caption">' +
          '<div class="input-label row">{{item.label}}</div>' +
          '<div class="hyperperiod-input row">' +
          '<input id="{{item.id}}" type="text" class="form-control hyperperiod-input" style="width: 10vw;"/>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>'
});

(function () {
  if (!!app.views.rm) return;

  const _pattern = /\d,\d,\d*/g;

  let _ctx = {};

  let _actions = {};

  let _eventsHandlers = {};

  $.extend(true, _eventsHandlers, {
    evaluateButton: function (e){
      let text = $("#rm-view-content #system-input-text").val();

      let activities = [];
      let res;
      do {
        res = _pattern.exec(text);
        if (!!res){
          let parameters = res[0].split(',');
          activities.push(new RTTask(parameters[0], parameters[1], parameters[2]));
        }
      } while (res);

      _actions.fillResults(new RTSystem(activities));
    }
  });

  $.extend(true, _actions, {
    linkEvents: function (){
      $("#rm-view-content #system-input-button").on("click", _eventsHandlers.evaluateButton);
    },
    fillResults: function (system) {
      _ctx.currentSystem = system;

      new Vue({ el: '#hyperperiod-box', data: { item: { id: 'hyperperiod-input', label:"Hiperperíodo", value: system.getHyperperiod() } } });
      new Vue({ el: '#fu-box', data: { item: { id: 'fu-input', label:"FU", value: system.getFU() } } });
      new Vue({ el: '#n-box', data: { item: { id: 'n-input', label:"N", value: system.getN() } } });
      new Vue({ el: '#cota-liu-box', data: { item: { id: 'cota-liu-input', label:"Cota de Liu", value: system.getLiu() } } });
      new Vue({ el: '#cota-bini-box', data: { item: { id: 'cota-bini-input', label:"Cota de Bini", value: system.getBini() } } });
    }
  });

  let _init = function () {
    _actions.linkEvents();
  };

  app.views.rm = {
    init: _init
  };

})();
