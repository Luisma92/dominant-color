import React from 'react';
import { Col, Divider, Row } from 'antd';

const App = () => {
  return (
    <Row style={{ width: '100%' }}>
      <Col span={11}>col-12</Col>
      <Col span={2}>
        <Divider type="vertical" />
      </Col>
      <Col span={11}>col-12</Col>
    </Row>
  );
};

export default App;
