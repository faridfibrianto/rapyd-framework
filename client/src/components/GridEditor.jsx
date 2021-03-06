import React, { Component } from 'react';
import Field from './Field';
import api from 'api';

export default class extends Component {
  async afterGuiAttached() {
    await api.wait_exist(() => this.refs.loaded);
    if (this.refs.selectivity && this.refs.selectivity.selectivity) this.refs.selectivity.selectivity.open();
  }

  getValue() {
    if (this.refs.selectivity && this.refs.selectivity.selectivity) {
      let value = this.refs.selectivity.selectivity.getData();
      if (!value) return this.props.tree.state.records[this.props.rowIndex][this.props.name];
      const colDef = window.tools.copy(this.props.column.colDef);
      delete colDef.cellEditorFramework;
      let temp_ids = this.refs.selectivity.selectivity.getValue();
      if (!Array.isArray(temp_ids)) temp_ids = [temp_ids];
      const field = window.models.env[this.props.model]._fields[this.props.name];
      const records = field.relation && window.models.env[field.relation];
      for (let temp_id of temp_ids) {
        if (!field.relation) break;
        if (temp_id.slice(0, 5) === 'etemp') {
          records.add(api.globals.temp_records[temp_id]);
        }
        else {
          const record = records.browse();
          record.update({id: temp_id});
          records.add(record);
        }
      }
      if (!Array.isArray(value)) {
        value = value.text;
      }
      else {
        value = value.map((data) => data.text).join(', ');
      }
      this.props.tree.onChange({colDef, data: this.props.tree.state.records[this.props.rowIndex], specialValue: value, oldValue: null, newValue: field.relation ? records : this.refs.selectivity.selectivity.getValue()});
      /*if (this.props.tree.state.selected) {
        for (let row of this.props.tree.state.selected) {
          if (row === this.props.tree.state.records[this.props.rowIndex]) continue;
          this.props.tree.onChange({colDef, data: row, oldValue: null, newValue: field.relation ? records : this.refs.selectivity.selectivity.getValue()});
          row[this.props.name] = value;
        }
        api.wait(100).then(() => this.props.tree.gridOptions.api.deselectAll() || this.props.tree.setState({records: this.props.tree.state.records}));
      }*/
      return value;
    }
  }

  async onSelect() {
    await api.wait(10);
    this.props.api.stopEditing();
  }

  render(props) {
    //const field = props.field_object;
    //delete props.field_object;
    this.refs = {};
    const onSelect = this.onSelect.bind(this);
    const component = (<Field {...props} ref_object={this.refs} cellEdit={true} onSelect={onSelect}/>);
    return component;
  }
}
