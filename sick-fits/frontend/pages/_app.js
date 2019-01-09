import App, { Container } from 'next/app';
import Page from '../components/Page';
import { ApolloProvider } from 'react-apollo';
import withData from '../lib/withData';

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }
    // this exposts the query to the user.
    pageProps.query = ctx.query;
    // anything returned in getInitialProps is exposed via this.props
    return { pageProps };
  }

  render() {
    const { Component, apollo, pageProps } = this.props;
    // this.props.apollo is provided by the `withData()` wrapper.

    return (
      <Container>
        <ApolloProvider client={apollo}>
          <Page>
            <Component {...pageProps} />
          </Page>
        </ApolloProvider>
      </Container>
    )
  }
}

export default withData(MyApp);
