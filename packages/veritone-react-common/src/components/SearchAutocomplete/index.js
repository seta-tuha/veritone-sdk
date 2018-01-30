import React from 'react';
import { Avatar, Button, Chip, MenuItem, Paper, TextField } from 'material-ui';
import Downshift from 'downshift';
import { isArray } from 'lodash';
import Rx from 'rxjs/Rx';
import cx from 'classnames';
import { bool, func, string, shape, arrayOf } from 'prop-types';
import styles from './styles.scss';

const autocompletePillLabelClass = cx(styles['autocompletePillLabel']);
const autocompletePillClass = cx(styles['autocompletePill']);
const deleteIconClass = cx(styles['deleteIcon']);

class SearchAutocompleteContainer extends React.Component {
  static propTypes = {
    selectResult: func,
    componentState: shape({
      error: bool,
      queryResults: arrayOf(
        shape({
          header: string,
          items: arrayOf(shape({
            id: string,
            type: string,
            image: string,
            label: string,
            description: string
          }))
        })
      )
    }),
    onChange: func,
    applyFilter: func,
    cancel: func
  };

  state = JSON.parse(JSON.stringify(this.props.componentState));

  debouncedOnChange = event => {
    let text = event.target.value;
    let thisModal = this;
    let debouncer = Rx.Observable.fromEvent(event.target, 'keyup').map(i => i.currentTarget.value);
    let debouncedInput = debouncer.debounceTime(500);
    debouncedInput.subscribe(debouncedText => {
      this.props.onChange(debouncedText)
    });
  };

  onEnter = event => {
    if (event.key === 'Enter') {
      if (isArray(this.props.componentState.queryResults) && this.props.componentState.queryResults.length) {
        this.props.applyFilter();
      }
    }
  };

  render() {
    return (
      <div>
        <div>
          <SearchAutocompleteDownshift
            cancel={ this.props.cancel }
            applyFilter={ this.props.applyFilter }
            debouncedOnChange={ this.debouncedOnChange }
            onKeyPress={ this.onEnter }
            queryString={ this.props.componentState.queryString }
            results={ this.props.componentState.queryResults }
            selectResult={ this.props.selectResult }
          />
        </div>
      </div>
    );
  }
}

const SearchAutocompleteDownshift = ({ cancel, applyFilter, debouncedOnChange, onKeyPress, inputValue, queryString, results, selectResult }) => {
  const itemToString = (item) => item && item.label;
  return (
    <Downshift
      itemToString={ itemToString }
      onSelect={ selectResult }
      render={({
        getInputProps,
        getItemProps,
        selectedItem,
        inputValue,
        highlightedIndex,
        isOpen
      }) => (
        <div>
          <TextField
            {...getInputProps({
              value: queryString,
              placeholder: "Type to search",
              autoFocus: true,
              onChange: debouncedOnChange,
              onKeyPress: onKeyPress
            })}
          />
          { isOpen ? 
            <Paper square>
              {
                results && results.reduce((result, section, sectionIndex) => {
                  result.sections.push(
                    <div key={ 'section_' + sectionIndex }>
                      <div>{ section.header }</div>
                      <div>
                        { section.items.slice(0, 4).map((item, index) => {
                          const indexAcc = result.itemIndex++;
                          return (
                            <MenuItem
                              key={ 'item' + indexAcc }
                              component="div"
                              {...getItemProps({
                                item: item,
                                index: indexAcc,
                                selected: highlightedIndex === indexAcc
                              })}
                            >
                              <Avatar src={ item.image } />
                              <div>{ item.label }</div>
                              <div>{ item.description }</div>
                            </MenuItem>
                          )
                        }) }
                      </div>
                    </div>
                  );
                  return result;
                }, { sections: [], itemIndex: 0 } ).sections
              }
            </Paper>
            : null 
          }
        </div>
      )} 
    />
  );
};

SearchAutocompleteContainer.defaultProps = {
  componentState: {
    error: false,
    queryString: '',
    queryResults: [],
    inputValue: []
  },
  onChange: value => console.log('Autocomplete field changed', value),
  applyFilter: value => console.log('Search by autocomplete result', value),
  cancel: () => console.log('You clicked cancel')
};

export default SearchAutocompleteContainer;