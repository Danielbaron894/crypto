$(document).ready(function () {
  const MAX_REPORTS = 5;
  const REPORTS_KEY = "savedReports";
  let savedReports = [];

  if (localStorage.getItem(REPORTS_KEY)) {
    savedReports = JSON.parse(localStorage.getItem(REPORTS_KEY));
  }

  $.ajax({
    method: "GET",
    url: "https://api.coingecko.com/api/v3/coins/?vs_currency=usd&order=market_cap_desc&per_page=150&page=1",
    success: function (data) {
      data.forEach((coin) => {
        $("#card-row").append(`
          <div class="col-sm-4 py-3 py-sm-0">
            <div class="card box-shadow">
              <div class="card-body">
                <div id=${coin.id} class="togglebutton">
                  <label class="switch">
                  <input id="slider1" type="checkbox">
                    <span class="slider round"></span>
                  </label>
                </div>
                <p class="card-title">${coin.symbol}</p>
                <p class="card-text">${coin.name}</p>
                <button type="button" data-id=${coin.id} class="btn btn-primary moreInfoButton">More info...</button>
              </div>
            </div>
          </div>
        `);

        const coinIndex = savedReports.findIndex(
          (selectedCoin) => selectedCoin.id === coin.id
        );
        const isChecked = coinIndex > -1;
        if (isChecked) {
          $("#" + coin.id)
            .find("input")
            .prop("checked", true);
          coin.isChecked = true;
        } else {
          coin.isChecked = false;
        }
      });

      function addReport(report) {
        if (savedReports.length >= MAX_REPORTS) {
          savedReports.push(report);
          let message =
            "You can only save up to five reports. Please select one to remove:";
          swal.fire({
            html: `${message}<br><br>
        <div id="myCoins"></div>`,
          });
          showSavedReports();
        } else {
          savedReports.push(report);
          localStorage.setItem(REPORTS_KEY, JSON.stringify(savedReports));
        }
      }

      function removeReport(report) {
        savedReports = savedReports.filter((r) => r.id !== report.id);
        localStorage.setItem(REPORTS_KEY, JSON.stringify(savedReports));
        $(`.moreInfoButton[data-id='${report.id}']`)
          .closest(".card-body")
          .find("#slider1")
          .prop("checked", false);
      }

      function showSavedReports() {
        $("#myCoins").empty();
        savedReports.forEach((report) => {
          $("#myCoins").append(`
        <div class="report">
          <span class="reportId" data-id=${report.id}>${report.id}</span>
          <label class="switch">
            <input id=${report.id} class="slider2" type="checkbox" checked>
            <span class="slider round"></span>
          </label>
        </div><br>
      `);

          $("#myCoins").on("change", ".slider2", function () {
            const myId = $(this)
              .closest(".report")
              .find(".reportId")
              .data("id");
            const symbol = report.symbol;
            const reports = { id: myId, symbol };
            const reportIndex = savedReports.findIndex(
              (r) => r.id === report.id
            );
            const notChecked = reportIndex !== -1;
            if (notChecked) {
              removeReport(reports);
            }
            return;
          });
        });
      }

      $("#card-row").on("change", "#resultSlider", function() {
        const myId = $(this)
        .closest(".card-body")
        .find(".moreInfoButton")
        .data("id");
        const symbol = $(this).closest(".card-body").find(".card-title").text();
        const isChecked = $(this).is(":checked");
        const report = { id: myId, symbol };
        if (isChecked) {
        addReport(report);
      } else {
        removeReport(report);
      }
      });

      $("#card-row").on("change", "#slider1", function () {
        const myId = $(this)
          .closest(".card-body")
          .find(".moreInfoButton")
          .data("id");
        const symbol = $(this).closest(".card-body").find(".card-title").text();
        const isChecked = $(this).is(":checked");
        const report = { id: myId, symbol };
        if (isChecked) {
          addReport(report);
        } else {
          removeReport(report);
        }
      });

      $(".moreInfoButton").click(function () {
        const myId = $(this).data("id");
        const USD = "$";
        const EUR = "€";
        const ILS = "₪";
        $.ajax({
          method: "GET",
          url: `https://api.coingecko.com/api/v3/coins/${myId}`,
          success: function (data) {
            Swal.fire({
              title: data.name,
              confirmButtonColor: "#0086f4",
              text: `USD: ${data.market_data.current_price.usd}${USD}
					           EUR: ${data.market_data.current_price.eur}${EUR}	
					           ILS: ${data.market_data.current_price.ils}${ILS}`,
              imageUrl: data.image.large,
              imageWidth: 130,
              imageHeight: 130,
              imageAlt: "Custom image",
            });
          },
        });
      });
    },
  });

  $("#about").click(function () {
    $("#card-row").html(`
    <section class="col-lg-12 about-us">
    <div class="about">
      <img src="/assets/images/profileimg.jpg" class="pic">
      <div class="text">
        <h2>About</h2>
        <h5><span>Daniel Bar-on</span></h5>
          <p>Hi, I'm 30 years old, a few months ago I started studying at John Bryce, I didn't graduate from the field, but my goal is to become an excellent developer and designer.</p>
        <h3>project</h3>
        <p>The goal of this project is to create a web application that uses an API to display data. The API I used is the CoinGecko API. The app is a cryptocurrency tracker that shows the top 100 cryptocurrencies by market cap. The user can search for a particular cryptocurrency and get more information about it. The user can also see the price of the cryptocurrency in different currencies. The application is responsive and also works on mobile devices.</p>
        <div class="data">
        <a href="index.html" class="aboutHomeButton ">Home</a>
        </div>
      </div>
    </div>
  </section>`);
  });

  $("#realTimeReports").click(function () {});



  $("#searchButton").click(function () {
    var searchInput = $("#searchInput").val();
    $.ajax({
      method: "GET",
      url: `https://api.coingecko.com/api/v3/search?query=${searchInput}`,
      success: function (data) {
        $("#card-row").empty();
        $("#card-row").append(`
          <div class="col-sm-4 py-3 py-sm-0">
            <div class="card box-shadow">
              <div class="card-body">
                <div id="${data.coins[0].id}" class="togglebutton">
                  <label class="switch">
                  <input  type="checkbox" id="resultSlider">
                    <span class="slider round"></span>
                  </label>
                </div>
                <p class="card-title">${data.coins[0].symbol.toLowerCase()}</p>
                <p class="card-text">${data.coins[0].name}</p>
                <button type="button" data-id=${data.coins[0].id} class="btn btn-primary moreInfoButton">More info...</button>
              </div>
            </div>
          </div>
        `);

        const coinIndex = savedReports.findIndex(
          (selectedCoin) => selectedCoin.id === data.coins[0].id
        );
        const isChecked = coinIndex > -1;
        if (isChecked) {
          $("#" + data.coins[0].id)
            .find("input")
            .prop("checked", true);
            data.coins[0].isChecked = true;
        } else {
          data.coins[0].isChecked = false;
        }
        
        
       


        $(".moreInfoButton").click(function () {
          const myId = $(this).data("id");
          const USD = "$";
          const EUR = "€";
          const ILS = "₪";
          $.ajax({
            method: "GET",
            url: `https://api.coingecko.com/api/v3/coins/${myId}`,
            success: function (data) {
              Swal.fire({
                title: data.symbol,
                confirmButtonColor: "#0086f4",
                text: `USD: ${data.market_data.current_price.usd}${USD}
                       EUR: ${data.market_data.current_price.eur}${EUR}	
                       ILS: ${data.market_data.current_price.ils}${ILS}`,
                imageUrl: data.image.large,
                imageWidth: 130,
                imageHeight: 130,
                imageAlt: "Custom image",
              });
            },
          });
        });
      },
    });
    $("#searchInput").val("");
  });
});
