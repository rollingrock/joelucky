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

<style>
  /* Predate the responsive layout and push the page sideways on a phone: the
     map embed is a hardcoded 600px and the event-info table a fixed 400px.
     This style block is emitted only on this page, so the bare selectors are
     scoped to it. */
  iframe { max-width: 100%; }
  table[width="400px"] { max-width: 100%; }
</style>

#### Event Information
<table border="0" width="400px" cellpadding="5">
<tbody>
<tr><td>When: </td><td>Thursday, October 1st 2026</td></tr>
<tr><td>Where: </td><td>Sherrill Park Golf Course, Course #1<br/>2001 East Lookout Drive<br/>Richardson, Tx 75082<br/>972-234-1416</td></tr>
<tr><td>Start Time: </td><td>11:00 AM Check-in<br/>12:00 PM Shotgun Start<br/>Dinner Afterwards</td></tr>
</tbody></table>

#### For Information or Questions
Click on the “Contact Us” link at the bottom of this page and send a detailed description of your question. A committee member will respond asap.

#### 2026 Event Registration
Our 21st annual tournament.

<div style="border: 1px solid black; padding: 10px">
<form
  action="https://script.google.com/macros/s/AKfycbx-y1-0W-ZFZJ_1khfb8oWtvlfWzNYyYAKXDkS2e-exb8ReQD1G9MYUxgjGTnLjNgyU/exec"
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
      <div class="fs-field" id="players-needed-field" style="display:none; margin-left:1.5em;">
        <label class="fs-label" for="players-needed">Players needed</label>
        <input
          class="fs-input"
          id="players-needed"
          name="players_needed"
          type="number"
          min="0"
          max="100"
          step="1"
          style="max-width:6em"
          disabled
        />
        <p class="fs-description">
          How many golfers should we find to complete your team(s)?
        </p>
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
  <fieldset class="prices-fieldset">
    <h5>Tournament Prices</h5>
    <br/>

  <style>
    /* The theme lays fieldsets out as a two-column grid. Everything in this
       one — the price table, the explanatory notes, the notes box — is
       full-width content, so it gets a single column at every screen size. */
    #reg-form fieldset.prices-fieldset { grid-template-columns: 1fr; }

    /* A fieldset's UA default is min-width:min-content, so it refuses to
       shrink to a narrow screen and drags the whole page sideways with it. */
    #reg-form fieldset { min-width: 0; }

    .price-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    #price-table { min-width: 30em; }

    .shirt-grid { border-collapse: collapse; margin: 0; }
    .shirt-grid th,
    .shirt-grid td { padding: 2px; border: 0; font-size: 0.85em; text-align: center; }
    .shirt-grid th { font-weight: bold; }
    .shirt-grid tbody th { text-align: right; white-space: nowrap; }
    .shirt-grid input { width: 3em; margin: 0; text-align: center; }
    /* The per-cell size caption is only used by the stacked phone layout. */
    .shirt-grid td::before { display: none; }

    /* The sidebar keeps the content column under ~575px until roughly 1024px
       wide, which is narrower than this table can draw itself. Below that the
       table stacks rather than scrolling sideways in its box. */
    @media screen and (max-width: 64em) {
      /* Four columns and a nested 5-across grid cannot fit a phone, so each
         line item becomes its own stacked block instead of scrolling.
         Every selector below uses child combinators: a descendant selector
         rooted at #price-table would outrank the .shirt-grid rules further
         down on specificity and flatten the nested grid too. */
      #price-table { min-width: 0; display: block; }
      #price-table > thead { display: none; }
      #price-table > tbody,
      #price-table > tfoot,
      #price-table > tbody > tr,
      #price-table > tfoot > tr,
      #price-table > tbody > tr > td,
      #price-table > tfoot > tr > th { display: block; width: auto; }

      #price-table > tbody > tr[data-item] { padding: 0.5em 0.75em; border-bottom: 1px solid #ccc; }
      #price-table > tbody > tr[data-item] > td { border: 0; padding: 0.15em 0; }

      /* Item name leads the block; the rest are labelled inline. */
      #price-table > tbody > tr > td[data-label="Item"] { font-weight: bold; font-size: 1.05em; }
      #price-table > tbody > tr > td[data-label="Amount"]::before,
      #price-table > tbody > tr > td[data-label="Subtotal"]::before { content: attr(data-label) ": "; font-weight: bold; }

      #price-table > tfoot > tr { padding: 0.5em 0.75em; }
      #price-table > tfoot > tr > th[colspan] { text-align: left !important; }

      /* Shirts: stack the two cuts, wrap the sizes, caption each box. */
      .shirt-grid,
      .shirt-grid tbody,
      .shirt-grid tr { display: block; }
      .shirt-grid thead { display: none; }
      .shirt-grid tbody th { display: block; text-align: left; margin: 0.4em 0 0.2em; }
      .shirt-grid tr { text-align: left; }
      .shirt-grid td { display: inline-block; width: auto; padding: 0 0.35em 0.3em 0; }
      .shirt-grid td::before {
        content: attr(data-size);
        display: block;
        font-size: 0.75em;
        font-weight: bold;
        text-align: center;
      }
      .shirt-grid input { width: 2.9em; }
    }
  </style>

  <div class="price-table-wrap">
  <table border="1" width="100%" cellpadding="6" cellspacing="0" id="price-table">
    <thead>
      <tr>
        <th>Item</th>
        <th>Amount</th>
        <th>Quantity</th>
        <th>Subtotal</th>
      </tr>
    </thead>
    <tbody>
    <tr data-item="tournament">
      <td data-label="Item">Tournament Fee</td>
      <td data-label="Amount">$125</td>
      <td data-label="Quantity"><input type="number" name="tournament_fee_qty" min="0" step="1" value="0"></td>
      <td data-label="Subtotal" class="subtotal">$0</td>
    </tr>
    <tr data-item="mulligan">
      <td data-label="Item">Mulligans (1/Player)</td>
      <td data-label="Amount">$10</td>
      <td data-label="Quantity"><input type="number" name="mulligan_qty" min="0" step="1" value="0"></td>
      <td data-label="Subtotal" class="subtotal">$0</td>
    </tr>
    <tr data-item="clubs">
      <td data-label="Item">Club Rentals (LH or RH)</td>
      <td data-label="Amount">$35</td>
      <td data-label="Quantity"><input type="number" name="club_rental_qty" min="0" step="1" value="0"></td>
      <td data-label="Subtotal" class="subtotal">$0</td>
    </tr>
    <tr data-item="sponsor">
      <td data-label="Item">Corporate Sponsor</td>
      <td data-label="Amount">$1250</td>
      <td data-label="Quantity"><input type="number" name="corp_sponsor_qty" min="0" step="1" value="0"></td>
      <td data-label="Subtotal" class="subtotal">$0</td>
    </tr>
    <tr data-item="shirt">
      <td data-label="Item">Shirt w/ Logo</td>
      <td data-label="Amount">$45</td>
      <td data-label="Quantity">
        <table class="shirt-grid">
          <thead>
            <tr>
              <th></th><th>S</th><th>M</th><th>L</th><th>XL</th><th>XXL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Men's</th>
              <td data-size="S"><input type="number" name="shirt_m_s" min="0" step="1" value="0" aria-label="Men's Small"></td>
              <td data-size="M"><input type="number" name="shirt_m_m" min="0" step="1" value="0" aria-label="Men's Medium"></td>
              <td data-size="L"><input type="number" name="shirt_m_l" min="0" step="1" value="0" aria-label="Men's Large"></td>
              <td data-size="XL"><input type="number" name="shirt_m_xl" min="0" step="1" value="0" aria-label="Men's X-Large"></td>
              <td data-size="XXL"><input type="number" name="shirt_m_xxl" min="0" step="1" value="0" aria-label="Men's XX-Large"></td>
            </tr>
            <tr>
              <th>Women's</th>
              <td data-size="S"><input type="number" name="shirt_w_s" min="0" step="1" value="0" aria-label="Women's Small"></td>
              <td data-size="M"><input type="number" name="shirt_w_m" min="0" step="1" value="0" aria-label="Women's Medium"></td>
              <td data-size="L"><input type="number" name="shirt_w_l" min="0" step="1" value="0" aria-label="Women's Large"></td>
              <td data-size="XL"><input type="number" name="shirt_w_xl" min="0" step="1" value="0" aria-label="Women's X-Large"></td>
              <td data-size="XXL"><input type="number" name="shirt_w_xxl" min="0" step="1" value="0" aria-label="Women's XX-Large"></td>
            </tr>
          </tbody>
        </table>
      </td>
      <td data-label="Subtotal" class="subtotal">$0</td>
    </tr>
    <tr data-item="donation">
      <td data-label="Item">Extra Donation</td>
      <td data-label="Amount">any $ counts</td>
      <td data-label="Quantity">$ <input type="number" name="donation_amount" min="0" step="0.01" placeholder="0.00" style="width:7em"></td>
      <td data-label="Subtotal" class="subtotal">$0</td>
    </tr>
    </tbody>
    <tfoot>
      <tr>
        <th colspan="3" style="text-align:right">Total:</th>
        <th id="grandTotal">$0</th>
      </tr>
    </tfoot>
  </table>
  </div>

  <br/>
  <!-- Hidden field carrying the client-side total; the server recomputes it. -->
  <input type="hidden" name="calculated_total" id="calculatedTotal">

  <p style="font-size: 0.8em">Tournament Fee includes Green Fees, Cart, Range Balls, and Dinner</p><br/>
  <p style="font-size: 0.8em">Corporate Sponsorship includes all Tournament Fees for a full foursome. Each additional foursome is an additional $500. Also includes corporate logo signs on the course and displayed during the dinner</p>
  <br/>
  <label>
    Additional Notes (special requests, etc.):
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
    var button = form.querySelector('button[type="submit"]');
    var submitting = false;

    form.addEventListener('submit', function(e){
      // The endpoint takes a second or two to answer and the page gives no
      // sign it is working, so a registration was submitted three times by
      // someone tapping Submit again. Let the first one through and swallow
      // the rest.
      if (submitting) { e.preventDefault(); return; }
      submitting = true;

      document.getElementById('elapsed_ms').value = String(Date.now() - start);

      if (button) {
        button.textContent = 'Submitting…';
        // Disable on the next tick: a disabled control is omitted from the
        // submission, and doing it inline can drop the button from the POST.
        setTimeout(function(){ button.disabled = true; }, 0);
      }
    });

    // Restoring from the back/forward cache would otherwise leave a dead,
    // permanently disabled button.
    window.addEventListener('pageshow', function(e){
      if (!e.persisted) return;
      submitting = false;
      if (button) { button.disabled = false; button.textContent = 'Submit'; }
    });
  })();
</script>

<script>
(function () {
  // === Prices (keep in sync with PRICES in apps-script/registration/Code.js) ===
  const P = {
    tournament: 125,
    mulligan: 10,
    clubs: 35,
    sponsor_first: 1250,
    sponsor_additional: 500,
    shirt: 45
  };

  const form = document.getElementById('reg-form');
  const table = document.getElementById('price-table');
  if (!form || !table) return;

  const grandEl = document.getElementById('grandTotal');
  const hiddenTotal = document.getElementById('calculatedTotal');

  const toInt = v => {
    const n = Math.floor(Number(v));
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  const toMoney = v => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : 0;
  };
  const money = n => '$' + Number(n).toFixed(2);

  // Sum every quantity box in a row. The shirt row has ten of them; the rest
  // have one, so this works for both.
  function rowQty(tr) {
    let sum = 0;
    tr.querySelectorAll('input[type="number"]').forEach(i => sum += toInt(i.value));
    return sum;
  }

  // First foursome at the base price, each additional one discounted.
  function sponsorCost(q) {
    if (q <= 0) return 0;
    return P.sponsor_first + (q - 1) * P.sponsor_additional;
  }

  // Priced rows are tagged with data-item; the total row is not, so it is
  // skipped automatically.
  function rowSubtotal(tr) {
    switch (tr.dataset.item) {
      case 'tournament': return rowQty(tr) * P.tournament;
      case 'mulligan':   return rowQty(tr) * P.mulligan;
      case 'clubs':      return rowQty(tr) * P.clubs;
      case 'sponsor':    return sponsorCost(rowQty(tr));
      case 'shirt':      return rowQty(tr) * P.shirt;
      case 'donation': {
        const input = tr.querySelector('input[name="donation_amount"]');
        return input ? toMoney(input.value) : 0;
      }
      default: return 0;
    }
  }

  function recomputeAll() {
    let total = 0;
    table.querySelectorAll('tr[data-item]').forEach(tr => {
      const subtotal = rowSubtotal(tr);
      const cell = tr.querySelector('.subtotal');
      if (cell) cell.textContent = money(subtotal);
      total += subtotal;
    });
    total = Math.round(total * 100) / 100;
    if (grandEl) grandEl.textContent = money(total);
    if (hiddenTotal) hiddenTotal.value = total.toFixed(2);
  }

  // One listener on the table covers every current and future quantity box.
  // Values are left exactly as typed — min/step attributes block bad input at
  // submit time, and the server validates independently.
  table.addEventListener('input', function (e) {
    if (e.target && e.target.matches('input[type="number"]')) recomputeAll();
  });

  // Initial compute, which also picks up values the browser restored on a
  // back-navigation.
  recomputeAll();
})();
</script>

<script>
(function () {
  // The "Assign Me a Team" checkbox does double duty: an individual asking to
  // be placed on a team, or a corporate sponsor asking us to find golfers to
  // fill their foursome. Relabel it to match, and reveal the count field only
  // in the sponsor case.
  const form = document.getElementById('reg-form');
  if (!form) return;

  const checkbox = document.getElementById('reg-assign-individual');
  const label = document.querySelector('label[for="reg-assign-individual"]');
  const field = document.getElementById('players-needed-field');
  const input = document.getElementById('players-needed');
  if (!checkbox || !label || !field || !input) return;

  const LABELS = {
    'corp-sponsor': 'We need help filling our team',
    'default': 'Assign Me a Team'
  };

  function sync() {
    const picked = form.querySelector('input[name="registration_type"]:checked');
    const type = picked ? picked.value : '';
    const isSponsor = type === 'corp-sponsor';

    label.textContent = LABELS[type] || LABELS.default;

    const wantsPlayers = isSponsor && checkbox.checked;
    field.style.display = wantsPlayers ? '' : 'none';
    // A disabled input is not submitted, so an individual entry never sends a
    // stray players_needed value.
    input.disabled = !wantsPlayers;
    if (!wantsPlayers) input.value = '';
  }

  form.addEventListener('change', function (e) {
    if (e.target && e.target.matches(
      'input[name="registration_type"], #reg-assign-individual'
    )) sync();
  });

  sync();
})();
</script>


#### Methods of Supporting this Event:
1. Donations (Cash, Check, or Credit Card)
2. Corporate Sponsorship (Click on “Contact Us” at the bottom of the page for details.)
3. Individual Tournament  Fees
4. Volunteers

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

<span style="color: red; font-size: 14pt;"><a title="click to ask for more information" href="{{ site.url }}{{ site.baseurl }}/contact/">Contact Us</a></span>

<iframe style="border: 0;" src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13386.76306708702!2d-96.68634594690322!3d32.98555941717764!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x39e4dda726e0765e!2sSherrill+Park+Golf+Course!5e0!3m2!1sen!2sus!4v1503370333814" width="600" height="450" frameborder="0" allowfullscreen="allowfullscreen"></iframe>
<p align="justify">The tournament format will be a 4 person scramble.  You may enter as an individual or a 4 person team.  The JLMGT committee will insure that all individuals are placed on a team.  Details of the tournament will follow but we need you to start forming your teams (foursomes) for the competition.  <em><strong>We need all team names to be submitted by Friday, September 18, 2026.</strong></em></p>