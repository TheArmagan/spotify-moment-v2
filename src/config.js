module.exports = {
  "clientId": "f447e990dc714653beacb262691c0d11",
  "clientSecret": "b65df07275c84c048f1d7e5790c4f861",
  "redirectUri": "http://127.0.0.1:8777/api/auth/callback",
  "scopes": [
    "user-read-currently-playing",
    "user-read-recently-played",
    "user-read-playback-state",
    "user-modify-playback-state"
  ],
  get "authUri"() {
    return encodeURI(`https://accounts.spotify.com/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&response_type=code&scope=${this.scopes.join(" ")}`);
  }
}
