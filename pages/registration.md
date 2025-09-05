---
layout              : page
title               : "Registration"
meta_title          : "Tournament Registration"
subheadline         : ""
teaser              : ""
permalink           : "/registration/"
header:
    image_fullwidth: "jl/bg_golf.png"
---

## Tournament Registration

#### Event Information
<table border="0" width="400px" cellpadding="5">
<tbody>
<tr><td>When: </td><td>October 2nd 2025</td></tr>
<tr><td>Where: </td><td>Sherrill Park Golf Course<br/>2001 East Lookout Drive<br/>Richardson, Tx 75082<br/>972-234-1416</td></tr>
<tr><td>Start Time: </td><td>11:00 AM Check-in<br/>12:00 PM Shotgun Start<br/>Dinner Afterwards</td></tr>
</tbody></table>

#### For Information or Questions
Click on the “Contact Us” link at the bottom of this page and send a detailed description of your question. A committee member will respond asap.

#### 2025 Event Registration
<div style="border: 1px solid black; padding: 10px">
<form
  action="https://script.google.com/macros/s/AKfycbwmUZw-FTfygRfJts147beg_zMASkvJ1zq0rEOkv3mHTwbUdmLZ3edUdEfAtnW7WtI/exec"
  class="fs-form fs-layout__2-column"
  target="_top"
  method="POST"
  id="reg-form"
>

<input type="hidden" name="form_started" id="form_started">
<input type="hidden" name="elapsed_ms" id="elapsed_ms">
<div style="display:none;">
  <label>If you are human, leave this field blank</label>
  <input type="text" name="website" value="">
</div>

  <fieldset>
    <div class="fs-field">
      <label class="fs-label">
        Please check which applies
      </label>
      <div class="fs-checkbox-group">
        <div class="fs-checkbox-field">
          <div class="fs-checkbox-wrapper">
            <input
              class="fs-checkbox"
              id="regtype-corp-sponsor"
              name="registration_type"
              required
              type="radio"
              value="corp-sponsor"
            />
          </div>
          <div>
            <label class="fs-label" for="regtype-corp-sponsor">Corporate Sponsor</label>
          </div>
        </div>
        <div class="fs-checkbox-field">
          <div class="fs-checkbox-wrapper">
            <input
              class="fs-checkbox"
              id="regtype-individual-entry"
              name="registration_type"
              type="radio"
              value="individual-entry"
            />
          </div>
          <div>
            <label class="fs-label" for="regtype-individual-entry">Individual Entry</label>
          </div>
        </div>
        <div class="fs-checkbox-field">
          <div class="fs-checkbox-wrapper">
            <input
              class="fs-checkbox"
              id="regtype-donation"
              name="registration_type"
              type="radio"
              value="donation"
            />
          </div>
          <div>
            <label class="fs-label" for="regtype-donation">Donation</label>
          </div>
        </div>
      </div>
    </div>
  </fieldset>
  <fieldset>
    <div class="fs-field">
      <label class="fs-label" for="team-name">Team Name</label>
      <input class="fs-input" id="team-name" name="team_name" required />
      <p class="fs-description">
        Team Name for the Event
      </p>
    </div>
    <div class="fs-field">
      <label class="fs-label" for="name">Name</label>
      <input class="fs-input" id="name" name="contact_name" required />
      <p class="fs-description">
        Primary Team Contact
      </p>
    </div>
    <div class="fs-field">
      <label class="fs-label" for="email">Email</label>
      <input class="fs-input" id="email" name="contact_email" required />
    </div>
    <div class="fs-field">
      <label class="fs-label" for="number">Contact Number</label>
      <input
        class="fs-input"
        id="number"
        name="contact_phone"
        placeholder="(000) 000-0000"
        required
      />
    </div>
      <div class="fs-checkbox-group">
        <div class="fs-checkbox-field">
          <div class="fs-checkbox-wrapper">
            <input
              class="fs-checkbox"
              id="reg-assign-individual"
              name="assign_individual"
              type="checkbox"
              value="yes"
            />
          </div>
          <div>
            <label class="fs-label" for="reg-assign-individual">Assign Me a Team</label>
          </div>
        </div>
      </div>
  </fieldset>
  <fieldset>
    <div class="fs-field">
      <label class="fs-label" for="member1">Team Member 1</label>
      <input class="fs-input" id="member1" name="member1" />
    </div>
    <div class="fs-field">
      <label class="fs-label" for="member2">Team Member 2</label>
      <input class="fs-input" id="member2" name="member2" />
    </div>
    <div class="fs-field">
      <label class="fs-label" for="member3">Team Member 3</label>
      <input class="fs-input" id="member3" name="member3" />
    </div>
    <div class="fs-field">
      <label class="fs-label" for="member4">Team Member 4</label>
      <input class="fs-input" id="member4" name="member4" />
    </div>
  </fieldset>
  <fieldset>
    <h5>Tournament Prices</h5>
    <br/>
  <table border="1" width="100%" cellpadding="6" cellspacing="0">
    <tr>
      <th>Item</th>
      <th>Amount</th>
      <th>Quantity</th>
      <th>Subtotal</th>
    </tr>
    <tr>
      <td>Tournament Fee</td>
      <td>$125</td>
      <td><input type="number" name="tournament_fee_qty" min="0" value="0" data-price="125"></td>
      <td class="subtotal">$0</td>
    </tr>
    <tr>
      <td>Mulligans (1/Player)</td>
      <td>$10</td>
      <td><input type="number" name="mulligan_qty" min="0" value="0" data-price="10"></td>
      <td class="subtotal">$0</td>
    </tr>
    <tr>
      <td>Club Rentals (LH or RH)</td>
      <td>$35</td>
      <td><input type="number" name="club_rental_qty" min="0" value="0" data-price="35"></td>
      <td class="subtotal">$0</td>
    </tr>
    <tr>
      <td>Corporate Sponsor</td>
      <td>$1250</td>
      <td><input type="number" name="corp_sponsor_qty" min="0" value="0" data-price="1250"></td>
      <td class="subtotal">$0</td>
    </tr>
    <tr>
      <td>Donation</td>
      <td>$100</td>
      <td><input type="number" name="donation_qty" min="0" value="0" data-price="100"></td>
      <td class="subtotal">$0</td>
    </tr>
    <tr>
      <td>Shirt w/ Logo (Size in Notes)</td>
      <td>$50</td>
      <td><input type="number" name="shirt_qty" min="0" value="0" data-price="50"></td>
      <td class="subtotal">$0</td>
    </tr>
    <tr>
      <td>Gallery Fee (w/ Dinner)</td>
      <td>$15</td>
      <td><input type="number" name="gallery_fee_qty" min="0" value="0" data-price="15"></td>
      <td class="subtotal">$0</td>
    </tr>
    <tr>
      <th colspan="3" style="text-align:right">Total:</th>
      <th id="grandTotal">$0</th>
    </tr>
  </table>

  <br/>
  <!-- Hidden field to pass total to Formspree -->
  <input type="hidden" name="calculated_total" id="calculatedTotal">

  <p style="font-size: 0.8em">Tournament Fee includes Green Fees, Cart, Range Balls, and Dinner</p><br/>
  <p style="font-size: 0.8em">Corporate Sponsorship includes all Tournament Fees for a full foursome. Each additional foursome is an additional $500. Also includes corporate logo signs on the course and displayed during the dinner</p>
  <br/>
  <label>
    Additional Notes (shirt sizes, special requests, etc.):
    <textarea name="notes" rows="4"></textarea>
  </label><br>
  </fieldset>
  <div class="fs-button-group">
    <button class="fs-button" type="submit">Submit</button>
  </div>
</form>
</div>

<script>
  (function(){
    var start = Date.now();
    document.getElementById('form_started').value = String(start);
    var form = document.getElementById('reg-form');
    form.addEventListener('submit', function(){
      document.getElementById('elapsed_ms').value = String(Date.now() - start);
    });
  })();
</script>

<script>
(function () {
  // === Prices (keep in sync with server) ===
  const P = {
    tournament: 125,
    mulligan: 10,
    clubs: 35,
    sponsor_first: 1250,
    sponsor_additional: 500,
    donation: 100,
    shirt: 50,
    gallery: 15
  };

  // Elements
  const form = document.getElementById('reg-form');
  if (!form) return;

  const grandEl = document.getElementById('grandTotal');
  const hiddenTotal = document.getElementById('calculatedTotal');

  // Utility
  const toInt = v => {
    const n = Math.floor(Number(v));
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  const money = n => '$' + Number(n).toFixed(2);

  // Special sponsor pricing
  function sponsorCost(q) {
    q = toInt(q);
    if (q <= 0) return 0;
    if (q === 1) return P.sponsor_first;
    return P.sponsor_first + (q - 1) * P.sponsor_additional;
  }

  // Compute + render a row's subtotal given the <input> element
  function updateRowSubtotal(input) {
    const tr = input.closest('tr');
    const cell = tr ? tr.querySelector('.subtotal') : null;
    if (!cell) return 0;

    const name = input.name;
    const qty = toInt(input.value);

    let subtotal = 0;

    switch (name) {
      case 'tournament_fee_qty':
        subtotal = qty * P.tournament; break;
      case 'mulligan_qty':
        subtotal = qty * P.mulligan; break;
      case 'club_rental_qty':
        subtotal = qty * P.clubs; break;
      case 'corp_sponsor_qty':
        subtotal = sponsorCost(qty); break; // <-- special rule here
      case 'donation_qty':
        subtotal = qty * P.donation; break;
      case 'shirt_qty':
        subtotal = qty * P.shirt; break;
      case 'gallery_fee_qty':
        subtotal = qty * P.gallery; break;
      default:
        // If you add new rows later, handle them here.
        subtotal = 0;
    }

    cell.textContent = money(subtotal);
    return subtotal;
  }

  // Recompute the whole table total
  function recomputeAll() {
    let total = 0;
    const qtyInputs = form.querySelectorAll(
      'input[name$="_qty"][type="number"]'
    );
    qtyInputs.forEach(input => total += updateRowSubtotal(input));

    if (grandEl) grandEl.textContent = money(total);
    if (hiddenTotal) hiddenTotal.value = total.toFixed(2);
  }

  // Hook up listeners
  form.addEventListener('input', function (e) {
    const t = e.target;
    if (t && t.matches('input[name$="_qty"][type="number"]')) {
      // Clamp to non-negative integers
      t.value = String(toInt(t.value));
      // Update only this row, then total
      updateRowSubtotal(t);
      // Recompute grand (cheap, keeps things consistent)
      let total = 0;
      form.querySelectorAll('input[name$="_qty"][type="number"]').forEach(inp => {
        const tr = inp.closest('tr');
        const cell = tr ? tr.querySelector('.subtotal') : null;
        if (!cell) return;
        // We already updated changed row; add all visible subtotals
        const val = Number((cell.textContent || '0').replace(/[^0-9.]/g, '')) || 0;
        total += val;
      });
      if (grandEl) grandEl.textContent = money(total);
      if (hiddenTotal) hiddenTotal.value = total.toFixed(2);
    }
  });

  // Initial compute on load (in case there are preset values)
  recomputeAll();
})();
</script>


#### Methods of Supporting this Event:
1. Donations (Cash, Check, or Credit Card)
2. Corporate Sponsorship (Click on “Contact Us” at the bottom of the page for details.)
3. Individual Tournament  Fees
4. Gallery tickets
5. Volunteers

#### Methods of Payment/Donation
1. Preferred method of payment is to use the PayPal link below to electronically transfer funds from your bank account or credit card.
2. Checks can be made out to JLMGT, Inc. and handed to a committee member during registration.


<table border="0" width="100%" cellpadding="5">
<tbody>
<tr><td>Paypal: </td><td>
<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
<p align="left"><input name="cmd" type="hidden" value="_s-xclick" /> <input name="hosted_button_id" type="hidden" value="2KZJY65FPZXUQ" /> <input alt="PayPal - The safer, easier way to pay online!" name="submit" src="https://www.paypal.com/en_US/i/btn/btn_donateCC_LG.gif" type="image" /> <img src="https://www.paypal.com/en_US/i/scr/pixel.gif" alt="" width="1" height="1" border="0" /></p>
</form>
</td></tr>
</tbody></table>

<span style="color: red; font-size: 14pt;"><a title="click to ask for more information" href="http://jlmgt.org/contact-page/">Contact Us</a></span>

<p align="justify">Invitations to individuals and corporate sponsors will be notified by e-mail before September 1, 2025.</p>

<iframe style="border: 0;" src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13386.76306708702!2d-96.68634594690322!3d32.98555941717764!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x39e4dda726e0765e!2sSherrill+Park+Golf+Course!5e0!3m2!1sen!2sus!4v1503370333814" width="600" height="450" frameborder="0" allowfullscreen="allowfullscreen"></iframe>
<p align="justify">The tournament format will be a 4 person scramble.  You may enter as an individual or a 4 person team.  The JLMGT committee will insure that all individuals are placed on a team.  Details of the tournament will follow but we need you to start forming your teams (foursomes) for the competition.  <em><strong>We need all team names to be submitted by Friday, September 19, 2025.</strong></em></p>