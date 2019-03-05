import React from 'react';
import Button from '@material-ui/core/Button';
import { string, func, shape, node } from 'prop-types';
import cx from 'classnames';

import styles from './styles.scss';

const NullState = ({ imgProps, titleText, btnProps, className, children }) => {
  const { src, alt, ...restProps } = imgProps;
  return (
    <div className={cx(styles.nullStateView, className)}>
      {imgProps && <img src={src} alt={alt} {...restProps} />}
      {titleText && <div className={styles.titleText}>{titleText}</div>}
      {children}
      {btnProps && (
        <Button
          className={styles.buttonStyle}
          variant="raised"
          color="primary"
          onClick={btnProps.onClick}
        >
          {btnProps.text}
        </Button>
      )}
    </div>
  );
};

NullState.propTypes = {
  imgProps: shape({
    src: string.isRequired,
    alt: string
  }),
  titleText: string,
  btnProps: shape({
    onClick: func.isRequired,
    text: string.isRequired
  }),
  className: string,
  children: node
};

export default NullState;
