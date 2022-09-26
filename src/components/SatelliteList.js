import React, {Component} from 'react';
import { Button, Form, InputNumber, Spin, Avatar, List, Checkbox } from 'antd';

import satellite from "../assets/images/satellite.svg";
// refer to https://ant.design/components/list/#components-list-demo-basic
// refer to https://ant.design/components/list/#components-list-demo-loadmore
// refer to https://ant.design/components/Checkbox
class SatelliteList extends Component {
    state = {
        selected: []
    }
    onChange = e => {
        console.log(e.target);
        // step1: get the active sat info/ status (checked or unchecked)
        // step2: add or remove to/from the current selected sat
        // step3: set state: selected
        const { dataInfo, checked } = e.target;
        const { selected } = this.state;
        const list = this .addOrRemove(dataInfo, checked, selected);
        this.setState({selected: list})
    }    

    addOrRemove = (item, status, list) => {
        //statue => check
        //check is true
        // -item not in the list => add it
        // -item is in the list => do nothing
        //check is flase
        // -item is in the list => remove it
        // -item not in the list => do nothing
        const found = list.some(entry => entry.satid === item.satid);
        if (!found && status) {
            list = [...list, item];
        }
        if (found && !status) {
            list = list.filter(entry => entry.satid !== item.satid);
        }
        console.log('list -> ', list);
        return list;
    }

    onShowSatMap = () => {
        //pass selected sat array to Main
        this.props.onShowMap(this.state.selected)
    }
    
    render() {
        const { isLoad } = this.props;
        const satList = this.props.satInfo ? this.props.satInfo.above : [];

        return (
            <div className='sat-list-box'>
                <div className='btn-container'>
                    <Button className='sat-list-btn' type="primary"
                            disabled={this.state.selected.length === 0}
                            onClick={this.onShowSatMap}>
                        Track
                    </Button>
                </div>
                <hr />
                { isLoad ?
                   <div className='spin-box'>
                       <Spin tip="Loading" size ="large"/>
                   </div>
                   :
                   <List
                        className="sat-list"
                        itemLayout="horizontal"
                        dataSource={satList}
                        renderItem={item => (
                        
                        <List.Item
                            actions={[<Checkbox onChange={this.onChange}
                                                dataInfo={item}/>]}>
                            <List.Item.Meta
                                avatar={<Avatar size={50} src={satellite} />}
                                title={<p>{item.satname}</p>}
                                description={`Launch Date: ${item.launchDate}`}
                            />
                        </List.Item>
                        )}
                    />
                }
                
            </div>

        )
    }
}

export default SatelliteList;