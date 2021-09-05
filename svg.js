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

$("#svg-button").click(function () {
  if (svgGameState.running) {
    $("#svg-penguin-jump-animation")[0].beginElement();
  } else {
    startSvgGame();
  }
});
$("#svg-button").mousedown(function () {
  $("#svg-button").attr("r", 30 * 0.9);
});
$("#svg-button").mouseup(function () {
  $("#svg-button").attr("r", 30 * 1);
});

$("#svg-box").on({
  mouseenter: startSvgGame,
  mouseleave: stopSvgGame,
});
