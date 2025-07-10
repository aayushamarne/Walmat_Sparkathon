const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = new Stripe('sk_test_51OzZKjSGbk9Yd6N17TlMkrpbJVAmz3ClSNxAwsZN1aUZzO49z1zuyVI8Cik4VD7CNe358SQcU41zjOHIFFSTsX5i00DL0rOBhi');

router.post('/create-checkout-session', async (req, res) => {
  const { items, user } = req.body;

  try {
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Items should be an array" });
    }

    console.log("Received items:", items);

    const line_items = items.map((item) => {
      if (!item.product || !item.product.name) {
        throw new Error(`Missing product details in item: ${JSON.stringify(item)}`);
      }

      return {
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.product.name,
            images: [item.image || 'https://via.placeholder.com/150'],
          },
          unit_amount: Math.round(item.price * 100), // in paise
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: user.email,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['IN', 'US', 'CA', 'GB'],
      },
      success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/cancel`,
    });

    res.json({ id: session.id });

  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
