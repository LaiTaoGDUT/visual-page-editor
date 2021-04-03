<template>
<div class="weather-container">
  <div>
    <div class="weather__title">
      {{config.city}}
    </div>
    <div v-if="weatherInfo.forecasts">{{ weatherInfo.forecasts[0].reporttime.split('2021-')[1] }}更新</div>
  </div>
  <ul class="weather__info" v-for="wea in weather" :key="wea.date">
    <li>
      <span class="weather__info__date">{{ wea.date.split('2021-')[1] }}</span>
      <span class="weather__info__value">{{wea.daytemp}}℃</span>
      <span class="weather__info__value">{{wea.dayweather}}</span>
    </li>
  </ul>
</div>
</template>

<script>
// 使用高德地图查询接口
const weatherAPI = 'https://restapi.amap.com/v3/weather/weatherInfo';
const weatherKey = '923d9762b87a6c7317a741b0bfe6e2d8';

export default {
  props: {
    config: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      weatherInfo: {},
      weather: {},
      time: null,
    };
  },
  async mounted() {
    this.weatherInfo = await this.queryWeatherInfo();
    this.weather = this.weatherInfo.forecasts[0].casts;
  },
  methods: {
    async queryWeatherInfo() {
      return fetch(`${weatherAPI}?key=${weatherKey}&city=${this.config.city}&extensions=all`)
        .then(res => res.json())
        .catch(e => console.log('查询天气接口报错:', e)); // eslint-disable-line no-console
    },
    timeFormat(date) {
      this.time = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }
  },
};
</script>

<style lang="less" scoped>
.weather-container {
  font-family: "Lato","Helvetica Neue",Helvetica,Arial,sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 20px;

  & > div {
    width: 100%;
    & > div {
      margin-left: 20px;
    }
  }

  &__title {
    font-size: 18px;
  }
}

.weather {
 &__title {
   font-size: 28px;
   font-weight: bold;
 }
 &__info {
  width: 100%;
  list-style: none;
 }
}

.weather__info {
  padding: 0px;
  margin-top: 20px;
  span {
    width: 30%;
    display: inline-block;
  }
  &__date {
    font-size: 18px;
    padding-left: 20px;
  }
  &__value {
    font-size: 18px;
    color: lightskyblue;
  }
}

</style>
