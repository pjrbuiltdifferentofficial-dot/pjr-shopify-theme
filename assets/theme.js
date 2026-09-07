(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const toast = (msg) => {
    let el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("is-on");
    setTimeout(() => el.classList.remove("is-on"), 2200);
  };

  const lock = (on) => document.body.classList.toggle("is-locked", on);

  const header = $(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const menu = $(".nav-drawer");
  const menuBack = $("[data-menu-backdrop]");
  const openMenu = (on) => {
    menu?.classList.toggle("is-open", on);
    menuBack?.classList.toggle("is-open", on);
    lock(on || $(".cart-drawer")?.classList.contains("is-open"));
  };
  $("[data-open-menu]")?.addEventListener("click", () => openMenu(true));
  $("[data-close-menu]")?.addEventListener("click", () => openMenu(false));
  menuBack?.addEventListener("click", () => openMenu(false));

  const drawer = $(".cart-drawer");
  const cartBack = $("[data-cart-backdrop]");
  const openCart = (on) => {
    drawer?.classList.toggle("is-open", on);
    cartBack?.classList.toggle("is-open", on);
    lock(on);
  };
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-cart]")) {
      e.preventDefault();
      refreshCart().then(() => openCart(true));
    }
    if (e.target.closest("[data-close-cart]")) openCart(false);
  });
  cartBack?.addEventListener("click", () => openCart(false));

  const money = (cents) => {
    try {
      return new Intl.NumberFormat(document.documentElement.lang || "en", {
        style: "currency",
        currency: window.Shopify?.currency?.active || "USD",
      }).format(cents / 100);
    } catch {
      return (cents / 100).toFixed(2);
    }
  };

  const renderCart = (cart) => {
    $$("[data-cart-count]").forEach((el) => {
      el.textContent = cart.item_count;
      el.hidden = cart.item_count === 0;
    });
    const body = $("[data-cart-items]");
    const foot = $("[data-cart-foot]");
    const empty = $("[data-cart-empty]");
    if (!body) return;
    if (!cart.items.length) {
      body.innerHTML = "";
      foot?.setAttribute("hidden", "");
      empty?.removeAttribute("hidden");
      return;
    }
    empty?.setAttribute("hidden", "");
    foot?.removeAttribute("hidden");
    body.innerHTML = cart.items
      .map(
        (item) => `
      <div class="cart-line" data-key="${item.key}">
        <a href="${item.url}"><img src="${item.image || ""}" alt="" width="80" height="112"></a>
        <div>
          <div class="cart-line__title">${item.product_title}</div>
          <div class="cart-line__meta">${item.variant_title || ""}</div>
          <div class="qty">
            <button type="button" data-qty="-1" aria-label="-">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-qty="1" aria-label="+">+</button>
          </div>
        </div>
        <div>${money(item.final_line_price)}</div>
      </div>`
      )
      .join("");
    const sub = $("[data-cart-subtotal]");
    if (sub) sub.textContent = money(cart.total_price);
  };

  const refreshCart = () =>
    fetch("/cart.js", { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((cart) => {
        renderCart(cart);
        return cart;
      });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-qty]");
    if (!btn) return;
    const line = btn.closest("[data-key]");
    if (!line) return;
    const span = line.querySelector(".qty span");
    const next = Math.max(0, Number(span.textContent) + Number(btn.dataset.qty));
    fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ id: line.dataset.key, quantity: next }),
    })
      .then((r) => r.json())
      .then(renderCart);
  });

  const productForm = $("[data-product-form]");
  if (productForm) {
    const select = productForm.querySelector('[name="id"]');
    const priceEl = $("[data-product-price]");
    const addBtn = productForm.querySelector("[data-add]");
    const jsonEl = $("[data-product-json]");
    const product = jsonEl ? JSON.parse(jsonEl.textContent) : null;

    const currentOpts = () =>
      $$("[data-option]").map((group) => group.querySelector(".is-active")?.dataset.value);

    const findVariant = () => {
      if (!product) return null;
      const opts = currentOpts();
      return product.variants.find((v) => v.options.every((o, i) => o === opts[i]));
    };

    $$("[data-option] button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const group = btn.closest("[data-option]");
        $$("button", group).forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const variant = findVariant();
        if (variant && select) {
          select.value = variant.id;
          if (priceEl) priceEl.textContent = money(variant.price);
          if (addBtn) {
            addBtn.disabled = !variant.available;
            addBtn.textContent = variant.available
              ? addBtn.dataset.inStock
              : addBtn.dataset.soldOut;
          }
        }
      });
    });

    productForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const variant = findVariant();
      if (!variant) {
        toast(productForm.dataset.needSize || "Select a size");
        return;
      }
      const data = new FormData(productForm);
      fetch("/cart/add.js", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      })
        .then((r) => {
          if (!r.ok) throw new Error("add");
          return r.json();
        })
        .then(() => refreshCart())
        .then(() => {
          toast(productForm.dataset.added || "Added");
          openCart(true);
        })
        .catch(() => toast("—"));
    });
  }

  $$("[data-thumb]").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$("[data-thumb]").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const stage = $("[data-stage]");
      if (stage) stage.src = btn.dataset.thumb;
    });
  });

  $$("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.tab;
      $$("[data-tab]").forEach((b) => b.classList.toggle("is-active", b === btn));
      $$("[data-tab-panel]").forEach((p) => {
        p.hidden = p.dataset.tabPanel !== id;
      });
    });
  });

  refreshCart().catch(() => {});
})();
