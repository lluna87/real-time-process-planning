(function (){
  if (window.app) {
    return;
  }

  /* Flag to check for arrays */
  window.Array.prototype.isArray = true;

  /* Global classes */
  window.RTTask = function (c, t, d){
    /*
    C	Tiempo ejecucion
    T	Periodo
    D	Vencimiento
    */
    this.executionTime = typeof c == 'string' ? parseFloat(c) : c;
    this.period = typeof t == 'string' ? parseFloat(t) : t;
    this.expire = typeof d == 'string' ? parseFloat(d) : d;
    this.fu = this.period > 0 ? this.executionTime / this.period : 0;
  };

  window.RTSystem = function (tasks){
    if (!tasks.isArray){
      throw 'RTSystem: Parameter is not an array'
    }

    this.hyperperiod = null;

    this.tasks = tasks;

    this.getHyperperiod = function (){
      if (!!this.hyperperiod){
        return this.hyperperiod;
      }
      else {
        let periods = _.map(this.tasks, function(o){ return o.period; });
        this.hyperperiod = math.lcm.apply(null, periods);
        return this.hyperperiod;
      }
    };

    this.getFU = function (){
      if (!!this.fu) {
        return this.fu;
      }
      else {
        this.fu = math.sum(_.map(this.tasks, function(o){ return o.fu; }));
        return this.fu;
      }
    };

    this.getN = function (){
      if (!!this.n) {
        return this.n;
      }
      else {
        this.n = !!this.tasks ? this.tasks.length : 0;
        return this.n;
      }
    };

    this.getLiu = function (){
      if (!!this.liu) {
        return this.liu;
      }
      else {
        let n = this.getN();
        this.liu = math.round(n*(2^(1/n)-1), 2);
        return this.liu;
      }
    };

    this.isValidForLiu = function () {
      return this.getFU() <= this.getLiu();
    };

    this.getBini = function (){
      if (!!this.bini) {
        return this.bini;
      }
      else {
        this.bini = math.round(math.prod(_.map(this.tasks, function(o){ return o.fu + 1; })), 2);
        return this.bini;
      }
    };

    this.isValidForBini = function () {
      return this.getBini() <= 2;
    };
  };

  window.app =  {
    urls: {
      prolog: "api/prolog"
    },
    init: function (){
      let menuItems = $("#main-menu li.nav-item.partial-view");
      menuItems.on("click", window.app.events.onClick_navItem);
      menuItems.first().trigger("click");
    },
    events: {
      onClick_navItem: e => {
        e.preventDefault();
        $("li.nav-item").removeClass("active");
        let fileRoute = $(e.currentTarget).find("a").attr("href");
        if (fileRoute === "#" || fileRoute === ""){
          fileRoute = "views/missing.html"
        }
        window.app.utils.loadView(fileRoute);
        $(e.currentTarget).addClass("active");
      }
    },
    pl: {
      init: type => {
        return $.post(app.urls.prolog, JSON.stringify({prolog: type, name: "tnt_luna_etchezar.pl"}))
      },
      test: (type, id) => {
        const dest = {
          id: id,
          type: type,
          run: () => {
            return app.pl.runTest(type, id).then(v => {
              dest.ran = v === "yes.";
              return dest;
            });
          }
        };
        return app.pl.fetchTest(type,id).then(v => {
          dest.content = v;
          return app.pl.loadTest(type,id);
        }).then(v => {
          dest.loaded = v === "ok";
          return dest;
        });
      },
      fetchTest: (type, id) => {
        return $.get("statics/pl/tests/" +  type + "_" + id+ ".pl");
      },
      loadTest: (type, id) => {
        return $.post(app.urls.prolog, JSON.stringify({prolog: type, name: "tests/" + type + "_" + id + ".pl"}));
      },
      runTest: (type, id) => {
        return $.get(app.urls.prolog, {prolog: type, clause: "test_" + type + "_" + id + "."});
      },
      display: type => {
        return $.get(app.urls.prolog, {prolog: type, clause: "display_kb(A,B)."}).then(v => {
          debugger;
          const lines = v.split("\n");
          if(lines[0] === "yes.") {
            return lines[lines.length > 1 ? 1 : 0];
          }
          throw "Error running test: " + JSON.stringify({id: id, type: type});
        });
      }
    },
    utils: {
      loadView: (viewFile, containerId) => {
        let domId = containerId ? containerId : "page-content";
        $('#' + domId).load("views/" + viewFile);
      },
      initTestView: type => {
        const $content = $("#" + type + "-content");
        const $tests = $content.find("div.list-group>button");
        return app.pl.init(type).then(() => {
          return $.when.apply($,  $.makeArray($tests).map(e => $(e).data())
          .filter(data => !!data.id)
          .map(data => {
            return app.pl.test(data.type, data.id)
          })).then((...res) => {
            return res;
          })
        });
      },
      initTestList: type => {
        const $list = $("#" + type + "-test-list");
        const $items = $list.find("button");
        $items.on("click", e => {
          e.target.addClass("active");
          $items.forEach($e => $e.data().id !== e.target.data().id && $e.removeClass("active"));
        });
      }
    },
    views: {}
  };
})();
//# sourceURL=app.js
