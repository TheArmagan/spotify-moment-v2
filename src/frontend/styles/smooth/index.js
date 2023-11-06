const url = new URL(window.location.href);
const colorThief = new ColorThief();
const app = Vue.createApp({
  data() {
    return {
      state: {},
      colors: [],
      cardHidden: true
    }
  },
  mounted() {
    window.internalVue = this;
    setInterval(async () => {
      let state = await this.getState();
      if (!state.ok) return;
      state = state.data;

      this.cardHidden = !(state || {}).is_playing;

      if (state.item.id != ((this.state || {}).item || {}).id) {
        this.cardHidden = true;
        await this.sleep(300);

        const img = new Image();
        img.onload = async () => {
          const colors = colorThief.getPalette(img, 2);
          this.colors = colors.map(c => `rgb(${c[0]}, ${c[1]}, ${c[2]})`);
        };
        img.crossOrigin = "anonymous";
        img.src = state.item.album.images[0].url;

        this.state = state;
        await this.sleep(300);
        this.cardHidden = false;
      } else {
        this.state = state;
      }
    }, 1000)
  },
  methods: {
    async getState() {
      let state = await fetch("/api/playback/state").then((d) => d.json());
      return state;
    },
    percentage(partialValue, totalValue) {
      return (100 * partialValue) / totalValue;
    },
    sleep(ms = 100) {
      return new Promise(function (resolve) {
        setTimeout(resolve, ms);
      });
    },
    formatSeconds(s) {
      if (isNaN(parseInt(s))) s = 0;
      s = Math.floor(s);
      let hours = Math.floor((s / 60) / 60);
      return `${hours > 0 ? `${hours.toString().padStart(2, "0")}:` : ""}${Math.floor((s / 60) % 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
    }
  },
  computed: {
    artistNames() {
      let artists = ((this.state || {}).item || {}).artists;
      if (!artists) return "";
      return artists.map(i => i.name).join(', ')
    }
  }
});

app.mount("#vue-app");