import * as React from "react";
import "./index.css";
import { widget } from "../../charting_library/charting_library";
import Datafeed from "../../datafeed";

function getLanguageFromURL() {
  const regex = new RegExp("[\\?&]lang=([^&#]*)");
  const results = regex.exec(window.location.search);
  return results === null
    ? null
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

export class TVChartContainer extends React.PureComponent {
  static defaultProps = {
    symbol: "پالایش1           ",
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

  tvWidget = null;

  constructor(props) {
    super(props);

    this.ref = React.createRef();
  }

  componentDidMount() {
    const dateOption = {
      weekday: "long",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    };
    const widgetOptions = {
      symbol: this.props.symbol,
      // BEWARE: no trailing slash is expected in feed URL
      datafeed: Datafeed,
      interval: this.props.interval,
      container: this.ref.current,
      library_path: this.props.libraryPath,
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
      charts_storage_url: this.props.chartsStorageUrl,
      charts_storage_api_version: this.props.chartsStorageApiVersion,
      client_id: this.props.clientId,
      user_id: this.props.userId,
      fullscreen: this.props.fullscreen,
      autosize: this.props.autosize,
      studies_overrides: this.props.studiesOverrides,
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
  }

  componentWillUnmount() {
    if (this.tvWidget !== null) {
      this.tvWidget.remove();
      this.tvWidget = null;
    }
  }

  render() {
    return <div ref={this.ref} className={"TVChartContainer"} />;
  }
}
