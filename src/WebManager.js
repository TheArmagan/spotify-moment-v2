const SpotifyMoment = require("./SpotifyMoment");

const express = require("express");

class WebManager {

  PORT = 8777;

  /** @type {SpotifyMoment} */
  spotifyMoment;

  app = express();

  constructor(sm) {
    this.spotifyMoment = sm;
  }

  async init() {
    console.log("[WEB] Initalizing..");

    this.registerPaths();

    await new Promise(r => this.app.listen(this.PORT, r));
    console.log("[WEB] Server listening on port", this.PORT);
  }

  registerPaths() {
    this.app.use(express.json());
    this.app.get("/authorize", (req, res) => {
      if (this.spotifyMoment.isAccessGranted) return res.redirect("/");
      res.redirect(this.spotifyMoment.config.authUri);
    });

    this.app.get("/api/auth/callback", async (req, res) => {
      if (this.spotifyMoment.isAccessGranted) return res.redirect("/");
      await this.spotifyMoment.grantAccess(req.query.code);
      return res.redirect("/");
    });

    this.app.get("/api/playback/state", async (req, res) => {
      if (!this.spotifyMoment.isAccessGranted) return res.send({ ok: false });
      const state = await this.spotifyMoment.spotifyApi.getMyCurrentPlaybackState();
      return res.send({ ok: true, data: state.body });
    })
  }
}

module.exports = WebManager;