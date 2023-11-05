module.exports = {
  "clientId": "e0aac15b38854b9eb7b22eb9f0edf89f",
  "clientSecret": "c4f4f95a6d4e4cb28e77ea4ac01f2949",
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
