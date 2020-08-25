eventListeners();

/*Event Listener */
function eventListeners() {
  let ui = new UI();

  document.addEventListener("DOMContentLoaded", function (event) {
    ui.showLinks();
  });

  document
    .querySelector(".hamburger-icon-wrapper")
    .addEventListener("click", function () {
      ui.navbarClick();
    });
  document.querySelector(".form").addEventListener("submit", function (event) {
    event.preventDefault();
    let input = document.querySelector(".input");
    ui.reduceLink(input.value);
  });
}

//constructor function UI
function UI() {}

UI.prototype.showLinks = function () {
  if (localStorage.getItem("links")) {
    let linksArr = JSON.parse(localStorage.getItem("links"));
    let formContainer = document.querySelector(".form-url-wrapper");

    linksArr.forEach(function (link) {
      let div = `
            <div class="form-url-item">
              <h5>${link.url}</h5>
            </div>
            <div class="form-url-item">
              <div class="form-url">
                <a href="https://rel.ink/${link.hashid}" target="_blank"> https://rel.ink/${link.hashid} </a>
                <button class="button-copy" > Copy </button>
              </div>
            </div>
            `;
      formContainer.innerHTML += div;
    });
  }
  let links = document.querySelectorAll(".form-url-item");

  links.forEach((link) => {
    link.addEventListener("click", function (event) {
      if (event.target.classList.value === "button-copy") {
        let codeToCopy = event.target.previousElementSibling;
        let selection = document.createRange();
        selection.selectNodeContents(codeToCopy);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(selection);
        let res = document.execCommand("copy");
        window.getSelection().removeRange(selection);

        event.target.classList.add("button-copied");
        event.target.innerHTML = "Copied!";

        setTimeout(() => {
          event.target.classList.remove("button-copied");
          event.target.innerHTML = "Copy";
        }, 1000);
      }
    });
  });
};

//Hide and show the dropdown menu
UI.prototype.navbarClick = function () {
  let navbar = document.querySelector(".nav-hamburger-wrapper");
  if (navbar.classList.contains("nav-show")) {
    navbar.classList.remove("nav-show");
  } else {
    navbar.classList.add("nav-show");
  }
};

UI.prototype.reduceLink = function (link) {
  shorten(link)
    .then((data) => {
      let answer = validate(data);
      if (answer) {
        addURL(data);
        saveLocalStorage(data);
      }
    })
    .catch((error) => console.log(error, "error"));

  async function shorten(link) {
    const shortId = await fetch(`https://rel.ink/api/links/?url=${link}`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        url: link,
      }),
    });
    const resData = await shortId.json();
    return resData;
  }

  function validate({
    url
  }) {

    if (url[0] === "This field may not be blank.") {
      showNotification("Please add a link", "error");
      return false;
    } else if (url[0] === "Enter a valid URL.") {
      showNotification("Enter a valid Link", "error");
      return false;
    }
    showNotification("The URL has been reduced", "success");
    clearInput();

    return true;
  }

  function addURL(data) {
    let formContainer = document.querySelector(".form-url-wrapper");
    let div = `
    <div class="form-url-item">
      <h5>${data.url}</h5>
    </div>
    <div class="form-url-item">
      <div class="form-url">
        <a href="https://rel.ink/${data.hashid}" target="_blank"> https://rel.ink/${data.hashid} </a>
        <button class="button-copy" > Copy </button>
      </div>
    </div>
    `;
    formContainer.innerHTML += div;

    let links = document.querySelectorAll(".form-url-item");

    links.forEach((link) => {
      link.addEventListener("click", function (event) {
        if (event.target.classList.value === "button-copy") {
          let codeToCopy = event.target.previousElementSibling;
          let selection = document.createRange();
          selection.selectNodeContents(codeToCopy);
          window.getSelection().removeAllRanges();
          window.getSelection().addRange(selection);
          let res = document.execCommand("copy");
          window.getSelection().removeRange(selection);

          event.target.classList.add("button-copied");
          event.target.innerHTML = "Copied!";

          setTimeout(() => {
            event.target.classList.remove("button-copied");
            event.target.innerHTML = "Copy";
          }, 1000);
        }
      });
    });
  }

  function showNotification(text, type) {
    let notification = document.querySelector(".notification");
    let box = document.querySelector("input");
    notification.innerHTML = text;
    notification.classList.add(type);
    box.classList.add(`${type}Input`);
    setTimeout(() => {
      notification.innerHTML = "";
      notification.classList.remove(type);
      box.classList.remove(`${type}Input`);
    }, 3000);
  }

  function clearInput() {
    document.querySelector(".input").value = "";
  }

  function saveLocalStorage(data) {
    if (localStorage.getItem("links")) {
      const linksArr = JSON.parse(localStorage.getItem("links"));
      linksArr.push(data);
      localStorage.setItem("links", JSON.stringify(linksArr));
    } else {
      const arr = [];
      arr.push(data);
      localStorage.setItem("links", JSON.stringify(arr));
    }
  }
};