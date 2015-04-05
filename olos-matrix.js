(function(params){

  Polymer('olos-matrix', {

    volume: 0.5,
    on: false,
    started: false,
    color: '#00CCFF',
    width: 300,
    height: 100,
    rootfolder: '../olos-matrix/',

    // handle i/o
    input: null,

    // output data is an array
    output: [],

    breakpoints: [],

    // duration in seconds
    duration: 1,

    // nexusUI multi matrix
    nexusEl: null,

    publicMethods: ['publicAudio'],

    // gain node for control

    ready: function() {
      // nexus element
      this.nexusEl = this.matrix = nx.add("matrixExp", {w:300, h:300});
      document.body.removeChild(this.nexusEl.canvas);
      this.$.container.appendChild(this.nexusEl.canvas);

      this.publicAudio();

      this.output = [0];

      this.subscribers = [];
      // this.output.connect = function(input) {
      //   this.outputChanged = function() {
      //     input = this.output;
      //   }
      // }
    },

    start: function() {
      var self = this;
      this.nexusEl.on('*', function(val) {
        self.onStep(val.list);
      });
      this.nexusEl.sequence(this.matrix.bpm);
      this.started = true;
    },

    stop: function() {
      this.nexusEl.stop();
      this.started = false;
    },

    toggle: function() {
      if (this.started) {
        this.stop();
      } else {
        this.start();
      }
    },

    // these settings can be tweaked in the editor
    publicAudio: function() {
      this.matrix.row = 4;
      this.matrix.col = 4;
      this.matrix.bpm = 120;

      var scale = [60, 62, 65, 70];

      this.onStep = function(column) {
        if (typeof(column) !== 'undefined') {
          var output = new Array(column.length);
          for (var i = 0; i < column.length; i++) {
            if (column[i] > 0) {
              output[i] = scale[i];
            } else {
              output[i] = 0;
            }
          }
          this.output = output;
          this.fire('output-ready', this.output);
        }
      }
    },

    publicAudioChanged: function() {
      this.publicAudio();

      var matExp = this.matrix.matrixExp;

      // resets matrix data
      this.matrix.init();

      // map the original matrix data to the new matrix
      for (var i = 0; i < matExp.length; i++) {
        for (var j = 0; j < matExp[i].length; j++) {

          if (!this.matrix.matrixExp[i]) {
            this.matrix.matrixExp[i] = new Array(this.matrix.matrixExp[i-1][j].length);
          }

          if (this.matrix.matrixExp[i]) {
            // if (j < this.matrix.matrixExp.length) {
              this.matrix.matrixExp[i][j] = matExp[i][j];
            // }
          }
        }
      }

      this.matrix.draw();

    },

    outputChanged: function() {
      if (this.outputConnections) {
        for (var i = 0; i < this.outputConnections.length; i++) {
          // yes
          var inputName = this.outputConnections[i].destinationLabel;
          // console.log(this.outputConnections[i].destination[inputName]);
          this.outputConnections[i].destination[inputName] = this.output;

          // temporary fix
          this.outputConnections[i].destination.update();
        }
      }
    },


    animate: function() {
      // to do
    },

    dispose: function() {
      var self = this;

      // erase nexus element
      self.nexusEl.erase();
    },

  });

})();