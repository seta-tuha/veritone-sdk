import React from 'react';
import Button from '@material-ui/core/Button';
import { string, func, shape, node, bool } from 'prop-types';

import styles from './styles.scss';

const NullState = ({ imgProps, titleText, btnProps, children, inWidgets }) => {
  const { src, alt, ...restProps } = imgProps;
  const containerClassName = inWidgets ?
    styles.inWidgetView : styles.nullStateView;

  return (
    <div className={containerClassName}>
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
  children: node,
  inWidgets: bool
};

export default NullState;
