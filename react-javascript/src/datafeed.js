import { makeApiRequest, generateSymbol, parseFullSymbol } from "./helpers.js";
const lastBarsCache = new Map();
const channelToSubscription = new Map();
const configurationData = {
  supported_resolutions: [
    "1",
    "3",
    "5",
    "15",
    "30",
    "1h",
    "2h",
    "4h",
    "1D",
    "1W",
    "1M",
  ],
  exchanges: [],
  symbols_types: [],
  //reset_cache_timeout:0
};

const updater = (data) => {
  if (!data) return;
  let subscriptionItem = channelToSubscription.get(data.InstrumentCode);
  subscriptionItem.handlers.forEach((element) => {
    let resolution =
      element.resolution == "1D" ? 1440 : Number(element.resolution);
    let resolutionSecond = resolution * 60;
    let result = data;
    let date = result.LastTradeTime.toString();
    let year = date.substr(0, 4);
    let month = date.substr(4, 2);
    let day = date.substr(6, 2);
    let hour = date.substr(8, 2);
    let minute = date.substr(10, 2);
    let second = date.substr(12, 2);
    //let tradeTime=new Date(year,month,day,hour,minute,second);
    let tradeTime = new Date(
      `${year}-${month}-${day} ${hour}:${minute}:${second}`
    );
    tradeTime =
      Math.floor(tradeTime / 1000 / resolutionSecond) * resolutionSecond * 1000;
    let lastTime = new Date(element.lastBar.time);
    let bar;
    if (tradeTime > lastTime) {
      bar = {
        time: tradeTime,
        open: result.RealClosePrice,
        high: result.RealClosePrice,
        low: result.RealClosePrice,
        close: result.RealClosePrice,
        volume: result.Volume,
      };
    } else {
      bar = {
        ...element.lastBar,
        high: Math.max(element.lastBar.high, result.RealClosePrice),
        low: Math.min(element.lastBar.low, result.RealClosePrice),
        close: result.RealClosePrice,
        volume: element.lastBar.volume + result.Volume,
      };
    }
    if (tradeTime < lastTime) return;
    element.lastBar = bar;
    element.onRealtimeCallback(bar);
  });
};

var currentScope;

var searchTimeOut;
export default {
  onReady: (callback) => {
    setTimeout(() => callback(configurationData));
  },

  searchSymbols: async (
    userInput,
    exchange,
    symbolType,
    onResultReadyCallback
  ) => {
    clearTimeout(searchTimeOut);
    var params = {
      userInput: userInput,
      exchange: exchange,
      symbolType: symbolType,
    };
    if (userInput.length < 2) {
      onResultReadyCallback([]);
    } else {
      searchTimeOut = setTimeout(async () => {
        let data;
        const res = await fetch(
          `https://market.choganitd.ir/api/TradingView/search?userInput=${userInput}&exchange=&symbolType=`
        );
        data = await res.json();

        onResultReadyCallback(data);
      }, 250);
    }
  },

  resolveSymbol: async (
    symbolName,
    onSymbolResolvedCallback,
    onResolveErrorCallback
  ) => {
    var params = {
      symbol: symbolName,
    };
    let data;
    const res = await fetch(
      `https://market.choganitd.ir/api/TradingView/symbol?symbol=${symbolName}`
    );
    data = await res.json();
    onSymbolResolvedCallback(data);
  },

  getBars: async (
    symbolInfo,
    resolution,
    periodParams,
    onHistoryCallback,
    onErrorCallback
  ) => {
    const { from, to, firstDataRequest } = periodParams;
    try {
      var params = {
        firstDataRequest: firstDataRequest,
        ticker: symbolInfo.ticker,
        resolution: resolution,
        from: from,
        to: to,
      };
      let data;
      const res = await fetch(
        `https://market.choganitd.ir/api/TradingView/bars?firstDataRequest=${firstDataRequest}&ticker=${symbolInfo.ticker}&resolution=${resolution}&from=${from}&to=${to}`
      );
      data = await res.json();
      //var data = {NextTime:null, Bars:firstDataRequest? [{ open: 19000 ,close:20000,high:22000,low:16000,time:to}]:[] };
      const nodata = !data || !data.Bars || data.Bars.length === 0;
      let lastCachedBar = lastBarsCache.get(symbolInfo.ticker + resolution);
      let lastBar = data.Bars[data.Bars.length - 1];
      if (lastBar && (!lastCachedBar || lastCachedBar.time < lastBar.time)) {
        if (lastCachedBar) lastCachedBar = { ...lastBar };
        else lastBarsCache.set(symbolInfo.ticker + resolution, { ...lastBar });
      }
      if (data.Bars && data.Bars.length > 0)
        data.Bars.forEach((item) => {
          item.time = item.time * 1000;
        });
      onHistoryCallback(data.Bars, {
        noData: nodata,
        nextTime: data.NextTime,
      });
    } catch (error) {
      onErrorCallback(error);
    }
  },

  setScope: (scope) => {
    currentScope = scope;
  },
};
