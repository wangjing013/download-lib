var ue = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Ht(T) {
  return T && T.__esModule && Object.prototype.hasOwnProperty.call(T, "default") ? T.default : T;
}
function Jt(T) {
  if (Object.prototype.hasOwnProperty.call(T, "__esModule")) return T;
  var I = T.default;
  if (typeof I == "function") {
    var S = function A() {
      var R = !1;
      try {
        R = this instanceof A;
      } catch {
      }
      return R ? Reflect.construct(I, arguments, this.constructor) : I.apply(this, arguments);
    };
    S.prototype = I.prototype;
  } else S = {};
  return Object.defineProperty(S, "__esModule", { value: !0 }), Object.keys(T).forEach(function(A) {
    var R = Object.getOwnPropertyDescriptor(T, A);
    Object.defineProperty(S, A, R.get ? R : {
      enumerable: !0,
      get: function() {
        return T[A];
      }
    });
  }), S;
}
function he(T) {
  throw new Error('Could not dynamically require "' + T + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var xe = { exports: {} };
var Ye;
function Kt() {
  return Ye || (Ye = 1, (function(T, I) {
    (function(S) {
      T.exports = S();
    })(function() {
      return (function S(A, R, B) {
        function k(w, X) {
          if (!R[w]) {
            if (!A[w]) {
              var m = typeof he == "function" && he;
              if (!X && m) return m(w, !0);
              if (N) return N(w, !0);
              var E = new Error("Cannot find module '" + w + "'");
              throw E.code = "MODULE_NOT_FOUND", E;
            }
            var $ = R[w] = { exports: {} };
            A[w][0].call($.exports, function(F) {
              var G = A[w][1][F];
              return k(G || F);
            }, $, $.exports, S, A, R, B);
          }
          return R[w].exports;
        }
        for (var N = typeof he == "function" && he, z = 0; z < B.length; z++) k(B[z]);
        return k;
      })({ 1: [function(S, A, R) {
        (function(B) {
          var k = B.MutationObserver || B.WebKitMutationObserver, N;
          if (k) {
            var z = 0, w = new k(F), X = B.document.createTextNode("");
            w.observe(X, {
              characterData: !0
            }), N = function() {
              X.data = z = ++z % 2;
            };
          } else if (!B.setImmediate && typeof B.MessageChannel < "u") {
            var m = new B.MessageChannel();
            m.port1.onmessage = F, N = function() {
              m.port2.postMessage(0);
            };
          } else "document" in B && "onreadystatechange" in B.document.createElement("script") ? N = function() {
            var Y = B.document.createElement("script");
            Y.onreadystatechange = function() {
              F(), Y.onreadystatechange = null, Y.parentNode.removeChild(Y), Y = null;
            }, B.document.documentElement.appendChild(Y);
          } : N = function() {
            setTimeout(F, 0);
          };
          var E, $ = [];
          function F() {
            E = !0;
            for (var Y, Q, W = $.length; W; ) {
              for (Q = $, $ = [], Y = -1; ++Y < W; )
                Q[Y]();
              W = $.length;
            }
            E = !1;
          }
          A.exports = G;
          function G(Y) {
            $.push(Y) === 1 && !E && N();
          }
        }).call(this, typeof ue < "u" ? ue : typeof self < "u" ? self : typeof window < "u" ? window : {});
      }, {}], 2: [function(S, A, R) {
        var B = S(1);
        function k() {
        }
        var N = {}, z = ["REJECTED"], w = ["FULFILLED"], X = ["PENDING"];
        A.exports = m;
        function m(g) {
          if (typeof g != "function")
            throw new TypeError("resolver must be a function");
          this.state = X, this.queue = [], this.outcome = void 0, g !== k && G(this, g);
        }
        m.prototype.catch = function(g) {
          return this.then(null, g);
        }, m.prototype.then = function(g, P) {
          if (typeof g != "function" && this.state === w || typeof P != "function" && this.state === z)
            return this;
          var D = new this.constructor(k);
          if (this.state !== X) {
            var M = this.state === w ? g : P;
            $(D, M, this.outcome);
          } else
            this.queue.push(new E(D, g, P));
          return D;
        };
        function E(g, P, D) {
          this.promise = g, typeof P == "function" && (this.onFulfilled = P, this.callFulfilled = this.otherCallFulfilled), typeof D == "function" && (this.onRejected = D, this.callRejected = this.otherCallRejected);
        }
        E.prototype.callFulfilled = function(g) {
          N.resolve(this.promise, g);
        }, E.prototype.otherCallFulfilled = function(g) {
          $(this.promise, this.onFulfilled, g);
        }, E.prototype.callRejected = function(g) {
          N.reject(this.promise, g);
        }, E.prototype.otherCallRejected = function(g) {
          $(this.promise, this.onRejected, g);
        };
        function $(g, P, D) {
          B(function() {
            var M;
            try {
              M = P(D);
            } catch (C) {
              return N.reject(g, C);
            }
            M === g ? N.reject(g, new TypeError("Cannot resolve promise with itself")) : N.resolve(g, M);
          });
        }
        N.resolve = function(g, P) {
          var D = Y(F, P);
          if (D.status === "error")
            return N.reject(g, D.value);
          var M = D.value;
          if (M)
            G(g, M);
          else {
            g.state = w, g.outcome = P;
            for (var C = -1, J = g.queue.length; ++C < J; )
              g.queue[C].callFulfilled(P);
          }
          return g;
        }, N.reject = function(g, P) {
          g.state = z, g.outcome = P;
          for (var D = -1, M = g.queue.length; ++D < M; )
            g.queue[D].callRejected(P);
          return g;
        };
        function F(g) {
          var P = g && g.then;
          if (g && (typeof g == "object" || typeof g == "function") && typeof P == "function")
            return function() {
              P.apply(g, arguments);
            };
        }
        function G(g, P) {
          var D = !1;
          function M(r) {
            D || (D = !0, N.reject(g, r));
          }
          function C(r) {
            D || (D = !0, N.resolve(g, r));
          }
          function J() {
            P(C, M);
          }
          var K = Y(J);
          K.status === "error" && M(K.value);
        }
        function Y(g, P) {
          var D = {};
          try {
            D.value = g(P), D.status = "success";
          } catch (M) {
            D.status = "error", D.value = M;
          }
          return D;
        }
        m.resolve = Q;
        function Q(g) {
          return g instanceof this ? g : N.resolve(new this(k), g);
        }
        m.reject = W;
        function W(g) {
          var P = new this(k);
          return N.reject(P, g);
        }
        m.all = oe;
        function oe(g) {
          var P = this;
          if (Object.prototype.toString.call(g) !== "[object Array]")
            return this.reject(new TypeError("must be an array"));
          var D = g.length, M = !1;
          if (!D)
            return this.resolve([]);
          for (var C = new Array(D), J = 0, K = -1, r = new this(k); ++K < D; )
            i(g[K], K);
          return r;
          function i(a, n) {
            P.resolve(a).then(_, function(d) {
              M || (M = !0, N.reject(r, d));
            });
            function _(d) {
              C[n] = d, ++J === D && !M && (M = !0, N.resolve(r, C));
            }
          }
        }
        m.race = ee;
        function ee(g) {
          var P = this;
          if (Object.prototype.toString.call(g) !== "[object Array]")
            return this.reject(new TypeError("must be an array"));
          var D = g.length, M = !1;
          if (!D)
            return this.resolve([]);
          for (var C = -1, J = new this(k); ++C < D; )
            K(g[C]);
          return J;
          function K(r) {
            P.resolve(r).then(function(i) {
              M || (M = !0, N.resolve(J, i));
            }, function(i) {
              M || (M = !0, N.reject(J, i));
            });
          }
        }
      }, { 1: 1 }], 3: [function(S, A, R) {
        (function(B) {
          typeof B.Promise != "function" && (B.Promise = S(2));
        }).call(this, typeof ue < "u" ? ue : typeof self < "u" ? self : typeof window < "u" ? window : {});
      }, { 2: 2 }], 4: [function(S, A, R) {
        var B = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
          return typeof e;
        } : function(e) {
          return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
        };
        function k(e, o) {
          if (!(e instanceof o))
            throw new TypeError("Cannot call a class as a function");
        }
        function N() {
          try {
            if (typeof indexedDB < "u")
              return indexedDB;
            if (typeof webkitIndexedDB < "u")
              return webkitIndexedDB;
            if (typeof mozIndexedDB < "u")
              return mozIndexedDB;
            if (typeof OIndexedDB < "u")
              return OIndexedDB;
            if (typeof msIndexedDB < "u")
              return msIndexedDB;
          } catch {
            return;
          }
        }
        var z = N();
        function w() {
          try {
            if (!z || !z.open)
              return !1;
            var e = typeof openDatabase < "u" && /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/BlackBerry/.test(navigator.platform), o = typeof fetch == "function" && fetch.toString().indexOf("[native code") !== -1;
            return (!e || o) && typeof indexedDB < "u" && // some outdated implementations of IDB that appear on Samsung
            // and HTC Android devices <4.4 are missing IDBKeyRange
            // See: https://github.com/mozilla/localForage/issues/128
            // See: https://github.com/mozilla/localForage/issues/272
            typeof IDBKeyRange < "u";
          } catch {
            return !1;
          }
        }
        function X(e, o) {
          e = e || [], o = o || {};
          try {
            return new Blob(e, o);
          } catch (s) {
            if (s.name !== "TypeError")
              throw s;
            for (var t = typeof BlobBuilder < "u" ? BlobBuilder : typeof MSBlobBuilder < "u" ? MSBlobBuilder : typeof MozBlobBuilder < "u" ? MozBlobBuilder : WebKitBlobBuilder, f = new t(), u = 0; u < e.length; u += 1)
              f.append(e[u]);
            return f.getBlob(o.type);
          }
        }
        typeof Promise > "u" && S(3);
        var m = Promise;
        function E(e, o) {
          o && e.then(function(t) {
            o(null, t);
          }, function(t) {
            o(t);
          });
        }
        function $(e, o, t) {
          typeof o == "function" && e.then(o), typeof t == "function" && e.catch(t);
        }
        function F(e) {
          return typeof e != "string" && (console.warn(e + " used as a key, but it is not a string."), e = String(e)), e;
        }
        function G() {
          if (arguments.length && typeof arguments[arguments.length - 1] == "function")
            return arguments[arguments.length - 1];
        }
        var Y = "local-forage-detect-blob-support", Q = void 0, W = {}, oe = Object.prototype.toString, ee = "readonly", g = "readwrite";
        function P(e) {
          for (var o = e.length, t = new ArrayBuffer(o), f = new Uint8Array(t), u = 0; u < o; u++)
            f[u] = e.charCodeAt(u);
          return t;
        }
        function D(e) {
          return new m(function(o) {
            var t = e.transaction(Y, g), f = X([""]);
            t.objectStore(Y).put(f, "key"), t.onabort = function(u) {
              u.preventDefault(), u.stopPropagation(), o(!1);
            }, t.oncomplete = function() {
              var u = navigator.userAgent.match(/Chrome\/(\d+)/), s = navigator.userAgent.match(/Edge\//);
              o(s || !u || parseInt(u[1], 10) >= 43);
            };
          }).catch(function() {
            return !1;
          });
        }
        function M(e) {
          return typeof Q == "boolean" ? m.resolve(Q) : D(e).then(function(o) {
            return Q = o, Q;
          });
        }
        function C(e) {
          var o = W[e.name], t = {};
          t.promise = new m(function(f, u) {
            t.resolve = f, t.reject = u;
          }), o.deferredOperations.push(t), o.dbReady ? o.dbReady = o.dbReady.then(function() {
            return t.promise;
          }) : o.dbReady = t.promise;
        }
        function J(e) {
          var o = W[e.name], t = o.deferredOperations.pop();
          if (t)
            return t.resolve(), t.promise;
        }
        function K(e, o) {
          var t = W[e.name], f = t.deferredOperations.pop();
          if (f)
            return f.reject(o), f.promise;
        }
        function r(e, o) {
          return new m(function(t, f) {
            if (W[e.name] = W[e.name] || ae(), e.db)
              if (o)
                C(e), e.db.close();
              else
                return t(e.db);
            var u = [e.name];
            o && u.push(e.version);
            var s = z.open.apply(z, u);
            o && (s.onupgradeneeded = function(c) {
              var l = s.result;
              try {
                l.createObjectStore(e.storeName), c.oldVersion <= 1 && l.createObjectStore(Y);
              } catch (h) {
                if (h.name === "ConstraintError")
                  console.warn('The database "' + e.name + '" has been upgraded from version ' + c.oldVersion + " to version " + c.newVersion + ', but the storage "' + e.storeName + '" already exists.');
                else
                  throw h;
              }
            }), s.onerror = function(c) {
              c.preventDefault(), f(s.error);
            }, s.onsuccess = function() {
              var c = s.result;
              c.onversionchange = function(l) {
                l.target.close();
              }, t(c), J(e);
            };
          });
        }
        function i(e) {
          return r(e, !1);
        }
        function a(e) {
          return r(e, !0);
        }
        function n(e, o) {
          if (!e.db)
            return !0;
          var t = !e.db.objectStoreNames.contains(e.storeName), f = e.version < e.db.version, u = e.version > e.db.version;
          if (f && (e.version !== o && console.warn('The database "' + e.name + `" can't be downgraded from version ` + e.db.version + " to version " + e.version + "."), e.version = e.db.version), u || t) {
            if (t) {
              var s = e.db.version + 1;
              s > e.version && (e.version = s);
            }
            return !0;
          }
          return !1;
        }
        function _(e) {
          return new m(function(o, t) {
            var f = new FileReader();
            f.onerror = t, f.onloadend = function(u) {
              var s = btoa(u.target.result || "");
              o({
                __local_forage_encoded_blob: !0,
                data: s,
                type: e.type
              });
            }, f.readAsBinaryString(e);
          });
        }
        function d(e) {
          var o = P(atob(e.data));
          return X([o], { type: e.type });
        }
        function p(e) {
          return e && e.__local_forage_encoded_blob;
        }
        function x(e) {
          var o = this, t = o._initReady().then(function() {
            var f = W[o._dbInfo.name];
            if (f && f.dbReady)
              return f.dbReady;
          });
          return $(t, e, e), t;
        }
        function V(e) {
          C(e);
          for (var o = W[e.name], t = o.forages, f = 0; f < t.length; f++) {
            var u = t[f];
            u._dbInfo.db && (u._dbInfo.db.close(), u._dbInfo.db = null);
          }
          return e.db = null, i(e).then(function(s) {
            return e.db = s, n(e) ? a(e) : s;
          }).then(function(s) {
            e.db = o.db = s;
            for (var c = 0; c < t.length; c++)
              t[c]._dbInfo.db = s;
          }).catch(function(s) {
            throw K(e, s), s;
          });
        }
        function q(e, o, t, f) {
          f === void 0 && (f = 1);
          try {
            var u = e.db.transaction(e.storeName, o);
            t(null, u);
          } catch (s) {
            if (f > 0 && (!e.db || s.name === "InvalidStateError" || s.name === "NotFoundError"))
              return m.resolve().then(function() {
                if (!e.db || s.name === "NotFoundError" && !e.db.objectStoreNames.contains(e.storeName) && e.version <= e.db.version)
                  return e.db && (e.version = e.db.version + 1), a(e);
              }).then(function() {
                return V(e).then(function() {
                  q(e, o, t, f - 1);
                });
              }).catch(t);
            t(s);
          }
        }
        function ae() {
          return {
            // Running localForages sharing a database.
            forages: [],
            // Shared database.
            db: null,
            // Database readiness (promise).
            dbReady: null,
            // Deferred operations on the database.
            deferredOperations: []
          };
        }
        function Ve(e) {
          var o = this, t = {
            db: null
          };
          if (e)
            for (var f in e)
              t[f] = e[f];
          var u = W[t.name];
          u || (u = ae(), W[t.name] = u), u.forages.push(o), o._initReady || (o._initReady = o.ready, o.ready = x);
          var s = [];
          function c() {
            return m.resolve();
          }
          for (var l = 0; l < u.forages.length; l++) {
            var h = u.forages[l];
            h !== o && s.push(h._initReady().catch(c));
          }
          var v = u.forages.slice(0);
          return m.all(s).then(function() {
            return t.db = u.db, i(t);
          }).then(function(y) {
            return t.db = y, n(t, o._defaultConfig.version) ? a(t) : y;
          }).then(function(y) {
            t.db = u.db = y, o._dbInfo = t;
            for (var b = 0; b < v.length; b++) {
              var O = v[b];
              O !== o && (O._dbInfo.db = t.db, O._dbInfo.version = t.version);
            }
          });
        }
        function Ge(e, o) {
          var t = this;
          e = F(e);
          var f = new m(function(u, s) {
            t.ready().then(function() {
              q(t._dbInfo, ee, function(c, l) {
                if (c)
                  return s(c);
                try {
                  var h = l.objectStore(t._dbInfo.storeName), v = h.get(e);
                  v.onsuccess = function() {
                    var y = v.result;
                    y === void 0 && (y = null), p(y) && (y = d(y)), u(y);
                  }, v.onerror = function() {
                    s(v.error);
                  };
                } catch (y) {
                  s(y);
                }
              });
            }).catch(s);
          });
          return E(f, o), f;
        }
        function Qe(e, o) {
          var t = this, f = new m(function(u, s) {
            t.ready().then(function() {
              q(t._dbInfo, ee, function(c, l) {
                if (c)
                  return s(c);
                try {
                  var h = l.objectStore(t._dbInfo.storeName), v = h.openCursor(), y = 1;
                  v.onsuccess = function() {
                    var b = v.result;
                    if (b) {
                      var O = b.value;
                      p(O) && (O = d(O));
                      var L = e(O, b.key, y++);
                      L !== void 0 ? u(L) : b.continue();
                    } else
                      u();
                  }, v.onerror = function() {
                    s(v.error);
                  };
                } catch (b) {
                  s(b);
                }
              });
            }).catch(s);
          });
          return E(f, o), f;
        }
        function Xe(e, o, t) {
          var f = this;
          e = F(e);
          var u = new m(function(s, c) {
            var l;
            f.ready().then(function() {
              return l = f._dbInfo, oe.call(o) === "[object Blob]" ? M(l.db).then(function(h) {
                return h ? o : _(o);
              }) : o;
            }).then(function(h) {
              q(f._dbInfo, g, function(v, y) {
                if (v)
                  return c(v);
                try {
                  var b = y.objectStore(f._dbInfo.storeName);
                  h === null && (h = void 0);
                  var O = b.put(h, e);
                  y.oncomplete = function() {
                    h === void 0 && (h = null), s(h);
                  }, y.onabort = y.onerror = function() {
                    var L = O.error ? O.error : O.transaction.error;
                    c(L);
                  };
                } catch (L) {
                  c(L);
                }
              });
            }).catch(c);
          });
          return E(u, t), u;
        }
        function qe(e, o) {
          var t = this;
          e = F(e);
          var f = new m(function(u, s) {
            t.ready().then(function() {
              q(t._dbInfo, g, function(c, l) {
                if (c)
                  return s(c);
                try {
                  var h = l.objectStore(t._dbInfo.storeName), v = h.delete(e);
                  l.oncomplete = function() {
                    u();
                  }, l.onerror = function() {
                    s(v.error);
                  }, l.onabort = function() {
                    var y = v.error ? v.error : v.transaction.error;
                    s(y);
                  };
                } catch (y) {
                  s(y);
                }
              });
            }).catch(s);
          });
          return E(f, o), f;
        }
        function Ze(e) {
          var o = this, t = new m(function(f, u) {
            o.ready().then(function() {
              q(o._dbInfo, g, function(s, c) {
                if (s)
                  return u(s);
                try {
                  var l = c.objectStore(o._dbInfo.storeName), h = l.clear();
                  c.oncomplete = function() {
                    f();
                  }, c.onabort = c.onerror = function() {
                    var v = h.error ? h.error : h.transaction.error;
                    u(v);
                  };
                } catch (v) {
                  u(v);
                }
              });
            }).catch(u);
          });
          return E(t, e), t;
        }
        function et(e) {
          var o = this, t = new m(function(f, u) {
            o.ready().then(function() {
              q(o._dbInfo, ee, function(s, c) {
                if (s)
                  return u(s);
                try {
                  var l = c.objectStore(o._dbInfo.storeName), h = l.count();
                  h.onsuccess = function() {
                    f(h.result);
                  }, h.onerror = function() {
                    u(h.error);
                  };
                } catch (v) {
                  u(v);
                }
              });
            }).catch(u);
          });
          return E(t, e), t;
        }
        function tt(e, o) {
          var t = this, f = new m(function(u, s) {
            if (e < 0) {
              u(null);
              return;
            }
            t.ready().then(function() {
              q(t._dbInfo, ee, function(c, l) {
                if (c)
                  return s(c);
                try {
                  var h = l.objectStore(t._dbInfo.storeName), v = !1, y = h.openKeyCursor();
                  y.onsuccess = function() {
                    var b = y.result;
                    if (!b) {
                      u(null);
                      return;
                    }
                    e === 0 || v ? u(b.key) : (v = !0, b.advance(e));
                  }, y.onerror = function() {
                    s(y.error);
                  };
                } catch (b) {
                  s(b);
                }
              });
            }).catch(s);
          });
          return E(f, o), f;
        }
        function rt(e) {
          var o = this, t = new m(function(f, u) {
            o.ready().then(function() {
              q(o._dbInfo, ee, function(s, c) {
                if (s)
                  return u(s);
                try {
                  var l = c.objectStore(o._dbInfo.storeName), h = l.openKeyCursor(), v = [];
                  h.onsuccess = function() {
                    var y = h.result;
                    if (!y) {
                      f(v);
                      return;
                    }
                    v.push(y.key), y.continue();
                  }, h.onerror = function() {
                    u(h.error);
                  };
                } catch (y) {
                  u(y);
                }
              });
            }).catch(u);
          });
          return E(t, e), t;
        }
        function nt(e, o) {
          o = G.apply(this, arguments);
          var t = this.config();
          e = typeof e != "function" && e || {}, e.name || (e.name = e.name || t.name, e.storeName = e.storeName || t.storeName);
          var f = this, u;
          if (!e.name)
            u = m.reject("Invalid arguments");
          else {
            var s = e.name === t.name && f._dbInfo.db, c = s ? m.resolve(f._dbInfo.db) : i(e).then(function(l) {
              var h = W[e.name], v = h.forages;
              h.db = l;
              for (var y = 0; y < v.length; y++)
                v[y]._dbInfo.db = l;
              return l;
            });
            e.storeName ? u = c.then(function(l) {
              if (l.objectStoreNames.contains(e.storeName)) {
                var h = l.version + 1;
                C(e);
                var v = W[e.name], y = v.forages;
                l.close();
                for (var b = 0; b < y.length; b++) {
                  var O = y[b];
                  O._dbInfo.db = null, O._dbInfo.version = h;
                }
                var L = new m(function(U, H) {
                  var j = z.open(e.name, h);
                  j.onerror = function(Z) {
                    var fe = j.result;
                    fe.close(), H(Z);
                  }, j.onupgradeneeded = function() {
                    var Z = j.result;
                    Z.deleteObjectStore(e.storeName);
                  }, j.onsuccess = function() {
                    var Z = j.result;
                    Z.close(), U(Z);
                  };
                });
                return L.then(function(U) {
                  v.db = U;
                  for (var H = 0; H < y.length; H++) {
                    var j = y[H];
                    j._dbInfo.db = U, J(j._dbInfo);
                  }
                }).catch(function(U) {
                  throw (K(e, U) || m.resolve()).catch(function() {
                  }), U;
                });
              }
            }) : u = c.then(function(l) {
              C(e);
              var h = W[e.name], v = h.forages;
              l.close();
              for (var y = 0; y < v.length; y++) {
                var b = v[y];
                b._dbInfo.db = null;
              }
              var O = new m(function(L, U) {
                var H = z.deleteDatabase(e.name);
                H.onerror = function() {
                  var j = H.result;
                  j && j.close(), U(H.error);
                }, H.onblocked = function() {
                  console.warn('dropInstance blocked for database "' + e.name + '" until all open connections are closed');
                }, H.onsuccess = function() {
                  var j = H.result;
                  j && j.close(), L(j);
                };
              });
              return O.then(function(L) {
                h.db = L;
                for (var U = 0; U < v.length; U++) {
                  var H = v[U];
                  J(H._dbInfo);
                }
              }).catch(function(L) {
                throw (K(e, L) || m.resolve()).catch(function() {
                }), L;
              });
            });
          }
          return E(u, o), u;
        }
        var ot = {
          _driver: "asyncStorage",
          _initStorage: Ve,
          _support: w(),
          iterate: Qe,
          getItem: Ge,
          setItem: Xe,
          removeItem: qe,
          clear: Ze,
          length: et,
          key: tt,
          keys: rt,
          dropInstance: nt
        };
        function it() {
          return typeof openDatabase == "function";
        }
        var te = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", at = "~~local_forage_type~", Ee = /^~~local_forage_type~([^~]+)~/, ce = "__lfsc__:", de = ce.length, ve = "arbf", pe = "blob", Re = "si08", Ie = "ui08", Ae = "uic8", Ne = "si16", De = "si32", Fe = "ur16", Ce = "ui32", Oe = "fl32", Be = "fl64", Te = de + ve.length, Pe = Object.prototype.toString;
        function Le(e) {
          var o = e.length * 0.75, t = e.length, f, u = 0, s, c, l, h;
          e[e.length - 1] === "=" && (o--, e[e.length - 2] === "=" && o--);
          var v = new ArrayBuffer(o), y = new Uint8Array(v);
          for (f = 0; f < t; f += 4)
            s = te.indexOf(e[f]), c = te.indexOf(e[f + 1]), l = te.indexOf(e[f + 2]), h = te.indexOf(e[f + 3]), y[u++] = s << 2 | c >> 4, y[u++] = (c & 15) << 4 | l >> 2, y[u++] = (l & 3) << 6 | h & 63;
          return v;
        }
        function ye(e) {
          var o = new Uint8Array(e), t = "", f;
          for (f = 0; f < o.length; f += 3)
            t += te[o[f] >> 2], t += te[(o[f] & 3) << 4 | o[f + 1] >> 4], t += te[(o[f + 1] & 15) << 2 | o[f + 2] >> 6], t += te[o[f + 2] & 63];
          return o.length % 3 === 2 ? t = t.substring(0, t.length - 1) + "=" : o.length % 3 === 1 && (t = t.substring(0, t.length - 2) + "=="), t;
        }
        function st(e, o) {
          var t = "";
          if (e && (t = Pe.call(e)), e && (t === "[object ArrayBuffer]" || e.buffer && Pe.call(e.buffer) === "[object ArrayBuffer]")) {
            var f, u = ce;
            e instanceof ArrayBuffer ? (f = e, u += ve) : (f = e.buffer, t === "[object Int8Array]" ? u += Re : t === "[object Uint8Array]" ? u += Ie : t === "[object Uint8ClampedArray]" ? u += Ae : t === "[object Int16Array]" ? u += Ne : t === "[object Uint16Array]" ? u += Fe : t === "[object Int32Array]" ? u += De : t === "[object Uint32Array]" ? u += Ce : t === "[object Float32Array]" ? u += Oe : t === "[object Float64Array]" ? u += Be : o(new Error("Failed to get type for BinaryArray"))), o(u + ye(f));
          } else if (t === "[object Blob]") {
            var s = new FileReader();
            s.onload = function() {
              var c = at + e.type + "~" + ye(this.result);
              o(ce + pe + c);
            }, s.readAsArrayBuffer(e);
          } else
            try {
              o(JSON.stringify(e));
            } catch (c) {
              console.error("Couldn't convert value into a JSON string: ", e), o(null, c);
            }
        }
        function ft(e) {
          if (e.substring(0, de) !== ce)
            return JSON.parse(e);
          var o = e.substring(Te), t = e.substring(de, Te), f;
          if (t === pe && Ee.test(o)) {
            var u = o.match(Ee);
            f = u[1], o = o.substring(u[0].length);
          }
          var s = Le(o);
          switch (t) {
            case ve:
              return s;
            case pe:
              return X([s], { type: f });
            case Re:
              return new Int8Array(s);
            case Ie:
              return new Uint8Array(s);
            case Ae:
              return new Uint8ClampedArray(s);
            case Ne:
              return new Int16Array(s);
            case Fe:
              return new Uint16Array(s);
            case De:
              return new Int32Array(s);
            case Ce:
              return new Uint32Array(s);
            case Oe:
              return new Float32Array(s);
            case Be:
              return new Float64Array(s);
            default:
              throw new Error("Unkown type: " + t);
          }
        }
        var me = {
          serialize: st,
          deserialize: ft,
          stringToBuffer: Le,
          bufferToString: ye
        };
        function Me(e, o, t, f) {
          e.executeSql("CREATE TABLE IF NOT EXISTS " + o.storeName + " (id INTEGER PRIMARY KEY, key unique, value)", [], t, f);
        }
        function ut(e) {
          var o = this, t = {
            db: null
          };
          if (e)
            for (var f in e)
              t[f] = typeof e[f] != "string" ? e[f].toString() : e[f];
          var u = new m(function(s, c) {
            try {
              t.db = openDatabase(t.name, String(t.version), t.description, t.size);
            } catch (l) {
              return c(l);
            }
            t.db.transaction(function(l) {
              Me(l, t, function() {
                o._dbInfo = t, s();
              }, function(h, v) {
                c(v);
              });
            }, c);
          });
          return t.serializer = me, u;
        }
        function re(e, o, t, f, u, s) {
          e.executeSql(t, f, u, function(c, l) {
            l.code === l.SYNTAX_ERR ? c.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", [o.storeName], function(h, v) {
              v.rows.length ? s(h, l) : Me(h, o, function() {
                h.executeSql(t, f, u, s);
              }, s);
            }, s) : s(c, l);
          }, s);
        }
        function ct(e, o) {
          var t = this;
          e = F(e);
          var f = new m(function(u, s) {
            t.ready().then(function() {
              var c = t._dbInfo;
              c.db.transaction(function(l) {
                re(l, c, "SELECT * FROM " + c.storeName + " WHERE key = ? LIMIT 1", [e], function(h, v) {
                  var y = v.rows.length ? v.rows.item(0).value : null;
                  y && (y = c.serializer.deserialize(y)), u(y);
                }, function(h, v) {
                  s(v);
                });
              });
            }).catch(s);
          });
          return E(f, o), f;
        }
        function lt(e, o) {
          var t = this, f = new m(function(u, s) {
            t.ready().then(function() {
              var c = t._dbInfo;
              c.db.transaction(function(l) {
                re(l, c, "SELECT * FROM " + c.storeName, [], function(h, v) {
                  for (var y = v.rows, b = y.length, O = 0; O < b; O++) {
                    var L = y.item(O), U = L.value;
                    if (U && (U = c.serializer.deserialize(U)), U = e(U, L.key, O + 1), U !== void 0) {
                      u(U);
                      return;
                    }
                  }
                  u();
                }, function(h, v) {
                  s(v);
                });
              });
            }).catch(s);
          });
          return E(f, o), f;
        }
        function Ue(e, o, t, f) {
          var u = this;
          e = F(e);
          var s = new m(function(c, l) {
            u.ready().then(function() {
              o === void 0 && (o = null);
              var h = o, v = u._dbInfo;
              v.serializer.serialize(o, function(y, b) {
                b ? l(b) : v.db.transaction(function(O) {
                  re(O, v, "INSERT OR REPLACE INTO " + v.storeName + " (key, value) VALUES (?, ?)", [e, y], function() {
                    c(h);
                  }, function(L, U) {
                    l(U);
                  });
                }, function(O) {
                  if (O.code === O.QUOTA_ERR) {
                    if (f > 0) {
                      c(Ue.apply(u, [e, h, t, f - 1]));
                      return;
                    }
                    l(O);
                  }
                });
              });
            }).catch(l);
          });
          return E(s, t), s;
        }
        function ht(e, o, t) {
          return Ue.apply(this, [e, o, t, 1]);
        }
        function dt(e, o) {
          var t = this;
          e = F(e);
          var f = new m(function(u, s) {
            t.ready().then(function() {
              var c = t._dbInfo;
              c.db.transaction(function(l) {
                re(l, c, "DELETE FROM " + c.storeName + " WHERE key = ?", [e], function() {
                  u();
                }, function(h, v) {
                  s(v);
                });
              });
            }).catch(s);
          });
          return E(f, o), f;
        }
        function vt(e) {
          var o = this, t = new m(function(f, u) {
            o.ready().then(function() {
              var s = o._dbInfo;
              s.db.transaction(function(c) {
                re(c, s, "DELETE FROM " + s.storeName, [], function() {
                  f();
                }, function(l, h) {
                  u(h);
                });
              });
            }).catch(u);
          });
          return E(t, e), t;
        }
        function pt(e) {
          var o = this, t = new m(function(f, u) {
            o.ready().then(function() {
              var s = o._dbInfo;
              s.db.transaction(function(c) {
                re(c, s, "SELECT COUNT(key) as c FROM " + s.storeName, [], function(l, h) {
                  var v = h.rows.item(0).c;
                  f(v);
                }, function(l, h) {
                  u(h);
                });
              });
            }).catch(u);
          });
          return E(t, e), t;
        }
        function yt(e, o) {
          var t = this, f = new m(function(u, s) {
            t.ready().then(function() {
              var c = t._dbInfo;
              c.db.transaction(function(l) {
                re(l, c, "SELECT key FROM " + c.storeName + " WHERE id = ? LIMIT 1", [e + 1], function(h, v) {
                  var y = v.rows.length ? v.rows.item(0).key : null;
                  u(y);
                }, function(h, v) {
                  s(v);
                });
              });
            }).catch(s);
          });
          return E(f, o), f;
        }
        function mt(e) {
          var o = this, t = new m(function(f, u) {
            o.ready().then(function() {
              var s = o._dbInfo;
              s.db.transaction(function(c) {
                re(c, s, "SELECT key FROM " + s.storeName, [], function(l, h) {
                  for (var v = [], y = 0; y < h.rows.length; y++)
                    v.push(h.rows.item(y).key);
                  f(v);
                }, function(l, h) {
                  u(h);
                });
              });
            }).catch(u);
          });
          return E(t, e), t;
        }
        function gt(e) {
          return new m(function(o, t) {
            e.transaction(function(f) {
              f.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'", [], function(u, s) {
                for (var c = [], l = 0; l < s.rows.length; l++)
                  c.push(s.rows.item(l).name);
                o({
                  db: e,
                  storeNames: c
                });
              }, function(u, s) {
                t(s);
              });
            }, function(f) {
              t(f);
            });
          });
        }
        function bt(e, o) {
          o = G.apply(this, arguments);
          var t = this.config();
          e = typeof e != "function" && e || {}, e.name || (e.name = e.name || t.name, e.storeName = e.storeName || t.storeName);
          var f = this, u;
          return e.name ? u = new m(function(s) {
            var c;
            e.name === t.name ? c = f._dbInfo.db : c = openDatabase(e.name, "", "", 0), e.storeName ? s({
              db: c,
              storeNames: [e.storeName]
            }) : s(gt(c));
          }).then(function(s) {
            return new m(function(c, l) {
              s.db.transaction(function(h) {
                function v(L) {
                  return new m(function(U, H) {
                    h.executeSql("DROP TABLE IF EXISTS " + L, [], function() {
                      U();
                    }, function(j, Z) {
                      H(Z);
                    });
                  });
                }
                for (var y = [], b = 0, O = s.storeNames.length; b < O; b++)
                  y.push(v(s.storeNames[b]));
                m.all(y).then(function() {
                  c();
                }).catch(function(L) {
                  l(L);
                });
              }, function(h) {
                l(h);
              });
            });
          }) : u = m.reject("Invalid arguments"), E(u, o), u;
        }
        var _t = {
          _driver: "webSQLStorage",
          _initStorage: ut,
          _support: it(),
          iterate: lt,
          getItem: ct,
          setItem: ht,
          removeItem: dt,
          clear: vt,
          length: pt,
          key: yt,
          keys: mt,
          dropInstance: bt
        };
        function wt() {
          try {
            return typeof localStorage < "u" && "setItem" in localStorage && // in IE8 typeof localStorage.setItem === 'object'
            !!localStorage.setItem;
          } catch {
            return !1;
          }
        }
        function ze(e, o) {
          var t = e.name + "/";
          return e.storeName !== o.storeName && (t += e.storeName + "/"), t;
        }
        function xt() {
          var e = "_localforage_support_test";
          try {
            return localStorage.setItem(e, !0), localStorage.removeItem(e), !1;
          } catch {
            return !0;
          }
        }
        function St() {
          return !xt() || localStorage.length > 0;
        }
        function Et(e) {
          var o = this, t = {};
          if (e)
            for (var f in e)
              t[f] = e[f];
          return t.keyPrefix = ze(e, o._defaultConfig), St() ? (o._dbInfo = t, t.serializer = me, m.resolve()) : m.reject();
        }
        function Rt(e) {
          var o = this, t = o.ready().then(function() {
            for (var f = o._dbInfo.keyPrefix, u = localStorage.length - 1; u >= 0; u--) {
              var s = localStorage.key(u);
              s.indexOf(f) === 0 && localStorage.removeItem(s);
            }
          });
          return E(t, e), t;
        }
        function It(e, o) {
          var t = this;
          e = F(e);
          var f = t.ready().then(function() {
            var u = t._dbInfo, s = localStorage.getItem(u.keyPrefix + e);
            return s && (s = u.serializer.deserialize(s)), s;
          });
          return E(f, o), f;
        }
        function At(e, o) {
          var t = this, f = t.ready().then(function() {
            for (var u = t._dbInfo, s = u.keyPrefix, c = s.length, l = localStorage.length, h = 1, v = 0; v < l; v++) {
              var y = localStorage.key(v);
              if (y.indexOf(s) === 0) {
                var b = localStorage.getItem(y);
                if (b && (b = u.serializer.deserialize(b)), b = e(b, y.substring(c), h++), b !== void 0)
                  return b;
              }
            }
          });
          return E(f, o), f;
        }
        function Nt(e, o) {
          var t = this, f = t.ready().then(function() {
            var u = t._dbInfo, s;
            try {
              s = localStorage.key(e);
            } catch {
              s = null;
            }
            return s && (s = s.substring(u.keyPrefix.length)), s;
          });
          return E(f, o), f;
        }
        function Dt(e) {
          var o = this, t = o.ready().then(function() {
            for (var f = o._dbInfo, u = localStorage.length, s = [], c = 0; c < u; c++) {
              var l = localStorage.key(c);
              l.indexOf(f.keyPrefix) === 0 && s.push(l.substring(f.keyPrefix.length));
            }
            return s;
          });
          return E(t, e), t;
        }
        function Ft(e) {
          var o = this, t = o.keys().then(function(f) {
            return f.length;
          });
          return E(t, e), t;
        }
        function Ct(e, o) {
          var t = this;
          e = F(e);
          var f = t.ready().then(function() {
            var u = t._dbInfo;
            localStorage.removeItem(u.keyPrefix + e);
          });
          return E(f, o), f;
        }
        function Ot(e, o, t) {
          var f = this;
          e = F(e);
          var u = f.ready().then(function() {
            o === void 0 && (o = null);
            var s = o;
            return new m(function(c, l) {
              var h = f._dbInfo;
              h.serializer.serialize(o, function(v, y) {
                if (y)
                  l(y);
                else
                  try {
                    localStorage.setItem(h.keyPrefix + e, v), c(s);
                  } catch (b) {
                    (b.name === "QuotaExceededError" || b.name === "NS_ERROR_DOM_QUOTA_REACHED") && l(b), l(b);
                  }
              });
            });
          });
          return E(u, t), u;
        }
        function Bt(e, o) {
          if (o = G.apply(this, arguments), e = typeof e != "function" && e || {}, !e.name) {
            var t = this.config();
            e.name = e.name || t.name, e.storeName = e.storeName || t.storeName;
          }
          var f = this, u;
          return e.name ? u = new m(function(s) {
            e.storeName ? s(ze(e, f._defaultConfig)) : s(e.name + "/");
          }).then(function(s) {
            for (var c = localStorage.length - 1; c >= 0; c--) {
              var l = localStorage.key(c);
              l.indexOf(s) === 0 && localStorage.removeItem(l);
            }
          }) : u = m.reject("Invalid arguments"), E(u, o), u;
        }
        var Tt = {
          _driver: "localStorageWrapper",
          _initStorage: Et,
          _support: wt(),
          iterate: At,
          getItem: It,
          setItem: Ot,
          removeItem: Ct,
          clear: Rt,
          length: Ft,
          key: Nt,
          keys: Dt,
          dropInstance: Bt
        }, Pt = function(o, t) {
          return o === t || typeof o == "number" && typeof t == "number" && isNaN(o) && isNaN(t);
        }, Lt = function(o, t) {
          for (var f = o.length, u = 0; u < f; ) {
            if (Pt(o[u], t))
              return !0;
            u++;
          }
          return !1;
        }, $e = Array.isArray || function(e) {
          return Object.prototype.toString.call(e) === "[object Array]";
        }, se = {}, ke = {}, ie = {
          INDEXEDDB: ot,
          WEBSQL: _t,
          LOCALSTORAGE: Tt
        }, Mt = [ie.INDEXEDDB._driver, ie.WEBSQL._driver, ie.LOCALSTORAGE._driver], le = ["dropInstance"], ge = ["clear", "getItem", "iterate", "key", "keys", "length", "removeItem", "setItem"].concat(le), Ut = {
          description: "",
          driver: Mt.slice(),
          name: "localforage",
          // Default DB size is _JUST UNDER_ 5MB, as it's the highest size
          // we can use without a prompt.
          size: 4980736,
          storeName: "keyvaluepairs",
          version: 1
        };
        function zt(e, o) {
          e[o] = function() {
            var t = arguments;
            return e.ready().then(function() {
              return e[o].apply(e, t);
            });
          };
        }
        function be() {
          for (var e = 1; e < arguments.length; e++) {
            var o = arguments[e];
            if (o)
              for (var t in o)
                o.hasOwnProperty(t) && ($e(o[t]) ? arguments[0][t] = o[t].slice() : arguments[0][t] = o[t]);
          }
          return arguments[0];
        }
        var $t = (function() {
          function e(o) {
            k(this, e);
            for (var t in ie)
              if (ie.hasOwnProperty(t)) {
                var f = ie[t], u = f._driver;
                this[t] = u, se[u] || this.defineDriver(f);
              }
            this._defaultConfig = be({}, Ut), this._config = be({}, this._defaultConfig, o), this._driverSet = null, this._initDriver = null, this._ready = !1, this._dbInfo = null, this._wrapLibraryMethodsWithReady(), this.setDriver(this._config.driver).catch(function() {
            });
          }
          return e.prototype.config = function(t) {
            if ((typeof t > "u" ? "undefined" : B(t)) === "object") {
              if (this._ready)
                return new Error("Can't call config() after localforage has been used.");
              for (var f in t) {
                if (f === "storeName" && (t[f] = t[f].replace(/\W/g, "_")), f === "version" && typeof t[f] != "number")
                  return new Error("Database version must be a number.");
                this._config[f] = t[f];
              }
              return "driver" in t && t.driver ? this.setDriver(this._config.driver) : !0;
            } else return typeof t == "string" ? this._config[t] : this._config;
          }, e.prototype.defineDriver = function(t, f, u) {
            var s = new m(function(c, l) {
              try {
                var h = t._driver, v = new Error("Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver");
                if (!t._driver) {
                  l(v);
                  return;
                }
                for (var y = ge.concat("_initStorage"), b = 0, O = y.length; b < O; b++) {
                  var L = y[b], U = !Lt(le, L);
                  if ((U || t[L]) && typeof t[L] != "function") {
                    l(v);
                    return;
                  }
                }
                var H = function() {
                  for (var fe = function(Yt) {
                    return function() {
                      var jt = new Error("Method " + Yt + " is not implemented by the current driver"), We = m.reject(jt);
                      return E(We, arguments[arguments.length - 1]), We;
                    };
                  }, _e = 0, Wt = le.length; _e < Wt; _e++) {
                    var we = le[_e];
                    t[we] || (t[we] = fe(we));
                  }
                };
                H();
                var j = function(fe) {
                  se[h] && console.info("Redefining LocalForage driver: " + h), se[h] = t, ke[h] = fe, c();
                };
                "_support" in t ? t._support && typeof t._support == "function" ? t._support().then(j, l) : j(!!t._support) : j(!0);
              } catch (Z) {
                l(Z);
              }
            });
            return $(s, f, u), s;
          }, e.prototype.driver = function() {
            return this._driver || null;
          }, e.prototype.getDriver = function(t, f, u) {
            var s = se[t] ? m.resolve(se[t]) : m.reject(new Error("Driver not found."));
            return $(s, f, u), s;
          }, e.prototype.getSerializer = function(t) {
            var f = m.resolve(me);
            return $(f, t), f;
          }, e.prototype.ready = function(t) {
            var f = this, u = f._driverSet.then(function() {
              return f._ready === null && (f._ready = f._initDriver()), f._ready;
            });
            return $(u, t, t), u;
          }, e.prototype.setDriver = function(t, f, u) {
            var s = this;
            $e(t) || (t = [t]);
            var c = this._getSupportedDrivers(t);
            function l() {
              s._config.driver = s.driver();
            }
            function h(b) {
              return s._extend(b), l(), s._ready = s._initStorage(s._config), s._ready;
            }
            function v(b) {
              return function() {
                var O = 0;
                function L() {
                  for (; O < b.length; ) {
                    var U = b[O];
                    return O++, s._dbInfo = null, s._ready = null, s.getDriver(U).then(h).catch(L);
                  }
                  l();
                  var H = new Error("No available storage method found.");
                  return s._driverSet = m.reject(H), s._driverSet;
                }
                return L();
              };
            }
            var y = this._driverSet !== null ? this._driverSet.catch(function() {
              return m.resolve();
            }) : m.resolve();
            return this._driverSet = y.then(function() {
              var b = c[0];
              return s._dbInfo = null, s._ready = null, s.getDriver(b).then(function(O) {
                s._driver = O._driver, l(), s._wrapLibraryMethodsWithReady(), s._initDriver = v(c);
              });
            }).catch(function() {
              l();
              var b = new Error("No available storage method found.");
              return s._driverSet = m.reject(b), s._driverSet;
            }), $(this._driverSet, f, u), this._driverSet;
          }, e.prototype.supports = function(t) {
            return !!ke[t];
          }, e.prototype._extend = function(t) {
            be(this, t);
          }, e.prototype._getSupportedDrivers = function(t) {
            for (var f = [], u = 0, s = t.length; u < s; u++) {
              var c = t[u];
              this.supports(c) && f.push(c);
            }
            return f;
          }, e.prototype._wrapLibraryMethodsWithReady = function() {
            for (var t = 0, f = ge.length; t < f; t++)
              zt(this, ge[t]);
          }, e.prototype.createInstance = function(t) {
            return new e(t);
          }, e;
        })(), kt = new $t();
        A.exports = kt;
      }, { 3: 3 }] }, {}, [4])(4);
    });
  })(xe)), xe.exports;
}
var Vt = Kt();
const ne = /* @__PURE__ */ Ht(Vt);
var Se = { exports: {} };
const Gt = {}, Qt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Gt
}, Symbol.toStringTag, { value: "Module" })), je = /* @__PURE__ */ Jt(Qt);
var He;
function Xt() {
  return He || (He = 1, (function(T) {
    (function() {
      var I = "input is invalid type", S = "finalize already called", A = typeof window == "object", R = A ? window : {};
      R.JS_MD5_NO_WINDOW && (A = !1);
      var B = !A && typeof self == "object", k = !R.JS_MD5_NO_NODE_JS && typeof process == "object" && process.versions && process.versions.node;
      k ? R = ue : B && (R = self);
      var N = !R.JS_MD5_NO_COMMON_JS && !0 && T.exports, z = !R.JS_MD5_NO_ARRAY_BUFFER && typeof ArrayBuffer < "u", w = "0123456789abcdef".split(""), X = [128, 32768, 8388608, -2147483648], m = [0, 8, 16, 24], E = ["hex", "array", "digest", "buffer", "arrayBuffer", "base64"], $ = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split(""), F = [], G;
      if (z) {
        var Y = new ArrayBuffer(68);
        G = new Uint8Array(Y), F = new Uint32Array(Y);
      }
      var Q = Array.isArray;
      (R.JS_MD5_NO_NODE_JS || !Q) && (Q = function(r) {
        return Object.prototype.toString.call(r) === "[object Array]";
      });
      var W = ArrayBuffer.isView;
      z && (R.JS_MD5_NO_ARRAY_BUFFER_IS_VIEW || !W) && (W = function(r) {
        return typeof r == "object" && r.buffer && r.buffer.constructor === ArrayBuffer;
      });
      var oe = function(r) {
        var i = typeof r;
        if (i === "string")
          return [r, !0];
        if (i !== "object" || r === null)
          throw new Error(I);
        if (z && r.constructor === ArrayBuffer)
          return [new Uint8Array(r), !1];
        if (!Q(r) && !W(r))
          throw new Error(I);
        return [r, !1];
      }, ee = function(r) {
        return function(i) {
          return new C(!0).update(i)[r]();
        };
      }, g = function() {
        var r = ee("hex");
        k && (r = P(r)), r.create = function() {
          return new C();
        }, r.update = function(n) {
          return r.create().update(n);
        };
        for (var i = 0; i < E.length; ++i) {
          var a = E[i];
          r[a] = ee(a);
        }
        return r;
      }, P = function(r) {
        var i = je, a = je.Buffer, n;
        a.from && !R.JS_MD5_NO_BUFFER_FROM ? n = a.from : n = function(d) {
          return new a(d);
        };
        var _ = function(d) {
          if (typeof d == "string")
            return i.createHash("md5").update(d, "utf8").digest("hex");
          if (d == null)
            throw new Error(I);
          return d.constructor === ArrayBuffer && (d = new Uint8Array(d)), Q(d) || W(d) || d.constructor === a ? i.createHash("md5").update(n(d)).digest("hex") : r(d);
        };
        return _;
      }, D = function(r) {
        return function(i, a) {
          return new J(i, !0).update(a)[r]();
        };
      }, M = function() {
        var r = D("hex");
        r.create = function(n) {
          return new J(n);
        }, r.update = function(n, _) {
          return r.create(n).update(_);
        };
        for (var i = 0; i < E.length; ++i) {
          var a = E[i];
          r[a] = D(a);
        }
        return r;
      };
      function C(r) {
        if (r)
          F[0] = F[16] = F[1] = F[2] = F[3] = F[4] = F[5] = F[6] = F[7] = F[8] = F[9] = F[10] = F[11] = F[12] = F[13] = F[14] = F[15] = 0, this.blocks = F, this.buffer8 = G;
        else if (z) {
          var i = new ArrayBuffer(68);
          this.buffer8 = new Uint8Array(i), this.blocks = new Uint32Array(i);
        } else
          this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.h0 = this.h1 = this.h2 = this.h3 = this.start = this.bytes = this.hBytes = 0, this.finalized = this.hashed = !1, this.first = !0;
      }
      C.prototype.update = function(r) {
        if (this.finalized)
          throw new Error(S);
        var i = oe(r);
        r = i[0];
        for (var a = i[1], n, _ = 0, d, p = r.length, x = this.blocks, V = this.buffer8; _ < p; ) {
          if (this.hashed && (this.hashed = !1, x[0] = x[16], x[16] = x[1] = x[2] = x[3] = x[4] = x[5] = x[6] = x[7] = x[8] = x[9] = x[10] = x[11] = x[12] = x[13] = x[14] = x[15] = 0), a)
            if (z)
              for (d = this.start; _ < p && d < 64; ++_)
                n = r.charCodeAt(_), n < 128 ? V[d++] = n : n < 2048 ? (V[d++] = 192 | n >>> 6, V[d++] = 128 | n & 63) : n < 55296 || n >= 57344 ? (V[d++] = 224 | n >>> 12, V[d++] = 128 | n >>> 6 & 63, V[d++] = 128 | n & 63) : (n = 65536 + ((n & 1023) << 10 | r.charCodeAt(++_) & 1023), V[d++] = 240 | n >>> 18, V[d++] = 128 | n >>> 12 & 63, V[d++] = 128 | n >>> 6 & 63, V[d++] = 128 | n & 63);
            else
              for (d = this.start; _ < p && d < 64; ++_)
                n = r.charCodeAt(_), n < 128 ? x[d >>> 2] |= n << m[d++ & 3] : n < 2048 ? (x[d >>> 2] |= (192 | n >>> 6) << m[d++ & 3], x[d >>> 2] |= (128 | n & 63) << m[d++ & 3]) : n < 55296 || n >= 57344 ? (x[d >>> 2] |= (224 | n >>> 12) << m[d++ & 3], x[d >>> 2] |= (128 | n >>> 6 & 63) << m[d++ & 3], x[d >>> 2] |= (128 | n & 63) << m[d++ & 3]) : (n = 65536 + ((n & 1023) << 10 | r.charCodeAt(++_) & 1023), x[d >>> 2] |= (240 | n >>> 18) << m[d++ & 3], x[d >>> 2] |= (128 | n >>> 12 & 63) << m[d++ & 3], x[d >>> 2] |= (128 | n >>> 6 & 63) << m[d++ & 3], x[d >>> 2] |= (128 | n & 63) << m[d++ & 3]);
          else if (z)
            for (d = this.start; _ < p && d < 64; ++_)
              V[d++] = r[_];
          else
            for (d = this.start; _ < p && d < 64; ++_)
              x[d >>> 2] |= r[_] << m[d++ & 3];
          this.lastByteIndex = d, this.bytes += d - this.start, d >= 64 ? (this.start = d - 64, this.hash(), this.hashed = !0) : this.start = d;
        }
        return this.bytes > 4294967295 && (this.hBytes += this.bytes / 4294967296 << 0, this.bytes = this.bytes % 4294967296), this;
      }, C.prototype.finalize = function() {
        if (!this.finalized) {
          this.finalized = !0;
          var r = this.blocks, i = this.lastByteIndex;
          r[i >>> 2] |= X[i & 3], i >= 56 && (this.hashed || this.hash(), r[0] = r[16], r[16] = r[1] = r[2] = r[3] = r[4] = r[5] = r[6] = r[7] = r[8] = r[9] = r[10] = r[11] = r[12] = r[13] = r[14] = r[15] = 0), r[14] = this.bytes << 3, r[15] = this.hBytes << 3 | this.bytes >>> 29, this.hash();
        }
      }, C.prototype.hash = function() {
        var r, i, a, n, _, d, p = this.blocks;
        this.first ? (r = p[0] - 680876937, r = (r << 7 | r >>> 25) - 271733879 << 0, n = (-1732584194 ^ r & 2004318071) + p[1] - 117830708, n = (n << 12 | n >>> 20) + r << 0, a = (-271733879 ^ n & (r ^ -271733879)) + p[2] - 1126478375, a = (a << 17 | a >>> 15) + n << 0, i = (r ^ a & (n ^ r)) + p[3] - 1316259209, i = (i << 22 | i >>> 10) + a << 0) : (r = this.h0, i = this.h1, a = this.h2, n = this.h3, r += (n ^ i & (a ^ n)) + p[0] - 680876936, r = (r << 7 | r >>> 25) + i << 0, n += (a ^ r & (i ^ a)) + p[1] - 389564586, n = (n << 12 | n >>> 20) + r << 0, a += (i ^ n & (r ^ i)) + p[2] + 606105819, a = (a << 17 | a >>> 15) + n << 0, i += (r ^ a & (n ^ r)) + p[3] - 1044525330, i = (i << 22 | i >>> 10) + a << 0), r += (n ^ i & (a ^ n)) + p[4] - 176418897, r = (r << 7 | r >>> 25) + i << 0, n += (a ^ r & (i ^ a)) + p[5] + 1200080426, n = (n << 12 | n >>> 20) + r << 0, a += (i ^ n & (r ^ i)) + p[6] - 1473231341, a = (a << 17 | a >>> 15) + n << 0, i += (r ^ a & (n ^ r)) + p[7] - 45705983, i = (i << 22 | i >>> 10) + a << 0, r += (n ^ i & (a ^ n)) + p[8] + 1770035416, r = (r << 7 | r >>> 25) + i << 0, n += (a ^ r & (i ^ a)) + p[9] - 1958414417, n = (n << 12 | n >>> 20) + r << 0, a += (i ^ n & (r ^ i)) + p[10] - 42063, a = (a << 17 | a >>> 15) + n << 0, i += (r ^ a & (n ^ r)) + p[11] - 1990404162, i = (i << 22 | i >>> 10) + a << 0, r += (n ^ i & (a ^ n)) + p[12] + 1804603682, r = (r << 7 | r >>> 25) + i << 0, n += (a ^ r & (i ^ a)) + p[13] - 40341101, n = (n << 12 | n >>> 20) + r << 0, a += (i ^ n & (r ^ i)) + p[14] - 1502002290, a = (a << 17 | a >>> 15) + n << 0, i += (r ^ a & (n ^ r)) + p[15] + 1236535329, i = (i << 22 | i >>> 10) + a << 0, r += (a ^ n & (i ^ a)) + p[1] - 165796510, r = (r << 5 | r >>> 27) + i << 0, n += (i ^ a & (r ^ i)) + p[6] - 1069501632, n = (n << 9 | n >>> 23) + r << 0, a += (r ^ i & (n ^ r)) + p[11] + 643717713, a = (a << 14 | a >>> 18) + n << 0, i += (n ^ r & (a ^ n)) + p[0] - 373897302, i = (i << 20 | i >>> 12) + a << 0, r += (a ^ n & (i ^ a)) + p[5] - 701558691, r = (r << 5 | r >>> 27) + i << 0, n += (i ^ a & (r ^ i)) + p[10] + 38016083, n = (n << 9 | n >>> 23) + r << 0, a += (r ^ i & (n ^ r)) + p[15] - 660478335, a = (a << 14 | a >>> 18) + n << 0, i += (n ^ r & (a ^ n)) + p[4] - 405537848, i = (i << 20 | i >>> 12) + a << 0, r += (a ^ n & (i ^ a)) + p[9] + 568446438, r = (r << 5 | r >>> 27) + i << 0, n += (i ^ a & (r ^ i)) + p[14] - 1019803690, n = (n << 9 | n >>> 23) + r << 0, a += (r ^ i & (n ^ r)) + p[3] - 187363961, a = (a << 14 | a >>> 18) + n << 0, i += (n ^ r & (a ^ n)) + p[8] + 1163531501, i = (i << 20 | i >>> 12) + a << 0, r += (a ^ n & (i ^ a)) + p[13] - 1444681467, r = (r << 5 | r >>> 27) + i << 0, n += (i ^ a & (r ^ i)) + p[2] - 51403784, n = (n << 9 | n >>> 23) + r << 0, a += (r ^ i & (n ^ r)) + p[7] + 1735328473, a = (a << 14 | a >>> 18) + n << 0, i += (n ^ r & (a ^ n)) + p[12] - 1926607734, i = (i << 20 | i >>> 12) + a << 0, _ = i ^ a, r += (_ ^ n) + p[5] - 378558, r = (r << 4 | r >>> 28) + i << 0, n += (_ ^ r) + p[8] - 2022574463, n = (n << 11 | n >>> 21) + r << 0, d = n ^ r, a += (d ^ i) + p[11] + 1839030562, a = (a << 16 | a >>> 16) + n << 0, i += (d ^ a) + p[14] - 35309556, i = (i << 23 | i >>> 9) + a << 0, _ = i ^ a, r += (_ ^ n) + p[1] - 1530992060, r = (r << 4 | r >>> 28) + i << 0, n += (_ ^ r) + p[4] + 1272893353, n = (n << 11 | n >>> 21) + r << 0, d = n ^ r, a += (d ^ i) + p[7] - 155497632, a = (a << 16 | a >>> 16) + n << 0, i += (d ^ a) + p[10] - 1094730640, i = (i << 23 | i >>> 9) + a << 0, _ = i ^ a, r += (_ ^ n) + p[13] + 681279174, r = (r << 4 | r >>> 28) + i << 0, n += (_ ^ r) + p[0] - 358537222, n = (n << 11 | n >>> 21) + r << 0, d = n ^ r, a += (d ^ i) + p[3] - 722521979, a = (a << 16 | a >>> 16) + n << 0, i += (d ^ a) + p[6] + 76029189, i = (i << 23 | i >>> 9) + a << 0, _ = i ^ a, r += (_ ^ n) + p[9] - 640364487, r = (r << 4 | r >>> 28) + i << 0, n += (_ ^ r) + p[12] - 421815835, n = (n << 11 | n >>> 21) + r << 0, d = n ^ r, a += (d ^ i) + p[15] + 530742520, a = (a << 16 | a >>> 16) + n << 0, i += (d ^ a) + p[2] - 995338651, i = (i << 23 | i >>> 9) + a << 0, r += (a ^ (i | ~n)) + p[0] - 198630844, r = (r << 6 | r >>> 26) + i << 0, n += (i ^ (r | ~a)) + p[7] + 1126891415, n = (n << 10 | n >>> 22) + r << 0, a += (r ^ (n | ~i)) + p[14] - 1416354905, a = (a << 15 | a >>> 17) + n << 0, i += (n ^ (a | ~r)) + p[5] - 57434055, i = (i << 21 | i >>> 11) + a << 0, r += (a ^ (i | ~n)) + p[12] + 1700485571, r = (r << 6 | r >>> 26) + i << 0, n += (i ^ (r | ~a)) + p[3] - 1894986606, n = (n << 10 | n >>> 22) + r << 0, a += (r ^ (n | ~i)) + p[10] - 1051523, a = (a << 15 | a >>> 17) + n << 0, i += (n ^ (a | ~r)) + p[1] - 2054922799, i = (i << 21 | i >>> 11) + a << 0, r += (a ^ (i | ~n)) + p[8] + 1873313359, r = (r << 6 | r >>> 26) + i << 0, n += (i ^ (r | ~a)) + p[15] - 30611744, n = (n << 10 | n >>> 22) + r << 0, a += (r ^ (n | ~i)) + p[6] - 1560198380, a = (a << 15 | a >>> 17) + n << 0, i += (n ^ (a | ~r)) + p[13] + 1309151649, i = (i << 21 | i >>> 11) + a << 0, r += (a ^ (i | ~n)) + p[4] - 145523070, r = (r << 6 | r >>> 26) + i << 0, n += (i ^ (r | ~a)) + p[11] - 1120210379, n = (n << 10 | n >>> 22) + r << 0, a += (r ^ (n | ~i)) + p[2] + 718787259, a = (a << 15 | a >>> 17) + n << 0, i += (n ^ (a | ~r)) + p[9] - 343485551, i = (i << 21 | i >>> 11) + a << 0, this.first ? (this.h0 = r + 1732584193 << 0, this.h1 = i - 271733879 << 0, this.h2 = a - 1732584194 << 0, this.h3 = n + 271733878 << 0, this.first = !1) : (this.h0 = this.h0 + r << 0, this.h1 = this.h1 + i << 0, this.h2 = this.h2 + a << 0, this.h3 = this.h3 + n << 0);
      }, C.prototype.hex = function() {
        this.finalize();
        var r = this.h0, i = this.h1, a = this.h2, n = this.h3;
        return w[r >>> 4 & 15] + w[r & 15] + w[r >>> 12 & 15] + w[r >>> 8 & 15] + w[r >>> 20 & 15] + w[r >>> 16 & 15] + w[r >>> 28 & 15] + w[r >>> 24 & 15] + w[i >>> 4 & 15] + w[i & 15] + w[i >>> 12 & 15] + w[i >>> 8 & 15] + w[i >>> 20 & 15] + w[i >>> 16 & 15] + w[i >>> 28 & 15] + w[i >>> 24 & 15] + w[a >>> 4 & 15] + w[a & 15] + w[a >>> 12 & 15] + w[a >>> 8 & 15] + w[a >>> 20 & 15] + w[a >>> 16 & 15] + w[a >>> 28 & 15] + w[a >>> 24 & 15] + w[n >>> 4 & 15] + w[n & 15] + w[n >>> 12 & 15] + w[n >>> 8 & 15] + w[n >>> 20 & 15] + w[n >>> 16 & 15] + w[n >>> 28 & 15] + w[n >>> 24 & 15];
      }, C.prototype.toString = C.prototype.hex, C.prototype.digest = function() {
        this.finalize();
        var r = this.h0, i = this.h1, a = this.h2, n = this.h3;
        return [
          r & 255,
          r >>> 8 & 255,
          r >>> 16 & 255,
          r >>> 24 & 255,
          i & 255,
          i >>> 8 & 255,
          i >>> 16 & 255,
          i >>> 24 & 255,
          a & 255,
          a >>> 8 & 255,
          a >>> 16 & 255,
          a >>> 24 & 255,
          n & 255,
          n >>> 8 & 255,
          n >>> 16 & 255,
          n >>> 24 & 255
        ];
      }, C.prototype.array = C.prototype.digest, C.prototype.arrayBuffer = function() {
        this.finalize();
        var r = new ArrayBuffer(16), i = new Uint32Array(r);
        return i[0] = this.h0, i[1] = this.h1, i[2] = this.h2, i[3] = this.h3, r;
      }, C.prototype.buffer = C.prototype.arrayBuffer, C.prototype.base64 = function() {
        for (var r, i, a, n = "", _ = this.array(), d = 0; d < 15; )
          r = _[d++], i = _[d++], a = _[d++], n += $[r >>> 2] + $[(r << 4 | i >>> 4) & 63] + $[(i << 2 | a >>> 6) & 63] + $[a & 63];
        return r = _[d], n += $[r >>> 2] + $[r << 4 & 63] + "==", n;
      };
      function J(r, i) {
        var a, n = oe(r);
        if (r = n[0], n[1]) {
          var _ = [], d = r.length, p = 0, x;
          for (a = 0; a < d; ++a)
            x = r.charCodeAt(a), x < 128 ? _[p++] = x : x < 2048 ? (_[p++] = 192 | x >>> 6, _[p++] = 128 | x & 63) : x < 55296 || x >= 57344 ? (_[p++] = 224 | x >>> 12, _[p++] = 128 | x >>> 6 & 63, _[p++] = 128 | x & 63) : (x = 65536 + ((x & 1023) << 10 | r.charCodeAt(++a) & 1023), _[p++] = 240 | x >>> 18, _[p++] = 128 | x >>> 12 & 63, _[p++] = 128 | x >>> 6 & 63, _[p++] = 128 | x & 63);
          r = _;
        }
        r.length > 64 && (r = new C(!0).update(r).array());
        var V = [], q = [];
        for (a = 0; a < 64; ++a) {
          var ae = r[a] || 0;
          V[a] = 92 ^ ae, q[a] = 54 ^ ae;
        }
        C.call(this, i), this.update(q), this.oKeyPad = V, this.inner = !0, this.sharedMemory = i;
      }
      J.prototype = new C(), J.prototype.finalize = function() {
        if (C.prototype.finalize.call(this), this.inner) {
          this.inner = !1;
          var r = this.array();
          C.call(this, this.sharedMemory), this.update(this.oKeyPad), this.update(r), C.prototype.finalize.call(this);
        }
      };
      var K = g();
      K.md5 = K, K.md5.hmac = M(), N ? T.exports = K : R.md5 = K;
    })();
  })(Se)), Se.exports;
}
var qt = Xt(), Je = /* @__PURE__ */ ((T) => (T.PENDING = "pending", T.PAUSE = "pause", T.DOWNLOADING = "downloading", T.FINISHED = "finished", T.ERROR = "error", T))(Je || {}), Ke = /* @__PURE__ */ ((T) => (T.READY = "ready", T.STATUS_UPDATE = "status_update", T.PROGRESS_UPDATE = "progress_update", T))(Ke || {});
class er {
  static EVENTS = Ke;
  static STATUS = Je;
  url;
  fileName;
  isReady = !1;
  abortController;
  currentChunk = 0;
  chunkSize;
  totalChunk = 1;
  totalSize = 0;
  status = "pending";
  onReady;
  onStatusChange;
  onProgressUpdate;
  constructor({
    url: I,
    fileName: S,
    chunkSize: A = 10 * 1024 * 1024,
    onReady: R,
    onProgressUpdate: B,
    onStatusChange: k
  }) {
    this.url = I, this.fileName = S, this.chunkSize = A, this.abortController = new AbortController(), this.onReady = R, this.onProgressUpdate = B, this.onStatusChange = k, this.openDB();
  }
  changeStatus(I, S = null) {
    this.status = I, this.onStatusChange?.({
      status: I,
      error: S
    });
  }
  async openDB() {
    try {
      this.changeStatus(
        "pending"
        /* PENDING */
      ), await ne.ready(), await this.init(), this.onReady?.(), this.isReady = !0;
    } catch (I) {
      this.changeStatus("error", I);
    }
  }
  async getCompletedCount() {
    const I = this.getURLMd5();
    return (await ne.keys()).filter((A) => A.startsWith(`${I}_`)).length;
  }
  async getResumePosition() {
    const I = this.getURLMd5(), R = (await ne.keys()).filter((N) => N.startsWith(`${I}_`)).map((N) => parseInt(N.split("_")[1], 10)).filter((N) => !isNaN(N));
    let B = 0;
    const k = new Set(R);
    for (; k.has(B); )
      B++;
    return B;
  }
  async init() {
    const I = await this.getFileSize();
    this.totalSize = I, this.totalChunk = Math.ceil(this.totalSize / this.chunkSize), this.currentChunk = await this.getResumePosition(), this.updateProgress();
  }
  getURLMd5 = /* @__PURE__ */ (() => {
    let I;
    return () => I || (I = qt.md5(this.url));
  })();
  async getFileSize() {
    try {
      const { headers: A } = await fetch(this.url, {
        method: "HEAD"
      });
      let R = A.get("content-length");
      if (R) return Number(R);
    } catch {
    }
    const { headers: I } = await fetch(this.url, {
      method: "GET",
      headers: { Range: "bytes=0-0" }
    }), S = I.get("content-range");
    if (S) {
      const A = S.match(/\/(\d+)$/);
      if (A) return Number(A[1]);
    }
    throw new Error("无法获取文件大小");
  }
  getCurrentChunkName(I) {
    return `${this.getURLMd5()}_${I}`;
  }
  async getChunkData(I, S) {
    return (await fetch(this.url, {
      headers: {
        Range: `bytes=${I}-${S}`
      },
      signal: this.abortController?.signal
    })).arrayBuffer();
  }
  abort() {
    this.abortController?.abort(), this.abortController = new AbortController();
  }
  async updateProgress() {
    const S = (await this.getCompletedCount() / this.totalChunk * 100).toFixed(2);
    this.onProgressUpdate?.(S);
  }
  start() {
    this.isReady && (this.changeStatus(
      "downloading"
      /* DOWNLOADING */
    ), this.download());
  }
  pause() {
    this.changeStatus(
      "pause"
      /* PAUSE */
    ), this.abort();
  }
  async resume() {
    this.currentChunk = await this.getResumePosition(), this.changeStatus(
      "downloading"
      /* DOWNLOADING */
    ), this.download();
  }
  async cancel() {
    this.abort(), this.currentChunk = 0, this.totalChunk = 1, this.updateProgress(), this.changeStatus(
      "pending"
      /* PENDING */
    ), this.remove();
  }
  async uploadSingeChunk(I) {
    const S = this.getCurrentChunkName(I);
    if (await ne.getItem(S)) {
      this.updateProgress();
      return;
    }
    const A = I * this.chunkSize, R = Math.min(A + this.chunkSize - 1, this.totalSize - 1), B = await this.getChunkData(A, R);
    await ne.setItem(S, new Blob([B])), this.updateProgress();
  }
  async download() {
    try {
      const S = [], A = async (R) => {
        await this.uploadSingeChunk(R);
      };
      for (; this.currentChunk < this.totalChunk; ) {
        S.length >= 4 && await Promise.race(S);
        const R = A(this.currentChunk++).finally(() => {
          const B = S.indexOf(R);
          B > -1 && S.splice(B, 1);
        });
        S.push(R);
      }
      await Promise.all(S), this.changeStatus(
        "finished"
        /* FINISHED */
      ), this.mergeAndDownload();
    } catch (I) {
      console.error(I), this.changeStatus("error", I);
    }
  }
  async remove() {
    const S = `${this.getURLMd5()}_`, A = await ne.keys();
    await Promise.all(
      A.filter((R) => R.startsWith(S)).map((R) => ne.removeItem(R))
    );
  }
  async mergeAndDownload() {
    try {
      if (await this.getCompletedCount() < this.totalChunk) {
        this.changeStatus(
          "error",
          new Error("下载不完整，请取消再重新下载")
        );
        return;
      }
      const S = this.getURLMd5(), A = [];
      for (let z = 0; z < this.totalChunk; z++)
        A.push(ne.getItem(`${S}_${z}`));
      const R = await Promise.all(A), B = new Blob(R), k = URL.createObjectURL(B), N = document.createElement("a");
      N.href = k, N.download = this.fileName, document.body.append(N), N.click(), document.body.removeChild(N), URL.revokeObjectURL(k), setTimeout(async () => {
        await this.remove(), this.changeStatus(
          "pending"
          /* PENDING */
        );
      }, 2e3);
    } catch (I) {
      this.changeStatus("error", I);
    }
  }
}
export {
  Je as STATUS,
  er as default
};
