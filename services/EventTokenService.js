const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// A service class for Token generation and management

class EventTokenService {
  static #app_access_key = config.get("Event100ms.APP_ACCESS_KEY");
  static #app_secret = config.get("Event100ms.APP_SECRET");
  #managementToken;
  constructor() {
    this.#managementToken = this.getManagementToken(true);
  }

  // A private method that uses JWT to sign the payload with APP_SECRET
  #signPayloadToToken(payload) {
    const token = jwt.sign(payload, EventTokenService.#app_secret, {
      algorithm: "HS256",
      expiresIn: "24h",
      jwtid: crypto.randomUUID({ disableEntropyCache: true }),
    });
    return token;
  }

  // Generate new Management token, if expired or forced
  getManagementToken(forceNew) {
    if (forceNew) {
      const payload = {
        access_key: EventTokenService.#app_access_key,
        type: "management",
        version: 2,
        iat: Math.floor(Date.now() / 1000),
      };
      this.#managementToken = this.#signPayloadToToken(payload);
    }
    return this.#managementToken;
  }

  // Generate new Auth token for a peer
  getAuthToken({ roomId, userId, role }) {
    const payload = {
      access_key: EventTokenService.#app_access_key,
      room_id: roomId,
      user_id: userId,
      role: role,
      type: "app",
      version: 2,
      iat: Math.floor(Date.now() / 1000),
    };
    return this.#signPayloadToToken(payload);
  }
}

module.exports = { EventTokenService };
