import React, { Component } from "react";
import { Row, Col } from "antd";
import axios from "axios";

import SatSetting from "./SatSetting";
import SatelliteList from "./SatelliteList";
import WorldMap from "./WorldMap";
import {SAT_API_KEY, STARLINK_CATEGORY, NEARBY_SATELLITE, BASE_URL} from "../constants";

// refer to https://ant.design/components/grid/
class Main extends Component {
    state = {
        setting: {},
        satInfo: {},
        satList: [],
        isLoadingList: false,
    }

    showNearbySatellite = setting => {
        //cb fn -> get setting from the SatSetting
        console.log('setting -> ', setting )//出了function就拿不到数据   
        this.setState({setting:setting});
        // fetch sat list from the server
        this.fetchSatellite(setting);
    }

    // refer to http://n2yo.com/api/#positions
    fetchSatellite = setting => {
        //step1: get sat info from the server
        //     - setting/ req info
        //step2: analyze the response
        //     - case1: successfully -> pass res to SatList
        //     - case2: failed -> inform users
        console.log("fetching")
        const { latitude, longitude, elevation, altitude } = setting;
        const url = `${BASE_URL}/${NEARBY_SATELLITE}/${latitude}/${longitude}/${elevation}/${altitude}/${STARLINK_CATEGORY}/&apiKey=${SAT_API_KEY}`;
        this.setState({isLoadingList: true});

        axios.get(url)
             .then( res => {
                console.log(res);
                if (res.status === 200) {
                    this.setState({
                        satInfo: res.data,
                        isLoadingList: false
                    })
                }
             })
             .catch( err => {
                this.setState({isLoadingList: false});
                console.log('err in fetch Satallite: ', err.message);
             })
    
    }

    showMap = (selected) => {
        console.log('selected array -> ', selected);
        this.setState( preState => {
            return{
                ...preState,
                satList:[...selected] //生成新的array
            }
        })
    }

    render() {
        const { satInfo, isLoadingList, satList, setting } = this.state;
        return (
        <Row className="main">
            <Col span={8} className="left-side">
                <SatSetting onShow={this.showNearbySatellite} />
                <SatelliteList satInfo = {satInfo}
                            isLoad = {isLoadingList} 
                            onShowMap = {this.showMap} />
            </Col>
            <Col span={16} className="right-side">
                <WorldMap satData={satList}
                          observerData={setting} />
            </Col>
        </Row>
        );
    }
}

export default Main;
