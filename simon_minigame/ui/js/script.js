var game = {
  level: 1,
  turn: 0,
  difficulty: 0.5,
  score: 0,
  active: false,
  handler: false,
  shape: '.shape',
  genSequence: [],
  plaSequence: [],
  target: 10,

  init: function () {
    if (this.handler === false) {
      this.initPadHandler();
    }
    this.newGame();
  },

  initPadHandler: function () {
    that = this;
    $('.pad').on('mouseup', function () {
      if (that.active === true) {
        var pad = parseInt($(this).data('pad'), 10);
        that.flash($(this), 1, 300, pad);
        that.logPlayerSequence(pad);
      }
    });
    this.handler = true;
  },

  newGame: function () {
    this.level = 1;
    this.score = 0;
    this.newLevel();
    this.displayLevel();
    this.displayScore();
  },

  newLevel: function () {
    this.genSequence.length = 0;
    this.plaSequence.length = 0;
    this.pos = 0;
    this.turn = 0;
    this.active = true;
    this.randomizePad(this.level);
    this.displaySequence();
  },

  flash: function (element, times, speed, pad) {
    var that = this;
    if (times > 0) {
      that.playSound(pad);
      element.stop().animate({ opacity: '1' }, {
        duration: 50,
        complete: function () {
          element.stop().animate({ opacity: '0.6' }, 200);
        }
      });
    }

    if (times > 0) {
      setTimeout(function () {
        that.flash(element, times, speed, pad);
      }, speed);
      times -= 1;
    }
  },

  playSound: function (clip) {
    var sound = $('.sound' + clip)[0];
    sound.currentTime = 0;
    sound.play();
  },

  randomizePad: function (passes) {
    for (i = 0; i < passes; i++) {
      this.genSequence.push(Math.floor(Math.random() * 4) + 1);
    }
  },

  logPlayerSequence: function (pad) {
    this.plaSequence.push(pad);
    this.checkSequence(pad);
  },

  checkSequence: function (pad) {
    that = this;
    if (pad !== this.genSequence[this.turn]) {
      this.incorrectSequence();
    } else {
      this.keepScore();
      this.turn++;
    }

    if (this.turn === this.genSequence.length) {
      if (this.level == this.target) {
        this.targetReached()
        return
      }
      this.level++;
      this.displayLevel();
      this.active = false;
      setTimeout(function () {
        that.newLevel();
      }, 1000);
    }
  },

  targetReached: function () {
    setTimeout(function () {
      $.post('http://simon_minigame/success', JSON.stringify({}));
      $('.start').show();
    }, 1000)
  },

  displaySequence: function () {
    var that = this;
    $.each(this.genSequence, function (index, val) {
      setTimeout(function () {
        that.flash($(that.shape + val), 1, 300, val);
      }, 500 * index * that.difficulty);
    });
  },

  displayLevel: function () {
    $('.level h2').text('Level: ' + this.level);
  },

  displayScore: function () {
    $('.score h2').text('Score: ' + this.score);
  },

  keepScore: function () {
    var multiplier = 3;
    switch (this.difficulty) {
      case '2':
        multiplier = 1;
        break;

      case '1':
        multiplier = 2;
        break;

      case '0.5':
        multiplier = 3;
        break;

      case '0.25':
        multiplier = 4;
        break;
    }
    this.score += (1 * multiplier);
    this.displayScore();
  },

  //if user makes a mistake
  incorrectSequence: function () {
    var corPad = this.genSequence[this.turn],
      that = this;
    this.active = false;
    this.displayLevel();
    this.displayScore();

    setTimeout(function () {
      that.flash($(that.shape + corPad), 4, 300, corPad);
    }, 500);

    setTimeout(function () {
      $.post('http://simon_minigame/failed', JSON.stringify({
        'completeTurns': this.game.level - 1
      }));
      $('.start').show();
    }, 2000)
  }
};


$(function () {
  $('.start').on('mouseup', function () {				//initialise a game when the start button is clicked
    $(this).hide();
    $('.difficulty').hide();
    game.init();
  });
  function display(bool) {
    if (bool) {
      $(".wrapper").show();
    } else {
      $(".wrapper").hide();
    }
  }
  display(false)
  window.addEventListener('message', function (event) {
    var item = event.data;
    this.game.target = item.target
    if (item.type === "ui") {
      if (item.status == true) {
        display(true)
      } else {
        display(false)
      }
    }
  })

  // ESC key pressed
  document.onkeyup = function (data) {
    if (data.which == 27) {
      $.post('http://simon_minigame/failed', JSON.stringify({}));
      $('.start').show();
      return
    }
  };
})
