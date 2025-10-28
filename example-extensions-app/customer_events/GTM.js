window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

//Initialize GTM tag
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer', 'GTM-NHX56Q2');

//Google Consent Mode v2
gtag('consent', 'update', {
  'ad_storage': 'granted',
  'analytics_storage': 'granted',
  'ad_user_data': 'granted',
  'ad_personalization': 'granted',
});

function getLineItems(event) {
  return event.data.checkout.lineItems.map((lineItem, index) => {
    const discountFromAttributes = lineItem.properties?.find(attr => attr.key === '_aux_discount')?.value
    return ({
      item_id: lineItem.variant.product.id,
      item_name: `${lineItem.variant.product.title} - ${lineItem.variant.title}`,
      currency: event.data.checkout.currencyCode,
      price: lineItem.variant.price.amount,
      discount: discountFromAttributes ? Number(discountFromAttributes) : 0,
      index: index,
      item_category: lineItem.properties?.find(attr => attr.key === '_aux_category')?.value || '',
      item_category2: lineItem.properties?.find(attr => attr.key === '_aux_category2')?.value || '',
      item_category3: lineItem.properties?.find(attr => attr.key === '_aux_category3')?.value || '',
      item_brand: lineItem.properties?.find(attr => attr.key === '_aux_brand')?.value || '',
      item_variant: lineItem.variant.title,
      quantity: lineItem.quantity,
      sku_ids: lineItem.properties?.find(attr => attr.key === '_aux_skus')?.value || '',
    });
  });
}

//subscribe to events
analytics.subscribe("checkout_completed", (event) => {
  window.dataLayer.push({
    event: "purchase",
    ecommerce: {
      transaction_id: event.data.checkout.order?.id || "",
      value: event.data.checkout.subtotalPrice?.amount || 0,
      tax: event.data.checkout.totalTax.amount,
      shipping: event.data.checkout.delivery?.selectedDeliveryOptions[0]?.cost?.amount || 0,
      currency: event.data.checkout.currencyCode,
      coupon: event.data.checkout.discountApplications.filter(discount => discount.type === 'DISCOUNT_CODE')[0]?.title || '',
      items: getLineItems(event),
    },
  });
});

analytics.subscribe("payment_info_submitted", (event) => {
  const lineItems = getLineItems(event);
  window.dataLayer.push({
    event: "add_payment_info",
    payment_type: event.data.checkout.transactions[0]?.paymentMethod.name || '',
    ecommerce: {
      items: lineItems,
    },
  });
});

analytics.subscribe("checkout_shipping_info_submitted", (event) => {
  const lineItems = getLineItems(event);
  window.dataLayer.push({
    event: "add_shipping_info",
    ecommerce: {
      items: lineItems,
    },
  });
});

analytics.subscribe("checkout_contact_info_submitted", (event) => {
  window.dataLayer.push({
    event: "checkout_contact_info_submitted",
    timestamp: event.timestamp,
    id: event.id,
    token: event.data.checkout.token,
    url: event.context.document.location.href,
    client_id: event.clientId,
    email: event.data.checkout.email,
    phone: event.data.checkout.phone,
    first_name: event.data.checkout.billingAddress.firstName,
    last_name: event.data.checkout.billingAddress.lastName,
    address1: event.data.checkout.billingAddress.address1,
    address2: event.data.checkout.billingAddress.address2,
    city: event.data.checkout.billingAddress.city,
    country: event.data.checkout.billingAddress.country,
    countryCode: event.data.checkout.billingAddress.countryCode,
    province: event.data.checkout.billingAddress.province,
    provinceCode: event.data.checkout.billingAddress.provinceCode,
    zip: event.data.checkout.billingAddress.zip,
    orderId: event.data.checkout.order.id,
    currency: event.data.checkout.currencyCode,
    subtotal: event.data.checkout.subtotalPrice.amount,
    shipping: event.data.checkout.shippingLine.price.amount,
    value: event.data.checkout.totalPrice.amount,
    tax: event.data.checkout.totalTax.amount,
  });
});

analytics.subscribe("checkout_started", (event) => {
  const lineItems = getLineItems(event);
  window.dataLayer.push({
    event: "begin_checkout",
    ecommerce: {
      items: lineItems,
    },
  });
});

analytics.subscribe("page_viewed", (event) => {
  window.dataLayer.push({
    event: "page_viewed",
    timestamp: event.timestamp,
    id: event.id,
    client_id: event.clientId,
    url: event.context.document.location.href,
    page_title: event.context.document.title,
  });
});
