const API_URL = 'https://tabby-jolly-run.glitch.me/';

const price = {
  Клубника: 600,
  Банан: 500,
  Киви: 550,
  Манго: 900,
  Маракуйя: 800,
  Яблоко: 200,
  Лед: 200,
  Биоразлагаемый: 200,
  Пластиковый: 100,
};

const cartDataControl = {
  getLocalStorage() {
    return JSON.parse(localStorage.getItem('freshyBarCart') || '[]');
  },
  addLocalStorage(item) {
    const cartData = this.getLocalStorage();
    item.idLs = Math.random().toString(36).substring(2, 8);
    cartData.push(item);
    localStorage.setItem('freshyBarCart', JSON.stringify(cartData));
  },
  removeLocalStorage(idLs) {
    const cartData = this.getLocalStorage();
    const index = cart.findIndex((item) => {
      item.idLs === idLs;
    });

    if (index !== -1) {
      cartData.splice(index, 1);
    }
    localStorage.setItem('freshyBarCart', JSON.stringify(cartData));
  },
  clearLocalStorage() {
    localStorage.removeItem('freshyBarCart');
  },
};

const getData = async () => {
  const response = await fetch(`${API_URL}api/goods`);
  const data = await response?.json();
  return data;
};

const createCart = (item) => {
  const cocktail = document.createElement('article');
  cocktail.classList.add('cocktail');
  cocktail.innerHTML = `
  <img
      class="img__cocktail"
      src="${API_URL}${item?.image}"
      alt="Коктейль ${item?.title}" />
      <div class="cocktail__content">
      <div class="cocktail__text">
      <h3 class="cocktail__title">${item?.title}</h3>
      <p class="cocktail__price text-red">${item?.price} ₸</p>
      <p class="cocktail__size">${item?.size}</p>
      </div>
      <button class="btn cocktail__btn cocktail__btn_add" data-id="${item?.id}">Добавить</button>
      </div>`;
  return cocktail;
};

const scrollService = {
  scrollPosition: 0,
  disabledScroll() {
    this.scrollPosition = window.scrollY;
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.cssText = `
    overflow: hidden;
    position: fixed;
    top: -${this.scrollPosition}px;
    left: 0;
    height: 100vh;
    width: 100vh;
    padding-right: ${window.innerWidth - document.body.offsetWidth}px;
    `;
  },
  enabledScroll() {
    document.body.style.cssText = '';
    window.scroll({ top: this.scrollPosition });
    document.documentElement.style.scrollBehavior = '';
  },
};

const modalController = ({ modal, btnOpen, time = 300, close, open }) => {
  const buttonElems = document.querySelectorAll(btnOpen);
  const modalElem = document.querySelector(modal);

  modalElem.style.cssText = `
    display: flex;
    visibility: hidden;
    opacity: 0;
    transition: opacity ${time}ms ease-in-out;
  `;

  const closeModal = (event) => {
    const target = event.target;
    const code = event.code;
    if (target === 'close' || target === modalElem || code === 'Escape') {
      modalElem.style.opacity = 0;
      setTimeout(() => {
        modalElem.style.visibility = 'hidden';
        scrollService.enabledScroll();
        if (close) {
          close();
        }
      }, time);
      window.removeEventListener('keydown', closeModal);
    }
  };

  const openModal = (e) => {
    if (open) {
      open({ btn: e.target });
    }
    modalElem.style.visibility = 'visible';
    modalElem.style.opacity = 1;
    window.addEventListener('keydown', closeModal);
    scrollService: disabledScroll();
  };

  buttonElems.forEach((buttonElem) => {
    buttonElem.addEventListener('click', openModal);
  });

  modalElem.addEventListener('click', closeModal);

  modalElem.closeModal = closeModal;
  modalElem.openModal = openModal;
  return { openModal, closeModal };
};

const getFormData = (form) => {
  const formData = new FormData(form);
  const data = {};

  for (const [name, value] of formData.entries()) {
    if (data[name]) {
      if (!Array.isArray(data[name])) {
        data[name] = [data[name]];
      }
      data[name].push(value);
    } else {
      data[name] = value;
    }
  }
  return data;
};

const calculateTotalPrice = (form, startPrice) => {
  let totalPrice = startPrice;
  const data = getFormData(form);

  if (Array.isArray(data.ingredients)) {
    data.ingredients.forEach((item) => {
      totalPrice += price[item] || 0;
    });
  } else {
    totalPrice += price[data.ingredients] || 0;
  }

  if (Array.isArray(data.topping)) {
    data.topping.forEach((item) => {
      totalPrice += price[item] || 0;
    });
  } else {
    totalPrice += price[data.topping] || 0;
  }

  totalPrice += price[data.cup] || 0;

  return totalPrice;
};

const formControl = (form, cb) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = getFormData(form);
    cartDataControl.add(data);

    if (cb) {
      cb();
    }
  });
};

const calculateMakeYourOwn = () => {
  const modalMakeYourOwn = document.querySelector('.modal_make-your-own');
  const formMakeOwn = modalMakeYourOwn.querySelectorAll(
    '.make__form_make-your-own'
  );
  const makeInputTitle =
    modalMakeYourOwn.querySelectorAll('.make__input_title');
  const makeInputPrice =
    modalMakeYourOwn.querySelectorAll('.make__input_price');
  const makeTotalPrice =
    modalMakeYourOwn.querySelectorAll('.make__total-price');
  const makeAddBtn = modalMakeYourOwn.querySelector('.make__add-btn');

  const handlerChange = () => {
    const totalPrice = calculateTotalPrice(formMakeOwn, 150);
    const data = getFormData(formMakeOwn);
    if (data.ingredients) {
      const ingredients = Array.isArray(data.ingredients)
        ? data.ingredients.join(', ')
        : data.ingredients;

      makeInputTitle.value = `Конструктор: ${ingredients}`;
      makeAddBtn.disabled = false;
    } else {
      makeAddBtn.disabled = true;
    }
    makeInputPrice.value = totalPrice;

    makeTotalPrice.innerHTML = `${totalPrice}&nbsp;₸`;
  };

  formMakeOwn.addEventListener('change', handlerChange);
  formControl(formMakeOwn, () => {
    modalMakeYourOwn.closeModal('close');
  });
  handlerChange();

  const resetForm = () => {
    makeTotalPrice.textContent = '';
    makeAddBtn.disabled = true;
    formMakeOwn.reset();
  };

  return { resetForm };
};

const calculateAdd = () => {
  const modalAdd = document.querySelector('.modal_add');
  const formAdd = document.querySelector('.make__form_add');
  const makeInputStartPrice = modalAdd.querySelectorAll(
    '.make__input-start-price'
  );
  const makeTitle = modalAdd.querySelector('.make__title');
  const makeInputTitle = modalAdd.querySelectorAll('.make__input-title');
  const makeTotalPrice = modalAdd.querySelectorAll('.make__total-price');
  const makeInputPrice = modalAdd.querySelectorAll('.make__input-price');
  const makeTotalSize = modalAdd.querySelectorAll('.make__total-size');
  const makeInputSize = modalAdd.querySelectorAll('.make__input-size');

  const handlerChange = () => {
    const totalPrice = calculateTotalPrice(formAdd, +makeInputStartPrice.value);
    makeTotalPrice.innerHTML = `${totalPrice}&nbsp;₸`;
    makeInputPrice.value = totalPrice;
  };

  formAdd.addEventListener('change', handlerChange);
  formControl(formAdd, () => {
    modalAdd.closeModal('close');
  });

  const fillInform = (data) => {
    makeTitle.textContent = data.title;
    makeInputTitle.value = data.title;
    makeTotalPrice.innerHTML = `${data.price}&nbsp;₸`;
    makeInputStartPrice.value = data.price;
    makeInputPrice.value = data.price;
    makeTotalSize.textContent = data.size;
    makeInputSize.value = data.size;
  };

  const resetForm = () => {
    makeTitle.textContent = '';
    makeTotalPrice.textContent = '';
    makeTotalSize.textContent = '';
    formAdd.reset();
  };

  return { fillInform, resetForm };
};

const createCartItem = (item) => {
  const li = document.createElement('li');
  li.classList.add('.order__item');
  li.innerHTML = `
    <img class="order__img"
         src="img/make-your-own.jpg"
         alt="${item?.title}" />

        <div class="order__info">
          <h3 class="order__name">"${item?.title}</h3>

          <ul class="order__topping-list">
            <li class="order__topping-item">${item?.size}</li>
            <li class="order__topping-item">"${item?.cup}</li>
              ${item.topping
      ? Array.isArray(item.topping)
        ? item.topping.map(
          (topping) =>
            ` <li class="order__topping-item">${topping}</li>`
        )
        : `<li class="order__topping-item">${item?.topping}</li>`
      : ''
    }
          </ul>
        </div>
          <button
            class="order__item-delete" data-idls="${item.idls}"
            aria-label="Удалить коктейль из корзины"></button>
          <p class="order__item-price">${item.price}&nbsp;₸</p>
  `;
};

const renderCart = () => {
  const modalOrder = document.querySelector('.modal_order');
  const orderCount = modalOrder.querySelector('.order__count');
  const orderList = modalOrder.querySelector('.order__list');
  const orderTotalPrice = modalOrder.querySelector('.order__total-price');
  const orderForm = modalOrder.querySelector('.order__form');

  const orderListData = cartDataControl.getLocalStorage();

  orderList.textContent = '';
  orderCount.textContent = `(${orderListData.length})`;

  orderListData.forEach((item) => {
    orderList.append(createCartItem(item));
  });

  orderTotalPrice.textContent = `${orderListData.reduce(
    (acc, item) => acc + +item.price,
    0
  )} ₸`;

  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!orderListData.length) {
      alert('Корзина пустая');
      orderForm.reset();
      modalOrder.closeModal('close');
      return;
    }

    const data = getFormData(orderForm);
    const response = await fetch(`${API_URL}api/order`, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        products: orderListData,
      }),
      headers: {
        "Content-Type": 'application/json()'
      }
    });
    const { message } = await response.json();
    alert(message);
    cartDataControl.clear();
    orderForm.reset();
    modalOrder.closeModal('close');
  });
};

const init = async () => {
  modalController({
    modal: '.modal_order',
    btnOpen: '.header__btn-order',
    open: renderCart,
  });

  const { resetForm: resetFormMakeYourOwn } = calculateMakeYourOwn();

  modalController({
    modal: '.modal_make-your-own',
    btnOpen: '.cocktail__btn_make',
    close: resetFormMakeYourOwn,
  });

  const goodsListElem = document.querySelector('.goods__list');
  const data = await getData();

  const cartsCocktail = data?.map(() => {
    const li = document.createElement('li');
    li.classList.add('goods__item');
    li.append(createCart());
    return li;
  });

  goodsListElem?.append(...cartsCocktail);

  const { fillInform: fillInFormAdd, resetForm: resetFormAdd } = calculateAdd();

  modalController({
    modal: '.modal_add',
    btnOpen: '.cocktail__btn_add',
    open({ btn }) {
      const id = btn.dataset.id;
      const item = data.find((item) => item.id.toString() === id);
      fillInFormAdd(item);
    },
    close: resetFormAdd,
  });
};

init();
