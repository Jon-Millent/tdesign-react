import React from 'react';
import { Table } from 'tdesign-react';

const exampleList = Array(5)
  .fill(1)
  .map((_, i) => ({
    index: i,
    platform: '公有，代表这个数据可以是被公开的',
    property: 'data',
    type: 'any[]',
    default: '[]',
    needed: 'Y',
    description: '数据源',
  }));

export default function TableFixedColumn() {
  return (
    <Table
      bordered
      data={exampleList}
      columns={[
        {
          fixed: 'left',
          align: 'left',
          width: 150,
          minWidth: 150,
          className: 'row',
          colKey: 'type',
          title: '类型',
        },
        {
          fixed: 'left',
          align: 'left',
          width: 150,
          minWidth: 150,
          className: 'test',
          colKey: 'platform',
          title: '平台',
        },
        {
          align: 'left',
          width: 200,
          minWidth: 200,
          className: 'test2',
          colKey: 'property',
          title: '属性',
        },
        {
          align: 'left',
          width: 200,
          minWidth: 200,
          className: 'test4',
          colKey: 'default',
          title: '默认值',
        },
        {
          align: 'left',
          width: 200,
          minWidth: 200,
          className: 'test3',
          colKey: 'needed',
          title: '是否必传',
        },
        {
          align: 'left',
          fixed: 'right',
          width: 200,
          minWidth: 200,
          className: 'row',
          colKey: 'description',
          title: '说明',
        },
      ]}
      rowKey="index"
    />
  );
}
