import React from 'react';
import { arrayOf, func, object, string } from 'prop-types';
import { SearchBar } from '.';

export default class SearchBarContainer extends React.Component {
  static propTypes = {
    color: string,
    searchParameters: arrayOf(object),
    addOrModifySearchParameter: func,
    removeSearchParameter: func,
    enabledEngineCategories: arrayOf(object)
  };

  state = {
    openModal: { modalId: null },
    selectedPill: null
  };

  addPill = modalId => {
    this.setState({
      openModal: { modalId: modalId }
    });
  };

  addJoiningOperator = operator => {
    this.props.addOrModifySearchParameter({
      value: operator || 'AND',
      conditionType: 'join'
    });
  };

  removePill = (searchParameterId, searchParameters) => {
    let index = searchParameters.findIndex(x => x.id === searchParameterId);
    let nextJoiningParameterId =
      searchParameters[index + 1] && searchParameters[index + 1].id;
    this.props.removeSearchParameter(searchParameterId);

    if (nextJoiningParameterId) {
      this.props.removeSearchParameter(nextJoiningParameterId);
    }
  };

  getRemovePill = searchParameters => {
    return searchParameterId => {
      this.removePill(searchParameterId, searchParameters);
    };
  };

  getLastJoiningOperator = (searchParameters) => {
    for(let i = searchParameters.length - 1; i >= 0; i--) {
      if(searchParameters[i].conditionType === 'join') {
        console.log("Last joining operator", searchParameters[i]);
        return searchParameters[i].value;
      }
    }
    return null;
  }

  getApplyFilter = (engineId, searchParameters, searchParameterId) => {
    return parameter => {
      if (parameter) {
        const lastJoiningOperator = this.getLastJoiningOperator(searchParameters);

        this.props.addOrModifySearchParameter({
          value: parameter,
          conditionType: engineId,
          id: searchParameterId
        });

        // if there's no selected pill, we're adding a new search parameter so add a joining operator
        if (!searchParameterId) {
          this.addJoiningOperator(lastJoiningOperator);
        }
      } else {
        // if there is no value in the modal, remove the search parameter and the joining operator after it
        this.removePill(searchParameterId, searchParameters);
      }
      this.setState({
        openModal: { modalId: null },
        selectedPill: null
      });
    };
  };

  openPill = pillState => {
    console.log('Open pill with ', pillState);
    this.setState({
      openModal: {
        modalId: pillState.conditionType,
        modalState: pillState.value
      },
      selectedPill: pillState.id
    });
  };

  cancelModal = () => {
    this.setState({
      openModal: { modalId: null },
      selectedPill: null
    });
  };

  render() {
    const openModal = this.props.enabledEngineCategories.find(
      x => x.id === this.state.openModal.modalId
    );
    const Modal = openModal && openModal.modal ? openModal.modal : null;
    return (
      <div style={{ width: '100%', marginLeft: '1em', marginRight: '1em', overflowY: 'hidden', padding: 0 }}>
        <SearchBar
          color={this.props.color}
          enabledEngineCategories={this.props.enabledEngineCategories}
          searchParameters={this.props.searchParameters}
          addJoiningOperator={this.props.addJoiningOperator}
          addPill={this.addPill}
          removePill={this.getRemovePill(this.props.searchParameters)}
          openPill={this.openPill}
          modifyPill={ this.props.addOrModifySearchParameter }
        />
        {Modal ? (
          <Modal
            open
            modalState={this.state.openModal.modalState}
            cancel={this.cancelModal}
            applyFilter={this.getApplyFilter(
              this.state.openModal.modalId,
              this.props.searchParameters,
              this.state.openModal.selectedPill
            )}
          />
        ) : null}
      </div>
    );
  }
}

SearchBarContainer.defaultProps = {
  searchParameters: [],
  enabledEngineCategories: [],
  addOrModifySearchParameter: state =>
    console.log('Add or modify the search parameter', state),
  removeSearchParameter: id =>
    console.log('Remove the search parameter with the id', id)
};
