var margin = {top: 20, right: 20, bottom: 30, left: 40};
var width = 800;
var height =500;
var innerWidth = width - margin.left - margin.right;
var innerHeight = height - margin.top - margin.bottom;
var svg;
var xaxis_data;
var yaxis_data;
var country_data;
var country_bank_name = [];
var country_selected = [];
var overall_data = [];
var present_year;
var xAttrib;
var yAttrib;
var cAttrib;
var start = false;
var changed=0;
const radiusScale=d3.scaleSqrt();

document.addEventListener('DOMContentLoaded', function() {
     svg = d3.select('.plot')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
   d3.csv('data/countries_regions.csv')
        .then(function(values){
            country_data = values;
            country_bank_name =  values.map(item=>{
                return item["World bank region"]});
            var region_select = document.getElementById("region-select");
            var regions = [];
            for(var i=0;i<country_bank_name.length;i++){
                if(!regions.includes(country_bank_name[i])){
                regions.push(country_bank_name[i]);
                var opt = document.createElement("option");
                opt.value= country_bank_name[i];
                opt.innerHTML = country_bank_name[i];
                region_select.appendChild(opt);}
            }
        drawScatterPlot(changed);
    });
  });

function playGraph(){
      start = !start;
      var inter;
      if(start && document.getElementById("year").value<2101){
       document.getElementById("play").classList.remove('active');
       document.getElementById("pause").classList.remove('inactive');
       document.getElementById("play").classList.add('inactive');
       document.getElementById("pause").classList.add('active');
       inter = setInterval(()=>{
           if(start){
                    document.getElementById("year").stepUp(1);
                    drawScatterPlot(2)
             }else{
                 clearInterval(inter);
             }
            },1000);
      }else if(!start){
        document.getElementById("play").classList.remove('inactive');
        document.getElementById("pause").classList.remove('active');
        document.getElementById("play").classList.add('active');
        document.getElementById("pause").classList.add('inactive');
          console.log("executed");
         clearInterval(inter);
      }
}

function inputChange(x){
if(x==0){
  document.getElementById("year2").value=document.getElementById("year").value;
}
else{
  document.getElementById("year").value=document.getElementById("year2").value;

}
    start = false;
    drawScatterPlot(2);
}

function drawScatterPlot(x){
    var x_filePath;
    var y_filePath;
     present_year = document.getElementById('year').value;
     xAttrib = document.getElementById('x-axis-select').value;
     yAttrib =  document.getElementById('y-axis-select').value;
     cAttrib = document.getElementById("region-select").value;
    country_selected = [];
    for(var i=0;i<country_data.length;i++){
        if(country_data[i]["World bank region"] == cAttrib){
            country_selected.push({name:country_data[i].name,code:country_data[i].geo})
        }
    }
    switch(xAttrib){
        case "Child Mortality":{
            x_filePath = 'data/child_mortality_0_5_year_olds_dying_per_1000_born.csv';
            break;
        }case "Babies per Women":{
            x_filePath = 'data/children_per_woman_total_fertility.csv';
            break;
        }case "CO2 emissions per person":{
            x_filePath = 'data/co2_emissions_tonnes_per_person.csv';
            break;
        }case "Income":{
            x_filePath = 'data/income_per_person_gdppercapita_ppp_inflation_adjusted.csv';
            break;
        }case "Life Expectancy":{
            x_filePath = 'data/life_expectancy_years.csv';
            break;
        }case "Population":{
            x_filePath = 'data/population_total.csv';
        }
    }

    switch(yAttrib){
        case "Child Mortality":{
            y_filePath = 'data/child_mortality_0_5_year_olds_dying_per_1000_born.csv';
            break;
        }case "Babies per Women":{
            y_filePath = 'data/children_per_woman_total_fertility.csv';
            break;
        }case "CO2 emissions per person":{
            y_filePath = 'data/co2_emissions_tonnes_per_person.csv';
            break;
        }case "Income":{
            y_filePath = 'data/income_per_person_gdppercapita_ppp_inflation_adjusted.csv';
            break;
        }case "Life Expectancy":{
            y_filePath = 'data/life_expectancy_years.csv';
            break;
        }case "Population":{
            y_filePath = 'data/population_total.csv';
        }
    }
    xaxis_data = [];
    yaxis_data=[];
    Promise.all([ d3.csv(x_filePath),d3.csv(y_filePath)]).then(values=>{
        xaxis_data = values[0].filter((item)=>{
            for(let i=0;i<country_selected.length;i++){
                if(country_selected[i].name === item.country){
                    item["geo"] = country_selected[i].code;
                    return item;
                }
            }
        });

        yaxis_data = values[1].filter((item)=>{
            for(let i=0;i<country_selected.length;i++){
                if(country_selected[i].name === item.country){
                    item["geo"] = country_selected[i].code;
                    return item;
                }
            }
        });

        xaxis_data =  xaxis_data.map(item=>{
            let max = 0;
            for(let key in item){
                if(key ==='country' || key ==='geo'){
                    item[key] = item[key];
                }else {
                    item[key] = +item[key];
                    if(item[key]>max){
                        max = item[key];
                        item["max"] =max;
                    }
                }
            }
            return item;
        })

       yaxis_data = yaxis_data.map(item=>{
                let max = 0;
                for(let key in item){
                    if(key ==='country' || key ==='geo'){
                        item[key] = item[key];
                    }else {
                        item[key] = +item[key];
                        if(item[key]>max){
                            max = item[key];
                            item["max"] =max;
                        }
                    }
                }
                return item;
        });
        overall_data =[];
        for(var i=0;i<xaxis_data.length;i++){
            for(var j=0;j<yaxis_data.length;j++){
                if(xaxis_data[i].country === yaxis_data[j].country){
                    var all_item ={};
                    all_item.country = xaxis_data[i].country;
                    all_item.geo = xaxis_data[i].geo;
                    all_item.xdata = xaxis_data[i][present_year];
                    all_item.ydata = yaxis_data[j][present_year];
                    overall_data.push(all_item);
                }
            }
        }
        if(x==0){
        drawGraph();}
        else if(x==2){
          updateGraphinRegion();
        }
        else {
          updateGraph();
        }
    });
    return 0;

}

function drawGraph(){
  console.log("entrance");
    var xScale = d3.scaleLinear()
                    .domain([0, d3.max(xaxis_data, function(d){
                        return d.max;
                    })])
                    .range([0, innerWidth]);
    var yScale = d3.scaleLinear()
                    .domain([0, d3.max(yaxis_data,function(d){
                        return d.max
                    })])
                    .range([innerHeight, 0 ]);
    var tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10);



    svg.selectAll('g').remove();
    svg.selectAll('#xaxis').remove();
    svg.selectAll('#yaxis').remove();
    svg.selectAll('#axisLabel').remove();


let xaxis = svg.append("g")
    .attr("id","xaxis")
    .attr("transform", `translate(${width-innerWidth},${innerHeight} )`)
    .call(d3.axisBottom(xScale).tickSize(`-${innerHeight}`))
    .call(g => g.select(".domain")
                .remove())
    .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke-opacity", 0.5)
        .attr("stroke-dasharray", "2,2"))
    .call(g => g.selectAll(".tick:first-of-type line")
    .attr("stroke",'grey'))
    .call(g => g.selectAll(".tick text")
        .attr("stroke",'grey')
        .attr("x", 0)
        .attr("dy", 10))

  let yaxis = svg.append("g")
    .attr("id","yaxis")
    .attr("transform", `translate(${width-innerWidth},0 )`)
    .call(d3.axisLeft(yScale).tickSize(`-${innerWidth}`))
    .call(g => g.select(".domain")
                .remove())
    .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke-opacity", 0.5)
        .attr("stroke-dasharray", "2,2"))
    .call(g => g.selectAll(".tick:first-of-type line")
    .attr("stroke",'grey'))
    .call(g => g.selectAll(".tick text")
        .attr("stroke",'grey')
        .attr("x", -10)
        .attr("dy", 2));

    svg.append("text")
    .attr("id", "axisLabel")
    .attr("transform",
        "translate(" + (width / 2.5 + 100) + " ," +
        (height) + ")")
    .style("text-anchor", "middle")
    .style("fill","grey")
    .style("font-weight","bold")
    .text(xAttrib);


    svg.append("text")
    .attr("id", "axisLabel")
    .attr("transform", "rotate(-90)")
    .attr("y", 45 - (margin.left/4)-7)
    .attr("x", 250 - (height))
    .attr("dy", "-1em")
    .style("text-anchor", "middle")
    .style("font-weight","bold")
    .style("fill","grey")
    .text(yAttrib);

    svg.append("text")
    .attr("id", "axisLabel")
    .attr("transform",
        "translate(" + (width / 2.5 + 380) + " ," +
        (height - 70) + ")")
    .style("text-anchor", "middle")
    .style("font-size","72px")
    .style("opacity","0.4")
    .style("fill","grey")
    .style("font-weight","bold")
    .text(present_year);

    var g = svg.append('g')
        .attr('transform', `translate(${width-innerWidth}, ${margin.top-10})`);




  var dot=  g.selectAll('circle').data(overall_data)


          //enter
            dot.enter()
            .append('circle')
                .attr('class','splot')
                .attr('opacity',0)
                .transition().duration(1000)
                .attr('id', d => d.country)
                .attr('cx', d => xScale(d.xdata))
                .attr('cy', d => yScale(d.ydata))
                .attr('r',15)
                .style('fill',  function (d){

                    // region = d3.select('#region-select').value;
                    region = document.getElementById("region-select").value;
                    console.log("here",region);
                    if(region == "East Asia & Pacific")
                      return "blue";
                    if(region == "Europe & Central Asia")
                      return "red";
                    if(region == "Latin America & Caribbean")
                      return "yellow";
                    if(region == "Middle East & North Africa")
                      return "orange";
                    if(region == "North America")
                      return "violet";
                    if(region == "South Asia")
                      return "pink";
                    if(region == "Sub-Saharan Africa")
                      return "green";
                  })
                .style('stroke','black')
                .style('stroke-width',"1px")
                .style("cursor","pointer")
                .attr('opacity',1);

                dot
                 .enter()
                 .append('circle')
                //     .attr('class','splot')
                    .attr('opacity',0)

                    .attr('id', d => d.country)
                    .attr('cx', d => xScale(d.xdata))
                    .attr('cy', d => yScale(d.ydata))
                    .attr('r',15)

                    .style('stroke','black')
                    .style('stroke-width',"1px")
                    .style("cursor","pointer")

                  .on('mouseover', function (d, i) {
                    tooltip.style('class', '.tooltip')

                        .text(function () {
                            return "Country: " + d.country ;
                        })

                        .style('opacity', 1)
                        .style("left", (d3.event.pageX + 5) + "px")
                        .style("top", (d3.event.pageY - 50) + "px")


                })
              .on('mousemove', function (d, i) {
                    d3.select(this)

                        .style('border-width', '50px')
                    // console.log('mousemove on ' + d.properties.name);
                })
                .on('mouseout', function (d, i) {
                    d3.select(this)

                        .style('stroke', 'black')
                        .style('stroke-width', '1px')
                    tooltip.style('opacity', 0)
                });



// dot
//
// .transition()
// .duration(500)
// .delay(500)
// .attr('id', d => d.country)
// .attr('cx', d => xScale(d.xdata))
// .attr('cy', d => yScale(d.ydata))
// .attr('opacity',1)
// .attr('r',15);


var text=g.selectAll("text")
    .data(overall_data);

        text
        .enter()
        .append('text')

        .attr("transform", `translate(${-8},${2} )`)
        .attr('class','kj')
        .attr('opacity',0)
        .transition().duration(1000)
            .attr('x', d => xScale(d.xdata))
            .attr('y', d => yScale(d.ydata))
            .text(function(d){return d.geo})
            .style('fill', 'black')
            .style("font-size",'12px')
            .style("font-weight",'100')
            .style("cursor","pointer")
            .attr('opacity',1);

            text
            .enter()
            .append('text')

            .attr("transform", `translate(${-8},${2} )`)
            .attr('class','kj')
            .attr('opacity',0)

                .attr('x', d => xScale(d.xdata))
                .attr('y', d => yScale(d.ydata))
                .text(function(d){return d.geo})
                .style('fill', 'black')
                .style("font-size",'12px')
                .style("font-weight",'100')
                .style("cursor","pointer")

            .on('mouseover', function (d, i) {
                tooltip.style('class', '.tooltip')
                    .text(function () {
                        return "Country: " + d.country ;
                    })
                    .style('opacity', 1)
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 30) + "px")

            })
            .on('mousemove', function (d, i) {
                // console.log('mousemove on ' + d.properties.name);
            })
            .on('mouseout', function (d, i) {
                tooltip.style('opacity', 0)
            });



    return 0;
}
function updateGraph(){
  console.log("in update");
    var xScale = d3.scaleLinear()
                    .domain([0, d3.max(xaxis_data, function(d){
                        return d.max;
                    })])
                    .range([0, innerWidth]);
    var yScale = d3.scaleLinear()
                    .domain([0, d3.max(yaxis_data,function(d){
                        return d.max
                    })])
                    .range([innerHeight, 0 ]);
    var tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10);



  //  svg.selectAll('g').remove();
    svg.selectAll('#xaxis').remove();
    svg.selectAll('#yaxis').remove();
    svg.selectAll('#axisLabel').remove();


let xaxis = svg.append("g")
    .attr("id","xaxis")
    .attr("transform", `translate(${width-innerWidth},${innerHeight} )`)
    .call(d3.axisBottom(xScale).tickSize(`-${innerHeight}`))
    .call(g => g.select(".domain")
                .remove())
    .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke-opacity", 0.5)
        .attr("stroke-dasharray", "2,2"))
    .call(g => g.selectAll(".tick:first-of-type line")
    .attr("stroke",'grey'))
    .call(g => g.selectAll(".tick text")
        .attr("stroke",'grey')
        .attr("x", 0)
        .attr("dy", 10))

  let yaxis = svg.append("g")
    .attr("id","yaxis")
    .attr("transform", `translate(${width-innerWidth},0 )`)
    .call(d3.axisLeft(yScale).tickSize(`-${innerWidth}`))
    .call(g => g.select(".domain")
                .remove())
    .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke-opacity", 0.5)
        .attr("stroke-dasharray", "2,2"))
    .call(g => g.selectAll(".tick:first-of-type line")
    .attr("stroke",'grey'))
    .call(g => g.selectAll(".tick text")
        .attr("stroke",'grey')
        .attr("x", -10)
        .attr("dy", 2));

    svg.append("text")
    .attr("id", "axisLabel")
    .attr("transform",
        "translate(" + (width / 2.5 + 100) + " ," +
        (height) + ")")
    .style("text-anchor", "middle")
    .style("fill","grey")
    .style("font-weight","bold")
    .text(xAttrib);


    svg.append("text")
    .attr("id", "axisLabel")
    .attr("transform", "rotate(-90)")
    .attr("y", 45 - (margin.left/4)-7)
    .attr("x", 250 - (height))
    .attr("dy", "-1em")
    .style("text-anchor", "middle")
    .style("font-weight","bold")
    .style("fill","grey")
    .text(yAttrib);

    svg.append("text")
    .attr("id", "axisLabel")
    .attr("transform",
        "translate(" + (width / 2.5 + 380) + " ," +
        (height - 70) + ")")
    .style("text-anchor", "middle")
    .style("font-size","72px")
    .style("opacity","0.4")
    .style("fill","grey")
    .style("font-weight","bold")
    .text(present_year);

     var g = svg.append('g')
         .attr('transform', `translate(${width-innerWidth}, ${margin.top-10})`);




  var dot=  svg.selectAll('circle').data(overall_data)//data
  dot.exit().remove();//remove old xaxis_data
  //update old data
  dot.
  attr("opacity",0)
  .transition()
.attr('id', d => d.country)
.duration(1000)
  .attr('cx', d => xScale(d.xdata))
  .attr('cy', d => yScale(d.ydata))
  .attr("opacity",1)
  //enter new dat
  dot.enter()
  .append('circle')
      .attr('class','splot')
      .attr('id', d => d.country)
      .attr('cx', d => xScale(d.xdata))
      .attr('cy', d => yScale(d.ydata))
      .attr('r',15)
      .style('fill',  function (d){

          // region = d3.select('#region-select').value;
          region = document.getElementById("region-select").value;
          console.log("here",region);
          if(region == "East Asia & Pacific")
            return "blue";
          if(region == "Europe & Central Asia")
            return "red";
          if(region == "Latin America & Caribbean")
            return "yellow";
          if(region == "Middle East & North Africa")
            return "orange";
          if(region == "North America")
            return "violet";
          if(region == "South Asia")
            return "pink";
          if(region == "Sub-Saharan Africa")
            return "green";
        })
      .style('stroke','black')
      .style('stroke-width',"1px")
      .style("cursor","pointer")
      .on('mouseover', function (d, i) {
          tooltip.style('class', '.tooltip')
              .text(function () {
                  return "Country: " + d.country ;
              })
              .style('opacity', 1)
              .style("left", (d3.event.pageX + 5) + "px")
              .style("top", (d3.event.pageY - 50) + "px")

      })
      .on('mousemove', function (d, i) {
          d3.select(this)
              .style('border-width', '50px')
          // console.log('mousemove on ' + d.properties.name);
      })
      .on('mouseout', function (d, i) {
          d3.select(this)
              .style('stroke', 'black')
              .style('stroke-width', '1px')
          tooltip.style('opacity', 0)
      });
      dot.attr("opacity",0)
      .transition()
    .attr('id', d => d.country)
    .duration(1000)
      .attr('cx', d => xScale(d.xdata))
      .attr('cy', d => yScale(d.ydata))
      .attr("opacity",1)

dot.exit().remove();
                  console.log(overall_data);


console.log(overall_data);
dot.exit().remove();
//svg.selectAll('circle').data(overall_data).exit().transition().remove();

var text=d3.selectAll(".kj").data(overall_data)
//
text
.enter()
.append('text')
.merge(text)

    .attr('opacity',1)
     .transition()
      .duration(1000)
      .attr('x', d => xScale(d.xdata))
      .attr('y', d => yScale(d.ydata))
     .attr("opacity",1);
   text.exit().remove();

    return 0;
}
function updateGraphinRegion(){
  console.log("in update graph region");
    var xScale = d3.scaleLinear()
                    .domain([0, d3.max(xaxis_data, function(d){
                        return d.max;
                    })])
                    .range([0, innerWidth]);
    var yScale = d3.scaleLinear()
                    .domain([0, d3.max(yaxis_data,function(d){
                        return d.max
                    })])
                    .range([innerHeight, 0 ]);
    var tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10);



  //  svg.selectAll('g').remove();
    svg.selectAll('#xaxis').remove();
    svg.selectAll('#yaxis').remove();
    svg.selectAll('#axisLabel').remove();


let xaxis = svg.append("g")
    .attr("id","xaxis")
    .attr("transform", `translate(${width-innerWidth},${innerHeight} )`)
    .call(d3.axisBottom(xScale).tickSize(`-${innerHeight}`))
    .call(g => g.select(".domain")
                .remove())
    .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke-opacity", 0.5)
        .attr("stroke-dasharray", "2,2"))
    .call(g => g.selectAll(".tick:first-of-type line")
    .attr("stroke",'grey'))
    .call(g => g.selectAll(".tick text")
        .attr("stroke",'grey')
        .attr("x", 0)
        .attr("dy", 10))

  let yaxis = svg.append("g")
    .attr("id","yaxis")
    .attr("transform", `translate(${width-innerWidth},0 )`)
    .call(d3.axisLeft(yScale).tickSize(`-${innerWidth}`))
    .call(g => g.select(".domain")
                .remove())
    .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke-opacity", 0.5)
        .attr("stroke-dasharray", "2,2"))
    .call(g => g.selectAll(".tick:first-of-type line")
    .attr("stroke",'grey'))
    .call(g => g.selectAll(".tick text")
        .attr("stroke",'grey')
        .attr("x", -10)
        .attr("dy", 2));

    svg.append("text")
    .attr("id", "axisLabel")
    .attr("transform",
        "translate(" + (width / 2.5 + 100) + " ," +
        (height) + ")")
    .style("text-anchor", "middle")
    .style("fill","grey")
    .style("font-weight","bold")
    .text(xAttrib);


    svg.append("text")
    .attr("id", "axisLabel")
    .attr("transform", "rotate(-90)")
    .attr("y", 45 - (margin.left/4)-7)
    .attr("x", 250 - (height))
    .attr("dy", "-1em")
    .style("text-anchor", "middle")
    .style("font-weight","bold")
    .style("fill","grey")
    .text(yAttrib);

    svg.append("text")
    .attr("id", "axisLabel")
    .attr("transform",
        "translate(" + (width / 2.5 + 380) + " ," +
        (height - 70) + ")")
    .style("text-anchor", "middle")
    .style("font-size","72px")
    .style("opacity","0.4")
    .style("fill","grey")
    .style("font-weight","bold")
    .text(present_year);

     var g = svg.append('g')
         .attr('transform', `translate(${width-innerWidth}, ${margin.top-10})`);




  var dot=  svg.selectAll('circle').data(overall_data)
  //enter
             dot



                  .transition()

                   .duration(1000)
                   .attr('id', d => d.country)
                   .attr('cx', d => xScale(d.xdata))
                   .attr('cy', d => yScale(d.ydata))
                   .attr('opacity',1)


                  .style("fill", function (d){

                    // region = d3.select('#region-select').value;
                    region = document.getElementById("region-select").value;
                    console.log("here",region);
                    if(region == "East Asia & Pacific")
                      return "blue";
                    if(region == "Europe & Central Asia")
                      return "red";
                    if(region == "Latin America & Caribbean")
                      return "yellow";
                    if(region == "Middle East & North Africa")
                      return "orange";
                    if(region == "North America")
                      return "violet";
                    if(region == "South Asia")
                      return "pink";
                    if(region == "Sub-Saharan Africa")
                      return "green";
                  });


                  console.log(overall_data);


console.log(overall_data);
//dot.exit().remove();
svg.selectAll('circle').data(overall_data).exit().transition().remove();

var text=d3.selectAll(".kj").data(overall_data)
//g.selectAll('text').data(overall_data).attr("opacity",0).transition().delay(500).duration(500).attr("opacity",1);
text



     .transition()

      .duration(1000)
      .attr('x', d => xScale(d.xdata))
      .attr('y', d => yScale(d.ydata))
      .attr('opacity',1)
      ;

   g.selectAll('text').data(overall_data).exit().transition().remove();

    return 0;
}
