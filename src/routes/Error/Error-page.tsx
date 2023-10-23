import {useRouteError} from "react-router-dom";

type Props = {
  text: string;
};

const ErrorPage: React.FC<Props> = (props) => {
  const {text} = props;
  const error: any = useRouteError();

  return (
    <div id="error-page">
      <h1>{text}</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
};

export default ErrorPage;
