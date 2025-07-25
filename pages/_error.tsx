function Error({ statusCode }: { statusCode: number }) {
  return (
    <p style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>
      {statusCode
        ? `An error ${statusCode} occurred on server`
        : 'An error occurred on client'}
    </p>
  );
}

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;