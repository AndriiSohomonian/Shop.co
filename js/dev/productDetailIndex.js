import { d as dataMediaQueries, s as slideUp, a as slideDown, B as BlockWithCarts, t as topSelling, c as createEl, u as updateCartIcon } from "./app.min.js";
import "./rating.min.js";
import "./quantity.min.js";
/* empty css             */
function showMore() {
  const showMoreBlocks = document.querySelectorAll("[data-fls-showmore]");
  let showMoreBlocksRegular;
  let mdQueriesArray;
  if (showMoreBlocks.length) {
    showMoreBlocksRegular = Array.from(showMoreBlocks).filter(function(item, index, self) {
      return !item.dataset.flsShowmoreMedia;
    });
    showMoreBlocksRegular.length ? initItems(showMoreBlocksRegular) : null;
    document.addEventListener("click", showMoreActions);
    window.addEventListener("resize", showMoreActions);
    mdQueriesArray = dataMediaQueries(showMoreBlocks, "showmoreMedia");
    if (mdQueriesArray && mdQueriesArray.length) {
      mdQueriesArray.forEach((mdQueriesItem) => {
        mdQueriesItem.matchMedia.addEventListener("change", function() {
          initItems(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
        });
      });
      initItemsMedia(mdQueriesArray);
    }
  }
  function initItemsMedia(mdQueriesArray2) {
    mdQueriesArray2.forEach((mdQueriesItem) => {
      initItems(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
    });
  }
  function initItems(showMoreBlocks2, matchMedia) {
    showMoreBlocks2.forEach((showMoreBlock) => {
      initItem(showMoreBlock, matchMedia);
    });
  }
  function initItem(showMoreBlock, matchMedia = false) {
    showMoreBlock = matchMedia ? showMoreBlock.item : showMoreBlock;
    let showMoreContent = showMoreBlock.querySelectorAll("[data-fls-showmore-content]");
    let showMoreButton = showMoreBlock.querySelectorAll("[data-fls-showmore-button]");
    showMoreContent = Array.from(showMoreContent).filter((item) => item.closest("[data-fls-showmore]") === showMoreBlock)[0];
    showMoreButton = Array.from(showMoreButton).filter((item) => item.closest("[data-fls-showmore]") === showMoreBlock)[0];
    const hiddenHeight = getHeight(showMoreBlock, showMoreContent);
    if (matchMedia.matches || !matchMedia) {
      if (hiddenHeight < getOriginalHeight(showMoreContent)) {
        slideUp(showMoreContent, 0, showMoreBlock.classList.contains("--showmore-active") ? getOriginalHeight(showMoreContent) : hiddenHeight);
        showMoreButton.hidden = false;
      } else {
        slideDown(showMoreContent, 0, hiddenHeight);
        showMoreButton.hidden = true;
      }
    } else {
      slideDown(showMoreContent, 0, hiddenHeight);
      showMoreButton.hidden = true;
    }
  }
  function getHeight(showMoreBlock, showMoreContent) {
    let hiddenHeight = 0;
    const showMoreType = showMoreBlock.dataset.flsShowmore ? showMoreBlock.dataset.flsShowmore : "size";
    const rowGap = parseFloat(getComputedStyle(showMoreContent).rowGap) ? parseFloat(getComputedStyle(showMoreContent).rowGap) : 0;
    if (showMoreType === "items") {
      const showMoreTypeValue = showMoreContent.dataset.flsShowmoreContent ? showMoreContent.dataset.flsShowmoreContent : 3;
      const showMoreItems = showMoreContent.children;
      for (let index = 1; index < showMoreItems.length; index++) {
        const showMoreItem = showMoreItems[index - 1];
        const marginTop = parseFloat(getComputedStyle(showMoreItem).marginTop) ? parseFloat(getComputedStyle(showMoreItem).marginTop) : 0;
        const marginBottom = parseFloat(getComputedStyle(showMoreItem).marginBottom) ? parseFloat(getComputedStyle(showMoreItem).marginBottom) : 0;
        hiddenHeight += showMoreItem.offsetHeight + marginTop;
        if (index == showMoreTypeValue) break;
        hiddenHeight += marginBottom;
      }
      rowGap ? hiddenHeight += (showMoreTypeValue - 1) * rowGap : null;
    } else {
      const showMoreTypeValue = showMoreContent.dataset.flsShowmoreContent ? showMoreContent.dataset.flsShowmoreContent : 150;
      hiddenHeight = showMoreTypeValue;
    }
    return hiddenHeight;
  }
  function getOriginalHeight(showMoreContent) {
    let parentHidden;
    let hiddenHeight = showMoreContent.offsetHeight;
    showMoreContent.style.removeProperty("height");
    if (showMoreContent.closest(`[hidden]`)) {
      parentHidden = showMoreContent.closest(`[hidden]`);
      parentHidden.hidden = false;
    }
    let originalHeight = showMoreContent.offsetHeight;
    parentHidden ? parentHidden.hidden = true : null;
    showMoreContent.style.height = `${hiddenHeight}px`;
    return originalHeight;
  }
  function showMoreActions(e) {
    const targetEvent = e.target;
    const targetType = e.type;
    if (targetType === "click") {
      if (targetEvent.closest("[data-fls-showmore-button]")) {
        const showMoreButton = targetEvent.closest("[data-fls-showmore-button]");
        const showMoreBlock = showMoreButton.closest("[data-fls-showmore]");
        const showMoreContent = showMoreBlock.querySelector("[data-fls-showmore-content]");
        const showMoreSpeed = showMoreBlock.dataset.flsShowmoreButton ? showMoreBlock.dataset.flsShowmoreButton : "500";
        const hiddenHeight = getHeight(showMoreBlock, showMoreContent);
        if (!showMoreContent.classList.contains("--slide")) {
          showMoreBlock.classList.contains("--showmore-active") ? slideUp(showMoreContent, showMoreSpeed, hiddenHeight) : slideDown(showMoreContent, showMoreSpeed, hiddenHeight);
          showMoreBlock.classList.toggle("--showmore-active");
        }
      }
    } else if (targetType === "resize") {
      showMoreBlocksRegular && showMoreBlocksRegular.length ? initItems(showMoreBlocksRegular) : null;
      mdQueriesArray && mdQueriesArray.length ? initItemsMedia(mdQueriesArray) : null;
    }
  }
}
window.addEventListener("load", showMore);
const product = JSON.parse(sessionStorage.getItem("selectedProduct"));
class SetPage {
  constructor(product2) {
    this.title = product2.title;
    this.image = product2.image;
    this.price = product2.price;
    this.rating = product2.rating;
    this.description = product2.description;
    const addressPage = document.querySelector(".detail__address-span");
    addressPage.textContent = this.title;
  }
  setTitle() {
    const title = document.querySelector(".detail__title");
    title.textContent = this.title;
  }
  setImage() {
    const images = document.querySelectorAll(".currentImage");
    images.forEach((img) => {
      img.src = this.image;
    });
  }
  setPrice() {
    const price = document.querySelector(".cards__price");
    if (this.price.sale === 0) {
      price.textContent = "$" + this.price.startPrice;
    } else {
      price.textContent = "$" + Math.ceil(this.price.startPrice - this.price.startPrice * this.price.sale / 100);
      const discant = createEl("span", "cards__prics-discount");
      discant.textContent = "$" + this.price.startPrice;
      const discantPercent = createEl("span");
      discantPercent.textContent = "-" + this.price.sale + "%";
      discant.append(discantPercent);
      price.append(discant);
    }
  }
  setRating() {
    const rating = document.querySelector(".cards__rating");
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
    rating.append(ratingStars);
    const ratingDigital = document.querySelector(".rating-didgital");
    ratingDigital.textContent = this.rating + "/5";
    rating.append(ratingDigital);
  }
  setDescription() {
    const description = document.querySelector(".detail__about");
    description.textContent = this.description;
  }
  setPage() {
    this.setTitle();
    this.setImage();
    this.setPrice();
    this.setRating();
    this.setDescription();
  }
}
new SetPage(product).setPage();
const selling = new BlockWithCarts(topSelling, "also-like__content", "preview");
selling.result();
function addItemToCart(newItem) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const itemKey = `${newItem.title}_${newItem.color}_${newItem.size}`;
  let existingItem = cart.find(
    (item) => `${item.title}_${item.color}_${item.size}` === itemKey
  );
  if (existingItem) {
    existingItem.quantity += newItem.quantity;
  } else {
    cart.push(newItem);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  if (typeof updateCartSummary === "function") {
    updateCartSummary(cart);
  }
  if (typeof updateCartIcon === "function") {
    updateCartIcon();
  }
  const emptyMsg = document.getElementById("empty-cart-message");
  if (emptyMsg) emptyMsg.remove();
}
function getInputs() {
  const selectedColor = document.querySelector('.detail__color input[type="radio"]:checked');
  const colorValue = selectedColor ? selectedColor.value : null;
  const selectedSize = document.querySelector('.detail__prise input[type="radio"]:checked');
  const sizeValue = selectedSize ? selectedSize.value : null;
  const quantityInput = document.querySelector("[data-fls-quantity-value]");
  const quantityValue = quantityInput ? quantityInput.value : 1;
  return {
    color: colorValue,
    size: sizeValue,
    quantity: quantityValue
  };
}
function sendToCart() {
  const button = document.querySelector(".detail__button");
  if (!button) return;
  button.addEventListener("click", () => {
    const inputs = getInputs();
    const cartItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      color: inputs.color,
      size: inputs.size,
      quantity: Number(inputs.quantity)
    };
    addItemToCart(cartItem);
    const toast = document.getElementById("cart-success-toast");
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 1500);
  });
}
sendToCart();
