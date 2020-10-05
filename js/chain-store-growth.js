async function createChainStoreGrowth(tsv_data) {
  const chartDiv = document.getElementById("chartDiv");
  chartDiv.innerHTML = '';

  const width = chartDiv.clientWidth;
  const height = chartDiv.clientHeight;

  const scale = 1200;
  const projection = d3.geoMercator()
                    .center([136.0, 35.6])
                    .translate([width/2, height/2])
                    .scale(scale)

  const path = d3.geoPath().projection(projection);
  const ja = await d3.json("https://raw.githubusercontent.com/dataofjapan/land/master/japan.topojson");

  const svg = d3.select("#chartDiv").append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("width", "100%")
      .style("height", "auto")
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("viewBox", [0, 0, width, height])
      .classed("svg-content", true)

  const prefectures = svg.append("g");
  const geometries = topojson.feature(ja, ja.objects.japan).features;
  const countries =  prefectures.selectAll(".prefecture").data(geometries);

  countries
      .enter().insert("path")
          .attr("class", "prefecture")
          .attr("d", path)
          .style("fill", "#ddd")
          .style("stroke", "#FFF")

  const data = tsv_data.map(d => projection(d))

  // 店舗の場所に丸印をつける
  const g = svg.append("g")
      .attr("fill", "red")
      .attr("stroke", "black");

  // スタート地点
  const s = svg.append("g");
  s.append("circle")
      .attr("fill", "blue")
      .attr("transform", `translate(${data[0]})`)
      .attr("r", 3);

  //ズームイベント設定
  var zoom = d3.zoom().on('zoom', function(event) {
    const {transform} = event;
    [prefectures, s, g].map(x => {
      x.attr("transform", transform);
      x.attr("stroke-width", 1 / transform.k);
    })
    d3.selectAll("#chartDiv svg g circle").attr("r", 3 / transform.k)
  });
  svg.call(zoom);

  return new Promise((resolve) => {
    setTimeout(() => {
      const tickDuration = 100
      // loop
      let i = 0;
      const interval = d3.interval((e) => {
          g.append("circle")
              .attr("transform", `translate(${data[i]})`)
              .attr("r", 3)
              .attr("fill-opacity", 1)
              .attr("stroke-opacity", 0)
            .transition()
              .attr("fill-opacity", 0)
              .attr("stroke-opacity", 1);
          // increment loop
          i += 1
          d3.select('.tally-counter').text(`${i} 店`);
          if (i == data.length) interval.stop()
      }, tickDuration)
      resolve(interval)
    }, 1000)
  })
}