import React, { Component, createRef } from "react";
import axios from "axios";
import { Spin } from "antd";
import { feature } from "topojson-client";
import { geoKavrayskiy7 } from "d3-geo-projection";//map shape
import { geoGraticule, geoPath } from "d3-geo"; //get longitude and latitude gird
import { select as d3Select } from "d3-selection";// choose where to draw map region
import { schemeCategory10 } from "d3-scale-chromatic";
import * as d3Scale from "d3-scale";
import { timeFormat as d3TimeFormat } from "d3-time-format";
import { WORLD_MAP_URL, SATELLITE_POSITION_URL, SAT_API_KEY } from "../constants";


//alternative way refer to https://www.react-simple-maps.io/examples/world-choropleth-mapchart/
//refer to http://n2yo.com/api/#positions
//d3-time-format https://github.com/d3/d3-time-format -> 时间戳
//d3-scale https://github.com/d3/d3-scale -> 卫星id数字与颜色对应
//d3-scale-chromatic https://github.com/d3/d3-scale-chromatic -> 卫星打点颜色

const width = 960;
const height = 600;

class WorldMap extends Component {
    constructor() {
        super();
        this.refMap = createRef();// {current: null}
        this.refTrack = createRef();
        console.log('refMap -> ', this.refMap)
        this.map = null;
        this.color = d3Scale.scaleOrdinal(schemeCategory10);
        this.state = {
            isLoading: false,
            isDrawing: false
        }
    }

    //fetch data in didmount phase
    componentDidMount() {
        //fetch map data
        //generate a map
        axios.get(WORLD_MAP_URL)
             .then( res => {
                //console.log(res.data)//type "Topojson"
                const { data } = res;
                //refer to https://github.com/topojson/topojson-client/blob/master/README.md#feature
                const land = feature(data, data.objects.countries).features;
                //console.log(land)
                this.generateMap(land);
            })
             .catch( err => {
                console.log(`err in fetching world map data: `, err)
             })
    }

    generateMap = land => {
        //console.log(this.refMap)
        //refer to https://github.com/d3/d3-geo#projections
        //refer to https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
        
        //define projection => real map data <-> dom
        const projection = geoKavrayskiy7().scale(170)//map shape and size
                                           .translate([width / 2, height / 2])//center
                                           .precision(.1);//精确度

        //define graticule
        const graticule = geoGraticule();//经纬度

        //define canvas on the DOM where to draw the map
        const canvas_map = d3Select(this.refMap.current).attr("width", width)
                                                        .attr("height", height);//画图区域

        //define canvas on the DOM where to track selected satellites
        const canvas_track = d3Select(this.refTrack.current).attr("width", width)
                                                          .attr("height", height);//画图区域

        const context = canvas_map.node().getContext("2d");
        const context_track = canvas_track.node().getContext("2d");

        const path = geoPath().projection(projection)
                              .context(context) //画笔
        
        land.forEach(ele => {
            context.fillStyle = "#B3DDEF";
            context.strokeStyle = "#000";
            context.globalAlpha = 0.7;
            context.beginPath();
            path(ele);
            context.fill();
            context.stroke();

            context.strokeStyle = "rgba(220, 220, 220, 0.1)";
            context.beginPath();
            path(graticule());
            context.lineWidth = 0.1;
            context.stroke();

            context.beginPath();
            context.lineWidth = 0.5;
            path(graticule.outline());
            context.stroke();

        })                      
            
        this.map = {
            projection: projection,
            context: context,
            context_track: context_track
        }
         

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //console.log('prep props -> ', prevProps)
        //console.log('prep state -> ', prevState)
        //console.log('current props -> ', this.props)
        //console.log('current state -> ', this.state)
        if(prevProps.satData !== this.props.satData) {
            const {
                latitude,
                longitude,
                elevation,
                altitude,
                duration
              } = this.props.observerData;

            const endTime = duration * 60;

            this.setState({ isLoading: true });

            //refer to http://n2yo.com/api/#positions
            const urls = this.props.satData.map(sat => {
                const { satid } = sat;
                const url = `/api/${SATELLITE_POSITION_URL}/${satid}/${latitude}/${longitude}/${elevation}/${endTime}/&apiKey=${SAT_API_KEY}`
                return axios.get(url);
            })
              
            // refer to http://github.com/axios/axios 输入是array,保证concurrency
            Promise.all(urls)
                .then( results => {
                    this.setState({ isLoading: false, isDrawing : true});
                    console.log('results -> ', results);
                    const arr = results.map( res => res.data );
                    if(!prevState.isDrawing) {
                        this.track(arr);
                    } else {
                        const oHint = document.getElementsByClassName("hint")[0];
                        oHint.innerHTML = "Please wait for these satellite animation to finish before select new ones!";
                        
                    }     
                   
                })
                .catch( err => {
                    console.log('err in fetching sat positions: ', err)
                })
        }        

    }

    track = data => {
        if(!data[0].hasOwnProperty("positions")) {
            throw new Error("no position data");
            return;
        }
        const len = data[0].positions.length;
        const {context_track} = this.map;

        let now = new Date();
        let i = 0;

        let timer = setInterval( () => {
            let ct = new Date();
            let timePassed = i === 0 ? 0 : ct - now;
            const time = new Date(now.getTime() + 60*timePassed);

            context_track.clearRect(0, 0, width, height);

            context_track.font = "bold 14px sans-serif";
            context_track.fillStyle = "#333";
            context_track.textAlign = "center";
            context_track.fillText(d3TimeFormat(time), width / 2, 10);

            if(i >= len) {
                clearInterval(timer);
                this.setState({ isDrawing: false });
                const oHint = document.getElementsByClassName("hint")[0];
                oHint.innerHTML = "";
                return;
            }

            //refer to http://n2yo.com/api/#positions
            data.forEach( sat => {
                const { info, positions } = sat;
                this.drawSat(info, positions[i]);
            })

            i += 60;
        }, 1000)
    }

    drawSat = (sat, pos) => {
        const { satlatitude, satlongitude } = pos;
        if (!satlatitude || !satlongitude) return;

        const { satname } = sat;
        const nameWithNumber = satname.match(/\d+/g).join("");

        //real position <=> canvas <- project
        const { projection, context_track } = this.map;
        const xy = projection([satlongitude, satlatitude]);
        //console.log('xy -> ', xy);

        context_track.fillStyle = this.color(nameWithNumber);
        context_track.beginPath();
        context_track.arc(xy[0], xy[1], 4, 0, 2 * Math.PI);//画圆
        context_track.fill();

        context_track.font = "bold 11px sans-serif";
        context_track.textAlign = "center";
        context_track.fillText(nameWithNumber, xy[0], xy[1] + 14);//文字间隔
  

    }

    render() {
        const { isLoading } = this.state;
        return (
            <div className="map-box">
                {isLoading ? (
                    <div className="spinner">
                        <Spin tip="Loading..." size="large" />
                    </div>
                ) : null}

                <canvas className="map" ref={this.refMap} />
                <canvas className="track" ref={this.refTrack} />
                {/* <div ref={refInstance => { console.log('haha')}} ></div> */}
                <div className="hint"/>
            </div>
        );
    }
}

export default WorldMap;