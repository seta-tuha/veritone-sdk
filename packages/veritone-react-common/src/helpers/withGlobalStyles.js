import React from 'react';

export default function withGlobalStyles(Component) {
  return class WrappedWithGlobalStyles extends React.Component {
    render() {
      return (
        <span className="veritoneReactCommonGlobals">
          <Component {...this.props} />
        </span>
      );
    }
  };
}
