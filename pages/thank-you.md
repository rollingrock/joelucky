---
layout              : page
title               : "Thank You"
meta_title          : "Registration Received"
subheadline         : ""
teaser              : ""
permalink           : "/thank-you/"
noindex             : true
header:
    image_fullwidth: "jl/bg_golf.png"
sitemap:
    exclude: true
---

## Thank you — your registration has been received.

A confirmation e-mail is on its way to the address you provided. It includes a
summary of everything you selected and the total due. If it does not show up
within a few minutes, please check your spam folder.

#### Payment

<!-- The registration script appends the server-computed total to this page's
     URL (?total=660.00) so the amount is on screen straight away, rather than
     waiting on the confirmation e-mail. Display only: the authoritative figure
     is server_total in the registration sheet, and the e-mail carries the
     itemized breakdown. Hidden entirely when there is no total to show. -->
<div id="amount-due" style="display:none; border:1px solid #ccc; padding:0.75em 1em; margin-bottom:1.25em;">
  <p style="margin:0; font-size:1.2em;">Amount due: <strong id="amount-due-value"></strong></p>
  <p style="margin:0.35em 0 0; font-size:0.85em; color:#555;">
    Your confirmation e-mail lists each item that makes up this total.
  </p>
</div>

1. **PayPal** — pay now using the button below, from your bank account or a
   credit card.
2. **Credit or debit card** — we will have a card reader at check-in on the day
   of the tournament.

<table border="0" width="100%" cellpadding="5">
<tbody>
<tr><td>Paypal: </td><td>
<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
<p align="left"><input name="cmd" type="hidden" value="_s-xclick" /> <input name="hosted_button_id" type="hidden" value="2KZJY65FPZXUQ" /> <input alt="PayPal - The safer, easier way to pay online!" name="submit" src="https://www.paypal.com/en_US/i/btn/btn_donateCC_LG.gif" type="image" /> <img src="https://www.paypal.com/en_US/i/scr/pixel.gif" alt="" width="1" height="1" border="0" /></p>
</form>
</td></tr>
</tbody></table>

<script>
(function () {
  // Matched rather than parsed: only a plain decimal is accepted, so nothing
  // else from the query string can reach the page.
  var m = /[?&]total=(\d+(?:\.\d{1,2})?)(?:&|$)/.exec(window.location.search);
  if (!m) return;
  var total = Number(m[1]);
  if (!(total > 0)) return;

  document.getElementById('amount-due-value').textContent =
    '$' + total.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  document.getElementById('amount-due').style.display = '';
})();
</script>

#### What happens next

1. A committee member will follow up with any details specific to your entry.
2. If you still need to name players on your team, just reply to your
   confirmation e-mail with the names.

#### Event details

<table border="0" width="400px" cellpadding="5">
<tbody>
<tr><td>When: </td><td>Thursday, October 1st 2026</td></tr>
<tr><td>Where: </td><td>Sherrill Park Golf Course, Course #1<br/>2001 East Lookout Drive<br/>Richardson, Tx 75082<br/>972-234-1416</td></tr>
<tr><td>Start Time: </td><td>10:30 AM Check-in<br/>12:00 PM Shotgun Start<br/>Dinner Afterwards</td></tr>
</tbody></table>

Questions? <a title="click to ask for more information" href="{{ site.url }}{{ site.baseurl }}/contact/">Contact Us</a>.
