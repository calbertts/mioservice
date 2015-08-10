var connections = {
	name: '',
	sections: [
		{
			type: ['JOURNEY', 'WALK'],
			name: 'BUS (A06, E21, etc)',
			places: [
				{
					lat: -76.343434,
					lng: 3.2323232,
					name: 'Name place',
					time: '21:02'
				}
			]
		}
	]
};

var obj = {
	name:"C1-1",
	sections:[
		{
			type:"GIS_ROUTE",
			gisRouteType:"0",
			locations:[
				{x:-76557450,y:3457943,name:"INICIO",typ:"ADDRESS",dep:"21:02",arr:""},
				{x:-76555625,y:3459651,name:"Puente del Rio Aguacatal Urbanizacion Senderos Agu",typ:"STATION",dep:"",arr:"21:10"}
			]
		},
		{
			type:"JOURNEY",
			name:"A06",
			productcode:"3",
			locations:[
				{x:-76555625,y:3459651,name:"Puente del Rio Aguacatal Urbanizacion Senderos Agu",typ:"STATION",dep:"21:10",arr:"21:10"},
				{x:-76553225,y:3460181,name:"Av 15 Oeste Cl 9A 2",typ:"STATION",dep:"21:12",arr:"21:11"},
				{x:-76549584,y:3457988,name:"Av 15 Oeste con Cl 7",typ:"STATION",dep:"21:13",arr:"21:13"},
				{x:-76548191,y:3455318,name:"Av 4 Oeste con  Cl 5",typ:"STATION",dep:"21:15",arr:"21:15"},
				{x:-76549575,y:3453260,name:"Cl 7 Oe con Av 1",typ:"STATION",dep:"21:16",arr:"21:16"},
				{x:-76546698,y:3453089,name:"Cl 5 Oeste entre Kr 1A y 1B Oeste",typ:"STATION",dep:"21:17",arr:"21:17"},
				{x:-76544964,y:3450554,name:"Kr 1 entre Kr 1C y Cl 5 Oeste",typ:"STATION",dep:"21:19",arr:"21:19"},
				{x:-76542402,y:3450833,name:"Kr 2 entre Cl 2 y 3 Oeste",typ:"STATION",dep:"21:20",arr:"21:20"},
				{x:-76539867,y:3450419,name:"Kr 1 entre Cl 2 y 2A",typ:"STATION",dep:"21:21",arr:"21:21"},
				{x:-76537260,y:3448558,name:"Cl 5 entre Kr 5 y 6",typ:"STATION",dep:"21:22",arr:"21:22"},
				{x:-76534599,y:3446473,name:"Kr 10 entre Cl 7 y 8",typ:"STATION",dep:"21:24",arr:"21:24"},
				{x:-76532639,y:3446509,name:"Cl 10 entre Kr 10 y 12",typ:"STATION",dep:"21:25",arr:"21:25"}
			]
		},
		{
			type:"WALK",
			gisRouteType:"0",
			locations:[
				{x:-76532639,y:3446509,name:"Cl 10 entre Kr 10 y 12",typ:"STATION",dep:"21:25",arr:""},
				{x:-76532325,y:3446922,name:"Kr 10 entre Cl 10 y 11",typ:"STATION",dep:"",arr:"21:26"}
			]
		},
		{
			type:"JOURNEY",
			name:"P27D",
			productcode:"3",
			locations:[
				{x:-76532325,y:3446922,name:"Kr 10 entre Cl 10 y 11",typ:"STATION",dep:"21:29",arr:"21:29"},
				{x:-76530338,y:3447489,name:"Kr 10 entre Cl 12 y 13",typ:"STATION",dep:"21:29",arr:"21:29"}
			]
		},
		{
			type:"WALK",
			gisRouteType:"0",
			locations:[
				{x:-76530338,y:3447489,name:"Kr 10 entre Cl 12 y 13",typ:"STATION",dep:"21:29",arr:""},
				{x:-76530158,y:3448558,name:"Centro A1",typ:"STATION",dep:"",arr:"21:30"}
			]
		},
		{
			type:"JOURNEY",
			name:"T50",
			productcode:"3",
			locations:[
				{x:-76530158,y:3448558,name:"Centro A1",typ:"STATION",dep:"21:31",arr:"21:31"},
				{x:-76528954,y:3444001,name:"Fray Damian A1",typ:"STATION",dep:"21:33",arr:"21:33"},
				{x:-76522769,y:3439731,name:"Cien Palos B1",typ:"STATION",dep:"21:37",arr:"21:37"},
				{x:-76518544,y:3437951,name:"Primitivo B1",typ:"STATION",dep:"21:38",arr:"21:38"},
				{x:-76513915,y:3434526,name:"Santa Monica B1",typ:"STATION",dep:"21:40",arr:"21:40"},
				{x:-76510148,y:3432072,name:"Villa Nueva B1",typ:"STATION",dep:"21:42",arr:"21:42"},
				{x:-76505267,y:3426975,name:"Conquistadores B1",typ:"STATION",dep:"21:44",arr:"21:44"},
				{x:-76506103,y:3421294,name:"Punto de Retorno 82",typ:"STATION",dep:"21:47",arr:"21:47"},
				{x:-76494534,y:3424728,name:"Troncal Unida B1",typ:"STATION",dep:"21:52",arr:"21:52"},
				{x:-76490786,y:3421438,name:"Amanecer B1",typ:"STATION",dep:"21:54",arr:"21:54"}
			]
		},
		{
			type:"GIS_ROUTE",
			gisRouteType:"0",
			locations:[
				{x:-76490786,y:3421438,name:"Amanecer B1",typ:"STATION",dep:"21:54",arr:""},
				{x:-76490777,y:3421429,name:"FIN",typ:"ADDRESS",dep:"",arr:"21:57"}
			]
		}
	]
};