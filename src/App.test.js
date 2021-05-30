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

it('renders without error', async () => {
  let rendered;
  await act(async () => {
    rendered = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <App />
      </MockedProvider>,
    );
  });
  expect(rendered).toMatchSnapshot();
});
