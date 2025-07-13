(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function getHash() {
  if (location.hash) {
    return location.hash.replace("#", "");
  }
}
let slideUp = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("--slide")) {
    target.classList.add("--slide");
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = `${target.offsetHeight}px`;
    target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    window.setTimeout(() => {
      target.hidden = !showmore ? true : false;
      !showmore ? target.style.removeProperty("height") : null;
      target.style.removeProperty("padding-top");
      target.style.removeProperty("padding-bottom");
      target.style.removeProperty("margin-top");
      target.style.removeProperty("margin-bottom");
      !showmore ? target.style.removeProperty("overflow") : null;
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("--slide");
      document.dispatchEvent(
        new CustomEvent("slideUpDone", {
          detail: {
            target
          }
        })
      );
    }, duration);
  }
};
let slideDown = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("--slide")) {
    target.classList.add("--slide");
    target.hidden = target.hidden ? false : null;
    showmore ? target.style.removeProperty("height") : null;
    let height = target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    target.offsetHeight;
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = height + "px";
    target.style.removeProperty("padding-top");
    target.style.removeProperty("padding-bottom");
    target.style.removeProperty("margin-top");
    target.style.removeProperty("margin-bottom");
    window.setTimeout(() => {
      target.style.removeProperty("height");
      target.style.removeProperty("overflow");
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("--slide");
      document.dispatchEvent(
        new CustomEvent("slideDownDone", {
          detail: {
            target
          }
        })
      );
    }, duration);
  }
};
let slideToggle = (target, duration = 500) => {
  if (target.hidden) {
    return slideDown(target, duration);
  } else {
    return slideUp(target, duration);
  }
};
let bodyLockStatus = true;
let bodyLockToggle = (delay = 500) => {
  if (document.documentElement.hasAttribute("data-fls-scrolllock")) {
    bodyUnlock(delay);
  } else {
    bodyLock(delay);
  }
};
let bodyUnlock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    setTimeout(() => {
      lockPaddingElements.forEach((lockPaddingElement) => {
        lockPaddingElement.style.paddingRight = "";
      });
      document.body.style.paddingRight = "";
      document.documentElement.removeAttribute("data-fls-scrolllock");
    }, delay);
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
let bodyLock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    const lockPaddingValue = window.innerWidth - document.body.offsetWidth + "px";
    lockPaddingElements.forEach((lockPaddingElement) => {
      lockPaddingElement.style.paddingRight = lockPaddingValue;
    });
    document.body.style.paddingRight = lockPaddingValue;
    document.documentElement.setAttribute("data-fls-scrolllock", "");
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
function dataMediaQueries(array, dataSetValue) {
  const media = Array.from(array).filter((item) => item.dataset[dataSetValue]).map((item) => {
    const [value, type = "max"] = item.dataset[dataSetValue].split(",");
    return { value, type, item };
  });
  if (media.length === 0) return [];
  const breakpointsArray = media.map(
    ({ value, type }) => `(${type}-width: ${value}px),${value},${type}`
  );
  const uniqueQueries = [...new Set(breakpointsArray)];
  return uniqueQueries.map((query) => {
    const [mediaQuery, mediaBreakpoint, mediaType] = query.split(",");
    const matchMedia = window.matchMedia(mediaQuery);
    const itemsArray = media.filter(
      (item) => item.value === mediaBreakpoint && item.type === mediaType
    );
    return { itemsArray, matchMedia };
  });
}
const gotoBlock = (targetBlock, noHeader = false, speed = 500, offsetTop = 0) => {
  const targetBlockElement = document.querySelector(targetBlock);
  if (targetBlockElement) {
    let animation = function(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutQuad(
        timeElapsed,
        startPosition,
        distance,
        speed
      );
      window.scrollTo(0, run);
      if (timeElapsed < speed) requestAnimationFrame(animation);
    }, easeInOutQuad = function(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    };
    let headerItem = "";
    let headerItemHeight = 0;
    if (noHeader) {
      headerItem = "header.header";
      const headerElement = document.querySelector(headerItem);
      if (!headerElement.classList.contains("--header-scroll")) {
        headerElement.style.cssText = `transition-duration: 0s;`;
        headerElement.classList.add("--header-scroll");
        headerItemHeight = headerElement.offsetHeight;
        headerElement.classList.remove("--header-scroll");
        setTimeout(() => {
          headerElement.style.cssText = ``;
        }, 0);
      } else {
        headerItemHeight = headerElement.offsetHeight;
      }
    }
    if (document.documentElement.hasAttribute("[data-fls-menu-open]")) {
      bodyUnlock();
      document.documentElement.removeAttribute("[data-fls-menu-open]");
    }
    let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY;
    targetBlockElementPosition = headerItemHeight ? targetBlockElementPosition - headerItemHeight : targetBlockElementPosition;
    targetBlockElementPosition = offsetTop ? targetBlockElementPosition - offsetTop : targetBlockElementPosition;
    const startPosition = window.pageYOffset;
    const distance = targetBlockElementPosition - startPosition;
    let startTime = null;
    requestAnimationFrame(animation);
  }
};
function spollers() {
  const spollersArray = document.querySelectorAll("[data-fls-spollers]");
  if (spollersArray.length > 0) {
    let initSpollers = function(spollersArray2, matchMedia = false) {
      spollersArray2.forEach((spollersBlock) => {
        spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
        if (matchMedia.matches || !matchMedia) {
          spollersBlock.classList.add("--spoller-init");
          initSpollerBody(spollersBlock);
        } else {
          spollersBlock.classList.remove("--spoller-init");
          initSpollerBody(spollersBlock, false);
        }
      });
    }, initSpollerBody = function(spollersBlock, hideSpollerBody = true) {
      let spollerItems = spollersBlock.querySelectorAll("details");
      if (spollerItems.length) {
        spollerItems.forEach((spollerItem) => {
          let spollerTitle = spollerItem.querySelector("summary");
          if (hideSpollerBody) {
            spollerTitle.removeAttribute("tabindex");
            if (!spollerItem.hasAttribute("data-open")) {
              spollerItem.open = false;
              spollerTitle.nextElementSibling.hidden = true;
            } else {
              spollerTitle.classList.add("--spoller-active");
              spollerItem.open = true;
            }
          } else {
            spollerTitle.setAttribute("tabindex", "-1");
            spollerTitle.classList.remove("--spoller-active");
            spollerItem.open = true;
            spollerTitle.nextElementSibling.hidden = false;
          }
        });
      }
    }, setSpollerAction = function(e) {
      const el = e.target;
      if (el.closest("summary") && el.closest("[data-fls-spollers]")) {
        e.preventDefault();
        if (el.closest("[data-fls-spollers]").classList.contains("--spoller-init")) {
          const spollerTitle = el.closest("summary");
          const spollerBlock = spollerTitle.closest("details");
          const spollersBlock = spollerTitle.closest("[data-fls-spollers]");
          const oneSpoller = spollersBlock.hasAttribute("data-fls-spollers-one");
          const scrollSpoller = spollerBlock.hasAttribute("data-fls-spoller-scroll");
          const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
          if (!spollersBlock.querySelectorAll(".--slide").length) {
            if (oneSpoller && !spollerBlock.open) {
              hideSpollersBody(spollersBlock);
            }
            !spollerBlock.open ? spollerBlock.open = true : setTimeout(() => {
              spollerBlock.open = false;
            }, spollerSpeed);
            spollerTitle.classList.toggle("--spoller-active");
            slideToggle(spollerTitle.nextElementSibling, spollerSpeed);
            if (scrollSpoller && spollerTitle.classList.contains("--spoller-active")) {
              const scrollSpollerValue = spollerBlock.dataset.flsSpollerScroll;
              const scrollSpollerOffset = +scrollSpollerValue ? +scrollSpollerValue : 0;
              const scrollSpollerNoHeader = spollerBlock.hasAttribute("data-fls-spoller-scroll-noheader") ? document.querySelector(".header").offsetHeight : 0;
              window.scrollTo(
                {
                  top: spollerBlock.offsetTop - (scrollSpollerOffset + scrollSpollerNoHeader),
                  behavior: "smooth"
                }
              );
            }
          }
        }
      }
      if (!el.closest("[data-fls-spollers]")) {
        const spollersClose = document.querySelectorAll("[data-fls-spoller-close]");
        if (spollersClose.length) {
          spollersClose.forEach((spollerClose) => {
            const spollersBlock = spollerClose.closest("[data-fls-spollers]");
            const spollerCloseBlock = spollerClose.parentNode;
            if (spollersBlock.classList.contains("--spoller-init")) {
              const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
              spollerClose.classList.remove("--spoller-active");
              slideUp(spollerClose.nextElementSibling, spollerSpeed);
              setTimeout(() => {
                spollerCloseBlock.open = false;
              }, spollerSpeed);
            }
          });
        }
      }
    }, hideSpollersBody = function(spollersBlock) {
      const spollerActiveBlock = spollersBlock.querySelector("details[open]");
      if (spollerActiveBlock && !spollersBlock.querySelectorAll(".--slide").length) {
        const spollerActiveTitle = spollerActiveBlock.querySelector("summary");
        const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
        spollerActiveTitle.classList.remove("--spoller-active");
        slideUp(spollerActiveTitle.nextElementSibling, spollerSpeed);
        setTimeout(() => {
          spollerActiveBlock.open = false;
        }, spollerSpeed);
      }
    };
    document.addEventListener("click", setSpollerAction);
    const spollersRegular = Array.from(spollersArray).filter(function(item, index, self) {
      return !item.dataset.flsSpollers.split(",")[0];
    });
    if (spollersRegular.length) {
      initSpollers(spollersRegular);
    }
    let mdQueriesArray = dataMediaQueries(spollersArray, "flsSpollers");
    if (mdQueriesArray && mdQueriesArray.length) {
      mdQueriesArray.forEach((mdQueriesItem) => {
        mdQueriesItem.matchMedia.addEventListener("change", function() {
          initSpollers(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
        });
        initSpollers(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
      });
    }
  }
}
window.addEventListener("load", spollers);
function menuInit() {
  document.addEventListener("click", function(e) {
    if (bodyLockStatus && e.target.closest("[data-fls-menu]")) {
      bodyLockToggle();
      document.documentElement.toggleAttribute("data-fls-menu-open");
    }
  });
}
document.querySelector("[data-fls-menu]") ? window.addEventListener("load", menuInit) : null;
document.getElementById("search-icon-header");
const searchFormMobile = document.querySelector(".header-search__search-mobile");
document.addEventListener("click", function(e) {
  const clickedOnSearchIcon = e.target.closest("#search-icon-header");
  const clickedInsideSearchForm = e.target.closest(".header-search__search-mobile");
  if (clickedOnSearchIcon && searchFormMobile) {
    searchFormMobile.classList.toggle("show-on-mobile");
  } else if (!clickedInsideSearchForm && !clickedOnSearchIcon && searchFormMobile.classList.contains("show-on-mobile")) {
    searchFormMobile.classList.remove("show-on-mobile");
  }
});
function headerScroll() {
  const header = document.querySelector("[data-fls-header-scroll]");
  const headerShow = header.hasAttribute("data-fls-header-scroll-show");
  const headerShowTimer = header.dataset.flsScrollShow ? header.dataset.flsScrollShow : 500;
  const startPoint = header.dataset.flsHeader ? header.dataset.flsHeader : 1;
  let scrollDirection = 0;
  let timer;
  document.addEventListener("scroll", function(e) {
    const scrollTop = window.scrollY;
    clearTimeout(timer);
    if (scrollTop >= startPoint) {
      !header.classList.contains("--header-scroll") ? header.classList.add("--header-scroll") : null;
      if (headerShow) {
        if (scrollTop > scrollDirection) {
          header.classList.contains("--header-show") ? header.classList.remove("--header-show") : null;
        } else {
          !header.classList.contains("--header-show") ? header.classList.add("--header-show") : null;
        }
        timer = setTimeout(() => {
          !header.classList.contains("--header-show") ? header.classList.add("--header-show") : null;
        }, headerShowTimer);
      }
    } else {
      header.classList.contains("--header-scroll") ? header.classList.remove("--header-scroll") : null;
      if (headerShow) {
        header.classList.contains("--header-show") ? header.classList.remove("--header-show") : null;
      }
    }
    scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
  });
}
document.querySelector("[data-fls-header-scroll]") ? window.addEventListener("load", headerScroll) : null;
class DynamicAdapt {
  constructor() {
    this.type = "max";
    this.init();
  }
  init() {
    this.objects = [];
    this.daClassname = "--dynamic";
    this.nodes = [...document.querySelectorAll("[data-fls-dynamic]")];
    this.nodes.forEach((node) => {
      const data = node.dataset.flsDynamic.trim();
      const dataArray = data.split(`,`);
      const object = {};
      object.element = node;
      object.parent = node.parentNode;
      object.destinationParent = dataArray[3] ? node.closest(dataArray[3].trim()) || document : document;
      dataArray[3] ? dataArray[3].trim() : null;
      const objectSelector = dataArray[0] ? dataArray[0].trim() : null;
      if (objectSelector) {
        const foundDestination = object.destinationParent.querySelector(objectSelector);
        if (foundDestination) {
          object.destination = foundDestination;
        }
      }
      object.breakpoint = dataArray[1] ? dataArray[1].trim() : `767.98`;
      object.place = dataArray[2] ? dataArray[2].trim() : `last`;
      object.index = this.indexInParent(object.parent, object.element);
      this.objects.push(object);
    });
    this.arraySort(this.objects);
    this.mediaQueries = this.objects.map(({ breakpoint }) => `(${this.type}-width: ${breakpoint / 16}em),${breakpoint}`).filter((item, index, self) => self.indexOf(item) === index);
    this.mediaQueries.forEach((media) => {
      const mediaSplit = media.split(",");
      const matchMedia = window.matchMedia(mediaSplit[0]);
      const mediaBreakpoint = mediaSplit[1];
      const objectsFilter = this.objects.filter(({ breakpoint }) => breakpoint === mediaBreakpoint);
      matchMedia.addEventListener("change", () => {
        this.mediaHandler(matchMedia, objectsFilter);
      });
      this.mediaHandler(matchMedia, objectsFilter);
    });
  }
  mediaHandler(matchMedia, objects) {
    if (matchMedia.matches) {
      objects.forEach((object) => {
        if (object.destination) {
          this.moveTo(object.place, object.element, object.destination);
        }
      });
    } else {
      objects.forEach(({ parent, element, index }) => {
        if (element.classList.contains(this.daClassname)) {
          this.moveBack(parent, element, index);
        }
      });
    }
  }
  moveTo(place, element, destination) {
    element.classList.add(this.daClassname);
    const index = place === "last" || place === "first" ? place : parseInt(place, 10);
    if (index === "last" || index >= destination.children.length) {
      destination.append(element);
    } else if (index === "first") {
      destination.prepend(element);
    } else {
      destination.children[index].before(element);
    }
  }
  moveBack(parent, element, index) {
    element.classList.remove(this.daClassname);
    if (parent.children[index] !== void 0) {
      parent.children[index].before(element);
    } else {
      parent.append(element);
    }
  }
  indexInParent(parent, element) {
    return [...parent.children].indexOf(element);
  }
  arraySort(arr) {
    if (this.type === "min") {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === "first" || b.place === "last") {
            return -1;
          }
          if (a.place === "last" || b.place === "first") {
            return 1;
          }
          return 0;
        }
        return a.breakpoint - b.breakpoint;
      });
    } else {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === "first" || b.place === "last") {
            return 1;
          }
          if (a.place === "last" || b.place === "first") {
            return -1;
          }
          return 0;
        }
        return b.breakpoint - a.breakpoint;
      });
      return;
    }
  }
}
if (document.querySelector("[data-fls-dynamic]")) {
  window.addEventListener("load", () => new DynamicAdapt());
}
let formValidate = {
  getErrors(form) {
    let error = 0;
    let formRequiredItems = form.querySelectorAll("[required]");
    if (formRequiredItems.length) {
      formRequiredItems.forEach((formRequiredItem) => {
        if ((formRequiredItem.offsetParent !== null || formRequiredItem.tagName === "SELECT") && !formRequiredItem.disabled) {
          error += this.validateInput(formRequiredItem);
        }
      });
    }
    return error;
  },
  validateInput(formRequiredItem) {
    let error = 0;
    if (formRequiredItem.type === "email") {
      formRequiredItem.value = formRequiredItem.value.replace(" ", "");
      if (this.emailTest(formRequiredItem)) {
        this.addError(formRequiredItem);
        this.removeSuccess(formRequiredItem);
        error++;
      } else {
        this.removeError(formRequiredItem);
        this.addSuccess(formRequiredItem);
      }
    } else if (formRequiredItem.type === "checkbox" && !formRequiredItem.checked) {
      this.addError(formRequiredItem);
      this.removeSuccess(formRequiredItem);
      error++;
    } else {
      if (!formRequiredItem.value.trim()) {
        this.addError(formRequiredItem);
        this.removeSuccess(formRequiredItem);
        error++;
      } else {
        this.removeError(formRequiredItem);
        this.addSuccess(formRequiredItem);
      }
    }
    return error;
  },
  addError(formRequiredItem) {
    formRequiredItem.classList.add("--form-error");
    formRequiredItem.parentElement.classList.add("--form-error");
    let inputError = formRequiredItem.parentElement.querySelector("[data-fls-form-error]");
    if (inputError) formRequiredItem.parentElement.removeChild(inputError);
    if (formRequiredItem.dataset.flsFormErrtext) {
      formRequiredItem.parentElement.insertAdjacentHTML("beforeend", `<div data-fls-form-error>${formRequiredItem.dataset.flsFormErrtext}</div>`);
    }
  },
  removeError(formRequiredItem) {
    formRequiredItem.classList.remove("--form-error");
    formRequiredItem.parentElement.classList.remove("--form-error");
    if (formRequiredItem.parentElement.querySelector("[data-fls-form-error]")) {
      formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector("[data-fls-form-error]"));
    }
  },
  addSuccess(formRequiredItem) {
    formRequiredItem.classList.add("--form-success");
    formRequiredItem.parentElement.classList.add("--form-success");
  },
  removeSuccess(formRequiredItem) {
    formRequiredItem.classList.remove("--form-success");
    formRequiredItem.parentElement.classList.remove("--form-success");
  },
  formClean(form) {
    form.reset();
    setTimeout(() => {
      let inputs = form.querySelectorAll("input,textarea");
      for (let index = 0; index < inputs.length; index++) {
        const el = inputs[index];
        el.parentElement.classList.remove("--form-focus");
        el.classList.remove("--form-focus");
        formValidate.removeError(el);
      }
      let checkboxes = form.querySelectorAll('input[type="checkbox"]');
      if (checkboxes.length) {
        checkboxes.forEach((checkbox) => {
          checkbox.checked = false;
        });
      }
      if (window["flsSelect"]) {
        let selects = form.querySelectorAll("select[data-fls-select]");
        if (selects.length) {
          selects.forEach((select) => {
            window["flsSelect"].selectBuild(select);
          });
        }
      }
    }, 0);
  },
  emailTest(formRequiredItem) {
    return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
  }
};
function formInit() {
  function formSubmit() {
    const forms = document.forms;
    if (forms.length) {
      for (const form of forms) {
        !form.hasAttribute("data-fls-form-novalidate") ? form.setAttribute("novalidate", true) : null;
        form.addEventListener("submit", function(e) {
          const form2 = e.target;
          formSubmitAction(form2, e);
        });
        form.addEventListener("reset", function(e) {
          const form2 = e.target;
          formValidate.formClean(form2);
        });
      }
    }
    async function formSubmitAction(form, e) {
      const error = formValidate.getErrors(form);
      if (error === 0) {
        if (form.dataset.flsForm === "ajax") {
          e.preventDefault();
          const formAction = form.getAttribute("action") ? form.getAttribute("action").trim() : "#";
          const formMethod = form.getAttribute("method") ? form.getAttribute("method").trim() : "GET";
          const formData = new FormData(form);
          form.classList.add("--sending");
          const response = await fetch(formAction, {
            method: formMethod,
            body: formData
          });
          if (response.ok) {
            let responseResult = await response.json();
            form.classList.remove("--sending");
            formSent(form, responseResult);
          } else {
            form.classList.remove("--sending");
          }
        } else if (form.dataset.flsForm === "dev") {
          e.preventDefault();
          formSent(form);
        }
      } else {
        e.preventDefault();
        if (form.querySelector(".--form-error") && form.hasAttribute("data-fls-form-gotoerr")) {
          const formGoToErrorClass = form.dataset.flsFormGotoerr ? form.dataset.flsFormGotoerr : ".--form-error";
          gotoBlock(formGoToErrorClass);
        }
      }
    }
    function formSent(form, responseResult = ``) {
      document.dispatchEvent(new CustomEvent("formSent", {
        detail: {
          form
        }
      }));
      setTimeout(() => {
        if (window.flsPopup) {
          const popup = form.dataset.flsFormPopup;
          popup ? window.flsPopup.open(popup) : null;
        }
      }, 0);
      formValidate.formClean(form);
    }
  }
  function formFieldsInit() {
    document.body.addEventListener("focusin", function(e) {
      const targetElement = e.target;
      if (targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA") {
        if (!targetElement.hasAttribute("data-fls-form-nofocus")) {
          targetElement.classList.add("--form-focus");
          targetElement.parentElement.classList.add("--form-focus");
        }
        formValidate.removeError(targetElement);
        targetElement.hasAttribute("data-fls-form-validatenow") ? formValidate.removeError(targetElement) : null;
      }
    });
    document.body.addEventListener("focusout", function(e) {
      const targetElement = e.target;
      if (targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA") {
        if (!targetElement.hasAttribute("data-fls-form-nofocus")) {
          targetElement.classList.remove("--form-focus");
          targetElement.parentElement.classList.remove("--form-focus");
        }
        targetElement.hasAttribute("data-fls-form-validatenow") ? formValidate.validateInput(targetElement) : null;
      }
    });
  }
  formSubmit();
  formFieldsInit();
}
document.querySelector("[data-fls-form]") ? window.addEventListener("load", formInit) : null;
function pageNavigation() {
  document.addEventListener("click", pageNavigationAction);
  document.addEventListener("watcherCallback", pageNavigationAction);
  function pageNavigationAction(e) {
    if (e.type === "click") {
      const targetElement = e.target;
      if (targetElement.closest("[data-fls-scrollto]")) {
        const gotoLink = targetElement.closest("[data-fls-scrollto]");
        const gotoSelector = gotoLink.dataset.flsScrollto || "";
        const noHeader = gotoLink.hasAttribute(
          "data-fls-scrollto-header"
        );
        const speed = parseInt(gotoLink.dataset.flsScrolltoSpeed) || 1200;
        const offsetTop = parseInt(gotoLink.dataset.flsScrolltoTop) || 0;
        gotoBlock(gotoSelector, noHeader, speed, offsetTop);
        if (document.documentElement.classList.contains("menu-open")) {
          bodyUnlock();
          document.documentElement.classList.remove("menu-open");
        }
        e.preventDefault();
      }
    } else if (e.type === "watcherCallback" && e.detail) {
      const entry = e.detail.entry;
      const target = entry.target;
      if (target.dataset.flsWatcher === "navigator") {
        const activeItem = document.querySelector(
          `[data-fls-scrollto]._navigator-active`
        );
        let currentItem;
        if (target.id) {
          currentItem = document.querySelector(
            `[data-fls-scrollto="#${target.id}"]`
          );
        } else if (target.classList.length) {
          for (let cls of target.classList) {
            const found = document.querySelector(
              `[data-fls-scrollto=".${cls}"]`
            );
            if (found) {
              currentItem = found;
              break;
            }
          }
        }
        if (entry.isIntersecting) {
          activeItem == null ? void 0 : activeItem.classList.remove("_navigator-active");
          currentItem == null ? void 0 : currentItem.classList.add("_navigator-active");
        } else {
          currentItem == null ? void 0 : currentItem.classList.remove("_navigator-active");
        }
      }
    }
  }
  if (getHash()) {
    const hash = getHash();
    const goToSelector = document.querySelector(`#${hash}`) ? `#${hash}` : document.querySelector(`.${hash}`) ? `.${hash}` : null;
    if (goToSelector) gotoBlock(goToSelector);
  }
}
window.addEventListener("load", pageNavigation);
const products = {
  product1: {
    titleProduct: "URBAN VIBE",
    imgProduct: "assets/img/h1.jpg",
    ratingProduct: 5,
    style: "casual",
    type: "hu",
    priceProduct: {
      startPrice: 300,
      sale: 15
      // залишено
    },
    descriptionProduct: "Street-ready and crafted for the everyday explorer."
  },
  product2: {
    titleProduct: "PURE FORM",
    imgProduct: "assets/img/h2.jpg",
    ratingProduct: 3.5,
    style: "party",
    type: "hu",
    priceProduct: {
      startPrice: 150,
      sale: 0
    },
    descriptionProduct: "Clean shape, bold attitude. Simplicity with impact."
  },
  product3: {
    titleProduct: "QUIET MOTION",
    imgProduct: "assets/img/h3.jpg",
    ratingProduct: 4.5,
    style: "party",
    type: "hu",
    priceProduct: {
      startPrice: 190,
      sale: 10
    },
    descriptionProduct: "Effortless cool for those who move with confidence."
  },
  product4: {
    titleProduct: "TRUE LAYER",
    imgProduct: "assets/img/h4.jpg",
    ratingProduct: 2.5,
    style: "gym",
    type: "hu",
    priceProduct: {
      startPrice: 80,
      sale: 50
      // залишено
    },
    descriptionProduct: "Light, flexible, and always ready for the next move."
  },
  product5: {
    titleProduct: "TRUE LAYER",
    imgProduct: "assets/img/h5.jpg",
    ratingProduct: 5,
    style: "formal",
    type: "hu",
    priceProduct: {
      startPrice: 120,
      sale: 0
      // прибрано знижку
    },
    descriptionProduct: "Layered elegance with subtle structure for a refined finish."
  },
  product6: {
    titleProduct: "URBAN ESSENCE",
    imgProduct: "assets/img/h6.jpg",
    ratingProduct: 4,
    style: "party",
    type: "hu",
    priceProduct: {
      startPrice: 140,
      sale: 0
    },
    descriptionProduct: "Essence of the city—confident, dynamic, and bold in every step."
  },
  product7: {
    titleProduct: "SOFT RHYTHM",
    imgProduct: "assets/img/h7.jpg",
    ratingProduct: 3.5,
    style: "formal",
    type: "hu",
    priceProduct: {
      startPrice: 300,
      sale: 40
      // нова знижка
    },
    descriptionProduct: "Gentle lines meet smooth motion in a refined expression of style."
  },
  product8: {
    titleProduct: "CLEAR OUTLINE",
    imgProduct: "assets/img/h8.jpg",
    ratingProduct: 4.5,
    style: "casual",
    type: "hu",
    priceProduct: {
      startPrice: 120,
      sale: 0
    },
    descriptionProduct: "Refined design with a modern touch. Perfect for clean, structured looks with minimal effort."
  },
  product9: {
    titleProduct: "EVERYDAY CODE",
    imgProduct: "assets/img/h9.jpg",
    ratingProduct: 3,
    style: "gym",
    type: "hu",
    priceProduct: {
      startPrice: 75,
      sale: 0
    },
    descriptionProduct: "Designed for active lifestyles and daily ease. Simple and functional for every occasion."
  },
  product10: {
    titleProduct: "SILENT MOOD",
    imgProduct: "assets/img/h10.jpg",
    ratingProduct: 5,
    style: "formal",
    type: "hu",
    priceProduct: {
      startPrice: 260,
      sale: 15
    },
    descriptionProduct: "A subtle and elegant piece that speaks quietly but leaves a strong impression."
  },
  product11: {
    titleProduct: "NATURAL FLOW",
    imgProduct: "assets/img/h11.jpg",
    ratingProduct: 2.5,
    style: "party",
    type: "hu",
    priceProduct: {
      startPrice: 60,
      sale: 25
      // нова знижка
    },
    descriptionProduct: "Soft lines and fluid style meet relaxed confidence in this standout piece."
  },
  product12: {
    titleProduct: "BASIC PULSE",
    imgProduct: "assets/img/h12.jpg",
    ratingProduct: 4,
    style: "casual",
    type: "hu",
    priceProduct: {
      startPrice: 145,
      sale: 0
    },
    descriptionProduct: "Foundational and timeless, crafted to complement any mood or setting with ease."
  },
  product13: {
    titleProduct: "SIMPLE SHIFT",
    imgProduct: "assets/img/h13.jpg",
    ratingProduct: 3.5,
    style: "gym",
    type: "hu",
    priceProduct: {
      startPrice: 85,
      sale: 0
    },
    descriptionProduct: "Built for movement and versatility. A smart option for dynamic routines and chill moments."
  },
  product14: {
    titleProduct: "CALM VISION",
    imgProduct: "assets/img/h14.jpg",
    ratingProduct: 1.5,
    style: "formal",
    type: "hu",
    priceProduct: {
      startPrice: 210,
      sale: 40
    },
    descriptionProduct: "Tranquil tones meet bold precision. Ideal for confident yet understated outfits."
  },
  product15: {
    titleProduct: "ESSENTIAL TOUCH",
    imgProduct: "assets/img/h15.jpg",
    ratingProduct: 5,
    style: "party",
    type: "hu",
    priceProduct: {
      startPrice: 275,
      sale: 0
      // знижку прибрано
    },
    descriptionProduct: "Stand out effortlessly with refined design and statement-making elegance."
  },
  product16: {
    titleProduct: "DEEP SENSE",
    imgProduct: "assets/img/h16.jpg",
    ratingProduct: 2,
    style: "casual",
    type: "hu",
    priceProduct: {
      startPrice: 95,
      sale: 35
      // нова знижка
    },
    descriptionProduct: "A grounded piece with emotional depth and a naturally relaxed vibe."
  },
  //jeans
  product17: {
    titleProduct: "SUBTLE MARK",
    imgProduct: "assets/img/j1.jpg",
    ratingProduct: 4,
    style: "casual",
    type: "je",
    priceProduct: {
      startPrice: 110,
      sale: 0
    },
    descriptionProduct: "Delicate design that leaves a lasting impression."
  },
  product18: {
    titleProduct: "CLEAN LINE",
    imgProduct: "assets/img/j2.jpg",
    ratingProduct: 3.5,
    style: "formal",
    type: "je",
    priceProduct: {
      startPrice: 190,
      sale: 30
    },
    descriptionProduct: "Minimalistic cut with maximum impact."
  },
  product19: {
    titleProduct: "HONEST FRAME",
    imgProduct: "assets/img/j3.jpg",
    ratingProduct: 4.5,
    style: "party",
    type: "je",
    priceProduct: {
      startPrice: 165,
      sale: 0
    },
    descriptionProduct: "Bold structure that stays true to its form."
  },
  product20: {
    titleProduct: "NEUTRAL GROUND",
    imgProduct: "assets/img/j4.jpg",
    ratingProduct: 2.5,
    style: "casual",
    type: "je",
    priceProduct: {
      startPrice: 130,
      sale: 0
    },
    descriptionProduct: "Versatile tone for every occasion."
  },
  product21: {
    titleProduct: "FOCUS POINT",
    imgProduct: "assets/img/j5.jpg",
    ratingProduct: 5,
    style: "party",
    type: "je",
    priceProduct: {
      startPrice: 150,
      sale: 0
    },
    descriptionProduct: "Designed to draw eyes and attention."
  },
  product22: {
    titleProduct: "CLEAR SIGNAL",
    imgProduct: "assets/img/j6.jpg",
    ratingProduct: 4,
    style: "formal",
    type: "je",
    priceProduct: {
      startPrice: 210,
      sale: 25
    },
    descriptionProduct: "Unambiguous and confident—no noise, just clarity."
  },
  product23: {
    titleProduct: "OPEN FIELD",
    imgProduct: "assets/img/j7.jpg",
    ratingProduct: 3,
    style: "gym",
    type: "je",
    priceProduct: {
      startPrice: 100,
      sale: 0
    },
    descriptionProduct: "Freedom to move, breathe, and be."
  },
  product24: {
    titleProduct: "WARM PRESENCE",
    imgProduct: "assets/img/j8.jpg",
    ratingProduct: 4.5,
    style: "casual",
    type: "je",
    priceProduct: {
      startPrice: 135,
      sale: 0
    },
    descriptionProduct: "Inviting tones and soft feel for all-day wear."
  },
  product25: {
    titleProduct: "SOFT ECHO",
    imgProduct: "assets/img/j9.jpg",
    ratingProduct: 2,
    style: "party",
    type: "je",
    priceProduct: {
      startPrice: 90,
      sale: 40
    },
    descriptionProduct: "Subtle design that resonates deeply."
  },
  product26: {
    titleProduct: "CORE FEELING",
    imgProduct: "assets/img/j10.jpg",
    ratingProduct: 4,
    style: "gym",
    type: "je",
    priceProduct: {
      startPrice: 115,
      sale: 0
    },
    descriptionProduct: "Built around comfort and focused intention."
  },
  product27: {
    titleProduct: "PLAIN ENERGY",
    imgProduct: "assets/img/j11.jpg",
    ratingProduct: 3.5,
    style: "casual",
    type: "je",
    priceProduct: {
      startPrice: 125,
      sale: 0
    },
    descriptionProduct: "Simple outside, charged within."
  },
  product28: {
    titleProduct: "LIGHT FRAME",
    imgProduct: "assets/img/j12.jpg",
    ratingProduct: 5,
    style: "formal",
    type: "je",
    priceProduct: {
      startPrice: 195,
      sale: 20
    },
    descriptionProduct: "Structure that feels weightless and modern."
  },
  product29: {
    titleProduct: "SILENT FLOW",
    imgProduct: "assets/img/j13.jpg",
    ratingProduct: 2.5,
    style: "gym",
    type: "je",
    priceProduct: {
      startPrice: 105,
      sale: 0
    },
    descriptionProduct: "Moves with you in complete silence and comfort."
  },
  product30: {
    titleProduct: "STILL CURVE",
    imgProduct: "assets/img/j14.jpg",
    ratingProduct: 4.5,
    style: "casual",
    type: "je",
    priceProduct: {
      startPrice: 140,
      sale: 0
    },
    descriptionProduct: "A calm silhouette with natural flow."
  },
  product31: {
    titleProduct: "SOFT PATH",
    imgProduct: "assets/img/j15.jpg",
    ratingProduct: 3,
    style: "party",
    type: "je",
    priceProduct: {
      startPrice: 155,
      sale: 35
    },
    descriptionProduct: "Comfort meets style on your journey."
  },
  product32: {
    titleProduct: "HIDDEN DETAIL",
    imgProduct: "assets/img/j16.jpg",
    ratingProduct: 4,
    style: "formal",
    type: "je",
    priceProduct: {
      startPrice: 220,
      sale: 0
    },
    descriptionProduct: "Sophistication that rewards a closer look."
  },
  //shorts
  product33: {
    titleProduct: "BREEZE EDGE",
    imgProduct: "assets/img/shorts1.jpg",
    ratingProduct: 4,
    style: "casual",
    type: "sh",
    priceProduct: {
      startPrice: 110,
      sale: 0
    },
    descriptionProduct: "Light and breathable for everyday comfort."
  },
  product34: {
    titleProduct: "STREET LAYER",
    imgProduct: "assets/img/shorts2.jpg",
    ratingProduct: 3.5,
    style: "party",
    type: "sh",
    priceProduct: {
      startPrice: 145,
      sale: 20
    },
    descriptionProduct: "Urban cool meets relaxed energy."
  },
  product35: {
    titleProduct: "RAW CUT",
    imgProduct: "assets/img/shorts3.jpg",
    ratingProduct: 2.5,
    style: "gym",
    type: "sh",
    priceProduct: {
      startPrice: 90,
      sale: 0
    },
    descriptionProduct: "Functional edges and athletic intent."
  },
  product36: {
    titleProduct: "OPEN STRUCTURE",
    imgProduct: "assets/img/shorts4.jpg",
    ratingProduct: 4.5,
    style: "casual",
    type: "sh",
    priceProduct: {
      startPrice: 130,
      sale: 0
    },
    descriptionProduct: "For movement, breathability, and freedom."
  },
  product37: {
    titleProduct: "SHADED FLOW",
    imgProduct: "assets/img/shorts5.jpg",
    ratingProduct: 3,
    style: "formal",
    type: "sh",
    priceProduct: {
      startPrice: 155,
      sale: 25
    },
    descriptionProduct: "Soft tones blended with crisp tailoring."
  },
  product38: {
    titleProduct: "STILL POINT",
    imgProduct: "assets/img/shorts6.jpg",
    ratingProduct: 2,
    style: "party",
    type: "sh",
    priceProduct: {
      startPrice: 105,
      sale: 0
    },
    descriptionProduct: "Minimal yet bold in design."
  },
  product39: {
    titleProduct: "CROSS MOVE",
    imgProduct: "assets/img/shorts7.jpg",
    ratingProduct: 4,
    style: "gym",
    type: "sh",
    priceProduct: {
      startPrice: 100,
      sale: 0
    },
    descriptionProduct: "Built for dynamic transitions and motion."
  },
  product40: {
    titleProduct: "ESSENCE FRAME",
    imgProduct: "assets/img/shorts8.jpg",
    ratingProduct: 5,
    style: "casual",
    type: "sh",
    priceProduct: {
      startPrice: 160,
      sale: 15
    },
    descriptionProduct: "Balanced details for smart simplicity."
  },
  product41: {
    titleProduct: "QUIET MARK",
    imgProduct: "assets/img/shorts9.jpg",
    ratingProduct: 2.5,
    style: "formal",
    type: "sh",
    priceProduct: {
      startPrice: 170,
      sale: 0
    },
    descriptionProduct: "Low-key design that leaves a strong message."
  },
  product42: {
    titleProduct: "ACTIVE LINE",
    imgProduct: "assets/img/shorts10.jpg",
    ratingProduct: 4.5,
    style: "gym",
    type: "sh",
    priceProduct: {
      startPrice: 125,
      sale: 0
    },
    descriptionProduct: "Streamlined and made to move."
  },
  product43: {
    titleProduct: "SOLID FEEL",
    imgProduct: "assets/img/shorts11.jpg",
    ratingProduct: 3.5,
    style: "party",
    type: "sh",
    priceProduct: {
      startPrice: 140,
      sale: 0
    },
    descriptionProduct: "Confidence through every step."
  },
  product44: {
    titleProduct: "MODERN SHADE",
    imgProduct: "assets/img/shorts12.jpg",
    ratingProduct: 4,
    style: "casual",
    type: "sh",
    priceProduct: {
      startPrice: 150,
      sale: 10
    },
    descriptionProduct: "Classic meets contemporary with subtle flair."
  },
  product45: {
    titleProduct: "HARD LINE",
    imgProduct: "assets/img/shorts13.jpg",
    ratingProduct: 3,
    style: "formal",
    type: "sh",
    priceProduct: {
      startPrice: 180,
      sale: 0
    },
    descriptionProduct: "Strong silhouette for confident styling."
  },
  product46: {
    titleProduct: "COOL PULSE",
    imgProduct: "assets/img/shorts14.jpg",
    ratingProduct: 5,
    style: "gym",
    type: "sh",
    priceProduct: {
      startPrice: 135,
      sale: 0
    },
    descriptionProduct: "Energetic and always in rhythm."
  },
  product47: {
    titleProduct: "SOFT TRACE",
    imgProduct: "assets/img/shorts15.jpg",
    ratingProduct: 4.5,
    style: "party",
    type: "sh",
    priceProduct: {
      startPrice: 160,
      sale: 0
    },
    descriptionProduct: "Details that linger in memory."
  },
  product48: {
    titleProduct: "WIDE PRESENCE",
    imgProduct: "assets/img/shorts16.jpg",
    ratingProduct: 3.5,
    style: "casual",
    type: "sh",
    priceProduct: {
      startPrice: 125,
      sale: 0
    },
    descriptionProduct: "Roomy fit with assertive character."
  },
  product49: {
    titleProduct: "DRY CUT",
    imgProduct: "assets/img/shorts17.jpg",
    ratingProduct: 2,
    style: "formal",
    type: "sh",
    priceProduct: {
      startPrice: 145,
      sale: 0
    },
    descriptionProduct: "Precision cut, minimal distraction."
  },
  product50: {
    titleProduct: "CLEAR TOUCH",
    imgProduct: "assets/img/shorts18.jpg",
    ratingProduct: 5,
    style: "party",
    type: "sh",
    priceProduct: {
      startPrice: 170,
      sale: 30
    },
    descriptionProduct: "Sleek feel with confident finish."
  },
  product51: {
    titleProduct: "STEADY GROUND",
    imgProduct: "assets/img/shorts19.jpg",
    ratingProduct: 3,
    style: "gym",
    type: "sh",
    priceProduct: {
      startPrice: 110,
      sale: 0
    },
    descriptionProduct: "Secure fit and durable design."
  },
  product52: {
    titleProduct: "CORE EDGE",
    imgProduct: "assets/img/shorts20.jpg",
    ratingProduct: 2.5,
    style: "casual",
    type: "sh",
    priceProduct: {
      startPrice: 120,
      sale: 0
    },
    descriptionProduct: "Classic lines with modern punch."
  },
  product53: {
    titleProduct: "FIRM LAYER",
    imgProduct: "assets/img/shorts21.jpg",
    ratingProduct: 4.5,
    style: "formal",
    type: "sh",
    priceProduct: {
      startPrice: 185,
      sale: 0
    },
    descriptionProduct: "Structured yet flexible design for versatile wear."
  },
  product54: {
    titleProduct: "FAST MARK",
    imgProduct: "assets/img/shorts22.jpg",
    ratingProduct: 3.5,
    style: "gym",
    type: "sh",
    priceProduct: {
      startPrice: 115,
      sale: 0
    },
    descriptionProduct: "Built for speed and comfort."
  },
  product55: {
    titleProduct: "NEUTRAL TOUCH",
    imgProduct: "assets/img/shorts23.jpg",
    ratingProduct: 4,
    style: "casual",
    type: "sh",
    priceProduct: {
      startPrice: 130,
      sale: 15
    },
    descriptionProduct: "Designed to blend, built to impress."
  },
  //shirts
  product56: {
    titleProduct: "MOTION BASE",
    imgProduct: "assets/img/si1.jpg",
    ratingProduct: 4,
    style: "gym",
    type: "si",
    priceProduct: {
      startPrice: 140,
      sale: 0
    },
    descriptionProduct: "Engineered for energy and performance."
  },
  product57: {
    titleProduct: "CLEAN FORM",
    imgProduct: "assets/img/si2.jpg",
    ratingProduct: 3.5,
    style: "formal",
    type: "si",
    priceProduct: {
      startPrice: 175,
      sale: 0
    },
    descriptionProduct: "Simplicity refined with structured tailoring."
  },
  product58: {
    titleProduct: "CLEAR TRACE",
    imgProduct: "assets/img/si3.jpg",
    ratingProduct: 2.5,
    style: "party",
    type: "si",
    priceProduct: {
      startPrice: 120,
      sale: 10
    },
    descriptionProduct: "Distinct pattern with quiet presence."
  },
  product59: {
    titleProduct: "BALANCED MOTION",
    imgProduct: "assets/img/si4.jpg",
    ratingProduct: 4.5,
    style: "casual",
    type: "si",
    priceProduct: {
      startPrice: 130,
      sale: 0
    },
    descriptionProduct: "Adaptable design for everyday rhythm."
  },
  product60: {
    titleProduct: "SHARP CURVE",
    imgProduct: "assets/img/si5.jpg",
    ratingProduct: 3,
    style: "party",
    type: "si",
    priceProduct: {
      startPrice: 150,
      sale: 20
    },
    descriptionProduct: "Edgy yet sleek — ideal for statement looks."
  },
  product61: {
    titleProduct: "DEEP TEXTURE",
    imgProduct: "assets/img/si6.jpg",
    ratingProduct: 2,
    style: "gym",
    type: "si",
    priceProduct: {
      startPrice: 110,
      sale: 0
    },
    descriptionProduct: "Layered comfort with tactile appeal."
  },
  product62: {
    titleProduct: "CIRCLE VISION",
    imgProduct: "assets/img/si7.jpg",
    ratingProduct: 4,
    style: "formal",
    type: "si",
    priceProduct: {
      startPrice: 165,
      sale: 0
    },
    descriptionProduct: "Rounded elegance that defines modern class."
  },
  product63: {
    titleProduct: "LOW SIGNAL",
    imgProduct: "assets/img/si8.jpg",
    ratingProduct: 5,
    style: "casual",
    type: "si",
    priceProduct: {
      startPrice: 135,
      sale: 15
    },
    descriptionProduct: "Understated but impactful."
  },
  product64: {
    titleProduct: "FIRM LINES",
    imgProduct: "assets/img/si9.jpg",
    ratingProduct: 2.5,
    style: "formal",
    type: "si",
    priceProduct: {
      startPrice: 180,
      sale: 0
    },
    descriptionProduct: "Sharp definition with refined form."
  },
  product65: {
    titleProduct: "NEAT ANGLE",
    imgProduct: "assets/img/si10.jpg",
    ratingProduct: 4.5,
    style: "party",
    type: "si",
    priceProduct: {
      startPrice: 155,
      sale: 0
    },
    descriptionProduct: "Clean angles designed to catch the light."
  },
  product66: {
    titleProduct: "DYNAMIC TONE",
    imgProduct: "assets/img/si11.jpg",
    ratingProduct: 3.5,
    style: "gym",
    type: "si",
    priceProduct: {
      startPrice: 125,
      sale: 0
    },
    descriptionProduct: "Moves with you — with flair and flow."
  },
  product67: {
    titleProduct: "SOFT GRID",
    imgProduct: "assets/img/si12.jpg",
    ratingProduct: 4,
    style: "casual",
    type: "si",
    priceProduct: {
      startPrice: 145,
      sale: 5
    },
    descriptionProduct: "Comfort layered with subtle pattern."
  },
  product68: {
    titleProduct: "CENTER FIELD",
    imgProduct: "assets/img/si13.jpg",
    ratingProduct: 3,
    style: "formal",
    type: "si",
    priceProduct: {
      startPrice: 190,
      sale: 0
    },
    descriptionProduct: "Command attention with modern focus."
  },
  product69: {
    titleProduct: "FLUID EDGE",
    imgProduct: "assets/img/si14.jpg",
    ratingProduct: 5,
    style: "party",
    type: "si",
    priceProduct: {
      startPrice: 160,
      sale: 0
    },
    descriptionProduct: "Edges smoothed for standout occasions."
  },
  product70: {
    titleProduct: "SILENT FIELD",
    imgProduct: "assets/img/si15.jpg",
    ratingProduct: 4.5,
    style: "casual",
    type: "si",
    priceProduct: {
      startPrice: 150,
      sale: 0
    },
    descriptionProduct: "Quiet tones that carry strength."
  },
  product71: {
    titleProduct: "GRAVITY MARK",
    imgProduct: "assets/img/si16.jpg",
    ratingProduct: 3.5,
    style: "gym",
    type: "si",
    priceProduct: {
      startPrice: 115,
      sale: 0
    },
    descriptionProduct: "Weightless feel with grounded purpose."
  },
  product72: {
    titleProduct: "LINE SHIFT",
    imgProduct: "assets/img/si17.jpg",
    ratingProduct: 2,
    style: "formal",
    type: "si",
    priceProduct: {
      startPrice: 170,
      sale: 10
    },
    descriptionProduct: "Tailored refinement with a dynamic edge."
  },
  product73: {
    titleProduct: "OPEN RHYTHM",
    imgProduct: "assets/img/si18.jpg",
    ratingProduct: 4.5,
    style: "party",
    type: "si",
    priceProduct: {
      startPrice: 160,
      sale: 0
    },
    descriptionProduct: "Designed for movement, styled for nights."
  },
  product74: {
    titleProduct: "TACTILE WAVE",
    imgProduct: "assets/img/si19.jpg",
    ratingProduct: 3,
    style: "casual",
    type: "si",
    priceProduct: {
      startPrice: 135,
      sale: 0
    },
    descriptionProduct: "Touch-friendly textures and modern feel."
  },
  product75: {
    titleProduct: "QUIET FORM",
    imgProduct: "assets/img/si20.jpg",
    ratingProduct: 2.5,
    style: "formal",
    type: "si",
    priceProduct: {
      startPrice: 185,
      sale: 0
    },
    descriptionProduct: "Discreet design for refined environments."
  },
  product76: {
    titleProduct: "FLAT CORE",
    imgProduct: "assets/img/si21.jpg",
    ratingProduct: 4,
    style: "gym",
    type: "si",
    priceProduct: {
      startPrice: 120,
      sale: 0
    },
    descriptionProduct: "Minimal shape. Maximum comfort."
  },
  product77: {
    titleProduct: "COLD SHADE",
    imgProduct: "assets/img/si22.jpg",
    ratingProduct: 5,
    style: "party",
    type: "si",
    priceProduct: {
      startPrice: 175,
      sale: 25
    },
    descriptionProduct: "Cool finish for bold evenings."
  },
  product78: {
    titleProduct: "CLEAN STANCE",
    imgProduct: "assets/img/si23.jpg",
    ratingProduct: 3.5,
    style: "casual",
    type: "si",
    priceProduct: {
      startPrice: 140,
      sale: 0
    },
    descriptionProduct: "Straightforward design with timeless appeal."
  },
  product79: {
    titleProduct: "FLEXED VIEW",
    imgProduct: "assets/img/si24.jpg",
    ratingProduct: 4,
    style: "gym",
    type: "si",
    priceProduct: {
      startPrice: 135,
      sale: 0
    },
    descriptionProduct: "Built for movement, designed to endure."
  },
  product80: {
    titleProduct: "EASY CODE",
    imgProduct: "assets/img/si25.jpg",
    ratingProduct: 2,
    style: "formal",
    type: "si",
    priceProduct: {
      startPrice: 150,
      sale: 0
    },
    descriptionProduct: "Effortless and smart from every angle."
  },
  //T-short
  product81: {
    titleProduct: "LINE SHADE",
    imgProduct: "assets/img/ts1.jpg",
    ratingProduct: 4,
    style: "casual",
    type: "ts",
    priceProduct: {
      startPrice: 90,
      sale: 0
    },
    descriptionProduct: "Clean lines with muted tones for daily wear."
  },
  product82: {
    titleProduct: "BOLD THOUGHT",
    imgProduct: "assets/img/ts2.jpg",
    ratingProduct: 3.5,
    style: "party",
    type: "ts",
    priceProduct: {
      startPrice: 100,
      sale: 15
    },
    descriptionProduct: "Graphic clarity meets confident design."
  },
  product83: {
    titleProduct: "SOFT TRACE",
    imgProduct: "assets/img/ts3.jpg",
    ratingProduct: 4.5,
    style: "casual",
    type: "ts",
    priceProduct: {
      startPrice: 85,
      sale: 0
    },
    descriptionProduct: "Comfortable feel with smooth print."
  },
  product84: {
    titleProduct: "QUIET FOCUS",
    imgProduct: "assets/img/ts5.jpg",
    ratingProduct: 2.5,
    style: "gym",
    type: "ts",
    priceProduct: {
      startPrice: 75,
      sale: 0
    },
    descriptionProduct: "Minimalism that lets you move freely."
  },
  product85: {
    titleProduct: "HIGH CONTRAST",
    imgProduct: "assets/img/ts6.jpg",
    ratingProduct: 5,
    style: "party",
    type: "ts",
    priceProduct: {
      startPrice: 120,
      sale: 20
    },
    descriptionProduct: "Loud and bold. Made to be seen."
  },
  product86: {
    titleProduct: "LIGHT FOCUS",
    imgProduct: "assets/img/ts7.jpg",
    ratingProduct: 3,
    style: "casual",
    type: "ts",
    priceProduct: {
      startPrice: 70,
      sale: 0
    },
    descriptionProduct: "Relaxed fit for effortless moments."
  },
  product87: {
    titleProduct: "TONAL GROUND",
    imgProduct: "assets/img/ts8.jpg",
    ratingProduct: 4.5,
    style: "formal",
    type: "ts",
    priceProduct: {
      startPrice: 110,
      sale: 0
    },
    descriptionProduct: "Balanced tones for clean presentation."
  },
  product88: {
    titleProduct: "NEON MARK",
    imgProduct: "assets/img/ts9.jpg",
    ratingProduct: 3.5,
    style: "party",
    type: "ts",
    priceProduct: {
      startPrice: 95,
      sale: 0
    },
    descriptionProduct: "Electric hues for energetic nights."
  },
  product89: {
    titleProduct: "SOFT DEPTH",
    imgProduct: "assets/img/ts10.jpg",
    ratingProduct: 4,
    style: "casual",
    type: "ts",
    priceProduct: {
      startPrice: 88,
      sale: 0
    },
    descriptionProduct: "Depth in design with smooth layering."
  },
  product90: {
    titleProduct: "GRIT TEXT",
    imgProduct: "assets/img/ts11.jpg",
    ratingProduct: 2.5,
    style: "gym",
    type: "ts",
    priceProduct: {
      startPrice: 65,
      sale: 0
    },
    descriptionProduct: "Worn look with bold messaging."
  },
  product91: {
    titleProduct: "FLAT SIGNAL",
    imgProduct: "assets/img/ts12.jpg",
    ratingProduct: 4,
    style: "formal",
    type: "ts",
    priceProduct: {
      startPrice: 130,
      sale: 0
    },
    descriptionProduct: "Minimal contrast for serious tone."
  },
  product92: {
    titleProduct: "URBAN PULSE",
    imgProduct: "assets/img/ts13.jpg",
    ratingProduct: 3,
    style: "party",
    type: "ts",
    priceProduct: {
      startPrice: 105,
      sale: 0
    },
    descriptionProduct: "Street-ready print for fast-paced living."
  },
  product93: {
    titleProduct: "SOFT PIXEL",
    imgProduct: "assets/img/ts14.jpg",
    ratingProduct: 4.5,
    style: "casual",
    type: "ts",
    priceProduct: {
      startPrice: 98,
      sale: 10
    },
    descriptionProduct: "Blended digital art with subtle expression."
  },
  product94: {
    titleProduct: "MODERN SYMBOL",
    imgProduct: "assets/img/ts15.jpg",
    ratingProduct: 5,
    style: "formal",
    type: "ts",
    priceProduct: {
      startPrice: 125,
      sale: 0
    },
    descriptionProduct: "Iconic detailing for sleek environments."
  },
  product95: {
    titleProduct: "SIMPLE RHYTHM",
    imgProduct: "assets/img/ts16.jpg",
    ratingProduct: 3.5,
    style: "gym",
    type: "ts",
    priceProduct: {
      startPrice: 85,
      sale: 0
    },
    descriptionProduct: "Built to move. Built to last."
  },
  product96: {
    titleProduct: "STATIC FIELD",
    imgProduct: "assets/img/ts17.jpg",
    ratingProduct: 2,
    style: "party",
    type: "ts",
    priceProduct: {
      startPrice: 100,
      sale: 0
    },
    descriptionProduct: "Visual noise with a punch of attitude."
  },
  product97: {
    titleProduct: "SILENT LINE",
    imgProduct: "assets/img/ts18.jpg",
    ratingProduct: 4,
    style: "casual",
    type: "ts",
    priceProduct: {
      startPrice: 90,
      sale: 0
    },
    descriptionProduct: "Clean and quiet for minimal moments."
  },
  product98: {
    titleProduct: "LIGHT FLOW",
    imgProduct: "assets/img/ts19.jpg",
    ratingProduct: 4.5,
    style: "gym",
    type: "ts",
    priceProduct: {
      startPrice: 77,
      sale: 5
    },
    descriptionProduct: "Moves with your body, not against it."
  },
  product99: {
    titleProduct: "BOLD INPUT",
    imgProduct: "assets/img/ts20.jpg",
    ratingProduct: 3,
    style: "party",
    type: "ts",
    priceProduct: {
      startPrice: 115,
      sale: 0
    },
    descriptionProduct: "Statement design for confident energy."
  },
  product100: {
    titleProduct: "GRAPHIC CORE",
    imgProduct: "assets/img/ts21.jpg",
    ratingProduct: 5,
    style: "casual",
    type: "ts",
    priceProduct: {
      startPrice: 99,
      sale: 0
    },
    descriptionProduct: "Visual balance at the center of style."
  },
  product101: {
    titleProduct: "OPEN TEXTURE",
    imgProduct: "assets/img/ts22.jpg",
    ratingProduct: 3.5,
    style: "formal",
    type: "ts",
    priceProduct: {
      startPrice: 135,
      sale: 0
    },
    descriptionProduct: "Refined touch for elevated looks."
  },
  product102: {
    titleProduct: "NOISE SHIFT",
    imgProduct: "assets/img/ts23.jpg",
    ratingProduct: 2.5,
    style: "party",
    type: "ts",
    priceProduct: {
      startPrice: 110,
      sale: 0
    },
    descriptionProduct: "Controlled chaos with standout edge."
  },
  product103: {
    titleProduct: "CALM POWER",
    imgProduct: "assets/img/ts24.jpg",
    ratingProduct: 4,
    style: "casual",
    type: "ts",
    priceProduct: {
      startPrice: 92,
      sale: 0
    },
    descriptionProduct: "Understated strength with soft presence."
  }
};
const newArrivals = [
  products.product32,
  products.product35,
  products.product57,
  products.product3,
  products.product84,
  products.product58,
  products.product11,
  products.product32
];
const topSelling = [
  products.product5,
  products.product30,
  products.product56,
  products.product34,
  products.product36,
  products.product14,
  products.product92,
  products.product29
];
function createEl(tag, className = null) {
  const el = document.createElement(tag);
  if (className) {
    if (Array.isArray(className)) {
      el.classList.add(...className);
    } else {
      el.className = className;
    }
  }
  return el;
}
class ConstructionOfTheCard {
  constructor(product) {
    this.title = product.titleProduct;
    this.image = product.imgProduct;
    this.rating = product.ratingProduct;
    this.price = product.priceProduct;
    this.description = product.descriptionProduct;
  }
  // Використовуємо винесену функцію
  get Price() {
    const cardPrice = createEl("div", "cards__price");
    if (this.price.sale === 0)
      cardPrice.textContent = "$" + this.price.startPrice;
    else {
      cardPrice.textContent = "$" + Math.ceil(
        this.price.startPrice - this.price.startPrice * this.price.sale / 100
      );
      const discant = createEl("span", "cards__prics-discount");
      discant.textContent = "$" + this.price.startPrice;
      const discantPercent = createEl("span");
      discantPercent.textContent = "-" + this.price.sale + "%";
      discant.append(discantPercent);
      cardPrice.append(discant);
    }
    return cardPrice;
  }
  renderCard(el) {
    const cardWrapper = createEl("a", "cards__item");
    const imageWrapper = createEl("div", "cards__image");
    const image = createEl("img");
    image.src = this.image;
    image.alt = this.title;
    imageWrapper.append(image);
    cardWrapper.append(imageWrapper);
    const titleCard = createEl("div", "cards__title");
    titleCard.textContent = this.title;
    cardWrapper.append(titleCard);
    const ratingDiv = createEl("div", "cards__rating");
    const ratingStars = createEl("div", "rating-stars");
    const fullStars = Math.floor(this.rating);
    const halfStar = this.rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    for (let i = 0; i < fullStars; i++) {
      const star = createEl("span", "--icon-fullStar");
      ratingStars.append(star);
    }
    if (halfStar) {
      const half = createEl("span", "--icon-halfStar");
      ratingStars.append(half);
    }
    for (let i = 0; i < emptyStars; i++) {
      const empty = createEl("span", "");
      ratingStars.append(empty);
    }
    ratingDiv.append(ratingStars);
    const ratingDigital = createEl("span", "rating-didgital");
    ratingDigital.textContent = this.rating + "/5";
    ratingDiv.append(ratingDigital);
    cardWrapper.append(ratingDiv);
    cardWrapper.append(this.Price);
    cardWrapper.addEventListener("click", (e) => {
      e.preventDefault();
      sessionStorage.setItem(
        "selectedProduct",
        JSON.stringify({
          title: this.title,
          image: this.image,
          price: this.price,
          rating: this.rating,
          description: this.description
        })
      );
      window.location.href = "productDetailIndex.html";
    });
    if (el) el.append(cardWrapper);
    return cardWrapper;
  }
}
class BlockWithCarts {
  constructor(products2, fatherEl, mod) {
    this.products = products2;
    this.mod = mod;
    this.visibleCount = products2.length;
    const fatherBlock = document.getElementsByClassName(fatherEl)[0];
    if (fatherBlock) {
      this.fatherEl = fatherBlock;
    } else {
      console.log(`error: .${fatherEl} not found`);
      return;
    }
    this.cardsWrapper = this.fatherEl.querySelector(".cards__items");
    this.button = this.fatherEl.querySelector(".cards__view-all");
    this.paginationWrapper = this.fatherEl.querySelector(".pegging");
    this.paginationPages = this.fatherEl.querySelector(".pegging__pages");
    this.btnNext = this.fatherEl.querySelector(".pegging__next");
    this.btnPrev = this.fatherEl.querySelector(".pegging__back");
    this.cardsPerPage = 10;
    this.currentPage = 1;
    if (this.mod === "preview") {
      this.initialCardsCount = window.innerWidth >= 1780 ? 5 : 4;
    }
    if (this.button) {
      this.button.addEventListener("click", () => this.showAllCards());
    }
    if (this.btnNext) {
      this.btnNext.addEventListener("click", () => {
        if (this.currentPage < this.getTotalPages()) {
          this.setPage(this.currentPage + 1);
        }
      });
    }
    if (this.btnPrev) {
      this.btnPrev.addEventListener("click", () => {
        if (this.currentPage > 1) {
          this.setPage(this.currentPage - 1);
        }
      });
    }
  }
  result() {
    if (this.mod === "preview") {
      this.createFromStart();
    } else {
      this.setPage(1);
    }
  }
  createFromStart() {
    this.clearCards();
    for (let i = 0; i < this.initialCardsCount; i++) {
      const card = new ConstructionOfTheCard(this.products[i]);
      const cardEl = card.renderCard();
      this.cardsWrapper.append(cardEl);
      setTimeout(() => cardEl.classList.add("show"), 50);
    }
  }
  showAllCards() {
    const alreadyRenderedCount = this.cardsWrapper.children.length;
    for (let i = alreadyRenderedCount; i < this.products.length; i++) {
      const card = new ConstructionOfTheCard(this.products[i]);
      const cardEl = card.renderCard();
      this.cardsWrapper.append(cardEl);
      setTimeout(() => cardEl.classList.add("show"), 50);
    }
    this.renderedCount = this.products.length;
    if (this.button) this.button.style.display = "none";
  }
  clearCards() {
    if (this.cardsWrapper) this.cardsWrapper.innerHTML = "";
    if (this.button) this.button.style.display = "";
  }
  // Pagination logic
  getTotalPages() {
    return Math.ceil(this.products.length / this.cardsPerPage);
  }
  setPage(pageNumber) {
    this.currentPage = pageNumber;
    this.clearCards();
    this.renderCurrentPage();
    this.renderPagination();
  }
  renderCurrentPage() {
    const start = (this.currentPage - 1) * this.cardsPerPage;
    const end = start + this.cardsPerPage;
    const pageProducts = this.products.slice(start, end);
    pageProducts.forEach((product) => {
      const card = new ConstructionOfTheCard(product);
      const cardEl = card.renderCard();
      this.cardsWrapper.append(cardEl);
      setTimeout(() => cardEl.classList.add("show"), 50);
    });
  }
  renderPagination() {
    if (!this.paginationPages) return;
    const totalPages = this.getTotalPages();
    this.paginationPages.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.classList.add("pegging__page");
      btn.setAttribute("data-fls-scrollto", ".catalog__address");
      btn.setAttribute("data-fls-scrollto-header", "");
      if (i === this.currentPage) btn.classList.add("active");
      btn.textContent = i;
      btn.addEventListener("click", () => this.setPage(i));
      this.paginationPages.appendChild(btn);
    }
  }
}
function updateCartIcon() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartIcon = document.querySelector(".cart-active");
  if (!cartIcon) return;
  const totalQuantity = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 1),
    0
  );
  if (totalQuantity > 0) {
    cartIcon.classList.remove("--hiden");
    cartIcon.textContent = totalQuantity;
  } else {
    cartIcon.classList.add("--hiden");
    cartIcon.textContent = "";
  }
}
document.addEventListener("DOMContentLoaded", () => {
  updateCartIcon();
});
window.addEventListener("storage", (event) => {
  if (event.key === "cart") {
    updateCartIcon();
  }
});
export {
  BlockWithCarts as B,
  slideDown as a,
  slideToggle as b,
  createEl as c,
  dataMediaQueries as d,
  formValidate as f,
  newArrivals as n,
  products as p,
  slideUp as s,
  topSelling as t,
  updateCartIcon as u
};
