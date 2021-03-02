const SpotifyMoment = require("./SpotifyMoment");
const path = require("path");

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
    this.app.use("/frontend", express.static(path.resolve(__dirname, "frontend")));

    const isAccessGrantedMiddleware = (req, res, next) => {
      if (this.spotifyMoment.isAccessGranted) {
        next();
      } else {
        res.send({ ok: false, reason: "Not yet authorized." });
      }
    }

    this.app.get("/", (req, res) => {
      if (!this.spotifyMoment.isAccessGranted) return res.redirect("/authorize");
      res.redirect("/frontend");
    })

    this.app.get("/authorize", (req, res) => {
      if (this.spotifyMoment.isAccessGranted) return res.redirect("/");
      res.redirect(this.spotifyMoment.config.authUri);
    });

    this.app.get("/api/auth/callback", async (req, res) => {
      if (this.spotifyMoment.isAccessGranted) return res.redirect("/");
      await this.spotifyMoment.grantAccess(req.query.code);
      return res.redirect("/");
    });

    this.app.get("/api/playback/state", isAccessGrantedMiddleware, async (req, res) => {
      await this.spotifyMoment.updateState();
      return res.send({ ok: true, data: this.spotifyMoment.state });
    });

    this.app.get("/api/playback/history", isAccessGrantedMiddleware, async (req, res) => {
      const state = await this.spotifyMoment.spotifyApi.getMyRecentlyPlayedTracks({
        before: req.query.before ?? null,
        after: req.query.after ?? null,
        limit: req.query.limit ?? 20
      });
      return res.send({ ok: true, data: state.body });
    })

    this.app.patch("/api/playback/volume", isAccessGrantedMiddleware, async (req, res) => {
      if (isNaN(req.body.volume)) return res.send({ ok: false, reason: "Volume should be a number." });
      await this.spotifyMoment.spotifyApi.setVolume(req.body.volume);
      return res.send({ ok: true });
    });

    this.app.patch("/api/playback/shuffle", isAccessGrantedMiddleware, async (req, res) => {
      if (req.body.shuffle != true || req.body.shuffle != false) return res.send({ ok: false, reason: "Shuffle should be a boolean." });
      await this.spotifyMoment.spotifyApi.setShuffle(req.body.shuffle);
      return res.send({ ok: true });
    });

    this.app.patch("/api/playback/repeat", isAccessGrantedMiddleware, async (req, res) => {
      if (!["off", "track", "context"].includes(req.body.repeat)) return res.send({ ok: false, reason: "Un-allowed repeat type. (Supported: off, track, context)" });
      await this.spotifyMoment.spotifyApi.setRepeat(req.body.repeat);
      return res.send({ ok: true });
    });

    this.app.post("/api/playback/pause", isAccessGrantedMiddleware, async (req, res) => {
      await this.spotifyMoment.updateState();
      if (!this.spotifyMoment.state.is_playing) return res.send({ ok: false, reason: "It's not already playing." });
      await this.spotifyMoment.spotifyApi.pause();
      return res.send({ ok: true });
    });

    this.app.post("/api/playback/resume", isAccessGrantedMiddleware, async (req, res) => {
      await this.spotifyMoment.updateState();
      if (this.spotifyMoment.state.is_playing) return res.send({ ok: false, reason: "It's already playing." });
      await this.spotifyMoment.spotifyApi.play()
      return res.send({ ok: true });
    });

    this.app.post("/api/playback/seek", isAccessGrantedMiddleware, async (req, res) => {
      if (isNaN(req.body.position)) return res.send({ ok: false, reason: "Position is not a number." });
      await this.spotifyMoment.spotifyApi.seek(req.body.position);
      return res.send({ ok: true });
    });
  }
}

module.exports = WebManager;