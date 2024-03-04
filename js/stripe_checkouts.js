const d = document,
  $comidaColombiana = d.getElementById("comida-colombiana"),
  $template = d.getElementById("comida-colombiana-template").content,
  fragment = new DocumentFragment(),
  SECRET_KEY =
    "sk_test_51OpVdIEpsQSxqJmFXoRtJUfyBV5uNbumPji59xYkwlxuKFseAEqWIwgbHyJdzusp9rMZf1Ajjg8rYgfcTIesFBUm00f9OPDwXt",
  PUBLIC_KEY =
    "pk_test_51OpVdIEpsQSxqJmFGPzzylp2iCirfBNp2e3XoXRBfhMvrJHJG9SphTH55Fj6FG0fYC7OYFKosplJMYP8doqKnFO500gYHzOhBU",
  optionsFetch = {
    headers: { Authorization: `Bearer ${SECRET_KEY}` },
  };

let products, prices;

Promise.all([
  fetch("https://api.stripe.com/v1/products", optionsFetch),
  fetch("https://api.stripe.com/v1/prices", optionsFetch),
])
  .then((responses) => Promise.all(responses.map((res) => res.json())))
  .then((json) => {
    products = json[0].data;
    prices = json[1].data;
    console.log(products, prices);

    prices.forEach((price) => {
      let productData = products.filter(
        (product) => product.id === price.product
      );
      $template
        .querySelector(".comida-colombiana")
        .setAttribute("data-price", price.id);
      $template.querySelector("img").src = productData[0].images[0];
      $template.querySelector("figcaption").innerHTML = `
        ${productData[0].name} 
        <br>
        ${price.unit_amount_decimal.slice(
          0,
          -2
        )}. ${price.unit_amount_decimal.slice(-2)} ${price.currency}`;

      let clone = $template.cloneNode(true);
      fragment.appendChild(clone);
      // console.log(productData);
    });
    $comidaColombiana.appendChild(fragment);
  });

d.addEventListener("click", (e) => {
  if (e.target.matches(".comida-colombiana *")) {
    let price = e.target.parentElement.getAttribute("data-price");
    Stripe(PUBLIC_KEY)
      .redirectToCheckout({
        lineItems: [{ price, quantity: 1 }],
        //Especificar la ulr de la vista que se cargara si el pago tuvo exito
        successUrl: "http://127.0.0.1:5501/stripe-success.html",
        //Especificar la ulr de la vista que se cargara si el pago no tuvo exito
        cancelUrl: "http://127.0.0.1:5501/stripe-error.html",
        mode: 'payment'
      })
      .then((res) => {
        console.log(res);
        if (res.error) {
          $comidaColombiana.insertAdjacentElement(
            "afterend",
            res.error.message
          );
        }
      });
    console.log(price);
  }
});
