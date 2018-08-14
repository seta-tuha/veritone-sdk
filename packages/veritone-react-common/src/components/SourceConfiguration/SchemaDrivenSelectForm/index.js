import React from 'react';
import { has, includes, pick, get, isArray, isUndefined } from 'lodash';

import { any, arrayOf, objectOf, func, string, number, bool } from 'prop-types';

import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { DateTimePicker } from '../../formComponents';
import SourceTypeField from '../../SourceTypeField';

import styles from './styles.scss';

export default class DynamicSelect extends React.Component {
  static propTypes = {
    sourceTypes: arrayOf(objectOf(any)).isRequired, //pass in the array of source types and their schemas
    currentSourceType: number, // id of initial sourceType if there is a default
    onSelectChange: func.isRequired,
    onSourceDetailChange: func.isRequired,
    getFieldOptions: func.isRequired,
    fieldValues: objectOf(any),
    errorFields: objectOf(any),
    helperText: string,
    selectLabel: string
  };
  static defaultProps = {
    fieldValues: {}
  };

  state = {
    oneSourceType: false,
    errorFields: this.props.errorFields
  };

  // eslint-disable-next-line react/sort-comp
  UNSAFE_componentWillMount() {
    if (this.props.sourceTypes.length === 1) {
      this.setState({ oneSourceType: true });
    }
  }

  handleSourceTypeChange = event => {
    const sourceTypeIndex = event.target.value;
    this.props.onSelectChange(sourceTypeIndex);
  };

  handleDetailChange = fieldId => event => {
    this.props.onSourceDetailChange({
      [fieldId]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
    });
  };

  renderFields = () => {
    const sourceSchema = get(this.props.sourceTypes[this.props.currentSourceType], 'sourceSchema');
    const definition = get(sourceSchema, 'definition');
    const properties = definition && definition.properties;
    const requiredFields = has(definition, 'required')
      ? definition.required
      : [];

    if (!definition || !properties) {
      return [];
    }

    return Object.keys(properties).map((fieldId) => {
      const enums = (!isUndefined(properties[fieldId].enum) && get(properties[fieldId], 'enumNames.length') === get(properties[fieldId], 'enum.length')) ?
        properties[fieldId].enum.map((value, index) => {
          return {
            id: value,
            name: properties[fieldId].enumNames[index]
          };
        })
      : properties[fieldId].enum;
      return (
        <SourceTypeField
          id={fieldId}
          type={properties[fieldId].type.toLowerCase()}
          required={includes(requiredFields, fieldId)}
          value={this.props.fieldValues[fieldId]}
          onChange={this.handleDetailChange(fieldId)}
          title={properties[fieldId].title || ''}
          isDirty={this.props.errorFields[fieldId]}
          options={enums}
          peerSelection={properties[fieldId].peerEnumKey
            ? (isArray(this.props.fieldValues[properties[fieldId].peerEnumKey]) 
              ? this.props.fieldValues[properties[fieldId].peerEnumKey] :
              []
            )
            : undefined
          }
          query={properties[fieldId].query || get(properties[fieldId], 'items.query' )}
          getFieldOptions={this.props.getFieldOptions}
          key={sourceSchema.id + fieldId}
        />
      );
    });
  };

  render() {
    const { sourceTypes, currentSourceType } = this.props;
    const sourceTypesMenu = sourceTypes.map((type, index) => {
      return (
        <MenuItem value={index} id={type.id} key={type.id}>
          {type.name}
        </MenuItem>
      );
    });

    return (
      <FormControl className={styles.dynamicFormStyle}>
        {this.props.selectLabel &&
          !this.state.oneSourceType && (
            <InputLabel className={styles.inputLabel} htmlFor="select-id">
              {this.props.selectLabel}
            </InputLabel>
          )}
        {!this.state.oneSourceType && (
          <Select
            className={styles.selectField}
            fullWidth
            inputProps={{
              name: sourceTypes[currentSourceType].name,
              id: 'select-id'
            }}
            value={currentSourceType}
            onChange={this.handleSourceTypeChange}
          >
            {sourceTypesMenu}
          </Select>
        )}
        {this.state.oneSourceType && (
          <div className={styles.sourceTypeNameLabel}>Source Type</div>
        )}
        {this.state.oneSourceType && (
          <div className={styles.sourceTypeNameContainer}>
            <div className={styles.sourceTypeName}>
              {sourceTypes[currentSourceType].name}
            </div>
          </div>
        )}
        {this.props.helperText &&
          !this.state.oneSourceType && (
            <FormHelperText>{this.props.helperText}</FormHelperText>
          )}
        {this.renderFields()}
      </FormControl>
    );
  }
}