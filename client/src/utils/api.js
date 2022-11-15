import FormApiResponseError from "./FormApiResponseError";
import logger from "./logger";

/**
 * Takes a variable number of path segments and appends them to the base path
 * @example
 * ```
 *  urlOf("items", itemId) => localhost:5000/items/itemId
 * ```
 */
function urlOf() {
  const args = Array.prototype.slice.call(arguments);
  // This is the URL to the flask API
  return ["http://localhost:3000"].concat(args).join("/");
}

/**
 * Builds [[init]] props for fetch function, ensuring that required attributes are present unless they're deliberately overridden
 * @param {object?} props
 * @returns {object}
 */
function fetchInitOf(props) {
  return {
    cors: "*cors",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "http://localhost:5000/",
    },
    ...(props || {}),
  };
}

/**
 * Key used to identify current session data stored in browser's session storage
 */
const SESSION_STORAGE_SESSION_KEY = "cs6400_session";

const api = {
  /**
   * Attempt to login a user
   * @param {LoginForm} loginForm
   * @returns {Promise<LoginFormResponse>}
   */
  login(loginForm) {
    logger.debug({ loginForm }, "from login api");
    if (!loginForm) {
      return Promise.reject(new Error("Login form is required"));
    }

    if (typeof loginForm !== "object") {
      return Promise.reject(new Error("Login form is invalid"));
    }

    if (this.getSession()) {
      return Promise.reject(
        new Error("Session already exists.  Logout before logging in again")
      );
    }

    return fetch(
      urlOf("login"),
      fetchInitOf({
        method: "POST",
        body: JSON.stringify(loginForm),
      })
    )
      .catch((networkError) => {
        throw new FormApiResponseError({
          form: `A Network error occurred while submitting form: ${networkError.message}`,
        });
      })
      .then((res) => {
        if (res.ok) {
          return res.json().then((successResponse) => {
            this.setSession(successResponse);
            return successResponse;
          });
        }

        return res.json().then((errorResponse) => {
          throw new FormApiResponseError(errorResponse);
        });
      });
  },
  /**
   * Attempt to retrieve session information from the browser's session storage
   * @returns {string | null}
   */
  getSession() {
    return localStorage.getItem(SESSION_STORAGE_SESSION_KEY);
  },

  setSession(session) {
    localStorage.setItem(SESSION_STORAGE_SESSION_KEY, session);
  },

  clearSession() {
    localStorage.removeItem(SESSION_STORAGE_SESSION_KEY);
  },

  /**
   * Attempt to logout
   * @returns {Promise<void>}
   */
  logout() {
    return fetch(urlOf("logout"), fetchInitOf())
      .then((resp) => {
        if (resp.ok) {
          return resp.json().then((logoutStatus) => this.clearSession());
        }

        // TODO show an error message if this fails
        resp.json();
      })
      .then((logoutResponse) => {
        return;
      });
  },
  register(form) {
    if (!form) {
      return Promise.reject(new Error("Register form is required"));
    }

    if (typeof form !== "object") {
      return Promise.reject(new Error("Register form is invalid"));
    }

    if (this.getSession()) {
      return Promise.reject(
        new Error(
          "Session already exists.  You cannot register in an active session"
        )
      );
    }

    return fetch(
      urlOf("register"),
      fetchInitOf({
        method: "POST",
        body: JSON.stringify(form),
      })
    )
      .catch((networkError) => {
        throw new FormApiResponseError({
          form: `A Network error occurred while submitting form: ${networkError.message}`,
        });
      })
      .then((res) => {
        if (res.ok) {
          return res.json().then((successResponse) => {
            this.setSession(successResponse);
            return successResponse;
          });
        }

        return res.json().then((errorResponse) => {
          throw new FormApiResponseError(errorResponse);
        });
      });
  },

  search(searchForm) {
    console.log(JSON.stringify(searchForm), "from api.js");
    if (!searchForm) {
      return Promise.reject(new Error("Search form is required"));
    } else if (typeof searchForm !== "object") {
      return Promise.reject(new Error("Search form is invalid"));
    }

    return fetch(
      urlOf("search"),
      fetchInitOf({
        method: "POST",
        body: JSON.stringify(searchForm),
      })
    )
      .catch((networkError) => {
        throw new FormApiResponseError({
          form: `A Network error occurred while submitting form: ${networkError.message}`,
        });
      })
      .then((res) => {
        logger.debug("wahts returned: ", res);
        if (res.ok) {
          return res.json().then((successResponse) => {
            this.setSession(successResponse);
            return successResponse;
          });
        }

        return res.json().then((errorResponse) => {
          console.log("SOrry no results found");
          throw new FormApiResponseError(errorResponse);
        });
      });
  },

  profile() {
    if (!this.getSession()) {
      return Promise.reject(
        new Error(
          "Session already exists.  You cannot retrieve a profile in an active session"
        )
      );
    }

    return fetch(urlOf("profile"), fetchInitOf())
      .catch((networkError) => {
        throw new FormApiResponseError({
          message: `A Network error occurred while retrieving profile: ${networkError.message}`,
        });
      })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }

        return res.json().then((errorResponse) => {
          throw new FormApiResponseError(errorResponse);
        });
      });
  },

  userStats() {
    if (!this.getSession()) {
      return Promise.reject(
        new Error(
          "Session already exists.  You cannot retrieve menu stats from an unauthenticated session"
        )
      );
    }

    return fetch(urlOf("menu/stats"), fetchInitOf())
      .catch((networkError) => {
        throw new FormApiResponseError({
          message: `A Network error occurred while retrieving menu stats: ${networkError.message}`,
        });
      })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }

        return res.json().then((errorResponse) => {
          throw new FormApiResponseError(errorResponse);
        });
      });
  },
  proposeTrade(desiredItemNo, proposedItemNo) {
    if (!this.getSession()) {
      return Promise.reject(
        new Error(
          "Session already exists.  You cannot retrieve item details from an unauthenticated session"
        )
      );
    }

    return fetch(
      urlOf(`items/${desiredItemNo}/trade/${proposedItemNo}`),
      fetchInitOf({ method: "POST" })
    ).then((res) => {
      if (res.ok) {
        return res.json();
      }

      return res.json().then((errorResponse) => {
        throw new Error("An unexpected error occurred");
      });
    });
  },
  getBasicItemInfo(itemId) {
    if (!this.getSession()) {
      return Promise.reject(
        new Error(
          "Session already exists.  You cannot retrieve item details from an unauthenticated session"
        )
      );
    }

    return fetch(urlOf(`items/${itemId}`), fetchInitOf()).then((res) =>
      res.json()
    );
  },
  getTrade(tradeId) {
    return fetch(
      urlOf("/getTrade"),
      fetchInitOf({
        method: "GET",
        body: JSON.stringify(tradeId),
      })
    )
      .catch((networkError) => {
        throw new FormApiResponseError({
          form: `A Network error occurred while submitting form: ${networkError.message}`,
        });
      })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }

        return res.json().then((errorResponse) => {
          throw new FormApiResponseError(errorResponse);
        });
      });
  },
  listItems(form) {
    return fetch(urlOf("items/list"), fetchInitOf({ method: 'POST', body: JSON.stringify(form)})).then((res) => {
      if (res.ok) {
        return res.json();
      }

      return res.json().then((errorResponse) => {
        throw new FormApiResponseError(errorResponse);
      });
    });
  },
  accept_trade(form) {
    return fetch(
      urlOf("/acceptTrade"),
      fetchInitOf({
        method: "POST",
        body: JSON.stringify(form),
      })
    )
      .catch((networkError) => {
        throw new FormApiResponseError({
          form: `A Network error occurred while submitting form: ${networkError.message}`,
        });
      })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }

        return res.json().then((errorResponse) => {
          throw new FormApiResponseError(errorResponse);
        });
      });
  },
  getMyItems() {
    return fetch(urlOf("items"), fetchInitOf())
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
      })
      .catch((networkError) => {
        throw new FormApiResponseError({
          message: `A Network error occurred while retrieving my items: ${networkError.message}`,
        });
      });
  },

  tradeDetails(tradeId) {
    return fetch(
    urlOf(`trades/${tradeId}`),
    fetchInitOf()
  )
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
    });
},

  tradeHistory() {
    if (!this.getSession()) {
      return Promise.reject(new Error("can't retrieve user info"));
    }
    return fetch(urlOf("/TradeHistory"), fetchInitOf()).then((res) => {
      if (res.ok) {
        return res.json();
      }
    });
  },

  reject_trade(form) {
    return fetch(
      urlOf("/rejectTrade"),
      fetchInitOf({
        method: "POST",
        body: JSON.stringify(form),
      })
    )
      .catch((networkError) => {
        throw new FormApiResponseError({
          form: `A Network error occurred while submitting form: ${networkError.message}`,
        });
      })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }

        return res.json().then((errorResponse) => {
          throw new FormApiResponseError(errorResponse);
        });
      });
  },
};

export default api;
