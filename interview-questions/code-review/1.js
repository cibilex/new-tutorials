function initButtons() {
  var body = document.body,
    button,
    i;
  for (i = 0; i < 5; i++) {
    button = document.createElement("button");
    button.innerHTML = " Button" + i;
    button.addEventListener("click", () => {
      alert(i);
    });

    body.appendChild(button);
  }
}
initButtons();
