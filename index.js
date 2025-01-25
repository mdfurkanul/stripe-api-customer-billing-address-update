require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Replace with your Stripe API key

(async () => {
  try {
    let hasMore = true;
    let startingAfter = null;

    while (hasMore) {
      // Fetch customers, include `starting_after` only when it's not null
      const customers = await stripe.customers.list({
        limit: 100,
        ...(startingAfter && { starting_after: startingAfter }),
      });

      for (const customer of customers.data) {
        if (customer.shipping && customer.shipping.address) {
          const { address } = customer.shipping;
          console.log(address);
          // Update customer billing details with shipping address
          await stripe.customers.update(customer.id, {
            address: {
              line1: address.line1,
              line2: address.line2,
              city: address.city,
              state: address.state,
              postal_code: address.postal_code,
              country: address.country,
            },
          });

          console.log(`Updated billing address for customer: ${customer.id}`);
        }
      }

      // Update pagination
      hasMore = customers.has_more;
      if (hasMore) {
        startingAfter = customers.data[customers.data.length - 1].id;
      }
    }

    console.log("All customer billing addresses updated successfully.");
  } catch (error) {
    console.error("Error updating customer billing addresses:", error.message);
  }
})();
