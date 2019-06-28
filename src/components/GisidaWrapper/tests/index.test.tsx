import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Actions, ducks } from 'gisida';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import { APP, MAP_ID } from '../../../constants';
import { FeatureCollection } from '../../../helpers/utils';
import store from '../../../store';
import { TaskGeoJSON } from '../../../store/ducks/tasks';
import * as fixtures from '../../../store/ducks/tests/fixtures';
import GisidaWrapper from '../index';

jest.mock('gisida-react', () => {
  const MapComponent = () => <div>I love oov</div>;
  return { Map: MapComponent };
});

jest.mock('../../../configs/env');
jest.useFakeTimers();

reducerRegistry.register(APP, ducks.APP.default);
reducerRegistry.register(MAP_ID, ducks.MAP.default);
const history = createBrowserHistory();
describe('components/GisidaWrapper', () => {
  it('renders component without crashing', () => {
    const props = {
      featureCollection: null,
      geoData: fixtures.jurisdictions[0],
      goal: fixtures.goals,
      handlers: [],
    };
    shallow(
      <Router history={history}>
        <GisidaWrapper {...props} />
      </Router>
    );
  });

  it('renders map component without Featurecollection', () => {
    const props = {
      basemapStyle: 'mapbox://styles/mapbox/satellite-v9',
      geoData: fixtures.jurisdictions[0],
      minHeight: '200px',
    };
    const wrapper = mount(<GisidaWrapper {...props} />);
    expect(store.getState().APP).toMatchSnapshot();
    expect(store.getState()['map-1']).toMatchSnapshot();
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.setProps({ ...props });
    wrapper.setState({ doRenderMap: true });
    jest.runOnlyPendingTimers();
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3000);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('MapComponent').props()).toMatchSnapshot();
    store.dispatch((Actions as any).mapRendered('map-1', true));
    store.dispatch((Actions as any).mapLoaded('map-1', true));
    expect(store.getState().APP).toMatchSnapshot({
      accessToken: expect.any(String),
      apiAccessToken: expect.any(String),
    });
    jest.runOnlyPendingTimers();
    expect(store.getState()['map-1']).toMatchSnapshot();
    const componentWillUnmount = jest.spyOn(wrapper.instance(), 'componentWillUnmount');
    wrapper.unmount();
    expect(componentWillUnmount).toHaveBeenCalled();
  });

  it('renders map component with FeatureCollection', () => {
    const featureCollection: FeatureCollection<TaskGeoJSON> = {
      features: fixtures.bednetTasks.map((task: any) => task.geojson),
      type: 'FeatureCollection',
    };
    const props1 = {
      basemapStyle: 'mapbox://styles/mapbox/satellite-v9',
      currentGoal: null,
      featureCollection,
      geoData: fixtures.jurisdictions[2],
      goal: fixtures.goals,
      handlers: [],
    };
    const props = {
      currentGoal: fixtures.task6.goal_id,
      featureCollection,
      geoData: fixtures.jurisdictions[2],
      goal: fixtures.goals,
      handlers: [],
    };
    const wrapper = mount(<GisidaWrapper {...props1} />);
    /** Investigate why it won't set state inside initmap even though
     * it goes into init map this leads to setting dorenderMap to state
     * manually
     */
    wrapper.setState({ doRenderMap: true });
    wrapper.setProps({ ...props });
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('MapComponent').props()).toMatchSnapshot();
    store.dispatch((Actions as any).mapRendered('map-1', true));
    store.dispatch((Actions as any).mapLoaded('map-1', true));
    expect(store.getState().APP).toMatchSnapshot({
      accessToken: expect.any(String),
      apiAccessToken: expect.any(String),
    });
    jest.runOnlyPendingTimers();
    /** Investigate why it won't set state for hasGeometries to true.
     * Had to copy the entire toggle functionality to test the
     * toggling functionality of this component
     */
    let layer;
    const allLayers = Object.keys(store.getState()['map-1'].layers);
    let eachLayer: string;
    // console.log('all Layers', store.getState()['map-1'].layers);
    for (eachLayer of allLayers) {
      layer = store.getState()['map-1'].layers[eachLayer];
      /** Toggle layers to show on the map */
      if (
        layer.visible &&
        (layer.id.includes(props.currentGoal) || layer.id.includes('main-plan-layer'))
      ) {
        store.dispatch(Actions.toggleLayer(MAP_ID, layer.id, true));
      }
    }
    expect(store.getState()['map-1']).toMatchSnapshot();
    const componentWillUnmount = jest.spyOn(wrapper.instance(), 'componentWillUnmount');
    wrapper.unmount();
    expect(componentWillUnmount).toHaveBeenCalled();
  });

  it('works with DigitalGlobe base layer', () => {
    const featureCollection: FeatureCollection<TaskGeoJSON> = {
      features: fixtures.bednetTasks.map((task: any) => task.geojson),
      type: 'FeatureCollection',
    };
    const props1 = {
      currentGoal: null,
      featureCollection,
      geoData: fixtures.jurisdictions[2],
      goal: fixtures.goals,
      handlers: [],
    };
    const props = {
      currentGoal: fixtures.task6.goal_id,
      featureCollection,
      geoData: fixtures.jurisdictions[2],
      goal: fixtures.goals,
      handlers: [],
    };
    const wrapper = mount(<GisidaWrapper {...props1} />);
    wrapper.setState({ doRenderMap: true });
    wrapper.setProps({ ...props });
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(store.getState().APP).toMatchSnapshot({
      accessToken: expect.any(String),
      apiAccessToken: expect.any(String),
      mapConfig: {
        style: {
          sources: {
            diimagery: {
              tiles: [expect.any(String)],
            },
          },
        },
      },
    });
    const componentWillUnmount = jest.spyOn(wrapper.instance(), 'componentWillUnmount');
    wrapper.unmount();
    expect(componentWillUnmount).toHaveBeenCalled();
  });

  it('renders map component with structures', () => {
    const featureCollection: FeatureCollection<TaskGeoJSON> = {
      features: fixtures.bednetTasks.map((task: any) => task.geojson),
      type: 'FeatureCollection',
    };
    const props1 = {
      currentGoal: null,
      featureCollection,
      geoData: fixtures.jurisdictions[1],
      goal: fixtures.goals,
      handlers: [],
      structures: [fixtures.coloredTasks.task1, fixtures.coloredTasks.task2],
    };
    const props = {
      currentGoal: fixtures.task6.goal_id,
      featureCollection,
      geoData: fixtures.jurisdictions[1],
      goal: fixtures.goals,
      handlers: [],
      structures: [fixtures.coloredTasks.task1, fixtures.coloredTasks.task2],
    };
    const wrapper = mount(<GisidaWrapper {...props1} />);
    /** Investigate why it won't set state inside initmap even though
     * it goes into init map this leads to setting dorenderMap to state
     * manually
     */
    wrapper.setState({ doRenderMap: true });
    wrapper.setProps({ ...props });
    expect(wrapper.find('MapComponent').props()).toMatchSnapshot();
    store.dispatch((Actions as any).mapRendered('map-1', true));
    store.dispatch((Actions as any).mapLoaded('map-1', true));
    expect(store.getState().APP).toMatchSnapshot({
      accessToken: expect.any(String),
      apiAccessToken: expect.any(String),
      mapConfig: {
        style: {
          sources: {
            diimagery: {
              tiles: [expect.any(String)],
            },
          },
        },
      },
    });
    jest.runOnlyPendingTimers();
    /** Investigate why it won't set state for hasGeometries to true.
     * Had to copy the entire toggle functionality to test the
     * toggling functionality of this component
     */
    let layer;
    const allLayers = Object.keys(store.getState()['map-1'].layers);
    let eachLayer: string;
    // console.log('all Layers', store.getState()['map-1'].layers);
    for (eachLayer of allLayers) {
      layer = store.getState()['map-1'].layers[eachLayer];
      /** Toggle layers to show on the map */
      if (
        layer.visible &&
        (layer.id.includes(props.currentGoal) || layer.id.includes('main-plan-layer'))
      ) {
        store.dispatch(Actions.toggleLayer(MAP_ID, layer.id, true));
      }
    }
    expect(store.getState()['map-1']).toMatchSnapshot();
    const componentWillUnmount = jest.spyOn(wrapper.instance(), 'componentWillUnmount');
    wrapper.unmount();
    expect(componentWillUnmount).toHaveBeenCalled();
  });
});
