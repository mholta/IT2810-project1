const svgGameState = {
  running: false,
};

const startSvgGame = () => {
  $("#svg-obstacle-animation")
    .attr("repeatCount", "indefinite")[0]
    .beginElement();

  $("#svg-start-text").css("opacity", "0");
  svgGameState.running = true;
};

const stopSvgGame = () => {
  $("#svg-obstacle-animation").attr("repeatCount", "1")[0].endElement();
};

$("#svg-wrapper").click(function () {
  if (svgGameState.running) {
    $("#svg-penguin-jump-animation")[0].beginElement();
  } else {
    startSvgGame();
  }
});

$("#svg-box").on({
  mouseenter: startSvgGame,
  mouseleave: stopSvgGame,
});
