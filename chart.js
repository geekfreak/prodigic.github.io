/**
 * @author geekfreak
 */

 function drawChart(container, params, transforms, data){
 
    var captionText = {
		hours  : "Hourly"
	,	days   : "Daily"
	,	weeks  : "Weekly"
	,   months : "Monthly" 
	}

	// generate the labels based on current day.
	var now = new Date();
	var dd  = now.getDay()+1;
	var mm  = now.getMonth()+1;

	var labels = {};
	
	labels.hours = function(){
		var current_hour = now.getHours();
		  return (new Array(25)).join('.').split(".").map( function(v, i, a){ return (current_hour - i >= 0) ? current_hour - i : 24 + current_hour - i} ).reverse();
	}();

	labels.days   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat","Sun","Mon","Tue","Wed","Thu","Fri","Sat"].splice(dd,8);
	labels.weeks  = ["4wks","3wks","2wks","Last","Current"];
	labels.months = ["Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov"].splice(mm,13);
	
	var id_selector = params.id;
	
    var frame 		= params.frame 		|| 'days';
	var chartType 	= params.chartType 	|| "bar";
	var chartOps    = params.chartOps || {};
	
	var attribs 	= params.attributes;

	var attribNames = attribs.map(getMeasureName)
	var caption 	= (params.caption || attribNames.join(' , ')) + " - " + captionText[frame];
	var palette     = params.palette || [ "maroon","red","purple","fuchsia","green","lime","olive","yellow","navy","blue","teal","aqua","Chocolate","Copper","Cordovan","Desert sand","Ecru","Fallow","Khaki","Liver","Mahogany","Ochre" ];	

	var tableData 	= transforms.toTable(data);
	
	var colCount 	= tableData[0].length-1;
	
	labels.hours 	= labels.hours.splice(-colCount,colCount);
	labels.days 	= labels.days.splice(-colCount,colCount);
	labels.weeks	= labels.weeks.splice(-colCount,colCount);
	labels.months	= labels.months.splice(-colCount,colCount);

    // Render Table from data elements
	
	var tableHTML 	= "<table id='"+id_selector+"' class='"+chartType+"'><caption>"+caption+"</caption>";
	tableHTML += "<thead><tr><td>"+(new Array(tableData[0][0].length)).join("")+"</td><th>" + labels[frame].join("</th><th>") + "</th></tr></thead><tbody>";
	
	tableHTML += tableData.reduce(function(p, c, i, a){
		var tableRowLabels = "<th>" + a[i].shift().join(", ") + "</th>";
		return p + "<tr>"+tableRowLabels+"<td class=cell>" + a[i].join("</td><td class=cell>") + "</td></tr>"
	}, "");
	
	tableHTML += "</tbody></table>";
    var chartDiv$ = $("<div class='chartContainer'>"+tableHTML+"</div>");
	$(container).append(chartDiv$);
	
	transforms.adjustments = {
	
		noCurrent : function(chartContainer$) {
			
			chartContainer$.find('THEAD TR').find('TH:last').remove();
			chartContainer$.find('TBODY TR').find('TD:last').remove();
			
		}
		
	,   cloneTable : function(chartContainer$){
		 	chartContainer$.find('tbody>tr:last').clone(true).addClass('computed').insertAfter('tbody>tr:last');
		}
	
	,	addTotals : function(chartContainer$) {
		
		 	chartContainer$.find('tbody>tr:last').clone(true).addClass('computed').insertAfter('tbody>tr:last');
			chartContainer$.find('tbody>tr:last th').html("Totals");
			
			var cells = [];
			chartContainer$.find('TD').not('computed').each(function(){ cells.push($(this).html()) });

			var items = cells.length;
			var total = cells.reduce(function(p,c,i,a){ return  p + parseInt(c||0); }, 0 ) ;			
			chartContainer$.find('tbody>tr:last td').html(total);
			
		}
	
	,	addAverageRow : function(chartContainer$) {
		
			chartContainer$.find('tbody>tr:last').clone(true).addClass('computed').insertAfter('tbody>tr:last');
			chartContainer$.find('tbody>tr:last th').html("Average");
			
			var cells = [];
			chartContainer$.find('TD').not('computed').each(function(){ cells.push($(this).html()) });

			var items = cells.length;
			var total = cells.reduce(function(p,c,i,a){ return  p + parseInt(c||0); }, 0 ) ;			
			chartContainer$.find('tbody>tr:last td').html(parseInt(total/items));
			
		}

	,	addRowAverage : function(chartContainer$) {
		
			chartContainer$.find('thead>tr').append("<TH>Avg</TH>");

		    chartContainer$.find('tbody>tr').each( function(){

				var cells = [];		
				$(this).find('TD').not('computed').each(function(){ cells.push($(this).html()) });
	
				var items = cells.length;
				var total = cells.reduce(function(p,c,i,a){ return  p + parseInt(c||0); }, 0 ) ;			
				
			    $(this).append("<TD class='computed'>"+parseInt(total/items)+"</TD>");
				
			});
			
		}
		
	,	filterRow: function(items){
		
			var suppress = items || [] ;
			
			return function(chartContainer$){
				chartContainer$.find("TBODY TH:contains('"+suppress+"')").parent('TR').remove();		
			}
		}
		
	,	pivotTable: function(chartContainer$){}

	};
	
	transforms.enabled = [ 
// 	  transforms.adjustments.cloneTable
	 transforms.adjustments.noCurrent 
//	, transforms.adjustments.addRowAverage
//	, transforms.adjustments.addAverageRow 
//	, transforms.adjustments.addTotals
	]
	
	//Process Table Adjustments
		
	$.each(transforms.enabled, function(){
		this.apply(null,[chartDiv$])
	});
	
	// Draw chart.
	
	var std_opts = $.extend({height: 150, width: 600, colors : palette},{lineWeight:2 });	

	switch(chartType) {
	case "lineChart":
		$("#"+id_selector).visualize($.extend({type: 'line'},std_opts));	
		break;
	case "areaChart":
		$("#"+id_selector).visualize({type: 'area'});	
		break;
	case "pieChart":
		$("#"+id_selector).visualize($.extend(std_opts, {type: 'pie', pieLabelPos : "inside", height: 220 }));	
		break;
	default: 
    	$("#"+id_selector).visualize({type: 'bar'});	
	}
	
	$("#"+id_selector).tablesorter({
		
	});
	
	return
	 
 }
