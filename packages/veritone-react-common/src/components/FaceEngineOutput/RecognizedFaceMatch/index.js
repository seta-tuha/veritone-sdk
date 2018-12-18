import React, { Component } from 'react';
import cx from 'classnames';
import { number, func, shape } from 'prop-types';
import { isUndefined } from 'lodash';

import styles from './styles.scss';

class RecognizedFaceMatch extends Component {
  static propTypes = {
    entity: shape({}).isRequired,
    onViewDetailsClick: func,
    confidence: number
  };

  render() {
    const { entity, confidence, onViewDetailsClick } = this.props;
    const confidenceColor =
      Math.round(confidence * 100) >= 90
        ? styles.greenBackground
        : styles.orangeBackground;

    const handleSelectEntity = faceEntityId => e => {
      onViewDetailsClick(faceEntityId);
    };

    return (
      <div className={styles.recognizedMatchBox}>
        <div className={styles.entityImageContainer}>
          <img className={styles.entityImage} src={entity.profileImage} />
          <div className={styles.entityFullName}>{entity.fullName}</div>
        </div>
        <div>
          {!isUndefined(confidence) && (
            <div className={cx(styles.timeSlotConfidence, confidenceColor)}>
              {Math.round(confidence * 100)}% Match
            </div>
          )}
          <div
            className={styles.viewDetailsLink}
            onClick={handleSelectEntity(entity.entityId)}
          >
            View Details
          </div>
        </div>
      </div>
    );
  }
}

export default RecognizedFaceMatch;
