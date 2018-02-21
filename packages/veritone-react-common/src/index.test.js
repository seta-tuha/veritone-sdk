/* eslint-disable no-undef */
import React from 'react';
import { reduxForm, Field } from 'redux-form';
import { forEach, upperFirst } from 'lodash';
import { mount } from 'enzyme';

import * as components from '.';
const formComponents = components.formComponents;

let oldEnv = process.env.NODE_ENV;
describe('Components', () => {
  beforeEach(() => {
    // supress react proptype warnings
    process.env.NODE_ENV = 'production';
  });

  afterEach(() => {
    process.env.NODE_ENV = oldEnv;
  });

  it('Should be wrapped with the global styles', () => {
    forEach(components, (Component, name) => {
      if (upperFirst(name) === name) {
        // console.log(name);
        // component names are capitalized
        const wrapper = mount(<Component />);

        if (wrapper.children().name() === 'MuiThemeProviderWrapper') {
          // hack: dive to find real component under wrapper. this will
          // break if we add more decorators...
          expect(
            wrapper
              .children()
              .children()
              .children()
              .children()
              .hasClass('veritoneReactCommonGlobals')
          ).toBe(true);
        } else {
          expect(
            wrapper.children().hasClass('veritoneReactCommonGlobals')
          ).toBe(true);
        }
      }
    });
  });

  it('Should be wrapped with the global styles (form components)', () => {
    const BaseForm = reduxForm({
      form: 'story'
    })(props => <Field store={props.store} component={props.component} />);

    forEach(formComponents, (Component, name) => {
      if (upperFirst(name) === name) {
        console.log(name);
        // component names are capitalized
        const wrapper = mount(
          <BaseForm
            component={Component}
            store={{
              getState: () => ({}),
              dispatch: a => a,
              subscribe: a=> a
            }}
          />
        );

        if (wrapper.children().name() === 'MuiThemeProviderWrapper') {
          // hack: dive to find real component under wrapper. this will
          // break if we add more decorators...
          expect(
            wrapper
              .children()
              .children()
              .children()
              .children()
              .hasClass('veritoneReactCommonGlobals')
          ).toBe(true);
        } else {
          expect(
            wrapper.children().hasClass('veritoneReactCommonGlobals')
          ).toBe(true);
        }
      }
    });
  });
});
