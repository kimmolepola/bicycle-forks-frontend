import {
  render, screen, act, fireEvent,
} from '@testing-library/react';
import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import TestRenderer from 'react-test-renderer';

import App from './App';

jest.mock('./components/Map', () => () => <div />); // eslint-disable-line react/display-name
jest.mock('./components/MapMobile', () => () => <div />); // eslint-disable-line react/display-name

const mocks = [];

describe('App', () => {
  // global.innerWidth = 1024;
  // global.dispatchEvent(new Event('resize'));

  let webComponent;
  let mobileComponent;

  beforeEach(async () => {
    await act(async () => {
      global.innerWidth = 1024;
      global.dispatchEvent(new Event('resize'));
      webComponent = await render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <App />
        </MockedProvider>,
      );
      global.innerWidth = 500;
      global.dispatchEvent(new Event('resize'));
      mobileComponent = await render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <App />
        </MockedProvider>,
      );
    });
  });

  it('matches web view snapshot', () => {
    expect(webComponent.container).toMatchSnapshot();
  });
  it('matches mobile view snapshot', () => {
    expect(mobileComponent.container).toMatchSnapshot();
  });

  // Change the viewport to 500px.
  // global.innerWidth = 500;
  // Trigger the window resize event.
  // global.dispatchEvent(new Event('resize'));

  it('has correct text content', () => {
    expect(webComponent.container).toHaveTextContent('Safebike');
    expect(webComponent.container).toHaveTextContent('Admin');
    expect(webComponent.container).toHaveTextContent('Bike parking areas');
    expect(webComponent.container).toHaveTextContent('Map');
    expect(webComponent.container).toHaveTextContent('Point');
  });
});
