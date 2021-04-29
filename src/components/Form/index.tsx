// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import OdkFormRenderer from 'odkformrenderer';
import 'odkformrenderer/example/index.css';
import queryString from 'query-string';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { ipcRenderer } from '../../services/ipcRenderer';
import './Form.css';
import ErrorBoundary from '../page/ErrorBoundary';
import { Alert } from 'reactstrap';
/** interface for Form URL params */
interface FormURLParams {
  id: string;
}

interface FormState {
  formDefinition: any;
  formChoices: any;
  toastVisible: boolean;
}

class Form extends React.Component<RouteComponentProps<FormURLParams>, FormState> {
  constructor(props: any) {
    super(props);
    this.state = { formDefinition: null, formChoices: null, toastVisible: false };
  }
  public async componentDidMount() {
    const { match } = this.props;
    const formId = match.params.id || '';
    const formDefinitionObj = await ipcRenderer.sendSync('fetch-form-definition', formId);
    console.log(formDefinitionObj);
    const { definition, formChoices } = formDefinitionObj;
    this.setState({ formDefinition: definition, formChoices });
  }
  public render() {
    const handleSubmit = (userInput: any) => {
      // tslint:disable-next-line: no-console
      if (userInput && userInput !== 'Field Violated' && userInput !== 'submitted') {
        console.log(userInput);
        const { match } = this.props;
        const formId = match.params.id || '';
        ipcRenderer.send('submit-form-response', {
          data: JSON.stringify({ ...userInput, 'meta/instanceID': this.generateUid() }),
          formId,
        });
        this.setState({
          toastVisible: true,
        });
        setTimeout(() => {
          this.props.history.push('/menu/');
        }, 2010);
      }
    };
    const { formDefinition, formChoices } = this.state;
    const { dataJson } = queryString.parse(this.props.location.search);
    const props = {
      csvList: formChoices ? JSON.parse(formChoices) : {},
      defaultLanguage: 'English',
      formDefinitionJson: formDefinition ? JSON.parse(formDefinition) : {},
      handleSubmit,
      languageOptions: [
        {
          label: 'English',
          value: 'English',
        },
        {
          label: 'Bangla',
          value: 'Bangla',
        },
      ],
      userInputJson: dataJson && typeof dataJson === 'string' ? JSON.parse(atob(dataJson)) : {},
    };
    // const goBack = () => this.props.history.goBack();
    console.log(JSON.stringify(props.csvList));
    console.log(JSON.stringify(props.formDefinitionJson));
    const getOdkFormRenderer = () => {
      try {
        return (
          <ErrorBoundary>
            <OdkFormRenderer {...props} />
          </ErrorBoundary>
        );
      } catch (e) {
        return null;
      }
    };

    return (
      <div className="form-container">
        {this.state.toastVisible && <Alert color="success">Form Submitted Successfylly!</Alert>}
        {/* <Link to="/menu/">
          <div>
            <h6 className="menu-back">
              <span className="bg-menu-back">
                <FontAwesomeIcon icon={['fas', 'arrow-left']} /> <span> Back </span>
              </span>
            </h6>
          </div>
        </Link> */}
        {formDefinition && getOdkFormRenderer()}
      </div>
    );
  }
  private s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };

  private generateUid = () => {
    return (
      'uuid:' +
      this.s4() +
      this.s4() +
      '-' +
      this.s4() +
      '-' +
      this.s4() +
      '-' +
      this.s4() +
      '-' +
      this.s4() +
      this.s4() +
      this.s4()
    );
  };
}

export default withRouter(Form);
