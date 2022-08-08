import * as React from "react";
import "./index.css";
import { widget } from "../../charting_library/charting_library";
import Datafeed from "../../datafeed";

function TVChartContainer() {
  const ref = React.useRef();
  const defaultProps = {
    symbol: "AAPL",
    interval: "D",
    datafeedUrl: "https://demo_feed.tradingview.com",
    libraryPath: "/charting_library/",
    chartsStorageUrl: "https://saveload.tradingview.com",
    chartsStorageApiVersion: "1.1",
    clientId: "tradingview.com",
    userId: "public_user_id",
    fullscreen: false,
    autosize: true,
    studiesOverrides: {},
  };

  React.useEffect(() => {
    const dateOption = {
      weekday: "long",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    };
    const widgetOptions = {
      symbol: defaultProps.symbol,
      // BEWARE: no trailing slash is expected in feed URL
      datafeed: Datafeed,
      interval: defaultProps.interval,
      container: defaultProps.current,
      library_path: defaultProps.libraryPath,
      locale: "fa",
      timezone: "Asia/Tehran",
      disabled_features: [
        "use_localstorage_for_settings",
        "volume_force_overlay",
      ],
      customFormatters: {
        timeFormatter: {
          format: function (t) {
            return (
              t.getUTCHours().toLocaleString("fa-IR") +
              ":" +
              t.getUTCMinutes().toLocaleString("fa-IR")
            );
          },
          formatLocal: (e) => e.toString(),
        },
        dateFormatter: {
          format: function (e) {
            return new Date(e).toLocaleDateString("fa-IR", dateOption);
          },
          formatLocal: (e) => e.toString(),
        },
        tickMarkFormatter: (time) => {
          time = time;
          var date = new Date(time);
          return date.toLocaleDateString("fa-IR");
        },
      },
      enabled_features: ["study_templates"],
      charts_storage_url: defaultProps.chartsStorageUrl,
      charts_storage_api_version: defaultProps.chartsStorageApiVersion,
      client_id: defaultProps.clientId,
      user_id: defaultProps.userId,
      fullscreen: defaultProps.fullscreen,
      autosize: defaultProps.autosize,
      studies_overrides: defaultProps.studiesOverrides,
    };

    const tvWidget = new widget(widgetOptions);
    this.tvWidget = tvWidget;

    tvWidget.onChartReady(() => {
      tvWidget.headerReady().then(() => {
        const button = tvWidget.createButton();
        button.setAttribute("title", "Click to show a notification popup");
        button.classList.add("apply-common-tooltip");
        button.addEventListener("click", () =>
          tvWidget.showNoticeDialog({
            title: "Notification",
            body: "TradingView Charting Library API works correctly",
            callback: () => {
              console.log("Noticed!");
            },
          })
        );

        button.innerHTML = "Check API";
      });
    });

    return () => {
      if (this.tvWidget !== null) {
        this.tvWidget.remove();
        this.tvWidget = null;
      }
    };
  }, [defaultProps]);

  return <div ref={ref}>TVChartContainer</div>;
}

export default TVChartContainer;
