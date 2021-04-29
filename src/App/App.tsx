import { library } from '@fortawesome/fontawesome-svg-core';
import { faFileAlt, faFolder, faListAlt, faUser } from '@fortawesome/free-regular-svg-icons';
import {
  faArrowLeft,
  faBars,
  faChevronLeft,
  faLongArrowAltDown,
  faLongArrowAltUp,
  faPenNib,
  faPlus,
  faSort,
  faSync,
  faTools,
} from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import LoadingOverlay from 'react-loading-overlay';
import { Redirect, Route, Switch } from 'react-router';
import { RouteComponentProps, withRouter } from 'react-router';
import BounceLoader from 'react-spinners/BounceLoader';
import { Col, Container, Row } from 'reactstrap';
import AppRegister from '../components/AppRegister';
import Form from '../components/Form';
import List from '../components/List';
import Loading from '../components/Loading';
import Header from '../components/page/Header';
import Menu from '../containers/Menu';
import { ipcRenderer } from '../services/ipcRenderer';
import './App.css';
import { GEOLOC_ENDPOINT } from './constant';
import { appStyles } from './styles';

library.add(
  faUser,
  faFolder,
  faListAlt,
  faFileAlt,
  faArrowLeft,
  faSync,
  faSort,
  faLongArrowAltDown,
  faLongArrowAltUp,
  faPlus,
  faTools,
  faBars,
  faPenNib,
  faChevronLeft,
);

/** Main App component */
const App: React.FC<RouteComponentProps> = (props: RouteComponentProps) => {
  const classes = appStyles();
  const { location } = props;
  // const [loading, setLoading] = React.useState<boolean>(false);
  const [isOverlayPresent, setSyncOverlay] = React.useState<boolean>(false);
  const headerExcludedURLs = ['/', '/signup/'];
  // const [percentage, setPercentage] = React.useState<number>(0);
  const [csv, setCsv] = React.useState<any>({});
  const [lastSync, setLastSync] = React.useState<string>('never');

  const writeCsvToObj = (zip: any, csvFiles: any, i: number, tmpCsv: any) => {
    zip
      .file(csvFiles[i])
      .async('text')
      .then(function success(txt: any) {
        // console.log(txt);
        const arr = txt.split('\n');
        const jsonObj = [];
        const headers = arr[0].split(',');
        for (let n = 1; n < arr.length - 1; n++) {
          const data = arr[n].split(',');
          const obj: any = {};
          for (let j = 0; j < data.length; j++) {
            const key: any = headers[j].trim();
            obj[key] = data[j].trim();
          }
          jsonObj.push(obj);
        }

        tmpCsv[csvFiles[i]] = jsonObj;

        i++;
        if (i < csvFiles.length) {
          return writeCsvToObj(zip, csvFiles, i, tmpCsv);
        } else {
          if (tmpCsv !== {}) {
            setCsv({
              csv: tmpCsv,
            });
            console.log(tmpCsv);
            ipcRenderer.send('write-geo-object', tmpCsv);
          }
        }
        return tmpCsv;
      });
  };

  const fetchGeoLocation = async () => {
    console.log(GEOLOC_ENDPOINT);

    const JSZip = require('jszip');
    const JSZipUtils = require('jszip-utils');

    JSZipUtils.getBinaryContent(GEOLOC_ENDPOINT, (err: any, data: any) => {
      console.log(data, err);
      JSZip.loadAsync(data).then((zip: any) => {
        const csvFiles = Object.keys(zip.files);
        writeCsvToObj(zip, csvFiles, 0, {});
      });
    });
  };

  const autoUpdateCheck = () => {
    ipcRenderer.on('checking_for_update', () => {
      console.log('ipcRenderer on checking_for_update');
      ipcRenderer.removeAllListeners('checking_for_update');
      // message.innerText = 'NO update is available';
      // notification.classList.remove('hidden');
    });

    ipcRenderer.on('update_not_available', () => {
      console.log('ipcRenderer on update_not_available');
      ipcRenderer.removeAllListeners('update_not_available');
      // message.innerText = 'NO update is available';
      // setLoading(false);
      // notification.classList.remove('hidden');
    });

    ipcRenderer.on('update_available', () => {
      console.log('ipcRenderer on update_available');
      ipcRenderer.removeAllListeners('update_available');
    });

    ipcRenderer.on('update-downloading', () => {
      console.log('ipcRenderer on update_downloading');
      ipcRenderer.removeAllListeners('update_downloading');
    });

    ipcRenderer.on('update_downloaded', () => {
      console.log('ipcRenderer on update_downloaded');
      ipcRenderer.removeAllListeners('update_downloaded');
      ipcRenderer.removeAllListeners('download_progress');
      // setLoading(false);
    });

    ipcRenderer.on('download_progress', function (event: any, data: any) {
      console.log('ipcRenderer on download_progress', data, event);
      // setPercentage(data);
    });
  };

  const fetchLastSyncTime = async () => {
    const syncTime: any = await ipcRenderer.sendSync('fetch-last-sync');
    //  setLastSync(syncTime);
    console.log(syncTime.lastSync, syncTime.lastSync != 0);
    const time = syncTime.lastSync != 0 ? new Date(Math.round(syncTime.lastSync)).toLocaleString() : 'never';
    console.log(time);
    setLastSync(time);
  }

  React.useEffect(() => {
    setTimeout(() => {
      fetchLastSyncTime();
      if (navigator.onLine) {
        // fetchGeoLocation();
        autoUpdateCheck();
        setTimeout(() => {
          fetchGeoLocation();
        }, 1000);
      }
    }, 3000)
    console.log('why man why', location, props.history);
  }, []);

  const logout = () => {
    props.history.push('/signup/');
  };

  const gotoMenu = () => {
    props.history.push('/menu/');
  }

  const setSync = (data: boolean) => {
    setSyncOverlay(data);
    fetchLastSyncTime();
  };

  return (
    <React.Fragment>
      <LoadingOverlay className="sync-overlay" active={isOverlayPresent} spinner={<BounceLoader />} text="Syncing">
        {!headerExcludedURLs.includes(location.pathname) && (
          <Header handleLogout={logout} setSyncOverlayHandler={setSync} redirectToMenu={gotoMenu} syncTime={lastSync} pathName={location.pathname}/>
        )}
        <div className={classes.offset} />
        <Container>
          <Row id="main-page-container">
            <Col>
              {/* Production hack. Sets the router to home url on app startup */}
              <span>{window.location.pathname.includes('index.html') && <Redirect to="/" />}</span>
              <Switch>
                <Route exact={true} path="/">
                  <Loading />
                </Route>
                <Route exact={true} path="/signup/">
                  <AppRegister csv={csv} />
                </Route>
                <Route exact={true} path="/menu/">
                  <Menu appLanguage={'English'} setSyncOverlayHandler={setSyncOverlay} />
                </Route>
                <Route exact={true} path="/form/:id">
                  <Form />
                </Route>
                <Route exact={true} path="/list/:id">
                  <List appLanguage={'English'} />
                </Route>
              </Switch>
            </Col>
          </Row>
        </Container>
      </LoadingOverlay>
      {/* {loading ? (
        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          display="inline-flex"
          justifyContent="space-between"
        >
          <Typography
            variant="caption"
            component="div"
            style={{ marginLeft: 10, marginTop: 15 }}
            color="primary"
          >
            Downloading
          </Typography>
          <Box position="relative" display="inline-flex" marginRight={2} marginBottom={2}>
            <CircularProgress variant="determinate" value={percentage} />
            <Box
              top={0}
              left={0}
              bottom={0}
              right={0}
              position="absolute"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography
                variant="caption"
                component="div"
                color="primary"
              >{`${percentage}%`}</Typography>
            </Box>
          </Box>
        </Box>
      ) : null} */}
    </React.Fragment>
  );
};

export default withRouter(App);
