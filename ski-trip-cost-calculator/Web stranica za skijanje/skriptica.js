document.addEventListener("DOMContentLoaded", () => {
  const brojOsobaInput = document.getElementById("broj-osoba");
  const osobeContainer = document.getElementById("osobe-container");
  const ukupniTrosakDiv = document.getElementById("ukupni-trosak");

  // --- PODACI ---

  const SKIJALISTA = {
    "austrija": ["Bad Kleinkirchheim","Nassfeld","Zell am See - Kaprun","St. Anton","Obertauern","Gerlitzen","Sölden","Schladming","Flachau","Ischgl"],
    "bosna i hercegovina": ["Jahorina","Bjelašnica","Igman","Vlašić","Ravna Planina"],
    "francuska": ["Chamonix","Val Thorens","Tignes","Les Deux Alpes","Alpe d'Huez","La Plagne","Courchevel","Méribel","Avoriaz","Val d'Isère"],
    "hrvatska": ["Bjelolasica","Sljeme","Platak","Čelimbaša"],
    "italija": ["Cortina d'Ampezzo","Livigno","Madonna di Campiglio","Val Gardena","Sestriere","Kronplatz","Alta Badia","Marileva","Cervinia","3 Zinnen Dolomiten"],
    "slovenija": ["Krvavec","Kranjska Gora","Vogel","Mariborsko Pohorje","Rogla","Cerkno"],
    "švicarska": ["Zermatt","St. Moritz","Davos","Verbier","Saas-Fee","Grindelwald-Wengen","Adelboden-Lenk","Engelberg","Arosa-Lenzerheide","Flims-Laax"],
    "svicarska": ["Zermatt","St. Moritz","Davos","Verbier","Saas-Fee","Grindelwald-Wengen","Adelboden-Lenk","Engelberg","Arosa-Lenzerheide","Flims-Laax"]
  };

  const SKI_CIJENE = {
    "austrija": {"Bad Kleinkirchheim":56,"Nassfeld":55,"Zell am See - Kaprun":62,"St. Anton":68,"Obertauern":58,"Gerlitzen":48,"Sölden":65,"Schladming":60,"Flachau":57,"Ischgl":69},
    "bosna i hercegovina": {"Jahorina":35,"Bjelašnica":33,"Igman":25,"Vlašić":28,"Ravna Planina":27},
    "francuska": {"Chamonix":70,"Val Thorens":75,"Tignes":72,"Les Deux Alpes":66,"Alpe d'Huez":68,"La Plagne":64,"Courchevel":78,"Méribel":76,"Avoriaz":63,"Val d'Isère":79},
    "hrvatska": {"Bjelolasica":18,"Sljeme":20,"Platak":25,"Čelimbaša":15},
    "italija": {"Cortina d'Ampezzo":65,"Livigno":60,"Madonna di Campiglio":63,"Val Gardena":66,"Sestriere":58,"Kronplatz":61,"Alta Badia":64,"Marileva":53,"Cervinia":67,"3 Zinnen Dolomiten":59},
    "slovenija": {"Krvavec":40,"Kranjska Gora":42,"Vogel":38,"Mariborsko Pohorje":36,"Rogla":35,"Cerkno":37},
    "švicarska": {"Zermatt":85,"St. Moritz":88,"Davos":82,"Verbier":80,"Saas-Fee":78,"Grindelwald-Wengen":79,"Adelboden-Lenk":74,"Engelberg":72,"Arosa-Lenzerheide":76,"Flims-Laax":73},
    "svicarska": {"Zermatt":85,"St. Moritz":88,"Davos":82,"Verbier":80,"Saas-Fee":78,"Grindelwald-Wengen":79,"Adelboden-Lenk":74,"Engelberg":72,"Arosa-Lenzerheide":76,"Flims-Laax":73}
  };

  // Oprema – baza (najam = €/dan, kupnja = jednokratno)
  const OPREMA_DNEVNO = { skije:18, pancerice:12, kaciga:4, stapovi:3, naocale:4, rukavice:3, odijelo:10, podkapa:2, kapa:1.5 };
  const OPREMA_KUPNJA = { skije:400, pancerice:250, kaciga:100, stapovi:50, naocale:90, rukavice:60, odijelo:200, podkapa:25, kapa:20 };

  // Faktori tržišta po državi (r = najam/servisi, k = kupnja)
  const FAKTORI = {
    "francuska": { r:1.20, k:1.10 }, "švicarska": { r:1.30, k:1.15 }, "svicarska": { r:1.30, k:1.15 },
    "italija": { r:1.10, k:1.05 }, "austrija": { r:1.10, k:1.05 },
    "slovenija": { r:0.95, k:0.98 }, "hrvatska": { r:0.90, k:0.95 }, "bosna i hercegovina": { r:0.85, k:0.90 }
  };

  // Prijevoz po državi (po osobi, povratno)
  const PRIJEVOZ_CIJENE = {
    "austrija":{auto:60,avion:220,autobus:90},
    "bosna i hercegovina":{auto:50,avion:160,autobus:60},
    "francuska":{auto:120,avion:320,autobus:200},
    "hrvatska":{auto:15,avion:50,autobus:10},
    "italija":{auto:90,avion:260,autobus:120},
    "slovenija":{auto:35,avion:90,autobus:30},
    "švicarska":{auto:110,avion:340,autobus:150},
    "svicarska":{auto:110,avion:340,autobus:150}
  };

  // HRANA – rasponi po obroku (EUR)
  const HRANA_RASPON = { restoran:[15,45], kuhanje:[20,40], sendvici:[2,12] };

  // SMJEŠTAJ – €/noć po osobi (raspon) + faktor države
  const SMJESTAJ_RASPON = { apartman:[25,70], hotel:[60,180], hostel:[20,60] };
  const SMJ_FAKTOR = {
    "francuska":1.25, "švicarska":1.35, "svicarska":1.35,
    "italija":1.12, "austrija":1.12,
    "slovenija":0.95, "hrvatska":0.90, "bosna i hercegovina":0.85
  };

  const OPREMA_POPIS = ["skije","pancerice","kaciga","stapovi","naocale","rukavice","odijelo","podkapa","kapa"];
  const EUR = n => `${Number(n).toFixed(2)} €`;
  const faktorDrzave = d => FAKTORI[d] || { r:1, k:1 };
  const smjFaktor = d => SMJ_FAKTOR[d] || 1;

  // --- POMOĆNE ---
  function createSelect(options, attrs = {}) {
    const sel = document.createElement("select");
    Object.entries(attrs).forEach(([k,v]) => sel.setAttribute(k, v));
    options.forEach(opt => {
      const o = document.createElement("option");
      if (typeof opt === "string") { o.value = opt; o.textContent = opt; }
      else { o.value = opt.value; o.textContent = opt.label; }
      sel.appendChild(o);
    });
    return sel;
  }

  function popuniSkijalista(drzava, selectEl) {
    const key = (drzava || "").toLowerCase();
    selectEl.innerHTML = "";
    if (SKIJALISTA[key] && SKIJALISTA[key].length) {
      const first = document.createElement("option");
      first.value = ""; first.textContent = "— Odaberi skijalište —";
      selectEl.appendChild(first);
      SKIJALISTA[key].forEach(naziv => {
        const o = document.createElement("option");
        o.value = naziv; o.textContent = naziv;
        selectEl.appendChild(o);
      });
      selectEl.disabled = false;
    } else {
      const o = document.createElement("option");
      o.value = ""; o.textContent = "— Najprije odaberi državu —";
      selectEl.appendChild(o);
      selectEl.disabled = true;
    }
  }

  function diffNoci(polazakEl, povratakEl) {
    const a = polazakEl.value ? new Date(polazakEl.value) : null;
    const b = povratakEl.value ? new Date(povratakEl.value) : null;
    if (!a || !b) return 1;
    const ms = b - a;
    const d = Math.ceil(ms / (1000*60*60*24));
    return Math.max(1, d || 1);
  }

  // --- GENERIRANJE ---
  function generirajOsobe(n) {
    osobeContainer.innerHTML = "";

    for (let i = 1; i <= n; i++) {
      const blok = document.createElement("div");
      blok.className = "osoba-blok";
      blok.dataset.index = String(i);

      // Osnovno
      const imeLbl = document.createElement("label"); imeLbl.textContent = "Ime i prezime"; imeLbl.classList.add("required");
      const imeIn = document.createElement("input"); imeIn.type = "text"; imeIn.className = "ime"; imeIn.required = true;

      const mobLbl = document.createElement("label"); mobLbl.textContent = "Mobitel";
      const mobIn = document.createElement("input"); mobIn.type = "tel"; mobIn.className = "mobitel";

      const polLbl = document.createElement("label"); polLbl.textContent = "Datum polaska"; polLbl.classList.add("required");
      const polIn = document.createElement("input"); polIn.type = "date"; polIn.className = "polazak"; polIn.required = true;

      const povLbl = document.createElement("label"); povLbl.textContent = "Datum povratka"; povLbl.classList.add("required");
      const povIn = document.createElement("input"); povIn.type = "date"; povIn.className = "povratak"; povIn.required = true;

      const header = document.createElement("h2"); header.textContent = `Osoba ${i}`;
      blok.append(header);

      const grid1 = document.createElement("div"); grid1.className = "grid-2";
      const g1a = document.createElement("div"); g1a.append(imeLbl, imeIn);
      const g1b = document.createElement("div"); g1b.append(mobLbl, mobIn);
      grid1.append(g1a, g1b);

      const grid2 = document.createElement("div"); grid2.className = "grid-2";
      const g2a = document.createElement("div"); g2a.append(polLbl, polIn);
      const g2b = document.createElement("div"); g2b.append(povLbl, povIn);
      grid2.append(g2a, g2b);

      blok.append(grid1, grid2);

      // Država + skijalište
      const drzLbl = document.createElement("label"); drzLbl.textContent = "Država"; drzLbl.classList.add("required");
      const drzSel = createSelect(
        [
          {value:"",label:"— Odaberi —"},
          {value:"austrija",label:"Austrija"},
          {value:"francuska",label:"Francuska"},
          {value:"italija",label:"Italija"},
          {value:"slovenija",label:"Slovenija"},
          {value:"hrvatska",label:"Hrvatska"},
          {value:"bosna i hercegovina",label:"Bosna i Hercegovina"},
          {value:"švicarska",label:"Švicarska"}
        ],
        { class: "drzava", required: "true" }
      );

      const skiLbl = document.createElement("label"); skiLbl.textContent = "Skijalište"; skiLbl.classList.add("required");
      const skiSel = createSelect([{value:"",label:"— Najprije odaberi državu —"}], { class: "skijaliste", disabled: "true", required: "true" });

      blok.append(drzLbl, drzSel, skiLbl, skiSel);

      // Prijevoz
      const prWrap = document.createElement("div"); prWrap.className = "row-inline";
      const prLbl = document.createElement("label"); prLbl.textContent = "Prijevoz";
      const prSel = createSelect(
        [{value:"",label:"— Odaberi —"},{value:"auto",label:"Auto"},{value:"avion",label:"Avion"},{value:"autobus",label:"Autobus"}],
        { class: "prijevoz" }
      );
      const prCij = document.createElement("span"); prCij.className = "chip cijena-prijevoz"; prCij.textContent = "—";
      prWrap.append(prLbl, prSel, prCij);
      blok.append(prWrap);

      // Oprema
      const h3op = document.createElement("h3"); h3op.textContent = "Oprema";
      blok.append(h3op);

      OPREMA_POPIS.forEach(op => {
        const wrap = document.createElement("div"); wrap.className = "row-inline";
        const lab = document.createElement("label");
        lab.textContent = op.charAt(0).toUpperCase() + op.slice(1);
        const sel = createSelect(
          [{value:"imam",label:"Već imam"},{value:"najam",label:"Unajmljujem"},{value:"kupnja",label:"Kupujem"}],
          { class:"oprema", "data-tip": op }
        );
        const span = document.createElement("span");
        span.className = "chip cijena-oprema";
        span.setAttribute("data-tip", op);
        span.textContent = "—";
        wrap.append(lab, sel, span);
        blok.appendChild(wrap);
      });

      // Ski karta
      const h3k = document.createElement("h3"); h3k.textContent = "Ski karta";
      const kartaWrap = document.createElement("div"); kartaWrap.className = "row-inline";
      const kartaLbl = document.createElement("label"); kartaLbl.textContent = "Imaš li kartu?";
      const kartaSel = createSelect([{value:"imam",label:"Imam već"},{value:"kupujem",label:"Kupujem"}], { class:"karta" });
      const kartaCij = document.createElement("span"); kartaCij.className = "chip cijena-karta"; kartaCij.textContent = "—";
      kartaWrap.append(kartaLbl, kartaSel, kartaCij);

      const daniWrap = document.createElement("div"); daniWrap.className = "row-inline";
      const daniLbl = document.createElement("label"); daniLbl.textContent = "Broj dana skijanja";
      const daniIn = document.createElement("input"); daniIn.type = "number"; daniIn.min = "1"; daniIn.value = "1"; daniIn.className = "dani";
      daniWrap.append(daniLbl, daniIn);

      // Hrana
      const h3h = document.createElement("h3"); h3h.textContent = "Hrana";
      const hranaWrap = document.createElement("div"); hranaWrap.className = "row-inline";
      const hrLbl = document.createElement("label"); hrLbl.textContent = "Način prehrane";
      const hrSel = createSelect(
        [
          {value:"",label:"— Odaberi —"},
          {value:"restoran",label:"Restoran (15–45 €/obrok)"},
          {value:"kuhanje",label:"Kuhanje (20–40 €/obrok)"},
          {value:"sendvici",label:"Sendviči (2–12 €/obrok)"}
        ], { class:"hrana" }
      );
      const hrCij = document.createElement("span"); hrCij.className="chip cijena-hrana"; hrCij.textContent="—";
      hranaWrap.append(hrLbl, hrSel, hrCij);

      const obrociWrap = document.createElement("div"); obrociWrap.className = "row-inline";
      const obLbl = document.createElement("label"); obLbl.textContent = "Obroka dnevno";
      const obIn = document.createElement("input"); obIn.type="number"; obIn.min="1"; obIn.max="5"; obIn.value="2"; obIn.className="obroci";
      obrociWrap.append(obLbl, obIn);

      // Smještaj
      const h3s = document.createElement("h3"); h3s.textContent = "Smještaj";
      const smjWrap = document.createElement("div"); smjWrap.className = "row-inline";
      const smjLbl = document.createElement("label"); smjLbl.textContent = "Tip smještaja";
      const smjSel = createSelect(
        [
          {value:"",label:"— Odaberi —"},
          {value:"apartman",label:"Apartman (25–70 €/noć)"},
          {value:"hotel",label:"Hotel (60–180 €/noć)"},
          {value:"hostel",label:"Hostel (20–60 €/noć)"}
        ],
        { class:"smjestaj" }
      );
      const smjCij = document.createElement("span"); smjCij.className = "chip cijena-smjestaj"; smjCij.textContent = "—";
      const nociChip = document.createElement("span"); nociChip.className = "chip noci-info"; nociChip.textContent = "1 noć";
      smjWrap.append(smjLbl, smjSel, smjCij, nociChip);

      // Rezime + trošak
      const rezime = document.createElement("div"); rezime.className = "rezime";
      const trosakP = document.createElement("p");
      trosakP.innerHTML = `<b>Trošak osobe ${i}: <span class="trosak">0 €</span></b>`;

      blok.append(h3k, kartaWrap, daniWrap, h3h, hranaWrap, obrociWrap, h3s, smjWrap, rezime, trosakP);
      osobeContainer.appendChild(blok);

      // Listeners
      function reIzracun(){ azurirajInline(blok); izracunajSve(); }

      [polIn, povIn].forEach(el => el.addEventListener("change", reIzracun));
      drzSel.addEventListener("change", () => { popuniSkijalista(drzSel.value, skiSel); reIzracun(); });

      [skiSel, prSel, kartaSel, daniIn, hrSel, obIn, smjSel].forEach(el => {
        el.addEventListener("change", reIzracun);
        el.addEventListener("input", reIzracun);
      });
      blok.querySelectorAll(".oprema").forEach(sel => sel.addEventListener("change", reIzracun));
    }
  }

  // HRANA
  function cijenaHrane(drzava, tip, dani, obroci) {
    if (!tip) return {min:0,max:0,avg:0};
    const f = faktorDrzave(drzava).r;
    const [mn, mx] = HRANA_RASPON[tip] || [0,0];
    const minUk = mn * obroci * dani * f;
    const maxUk = mx * obroci * dani * f;
    return { min:minUk, max:maxUk, avg:(minUk+maxUk)/2 };
  }

  // SMJEŠTAJ
  function cijenaSmjestaja(drzava, tip, noci) {
    if (!tip) return {min:0,max:0,avg:0};
    const f = smjFaktor(drzava);
    const [mn, mx] = SMJESTAJ_RASPON[tip] || [0,0];
    const minUk = mn * noci * f;
    const maxUk = mx * noci * f;
    return { min:minUk, max:maxUk, avg:(minUk+maxUk)/2 };
  }

  // INLINE
  function azurirajInline(blok) {
    const drzava = (blok.querySelector(".drzava").value || "").toLowerCase();
    const skijaliste = blok.querySelector(".skijaliste").value || "";
    const dani = Math.max(1, parseInt(blok.querySelector(".dani").value) || 1);
    const f = faktorDrzave(drzava);
    const noci = diffNoci(blok.querySelector(".polazak"), blok.querySelector(".povratak"));

    // noći chip refresh
    const stari = blok.querySelector(".noci-info");
    if (stari) {
      const chip = document.createElement("span");
      chip.className = "chip noci-info";
      chip.textContent = `${noci} noć${noci===1?"":"i"}`;
      stari.replaceWith(chip);
    }

    // prijevoz
    const prSel = blok.querySelector(".prijevoz");
    const prSpan = blok.querySelector(".cijena-prijevoz");
    if (drzava && PRIJEVOZ_CIJENE[drzava] && PRIJEVOZ_CIJENE[drzava][prSel.value]) {
      prSpan.textContent = EUR(PRIJEVOZ_CIJENE[drzava][prSel.value]);
    } else { prSpan.textContent = "—"; }

    // oprema
    blok.querySelectorAll(".oprema").forEach(sel => {
      const tip = sel.dataset.tip;
      const span = blok.querySelector(`.cijena-oprema[data-tip="${tip}"]`);
      let iznos = 0;
      if (sel.value === "najam") iznos = (OPREMA_DNEVNO[tip] || 0) * dani * f.r;
      else if (sel.value === "kupnja") iznos = (OPREMA_KUPNJA[tip] || 0) * f.k;
      span.textContent = sel.value === "imam" ? "0 €" : EUR(iznos);
    });

    // ski karta
    const kartaSel = blok.querySelector(".karta");
    const kartaSpan = blok.querySelector(".cijena-karta");
    if (kartaSel.value === "kupujem" && drzava && SKI_CIJENE[drzava] && SKI_CIJENE[drzava][skijaliste]) {
      const cijDan = SKI_CIJENE[drzava][skijaliste];
      kartaSpan.textContent = EUR(cijDan * dani);
    } else { kartaSpan.textContent = kartaSel.value === "imam" ? "0 €" : "—"; }

    // hrana
    const hrSel = blok.querySelector(".hrana");
    const obIn = blok.querySelector(".obroci");
    const hrSpan = blok.querySelector(".cijena-hrana");
    const hr = cijenaHrane(drzava, hrSel.value, dani, Math.max(1, parseInt(obIn.value) || 1));
    hrSpan.textContent = hrSel.value ? `${EUR(hr.min)} – ${EUR(hr.max)} (≈ ${EUR(hr.avg)})` : "—";

    // smještaj
    const smjSel = blok.querySelector(".smjestaj");
    const smjSpan = blok.querySelector(".cijena-smjestaj");
    const smj = cijenaSmjestaja(drzava, smjSel.value, noci);
    smjSpan.textContent = smjSel.value ? `${EUR(smj.min)} – ${EUR(smj.max)} (≈ ${EUR(smj.avg)})` : "—";
  }

  // OBRAČUN
  function obracunOpreme(blok, drzava, dani) {
    const f = faktorDrzave(drzava);
    let suma = 0; const stavke = [];
    blok.querySelectorAll(".oprema").forEach(sel => {
      const tip = sel.dataset.tip;
      if (sel.value === "najam") {
        const iznos = (OPREMA_DNEVNO[tip] || 0) * dani * f.r;
        suma += iznos; stavke.push({ label:`Najam ${tip} × ${dani}d`, iznos });
      } else if (sel.value === "kupnja") {
        const iznos = (OPREMA_KUPNJA[tip] || 0) * f.k;
        suma += iznos; stavke.push({ label:`Kupnja ${tip}`, iznos });
      }
    });
    return { suma, stavke };
  }

  function izracunajTrosakOsobe(blok) {
    let suma = 0;
    const rezime = blok.querySelector(".rezime");
    rezime.innerHTML = "";

    const drzava = (blok.querySelector(".drzava").value || "").toLowerCase();
    const skijaliste = blok.querySelector(".skijaliste").value || "";
    const prijevoz = blok.querySelector(".prijevoz").value || "";
    const karta = blok.querySelector(".karta").value || "imam";
    const dani = Math.max(1, parseInt(blok.querySelector(".dani").value) || 1);
    const obroci = Math.max(1, parseInt(blok.querySelector(".obroci").value) || 1);
    const hrTip = (blok.querySelector(".hrana").value || "");
    const smjTip = (blok.querySelector(".smjestaj")?.value || "");
    const noci = diffNoci(blok.querySelector(".polazak"), blok.querySelector(".povratak"));

    const rows = [];

    // prijevoz
    if (drzava && PRIJEVOZ_CIJENE[drzava] && PRIJEVOZ_CIJENE[drzava][prijevoz]) {
      const iznos = PRIJEVOZ_CIJENE[drzava][prijevoz];
      suma += iznos; rows.push({ label:`Prijevoz (${prijevoz})`, iznos });
    }

    // oprema
    const op = obracunOpreme(blok, drzava, dani);
    suma += op.suma; op.stavke.forEach(s => rows.push(s));

    // ski karta
    if (karta === "kupujem" && drzava && SKI_CIJENE[drzava] && SKI_CIJENE[drzava][skijaliste]) {
      const iznos = SKI_CIJENE[drzava][skijaliste] * dani;
      suma += iznos; rows.push({ label:`Ski karta (${skijaliste}) × ${dani}d`, iznos });
    }

    // hrana (prosjek raspona)
    if (hrTip) {
      const hr = cijenaHrane(drzava, hrTip, dani, obroci);
      suma += hr.avg;
      const naziv = hrTip === "restoran" ? "Restoran" : hrTip === "kuhanje" ? "Kuhanje" : "Sendviči";
      rows.push({ label:`Hrana – ${naziv} (${obroci}x/dan × ${dani}d)`, iznos: hr.avg });
    }

    // smještaj (prosjek raspona)
    if (smjTip) {
      const smj = cijenaSmjestaja(drzava, smjTip, noci);
      suma += smj.avg;
      const naziv = smjTip.charAt(0).toUpperCase() + smjTip.slice(1);
      rows.push({ label:`Smještaj – ${naziv} (${noci} noći)`, iznos: smj.avg });
    }

    // prikaz stavki
    if (rows.length) {
      const ul = document.createElement("ul"); ul.className = "rezime-list";
      rows.forEach(r => {
        const li = document.createElement("li");
        li.textContent = `${r.label}: ${EUR(r.iznos)}`;
        ul.appendChild(li);
      });
      rezime.appendChild(ul);
    }

    blok.querySelector(".trosak").textContent = EUR(suma);
    return suma;
  }

  function izracunajSve() {
    let total = 0;
    document.querySelectorAll(".osoba-blok").forEach(blok => {
      azurirajInline(blok);
      total += izracunajTrosakOsobe(blok);
    });
    ukupniTrosakDiv.textContent = EUR(total);
  }

  // --- VALIDACIJA OBAVEZNIH POLJA ---
  function validateRequired() {
    const errors = [];
    document.querySelectorAll(".osoba-blok").forEach((blok, i) => {
      const idx = i + 1;
      const ime = blok.querySelector(".ime");
      const pol = blok.querySelector(".polazak");
      const pov = blok.querySelector(".povratak");
      const drz = blok.querySelector(".drzava");
      const ski = blok.querySelector(".skijaliste");

      [ime, pol, pov, drz, ski].forEach(el => el && el.classList.remove("error"));

      if (!ime?.value.trim()) { errors.push(`Osoba ${idx}: Ime i prezime je obavezno.`); ime?.classList.add("error"); }
      if (!pol?.value) { errors.push(`Osoba ${idx}: Datum polaska je obavezan.`); pol?.classList.add("error"); }
      if (!pov?.value) { errors.push(`Osoba ${idx}: Datum povratka je obavezan.`); pov?.classList.add("error"); }
      if (!drz?.value) { errors.push(`Osoba ${idx}: Država je obavezna.`); drz?.classList.add("error"); }
      if (!ski?.value) { errors.push(`Osoba ${idx}: Skijalište je obavezno.`); ski?.classList.add("error"); }
    });

    if (errors.length) {
      alert("Molim ispunite obavezna polja:\n\n" + errors.join("\n"));
      const firstErr = document.querySelector(".error");
      if (firstErr) firstErr.focus();
      return false;
    }
    return true;
  }

  // --- INIT ---
  function init() {
    const n = Math.max(1, parseInt(brojOsobaInput.value) || 1);
    generirajOsobe(n);
    izracunajSve();
  }

  brojOsobaInput.addEventListener("input", init);
  init();

  // ====== EXPORT TXT ======

  function formatOsoba(block, idx) {
    const ime = block.querySelector(".ime")?.value.trim() || "(bez imena)";
    const mob = block.querySelector(".mobitel")?.value.trim() || "";
    const pol = block.querySelector(".polazak")?.value || "";
    const pov = block.querySelector(".povratak")?.value || "";
    const drz = block.querySelector(".drzava")?.value || "";
    const ski = block.querySelector(".skijaliste")?.value || "";

    const prijevoz = block.querySelector(".prijevoz")?.value || "";
    const prijevozCij = block.querySelector(".cijena-prijevoz")?.textContent.trim() || "—";

    const karta = block.querySelector(".karta")?.value || "";
    const dani = block.querySelector(".dani")?.value || "1";
    const kartaCij = block.querySelector(".cijena-karta")?.textContent.trim() || "—";

    const hranaTip = block.querySelector(".hrana")?.value || "";
    const obroci = block.querySelector(".obroci")?.value || "";
    const hranaCij = block.querySelector(".cijena-hrana")?.textContent.trim() || "—";

    const smjestajTip = block.querySelector(".smjestaj")?.value || "";
    const nociTxt = block.querySelector(".noci-info")?.textContent.trim() || "";
    const smjestajCij = block.querySelector(".cijena-smjestaj")?.textContent.trim() || "";

    const sumOsoba = block.querySelector(".trosak")?.textContent.trim() || "0 €";

    const lines = [];
    lines.push(`Osoba ${idx}: ${ime}`);
    if (mob) lines.push(`Mobitel: ${mob}`);
    if (pol || pov) lines.push(`Datumi: ${pol} → ${pov}`);
    if (drz) lines.push(`Država: ${drz}`);
    if (ski) lines.push(`Skijalište: ${ski}`);
    if (prijevoz) lines.push(`Prijevoz: ${prijevoz} (${prijevozCij})`);
    lines.push(`Ski karta: ${karta}${karta === "kupujem" ? `, ${dani} dana, ${kartaCij}` : ""}`);
    if (hranaTip) lines.push(`Hrana: ${hranaTip}, ${obroci} obroka/dan (${hranaCij})`);
    if (smjestajTip || smjestajCij) {
      lines.push(`Smještaj: ${smjestajTip || "—"}${nociTxt ? `, ${nociTxt}` : ""}${smjestajCij ? ` (${smjestajCij})` : ""}`);
    }

    // Oprema
    lines.push("Oprema:");
    block.querySelectorAll(".oprema").forEach(sel => {
      const tip = sel.dataset.tip;
      const izbor = sel.value; // imam | najam | kupnja
      const cijTxt = block.querySelector(`.cijena-oprema[data-tip="${tip}"]`)?.textContent.trim() || "—";
      lines.push(`  - ${tip}: ${izbor} (${cijTxt})`);
    });

    lines.push(`UKUPNO (osoba): ${sumOsoba}`);
    return lines.join("\n");
  }

  function generirajTXT() {
    const blokovi = Array.from(document.querySelectorAll(".osoba-blok"));
    if (!blokovi.length) return "Nema unesenih osoba.\n";

    const lines = [];
    lines.push("IZVJEŠTAJ – Skijanje");
    lines.push(`Datum: ${new Date().toLocaleString()}`);
    lines.push("====================================");
    lines.push("");

    blokovi.forEach((b, i) => {
      lines.push(formatOsoba(b, i + 1));
      lines.push("------------------------------------");
    });

    const total = document.getElementById("ukupni-trosak")?.textContent.trim() || "0 €";
    lines.push(`UKUPNO (sve osobe): ${total}`);
    lines.push("");
    return lines.join("\n");
  }

  function preuzmiTXT() {
    const sadrzaj = generirajTXT();
    const blob = new Blob([sadrzaj], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const datum = new Date().toISOString().slice(0,10);
    a.href = url;
    a.download = `skijanje_izvjestaj_${datum}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Gumb za preuzimanje (ako postoji u HTML-u)
  document.getElementById("preuzmi-txt")?.addEventListener("click", () => {
    izracunajSve();
    if (!validateRequired()) return;
    preuzmiTXT();
  });
});
