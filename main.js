const documentationState = {
  isOpen: false,
};

const rerender = () => {
  if (documentationState.isOpen) {
    $("#view-documentation").html("Skjul dokumentasjon");
    $("#documentation-wrapper").fadeIn(100);
  } else {
    $("#view-documentation").html("Se dokumentasjon");
    $("#documentation-wrapper").fadeOut(100);
  }
};

$("#view-documentation").click(function () {
  documentationState.isOpen = !documentationState.isOpen;
  rerender();
});

rerender();
