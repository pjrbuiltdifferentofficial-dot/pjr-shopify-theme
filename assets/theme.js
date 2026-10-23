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
  const menuToggle = $("[data-open-menu]");
  let menuReturn = null;
  const openMenu = (on) => {
    menu?.classList.toggle("is-open", on);
    menuBack?.classList.toggle("is-open", on);
    menu?.setAttribute("aria-hidden", on ? "false" : "true");
    if (on) menu?.removeAttribute("inert");
    else menu?.setAttribute("inert", "");
    menuToggle?.setAttribute("aria-expanded", on ? "true" : "false");
    lock(on || $(".cart-drawer")?.classList.contains("is-open"));
    if (on) {
      menuReturn = document.activeElement;
      menu?.querySelector("[data-close-menu]")?.focus();
    } else if (menuReturn && typeof menuReturn.focus === "function") {
      menuReturn.focus();
      menuReturn = null;
    }
  };
  menuToggle?.addEventListener("click", () => openMenu(true));
  $("[data-close-menu]")?.addEventListener("click", () => openMenu(false));
  menuBack?.addEventListener("click", () => openMenu(false));

  const drawer = $(".cart-drawer");
  const cartBack = $("[data-cart-backdrop]");
  let cartReturn = null;
  const openCart = (on) => {
    drawer?.classList.toggle("is-open", on);
    cartBack?.classList.toggle("is-open", on);
    drawer?.setAttribute("aria-hidden", on ? "false" : "true");
    if (on) drawer?.removeAttribute("inert");
    else drawer?.setAttribute("inert", "");
    lock(on);
    if (on) {
      cartReturn = document.activeElement;
      drawer?.querySelector("[data-close-cart]")?.focus();
    } else if (cartReturn && typeof cartReturn.focus === "function") {
      cartReturn.focus();
      cartReturn = null;
    }
  };
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-cart]")) {
      e.preventDefault();
      refreshCart().then(() => openCart(true));
    }
    if (e.target.closest("[data-close-cart]")) openCart(false);
  });
  cartBack?.addEventListener("click", () => openCart(false));

  const esc = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])
    );

  const money = (cents) => {
    const currency = window.Shopify?.currency?.active || "NOK";
    const value = cents / 100;
    if (currency === "NOK") {
      const formatted = Number.isInteger(value)
        ? new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 0 }).format(value)
        : new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
      return `${formatted} kr`;
    }
    try {
      return new Intl.NumberFormat(document.documentElement.lang || "en", {
        style: "currency",
        currency,
      }).format(value);
    } catch {
      return value.toFixed(2);
    }
  };

  const updateShipping = (cart) => {
    const note = $("[data-cart-ship]");
    if (!note) return;
    const currency = cart?.currency || window.Shopify?.currency?.active;
    if (currency && currency !== "NOK") {
      note.hidden = true;
      return;
    }
    note.hidden = false;
    const progress = note.querySelector("[data-ship-progress]");
    if (!progress) return;
    const threshold = Number(note.dataset.threshold) || 150000;
    const remaining = threshold - (cart?.total_price || 0);
    progress.textContent = remaining <= 0
      ? note.dataset.free || ""
      : (note.dataset.progress || "").replace("__AMOUNT__", money(remaining));
  };

  const qtyLabels = document.querySelector("[data-qty-labels]");
  const decLabel = qtyLabels?.dataset.decrease || "Decrease quantity";
  const incLabel = qtyLabels?.dataset.increase || "Increase quantity";

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
        <a href="${esc(item.url)}"><img src="${esc(item.image || "")}" alt="${esc(item.product_title)}" width="80" height="112"></a>
        <div>
          <div class="cart-line__title">${esc(item.product_title)}</div>
          <div class="cart-line__meta">${esc(item.variant_title || "")}</div>
          <div class="qty">
            <button type="button" data-qty="-1" aria-label="${esc(decLabel)}">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-qty="1" aria-label="${esc(incLabel)}">+</button>
          </div>
        </div>
        <div>${money(item.final_line_price)}</div>
      </div>`
      )
      .join("");
    const sub = $("[data-cart-subtotal]");
    if (sub) sub.textContent = money(cart.total_price);
    updateShipping(cart);
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
        $$("button", group).forEach((b) => {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        const variant = findVariant();
        if (variant && select) {
          select.value = variant.id;
          const label = money(variant.price);
          if (priceEl) priceEl.textContent = label;
          const stickyPrice = $("[data-sticky-price]");
          if (stickyPrice) stickyPrice.textContent = label;
          if (addBtn) {
            addBtn.disabled = !variant.available;
            addBtn.textContent = variant.available
              ? addBtn.dataset.inStock
              : addBtn.dataset.soldOut;
          }
          const stickyAdd = $("[data-sticky-add]");
          if (stickyAdd) stickyAdd.disabled = !variant.available;
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

    const sticky = $("[data-sticky-atc]");
    const stickyAdd = $("[data-sticky-add]");
    if (sticky && addBtn && window.matchMedia("(max-width: 1023px)").matches) {
      const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        const past = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        sticky.hidden = !past;
        document.body.classList.toggle("has-sticky-atc", past);
      });
      observer.observe(addBtn);
    }
    stickyAdd?.addEventListener("click", () => {
      if (typeof productForm.requestSubmit === "function") productForm.requestSubmit();
      else productForm.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    });
  }

  $$("[data-thumb]").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$("[data-thumb]").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const stage = $(".product__stage img");
      if (!stage) return;
      if (btn.dataset.src) stage.src = btn.dataset.src;
      if (btn.dataset.srcset) stage.srcset = btn.dataset.srcset;
    });
  });

  const closeNavDrops = () => {
    $$("[data-nav-drop]").forEach((drop) => {
      drop.classList.remove("is-open");
      drop.querySelector("[data-nav-toggle]")?.setAttribute("aria-expanded", "false");
    });
  };
  document.addEventListener("click", (e) => {
    const toggle = e.target.closest("[data-nav-toggle]");
    if (!toggle) {
      if (!e.target.closest("[data-nav-drop]")) closeNavDrops();
      return;
    }
    const drop = toggle.closest("[data-nav-drop]");
    const open = !drop.classList.contains("is-open");
    closeNavDrops();
    drop.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeNavDrops();
    if (drawer?.classList.contains("is-open")) openCart(false);
    else if (menu?.classList.contains("is-open")) openMenu(false);
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
