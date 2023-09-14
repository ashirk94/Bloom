const form = document.getElementById("form");
//new interests
const interest1Submit = document.getElementById("interest-submit1");
const interest2Submit = document.getElementById("interest-submit2");
const interest3Submit = document.getElementById("interest-submit3");
const interest4Submit = document.getElementById("interest-submit4");
const interest5Submit = document.getElementById("interest-submit5");

const resetBtn = document.getElementById("reset");

const error = document.getElementById("error");

resetBtn.addEventListener("click", () => {
  window.location.reload();
});

const items = document.querySelectorAll(".draggable");

function showElements() {
  setTimeout(() => {
    items.forEach((item) => {
      item.classList.remove("hidden");
    });
  }, 1500);
}

const draggables = document.getElementById("interest-group");

const interest1Container = document.getElementById("interest1-container");
const interest2Container = document.getElementById("interest2-container");
const interest3Container = document.getElementById("interest3-container");
const interest4Container = document.getElementById("interest4-container");
const interest5Container = document.getElementById("interest5-container");

const drake = dragula(
  [
    draggables,
    interest1Container,
    interest2Container,
    interest3Container,
    interest4Container,
    interest5Container,
  ],
  {
    isContainer: function (el) {
      return false; // only elements in drake.containers will be taken into account
    },
    moves: function (el, source, handle, sibling) {
      return true; // elements are always draggable by default
    },
    accepts: function (el, target, source, sibling) {
      return true; // elements can be dropped in any of the `containers` by default
    },
    invalid: function (el, handle) {
      return false; // don't prevent any drags from initiating by default
    },
    direction: "horizontal",
    copy: false, // elements are moved by default, not copied
    copySortSource: false, // elements in copy-source containers can be reordered
    revertOnSpill: true,
    removeOnSpill: false, // spilling will `.remove` the element, if this is true
    mirrorContainer: document.body, // set the element that gets mirror elements appended
    ignoreInputTextSelection: true, // allows users to select input text, see details below
    slideFactorX: 0, // allows users to select the amount of movement on the X axis before it is considered a drag instead of a click
    slideFactorY: 0, // allows users to select the amount of movement on the Y axis before it is considered a drag instead of a click
  },
);
drake.on("drag", function (el) {
  el.className = el.className.replace("ex-moved", "");
});
drake.on("drop", function (el, target, source) {
  //one item per box
  if (target.children.length > 1 && target.id !== "interest-group") {
    source.append(target.children[0]);
  }
  el.className += " ex-moved";
});
drake.on("over", function (el, container) {
  if (
    el !== container.children[container.children.length - 1] &&
    container.id !== "interest-group"
  ) {
    // otherwise: make it so
    container.appendChild(el);
  }
  container.className += " ex-over";
});
drake.on("out", function (el, container) {
  container.className = container.className.replace("ex-over", "");
});
drake.on("shadow", function (el, container) {
  if (container.children.length > 1 && container.id !== "interest-group") {
    container.children[1].classList.add("hidden");
  }
  // check if the shadow copy is not already the last child of the container
  if (
    el !== container.children[container.children.length - 1] &&
    container.id !== "interest-group"
  ) {
    // otherwise: make it so
    container.appendChild(el);
  }
  showElements();
});

function applyInterests() {
  if (document.getElementById("interest1-container").firstElementChild) {
    interest1Submit.value = document.getElementById(
      "interest1-container",
    ).firstElementChild.textContent;
  }
  if (document.getElementById("interest2-container").firstElementChild) {
    interest2Submit.value = document.getElementById(
      "interest2-container",
    ).firstElementChild.textContent;
  }
  if (document.getElementById("interest3-container").firstElementChild) {
    interest3Submit.value = document.getElementById(
      "interest3-container",
    ).firstElementChild.textContent;
  }
  if (document.getElementById("interest4-container").firstElementChild) {
    interest4Submit.value = document.getElementById(
      "interest4-container",
    ).firstElementChild.textContent;
  }
  if (document.getElementById("interest5-container").firstElementChild) {
    interest5Submit.value = document.getElementById(
      "interest5-container",
    ).firstElementChild.textContent;
  }
}

//submit data
form.addEventListener("submit", (e) => {
  e.preventDefault();
  applyInterests();
  if (interest1Submit.value === "") {
    error.textContent = "Please add a #1 interest";
  } else {
    form.submit();
  }
});
