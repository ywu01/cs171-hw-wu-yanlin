


PrioVis = function(_parentElement, _data, _metaData){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.displayData = [];

    // TODO: define all constants here
    this.margin = {top: 20, right: 0, bottom: 120, left: 50},
    this.width = getInnerWidth(this.parentElement) - this.margin.left - this.margin.right,
    this.height = 400 - this.margin.top - this.margin.bottom;

    this.titles = d3.range(0, 16).map(function(i) {
      return _metaData.priorities[i]["item-title"];
    });

    this.coloring = d3.range(0, 16).map(function(i) {
      return _metaData.priorities[i]["item-color"];
    });

    this.initVis();

}

/**
 * Method that sets up the SVG and the variables
 */
PrioVis.prototype.initVis = function(){

    var that = this; // read about the this

    // TODO: modify this to append an svg element, not modify the current placeholder SVG element
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // creates axis and scales
    this.y = d3.scale.linear()
      .range([this.height, 0]);

    this.x = d3.scale.ordinal()
      .rangeRoundBands([0, this.width], .1);

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .ticks(6)
      .tickFormat(function(d,i){
        return that.titles[i];
      })
      .orient("bottom");

    // I don't think you need this?
    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left");

	// Add axes visual elements
    this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")")

    this.svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(10,0)")
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("THIS IS...PRIOVIS");

    // filter, aggregate, modify data
    this.wrangleData(null);

    // call the update method
    this.updateVis();
}


/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
PrioVis.prototype.wrangleData= function(_filterFunction){

    // displayData should hold the data which is visualized
    this.displayData = this.filterAndAggregate(_filterFunction);

}

/**
 * the drawing function - should use the D3 selection, enter, exit
 */
PrioVis.prototype.updateVis = function(){

    var that = this;

    // updates scales
    this.y.domain(d3.extent(this.displayData, function(d) { return d; }));
    // this.x.domain(this.displayData.map(function(d, i) {console.log(that.coloring[i]); return i; }));
    this.x.domain(this.displayData.map(function(d, i) { return i; }));

    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", function(d) {
          return "rotate(-30) translate(0, 0)";
        });
        // you'd select text right here and rotate it

    this.svg.select(".y.axis")
        .call(this.yAxis)

    // Data join
    var bar = this.svg.selectAll(".bar")
      .data(this.displayData);

    // Append new bar groups, if required
    var bar_enter = bar.enter().append("g");

    // Append a rect and a text only for the Enter set (new g)
    bar_enter.append("rect");

    // Add attributes (position) to all bars
    bar
      .attr("class", "bar")
      .transition()
      .attr("transform", function(d, i) { return "translate(" + that.x(i) + ",0)"; })



    // Remove the extra bars
    bar.exit()
      .remove();

    // Update all inner rects and texts (both update and enter sets)

    bar.select("rect")
      .attr("x", 0)
      .attr("y", function(d){return that.y(d)})
      .attr("width", this.x.rangeBand())
      .style("fill", function(d,i) {
        // console.log(that.coloring[i]);
        return that.coloring[i];
      })

      .transition()
      // .attr("fill-opacity", "0.5")
      .attr("height", function(d, i) {
          return that.height - that.y(d);
      });

}


/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
PrioVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){
    // let's create a filter here; we're going to load that filter into the wrangle function

    // console.log("woot woot checkpointtt PRIOVIS version");

    // we're gonna need a different filter...or maybe not. Maybe not.
    var filterByDate = function(object) {
        if (object.time > selectionStart && object.time < selectionEnd) {
            return true;
        }
        else {
            return false; 
        }
    }


    // TODO: call wrangle function
    this.wrangleData(filterByDate);
    
    this.updateVis();


}

PrioVis.prototype.filterAndAggregate = function(_filter){


    // Set filter to a function that accepts all items
    // ONLY if the parameter _filter is NOT null use this parameter
    var filter = function(){return true;}
    if (_filter != null){
        filter = _filter;
    }
    //Dear JS hipster, a more hip variant of this construct would be:
    // var filter = _filter || function(){return true;}

    var that = this;

    // create an array of values for age 0-100
    var res = d3.range(16).map(function () {
        return 0;
    });

    filteredInfo.forEach(function(a) {
        for (var i = a.prios.length - 1; i >= 0; i--) {
            if (isNaN(a.prios[i]) == false){
                res[i] = res[i] + a.prios[i];
            }
        };
    });

    // console.log("this is res from priovis yeahhhhh");
    // console.log(res);


    return res;

}




