import React, {Component} from 'react';
import { Button, Form, InputNumber } from 'antd';

// refer to https://ant.design/components/form/#components-form-demo-layout-can-wrap
// refer to https://ant.design/components/form/
class SatSetting extends Component {
    showSatellite = (values) => {
        console.log('values -> ', values);
        // pass setting to Main
        this.props.onShow(values);
    }
    render() {
        return (
            <Form
                className='sat-setting'
                name="wrap"
                labelCol={{ flex: '110px' }}
                labelAlign="left"
                labelWrap
                wrapperCol={{ flex: 1 }}
                colon={false}
                onFinish={this.showSatellite}
            >
                <Form.Item 
                    label="Longitude(degress)"
                    name="longitude" 
                    initialValue={70}
                    rules={[
                        { required: true, 
                          message: "Please input your longitude!"
                        }
                    ]}>
                    <InputNumber min={-180} max={180} 
                                 style={{width:"100%"}}
                                 placeholder="Please input your longitude"/>
                </Form.Item>

                <Form.Item
                    label="Latitude(degrees)"
                    name="latitude"
                    initialValue={-40}
                    rules={[
                        {
                            required: true,
                            message: "Please input your Latitude",
                        }
                    ]}
                >
                    <InputNumber min={-90} max={90}
                                 style={{width: "100%"}}
                                 placeholder="Please input latitude"
                    />
                </Form.Item>

                <Form.Item
                    label="Elevation(meters)"
                    name="elevation"
                    initialValue={100}
                    rules={[
                        {
                            required: true,
                            message: "Please input your Elevation",
                        }
                    ]}
                >
                    <InputNumber min={-413} max={8850}
                                 style={{width: "100%"}}
                                 placeholder="Please input elevation"
                    />
                </Form.Item>

                <Form.Item
                    label="Altitude(degrees)"
                    name="altitude"
                    initialValue={90}
                    rules={[
                        {
                            required: true,
                            message: "Please input your Altitude",
                        }
                    ]}
                >
                    <InputNumber min={0} max={90}
                                 style={{width: "100%"}}
                                 placeholder="Please input altitude"
                    />
                </Form.Item>

                <Form.Item
                    label="Duration(secs)"
                    name="duration"
                    rules={[
                        {
                            required: true,
                            message: "Please input your Duration",
                        }
                    ]}
                >
                    <InputNumber min={0} max={90}
                                 style={{width: "100%"}}
                                 placeholder="Please input duration"
                    />
                </Form.Item>

                <Form.Item className="show-nearby">
                    <Button type="primary" htmlType="submit" style={{textAlign: "center"}}>
                        Find Satellite
                    </Button>
                </Form.Item>

            </Form>
        );
    }
}

export default SatSetting;

