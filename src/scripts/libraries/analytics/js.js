
// Copyright 2012 Google Inc. All rights reserved.
(function () {
  const data = {
    resource: {
      version: '1',

      macros: [{
        function: '__e'
      }, {
        function: '__cid'
      }],
      tags: [{
        function: '__rep',
        once_per_event: true,
        vtp_containerId: ['macro', 1],
        tag_id: 1
      }],
      predicates: [{
        function: '_eq',
        arg0: ['macro', 0],
        arg1: 'gtm.js'
      }],
      rules: [
        [['if', 0], ['add', 0]]]
    },
    runtime: []

  }

  /*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
  let aa; const ba = function (a) { let b = 0; return function () { return b < a.length ? { done: !1, value: a[b++] } : { done: !0 } } }; const ca = function (a) { const b = typeof Symbol !== 'undefined' && Symbol.iterator && a[Symbol.iterator]; return b ? b.call(a) : { next: ba(a) } }; const fa = typeof Object.create === 'function' ? Object.create : function (a) { const b = function () {}; b.prototype = a; return new b() }; let ha
  if (typeof Object.setPrototypeOf === 'function')ha = Object.setPrototypeOf; else { let ia; a: { const ka = { a: !0 }; const ma = {}; try { ma.__proto__ = ka; ia = ma.a; break a } catch (a) {}ia = !1 }ha = ia ? function (a, b) { a.__proto__ = b; if (a.__proto__ !== b) throw new TypeError(a + ' is not extensible'); return a } : null }
  const na = ha; const oa = function (a, b) { a.prototype = fa(b.prototype); a.prototype.constructor = a; if (na)na(a, b); else for (const c in b) if (c != 'prototype') if (Object.defineProperties) { const d = Object.getOwnPropertyDescriptor(b, c); d && Object.defineProperty(a, c, d) } else a[c] = b[c]; a.ji = b.prototype }; const pa = this || self; const qa = function (a) { return a }; const ra = {}; const sa = function (a, b) { ra[a] = ra[a] || []; ra[a][b] = !0 }; const ta = function (a) { for (var b = [], c = ra[a] || [], d = 0; d < c.length; d++)c[d] && (b[Math.floor(d / 6)] ^= 1 << d % 6); for (let e = 0; e < b.length; e++)b[e] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.charAt(b[e] || 0); return b.join('') }; const ua = function () {}; const va = function (a) { return typeof a === 'function' }; const g = function (a) { return typeof a === 'string' }; const xa = function (a) { return typeof a === 'number' && !isNaN(a) }; const Ba = function (a) { const b = Object.prototype.toString.call(Object(a)) == '[object Array]'; Array.isArray ? Array.isArray(a) !== b && sa('TAGGING', 4) : sa('TAGGING', 5); return b }; const m = function (a, b) { if (Array.prototype.indexOf) { const c = a.indexOf(b); return typeof c === 'number' ? c : -1 } for (let d = 0; d < a.length; d++) if (a[d] === b) return d; return -1 }; const Ca = function (a, b) {
    if (a && Ba(a)) {
      for (let c =
0; c < a.length; c++) if (a[c] && b(a[c])) return a[c]
    }
  }; const Da = function (a, b) { if (!xa(a) || !xa(b) || a > b)a = 0, b = 2147483647; return Math.floor(Math.random() * (b - a + 1) + a) }; const Fa = function (a, b) { for (var c = new Ea(), d = 0; d < a.length; d++)c.set(a[d], !0); for (let e = 0; e < b.length; e++) if (c.get(b[e])) return !0; return !1 }; const Ga = function (a, b) { for (const c in a)Object.prototype.hasOwnProperty.call(a, c) && b(c, a[c]) }; const Ia = function (a) { return !!a && (Object.prototype.toString.call(a) == '[object Arguments]' || Object.prototype.hasOwnProperty.call(a, 'callee')) }; const Ka =
function (a) { return Math.round(Number(a)) || 0 }; const La = function (a) { return String(a).toLowerCase() == 'false' ? !1 : !!a }; const Ma = function (a) { const b = []; if (Ba(a)) for (let c = 0; c < a.length; c++)b.push(String(a[c])); return b }; const Na = function (a) { return a ? a.replace(/^\s+|\s+$/g, '') : '' }; const Oa = function () { return (new Date()).getTime() }; var Ea = function () { this.prefix = 'gtm.'; this.values = {} }; Ea.prototype.set = function (a, b) { this.values[this.prefix + a] = b }; Ea.prototype.get = function (a) { return this.values[this.prefix + a] }
  const Qa = function (a, b, c) { return a && a.hasOwnProperty(b) ? a[b] : c }; const Ra = function (a) { let b = a; return function () { if (b) { const c = b; b = void 0; try { c() } catch (d) {} } } }; const Va = function (a, b) { for (const c in b)b.hasOwnProperty(c) && (a[c] = b[c]) }; const Wa = function (a) { for (const b in a) if (a.hasOwnProperty(b)) return !0; return !1 }; const Ya = function (a, b) { for (var c = [], d = 0; d < a.length; d++)c.push(a[d]), c.push.apply(c, b[a[d]] || []); return c }; const Za = function (a, b) { for (var c = {}, d = c, e = a.split('.'), f = 0; f < e.length - 1; f++)d = d[e[f]] = {}; d[e[e.length - 1]] = b; return c }; const $a = /^\w{1,9}$/
  const ab = function (a) { const b = []; Ga(a, function (c, d) { $a.test(c) && d && b.push(c) }); return b.join(',') }/*
 jQuery v1.9.1 (c) 2005, 2012 jQuery Foundation, Inc. jquery.org/license. */
  const bb = /\[object (Boolean|Number|String|Function|Array|Date|RegExp)\]/; const db = function (a) { if (a == null) return String(a); const b = bb.exec(Object.prototype.toString.call(Object(a))); return b ? b[1].toLowerCase() : 'object' }; const fb = function (a, b) { return Object.prototype.hasOwnProperty.call(Object(a), b) }; const gb = function (a) {
    if (!a || db(a) != 'object' || a.nodeType || a == a.window) return !1; try { if (a.constructor && !fb(a, 'constructor') && !fb(a.constructor.prototype, 'isPrototypeOf')) return !1 } catch (c) { return !1 } for (var b in a);return void 0 ===
b || fb(a, b)
  }; var B = function (a, b) { const c = b || (db(a) == 'array' ? [] : {}); let d; for (d in a) if (fb(a, d)) { const e = a[d]; db(e) == 'array' ? (db(c[d]) != 'array' && (c[d] = []), c[d] = B(e, c[d])) : gb(e) ? (gb(c[d]) || (c[d] = {}), c[d] = B(e, c[d])) : c[d] = e } return c }; const hb = function (a) { if (void 0 === a || Ba(a) || gb(a)) return !0; switch (typeof a) { case 'boolean':case 'number':case 'string':case 'function':return !0 } return !1 }; const ib = (function () {
    const a = function (b) { return { toString: function () { return b } } }; return {
      Mf: a('consent'),
      Nf: a('consent_always_fire'),
      ae: a('convert_case_to'),
      be: a('convert_false_to'),
      ce: a('convert_null_to'),
      de: a('convert_true_to'),
      ee: a('convert_undefined_to'),
      Th: a('debug_mode_metadata'),
      Sa: a('function'),
      Bg: a('instance_name'),
      Dg: a('live_only'),
      Eg: a('malware_disabled'),
      Fg: a('metadata'),
      Wh: a('original_activity_id'),
      Xh: a('original_vendor_template_id'),
      Hg: a('once_per_event'),
      Te: a('once_per_load'),
      Zh: a('priority_override'),
      $h: a('respected_consent_types'),
      Ye: a('setup_tags'),
      Ze: a('tag_id'),
      $e: a('teardown_tags')
    }
  }()); let Mb
  const Nb = []; const Ob = []; const Pb = []; const Qb = []; const Rb = []; let Sb = {}; let Tb; let Ub; let Vb; const Wb = function (a, b) { const c = a.function; if (!c) throw Error('Error: No function name given for function call.'); const d = Sb[c]; const e = {}; let f; for (f in a) if (a.hasOwnProperty(f)) if (f.indexOf('vtp_') === 0)d && b && b.df && b.df(a[f]), e[void 0 !== d ? f : f.substr(4)] = a[f]; else if (f === ib.Nf.toString() && a[f]) {} return void 0 !== d ? d(e) : Mb(c, e, b) }; const Yb = function (a, b, c) { c = c || []; const d = {}; let e; for (e in a)a.hasOwnProperty(e) && (d[e] = Xb(a[e], b, c)); return d }; var Xb = function (a, b, c) {
    if (Ba(a)) {
      let d; switch (a[0]) {
        case 'function_id':return a[1]; case 'list':d = []; for (let e = 1; e < a.length; e++)d.push(Xb(a[e], b, c)); return d; case 'macro':var f = a[1]; if (c[f]) return; var h = Nb[f]; if (!h || b.Gd(h)) return; c[f] = !0; try {
          const k = Yb(h, b, c); k.vtp_gtmEventId = b.id
          d = Wb(k, b); Vb && (d = Vb.Vg(d, k))
        } catch (z) { b.vf && b.vf(z, Number(f)), d = !1 }c[f] = !1; return d; case 'map':d = {}; for (let l = 1; l < a.length; l += 2)d[Xb(a[l], b, c)] = Xb(a[l + 1], b, c); return d; case 'template':d = []; for (var n = !1, p = 1; p < a.length; p++) { const q = Xb(a[p], b, c); Ub && (n = n || q === Ub.oc); d.push(q) } return Ub && n ? Ub.Yg(d) : d.join(''); case 'escape':d = Xb(a[1], b, c); if (Ub && Ba(a[1]) && a[1][0] === 'macro' && Ub.qh(a)) return Ub.Eh(d); d = String(d); for (let r = 2; r < a.length; r++)jb[a[r]] && (d = jb[a[r]](d)); return d; case 'tag':var u = a[1]; if (!Qb[u]) {
          throw Error('Unable to resolve tag reference ' +
u + '.')
        } return d = { pf: a[2], index: u }; case 'zb':var t = { arg0: a[2], arg1: a[3], ignore_case: a[5] }; t.function = a[1]; var v = Zb(t, b, c); var x = !!a[4]; return x || v !== 2 ? x !== (v === 1) : null; default:throw Error('Attempting to expand unknown Value type: ' + a[0] + '.')
      }
    } return a
  }; var Zb = function (a, b, c) { try { return Tb(Yb(a, b, c)) } catch (d) { JSON.stringify(a) } return 2 }; const bc = function (a) { function b (r) { for (let u = 0; u < r.length; u++)d[r[u]] = !0 } for (var c = [], d = [], e = $b(a), f = 0; f < Ob.length; f++) { const h = Ob[f]; const k = ac(h, e); if (k) { for (let l = h.add || [], n = 0; n < l.length; n++)c[l[n]] = !0; b(h.block || []) } else k === null && b(h.block || []) } for (var p = [], q = 0; q < Qb.length; q++)c[q] && !d[q] && (p[q] = !0); return p }; var ac = function (a, b) {
    for (let c = a.if || [], d = 0; d < c.length; d++) { const e = b(c[d]); if (e === 0) return !1; if (e === 2) return null } for (let f =
a.unless || [], h = 0; h < f.length; h++) { const k = b(f[h]); if (k === 2) return null; if (k === 1) return !1 } return !0
  }; var $b = function (a) { const b = []; return function (c) { void 0 === b[c] && (b[c] = Zb(Pb[c], a)); return b[c] } }; const cc = { Vg: function (a, b) { b[ib.ae] && typeof a === 'string' && (a = b[ib.ae] == 1 ? a.toLowerCase() : a.toUpperCase()); b.hasOwnProperty(ib.ce) && a === null && (a = b[ib.ce]); b.hasOwnProperty(ib.ee) && void 0 === a && (a = b[ib.ee]); b.hasOwnProperty(ib.de) && !0 === a && (a = b[ib.de]); b.hasOwnProperty(ib.be) && !1 === a && (a = b[ib.be]); return a } }; const E = {
    Eb: '_ee',
    wc: '_syn_or_mod',
    ai: '_uei',
    md: '_eu',
    Yh: '_pci',
    Zc: 'event_callback',
    fc: 'event_timeout',
    da: 'gtag.config',
    xa: 'gtag.get',
    wa: 'purchase',
    cb: 'refund',
    Pa: 'begin_checkout',
    $a: 'add_to_cart',
    ab: 'remove_from_cart',
    Wf: 'view_cart',
    je: 'add_to_wishlist',
    Ga: 'view_item',
    ie: 'view_promotion',
    he: 'select_promotion',
    Vc: 'select_item',
    $b: 'view_item_list',
    fe: 'add_payment_info',
    Vf: 'add_shipping_info',
    Ia: 'value_key',
    Ha: 'value_callback',
    ma: 'allow_ad_personalization_signals',
    gd: 'restricted_data_processing',
    vb: 'allow_google_signals',
    na: 'cookie_expires',
    yb: 'cookie_update',
    Bb: 'session_duration',
    kc: 'session_engaged_time',
    za: 'user_properties',
    Ka: 'transport_url',
    O: 'ads_data_redaction',
    ld: 'user_data',
    hc: 'first_party_collection',
    B: 'ad_storage',
    F: 'analytics_storage',
    Zd: 'region',
    $d: 'wait_for_update'
  }
  E.ac = 'page_view'; E.ke = 'user_engagement'; E.Qf = 'app_remove'; E.Rf = 'app_store_refund'; E.Sf = 'app_store_subscription_cancel'; E.Tf = 'app_store_subscription_convert'; E.Uf = 'app_store_subscription_renew'; E.Xf = 'first_open'; E.Yf = 'first_visit'; E.Zf = 'in_app_purchase'; E.$f = 'session_start'; E.ag = 'allow_custom_scripts'; E.bg = 'allow_display_features'; E.Wc = 'allow_enhanced_conversions'; E.Be = 'enhanced_conversions'; E.eb = 'client_id'; E.aa = 'cookie_domain'; E.cc = 'cookie_name'; E.Qa = 'cookie_path'; E.ya = 'cookie_flags'; E.oa = 'currency'
  E.ve = 'custom_map'; E.cd = 'groups'; E.fb = 'language'; E.te = 'country'; E.Uh = 'non_interaction'; E.kb = 'page_location'; E.Ee = 'page_path'; E.Ja = 'page_referrer'; E.fd = 'page_title'; E.Ab = 'send_page_view'; E.Ra = 'send_to'; E.hd = 'session_engaged'; E.mc = 'session_id'; E.jd = 'session_number'; E.wg = 'tracking_id'; E.qa = 'linker'; E.La = 'url_passthrough'; E.hb = 'accept_incoming'; E.I = 'domains'; E.jb = 'url_position'; E.ib = 'decorate_forms'; E.He = 'phone_conversion_number'; E.Fe = 'phone_conversion_callback'; E.Ge = 'phone_conversion_css_class'; E.Ie =
'phone_conversion_options'; E.qg = 'phone_conversion_ids'; E.pg = 'phone_conversion_country_code'; E.me = 'aw_remarketing'; E.ne = 'aw_remarketing_only'; E.bc = 'gclid'; E.Ma = 'value'; E.rg = 'quantity'; E.gg = 'affiliation'; E.Ae = 'tax'; E.ze = 'shipping'; E.Yc = 'list_name'; E.ye = 'checkout_step'; E.xe = 'checkout_option'; E.hg = 'coupon'; E.ig = 'promotions'; E.Cb = 'transaction_id'; E.Db = 'user_id'; E.sg = 'retoken'; E.xb = 'conversion_linker'; E.wb = 'conversion_cookie_prefix'; E.fa = 'cookie_prefix'; E.Z = 'items'; E.se = 'aw_merchant_id'; E.pe = 'aw_feed_country'
  E.qe = 'aw_feed_language'; E.oe = 'discount'; E.we = 'disable_merchant_reported_purchases'; E.De = 'new_customer'; E.ue = 'customer_lifetime_value'; E.fg = 'dc_natural_search'; E.eg = 'dc_custom_params'; E.xg = 'trip_type'; E.og = 'passengers'; E.mg = 'method'; E.vg = 'search_term'; E.cg = 'content_type'; E.ng = 'optimize_id'; E.jg = 'experiments'; E.zb = 'google_signals'; E.bd = 'google_tld'; E.nc = 'update'; E.ad = 'firebase_id'; E.ic = 'ga_restrict_domain'; E.$c = 'event_settings'; E.Xc = 'dynamic_event_settings'; E.ug = 'screen_name'; E.lg = '_x_19'; E.kg = '_x_20'
  E.ed = 'internal_traffic_results'; E.Je = 'traffic_type'; E.jc = 'referral_exclusion_definition'; E.dd = 'ignore_referrer'; E.kd = 'delivery_postal_code'; E.Ce = 'estimated_delivery_date'; E.dg = 'developer_id'; E.yg = [E.ma, E.Wc, E.vb, E.Z, E.gd, E.aa, E.na, E.ya, E.cc, E.Qa, E.fa, E.yb, E.ve, E.Xc, E.Zc, E.$c, E.fc, E.hc, E.ic, E.zb, E.bd, E.cd, E.ed, E.qa, E.jc, E.Ra, E.Ab, E.Bb, E.kc, E.Ka, E.nc, E.za, E.kd, E.md]; E.Ke = [E.kb, E.Ja, E.fd, E.fb, E.ug, E.Db, E.ad]; E.Ag = [E.Qf, E.Rf, E.Sf, E.Tf, E.Uf, E.Xf, E.Yf, E.Zf, E.$f, E.ke]; const zc = {}; E.Kf = (zc[E.ma] = !0, zc[E.Wc] =
!0, zc[E.me] = !0, zc[E.ne] = !0, zc[E.oe] = !0, zc[E.pe] = !0, zc[E.qe] = !0, zc[E.Z] = !0, zc[E.se] = !0, zc[E.wb] = !0, zc[E.xb] = !0, zc[E.aa] = !0, zc[E.na] = !0, zc[E.ya] = !0, zc[E.fa] = !0, zc[E.oa] = !0, zc[E.ue] = !0, zc[E.we] = !0, zc[E.Be] = !0, zc[E.Ce] = !0, zc[E.ad] = !0, zc[E.hc] = !0, zc[E.fb] = !0, zc[E.De] = !0, zc[E.kb] = !0, zc[E.Ja] = !0, zc[E.Fe] = !0, zc[E.Ge] = !0, zc[E.He] = !0, zc[E.Ie] = !0, zc[E.gd] = !0, zc[E.Ab] = !0, zc[E.Ra] = !0, zc[E.kd] = !0, zc[E.Cb] = !0, zc[E.Ka] = !0, zc[E.nc] = !0, zc[E.La] = !0, zc[E.ld] = !0, zc[E.Db] = !0, zc[E.Ma] = !0, zc)
  E.Me = [E.wa, E.cb, E.Pa, E.$a, E.ab, E.Wf, E.je, E.Ga, E.ie, E.he, E.$b, E.Vc, E.fe, E.Vf]; E.Le = [E.ma, E.vb, E.yb]; E.Ne = [E.na, E.fc, E.Bb, E.kc]; const Ac = function (a) { sa('GTM', a) }; const Bc = function (a, b) { this.m = a; this.defaultValue = void 0 === b ? !1 : b }; const Cc = new Bc(1936, !0); const Dc = new Bc(364295992); const Ec = new Bc(1933); const Fc = function (a, b) { const c = function () {}; c.prototype = a.prototype; const d = new c(); a.apply(d, Array.prototype.slice.call(arguments, 1)); return d }; const Gc = function (a) { let b = a; return function () { if (b) { const c = b; b = null; c() } } }; let Hc; const Ic = function () { if (void 0 === Hc) { let a = null; const b = pa.trustedTypes; if (b && b.createPolicy) { try { a = b.createPolicy('goog#html', { createHTML: qa, createScript: qa, createScriptURL: qa }) } catch (c) { pa.console && pa.console.error(c.message) }Hc = a } else Hc = a } return Hc }; const Kc = function (a, b) { this.m = b === Jc ? a : '' }; Kc.prototype.toString = function () { return this.m + '' }; var Jc = {}; const Lc = /^(?:(?:https?|mailto|ftp):|[^:/?#]*(?:[/?#]|$))/i; let Oc; a: { const Pc = pa.navigator; if (Pc) { const Qc = Pc.userAgent; if (Qc) { Oc = Qc; break a } }Oc = '' } const Rc = function (a) { return Oc.indexOf(a) != -1 }; const Tc = function (a, b, c) { this.m = c === Sc ? a : '' }; Tc.prototype.toString = function () { return this.m.toString() }; const Uc = function (a) { return a instanceof Tc && a.constructor === Tc ? a.m : 'type_error:SafeHtml' }; var Sc = {}; const Vc = function (a) { const b = Ic(); const c = b ? b.createHTML(a) : a; return new Tc(c, null, Sc) }; const Wc = new Tc(pa.trustedTypes && pa.trustedTypes.emptyHTML || '', 0, Sc); const Xc = (function (a) { let b = !1; let c; return function () { b || (c = a(), b = !0); return c } }(function () { const a = document.createElement('div'); const b = document.createElement('div'); b.appendChild(document.createElement('div')); a.appendChild(b); const c = a.firstChild.firstChild; a.innerHTML = Uc(Wc); return !c.parentElement })); const Yc = function (a, b) { if (Xc()) for (;a.lastChild;)a.removeChild(a.lastChild); a.innerHTML = Uc(b) }; let Zc = null; const $c = /^[\w+/_-]+[=]{0,2}$/; const ad = function (a) {
    if (!a.querySelector) return ''; const b = a.querySelector('script[nonce]'); if (b) {
      const c =
b.nonce || b.getAttribute('nonce'); if (c && $c.test(c)) return c
    } return ''
  }; const F = window; const I = document; const bd = navigator; const cd = I.currentScript && I.currentScript.src; const dd = function (a, b) { const c = F[a]; F[a] = void 0 === c ? b : c; return F[a] }; const ed = function (a, b) { b && (a.addEventListener ? a.onload = b : a.onreadystatechange = function () { a.readyState in { loaded: 1, complete: 1 } && (a.onreadystatechange = null, b()) }) }; const fd = function (a, b, c) {
    const d = I.createElement('script'); d.type = 'text/javascript'; d.async = !0; let e; const f = Ic(); const h = f ? f.createScriptURL(a) : a; e = new Kc(h, Jc); d.src = e instanceof Kc && e.constructor === Kc ? e.m : 'type_error:TrustedResourceUrl'
    let k; const l = d.ownerDocument && d.ownerDocument.defaultView; l && l != pa ? k = ad(l.document) : (Zc === null && (Zc = ad(pa.document)), k = Zc); const n = k; n && d.setAttribute('nonce', n); ed(d, b); c && (d.onerror = c); const p = I.getElementsByTagName('script')[0] || I.body || I.head; p.parentNode.insertBefore(d, p); return d
  }; const gd = function () { if (cd) { const a = cd.toLowerCase(); if (a.indexOf('https://') === 0) return 2; if (a.indexOf('http://') === 0) return 3 } return 1 }; const hd = function (a, b) {
    const c = I.createElement('iframe'); c.height = '0'; c.width = '0'; c.style.display =
'none'; c.style.visibility = 'hidden'; const d = I.body && I.body.lastChild || I.body || I.head; d.parentNode.insertBefore(c, d); ed(c, b); void 0 !== a && (c.src = a); return c
  }; const id = function (a, b, c) { const d = new Image(1, 1); d.onload = function () { d.onload = null; b && b() }; d.onerror = function () { d.onerror = null; c && c() }; d.src = a; return d }; const jd = function (a, b, c, d) { a.addEventListener ? a.addEventListener(b, c, !!d) : a.attachEvent && a.attachEvent('on' + b, c) }; const kd = function (a, b, c) {
    a.removeEventListener
      ? a.removeEventListener(b, c, !1)
      : a.detachEvent && a.detachEvent('on' +
b, c)
  }; const J = function (a) { F.setTimeout(a, 0) }; const od = function (a, b) { return a && b && a.attributes && a.attributes[b] ? a.attributes[b].value : null }; const pd = function (a) { let b = a.innerText || a.textContent || ''; b && b != ' ' && (b = b.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '')); b && (b = b.replace(/(\xa0+|\s{2,}|\n|\r\t)/g, ' ')); return b }; const qd = function (a) { let b = I.createElement('div'); const c = Vc('A<div>' + a + '</div>'); Yc(b, c); b = b.lastChild; for (var d = []; b.firstChild;)d.push(b.removeChild(b.firstChild)); return d }; const rd = function (a, b, c) {
    c = c || 100; for (var d = {}, e = 0; e <
b.length; e++)d[b[e]] = !0; for (let f = a, h = 0; f && h <= c; h++) { if (d[String(f.tagName).toLowerCase()]) return f; f = f.parentElement } return null
  }; const sd = function (a) { bd.sendBeacon && bd.sendBeacon(a) || id(a) }; const td = function (a, b) { let c = a[b]; c && typeof c.animVal === 'string' && (c = c.animVal); return c }; const ud = function () { const a = {}; this.m = function (b, c) { return a[b] != null ? a[b] : c }; this.o = function () { a[Ec.m] = !0 } }; ud.m = void 0; ud.o = function () { return ud.m ? ud.m : ud.m = new ud() }; const vd = function (a) { return ud.o().m(a.m, a.defaultValue) }; const wd = []; function xd () { const a = dd('google_tag_data', {}); a.ics || (a.ics = { entries: {}, set: yd, update: zd, addListener: Ad, notifyListeners: Bd, active: !1, usedDefault: !1 }); return a.ics }
  function yd (a, b, c, d, e, f) { const h = xd(); h.active = !0; h.usedDefault = !0; if (void 0 != b) { const k = h.entries; const l = k[a] || {}; const n = l.region; const p = c && g(c) ? c.toUpperCase() : void 0; d = d.toUpperCase(); e = e.toUpperCase(); if (d === '' || p === e || (p === d ? n !== e : !p && !n)) { const q = !!(f && f > 0 && void 0 === l.update); const r = { region: p, initial: b === 'granted', update: l.update, quiet: q }; if (d !== '' || !1 !== l.initial)k[a] = r; q && F.setTimeout(function () { k[a] === r && r.quiet && (r.quiet = !1, Cd(a), Bd(), sa('TAGGING', 2)) }, f) } } }
  function zd (a, b) { const c = xd(); c.active = !0; if (void 0 != b) { const d = Dd(a); const e = c.entries; const f = e[a] = e[a] || {}; f.update = b === 'granted'; const h = Dd(a); f.quiet ? (f.quiet = !1, Cd(a)) : h !== d && Cd(a) } } function Ad (a, b) { wd.push({ ff: a, gh: b }) } function Cd (a) { for (let b = 0; b < wd.length; ++b) { const c = wd[b]; Ba(c.ff) && c.ff.indexOf(a) !== -1 && (c.yf = !0) } } function Bd (a) { for (let b = 0; b < wd.length; ++b) { const c = wd[b]; if (c.yf) { c.yf = !1; try { c.gh({ ef: a }) } catch (d) {} } } }
  var Dd = function (a) { const b = xd().entries[a] || {}; return void 0 !== b.update ? b.update : void 0 !== b.initial ? b.initial : void 0 }; const Ed = function (a) { return (xd().entries[a] || {}).initial }; const Fd = function (a) { return !(xd().entries[a] || {}).quiet }; const Gd = function () { return vd(Ec) ? xd().active : !1 }; const Hd = function () { return xd().usedDefault }; const Id = function (a, b) { xd().addListener(a, b) }; const Jd = function (a, b) { function c () { for (let e = 0; e < b.length; e++) if (!Fd(b[e])) return !0; return !1 } if (c()) { let d = !1; Id(b, function (e) { d || c() || (d = !0, a(e)) }) } else a({}) }; const Kd =
function (a, b) { if (!1 === Dd(b)) { let c = !1; Id([b], function (d) { !c && Dd(b) && (a(d), c = !0) }) } }; function Ld (a) { for (var b = [], c = 0; c < Md.length; c++) { const d = a(Md[c]); b[c] = !0 === d ? '1' : !1 === d ? '0' : '-' } return b.join('') }
  var Md = [E.B, E.F]; const Nd = function (a) { const b = a[E.Zd]; b && Ac(40); const c = a[E.$d]; c && Ac(41); for (let d = Ba(b) ? b : [b], e = 0; e < d.length; ++e) for (const f in a) if (a.hasOwnProperty(f) && f !== E.Zd && f !== E.$d) if (m(Md, f) > -1) { const h = f; const k = a[f]; const l = d[e]; xd().set(h, k, l, 'CA', 'CA-ON', c) } else {} }; const Od = function (a,
    b) { for (const c in a) if (a.hasOwnProperty(c)) if (m(Md, c) > -1) { const d = c; const e = a[c]; xd().update(d, e) } else {}xd().notifyListeners(b) }; const M = function (a) { const b = Dd(a); return void 0 != b ? b : !0 }; const Pd = function () { return 'G1' + Ld(Dd) }; const Qd = function (a, b) { Jd(a, b) }; const Sd = function (a) { return Rd ? I.querySelectorAll(a) : null }; const Td = function (a, b) {
    if (!Rd) return null; if (Element.prototype.closest) try { return a.closest(b) } catch (e) { return null } const c = Element.prototype.matches || Element.prototype.webkitMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector; let d = a; if (!I.documentElement.contains(d)) return null; do { try { if (c.call(d, b)) return d } catch (e) { break }d = d.parentElement || d.parentNode } while (d !== null && d.nodeType === 1)
    return null
  }; let Ud = !1; if (I.querySelectorAll) try { const Vd = I.querySelectorAll(':root'); Vd && Vd.length == 1 && Vd[0] == I.documentElement && (Ud = !0) } catch (a) {} var Rd = Ud; const Wd = function (a) {
    if (I.hidden) return !0; const b = a.getBoundingClientRect(); if (b.top == b.bottom || b.left == b.right || !F.getComputedStyle) return !0; const c = F.getComputedStyle(a, null); if (c.visibility === 'hidden') return !0; for (let d = a, e = c; d;) {
      if (e.display === 'none') return !0; let f = e.opacity; let h = e.filter; if (h) { const k = h.indexOf('opacity('); k >= 0 && (h = h.substring(k + 8, h.indexOf(')', k)), h.charAt(h.length - 1) == '%' && (h = h.substring(0, h.length - 1)), f = Math.min(h, f)) } if (void 0 !== f && f <= 0) return !0; (d = d.parentElement) && (e = F.getComputedStyle(d,
        null))
    } return !1
  }; const ee = /:[0-9]+$/; const fe = function (a, b, c) { for (let d = a.split('&'), e = 0; e < d.length; e++) { const f = d[e].split('='); if (decodeURIComponent(f[0]).replace(/\+/g, ' ') === b) { const h = f.slice(1).join('='); return c ? h : decodeURIComponent(h).replace(/\+/g, ' ') } } }; const me = function (a, b, c, d, e) {
    b && (b = String(b).toLowerCase()); if (b === 'protocol' || b === 'port')a.protocol = ge(a.protocol) || ge(F.location.protocol); b === 'port'
      ? a.port = String(Number(a.hostname ? a.port : F.location.port) || (a.protocol == 'http' ? 80 : a.protocol == 'https' ? 443 : ''))
      : b === 'host' &&
(a.hostname = (a.hostname || F.location.hostname).replace(ee, '').toLowerCase()); return he(a, b, c, d, e)
  }; var he = function (a, b, c, d, e) {
    let f; const h = ge(a.protocol); b && (b = String(b).toLowerCase()); switch (b) {
      case 'url_no_fragment':f = ne(a); break; case 'protocol':f = h; break; case 'host':f = a.hostname.replace(ee, '').toLowerCase(); if (c) { const k = /^www\d*\./.exec(f); k && k[0] && (f = f.substr(k[0].length)) } break; case 'port':f = String(Number(a.port) || (h == 'http' ? 80 : h == 'https' ? 443 : '')); break; case 'path':a.pathname || a.hostname || sa('TAGGING',
        1); f = a.pathname.substr(0, 1) == '/' ? a.pathname : '/' + a.pathname; var l = f.split('/'); m(d || [], l[l.length - 1]) >= 0 && (l[l.length - 1] = ''); f = l.join('/'); break; case 'query':f = a.search.replace('?', ''); e && (f = fe(f, e, void 0)); break; case 'extension':var n = a.pathname.split('.'); f = n.length > 1 ? n[n.length - 1] : ''; f = f.split('/')[0]; break; case 'fragment':f = a.hash.replace('#', ''); break; default:f = a && a.href
    } return f
  }; var ge = function (a) { return a ? a.replace(':', '').toLowerCase() : '' }; var ne = function (a) {
    let b = ''; if (a && a.href) {
      const c = a.href.indexOf('#')
      b = c < 0 ? a.href : a.href.substr(0, c)
    } return b
  }; const oe = function (a) { const b = I.createElement('a'); a && (b.href = a); let c = b.pathname; c[0] !== '/' && (a || sa('TAGGING', 1), c = '/' + c); const d = b.hostname.replace(ee, ''); return { href: b.href, protocol: b.protocol, host: b.host, hostname: d, pathname: c, search: b.search, hash: b.hash, port: b.port } }; const pe = function (a) {
    function b (n) { const p = n.split('=')[0]; return d.indexOf(p) < 0 ? n : p + '=0' } function c (n) { return n.split('&').map(b).filter(function (p) { return void 0 != p }).join('&') } var d = 'gclid dclid gbraid wbraid gclaw gcldc gclha gclgf gclgb _gl'.split(' ')
    const e = oe(a); const f = a.split(/[?#]/)[0]; let h = e.search; let k = e.hash; h[0] === '?' && (h = h.substring(1)); k[0] === '#' && (k = k.substring(1)); h = c(h); k = c(k); h !== '' && (h = '?' + h); k !== '' && (k = '#' + k); let l = '' + f + h + k; l[l.length - 1] === '/' && (l = l.substring(0, l.length - 1)); return l
  }; const qe = new RegExp(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i); const re = new RegExp(/support|noreply/i); const se = 'SCRIPT STYLE IMG SVG PATH BR'.split(' '); const te = ['BR']; function ue (a) { let b; if (a === I.body)b = 'body'; else { let c; if (a.id)c = '#' + a.id; else { let d; if (a.parentElement) { let e; a: { const f = a.parentElement; if (f) { for (let h = 0; h < f.childElementCount; h++) if (f.children[h] === a) { e = h + 1; break a }e = -1 } else e = 1 }d = ue(a.parentElement) + '>:nth-child(' + e + ')' } else d = ''; c = d }b = c } return b }
  function ve (a, b) { if (a.length <= 1) return a; const c = a.filter(b); return c.length == 0 ? a : c } function we (a) { if (a.length == 0) return null; let b; b = ve(a, function (c) { return !re.test(c.Tc) }); b = ve(b, function (c) { return c.element.tagName.toUpperCase() === 'INPUT' }); b = ve(b, function (c) { return !Wd(c.element) }); return b[0] }
  function xe () {
    let a; const b = []; const c = I.body; if (c) { for (var d = c.querySelectorAll('*'), e = 0; e < d.length && e < 1E4; e++) { const f = d[e]; if (!(se.indexOf(f.tagName.toUpperCase()) >= 0)) { for (var h = !1, k = 0; k < f.childElementCount && k < 1E4; k++) if (!(te.indexOf(f.children[k].tagName.toUpperCase()) >= 0)) { h = !0; break }h || b.push(f) } }a = { elements: b, status: d.length > 1E4 ? '2' : '1' } } else a = { elements: b, status: '4' }; for (var l = a, n = l.elements, p = [], q = 0; q < n.length; q++) {
      const r = n[q]; let u = r.textContent; r.value && (u = r.value); if (u) {
        const t = u.match(qe); if (t) {
          const v =
t[0]; var x; if (F.location) { const z = he(F.location, 'host', !0); x = v.toLowerCase().indexOf(z) >= 0 } else x = !1; x || p.push({ element: r, Tc: v })
        }
      }
    } const w = we(p); const y = []; if (w) { const A = w.element; y.push({ Tc: w.Tc, querySelector: ue(A), tagName: A.tagName, isVisible: !Wd(A), type: 1, uf: !0 }) } return { elements: y, status: p.length > 10 ? '3' : l.status }
  } const Le = {}; let O = null; const Me = Math.random(); Le.K = 'UA-38961857-4'; Le.vc = '4s0'; Le.Vh = ''; Le.Pf = 'ChEI8NbohAYQgq/+2f3d9euNARImACC59hvyogSsSdkfMFsO0OtLf2yE7tEBhozXT7KN+6DABoXSRhMaAn9L'; const Ne = { __cl: !0, __ecl: !0, __ehl: !0, __evl: !0, __fal: !0, __fil: !0, __fsl: !0, __hl: !0, __jel: !0, __lcl: !0, __sdl: !0, __tl: !0, __ytl: !0 }; const Oe = { __paused: !0, __tg: !0 }; let Pe; for (Pe in Ne)Ne.hasOwnProperty(Pe) && (Oe[Pe] = !0); let Qe = 'www.googletagmanager.com/gtm.js'; Qe = 'www.googletagmanager.com/gtag/js'
  const Re = Qe; const Se = La(''); let Te = null; let Ue = null; const Ve = '//www.googletagmanager.com/a?id=' + Le.K + '&cv=1'; const We = {}; const Xe = {}; const Ye = function () { const a = O.sequence || 1; O.sequence = a + 1; return a }; Le.Of = ''; const Ze = {}; let $e = new Ea(); let af = {}; const bf = {}; const ef = { name: 'dataLayer', set: function (a, b) { B(Za(a, b), af); cf() }, get: function (a) { return df(a, 2) }, reset: function () { $e = new Ea(); af = {}; cf() } }; var df = function (a, b) { return b != 2 ? $e.get(a) : ff(a) }; var ff = function (a) { let b; const c = a.split('.'); b = b || []; for (var d = af, e = 0; e < c.length; e++) { if (d === null) return !1; if (void 0 === d) break; d = d[c[e]]; if (m(b, d) !== -1) return } return d }; const gf = function (a, b) { bf.hasOwnProperty(a) || ($e.set(a, b), B(Za(a, b), af), cf()) }; var cf = function (a) {
    Ga(bf, function (b, c) {
      $e.set(b, c); B(Za(b, void 0),
        af); B(Za(b, c), af); a && delete bf[b]
    })
  }; const jf = function (a, b, c) { Ze[a] = Ze[a] || {}; Ze[a][b] = hf(b, c) }; var hf = function (a, b) { let c; const d = (void 0 === b ? 2 : b) !== 1 ? ff(a) : $e.get(a); db(d) === 'array' || db(d) === 'object' ? c = B(d) : c = d; return c }; const kf = function (a, b) { if (Ze[a]) return Ze[a][b] }; const lf = function (a, b) { Ze[a] && delete Ze[a][b] }; const of = {}; const pf = function (a, b) { if (F._gtmexpgrp && F._gtmexpgrp.hasOwnProperty(a)) return F._gtmexpgrp[a]; void 0 === of[a] && (of[a] = Math.floor(Math.random() * b)); return of[a] }; const qf = function (a) { let b = 1; let c; let d; let e; if (a) for (b = 0, d = a.length - 1; d >= 0; d--)e = a.charCodeAt(d), b = (b << 6 & 268435455) + e + (e << 14), c = b & 266338304, b = c != 0 ? b ^ c >> 21 : b; return b }; function rf (a, b, c) { for (var d = [], e = b.split(';'), f = 0; f < e.length; f++) { const h = e[f].split('='); const k = h[0].replace(/^\s*|\s*$/g, ''); if (k && k == a) { let l = h.slice(1).join('=').replace(/^\s*|\s*$/g, ''); l && c && (l = decodeURIComponent(l)); d.push(l) } } return d }function sf (a) { return vd(Dc) ? a.origin !== 'null' : !0 }const vf = function (a, b, c, d) { return tf(d) ? rf(a, String(b || uf()), c) : [] }; const yf = function (a, b, c, d, e) { if (tf(e)) { let f = wf(a, d, e); if (f.length === 1) return f[0].id; if (f.length !== 0) { f = xf(f, function (h) { return h.Dc }, b); if (f.length === 1) return f[0].id; f = xf(f, function (h) { return h.Rb }, c); return f[0] ? f[0].id : void 0 } } }; function zf (a, b, c, d) { const e = uf(); const f = window; sf(f) && (f.document.cookie = a); const h = uf(); return e != h || void 0 != c && vf(b, h, !1, d).indexOf(c) >= 0 }
  const Df = function (a, b, c) {
    function d (u, t, v) { if (v == null) return delete h[t], u; h[t] = v; return u + '; ' + t + '=' + v } function e (u, t) { if (t == null) return delete h[t], u; h[t] = !0; return u + '; ' + t } if (!tf(c.Ea)) return 2; let f; void 0 == b ? f = a + '=deleted; expires=' + (new Date(0)).toUTCString() : (c.encode && (b = encodeURIComponent(b)), b = Af(b), f = a + '=' + b); var h = {}; f = d(f, 'path', c.path); let k; c.expires instanceof Date ? k = c.expires.toUTCString() : c.expires != null && (k = '' + c.expires); f = d(f, 'expires', k); f = d(f, 'max-age', c.gi); f = d(f, 'samesite',
      c.hi); c.ii && (f = e(f, 'secure')); const l = c.domain; if (l === 'auto') { for (let n = Bf(), p = 0; p < n.length; ++p) { const q = n[p] !== 'none' ? n[p] : void 0; let r = d(f, 'domain', q); r = e(r, c.flags); if (!Cf(q, c.path) && zf(r, a, b, c.Ea)) return 0 } return 1 }l && l !== 'none' && (f = d(f, 'domain', l)); f = e(f, c.flags); return Cf(l, c.path) ? 1 : zf(f, a, b, c.Ea) ? 0 : 1
  }; const Ef = function (a, b, c) { c.path == null && (c.path = '/'); c.domain || (c.domain = 'auto'); return Df(a, b, c) }
  function xf (a, b, c) { for (var d = [], e = [], f, h = 0; h < a.length; h++) { const k = a[h]; const l = b(k); l === c ? d.push(k) : void 0 === f || l < f ? (e = [k], f = l) : l === f && e.push(k) } return d.length > 0 ? d : e } function wf (a, b, c) { for (var d = [], e = vf(a, void 0, void 0, c), f = 0; f < e.length; f++) { const h = e[f].split('.'); const k = h.shift(); if (!b || b.indexOf(k) !== -1) { let l = h.shift(); l && (l = l.split('-'), d.push({ id: h.join('.'), Dc: 1 * l[0] || 1, Rb: 1 * l[1] || 1 })) } } return d }
  var Af = function (a) { a && a.length > 1200 && (a = a.substring(0, 1200)); return a }; const Kf = /^(www\.)?google(\.com?)?(\.[a-z]{2})?$/; const Lf = /(^|\.)doubleclick\.net$/i; var Cf = function (a, b) { return Lf.test(window.document.location.hostname) || b === '/' && Kf.test(a) }; var uf = function () { return sf(window) ? window.document.cookie : '' }; var Bf = function () {
    const a = []; const b = window.document.location.hostname.split('.'); if (b.length === 4) { const c = b[b.length - 1]; if (parseInt(c, 10).toString() === c) return ['none'] } for (let d = b.length - 2; d >= 0; d--)a.push(b.slice(d).join('.'))
    const e = window.document.location.hostname; Lf.test(e) || Kf.test(e) || a.push('none'); return a
  }; var tf = function (a) { if (!vd(Ec) || !a || !Gd()) return !0; if (!Fd(a)) return !1; const b = Dd(a); return b == null ? !0 : !!b }; const Mf = function (a, b) { a.addEventListener && a.addEventListener.call(a, 'message', b, !1) }; const Nf = function () { return Rc('iPhone') && !Rc('iPod') && !Rc('iPad') }; Rc('Opera'); Rc('Trident') || Rc('MSIE'); Rc('Edge'); !Rc('Gecko') || Oc.toLowerCase().indexOf('webkit') != -1 && !Rc('Edge') || Rc('Trident') || Rc('MSIE') || Rc('Edge'); Oc.toLowerCase().indexOf('webkit') != -1 && !Rc('Edge') && Rc('Mobile'); Rc('Macintosh'); Rc('Windows'); Rc('Linux') || Rc('CrOS'); const Of = pa.navigator || null; Of && (Of.appVersion || '').indexOf('X11'); Rc('Android'); Nf(); Rc('iPad'); Rc('iPod'); Nf() || Rc('iPad') || Rc('iPod'); Oc.toLowerCase().indexOf('kaios'); const Pf = function () { if (!F.crypto) return Math.random(); try { const a = new Uint32Array(1); F.crypto.getRandomValues(a); return a[0] / 65536 / 65536 } catch (b) { return Math.random() } }; const Qf = function (a, b) { for (let c = a, d = 0; d < 50; ++d) { var e; try { e = !(!c.frames || !c.frames[b]) } catch (k) { e = !1 } if (e) return c; var f; a: { try { const h = c.parent; if (h && h != c) { f = h; break a } } catch (k) {}f = null } if (!(c = f)) break } return null }; const Rf = function (a, b) { for (var c = Math.round(2147483647 * (b ? Pf() : Math.random())), d = sf(F) ? I.cookie : null, e = '' + (a ? '' : bd.userAgent) + (d || '') + (I.referrer || ''), f = e.length, h = F.history.length; h > 0;)e += h-- ^ f++; return [c ^ qf(e) & 2147483647, Math.round(Oa() / 1E3)].join('.') }; const Uf = function (a, b, c, d, e) { const f = Sf(b); return yf(a, f, Tf(c), d, e) }; const Vf = function (a, b, c, d) { let e = '' + Sf(c); const f = Tf(d); f > 1 && (e += '-' + f); return [b, e, a].join('.') }; var Sf = function (a) { if (!a) return 1; a = a.indexOf('.') === 0 ? a.substr(1) : a; return a.split('.').length }; var Tf = function (a) {
    if (!a ||
a === '/') return 1; a[0] !== '/' && (a = '/' + a); a[a.length - 1] !== '/' && (a += '/'); return a.split('/').length - 1
  }; function Wf (a, b, c) { let d; const e = Number(a.ob != null ? a.ob : void 0); e !== 0 && (d = new Date((b || Oa()) + 1E3 * (e || 7776E3))); return { path: a.path, domain: a.domain, flags: a.flags, encode: !!c, expires: d } }const Xf = ['1']; const Yf = {}; const bg = function (a) { const b = Zf(a.prefix); if (!Yf[b] && !$f(b, a.path, a.domain)) { const c = Rf(); if (ag(b, c, a) === 0) { const d = dd('google_tag_data', {}); d._gcl_au ? sa('GTM', 57) : d._gcl_au = c }$f(b, a.path, a.domain) } }; function ag (a, b, c) { const d = Vf(b, '1', c.domain, c.path); const e = Wf(c); e.Ea = 'ad_storage'; return Ef(a, d, e) } function $f (a, b, c) { const d = Uf(a, b, c, Xf, 'ad_storage'); d && (Yf[a] = d); return d } function Zf (a) { return (a || '_gcl') + '_au' }const cg = function (a) { for (var b = [], c = I.cookie.split(';'), d = new RegExp('^\\s*' + (a || '_gac') + '_(UA-\\d+-\\d+)=\\s*(.+?)\\s*$'), e = 0; e < c.length; e++) { const f = c[e].match(d); f && b.push({ Vd: f[1], value: f[2], timestamp: Number(f[2].split('.')[1]) || 0 }) }b.sort(function (h, k) { return k.timestamp - h.timestamp }); return b }
  function dg (a, b) { const c = cg(a); const d = {}; if (!c || !c.length) return d; for (let e = 0; e < c.length; e++) { const f = c[e].value.split('.'); if (!(f[0] !== '1' || b && f.length < 3 || !b && f.length !== 3) && Number(f[1])) { d[c[e].Vd] || (d[c[e].Vd] = []); const h = { version: f[0], timestamp: 1E3 * Number(f[1]), ka: f[2] }; b && f.length > 3 && (h.labels = f.slice(3)); d[c[e].Vd].push(h) } } return d }function eg () { for (var a = fg, b = {}, c = 0; c < a.length; ++c)b[a[c]] = c; return b } function gg () { let a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; a += a.toLowerCase() + '0123456789-_'; return a + '.' } let fg, hg
  function ig (a) { function b (l) { for (;d < a.length;) { const n = a.charAt(d++); const p = hg[n]; if (p != null) return p; if (!/^[\s\xa0]*$/.test(n)) throw Error('Unknown base64 encoding at char: ' + n) } return l }fg = fg || gg(); hg = hg || eg(); for (var c = '', d = 0; ;) { const e = b(-1); const f = b(0); const h = b(64); const k = b(64); if (k === 64 && e === -1) return c; c += String.fromCharCode(e << 2 | f >> 4); h != 64 && (c += String.fromCharCode(f << 4 & 240 | h >> 2), k != 64 && (c += String.fromCharCode(h << 6 & 192 | k))) } }let jg; const ng = function () { const a = kg; const b = lg; const c = mg(); const d = function (h) { a(h.target || h.srcElement || {}) }; const e = function (h) { b(h.target || h.srcElement || {}) }; if (!c.init) { jd(I, 'mousedown', d); jd(I, 'keyup', d); jd(I, 'submit', e); const f = HTMLFormElement.prototype.submit; HTMLFormElement.prototype.submit = function () { b(this); f.call(this) }; c.init = !0 } }; const og = function (a, b, c, d, e) { const f = { callback: a, domains: b, fragment: c === 2, placement: c, forms: d, sameHost: e }; mg().decorators.push(f) }; const pg = function (a, b, c) {
    for (var d = mg().decorators, e = {}, f = 0; f < d.length; ++f) {
      const h =
d[f]; var k; if (k = !c || h.forms)a: { const l = h.domains; const n = a; const p = !!h.sameHost; if (l && (p || n !== I.location.hostname)) for (let q = 0; q < l.length; q++) if (l[q] instanceof RegExp) { if (l[q].test(n)) { k = !0; break a } } else if (n.indexOf(l[q]) >= 0 || p && l[q].indexOf(n) >= 0) { k = !0; break a }k = !1 } if (k) { let r = h.placement; void 0 == r && (r = h.fragment ? 2 : 1); r === b && Va(e, h.callback()) }
    } return e
  }; var mg = function () { const a = dd('google_tag_data', {}); let b = a.gl; b && b.decorators || (b = { decorators: [] }, a.gl = b); return b }; const qg = /(.*?)\*(.*?)\*(.*)/; const rg = /^https?:\/\/([^\/]*?)\.?cdn\.ampproject\.org\/?(.*)/; const sg = /^(?:www\.|m\.|amp\.)+/; const tg = /([^?#]+)(\?[^#]*)?(#.*)?/; function ug (a) { return new RegExp('(.*?)(^|&)' + a + '=([^&]*)&?(.*)') }
  const wg = function (a) {
    const b = []; let c; for (c in a) if (a.hasOwnProperty(c)) { const d = a[c]; if (void 0 !== d && d === d && d !== null && d.toString() !== '[object Object]') { b.push(c); const e = b; const f = e.push; var h; const k = String(d); fg = fg || gg(); hg = hg || eg(); for (var l = [], n = 0; n < k.length; n += 3) { const p = n + 1 < k.length; const q = n + 2 < k.length; const r = k.charCodeAt(n); const u = p ? k.charCodeAt(n + 1) : 0; const t = q ? k.charCodeAt(n + 2) : 0; const v = r >> 2; const x = (r & 3) << 4 | u >> 4; let z = (u & 15) << 2 | t >> 6; let w = t & 63; q || (w = 64, p || (z = 64)); l.push(fg[v], fg[x], fg[z], fg[w]) }h = l.join(''); f.call(e, h) } } const y = b.join('*'); return ['1', vg(y),
      y].join('*')
  }; var vg = function (a, b) { const c = [window.navigator.userAgent, (new Date()).getTimezoneOffset(), window.navigator.userLanguage || window.navigator.language, Math.floor((new Date()).getTime() / 60 / 1E3) - (void 0 === b ? 0 : b), a].join('*'); let d; if (!(d = jg)) { for (var e = Array(256), f = 0; f < 256; f++) { for (var h = f, k = 0; k < 8; k++)h = h & 1 ? h >>> 1 ^ 3988292384 : h >>> 1; e[f] = h }d = e }jg = d; for (var l = 4294967295, n = 0; n < c.length; n++)l = l >>> 8 ^ jg[(l ^ c.charCodeAt(n)) & 255]; return ((l ^ -1) >>> 0).toString(36) }; const yg = function () {
    return function (a) {
      const b = oe(F.location.href)
      const c = b.search.replace('?', ''); const d = fe(c, '_gl', !0) || ''; a.query = xg(d) || {}; const e = me(b, 'fragment').match(ug('_gl')); a.fragment = xg(e && e[3] || '') || {}
    }
  }; const zg = function (a) { const b = yg(); const c = mg(); c.data || (c.data = { query: {}, fragment: {} }, b(c.data)); const d = {}; const e = c.data; e && (Va(d, e.query), a && Va(d, e.fragment)); return d }; var xg = function (a) {
    let b; b = void 0 === b ? 3 : b; try {
      if (a) {
        let c; a: { for (let d = a, e = 0; e < 3; ++e) { const f = qg.exec(d); if (f) { c = f; break a }d = decodeURIComponent(d) }c = void 0 } const h = c; if (h && h[1] === '1') {
          const k = h[3]; let l; a: {
            for (let n = h[2], p = 0; p <
b; ++p) if (n === vg(k, p)) { l = !0; break a }l = !1
          } if (l) { for (var q = {}, r = k ? k.split('*') : [], u = 0; u < r.length; u += 2)q[r[u]] = ig(r[u + 1]); return q }
        }
      }
    } catch (t) {}
  }; function Ag (a, b, c, d) { function e (p) { const q = p; const r = ug(a).exec(q); let u = q; if (r) { const t = r[2]; const v = r[4]; u = r[1]; v && (u = u + t + v) }p = u; const x = p.charAt(p.length - 1); p && x !== '&' && (p += '&'); return p + n }d = void 0 === d ? !1 : d; const f = tg.exec(c); if (!f) return ''; const h = f[1]; let k = f[2] || ''; let l = f[3] || ''; var n = a + '=' + b; d ? l = '#' + e(l.substring(1)) : k = '?' + e(k.substring(1)); return '' + h + k + l }
  function Bg (a, b) { const c = (a.tagName || '').toUpperCase() === 'FORM'; const d = pg(b, 1, c); const e = pg(b, 2, c); const f = pg(b, 3, c); if (Wa(d)) { const h = wg(d); c ? Cg('_gl', h, a) : Dg('_gl', h, a, !1) } if (!c && Wa(e)) { const k = wg(e); Dg('_gl', k, a, !0) } for (const l in f) if (f.hasOwnProperty(l))a: { const n = l; const p = f[l]; const q = a; if (q.tagName) { if (q.tagName.toLowerCase() === 'a') { Dg(n, p, q, void 0); break a } if (q.tagName.toLowerCase() === 'form') { Cg(n, p, q); break a } } typeof q === 'string' && Ag(n, p, q, void 0) } }
  function Dg (a, b, c, d) { if (c.href) { const e = Ag(a, b, c.href, void 0 === d ? !1 : d); Lc.test(e) && (c.href = e) } }
  function Cg (a, b, c) { if (c && c.action) { const d = (c.method || '').toLowerCase(); if (d === 'get') { for (var e = c.childNodes || [], f = !1, h = 0; h < e.length; h++) { const k = e[h]; if (k.name === a) { k.setAttribute('value', b); f = !0; break } } if (!f) { const l = I.createElement('input'); l.setAttribute('type', 'hidden'); l.setAttribute('name', a); l.setAttribute('value', b); c.appendChild(l) } } else if (d === 'post') { const n = Ag(a, b, c.action); Lc.test(n) && (c.action = n) } } }
  var kg = function (a) { try { let b; a: { for (let c = a, d = 100; c && d > 0;) { if (c.href && c.nodeName.match(/^a(?:rea)?$/i)) { b = c; break a }c = c.parentNode; d-- }b = null } const e = b; if (e) { const f = e.protocol; f !== 'http:' && f !== 'https:' || Bg(e, e.hostname) } } catch (h) {} }; var lg = function (a) { try { if (a.action) { const b = me(oe(a.action), 'host'); Bg(a, b) } } catch (c) {} }; const Eg = function (a, b, c, d) { ng(); og(a, b, c === 'fragment' ? 2 : 1, !!d, !1) }; const Fg = function (a, b) { ng(); og(a, [he(F.location, 'host', !0)], b, !0, !0) }; const Gg = function () {
    const a = I.location.hostname; const b = rg.exec(I.referrer); if (!b) return !1
    const c = b[2]; const d = b[1]; let e = ''; if (c) { const f = c.split('/'); const h = f[1]; e = h === 's' ? decodeURIComponent(f[2]) : decodeURIComponent(h) } else if (d) { if (d.indexOf('xn--') === 0) return !1; e = d.replace(/-/g, '.').replace(/\.\./g, '-') } const k = a.replace(sg, ''); const l = e.replace(sg, ''); let n; if (!(n = k === l)) { const p = '.' + l; n = k.substring(k.length - p.length, k.length) === p } return n
  }; const Hg = function (a, b) { return !1 === a ? !1 : a || b || Gg() }; const Ig = {}; const Jg = /^\w+$/; const Kg = /^[\w-]+$/; const Lg = { aw: '_aw', dc: '_dc', gf: '_gf', ha: '_ha', gp: '_gp', gb: '_gb' }; const Mg = function () { if (!vd(Ec) || !Gd()) return !0; const a = Dd('ad_storage'); return a == null ? !0 : !!a }; var Ng = function (a, b) { Fd('ad_storage') ? Mg() ? a() : Kd(a, 'ad_storage') : b ? sa('TAGGING', 3) : Jd(function () { Ng(a, !0) }, ['ad_storage']) }; const Pg = function (a) { return Og(a).map(function (b) { return b.ka }) }; var Og = function (a) {
    const b = []; if (!sf(F) || !I.cookie) return b; const c = vf(a, I.cookie, void 0, 'ad_storage'); if (!c || c.length == 0) return b; for (let d = {}, e = 0; e < c.length; d =
{ Xb: d.Xb }, e++) { const f = Qg(c[e]); if (f != null) { const h = f; const k = h.version; d.Xb = h.ka; const l = h.timestamp; const n = h.labels; const p = Ca(b, (function (q) { return function (r) { return r.ka === q.Xb } }(d))); p ? (p.timestamp = Math.max(p.timestamp, l), p.labels = Rg(p.labels, n || [])) : b.push({ version: k, ka: d.Xb, timestamp: l, labels: n }) } }b.sort(function (q, r) { return r.timestamp - q.timestamp }); return Sg(b)
  }; function Rg (a, b) { for (var c = {}, d = [], e = 0; e < a.length; e++)c[a[e]] = !0, d.push(a[e]); for (let f = 0; f < b.length; f++)c[b[f]] || d.push(b[f]); return d }
  function Tg (a) { return a && typeof a === 'string' && a.match(Jg) ? a : '_gcl' }
  const Vg = function () { const a = oe(F.location.href); let b = me(a, 'query', !1, void 0, 'gclid'); let c = me(a, 'query', !1, void 0, 'gclsrc'); let d = me(a, 'query', !1, void 0, 'wbraid'); const e = me(a, 'query', !1, void 0, 'dclid'); if (!b || !c || !d) { const f = a.hash.replace('#', ''); b = b || fe(f, 'gclid', void 0); c = c || fe(f, 'gclsrc', void 0); d = d || fe(f, 'wbraid', void 0) } return Ug(b, c, e, d) }; var Ug = function (a, b, c, d) {
    const e = {}; const f = function (h, k) { e[k] || (e[k] = []); e[k].push(h) }; e.gclid = a; e.gclsrc = b; e.dclid = c; void 0 !== d && Kg.test(d) && (e.gbraid = d, f(d, 'gb')); if (void 0 !== a && a.match(Kg)) {
      switch (b) {
        case void 0:f(a,
          'aw'); break; case 'aw.ds':f(a, 'aw'); f(a, 'dc'); break; case 'ds':f(a, 'dc'); break; case '3p.ds':f(a, 'dc'); break; case 'gf':f(a, 'gf'); break; case 'ha':f(a, 'ha')
      }
    }c && f(c, 'dc'); return e
  }; const Wg = function (a, b) { switch (a) { case void 0:case 'aw':return b === 'aw'; case 'aw.ds':return b === 'aw' || b === 'dc'; case 'ds':case '3p.ds':return b === 'dc'; case 'gf':return b === 'gf'; case 'ha':return b === 'ha' } return !1 }; const Yg = function (a) { const b = Vg(); Ng(function () { Xg(b, a) }) }
  function Xg (a, b, c, d) { function e (p, q) { const r = Zg(p, f); r && (Ef(r, q, h), k = !0) }b = b || {}; d = d || []; var f = Tg(b.prefix); c = c || Oa(); var h = Wf(b, c, !0); h.Ea = 'ad_storage'; var k = !1; const l = Math.round(c / 1E3); const n = function (p) { const q = ['GCL', l, p]; d.length > 0 && q.push(d.join('.')); return q.join('.') }; a.aw && e('aw', n(a.aw[0])); a.dc && e('dc', n(a.dc[0])); a.gf && e('gf', n(a.gf[0])); a.ha && e('ha', n(a.ha[0])); a.gp && e('gp', n(a.gp[0])); (void 0 == Ig.enable_gbraid_cookie_write ? 0 : Ig.enable_gbraid_cookie_write) && !k && a.gb && e('gb', n(a.gb[0])) }
  const ah = function (a, b) { const c = zg(!0); Ng(function () { for (let d = Tg(b.prefix), e = 0; e < a.length; ++e) { const f = a[e]; if (void 0 !== Lg[f]) { const h = Zg(f, d); const k = c[h]; if (k) { const l = Math.min($g(k), Oa()); var n; b: { const p = l; const q = h; if (sf(F)) for (let r = vf(q, I.cookie, void 0, 'ad_storage'), u = 0; u < r.length; ++u) if ($g(r[u]) > p) { n = !0; break b }n = !1 } if (!n) { const t = Wf(b, l, !0); t.Ea = 'ad_storage'; Ef(h, k, t) } } } }Xg(Ug(c.gclid, c.gclsrc), b) }) }; var Zg = function (a, b) { const c = Lg[a]; if (void 0 !== c) return b + c }; var $g = function (a) {
    return bh(a.split('.')).length !== 0
      ? 1E3 * (Number(a.split('.')[1]) ||
0)
      : 0
  }; function Qg (a) { const b = bh(a.split('.')); return b.length === 0 ? null : { version: b[0], ka: b[2], timestamp: 1E3 * (Number(b[1]) || 0), labels: b.slice(3) } } function bh (a) { return a.length < 3 || a[0] !== 'GCL' && a[0] !== '1' || !/^\d+$/.test(a[1]) || !Kg.test(a[2]) ? [] : a }
  const ch = function (a, b, c, d, e) { if (Ba(b) && sf(F)) { const f = Tg(e); const h = function () { for (var k = {}, l = 0; l < a.length; ++l) { const n = Zg(a[l], f); if (n) { const p = vf(n, I.cookie, void 0, 'ad_storage'); p.length && (k[n] = p.sort()[p.length - 1]) } } return k }; Ng(function () { Eg(h, b, c, d) }) } }; var Sg = function (a) { return a.filter(function (b) { return Kg.test(b.ka) }) }; const dh = function (a, b) {
    if (sf(F)) {
      for (var c = Tg(b.prefix), d = {}, e = 0; e < a.length; e++)Lg[a[e]] && (d[a[e]] = Lg[a[e]]); Ng(function () {
        Ga(d, function (f, h) {
          const k = vf(c + h, I.cookie, void 0, 'ad_storage'); k.sort(function (u,
            t) { return $g(t) - $g(u) }); if (k.length) { const l = k[0]; const n = $g(l); const p = bh(l.split('.')).length !== 0 ? l.split('.').slice(3) : []; const q = {}; let r; r = bh(l.split('.')).length !== 0 ? l.split('.')[2] : void 0; q[f] = [r]; Xg(q, b, n, p) }
        })
      })
    }
  }; function eh (a, b) { for (let c = 0; c < b.length; ++c) if (a[b[c]]) return !0; return !1 }
  const fh = function (a) { function b (e, f, h) { h && (e[f] = h) } if (Gd()) { const c = Vg(); if (eh(c, a)) { const d = {}; b(d, 'gclid', c.gclid); b(d, 'dclid', c.dclid); b(d, 'gclsrc', c.gclsrc); b(d, 'wbraid', c.gbraid); Fg(function () { return d }, 3); Fg(function () { const e = {}; return e._up = '1', e }, 1) } } }; function gh (a, b) { const c = Tg(b); const d = Zg(a, c); if (!d) return 0; for (var e = Og(d), f = 0, h = 0; h < e.length; h++)f = Math.max(f, e[h].timestamp); return f }
  function hh (a) { let b = 0; let c; for (c in a) for (let d = a[c], e = 0; e < d.length; e++)b = Math.max(b, Number(d[e].timestamp)); return b }const ih = /^\d+\.fls\.doubleclick\.net$/; function jh (a, b) { Fd(E.B) ? M(E.B) ? a() : Kd(a, E.B) : b ? Ac(42) : Qd(function () { jh(a, !0) }, [E.B]) } function kh (a) { const b = oe(F.location.href); const c = me(b, 'host', !1); if (c && c.match(ih)) { const d = me(b, 'path').split(a + '='); if (d.length > 1) return d[1].split(';')[0].split('?')[0] } }
  function lh (a, b, c) { if (a === 'aw' || a === 'dc' || a === 'gb') { const d = kh('gcl' + a); if (d) return d.split('.') } const e = Tg(b); if (e == '_gcl') { c = void 0 === c ? !0 : c; const f = !M(E.B) && c; let h; h = Vg()[a] || []; if (h.length > 0) return f ? ['0'] : h } const k = Zg(a, e); return k ? Pg(k) : [] } function mh (a) { const b = []; Ga(a, function (c, d) { d = Sg(d); for (var e = [], f = 0; f < d.length; f++)e.push(d[f].ka); e.length && b.push(c + ':' + e.join(',')) }); return b.join(';') }
  const nh = function (a) { const b = kh('gac'); return b ? !M(E.B) && a ? '0' : decodeURIComponent(b) : mh(Mg() ? dg() : {}) }; const oh = function (a) { const b = kh('gacgb'); return b ? !M(E.B) && a ? '0' : decodeURIComponent(b) : mh(Mg() ? dg('_gac_gb', !0) : {}) }; const ph = function (a, b, c) {
    const d = Vg(); const e = []; const f = d.gclid; const h = d.dclid; const k = d.gclsrc || 'aw'; !f || k !== 'aw.ds' && k !== 'aw' && k !== 'ds' || c && !Wg(k, c) || e.push({ ka: f, Ad: k }); !h || c && c !== 'dc' || e.push({ ka: h, Ad: 'ds' }); jh(function () {
      bg(b); const l = Yf[Zf(b.prefix)]; let n = !1; if (l && e.length > 0) for (let p = O.joined_auid = O.joined_auid || {}, q = 0; q < e.length; q++) { const r = e[q]; const u = r.ka; const t = r.Ad; const v = (b.prefix || '_gcl') + '.' + t + '.' + u; if (!p[v]) { let x = 'https://adservice.google.com/pagead/regclk'; x = t === 'gb' ? x + '?gbraid=' + u + '&auid=' + l : x + '?gclid=' + u + '&auid=' + l + '&gclsrc=' + t; sd(x); n = p[v] = !0 } }a == null && (a = n); if (a &&
l) { const z = Zf(b.prefix); const w = Yf[z]; w && ag(z, w, b) }
    })
  }; const qh = function (a) { let b; if (kh('gclaw') || kh('gac') || (Vg().aw || []).length > 0)b = !1; else { let c; if ((Vg().gb || []).length > 0)c = !0; else { const d = Math.max(gh('aw', a), hh(Mg() ? dg() : {})); c = Math.max(gh('gb', a), hh(Mg() ? dg('_gac_gb', !0) : {})) > d }b = c } return b }; const rh = /[A-Z]+/; const sh = /\s/; const th = function (a) { if (g(a) && (a = Na(a), !sh.test(a))) { const b = a.indexOf('-'); if (!(b < 0)) { const c = a.substring(0, b); if (rh.test(c)) { for (var d = a.substring(b + 1).split('/'), e = 0; e < d.length; e++) if (!d[e]) return; return { id: a, prefix: c, containerId: c + '-' + d[0], D: d } } } } }; const vh = function (a) { for (var b = {}, c = 0; c < a.length; ++c) { const d = th(a[c]); d && (b[d.id] = d) }uh(b); const e = []; Ga(b, function (f, h) { e.push(h) }); return e }
  function uh (a) { const b = []; let c; for (c in a) if (a.hasOwnProperty(c)) { const d = a[c]; d.prefix === 'AW' && d.D[1] && b.push(d.containerId) } for (let e = 0; e < b.length; ++e) delete a[b[e]] }const wh = function () { const a = !1; return a }; const yh = function (a, b, c, d) { return (xh() === 2 || d || F.location.protocol != 'http:' ? a : b) + c }; var xh = function () { const a = gd(); let b; if (a === 1)a: { let c = Re; c = c.toLowerCase(); for (var d = 'https://' + c, e = 'http://' + c, f = 1, h = I.getElementsByTagName('script'), k = 0; k < h.length && k < 100; k++) { let l = h[k].src; if (l) { l = l.toLowerCase(); if (l.indexOf(e) === 0) { b = 3; break a }f === 1 && l.indexOf(d) === 0 && (f = 2) } }b = f } else b = a; return b }
  const Ah = function (a, b, c) { if (F[a.functionName]) return b.Kd && J(b.Kd), F[a.functionName]; const d = zh(); F[a.functionName] = d; if (a.zc) for (let e = 0; e < a.zc.length; e++)F[a.zc[e]] = F[a.zc[e]] || zh(); a.Gc && void 0 === F[a.Gc] && (F[a.Gc] = c); fd(yh('https://', 'http://', a.Sd), b.Kd, b.Bh); return d }; var zh = function () { var a = function () { a.q = a.q || []; a.q.push(arguments) }; return a }; const Bh = { functionName: '_googWcmImpl', Gc: '_googWcmAk', Sd: 'www.gstatic.com/wcm/loader.js' }; const Ch = { functionName: '_gaPhoneImpl', Gc: 'ga_wpid', Sd: 'www.gstatic.com/gaphone/loader.js' }
  const Dh = { Lf: '', Jg: '5' }; const Eh = { functionName: '_googCallTrackingImpl', zc: [Ch.functionName, Bh.functionName], Sd: 'www.gstatic.com/call-tracking/call-tracking_' + (Dh.Lf || Dh.Jg) + '.js' }; const Fh = {}; const Gh = function (a, b, c, d) { Ac(22); if (c) { d = d || {}; const e = Ah(Bh, d, a); const f = { ak: a, cl: b }; void 0 === d.Ca && (f.autoreplace = c); e(2, d.Ca, f, c, 0, new Date(), d.options) } }; const Hh = function (a, b, c, d) {
    Ac(21); if (b && c) {
      d = d || {}; for (var e = { countryNameCode: c, destinationNumber: b, retrievalTime: new Date() }, f = 0; f < a.length; f++) {
        const h = a[f]
        Fh[h.id] || (h && h.prefix === 'AW' && !e.adData && h.D.length >= 2 ? (e.adData = { ak: h.D[0], cl: h.D[1] }, Fh[h.id] = !0) : h && h.prefix === 'UA' && !e.gaData && (e.gaData = { gaWpid: h.containerId }, Fh[h.id] = !0))
      }(e.gaData || e.adData) && Ah(Eh, d)(d.Ca, e, d.options)
    }
  }; const Ih = function () { const a = !1; return a }; const Jh = function (a, b) {
    if (a) {
      if (wh()) {} else {
        if (g(a)) {
          const c =
th(a); if (!c) return; a = c
        } let d = void 0; let e = !1; const f = b.getWithConfig(E.qg); if (f && Ba(f)) { d = []; for (let h = 0; h < f.length; h++) { const k = th(f[h]); k && (d.push(k), (a.id === k.id || a.id === a.containerId && a.containerId === k.containerId) && (e = !0)) } } if (!d || e) {
          const l = b.getWithConfig(E.He); let n; if (l) {
            Ba(l) ? n = l : n = [l]; const p = b.getWithConfig(E.Fe); const q = b.getWithConfig(E.Ge); const r = b.getWithConfig(E.Ie); const u = b.getWithConfig(E.pg); const t = p || q; let v = 1; a.prefix !== 'UA' || d || (v = 5); for (let x = 0; x < n.length; x++) {
              if (x < v) {
                if (d)Hh(d, n[x], u, { Ca: t, options: r }); else if (a.prefix === 'AW' &&
a.D[1])Ih() ? Hh([a], n[x], u || 'US', { Ca: t, options: r }) : Gh(a.D[0], a.D[1], n[x], { Ca: t, options: r }); else if (a.prefix === 'UA') if (Ih())Hh([a], n[x], u || 'US', { Ca: t }); else { const z = a.containerId; const w = n[x]; let y = { Ca: t }; Ac(23); if (w) { y = y || {}; const A = Ah(Ch, y, z); const C = {}; void 0 !== y.Ca ? C.receiver = y.Ca : C.replace = w; C.ga_wpid = z; C.destination = w; A(2, new Date(), C) } }
              }
            }
          }
        }
      }
    }
  }
  const Mh = function (a) { if (M(E.B)) return a; a = a.replace(/&url=([^&#]+)/, function (b, c) { const d = pe(decodeURIComponent(c)); return '&url=' + encodeURIComponent(d) }); a = a.replace(/&ref=([^&#]+)/, function (b, c) { const d = pe(decodeURIComponent(c)); return '&ref=' + encodeURIComponent(d) }); return a }; const Nh = function () {
    let a; if (!(a = Se)) {
      let b; if (!0 === F._gtmdgs)b = !0; else {
        const c = bd && bd.userAgent || ''; b = c.indexOf('Safari') < 0 || /Chrome|Coast|Opera|Edg|Silk|Android/.test(c) ||
((/Version\/([\d]+)/.exec(c) || [])[1] || '') < 11
          ? !1
          : !0
      }a = !b
    } if (a) return -1; const d = Ka('1'); return pf(1, 100) < d ? pf(2, 2) : -1
  }; const Oh = function (a) { let b; if (!a || !a.length) return; for (var c = [], d = 0; d < a.length; ++d) { const e = a[d]; e && e.estimated_delivery_date ? c.push('' + e.estimated_delivery_date) : c.push('') }b = c.join(','); return b }; const Ph = new RegExp(/^(.*\.)?(google|youtube|blogger|withgoogle)(\.com?)?(\.[a-z]{2})?\.?$/); const Qh = { cl: ['ecl'], customPixels: ['nonGooglePixels'], ecl: ['cl'], ehl: ['hl'], hl: ['ehl'], html: ['customScripts', 'customPixels', 'nonGooglePixels', 'nonGoogleScripts', 'nonGoogleIframes'], customScripts: ['html', 'customPixels', 'nonGooglePixels', 'nonGoogleScripts', 'nonGoogleIframes'], nonGooglePixels: [], nonGoogleScripts: ['nonGooglePixels'], nonGoogleIframes: ['nonGooglePixels'] }; const Rh = {
    cl: ['ecl'],
    customPixels: ['customScripts', 'html'],
    ecl: ['cl'],
    ehl: ['hl'],
    hl: ['ehl'],
    html: ['customScripts'],
    customScripts: ['html'],
    nonGooglePixels: ['customPixels', 'customScripts', 'html', 'nonGoogleScripts', 'nonGoogleIframes'],
    nonGoogleScripts: ['customScripts', 'html'],
    nonGoogleIframes: ['customScripts', 'html', 'nonGoogleScripts']
  }; const Sh = 'google customPixels customScripts html nonGooglePixels nonGoogleScripts nonGoogleIframes'.split(' ')
  const Th = function () { let a = !1; a = !0; return a }; const Vh = function (a) {
    let b = df('gtm.allowlist') || df('gtm.whitelist'); b && Ac(9); Th() && (b = 'google gtagfl lcl zone oid op'.split(' ')); const c = b && Ya(Ma(b), Qh); let d = df('gtm.blocklist') ||
df('gtm.blacklist'); d || (d = df('tagTypeBlacklist')) && Ac(3); d ? Ac(8) : d = []; Uh() && (d = Ma(d), d.push('nonGooglePixels', 'nonGoogleScripts', 'sandboxedScripts')); m(Ma(d), 'google') >= 0 && Ac(2); const e = d && Ya(Ma(d), Rh); const f = {}; return function (h) {
      let k = h && h[ib.Sa]; if (!k || typeof k !== 'string') return !0; k = k.replace(/^_*/, ''); if (void 0 !== f[k]) return f[k]; const l = Xe[k] || []; let n = a(k, l); if (b) {
        let p; if (p =
n)a: { if (m(c, k) < 0) if (l && l.length > 0) for (let q = 0; q < l.length; q++) { if (m(c, l[q]) < 0) { Ac(11); p = !1; break a } } else { p = !1; break a }p = !0 }n = p
      } let r = !1; if (d) { const u = m(e, k) >= 0; if (u)r = u; else { const t = Fa(e, l || []); t && Ac(10); r = t } } let v = !n || r; v || !(m(l, 'sandboxedScripts') >= 0) || c && m(c, 'sandboxedScripts') !== -1 || (v = Fa(e, Sh)); return f[k] = v
    }
  }; var Uh = function () { return Ph.test(F.location && F.location.hostname) }; const Wh = { active: !0, isAllowed: function () { return !0 } }; const Xh = function (a) { const b = O.zones; return b ? b.checkState(Le.K, a) : Wh }; const Yh = function (a) { let b = O.zones; !b && a && (b = O.zones = a()); return b }; const Zh = function () {}; const $h = function () {}; let ai = !1; let bi = 0; const ci = []; function di (a) { if (!ai) { const b = I.createEventObject; const c = I.readyState == 'complete'; const d = I.readyState == 'interactive'; if (!a || a.type != 'readystatechange' || c || !b && d) { ai = !0; for (let e = 0; e < ci.length; e++)J(ci[e]) }ci.push = function () { for (let f = 0; f < arguments.length; f++)J(arguments[f]); return 0 } } } function ei () { if (!ai && bi < 140) { bi++; try { I.documentElement.doScroll('left'), di() } catch (a) { F.setTimeout(ei, 50) } } } const ki = function (a) { ai ? a() : ci.push(a) }; const mi = function (a, b) { this.m = !1; this.H = []; this.W = { tags: [] }; this.ca = !1; this.o = this.C = 0; li(this, a, b) }; const ni = function (a, b, c, d) { if (Oe.hasOwnProperty(b) || b === '__zone') return -1; let e = {}; gb(d) && (e = B(d, e)); e.id = c; e.status = 'timeout'; return a.W.tags.push(e) - 1 }; const oi = function (a, b, c, d) { const e = a.W.tags[b]; e && (e.status = c, e.executionTime = d) }; const pi = function (a) { if (!a.m) { for (let b = a.H, c = 0; c < b.length; c++)b[c](); a.m = !0; a.H.length = 0 } }; var li = function (a, b, c) { va(b) && qi(a, b); c && F.setTimeout(function () { return pi(a) }, Number(c)) }; var qi = function (a,
    b) { const c = Ra(function () { return J(function () { b(Le.K, a.W) }) }); a.m ? c() : a.H.push(c) }; const ri = function (a) { a.C++; return Ra(function () { a.o++; a.ca && a.o >= a.C && pi(a) }) }; const si = function () { function a (d) { return !xa(d) || d < 0 ? 0 : d } if (!O._li && F.performance && F.performance.timing) { const b = F.performance.timing.navigationStart; const c = xa(ef.get('gtm.start')) ? ef.get('gtm.start') : 0; O._li = { cst: a(c - b), cbt: a(Ue - b) } } }; const wi = {}; const xi = function () { return F.GoogleAnalyticsObject && F[F.GoogleAnalyticsObject] }; const yi = !1
  const zi = function (a) { F.GoogleAnalyticsObject || (F.GoogleAnalyticsObject = a || 'ga'); const b = F.GoogleAnalyticsObject; if (F[b])F.hasOwnProperty(b) || Ac(12); else { var c = function () { c.q = c.q || []; c.q.push(arguments) }; c.l = Number(new Date()); F[b] = c }si(); return F[b] }; const Ai = function (a, b, c, d) { b = String(b).replace(/\s+/g, '').split(','); const e = xi(); e(a + 'require', 'linker'); e(a + 'linker:autoLink', b, c, d) }; const Bi = function (a) {
    if (!Gd()) return; const b = xi(); b(a + 'require', 'linker'); b(a +
'linker:passthrough', !0)
  }
  const Di = function (a) {}; const Ci = function () { return F.GoogleAnalyticsObject || 'ga' }; const Ei = function (a, b) {
    return function () {
      const c = xi(); const d = c && c.getByName && c.getByName(a); if (d) {
        const e = d.get('sendHitTask'); d.set('sendHitTask', function (f) {
          const h = f.get('hitPayload'); const k = f.get('hitCallback'); const l = h.indexOf('&tid=' + b) < 0; l && (f.set('hitPayload', h.replace(/&tid=UA-[0-9]+-[0-9]+/, '&tid=' +
b), !0), f.set('hitCallback', void 0, !0)); e(f); l && (f.set('hitPayload', h, !0), f.set('hitCallback', k, !0), f.set('_x_19', void 0, !0), e(f))
        })
      }
    }
  }
  const Ji = function () { return '&tc=' + Qb.filter(function (a) { return a }).length }; const Mi = function () { Ki().length >= 2022 && Li() }; const Oi = function () { Ni || (Ni = F.setTimeout(Li, 500)) }; var Li = function () { Ni && (F.clearTimeout(Ni), Ni = void 0); void 0 === Pi || Qi[Pi] && !Ri && !Si || (Ti[Pi] || Ui.rh() || Vi-- <= 0 ? (Ac(1), Ti[Pi] = !0) : (Ui.Ih(), id(Ki()), Qi[Pi] = !0, Wi = Xi = Yi = Si = Ri = '')) }; var Ki = function () { const a = Pi; if (void 0 === a) return ''; const b = ta('GTM'); const c = ta('TAGGING'); return [Zi, Qi[a] ? '' : '&es=1', $i[a], b ? '&u=' + b : '', c ? '&ut=' + c : '', Ji(), Ri, Si, Yi || '', Xi, Wi, '&z=0'].join('') }
  const bj = function () { Zi = aj() }; var aj = function () { return [Ve, '&v=3&t=t', '&pid=' + Da(), '&rv=' + Le.vc].join('') }; const cj = Math.random() < '0.005000'; var Zi = aj(); var Qi = {}; var Ri = ''; var Si = ''; var Wi = ''; var Xi = ''; var Yi = ''; var Pi = void 0; var $i = {}; var Ti = {}; var Ni = void 0; var Ui = (function (a, b) { let c = 0; let d = 0; return { rh: function () { if (c < a) return !1; Oa() - d >= b && (c = 0); return c >= a }, Ih: function () { Oa() - d >= b && (c = 0); c++; d = Oa() } } }(2, 1E3)); var Vi = 1E3; const dj = function (a, b, c) {
    if (cj && !Ti[a] && b) {
      a !== Pi && (Li(), Pi = a); let d; let e = String(b[ib.Sa] || '').replace(/_/g, ''); e.indexOf('cvt') === 0 && (e = 'cvt')
      d = e; const f = c + d; Ri = Ri ? Ri + '.' + f : '&tr=' + f; const h = b.function; if (!h) throw Error('Error: No function name given for function call.'); const k = (Sb[h] ? '1' : '2') + d; Wi = Wi ? Wi + '.' + k : '&ti=' + k; Oi(); Mi()
    }
  }; const ej = function (a, b, c) { if (cj && !Ti[a]) { a !== Pi && (Li(), Pi = a); const d = c + b; Si = Si ? Si + '.' + d : '&epr=' + d; Oi(); Mi() } }; const fj = function (a, b, c) {}
  function gj (a, b, c, d) { const e = Qb[a]; let f = hj(a, b, c, d); if (!f) return null; const h = Xb(e[ib.Ye], c, []); if (h && h.length) { const k = h[0]; f = gj(k.index, { onSuccess: f, onFailure: k.pf === 1 ? b.terminate : f, terminate: b.terminate }, c, d) } return f }
  function hj (a, b, c, d) {
    function e () {
      if (f[ib.Eg])k(); else {
        const x = Yb(f, c, []); const y = ni(c.Ta, String(f[ib.Sa]), Number(f[ib.Ze]), x[ib.Fg]); let A = !1; x.vtp_gtmOnSuccess = function () {
          if (!A) {
            A = !0; const D = Oa() - G; dj(c.id, Qb[a], '5'); oi(c.Ta, y, 'success',
              D); h()
          }
        }; x.vtp_gtmOnFailure = function () { if (!A) { A = !0; const D = Oa() - G; dj(c.id, Qb[a], '6'); oi(c.Ta, y, 'failure', D); k() } }; x.vtp_gtmTagId = f.tag_id; x.vtp_gtmEventId = c.id; dj(c.id, f, '1'); const C = function () { const D = Oa() - G; dj(c.id, f, '7'); oi(c.Ta, y, 'exception', D); A || (A = !0, k()) }; var G = Oa(); try { Wb(x, c) } catch (D) { C(D) }
      }
    } var f = Qb[a]; var h = b.onSuccess; var k = b.onFailure; const l = b.terminate; if (c.Gd(f)) return null; const n = Xb(f[ib.$e], c, []); if (n && n.length) { const p = n[0]; const q = gj(p.index, { onSuccess: h, onFailure: k, terminate: l }, c, d); if (!q) return null; h = q; k = p.pf === 2 ? l : q } if (f[ib.Te] || f[ib.Hg]) {
      const r = f[ib.Te]
        ? Rb
        : c.Ph; const u = h; const t = k; if (!r[a]) { e = Ra(e); const v = ij(a, r, e); h = v.onSuccess; k = v.onFailure } return function () { r[a](u, t) }
    } return e
  } function ij (a, b, c) { const d = []; const e = []; b[a] = jj(d, e, c); return { onSuccess: function () { b[a] = kj; for (let f = 0; f < d.length; f++)d[f]() }, onFailure: function () { b[a] = lj; for (let f = 0; f < e.length; f++)e[f]() } } } function jj (a, b, c) { return function (d, e) { a.push(d); b.push(e); c() } } function kj (a) { a() } function lj (a, b) { b() }const oj = function (a, b) {
    for (var c = [], d = 0; d < Qb.length; d++) if (a[d]) { const e = Qb[d]; const f = ri(b.Ta); try { const h = gj(d, { onSuccess: f, onFailure: f, terminate: f }, b, d); if (h) { const k = c; const l = k.push; const n = d; const p = e.function; if (!p) throw 'Error: No function name given for function call.'; const q = Sb[p]; l.call(k, { Gf: n, zf: q ? q.priorityOverride || 0 : 0, fh: h }) } else mj(d, b), f() } catch (t) { f() } } const r = b.Ta; r.ca = !0; r.o >= r.C && pi(r); c.sort(nj); for (let u = 0; u < c.length; u++)c[u].fh()
    return c.length > 0
  }; function nj (a, b) { let c; const d = b.zf; const e = a.zf; c = d > e ? 1 : d < e ? -1 : 0; let f; if (c !== 0)f = c; else { const h = a.Gf; const k = b.Gf; f = h > k ? 1 : h < k ? -1 : 0 } return f } function mj (a, b) { if (!cj) return; var c = function (d) { const e = b.Gd(Qb[d]) ? '3' : '4'; const f = Xb(Qb[d][ib.Ye], b, []); f && f.length && c(f[0].index); dj(b.id, Qb[d], e); const h = Xb(Qb[d][ib.$e], b, []); h && h.length && c(h[0].index) }; c(a) }
  let pj = !1; const vj = function (a) {
    const b = a['gtm.uniqueEventId']; const c = a.event; if (c === 'gtm.js') { if (pj) return !1; pj = !0 } let d = Xh(b); let e = !1; if (!d.active) { if (c !== 'gtm.js') return !1; e = !0; d = Xh(Number.MAX_SAFE_INTEGER) }cj && !Ti[b] && Pi !== b && (Li(), Pi = b, Wi = Ri = '', $i[b] = '&e=' + (c.indexOf('gtm.') === 0 ? encodeURIComponent(c) : '*') + '&eid=' + b, Oi()); const f = a.eventCallback; const h = a.eventTimeout; const k = {
      id: b,
      name: c,
      Gd: Vh(d.isAllowed),
      Ph: [],
      vf: function () { Ac(6) },
      df: qj(b),
      Ta: new mi(f,
        h)
    }; sj(b, k.Ta); let l = bc(k); e && (l = tj(l)); const n = oj(l, k); c !== 'gtm.js' && c !== 'gtm.sync' || Di(Le.K); switch (c) { case 'gtm.init':n && Ac(20) } return uj(l, n)
  }; function qj (a) { return function (b) { cj && (hb(b) || fj(a, 'input', b)) } }
  function sj (a, b) { jf(a, 'event', 1); jf(a, 'ecommerce', 1); jf(a, 'gtm'); jf(a, 'eventModel') } function rj () { const a = {}; a.event = hf('event', 1); a.ecommerce = hf('ecommerce', 1); a.gtm = hf('gtm'); a.eventModel = hf('eventModel'); return a } function tj (a) { for (var b = [], c = 0; c < a.length; c++)a[c] && Ne[String(Qb[c][ib.Sa])] && (b[c] = !0); return b }
  function uj (a, b) { if (!b) return b; for (let c = 0; c < a.length; c++) if (a[c] && Qb[c] && !Oe[String(Qb[c][ib.Sa])]) return !0; return !1 } function wj (a, b) { if (a) { let c = '' + a; c.indexOf('http://') !== 0 && c.indexOf('https://') !== 0 && (c = 'https://' + c); c[c.length - 1] === '/' && (c = c.substring(0, c.length - 1)); return oe('' + c + b).href } } function xj (a, b) { return yj() ? wj(a, b) : void 0 } function yj () { const a = !1; return a }const zj = function () { this.eventModel = {}; this.targetConfig = {}; this.containerConfig = {}; this.remoteConfig = {}; this.globalConfig = {}; this.onSuccess = function () {}; this.onFailure = function () {}; this.setContainerTypeLoaded = function () {}; this.getContainerTypeLoaded = function () {}; this.eventId = void 0 }; const Aj = function (a) { const b = new zj(); b.eventModel = a; return b }; const Bj = function (a, b) { a.targetConfig = b; return a }; const Cj = function (a, b) { a.containerConfig = b; return a }; const Dj = function (a, b) { a.remoteConfig = b; return a }; const Ej = function (a, b) {
    a.globalConfig =
b; return a
  }; const Fj = function (a, b) { a.onSuccess = b; return a }; const Gj = function (a, b) { a.setContainerTypeLoaded = b; return a }; const Hj = function (a, b) { a.getContainerTypeLoaded = b; return a }; const Ij = function (a, b) { a.onFailure = b; return a }; zj.prototype.getWithConfig = function (a) { if (void 0 !== this.eventModel[a]) return this.eventModel[a]; if (void 0 !== this.targetConfig[a]) return this.targetConfig[a]; if (void 0 !== this.containerConfig[a]) return this.containerConfig[a]; if (void 0 !== this.remoteConfig[a]) return this.remoteConfig[a]; if (void 0 !== this.globalConfig[a]) return this.globalConfig[a] }
  const Jj = function (a) { function b (e) { Ga(e, function (f) { c[f] = null }) } var c = {}; b(a.eventModel); b(a.targetConfig); b(a.containerConfig); b(a.globalConfig); const d = []; Ga(c, function (e) { d.push(e) }); return d }; let Kj; if (Le.vc.length === 3)Kj = 'g'; else { let Lj = 'G'; Lj = 'g'; Kj = Lj }
  const Mj = { '': 'n', UA: 'u', AW: 'a', DC: 'd', G: 'e', GF: 'f', HA: 'h', GTM: Kj, OPT: 'o' }; const Nj = function (a) { const b = Le.K.split('-'); const c = b[0].toUpperCase(); const d = Mj[c] || 'i'; const e = a && c === 'GTM' ? b[1] : c === 'OPT' ? b[1] : ''; let f; if (Le.vc.length === 3) { let h = 'w'; h = wh() ? 's' : 'o'; f = '2' + h } else f = ''; return f + d + Le.vc + e }; const Oj = function () {}; const Pj = function (a) { void 0 !== a.addtlConsent && typeof a.addtlConsent !== 'string' && (a.addtlConsent = void 0); void 0 !== a.gdprApplies && typeof a.gdprApplies !== 'boolean' && (a.gdprApplies = void 0); return void 0 !== a.tcString && typeof a.tcString !== 'string' || void 0 !== a.listenerId && typeof a.listenerId !== 'number' ? 2 : a.cmpStatus && a.cmpStatus !== 'error' ? 0 : 3 }; const Qj = function (a, b) { this.o = a; this.m = null; this.H = {}; this.ca = 0; this.W = void 0 === b ? 500 : b; this.C = null }; oa(Qj, Oj)
  const Sj = function (a) { return typeof a.o.__tcfapi === 'function' || Rj(a) != null }
  Qj.prototype.addEventListener = function (a) {
    let b = {}; const c = Gc(function () { return a(b) }); let d = 0; this.W !== -1 && (d = setTimeout(function () { b.tcString = 'tcunavailable'; b.internalErrorState = 1; c() }, this.W)); const e = function (f, h) { clearTimeout(d); f ? (b = f, b.internalErrorState = Pj(b), h && b.internalErrorState === 0 || (b.tcString = 'tcunavailable', h || (b.internalErrorState = 3))) : (b.tcString = 'tcunavailable', b.internalErrorState = 3); a(b) }; try { Tj(this, 'addEventListener', e) } catch (f) {
      b.tcString = 'tcunavailable', b.internalErrorState = 3, d && (clearTimeout(d),
      d = 0), c()
    }
  }; Qj.prototype.removeEventListener = function (a) { a && a.listenerId && Tj(this, 'removeEventListener', null, a.listenerId) }
  const Vj = function (a, b, c) {
    let d; d = void 0 === d ? '755' : d; let e; a: { if (a.publisher && a.publisher.restrictions) { const f = a.publisher.restrictions[b]; if (void 0 !== f) { e = f[void 0 === d ? '755' : d]; break a } }e = void 0 } const h = e; if (h === 0) return !1; let k = c; c === 2 ? (k = 0, h === 2 && (k = 1)) : c === 3 && (k = 1, h === 1 && (k = 0)); let l; if (k === 0) if (a.purpose && a.vendor) { const n = Uj(a.vendor.consents, void 0 === d ? '755' : d); l = n && b === '1' && a.purposeOneTreatment && (a.publisherCC === 'DE' || vd(Cc) && a.publisherCC === 'CH') ? !0 : n && Uj(a.purpose.consents, b) } else l = !0; else {
      l =
k === 1 ? a.purpose && a.vendor ? Uj(a.purpose.legitimateInterests, b) && Uj(a.vendor.legitimateInterests, void 0 === d ? '755' : d) : !0 : !0
    } return l
  }; var Uj = function (a, b) { return !(!a || !a[b]) }; var Tj = function (a, b, c, d) { c || (c = function () {}); if (typeof a.o.__tcfapi === 'function') { const e = a.o.__tcfapi; e(b, 2, c, d) } else if (Rj(a)) { Wj(a); const f = ++a.ca; a.H[f] = c; if (a.m) { const h = {}; a.m.postMessage((h.__tcfapiCall = { command: b, version: 2, callId: f, parameter: d }, h), '*') } } else c({}, !1) }; var Rj = function (a) { if (a.m) return a.m; a.m = Qf(a.o, '__tcfapiLocator'); return a.m }
  var Wj = function (a) { a.C || (a.C = function (b) { try { let c; c = (typeof b.data === 'string' ? JSON.parse(b.data) : b.data).__tcfapiReturn; a.H[c.callId](c.returnValue, c.success) } catch (d) {} }, Mf(a.o, a.C)) }; let Xj = !0; Xj = !1; const Yj = { 1: 0, 3: 0, 4: 0, 7: 3, 9: 3, 10: 3 }; function Zj (a, b) { if (a === '') return b; const c = Number(a); return isNaN(c) ? b : c } const ak = Zj('', 550); const bk = Zj('', 500); function ck () { const a = O.tcf || {}; return O.tcf = a }
  const dk = function (a, b) { this.C = a; this.m = b; this.o = Oa() }; const ek = function (a) {}; const fk = function (a) {}; const lk = function () {
    const a = ck(); const b = new Qj(F, Xj ? 3E3 : -1); const c = new dk(b, a); if ((gk() ? !0 === F.gtag_enable_tcf_support : !1 !== F.gtag_enable_tcf_support) && !a.active && (typeof F.__tcfapi === 'function' || Sj(b))) {
      a.active = !0; a.Sb = {}; hk(); let d = null; Xj ? d = F.setTimeout(function () { ik(a); jk(a); d = null }, bk) : a.tcString = 'tcunavailable'; try {
        b.addEventListener(function (e) {
          d && (clearTimeout(d), d = null); if (e.internalErrorState !== 0)ik(a), jk(a), ek(c)
          else {
            let f; a.gdprApplies = e.gdprApplies; if (!1 === e.gdprApplies)f = kk(), b.removeEventListener(e); else if (e.eventStatus === 'tcloaded' || e.eventStatus === 'useractioncomplete' || e.eventStatus === 'cmpuishown') {
              const h = {}; let k; for (k in Yj) {
                if (Yj.hasOwnProperty(k)) {
                  if (k === '1') {
                    var l; const n = e; let p = !0; p = void 0 === p ? !1 : p; var q; const r = n; !1 === r.gdprApplies
                      ? q = !0
                      : (void 0 === r.internalErrorState && (r.internalErrorState = Pj(r)), q = r.cmpStatus === 'error' || r.internalErrorState !== 0 || r.cmpStatus === 'loaded' && (r.eventStatus === 'tcloaded' || r.eventStatus ===
'useractioncomplete')
                          ? !0
                          : !1); l = q ? !1 === n.gdprApplies || n.tcString === 'tcunavailable' || void 0 === n.gdprApplies && !p || typeof n.tcString !== 'string' || !n.tcString.length ? !0 : Vj(n, '1', 0) : !1; h['1'] = l
                  } else h[k] = Vj(e, k, Yj[k])
                }
              } f = h
            }f && (a.tcString = e.tcString || 'tcempty', a.Sb = f, jk(a), ek(c))
          }
        }), fk(c)
      } catch (e) { d && (clearTimeout(d), d = null), ik(a), jk(a) }
    }
  }; function ik (a) { a.type = 'e'; a.tcString = 'tcunavailable'; Xj && (a.Sb = kk()) } function hk () { const a = {}; Nd((a.ad_storage = 'denied', a.wait_for_update = ak, a)) }
  var gk = function () { let a = !1; a = !0; return a }; function kk () { const a = {}; let b; for (b in Yj)Yj.hasOwnProperty(b) && (a[b] = !0); return a } function jk (a) { const b = {}; Od((b.ad_storage = a.Sb['1'] ? 'granted' : 'denied', b)) }
  const mk = function () { const a = ck(); if (a.active && void 0 !== a.loadTime) return Number(a.loadTime) }; const nk = function () { const a = ck(); return a.active ? a.tcString || '' : '' }; const ok = function () { const a = ck(); return a.active && void 0 !== a.gdprApplies ? a.gdprApplies ? '1' : '0' : '' }; const pk = function (a) { if (!Yj.hasOwnProperty(String(a))) return !0; const b = ck(); return b.active && b.Sb ? !!b.Sb[String(a)] : !0 }; const qk = !1; function rk (a) { const b = String(F.location).split(/[?#]/)[0]; const c = Le.Pf || F._CONSENT_MODE_SALT; return a ? c ? String(qf(b + a + c)) : '0' : '' }
  function sk (a) {
    function b (t) {
      let v; O.reported_gclid || (O.reported_gclid = {}); v = O.reported_gclid; let x; x = qk && h && (!Gd() || M(E.B)) ? l + '.' + (f.prefix || '_gcl') + (t ? 'gcu' : 'gcs') : l + (t ? 'gcu' : 'gcs'); if (!v[x]) {
        v[x] = !0; const z = []; const w = {}; const y = function (Q, R) { R && (z.push(Q + '=' + encodeURIComponent(R)), w[Q] = !0) }; let A = 'https://www.google.com'; if (Gd()) {
          const C = M(E.B); y('gcs', Pd()); t && y('gcu', '1'); Hd() && y('gcd', 'G1' + Ld(Ed)); O.dedupe_gclid ||
(O.dedupe_gclid = '' + Rf()); y('rnd', O.dedupe_gclid); if ((!l || n && n !== 'aw.ds') && M(E.B)) { const G = Pg('_gcl_aw'); y('gclaw', G.join('.')) }y('url', String(F.location).split(/[?#]/)[0]); y('dclid', tk(d, p)); let D = !1; D = !0; C || !d && !D || (A = 'https://pagead2.googlesyndication.com')
        }
        y('gdpr_consent', nk()), y('gdpr', ok()); zg(!1)._up === '1' && y('gtm_up', '1'); y('gclid', tk(d, l)); y('gclsrc', n); if (!(w.gclid || w.dclid || w.gclaw) && (y('gbraid', tk(d, q)), !w.gbraid && Gd() && M(E.B))) { const H = Pg('_gcl_gb'); y('gclgb', H.join('.')) }y('gtm', Nj(!e)); qk && h && M(E.B) && (bg(f || {}), y('auid', Yf[Zf(f.prefix)] || ''))
        a.jf && y('did', a.jf); const N = A + '/pagead/landing?' + z.join('&'); sd(N)
      }
    } const c = !!a.wd; var d = !!a.sa; var e = a.T; var f = void 0 === a.Bc ? {} : a.Bc; var h = void 0 === a.Hc ? !0 : a.Hc; const k = Vg(); var l = k.gclid || ''; var n = k.gclsrc; var p = k.dclid || ''; var q = k.gbraid || ''; const r = !c && ((!l || n && n !== 'aw.ds' ? !1 : !0) || q); const u = Gd(); if (r || u)u ? Qd(function () { b(); M(E.B) || Kd(function (t) { return b(!0, t.ef) }, E.B) }, [E.B]) : b()
  } function tk (a, b) { const c = a && !M(E.B); return b && c ? '0' : b } const fl = function () { let a = !0; pk(7) && pk(9) && pk(10) || (a = !1); let b = !0; b = !1; b && !el() && (a = !1); return a }; var el = function () { let a = !0; pk(3) && pk(4) || (a = !1); return a }
  const jl = function (a, b) { const c = b.getWithConfig(E.Ia); const d = b.getWithConfig(E.Ha); const e = b.getWithConfig(c); if (void 0 === e) { let f = void 0; gl.hasOwnProperty(c) ? f = gl[c] : hl.hasOwnProperty(c) && (f = hl[c]); f === 1 && (f = il(c)); g(f) ? xi()(function () { const h = xi().getByName(a).get(f); d(h) }) : d(void 0) } else d(e) }; const ml = function (a, b, c) {
    if (Gd()) {
      let d = !M(E.F); const e = function () {
        const f = xi(); const h = kl(a, b, '', c); let k = void 0; const l = h.Ba._useUp; if (ll(b, h.Ba)) {
          f(function () { const n = f.getByName(b); n && (k = n.get('clientId')); f.remove(b) }); f('create', a, h.Ba)
          d && M(E.F) && (d = !1, f(function () { const n = f.getByName(b); !n || n.get('clientId') == k && l || (h.ra['&gcu'] = '1', n.set(h.nf), n.send('pageview', h.ra)) }))
        }
      }; Kd(e, E.F); Kd(e, E.B)
    }
  }; const tl = function (a, b, c) {
    let d = 'https://www.google-analytics.com/analytics.js'; const e = zi(); if (va(e)) {
      const f = 'gtag_' + a.split('-').join('_'); const h = function (w) { const y = [].slice.call(arguments, 0); y[0] = f + '.' + y[0]; e.apply(window, y) }; const k = function () {
        const w = function (G, D) { for (let H = 0; D && H < D.length; H++)h(G, D[H]) }
        const y = nl(b, c); if (y) { const A = y.action; if (A === 'impressions')w('ec:addImpression', y.nh); else if (A === 'promo_click' || A === 'promo_view') { const C = y.Pd; w('ec:addPromo', y.Pd); C && C.length > 0 && A === 'promo_click' && h('ec:setAction', A) } else w('ec:addProduct', y.pb), h('ec:setAction', A, y.Ib) }
      }; const l = function () { if (wh()) {} else { const w = c.getWithConfig(E.ng); w && (h('require', w, { dataLayer: 'dataLayer' }), h('require', 'render')) } }; const n = kl(a, f, b, c); const p = function (w,
        y, A) { A && (y = '' + y); n.ra[w] = y }; ll(f, n.Ba) && (e(function () { xi() && xi().remove(f) }), ol[f] = !1); e('create', a, n.Ba); if (n.Ba._x_19) { const q = xj(n.Ba._x_19, '/analytics.js'); q && (d = q); n.Ba._x_20 && !ol[f] && (ol[f] = !0, e(Ei(f, n.Ba._x_20))) }(function () { const w = c.getWithConfig('custom_map'); e(function () { if (gb(w)) { const y = n.ra; const A = xi().getByName(f); let C; for (C in w) if (w.hasOwnProperty(C) && /^(dimension|metric)\d+$/.test(C) && void 0 != w[C]) { const G = A.get(il(w[C])); pl(y, C, G) } } }) })(); (function (w) {
        if (w) {
          const y = {}; if (gb(w)) {
            for (const A in ql) {
              ql.hasOwnProperty(A) &&
rl(ql[A], A, w[A], y)
            }
          }h('require', 'linkid', y)
        }
      })(n.linkAttribution); const r = n[E.qa]; if (r && r[E.I]) { const u = r[E.jb]; Ai(f + '.', r[E.I], void 0 === u ? !!r.use_anchor : u === 'fragment', !!r[E.ib]) }h('set', n.nf); b === E.ac
        ? (l(), h('send', 'pageview', n.ra))
        : b === E.da
          ? (l(), Jh(a, c), c.getWithConfig(E.La) && (fh(['aw', 'dc']), Bi(f + '.')), n.sendPageView != 0 && h('send', 'pageview', n.ra), ml(a, f, c))
          : b === E.xa
            ? jl(f, c)
            : b === 'screen_view'
              ? h('send', 'screenview', n.ra)
              : b === 'timing_complete'
                ? (p('timingCategory', n.eventCategory, !0), p('timingVar', n.name,
                    !0), p('timingValue', Ka(n.value)), void 0 !== n.eventLabel && p('timingLabel', n.eventLabel, !0), h('send', 'timing', n.ra))
                : b === 'exception'
                  ? h('send', 'exception', n.ra)
                  : b !== 'optimize.callback' && (m([E.$b, 'select_content', E.Ga, E.$a, E.ab, E.Pa, 'set_checkout_option', E.wa, E.cb, 'view_promotion', 'checkout_progress'], b) >= 0 && (h('require', 'ec', 'ec.js'), k()), p('eventCategory', n.eventCategory, !0), p('eventAction', n.eventAction || b, !0), void 0 !== n.eventLabel && p('eventLabel', n.eventLabel, !0), void 0 !== n.value && p('eventValue', Ka(n.value)),
                  h('send', 'event', n.ra)); const t = !1; let v = sl; t && (v = c.getContainerTypeLoaded('UA')); if (!v) { sl = !0; t && c.setContainerTypeLoaded('UA', !0); si(); const x = function () { t && c.setContainerTypeLoaded('UA', !1); c.onFailure() }; const z = function () { xi().loaded || x() }; wh() ? J(z) : fd(d, z, x) }
    } else J(c.onFailure)
  }; const ul = function (a, b, c, d) { Qd(function () { tl(a, b, d) }, [E.F, E.B]) }; const vl = function (a) { return M(a) }
  let sl; var ol = {}; var gl = { client_id: 1, client_storage: 'storage', cookie_name: 1, cookie_domain: 1, cookie_expires: 1, cookie_path: 1, cookie_update: 1, cookie_flags: 1, sample_rate: 1, site_speed_sample_rate: 1, use_amp_client_id: 1, store_gac: 1, conversion_linker: 'storeGac' }; const wl = { anonymize_ip: 1 }; var hl = {
    app_id: 1,
    app_installer_id: 1,
    app_name: 1,
    app_version: 1,
    campaign: { name: 'campaignName', source: 'campaignSource', medium: 'campaignMedium', term: 'campaignKeyword', content: 'campaignContent', id: 'campaignId' },
    currency: 'currencyCode',
    description: 'exDescription',
    fatal: 'exFatal',
    language: 1,
    non_interaction: 1,
    page_hostname: 'hostname',
    page_referrer: 'referrer',
    page_path: 'page',
    page_location: 'location',
    page_title: 'title',
    screen_name: 1,
    transport_type: 'transport',
    user_id: 1
  }; const xl = { content_id: 1, event_category: 1, event_action: 1, event_label: 1, link_attribution: 1, linker: 1, method: 1, name: 1, send_page_view: 1, value: 1 }; var ql = { cookie_name: 1, cookie_expires: 'duration', levels: 1 }; const yl = { anonymize_ip: 1, fatal: 1, non_interaction: 1, use_amp_client_id: 1, send_page_view: 1, store_gac: 1, conversion_linker: 1 }
  var rl = function (a, b, c, d) { if (void 0 !== c) if (yl[b] && (c = La(c)), b !== 'anonymize_ip' || c || (c = void 0), a === 1)d[il(b)] = c; else if (g(a))d[a] = c; else for (const e in a)a.hasOwnProperty(e) && void 0 !== c[e] && (d[a[e]] = c[e]) }; var il = function (a) { return a && g(a) ? a.replace(/(_[a-z])/g, function (b) { return b[1].toUpperCase() }) : a }; const zl = function (a) {
    let b = 'general'; m([E.fe, E.$a, E.je, E.Pa, 'checkout_progress', E.wa, E.cb, E.ab, 'set_checkout_option'], a) >= 0
      ? b = 'ecommerce'
      : m('generate_lead login search select_content share sign_up view_item view_item_list view_promotion view_search_results'.split(' '),
        a) >= 0
        ? b = 'engagement'
        : a === 'exception' && (b = 'error'); return b
  }; var pl = function (a, b, c) { a.hasOwnProperty(b) || (a[b] = c) }; const Al = function (a) { if (Ba(a)) { for (var b = [], c = 0; c < a.length; c++) { const d = a[c]; if (void 0 != d) { const e = d.id; const f = d.variant; void 0 != e && void 0 != f && b.push(String(e) + '.' + String(f)) } } return b.length > 0 ? b.join('!') : void 0 } }; var kl = function (a, b, c, d) {
    function e (H, N) { void 0 !== N && (l[H] = N) } const f = function (H) { return d.getWithConfig(H) }; const h = {}; const k = {}; var l = {}; const n = {}; const p = Al(f(E.jg)); p && pl(k, 'exp', p); Gd() && (n._cs = vl); const q = f('custom_map'); if (gb(q)) {
      for (const r in q) {
        if (q.hasOwnProperty(r) &&
/^(dimension|metric)\d+$/.test(r) && void 0 != q[r]) { const u = f(String(q[r])); void 0 !== u && pl(k, r, u) }
      }
    } for (let t = Jj(d), v = 0; v < t.length; ++v) { const x = t[v]; const z = f(x); if (xl.hasOwnProperty(x))rl(xl[x], x, z, h); else if (wl.hasOwnProperty(x))rl(wl[x], x, z, l); else if (hl.hasOwnProperty(x))rl(hl[x], x, z, k); else if (gl.hasOwnProperty(x))rl(gl[x], x, z, n); else if (/^(dimension|metric|content_group)\d+$/.test(x))rl(1, x, z, k); else if (x === 'developer_id') { const w = ab(z); w && (k['&did'] = w) } else x === E.fa && m(t, E.cc) < 0 && (n.cookieName = z + '_ga') }pl(n,
      'cookieDomain', 'auto'); pl(l, 'forceSSL', !0); pl(h, 'eventCategory', zl(c)); m(['view_item', 'view_item_list', 'view_promotion', 'view_search_results'], c) >= 0 && pl(k, 'nonInteraction', !0); c === 'login' || c === 'sign_up' || c === 'share' ? pl(h, 'eventLabel', f(E.mg)) : c === 'search' || c === 'view_search_results' ? pl(h, 'eventLabel', f(E.vg)) : c === 'select_content' && pl(h, 'eventLabel', f(E.cg)); const y = h[E.qa] || {}; const A = y[E.hb]; A || A != 0 && y[E.I] ? n.allowLinker = !0 : !1 === A && pl(n, 'useAmpClientId', !1); f(E.La) && (n._useUp = !0); !1 !== f(E.bg) && !1 !== f(E.vb) &&
fl() || (l.allowAdFeatures = !1); if (!1 === f(E.ma) || !el()) { let C = 'allowAdFeatures'; C = 'allowAdPersonalizationSignals'; l[C] = !1 }n.name = b; l['&gtm'] = Nj(!0); k.hitCallback = d.onSuccess; Gd() && (l['&gcs'] = Pd(), M(E.F) || (n.storage = 'none'), M(E.B) || (l.allowAdFeatures = !1, n.storeGac =
!1)); const G = f(E.Ka) || f(E.lg) || df('gtag.remote_config.' + a + '.url', 2); const D = f(E.kg) || df('gtag.remote_config.' + a + '.dualId', 2); if (G && cd != null) { n._x_19 = G }D && (n._x_20 = D); h.ra = k; h.nf = l; h.Ba = n; return h
  }; var nl = function (a, b) {
    function c (v) {
      function x (w, y) { for (let A = 0; A < y.length; A++) { const C = y[A]; if (v[C]) { z[w] = v[C]; break } } } var z = B(v); x('listPosition', ['list_position']); x('creative', ['creative_name']); x('list', ['list_name']); x('position', ['list_position', 'creative_slot'])
      return z
    } function d (v) { for (var x = [], z = 0; v && z < v.length; z++)v[z] && x.push(c(v[z])); return x.length ? x : void 0 } function e (v) { return { id: f(E.Cb), affiliation: f(E.gg), revenue: f(E.Ma), tax: f(E.Ae), shipping: f(E.ze), coupon: f(E.hg), list: f(E.Yc) || v } } for (var f = function (v) { return b.getWithConfig(v) }, h = f(E.Z), k, l = 0; h && l < h.length && !(k = h[l][E.Yc]); l++);const n = f('custom_map'); if (gb(n)) for (let p = 0; h && p < h.length; ++p) { const q = h[p]; var r; for (r in n)n.hasOwnProperty(r) && /^(dimension|metric)\d+$/.test(r) && void 0 != n[r] && pl(q, r, q[n[r]]) } let u =
null; const t = f(E.ig); a === E.wa || a === E.cb
      ? u = { action: a, Ib: e(), pb: d(h) }
      : a === E.$a
        ? u = { action: 'add', pb: d(h) }
        : a === E.ab
          ? u = { action: 'remove', pb: d(h) }
          : a === E.Ga
            ? u = { action: 'detail', Ib: e(k), pb: d(h) }
            : a === E.$b
              ? u = { action: 'impressions', nh: d(h) }
              : a === 'view_promotion'
                ? u = { action: 'promo_view', Pd: d(t) }
                : a === 'select_content' && t && t.length > 0
                  ? u = { action: 'promo_click', Pd: d(t) }
                  : a === 'select_content'
                    ? u = { action: 'click', Ib: { list: f(E.Yc) || k }, pb: d(h) }
                    : a === E.Pa || a === 'checkout_progress'
                      ? u = {
                          action: 'checkout',
                          pb: d(h),
                          Ib: {
                            step: a === E.Pa ? 1 : f(E.ye),
                            option: f(E.xe)
                          }
                        }
                      : a === 'set_checkout_option' && (u = { action: 'checkout_option', Ib: { step: f(E.ye), option: f(E.xe) } }); u && (u.di = f(E.oa)); return u
  }; const Bl = {}; var ll = function (a, b) { const c = Bl[a]; Bl[a] = B(b); if (!c) return !1; for (const d in b) if (b.hasOwnProperty(d) && b[d] !== c[d]) return !0; for (const e in c) if (c.hasOwnProperty(e) && c[e] !== b[e]) return !0; return !1 }; const Cl = !1; function Dl () { const a = O; return a.gcq = a.gcq || new El() }
  const Fl = function (a, b, c) { Dl().register(a, b, c) }; const Gl = function (a, b, c, d) { Dl().push('event', [b, a], c, d) }; const Hl = function (a, b) { Dl().push('config', [a], b) }; const Il = function (a, b, c, d) { Dl().push('get', [a, b], c, d) }; const Jl = {}; const Kl = function () { this.status = 1; this.containerConfig = {}; this.targetConfig = {}; this.remoteConfig = {}; this.o = null; this.m = !1 }; const Ll = function (a, b, c, d, e) { this.type = a; this.C = b; this.T = c || ''; this.m = d; this.o = e }; var El = function () { this.H = {}; this.o = {}; this.m = []; this.C = { AW: !1, UA: !1 } }; const Ml = function (a, b) {
    const c = th(b); return a.H[c.containerId] =
a.H[c.containerId] || new Kl()
  }; const Nl = function (a, b, c) {
    if (b) {
      const d = th(b); if (d && Ml(a, b).status === 1) {
        Ml(a, b).status = 2; const e = {}; cj && (e.timeoutId = F.setTimeout(function () { Ac(38); Oi() }, 3E3)); a.push('require', [e], d.containerId); Jl[d.containerId] = Oa(); if (wh()) {} else {
          const h =
'/gtag/js?id=' + encodeURIComponent(d.containerId) + '&l=dataLayer&cx=c'; const k = (F.location.protocol != 'http:' ? 'https:' : 'http:') + ('//www.googletagmanager.com' + h); const l = xj(c, h) || k; fd(l)
        }
      }
    }
  }; const Ol = function (a, b, c, d) {
    if (d.T) {
      const e = Ml(a, d.T); const f = e.o; if (f) {
        const h = B(c); const k = B(e.targetConfig[d.T]); const l = B(e.containerConfig); const n = B(e.remoteConfig); const p = B(a.o); const q = df('gtm.uniqueEventId'); const r = th(d.T).prefix; const u = Hj(Gj(Ij(Fj(Ej(Dj(Cj(Bj(Aj(h), k), l), n), p), function () { ej(q, r, '2') }), function () {
          ej(q, r, '3')
        }), function (t, v) { a.C[t] = v }), function (t) { return a.C[t] }); try { ej(q, r, '1'); f(d.T, b, d.C, u) } catch (t) { ej(q, r, '4') }
      }
    }
  }; aa = El.prototype
  aa.register = function (a, b, c) {
    const d = Ml(this, a); if (d.status !== 3) {
      d.o = b; d.status = 3; if (c) { B(d.remoteConfig, c); d.remoteConfig = c } const e = th(a); const f = Jl[e.containerId]; if (void 0 !== f) {
        const h = O[e.containerId].bootstrap; let k = e.prefix.toUpperCase(); O[e.containerId]._spx && (k = k.toLowerCase()); const l = df('gtm.uniqueEventId'); const n = k; const p = Oa() - h; if (cj && !Ti[l]) {
          l !== Pi && (Li(), Pi = l); const q = n + '.' + Math.floor(h - f) +
'.' + Math.floor(p); Xi = Xi ? Xi + ',' + q : '&cl=' + q
        } delete Jl[e.containerId]
      } this.flush()
    }
  }; aa.push = function (a, b, c, d) { const e = Math.floor(Oa() / 1E3); Nl(this, c, b[0][E.Ka] || this.o[E.Ka]); Cl && c && Ml(this, c).m && (d = !1); this.m.push(new Ll(a, e, c, b, d)); d || this.flush() }; aa.insert = function (a, b, c) { const d = Math.floor(Oa() / 1E3); this.m.length > 0 ? this.m.splice(1, 0, new Ll(a, d, c, b, !1)) : this.m.push(new Ll(a, d, c, b, !1)) }
  aa.flush = function (a) {
    for (var b = this, c = [], d = !1, e = {}; this.m.length;) {
      const f = this.m[0]; if (f.o)Cl ? !f.T || Ml(this, f.T).m ? (f.o = !1, this.m.push(f)) : c.push(f) : (f.o = !1, this.m.push(f)); else {
        switch (f.type) {
          case 'require':if (Ml(this, f.T).status !== 3 && !a) { Cl && this.m.push.apply(this.m, c); return }cj && F.clearTimeout(f.m[0].timeoutId); break; case 'set':Ga(f.m[0], function (r, u) { B(Za(r, u), b.o) }); break; case 'config':e.va = {}; Ga(f.m[0], (function (r) { return function (u, t) { B(Za(u, t), r.va) } }(e))); var h = !!e.va[E.nc]; delete e.va[E.nc]
            var k = Ml(this, f.T); var l = th(f.T); var n = l.containerId === l.id; h || (n ? k.containerConfig = {} : k.targetConfig[f.T] = {}); k.m && h || Ol(this, E.da, e.va, f); k.m = !0; delete e.va[E.Eb]; n ? B(e.va, k.containerConfig) : B(e.va, k.targetConfig[f.T]); Cl && (d = !0); break; case 'event':e.Wb = {}; Ga(f.m[0], (function (r) { return function (u, t) { B(Za(u, t), r.Wb) } }(e))); Ol(this, f.m[1], e.Wb, f); break; case 'get':var p = {}; var q = (p[E.Ia] = f.m[0], p[E.Ha] = f.m[1], p); Ol(this, E.xa, q, f)
        }
      } this.m.shift(); e = { va: e.va, Wb: e.Wb }
    }Cl && (this.m.push.apply(this.m, c), d && this.flush())
  }
  aa.getRemoteConfig = function (a) { return Ml(this, a).remoteConfig }; const Pl = function (a, b, c) { const d = { event: b, 'gtm.element': a, 'gtm.elementClasses': td(a, 'className'), 'gtm.elementId': a.for || od(a, 'id') || '', 'gtm.elementTarget': a.formTarget || td(a, 'target') || '' }; c && (d['gtm.triggers'] = c.join(',')); d['gtm.elementUrl'] = (a.attributes && a.attributes.formaction ? a.formAction : '') || a.action || td(a, 'href') || a.src || a.code || a.codebase || ''; return d }; const Ql = function (a) {
    O.hasOwnProperty('autoEventsSettings') || (O.autoEventsSettings = {}); const b = O.autoEventsSettings; b.hasOwnProperty(a) || (b[a] = {})
    return b[a]
  }; const Rl = function (a, b, c) { Ql(a)[b] = c }; const Sl = function (a, b, c, d) { const e = Ql(a); const f = Qa(e, b, d); e[b] = c(f) }; const Tl = function (a, b, c) { const d = Ql(a); return Qa(d, b, c) }; const Ul = !!F.MutationObserver; let Vl = void 0; const Wl = function (a) { if (!Vl) { const b = function () { const c = I.body; if (c) if (Ul)(new MutationObserver(function () { for (let e = 0; e < Vl.length; e++)J(Vl[e]) })).observe(c, { childList: !0, subtree: !0 }); else { let d = !1; jd(c, 'DOMNodeInserted', function () { d || (d = !0, J(function () { d = !1; for (let e = 0; e < Vl.length; e++)J(Vl[e]) })) }) } }; Vl = []; I.body ? b() : J(b) }Vl.push(a) }; let Yl = !1; const Zl = []; function $l () { if (!Yl) { Yl = !0; for (let a = 0; a < Zl.length; a++)J(Zl[a]) } } const am = function (a) { Yl ? J(a) : Zl.push(a) }; Object.freeze({ dl: 1, id: 1 }); const bm = 'HA GF G UA AW DC'.split(' '); let cm = !1; const dm = {}; let em = !1; function fm (a, b) { const c = { event: a }; b && (c.eventModel = B(b), b[E.Zc] && (c.eventCallback = b[E.Zc]), b[E.fc] && (c.eventTimeout = b[E.fc])); return c } function gm (a) { a.hasOwnProperty('gtm.uniqueEventId') || Object.defineProperty(a, 'gtm.uniqueEventId', { value: Ye() }); return a['gtm.uniqueEventId'] }
  function hm () { cm = cm || !O.gtagRegistered, O.gtagRegistered = !0, cm && (O.addTargetToGroup = function (a) { im(a, 'default') }); return cm } var im = function (a, b) { b = b.toString().split(','); for (let c = 0; c < b.length; c++)dm[b[c]] = dm[b[c]] || [], dm[b[c]].push(a) }; const jm = function (a) { Ga(dm, function (b, c) { const d = m(c, a); d >= 0 && c.splice(d, 1) }) }
  const km = {
    config: function (a) {
      let b, c; void 0 === c && (c = Ye()); if (a.length < 2 || !g(a[1])) return; let d = {}; if (a.length > 2) { if (void 0 != a[2] && !gb(a[2]) || a.length > 3) return; d = a[2] } const e = th(a[1]); if (!e) return; jm(e.id); im(e.id, d[E.cd] || 'default'); delete d[E.cd]; em || Ac(43); if (hm() && m(bm, e.prefix) !== -1) { e.prefix === 'G' && (d[E.Eb] = !0); Hl(d, e.id); return }gf('gtag.targets.' +
e.id, void 0); gf('gtag.targets.' + e.id, B(d)); const f = {}; f[E.Ra] = e.id; b = fm(E.da, f); return b
    },
    consent: function (a) { function b () { hm() && B(a[2], { subcommand: a[1] }) } if (a.length === 3) { Ac(39); const c = Ye(); const d = a[1]; d === 'default' ? (b(), Nd(a[2])) : d === 'update' && (b(), Od(a[2], c)) } },
    event: function (a) {
      const b = a[1]; if (!(a.length < 2) && g(b)) {
        let c; if (a.length > 2) {
          if (!gb(a[2]) &&
void 0 != a[2] || a.length > 3) return; c = a[2]
        } const d = fm(b, c); const e = void 0; void 0 === e && Ye(); let f; let h = c && c[E.Ra]; void 0 === h && (h = df(E.Ra, 2), void 0 === h && (h = 'default')); if (g(h) || Ba(h)) { for (var k = h.toString().replace(/\s+/g, '').split(','), l = [], n = 0; n < k.length; n++)k[n].indexOf('-') >= 0 ? l.push(k[n]) : l = l.concat(dm[k[n]] || []); f = vh(l) } else {
          f =
void 0
        } const p = f; if (!p) return; for (var q = hm(), r = [], u = 0; q && u < p.length; u++) { const t = p[u]; if (m(bm, t.prefix) !== -1) { const v = B(c); t.prefix === 'G' && (v[E.Eb] = !0); Gl(b, v, t.id) }r.push(t.id) }d.eventModel = d.eventModel || {}; p.length > 0 ? d.eventModel[E.Ra] = r.join() : delete d.eventModel[E.Ra]; em || Ac(43); return d
      }
    },
    get: function (a) {
      Ac(53); if (a.length !== 4 || !g(a[1]) || !g(a[2]) || !va(a[3])) return; const b = th(a[1]); const c = String(a[2]); const d = a[3]; if (!b) return; em || Ac(43); if (!hm() || m(bm, b.prefix) ===
-1) return; Ye(); const e = {}; Zh(B((e[E.Ia] = c, e[E.Ha] = d, e))); Il(c, function (f) { J(function () { return d(f) }) }, b.id)
    },
    js: function (a) { if (a.length == 2 && a[1].getTime) { em = !0; hm(); const b = { event: 'gtm.js', 'gtm.start': a[1].getTime() }; return b } },
    policy: function () {},
    set: function (a) {
      let b; a.length == 2 && gb(a[1])
        ? b = B(a[1])
        : a.length == 3 &&
g(a[1]) && (b = {}, gb(a[2]) || Ba(a[2]) ? b[a[1]] = B(a[2]) : b[a[1]] = a[2]); if (b) { if (Ye(), hm()) { B(b); const c = B(b); Dl().push('set', [c]) }b._clear = !0; return b }
    }
  }; const lm = { policy: !0 }; const mm = function (a, b) { const c = a.hide; if (c && void 0 !== c[b] && c.end) { c[b] = !1; let d = !0; let e; for (e in c) if (c.hasOwnProperty(e) && !0 === c[e]) { d = !1; break }d && (c.end(), c.end = null) } }; const om = function (a) { const b = nm(); const c = b && b.hide; c && c.end && (c[a] = !0) }; const Im = function (a) { if (Hm(a)) return a; this.m = a }; Im.prototype.lh = function () { return this.m }; var Hm = function (a) { return !a || db(a) !== 'object' || gb(a) ? !1 : 'getUntrustedUpdateValue' in a }; Im.prototype.getUntrustedUpdateValue = Im.prototype.lh; const Jm = []; let Km = !1; let Lm = !1; let Mm = !1; const Nm = function (a) { return F.dataLayer.push(a) }; const Om = function (a) { const b = O.dataLayer; const c = b ? b.subscribers : 1; let d = 0; let e = a; return function () { ++d === c && (e(), e = null) } }
  function Pm (a) { const b = a._clear; Ga(a, function (d, e) { d !== '_clear' && (b && gf(d, void 0), gf(d, e)) }); Te || (Te = a['gtm.start']); let c = a['gtm.uniqueEventId']; if (!a.event) return !1; c || (c = Ye(), a['gtm.uniqueEventId'] = c, gf('gtm.uniqueEventId', c)); return vj(a) } function Qm () { const a = Jm[0]; if (a == null || typeof a !== 'object') return !1; if (a.event) return !0; if (Ia(a)) { const b = a[0]; if (b === 'config' || b === 'event' || b === 'js') return !0 } return !1 }
  function Rm () {
    for (var a = !1; !Mm && Jm.length > 0;) {
      let b = !1; b = !1; b = !0; if (b && !Lm && Qm()) {
        const c = {}; Jm.unshift((c.event =
'gtm.init', c)); Lm = !0
      } let d = !1; d = !1; d = !0; if (d && !Km && Qm()) { const e = {}; Jm.unshift((e.event = 'gtm.init_consent', e)); Km = !0 }Mm = !0; delete af.eventModel; cf(); let f = Jm.shift(); if (f != null) {
        const h = Hm(f)
        if (h) { const k = f; f = Hm(k) ? k.getUntrustedUpdateValue() : void 0; for (let l = ['gtm.allowlist', 'gtm.blocklist', 'gtm.whitelist', 'gtm.blacklist', 'tagTypeBlacklist'], n = 0; n < l.length; n++) { const p = l[n]; let q = df(p, 1); if (Ba(q) || gb(q))q = B(q); bf[p] = q } } try {
          if (va(f)) try { f.call(ef) } catch (y) {} else if (Ba(f)) { const r = f; if (g(r[0])) { const u = r[0].split('.'); const t = u.pop(); const v = r.slice(1); const x = df(u.join('.'), 2); if (void 0 !== x && x !== null) try { x[t].apply(x, v) } catch (y) {} } } else {
            if (Ia(f)) {
              a: {
                const z = f; if (z.length && g(z[0])) {
                  const w = km[z[0]]; if (w && (!h || !lm[z[0]])) {
                    f =
w(z); break a
                  }
                }f = void 0
              } if (!f) { Mm = !1; continue }
            }a = Pm(f) || a
          }
        } finally { h && cf(!0) }
      }Mm = !1
    } return !a
  } function Sm () { const a = Rm(); try { mm(F.dataLayer, Le.K) } catch (b) {} return a }
  const Um = function () {
    const a = dd('dataLayer', []); let b = dd('google_tag_manager', {}); b = b.dataLayer = b.dataLayer || {}; ki(function () { b.gtmDom || (b.gtmDom = !0, a.push({ event: 'gtm.dom' })) }); am(function () { b.gtmLoad || (b.gtmLoad = !0, a.push({ event: 'gtm.load' })) }); b.subscribers = (b.subscribers || 0) + 1; const c = a.push; a.push = function () {
      let e; if (O.SANDBOXED_JS_SEMAPHORE > 0) { e = []; for (let f = 0; f < arguments.length; f++)e[f] = new Im(arguments[f]) } else e = [].slice.call(arguments, 0); const h = c.apply(a, e); Jm.push.apply(Jm, e); if (this.length >
300) for (Ac(4); this.length > 300;) this.shift(); const k = typeof h !== 'boolean' || h; return Rm() && k
    }; const d = a.slice(0); Jm.push.apply(Jm, d); Tm() && J(Sm)
  }; var Tm = function () { const a = !0; return a }; const Vm = {}; Vm.oc = new String('undefined')
  const Wm = function (a) { this.m = function (b) { for (var c = [], d = 0; d < a.length; d++)c.push(a[d] === Vm.oc ? b : a[d]); return c.join('') } }; Wm.prototype.toString = function () { return this.m('undefined') }; Wm.prototype.valueOf = Wm.prototype.toString; Vm.Kg = Wm; Vm.sd = {}; Vm.Yg = function (a) { return new Wm(a) }; const Xm = {}; Vm.Jh = function (a, b) { const c = Ye(); Xm[c] = [a, b]; return c }; Vm.hf = function (a) { const b = a ? 0 : 1; return function (c) { const d = Xm[c]; if (d && typeof d[b] === 'function')d[b](); Xm[c] = void 0 } }; Vm.qh = function (a) {
    for (var b = !1, c = !1, d = 2; d < a.length; d++) {
      b =
b || a[d] === 8, c = c || a[d] === 16
    } return b && c
  }; Vm.Eh = function (a) { if (a === Vm.oc) return a; const b = Ye(); Vm.sd[b] = a; return 'google_tag_manager["' + Le.K + '"].macro(' + b + ')' }; Vm.Ah = function (a, b, c) { a instanceof Vm.Kg && (a = a.m(Vm.Jh(b, c)), b = ua); return { mh: a, onSuccess: b } }; const Ym = ['input', 'select', 'textarea']; const Zm = ['button', 'hidden', 'image', 'reset', 'submit']; const $m = function (a) { const b = a.tagName.toLowerCase(); return !Ca(Ym, function (c) { return c === b }) || b === 'input' && Ca(Zm, function (c) { return c === a.type.toLowerCase() }) ? !1 : !0 }; const an = function (a) { return a.form ? a.form.tagName ? a.form : I.getElementById(a.form) : rd(a, ['form'], 100) }; const bn = function (a, b, c) {
    if (!a.elements) return 0; for (let d = b.getAttribute(c), e = 0, f = 1; e < a.elements.length; e++) {
      const h = a.elements[e]; if ($m(h)) {
        if (h.getAttribute(c) === d) return f
        f++
      }
    } return 0
  }; const nn = F.clearTimeout; const on = F.setTimeout; const W = function (a, b, c) { if (wh()) { b && J(b) } else return fd(a, b, c) }; const pn = function () { return new Date() }; const qn = function () { return F.location.href }; const rn = function (a) { return me(oe(a), 'fragment') }; const sn = function (a) { return ne(oe(a)) }; const tn = function (a, b) { return df(a, b || 2) }; const un = function (a, b, c) { let d; b ? (a.eventCallback = b, c && (a.eventTimeout = c), d = Nm(a)) : d = Nm(a); return d }; const vn = function (a, b) { F[a] = b }; const X = function (a, b, c) {
    b &&
(void 0 === F[a] || c && !F[a]) && (F[a] = b); return F[a]
  }; const wn = function (a, b, c) { return vf(a, b, void 0 === c ? !0 : !!c) }; const xn = function (a, b, c) { return Ef(a, b, c) === 0 }; const yn = function (a, b) { if (wh()) { b && J(b) } else hd(a, b) }; const zn = function (a) { return !!Tl(a, 'init', !1) }; const An = function (a) { Rl(a, 'init', !0) }; const Bn = function (a) { const b = Re + '?id=' + encodeURIComponent(a) + '&l=dataLayer'; W(yh('https://', 'http://', b)) }; const Cn = function (a, b, c) { cj && (hb(a) || fj(c, b, a)) }; const Dn = Vm.Ah; function $n (a, b) { a = String(a); b = String(b); const c = a.length - b.length; return c >= 0 && a.indexOf(b, c) == c } const ao = new Ea(); function bo (a, b, c) { const d = c ? 'i' : void 0; try { const e = String(b) + d; let f = ao.get(e); f || (f = new RegExp(b, d), ao.set(e, f)); return f.test(a) } catch (h) { return !1 } }
  function co (a, b) { function c (h) { const k = oe(h); let l = me(k, 'protocol'); const n = me(k, 'host', !0); let p = me(k, 'port'); const q = me(k, 'path').toLowerCase().replace(/\/$/, ''); if (void 0 === l || l == 'http' && p == '80' || l == 'https' && p == '443')l = 'web', p = 'default'; return [l, n, p, q] } for (let d = c(String(a)), e = c(String(b)), f = 0; f < d.length; f++) if (d[f] !== e[f]) return !1; return !0 }
  function eo (a) { return fo(a) ? 1 : 0 }
  function fo (a) {
    const b = a.arg0; const c = a.arg1; if (a.any_of && Ba(c)) { for (let d = 0; d < c.length; d++) { const e = B(a, {}); B({ arg1: c[d], any_of: void 0 }, e); if (eo(e)) return !0 } return !1 } switch (a.function) {
      case '_cn':return String(b).indexOf(String(c)) >= 0; case '_css':var f; a: { if (b) { const h = ['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector']; try { for (let k = 0; k < h.length; k++) if (b[h[k]]) { f = b[h[k]](c); break a } } catch (n) {} }f = !1 } return f; case '_ew':return $n(b, c); case '_eq':return String(b) ==
String(c); case '_ge':return Number(b) >= Number(c); case '_gt':return Number(b) > Number(c); case '_lc':var l; l = String(b).split(','); return m(l, String(c)) >= 0; case '_le':return Number(b) <= Number(c); case '_lt':return Number(b) < Number(c); case '_re':return bo(b, c, a.ignore_case); case '_sw':return String(b).indexOf(String(c)) == 0; case '_um':return co(b, c)
    } return !1
  }const go = encodeURI; const Y = encodeURIComponent; const ho = id; const io = function (a, b) { if (!a) return !1; const c = me(oe(a), 'host'); if (!c) return !1; for (let d = 0; b && d < b.length; d++) { let e = b[d] && b[d].toLowerCase(); if (e) { let f = c.length - e.length; f > 0 && e.charAt(0) != '.' && (f--, e = '.' + e); if (f >= 0 && c.indexOf(e, f) == f) return !0 } } return !1 }
  const jo = function (a, b, c) { for (var d = {}, e = !1, f = 0; a && f < a.length; f++)a[f] && a[f].hasOwnProperty(b) && a[f].hasOwnProperty(c) && (d[a[f][b]] = a[f][c], e = !0); return e ? d : null }; function Sp () { return F.gaGlobal = F.gaGlobal || {} } const Tp = function () { const a = Sp(); a.hid = a.hid || Da(); return a.hid }; const Up = function (a, b) { const c = Sp(); if (void 0 == c.vid || b && !c.from_cookie)c.vid = a, c.from_cookie = b }; const Eq = window; const Fq = document; const Gq = function (a) { const b = Eq._gaUserPrefs; if (b && b.ioo && b.ioo() || a && !0 === Eq['ga-disable-' + a]) return !0; try { const c = Eq.external; if (c && c._gaUserPrefs && c._gaUserPrefs == 'oo') return !0 } catch (f) {} for (let d = rf('AMP_TOKEN', String(Fq.cookie), !0), e = 0; e < d.length; e++) if (d[e] == '$OPT_OUT') return !0; return Fq.getElementById('__gaOptOutExtension') ? !0 : !1 }; const Hq = {}; function Jq (a) { delete a.eventModel[E.Eb]; Lq(a.eventModel) } var Lq = function (a) { Ga(a, function (c) { c.charAt(0) === '_' && delete a[c] }); const b = a[E.za] || {}; Ga(b, function (c) { c.charAt(0) === '_' && delete b[c] }) }; const Oq = function (a, b, c) { Gl(b, c, a) }; const Pq = function (a, b, c) { Gl(b, c, a, !0) }; const Wq = function (a, b) {}
  function Qq (a, b) {} const Z = { g: {} }

  Z.g.e = ['google'], (function () { (function (a) { Z.__e = a; Z.__e.h = 'e'; Z.__e.i = !0; Z.__e.priorityOverride = 0 })(function (a) { const b = String(kf(a.vtp_gtmEventId, 'event')); return b }) }())

  Z.g.v = ['google'], (function () { (function (a) { Z.__v = a; Z.__v.h = 'v'; Z.__v.i = !0; Z.__v.priorityOverride = 0 })(function (a) { const b = a.vtp_name; if (!b || !b.replace) return !1; const c = tn(b.replace(/\\\./g, '.'), a.vtp_dataLayerVersion || 1); const d = void 0 !== c ? c : a.vtp_defaultValue; Cn(d, 'v', a.vtp_gtmEventId); return d }) }())

  Z.g.rep = ['google'], (function () { (function (a) { Z.__rep = a; Z.__rep.h = 'rep'; Z.__rep.i = !0; Z.__rep.priorityOverride = 0 })(function (a) { let b; switch (th(a.vtp_containerId).prefix) { case 'AW':b = Ek; break; case 'DC':b = Rk; break; case 'GF':b = Wk; break; case 'HA':b = al; break; case 'UA':b = ul; break; default:J(a.vtp_gtmOnFailure); return }J(a.vtp_gtmOnSuccess); Fl(a.vtp_containerId, b, a.vtp_remoteConfig || {}) }) }())

  Z.g.cid = ['google'], (function () { (function (a) { Z.__cid = a; Z.__cid.h = 'cid'; Z.__cid.i = !0; Z.__cid.priorityOverride = 0 })(function () { return Le.K }) }())

  Z.g.get = ['google'], (function () { (function (a) { Z.__get = a; Z.__get.h = 'get'; Z.__get.i = !0; Z.__get.priorityOverride = 0 })(function (a) { const b = a.vtp_settings; (a.vtp_deferrable ? Pq : Oq)(String(b.streamId), String(a.vtp_eventName), b.eventParameters || {}); a.vtp_gtmOnSuccess() }) }())

  Z.g.gtagua = ['google'], (function () { (function (a) { Z.__gtagua = a; Z.__gtagua.h = 'gtagua'; Z.__gtagua.i = !0; Z.__gtagua.priorityOverride = 0 })(function (a) { J(a.vtp_gtmOnSuccess) }) }())

  const Xq = {}; Xq.macro = function (a) { if (Vm.sd.hasOwnProperty(a)) return Vm.sd[a] }, Xq.onHtmlSuccess = Vm.hf(!0), Xq.onHtmlFailure = Vm.hf(!1); Xq.dataLayer = ef; Xq.callback = function (a) { We.hasOwnProperty(a) && va(We[a]) && We[a](); delete We[a] }; Xq.bootstrap = 0; Xq._spx = !1; function Yq () { O[Le.K] = Xq; Va(Xe, Z.g); Ub = Ub || Vm; Vb = cc }
  function Zq () {
    ud.o().o(); O = F.google_tag_manager = F.google_tag_manager || {}; lk(); Ig.enable_gbraid_cookie_write = !0; if (O[Le.K]) { const a = O.zones; a && a.unregisterChild(Le.K) } else {
      for (var b = data.resource || {}, c = b.macros || [], d = 0; d < c.length; d++)Nb.push(c[d]); for (let e = b.tags || [], f = 0; f < e.length; f++)Qb.push(e[f]); for (let h = b.predicates || [], k = 0; k < h.length; k++)Pb.push(h[k]); for (let l = b.rules || [], n = 0; n < l.length; n++) { for (var p = l[n], q = {}, r = 0; r < p.length; r++)q[p[r][0]] = Array.prototype.slice.call(p[r], 1); Ob.push(q) }Sb = Z; Tb = eo; Yq(); Um(); ai = !1; bi = 0; if (I.readyState == 'interactive' && !I.createEventObject || I.readyState == 'complete')di()
      else { jd(I, 'DOMContentLoaded', di); jd(I, 'readystatechange', di); if (I.createEventObject && I.documentElement.doScroll) { let u = !0; try { u = !F.frameElement } catch (z) {}u && ei() }jd(F, 'load', di) }Yl = !1; I.readyState === 'complete' ? $l() : jd(F, 'load', $l); a: {
        if (!cj) break a; F.setInterval(bj,
          864E5)
      }Ue = (new Date()).getTime(); Xq.bootstrap = Ue
    }
  }
  (function (a) {
    if (!F.__TAGGY_INSTALLED) { let b = !1; if (I.referrer) { const c = oe(I.referrer); b = he(c, 'host') === 'cct.google' } if (!b) { const d = vf('googTaggyReferrer'); b = d.length && d[0].length }b && (F.__TAGGY_INSTALLED = !0, fd('https://cct.google/taggy/agent.js')) } const f = function () {
      let n = F['google.tagmanager.debugui2.queue']; n || (n = [], F['google.tagmanager.debugui2.queue'] = n, fd('https://www.googletagmanager.com/debug/bootstrap')); const p = { messageType: 'CONTAINER_STARTING', data: { scriptSource: cd, containerProduct: 'GTM', debug: !1 } }; p.data.resume = function () { a() }; p.data.containerProduct =
'OGT'; Le.Of && (p.data.initialPublish = !0); n.push(p)
    }; let h = me(F.location, 'query', !1, void 0, 'gtm_debug') === 'x'; if (!h && I.referrer) { const k = oe(I.referrer); h = he(k, 'host') === 'tagassistant.google.com' } if (!h) { const l = vf('__TAG_ASSISTANT'); h = l.length && l[0].length }F.__TAG_ASSISTANT_API && (h = !0); h && cd ? f() : a()
  })(Zq)
})()
