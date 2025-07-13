import { c as createEl, u as updateCartIcon } from "./app.min.js";
import "./quantity.min.js";
JSON.parse(localStorage.getItem("cart")) || [];
window.addEventListener("storage", (event) => {
  if (event.key === "cart") {
    const updatedCart = JSON.parse(localStorage.getItem("cart")) || [];
    renderCart(updatedCart);
  }
});
class SetPage {
  constructor(item) {
    this.title = item.title;
    this.image = item.image;
    this.price = item.price;
    this.color = item.color;
    this.size = item.size;
    this.quantity = item.quantity;
  }
  setImage(img) {
    const imageWrapper = createEl("div", "cart__image");
    const image = createEl("img", "cart__image-item");
    image.src = this.image;
    image.alt = this.title;
    imageWrapper.append(image);
    return imageWrapper;
  }
  setAbout() {
    const aboutWrapper = createEl("div", "item-content__about");
    const title = createEl("div", "item-content__title");
    title.textContent = this.title;
    const size = createEl("div", "item-content__size-color");
    size.textContent = "Size: ";
    const sizeValue = createEl("span", "item-content__size-span");
    sizeValue.textContent = this.size;
    size.append(sizeValue);
    const color = createEl("div", "item-content__size-color");
    color.textContent = "Color: ";
    const colorValue = createEl("span", "item-content__color-span");
    colorValue.textContent = this.color;
    color.append(colorValue);
    aboutWrapper.append(title);
    aboutWrapper.append(size);
    aboutWrapper.append(color);
    return aboutWrapper;
  }
  setPrice() {
    const price = createEl("div", "cards__price");
    if (this.price.sale === 0) price.textContent = "$" + this.price.startPrice;
    else {
      price.textContent = "$" + Math.ceil(this.price.startPrice - this.price.startPrice * this.price.sale / 100);
      const discant = createEl("span", "cards__prics-discount");
      discant.textContent = "$" + this.price.startPrice;
      const discantPercent = createEl("span");
      discantPercent.textContent = "-" + this.price.sale + "%";
      discant.append(discantPercent);
      price.append(discant);
    }
    return price;
  }
  //видалити товар з кошика
  removeItem(itemKey) {
    const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
    const updatedCart = currentCart.filter((item) => {
      const key = `${item.title}_${item.color}_${item.size}`;
      return key !== itemKey;
    });
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    const itemElement = document.querySelector(`[data-item-key="${itemKey}"]`);
    if (itemElement) itemElement.remove();
    renderCart(updatedCart);
    updateCartIcon();
  }
  setContent(itemKey) {
    const block = createEl("div", "cart__item-content-wrapper");
    const blockItemWrapperFirst = createEl("div", ["cart__item-content", "item-content"]);
    blockItemWrapperFirst.append(this.setAbout());
    blockItemWrapperFirst.append(this.setPrice());
    const blockItemWrapperSecond = createEl("div", ["cart__item-content", "item-content"]);
    const quantity = createEl("div", "quantity");
    quantity.setAttribute("data-fls-dynamic", ".item-content__about, 768, 3, .cart__item-content-wrapper");
    quantity.setAttribute("data-fls-quantity", "");
    const minusBtn = createEl("button", ["quantity__button", "quantity__button--minus"]);
    minusBtn.type = "button";
    const plusBtn = createEl("button", ["quantity__button", "quantity__button--plus"]);
    plusBtn.type = "button";
    const inputWrapper = createEl("div", "quantity__input");
    const input = createEl("input");
    input.type = "text";
    input.name = "form[]";
    input.value = this.quantity || 1;
    input.autocomplete = "off";
    inputWrapper.append(input);
    quantity.append(minusBtn, inputWrapper, plusBtn);
    minusBtn.addEventListener("click", () => {
      let current = parseInt(input.value);
      if (current > 1) {
        input.value = --current;
        updateQuantityInStorage(itemKey, current);
        updateCartIcon();
      }
    });
    plusBtn.addEventListener("click", () => {
      let current = parseInt(input.value);
      input.value = ++current;
      updateQuantityInStorage(itemKey, current);
      updateCartIcon();
    });
    const can = createEl("button", ["item-content", "--icon-can"]);
    can.addEventListener("click", () => {
      this.removeItem(itemKey);
      updateCartSummary(JSON.parse(localStorage.getItem("cart")) || []);
    });
    blockItemWrapperSecond.append(can);
    blockItemWrapperSecond.append(quantity);
    block.append(blockItemWrapperFirst);
    block.append(blockItemWrapperSecond);
    return block;
  }
  setPage() {
    const fatherBlock = document.querySelector(".cart__wrapper-items");
    const cardItem = createEl("div", "cart__item");
    const itemKey = `${this.title}_${this.color}_${this.size}`;
    cardItem.dataset.itemKey = itemKey;
    cardItem.append(this.setImage());
    cardItem.append(this.setContent(itemKey));
    fatherBlock.append(cardItem);
  }
}
let appliedPromoDiscount = 0;
function updateQuantityInStorage(itemKey, newQuantity) {
  let updatedCart = JSON.parse(localStorage.getItem("cart")) || [];
  updatedCart = updatedCart.map((item) => {
    const key = `${item.title}_${item.color}_${item.size}`;
    if (key === itemKey) {
      item.quantity = newQuantity;
    }
    return item;
  });
  localStorage.setItem("cart", JSON.stringify(updatedCart));
  updateCartSummary(updatedCart);
}
function updateCartSummary(cart) {
  let subtotal = 0;
  let discountTotal = 0;
  const deliveryFee = 15;
  cart.forEach((item) => {
    const quantity = item.quantity || 1;
    const price = item.price.startPrice;
    const sale = item.price.sale || 0;
    const priceWithDiscount = Math.ceil(price - price * sale / 100);
    subtotal += priceWithDiscount * quantity;
    discountTotal += price * quantity - priceWithDiscount * quantity;
  });
  const promoDiscount = Math.ceil(subtotal * appliedPromoDiscount);
  const hasItems = cart.length > 0;
  const total = hasItems ? subtotal - promoDiscount + deliveryFee : 0;
  document.getElementById("subtotal").textContent = `$${hasItems ? subtotal : 0}`;
  document.getElementById("discount").textContent = `-$${hasItems ? discountTotal + promoDiscount : 0}`;
  document.getElementById("total").textContent = `$${total}`;
  const discountPercentEl = document.getElementById("discount-percent");
  if (discountPercentEl) {
    discountPercentEl.textContent = appliedPromoDiscount > 0 && hasItems ? `(-${appliedPromoDiscount * 100}% з промокоду)` : "(-0%)";
  }
  const summaryDiscountSpan = document.querySelector(".summary__item-discount-span");
  if (summaryDiscountSpan) {
    summaryDiscountSpan.textContent = appliedPromoDiscount > 0 && hasItems ? `(-${appliedPromoDiscount * 100}%)` : "(-0%)";
  }
}
document.getElementById("apply-promo").addEventListener("click", () => {
  const input = document.getElementById("promo-code").value.trim().toLowerCase();
  if (input === "promo") {
    appliedPromoDiscount = 0.2;
  } else {
    appliedPromoDiscount = 0;
  }
  const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
  updateCartSummary(currentCart);
});
function renderCart(cart) {
  const cartContainer = document.querySelector(".cart__wrapper-items");
  cartContainer.innerHTML = "";
  if (cart.length === 0) {
    const emptyMsg = document.createElement("div");
    emptyMsg.textContent = "Your cart is empty";
    emptyMsg.style.padding = "40px";
    emptyMsg.style.fontSize = "20px";
    emptyMsg.style.textAlign = "center";
    emptyMsg.style.color = "#777";
    cartContainer.appendChild(emptyMsg);
  } else {
    cart.forEach((item) => {
      new SetPage(item).setPage();
    });
  }
  updateCartSummary(cart);
}
const initialCart = JSON.parse(localStorage.getItem("cart")) || [];
renderCart(initialCart);
