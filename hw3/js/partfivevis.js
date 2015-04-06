/**
 * Created by Hendrik Strobelt (hendrik.strobelt.com) on 1/28/15.
 */

/*
 *
 * ======================================================
 * We follow the vis template of init - wrangle - update
 * ======================================================
 *
 * */

/**
 * @param _parentElement -- the HTML or SVG element (D3 node) to which to attach the vis
 * @param _data -- the data array
 * @param _metaData -- the meta-data / data description object
 * @constructor
 */
FiveVis = function(_parentElement, _data, _metaData){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.displayData = [];

    // TODO: define all constants here
    this.margin = {top: 20, right: 0, bottom: 30, left: 30},
    this.width = getInnerWidth(this.parentElement) - this.margin.left - this.margin.right,
    this.height = 400 - this.margin.top - this.margin.bottom;

    this.initVis();

}


/**
 * Method that sets up the SVG and the variables
 */
FiveVis.prototype.initVis = function(){

    var that = this; // read about the this

    // TODO: modify this to append an svg element, not modify the current placeholder SVG element
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // creates axis and scales
    this.x = d3.scale.linear()
      .range([0, this.width]);

      // x scale should be ordinal since it's not just numbers; it can be anything.
      // could also be linear??? linear feeding in numbers, or ordinal feeding in categories

    this.y = d3.scale.linear()
      .range([this.height, 0]);

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom");

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left");


      // ALL I NEED TO WORK ON IS THIS..AND SOMETHING ELSE LATER

    this.area = d3.svg.area()
      .interpolate("monotone")
      .x0(0)
      .x1(function(d) { return that.x(d); })
      .y(function(d, i) { return that.y(i); });

    // Add axes visual elements
    // this.svg.append("g")
    //     .attr("class", "notaregularaxis")
    //     .attr("transform", "translate(0," + this.height + ")");

    this.svg.append("g")
        .attr("class", "y axis")
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("THIS IS...FIVEVIS");

    // filter, aggregate, modify data
    this.wrangleData(null);

    // call the update method
    this.updateVis();
}


/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
FiveVis.prototype.wrangleData= function(_filterFunction){

    // displayData should hold the data which is visualized
    this.displayData = this.filterAndAggregate(_filterFunction);

    //// you might be able to pass some options,
    //// if you don't pass options -- set the default options
    //// the default is: var options = {filter: function(){return true;} }
    //var options = _options || {filter: function(){return true;}};

}

/**
 * the drawing function - should use the D3 selection, enter, exit
 */
FiveVis.prototype.updateVis = function(){

    // Dear JS hipster,
    // you might be able to pass some options as parameter _option
    // But it's not needed to solve the task.
    // var options = _options || {};

    // TODO: implement update graphs (D3: update, enter, exit)
    // updates scales

    this.x.domain(d3.extent(this.displayData, function(d) { return d; }));
    this.y.domain(d3.extent(this.displayData, function(d,i) { return i; }));

    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .call(this.yAxis)

    // updates graph
    var path = this.svg.selectAll(".area")
      .data([this.displayData])

    path.enter()
      .append("path")
      .attr("class", "area")
      .style("fill", "steelblue")
      .attr("fill-opacity", "0.5");
      // .attr("fill", "steelblue") works as well

    path.enter() 
        .append("path")
        .attr("class", "fixedArea")
        .style("fill", "red")
        .attr("fill-opacity", "0.5");


    path
      .transition()
      .attr("d", this.area);

    path.exit()
      .remove();


}


/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
FiveVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){
    // let's create a filter here; we're going to load that filter into the wrangle function

    // console.log("woot woot checkpointtt");

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

/*
*
* ==================================
* From here on only HELPER functions
* ==================================
*
* */

/**
 * The aggregate function that creates the counts for each age for a given filter.
 * @param _filter - A filter can be, e.g.,  a function that is only true for data of a given time range
 * @returns {Array|*}
 */
FiveVis.prototype.filterAndAggregate = function(_filter){


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
    var res = d3.range(100).map(function () {
        return 0;
    });

    // console.log("This is THIS");
    // console.log(this.data);
    // console.log("This is FILTER");
    // console.log(filter);

    filteredInfo = this.data.filter(filter);
    // console.log("This is FILTERED INFO");
    // console.log(filteredInfo);
    // accumulate all values that fulfill the filter criterion

    // console.log(res);

    // TODO: implement the function that filters the data and sums the values
    filteredInfo.forEach(function(a) {
        for (var i = a.ages.length - 1; i >= 0; i--) {
            if (isNaN(a.ages[i]) == false){
                res[i] = res[i] + a.ages[i];
            }
        };
    });

    // console.log("this is res");
    // console.log(res);


    return res;

}




