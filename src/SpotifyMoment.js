const WebManager = require("./WebManager");
const SpotifyWebApi = require('spotify-web-api-node');
const sleep = require("stuffs/lib/sleep");

class SpotifyMoment {

  state;

  /** @type {WebManager} */
  webManager;

  /** @type {SpotifyWebApi} */
  spotifyApi;

  config = require("./config.js");

  isAccessGranted = false;

  /** @type {SpotifyApi.CurrentPlaybackResponse} */
  state = {};

  async init() {
    console.log("[MAIN] Initalizing..");

    console.log("[MAIN] Initalizing WebManager..");
    this.webManager = new WebManager(this);
    await this.webManager.init();

    console.log("[MAIN] Initalizing SpotifyWebApi..");
    this.spotifyApi = new SpotifyWebApi({
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      redirectUri: this.config.redirectUri
    });

    console.log("[MAIN] Please goto http://127.0.0.1:8777/authorize for completing the authorization process..");
  }

  /**
   * @param {String} authCode 
   */
  async grantAccess(authCode) {
    const authResponse = await this.spotifyApi.authorizationCodeGrant(authCode);
    this.spotifyApi.setAccessToken(authResponse.body.access_token);
    this.spotifyApi.setRefreshToken(authResponse.body.refresh_token);
    this.isAccessGranted = true;
    console.log("[MAIN] Access granted!");

    this.tokenRefresher();
  }

  isTokenRefresherRunning = false;

  tokenRefresher() {
    const self = this;
    if (this.isTokenRefresherRunning) return;
    this.isTokenRefresherRunning = true;

    async function refresh() {
      let refreshToken = await self.spotifyApi.refreshAccessToken();
      self.spotifyApi.setAccessToken(refreshToken.body.access_token);
      console.log("[MAIN] Authorization token updated!");
      await sleep((refreshToken.body.expires_in - 60) * 1000);
      refresh();
    }
    refresh();
  }

  async updateState() {
    if (!this.isAccessGranted) return;
    try {
      const state = await this.spotifyApi.getMyCurrentPlaybackState();
      this.state = state.body;
      return state;
    } catch (e) {
      console.log(e);
      return this.updateState();
    }
  }

}

module.exports = SpotifyMoment;