---
layout              : page
title               : "Contact"
meta_title          : "Contact and use our contact form"
subheadline         : ""
teaser              : ""
permalink           : "/contact/"
header:
    image_fullwidth: "jl/bg_golf.png"
---

<div style="border: 1px solid black; padding: 10px">
<form id="contact-form" class="fs-form fs-layout__1-column" method="POST" action="https://script.google.com/macros/s/AKfycbzLjB0eEkpNlToXjjri3cjpEljxrpPkz4dstEoPJZWVlpiQPBffuOc_bHy0dLR-qpL0/exec" novalidate>
  
  <!-- Honeypot (hidden field to catch bots) -->
  <div style="position:absolute; left:-9999px; opacity:0;">
    <label>Company (leave blank)
      <input type="text" name="hp_company" tabindex="-1" autocomplete="off">
    </label>
  </div>

  <label>
    Name
    <input type="text" name="name" required>
  </label>

  <label>
    Email
    <input type="email" name="email" required>
  </label>

  <label>
    Subject
    <input type="text" name="subject" required>
  </label>

  <label>
    Message
    <textarea name="message" rows="6" required></textarea>
  </label>

  <div class="fs-button-group">
  <button class="fs-button" type="submit" id="submit-btn">Send</button>
  <p id="status" aria-live="polite"></p>
  </div>
</form>
</div>

<script>
  const form = document.getElementById('contact-form');
  const status = document.getElementById('status');
  const btn = document.getElementById('submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = "Sending…";
    btn.disabled = true;

    try {
      // Using FormData avoids CORS preflight and keeps things simple
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form) });
      // Apps Script often doesn’t include CORS headers; treat a 200 as success even if we can’t read JSON
      if (res.ok) {
        status.textContent = "Thanks! Your message has been sent.";
        form.reset();
      } else {
        status.textContent = "Sorry—there was a problem sending your message.";
      }
    } catch (err) {
      status.textContent = "Network error—please try again.";
    } finally {
      btn.disabled = false;
    }
  });
</script>
